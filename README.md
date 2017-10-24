# taskq

<a href="https://www.patreon.com/ibrahimTanyalcin" title="Patreon donate"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate" /></a>
<hr>

Async modules with ES5

<hr>

## What it does

I was playing around with the idea of writing a module pattern for ES5, well not like a full-blown module definition but
a mini script to execute async scripts with clojures. So this will allow you to add async script tags and execute them with order 
while not leaking references to the global scope. This is by no means a replacement for es6 module pattern/AMD/CommonJS and is experimental.

## Usage

Take a look at this minimal html, which also is included in the repository:

```
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<style>
		</style>
	</head>
	<script type="text/javascript" src="../taskq.js" charset="UTF-8"></script>
	<script type="text/javascript" src="./test2.js" charset="UTF-8" async></script>
	<script type="text/javascript" src="./test0.js" charset="UTF-8" async></script>
	<script type="text/javascript" src="./test1.js" charset="UTF-8" async></script>
	</head>
	<body>
		<div class="row"></div>
	</body>
</html>
```

Only the taskq.js is synchronious, the others have their order shuffled with async attribute. The taskq.js script
exposes the default taskq object, which has 2 main methods: *push* and *export*
A "global-name" attribute can be added to the main script which will then change the exposed variable name from 'taskq' to 'hmm' for example:

```
<script type="text/javascript" src="../taskq.js" global-name="hmm" charset="UTF-8"></script>
/*'hmm' refers to the taskq object*/
```

Within each script you have the outermost clojure:

```
!function(){ //outermost clojure
	/*...some stuff...*/
	function toBeExported(){
		/*...some stuff...*/
	}
	/*...some stuff...*/
}()
```

To execute a function with some order, give it a _taskqId tag, a _taskqWaitFor array that lists the ids of other functions to be executed first, and 
lastly some variable name in DOMString that will be used as 'this' (so, "refToThis" below should be exported by another function beforehand like taskq.export(obj,"refToThis")).
None of these property names are mandatory:

```
!function(){
	/*...some stuff...*/
	function toBeExported(){
		/*...some stuff...*/
	}
	toBeExported._taskqId = "someId";
	toBeExported._taskqWaitFor = ["someOtherId",..];
	toBeExported._taskqScope = "refToThis";
	taskq.push(toBeExported);
}()
```

You can also export an object/primitive and make it available to another function:

```
!function(){
	/*...some stuff...*/
	var someObject = {...};
	function toBeExported(){
		/*...some stuff...*/
		taskq.export(someObject,"refToSomeObject");//export someObject as 'refToSomeObject'
		taskq.export(5,"a_primitive");
	}
	toBeExported._taskqId = "someId";
	toBeExported._taskqWaitFor = ["someOtherId",..];
	toBeExported._taskqScope = "refToThis";
	taskq.push(toBeExported);
}()
```

Then, in another function that executes after the above, the exported variable will be available as 'refToSomeObject':

```
!function(){
	/*...some stuff...*/
	function currentFunction (refToSomeObject,a_primitive){
		/*...some stuff with refToSomeObject...*/
		/*...some stuff with a_primitive...*/
	}
	currentFunction._taskqId = "loadend";
	taskq.push(currentFunction);
}()
```

As shown above, there are special keywords for Id names which automatically is executed last or first:

```
["start","init","begin","loadstart","loadStart"]// _taskqId that matches one of these will be executed first
["end","defer","finish","loadend","loadEnd"]// _taskqId that matches one of these will be executed last
```

If more than one pushed function has the same "loadstart"/"loadend" etc keyword, then they are executed in the order they are pushed with respect to each other.

Eventually all pushed functions are executed at the 'load' event (by the internal *perform* method) and the internal references to the pushed and exported objects are flushed (by the internal *flush* method).

If you want me to extend the capability to dynamically important scripts after the 'load' event, let me know.

Check out the [minimal example](./example) and also [THIS]() medium post. Also you can support me at my [PATREON](https://www.patreon.com/ibrahimTanyalcin) page.
