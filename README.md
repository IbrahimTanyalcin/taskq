# taskq

[![Build Status](https://travis-ci.org/IbrahimTanyalcin/taskq.svg?branch=master)](https://travis-ci.org/IbrahimTanyalcin/taskq)
<a href="https://www.patreon.com/ibrahimTanyalcin" title="Patreon donate"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate" /></a>
<a href="https://www.codacy.com/app/IbrahimTanyalcin/taskq?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=IbrahimTanyalcin/taskq&amp;utm_campaign=Badge_Grade" title="Codacy"><img src="https://api.codacy.com/project/badge/Grade/06f045df886848f09519df15388c8bf6" alt="Codacy Badge" /></a>
<a href="https://www.npmjs.com/package/@ibowankenobi/taskq" title="Npm"><img src="https://badge.fury.io/js/%40ibowankenobi%2Ftaskq.svg" alt="Npm Badge" /></a>
<a href="https://zenodo.org/badge/latestdoi/108156384"><img src="https://zenodo.org/badge/108156384.svg" alt="DOI"></a>

<hr>

# Async Modules Supporting ES5 & ES6 with Control Flow

## ⇩ First, your 1 min cheatsheet ⇩
![cheatsheet](./cheatsheet.png)

<img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Detail_der_Rechenmaschine_von_Johann_Helfrich_M%C3%BCller.jpg" width="100%"></img>

# Navigation

If you want you can jump straight into the [**examples**](#examples-).

- ## [Advantages](#advantages-) 
- ## [API](#api-)
- ## [Reading](#reading-)
- ## [What does it do?](#what-does-it-do-)
- ## [Usage](#usage-)
- ## [Changelog](#changelog-)
- ## [Examples](#examples-)

## Advantages [⏎](#advantages)

- <span style="font-size:200%;">0</span> dependencies
- No polyfill required
- No transpiling required.
- No config file etc.
- About 6kB when minimized
- Will work on ie9+.
- Will play nice with other technologies/patterns you use in your page
- Non-render blocking
- You can pause/resume the main thread
- Aware of document state (hidden, minimized etc.)
- Fine grained control on execution of all imported scripts.
- Uses Promises combined with requestAnimationFrame(rAF). Falls back to rAF on older browsers (ie etc).
- Supports nested/single dynamic imports. Your main thread will wait until a module finishes dynamically importing other modules.
- Supports *then* , *catch* phrases for dynamic imports. 
- You can do things that you cannot do with ES6 directly:
	```
	taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		/*Next then will not execute until the above is resolved*/
		.then(function(res){
			console.log("dynamic script 1 'then-2' executed");
		});
		/*Meanwhile the entire downstream thread will wait for these tasks to finish*/
	```
- Uses async script tags
- Does not dictate anything about your app structure. Whether you want use separate async script tags, or bundle them.
- No modifying required to your existing scripts other than wrapping them around iief (immediately invoked function expression) and *pushing* them to the taskq object.

## API [⏎](#api)

There are some terms used throught out the documentation:

### Terms

- **iief**: immediately invoked function expression
- **main thread** : this refers to the list of functions pushed to the taskq object before calling *taskq.perform* method. This is called automatically on 'onload' event. Dynamically loaded scripts have their separete queue (immediateTasks) that is handled implicitly.
- **dynamic import/dynamic load** : this is to refer whenever you call *taskq.load* method to start loading scripts somehere within main thread (or outside later if you want). Everything you load is async but their execution can be controlled by you.
- **taskq**: this is the main taskq global object. Although you can change its name using the script attribute, its default is assumed here.
- **module pattern**: Although taskq only requires you to push the functions to be executed, to avoid leaking to global, a general module pattern is as follows:

```
/*outer iief*/
!function(){
	function someFunctionYouWantToExecute (someArguments) {
		/*some stuff like taskq.export, taskq.load*/
	}
	taskq.push(someFunctionYouWantToExecute);
}()
```

### Methods

> taskq.version()

Returns the version string.

> taskq.push(function)

Pushes the function to the main thread or the immediate thread (for dynamic imports) implicitly and return taskq it self, so you can do:

```
//Define functions
function f1(){...};
f1._taskqId = "f1";
function f2(){...};
f2._taskqId = "f2";
f2._taskqWaitFor = ["f1"];
function f3(){...};
f3._taskqId = "f3";
f3._taskqWaitFor = ["f2"];
//Push to queue
taskq.push(f1).push(f2).push(f3);

```
Pushed functions do not execute automatically, you will have to call *taskq.perform()* to start shifting and executing it. In your main HTML, perform is automatically called for you on 'onload' event.

If you push a variable that is not a function, it will be skipped and you will get a console message: "not a function ref".

> taskq.export(variable,aliasString)

Exports any type of variable with the given alias. These exported variables are available to the pushed functions. Suppose a *previouslyPushedFunction* in the main thread called *taskq.export({value:4},"someObject")*:

```
/*outer iief*/
!function(){
	function someFunctionYouWantToExecute (someObject) {
		/*someObject is available here*/
	}
	someFunctionYouWantToExecute.taskqWaitFor = ["previouslyPushedFunction"];
	taskq.push(someFunctionYouWantToExecute);
}()
```

Arguments order does not matter. 

Exported variables live until *taskq.perform* finishes executing all the functions in the main thread. If there are no more pointers somewhere else in your code, they can be garbage collected. Later you can repopulate the exports by calling *taskq.export* again. Next time you call perform, it will again clear and so on.

> taskq.load("./someScript.js")

Will pause the main thread, and start loading the given script. Its iief will be immediately executed and pushed functions will be added to the immediate queue to be executed. Returns a *thennable* object which you can attach then or catch clauses. 

Other dynamic loads and the main thread will wait for this load to complete its iief, pushed functions and then/catch clauses.

> thennable.then(function(resolver){...})

Attaches the thennable a function to be executed, and return the thennable itself. Attached thens are executed in order. Functions within thens are passed an optional resolver argument. If you do not call *resolver.init;* , the next then clause will execute as soon as this then clause is executed. If you call *resolver.init;* , somewhere else within the current then clause you should call *resolver(true)* or *resolver(false)* to proceed to the next then. 

When using resolver, the entire main thread and the rest of the then clauses will wait for it to resolve.

> thennable.catch(function(){...})

Attaches a catch clause to the thennable shall any of the thens resolve with a *falsey* value. Attaching multiple catch clauses overrides the previous one.

> resolver.init

Tells the current then clause to block rest of the thens and the main thread and wait until it is resolved.

> resolver(variable)

Converts the variable to "boolean" and resolves with that value. Returns always true unless you try to resolve more than once within the same then clause. You can only resolve once, resolving more than once does not have any effect -> only the first resolve value is recorded.

> resolve.value

Gives the boolean value the resolver resolved with. Cannot be set.

> taskq.pause;

Pauses the entire taskq main thread, thens etc. If any functions were called at the time pause was called such as pushed functions or setTimeout, they are executed and the rest is halted. When paused, taskq is still running but does not proceed.

> taskq.paused;

Returns true of false whether taskq is paused or not. Cannot be set manually.

> taskq.resume;

Resumes the taskq.

> taskq.running;

Returns true or false based on taskq running state. It will return false once the *taskq.perform()* method finished the main thread. If you start another main thread, it return true until perform completes again.

> taskq.perform()

Starts performing the pushed functions in the main thread. This is automatically called for you on the 'onload' event.

Later if you start another main thread by pushing functions to taskq, you should manually call this method in the end. 

Perform will automatically clear all the exports once it is complete.

> taskq.flush("main"|"script")

This is automatically called by the *taskq.perform* method in the end. You normally should not call this method manually. If you pass "main" as argument, then all the pushed functions to the main thread and the exported variables will be cleared. If you pass "script", only the immediate tasks (pushed functions within dynamic imports) are cleared.

> taskq.minPause = Number

You can use this *setter* to set the minimum time in milliseconds between the execution of pushed functions in the main thread. You can also configure this by adding an "data-min-pause" attribute to the script tag of taskq.


## Reading [⏎](#reading)

I advise you to take a look at below Medium posts:
- [**Queued Async (pseudo-) modules with ES5**](https://medium.com/@ibowankenobi/queued-async-pseudo-modules-with-es5-812f99fed209)
- [**Pausing/resuming browser & app logic using Taskq.js**](https://medium.com/@ibowankenobi/pausing-resuming-browser-app-logic-using-taskq-js-884ec5a8ce86)
- [**Get that google PSI score higher**](https://medium.com/@ibowankenobi/get-that-google-psi-score-higher-28a7c992966e)

## What does it do? [⏎](#what-does-it-do)

This project has evolved to the degree that is now a full blown module system that can be used instead of ES6 import/export or other module proposals. Perhaps it can be better illustrated in answer I have written in Hashnode:

> ### [Modules in JavaScript confusion](https://hashnode.com/post/modules-in-javascript-confusion-cjfc32m6f000a0as2os9nhf75)

~~I was playing around with the idea of writing a module pattern for ES5, well not like a full-blown module definition but
a mini script to execute async scripts with clojures. So this will allow you to add async script tags and execute them with order 
while not leaking references to the global scope. This is by no means a replacement for es6 module pattern/AMD/CommonJS and is experimental.~~

## Usage [⏎](#usage)

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
If you want to control the speed of which the function executions take place, then use the "data-min-pause" attribute:

```
<script type="text/javascript" src="../taskq.js" data-min-pause="2000" charset="UTF-8"></script>
/*'hmm' refers to the taskq object*/
```
Above snippet will execute pushed functions to taskq with an interval of 2000ms. You can change the minimum pause value during runtime as well:

```
taskq.minPause = 1000; //1000ms pause between executions
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

Check out the **[MINIMAL EXAMPLE](#example---2)** and also **[THIS](https://medium.com/@ibowankenobi/queued-async-pseudo-modules-with-es5-812f99fed209)** medium post. Also you can support me at my **[PATREON](https://www.patreon.com/ibrahimTanyalcin)** page.

## Changelog [⏎](#changelog)

#### v 2.2.0
- Updated the sorting function to behave stable in Chrome. Now you also get the amount it has taken in milliseconds to sort the tasks.


## Examples [⏎](#examples)

In each of the example, take a look at the html, and then open the inspector to look at the console messages to reveal execution pattern of functions. 

You can open the html file of each example and inspect the console messages. All examples share a similar document head:

```
<script type="text/javascript" src="../../taskq.js" charset="UTF-8"></script>
<script type="text/javascript" src="./script2.js" charset="UTF-8" async></script>
<script type="text/javascript" src="./script0.js" charset="UTF-8" async></script>
<script type="text/javascript" src="./script1.js" charset="UTF-8" async></script>
```
The expected execution order of the scripts are:

> **script 0 --> script 1 --> script 2**

The execution order is controlled by attaching *_taskqId* (any javascript variable type) and *_taskqWaitFor* (array of '*taskqId*'s) properties to the *pushed* functions inside iiefs.

Note that **the first 3 lines of console messages** in the below examples can vary as the iiefs can execute in any order due to the *async* attribute of the script tags.

Although you should carefully examine all the scripts in each example, some important script for each example is highlighted, which is usually **'script1'**. 

### Example - 1

This example has been explained in detail [**HERE**](https://medium.com/@ibowankenobi/queued-async-pseudo-modules-with-es5-812f99fed209).

### Example - 2

> Summary: The main thread will wait for completion of any dynamically imported (loaded) scripts and their then clauses, and will resume afterwards.

> script 1:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic.js")
		.then(function(){
			console.log("dynamic script 'then' executed");
		})
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip0 iief executed
scrip2 iief executed
scrip1 iief executed
script0 executed
script1 executed
Dynamic Script loaded
dynamic script 'then' executed
script2 executed
```
> explanation:

As expected iiefs execute first. And then based on the *_taskqWaitFor* properties, script 0 --> script 1 --> script 2 is executed. But since script 1 dynamically imports another script, the main thread will wait for the dynamic import (and then handlers) and then resume for script 2.

### Example - 3

> Summary: Everytime a function is pushed to the main thread, the main thread will wait for all dynamic loads within this function.

> script 0 (similarly scripts 1 and 2):

```
!function(){
	function script0(){
		console.log("script0 executed");
		taskq.load("./scriptDynamic0.js")
		.then(function(){
			console.log("dynamic script 0 'then' executed");
		});
	}
	script0._taskqId = "script0";
	taskq.push(script0);
	console.log("scrip0 iief executed");
}()
```

> console:

```
scrip2 iief executed
scrip0 iief executed
scrip1 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation

Here all the main scripts import a single dynamic module. And each time, the main thread will pause/resume once the dynamic import and its then handlers are executed. 

### Example - 4

> Summary: The main thread will also wait for nested dynamic loads within a pushed function.

> script 1:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(){
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(){
			taskq.load("./scriptDynamic1_2.js")
			.then(function(){
				console.log("dynamic script 1_2 'then' executed");
			});
		})
		.then(function(){
			console.log("script 1 final then clause");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip2 iief executed
scrip0 iief executed
scrip1 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
script 1 final then clause
Dynamic-1_2 Script loaded
dynamic script 1_2 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

In this example, all scripts (0,1 and 2) dynamically import their own scripts. The main thread (script 0 --> script 1 --> script2) will wait for each script's dynamic imports to finish.

When you are dynamically importing a script:

- that script's iief is first executed
- then any functions it pushed to taskq is executed (these are pushed to a different 'immediate' queue rather than the main threads queue)
- then all the 'then' handlers are executed in order
- If during execution any other dynamic import is detected, it is added to the script queue to be executed AFTER all the thens (or the catch if any) for this dynamic import is executed.

So in case of the script 1, the 'scriptDynamic1' is loaded, then all the thens are executed. The second then dynamically imports another script 1_2, so this is added to the queue. That is why you see "script 1 final then clause" first. This might give you the impression that the second then did not execute, but actually it does and adds the scriptDynamic1_2 to the queue.

After all the thens are executed, "scriptDynamic1_2.js" gets loaded and its then handlers execute. After all these layers are done within script1, main thread continues with script 2.

### Example - 5

> Summary: Within a dynamically loaded module/script, first the iief is executed, then its pushed function is executed, then all the then clauses are executed in order.

> script 1:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(){
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(){
			taskq.load("./scriptDynamic1_2.js")
			.then(function(){
				console.log("dynamic script 1_2 'then' executed");
			});
		})
		.then(function(){
			console.log("dynamic script 1_2 final 'then' executed");
		});
		
		taskq.load("./scriptDynamic1_3.js")
		.then(function(){
			console.log("dynamic script 1_3 'then' executed");
		})
		.then(function(){
			taskq.load("./scriptDynamic1_4.js")
			.then(function(){
				console.log("dynamic script 1_4 'then' executed");
			});
		})
		.then(function(){
			console.log("script 1 final then clause");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip0 iief executed
scrip1 iief executed
scrip2 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
dynamic script 1_2 final 'then' executed
Dynamic-1_3 Script loaded
Dynamic script 1_3 pushed me!
dynamic script 1_3 'then' executed
script 1 final then clause
Dynamic-1_2 Script loaded
dynamic script 1_2 'then' executed
Dynamic-1_3_2 Script loaded
dynamic script 1_3_2 'then' executed
Dynamic-1_4 Script loaded
dynamic script 1_4 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

Within script 1, there are 2 layers. An outer layer that loads 'scriptDynamic1.js' and 'scriptDynamic1_3.js', and an inner layer that loads other scripts.

So within the flow of script 1:

- First 'scriptDynamic1.js' is seen. The thens are recorded. 
- Next 'scriptDynamic1_3.js' is seen and added to the queue to be executed later.
- The thens of 'scriptDynamic1.js' is executed, amongst these, the second then clause loads 'scriptDynamic1_2.js'. This is added to the queue.
- Once the thens of 'scriptDynamic1.js' are all executed. The script queue is shifted and 'scriptDynamic1_3.js' is loaded. 
- First the pushed functions within 'scriptDynamic1_3.js' are all executed. After that, then thens are executed in order. Within these thens, the second then loads another 'scriptDynamic1_4.js'. This is added to the script queue to be loaded after 'scriptDynamic1_2.js.
- After all the thens of 'scriptDynamic1_3.js' are executed, 'scriptDynamic1_2.js' starts loading and its then clauses are executed.
- Last, 'scriptDynamic1_4.js' gets loaded and its then clauses are executed.
- The main thread resumes from script 2.

### Example - 6

> Summary: Dynamicall loaded scripts/modules and main initial script tags share the same pattern: a function wrapped inside iief where it is ultimately pushed to the taskq by the iief. However, dynamically loaded modules do not push the functions to the main thread, but to a separate 'immediate' thread. This is done implicitly.

> scriptDynamic1.js:

```
!function(){
	function someFunction(){
		console.log("Dynamic-1 pushed me!");
	}
	taskq.push(someFunction);
	console.log("Dynamic-1 Script loaded");
}()
```

> console:

```
scrip2 iief executed
scrip0 iief executed
scrip1 iief executed
script0 executed
Dynamic-0 Script loaded
Dynamic-0 pushed me!
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
Dynamic-1 pushed me!
dynamic script 1 'then' executed
dynamic script 1_2 final 'then' executed
Dynamic-1_3 Script loaded
Dynamic script 1_3 pushed me!
dynamic script 1_3 'then' executed
script 1 final then clause
Dynamic-1_2 Script loaded
dynamic script 1_2 'then' executed
Dynamic-1_3_2 Script loaded
Dynamic-1_3_2 pushed me!
dynamic script 1_3_2 'then' executed
Dynamic-1_4 Script loaded
dynamic script 1_4 'then' executed
script2 executed
Dynamic-2 Script loaded
Dynamic-2 pushed me!
dynamic script 2 'then' executed
```

> explanation:

The difference between this example and [example 5](#example---5) is dynamically imported functions also push another function to the queue. 

When dynamically loading scripts, note that the pushed functions execute before the then clauses as shown in the console messages.

Dynamically loaded scripts do not push functions into the queue of the main thread but instead have a private 'immediate queue'. You might as well then ask why pushing is enabled inside dynamically loaded function wheras everthing could have been kept inside the iief. There are 2 reasons:

- You can interchange scripts in the main thread with dynamic modules and vice versa without modifying your scripts.

- While you are loading, you cannot control the iief, but since the pushed function has access to the exported variables, you can decide to execute or not execute this function based on some exported variables.

### Example - 7

> Summary: Any pushed function in the main thread or dynamically loaded script can export a variable. These variables are accessible to all the functions. The life cycle of these exported variables are till the end of the main thread, where they are ultimately flushed automatically.

> scriptDynamic2.js: 

```
!function(){
	function someFunction(Dynamic0,Dynamic1_3_2){
		console.log("Dynamic-2 pushed me!");
		console.log("reading exported objects:");
		console.log(Dynamic0);
		console.log(Dynamic1_3_2);
	}
	taskq.push(someFunction);
	console.log("Dynamic-2 Script loaded");
}()
```

> console:

```
scrip0 iief executed
scrip1 iief executed
scrip2 iief executed
script0 executed
Dynamic-0 Script loaded
Dynamic-0 pushed me!
exporting 'Dynamic0'
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
Dynamic-1 pushed me!
dynamic script 1 'then' executed
dynamic script 1_2 final 'then' executed
Dynamic-1_3 Script loaded
Dynamic script 1_3 pushed me!
dynamic script 1_3 'then' executed
script 1 final then clause
Dynamic-1_2 Script loaded
dynamic script 1_2 'then' executed
Dynamic-1_3_2 Script loaded
Dynamic-1_3_2 pushed me!
exporting 'Dynamic1_3_2'
dynamic script 1_3_2 'then' executed
Dynamic-1_4 Script loaded
dynamic script 1_4 'then' executed
script2 executed
Dynamic-2 Script loaded
Dynamic-2 pushed me!
reading exported objects:
Object
Object
dynamic script 2 'then' executed
```

> explanation:

Identical to example 6, with the addition of 'scriptDynamic0.js' and 'scriptDynamic1_3_2.js' exporting 2 objects. These objects are later available to other scripts in the main thread or dynamically loaded scripts. 

In this case, script 2 dynamically loads another script that reads these variables from the exported objects and logs them.

### Example - 8

This is identical to [example 1](#example---1) with the addition of dynamically loaded scripts. It demonstrates how nested loads (dynamically loaded script loading another one) are handled.

### Example - 9

> Summary: The then clauses gets passed a resolver argument. Thens are executed immediately unless you call *res.init*. You can later resolve it within the then clause by *res(true|false)*. You cannot resolve it twice, to check the value, use *res.value*. Resolving with falsey value will result in the next then clauses to be skipped and execution of a catch clause, if any. 

> script1.js:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("'then-2' finally resolving");
				res(true);
			},5000);
			console.log("dynamic script 1 'then-2' executed");
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip2 iief executed
scrip1 iief executed
scrip0 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
setTimeout executed
finally resolving
dynamic script 1 'then-2' executed
'then-2' finally resolving
dynamic script 1 'then-3' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

You might not have realized but every function passed to a *then* caluse gets passed with a *resolver* argument. This argument is essentially a function that will convert any value passed to it to "boolean" and resolve with that boolean value.

To enable resolver within a then clause you first have to:
```
res.init
```
Now everthing inside that then clause will execute but the next then clause will not start until somehere within the the current then clause you do this:
```
res(true)
```
You could have also resolved with a *falsey* value. In that case, the rest of the thens for this dynamic load will be skipped and if any *catch* clauses have been previously attached, the latest attached *catch* clause will be executed before the next dynamic import is popped from the script queue or the main thread continues.

In this particular case first then clause within 'script1.js' is executed. The next then will wait until this is resolved within the setTimeout in about 10 seconds. Then next then clause will also resolve in another 5 seconds. After that, the third then clause executes and the main thread continues to script2.

### Example - 10

> Summary: Then clauses will wait for each others *res* to resolve before they execute. This is also true for dynamically loaded scripts and their then clauses. The main thread will wait for all of these nested clauses to complete and resolve before continuing.

> script1.js:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				taskq.load("./scriptDynamic1_1.js")
				.then(function(res){
					res.init;
					setTimeout(function(){
						console.log("dynamic script 1_1 'then' executed");
						res(true);
					},5000)
				});
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("dynamic script 1 'then-2' executed");
				res(true);
			},5000)
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip2 iief executed
scrip0 iief executed
scrip1 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
setTimeout executed
finally resolving
dynamic script 1 'then-2' executed
dynamic script 1 'then-3' executed
Dynamic-1_1 Script loaded
dynamic script 1_1 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

This is similar to [example 9](#example---9). The difference is that the first then clause dynamically imports another script 'scriptDynamic1_1.js' within the setTimeout before it resolves.

The 3 first layer then clauses are executed in order, within the first then clause the loading of 'scriptDynamic1_1.js' is added to the script queue. Once the first layer 3 then clauses are executed, 'scriptDynamic1_1.js' executes. The (second layer) then clause of 'scriptDynamic1_1.js' resolves in about 5 seconds. After that, the main thread continues with script2.

### Example - 11

> Summary: When a then clause resolves with a *falsey* value, its remaining then clauses are skipped and the **latest attached** catch clause is executed. 

> script1.js:

```
!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				taskq.load("./scriptDynamic1_1.js")
				.then(function(res){
					res.init;
					setTimeout(function(){
						console.log("dynamic script 1_1 'then' executed");
						res(true);
					},5000)
				});
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				res(false);
				taskq.export(false,"status");
				console.log("catch will be executed, rest of the thens will be skipped.");
			},5000);
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("dynamic script 1 'then-2' executed");
				res(true);
			},5000)
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
		})
		.catch(function(){
			console.log("This is the catch function attached!");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> console:

```
scrip0 iief executed
scrip1 iief executed
scrip2 iief executed
script0 executed
Dynamic-0 Script loaded
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
setTimeout executed
finally resolving
catch will be executed, rest of the thens will be skipped.
This is the catch function attached!
Dynamic-1_1 Script loaded
I will NOT execute!
dynamic script 1_1 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

This is almost identical to [example 10](#example---10) with the addition of second then clause resolving with a *falsey* value. The same then clause also exports a boolean variable called 'status'.

 Due resolving with false at second then clause, the rest of the then clauses do not execute. If any catch handler attached, it executes which in this case logged: "This is the catch function attached!".

 After thens are all executes, the script queue is shifted and "./scriptDynamic1_1.js" is loaded. Due to the exported boolean variable, the execution of the pushed function can react: in this case it logged: "I will NOT execute!".

 After the then clause of "./scriptDynamic1_1.js" is executed, the main thread continues from script2.

 ### Example - 12

> Summary: Then clauses can only be resolved with a boolean value. To share return values or other variables between then clauses or other functions, use the *taskq.export* method. Exporting a variable with the same alias overwrites it.

 > scriptDynamic0.js:

```
!function(){
	console.log("Dynamic-0 Script loaded");
	console.log("Exporting retValue");
	taskq.export({value:undefined},"retValue");
}()
```

> script1.js

```
!function(){
	function script1(retValue){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				taskq.load("./scriptDynamic1_1.js")
				.then(function(res){
					res.init;
					setTimeout(function(){
						console.log("dynamic script 1_1 said: " + retValue.value);
						console.log("dynamic script 1_1 'then' executed");
						res(true);
					},5000)
				});
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				res(false);
				taskq.export(false,"status");
				console.log("catch will be executed, rest of the thens will be skipped.");
			},5000);
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("dynamic script 1 'then-2' executed");
				res(true);
			},5000)
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
		})
		.catch(function(){
			console.log("This is the catch function attached!");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()
```

> scriptDynamic1_1.js:

```
!function(){
	function conditional(status,retValue){
		if (status) {
			console.log("I will execute!");
		} else {
			console.log("I will NOT execute!");
			taskq.pause;
			setTimeout(function(){
				retValue.value = "I will NOT execute!";
				taskq.resume;
			},10000);
		}
	}
	taskq.push(conditional);
	console.log("Dynamic-1_1 Script loaded");
}()
```

> console:

```
scrip2 iief executed
scrip0 iief executed
scrip1 iief executed
script0 executed
Dynamic-0 Script loaded
Exporting retValue
dynamic script 0 'then' executed
script1 executed
Dynamic-1 Script loaded
dynamic script 1 'then' executed
setTimeout executed
finally resolving
catch will be executed, rest of the thens will be skipped.
This is the catch function attached!
Dynamic-1_1 Script loaded
I will NOT execute!
dynamic script 1_1 said: I will NOT execute!
dynamic script 1_1 'then' executed
script2 executed
Dynamic-2 Script loaded
dynamic script 2 'then' executed
```

> explanation:

This is very similar to [example 11](#example---11) with an addition of passing then clause parameters about the previous pushed function.

In example 11, you might wonder is there any way for the then clause of "./scriptDynamic1_1.js" to react to what has been returned or done within the pushed function (open "./scriptDynamic1_1.js" and look for the function named "conditional", this was the pushed function).

This is possible using the *exports* and exporting a variable that is passed by reference (which is a javascript object).

In this particular case, "scriptDynamic0.js" exports a retValue variable which is:

```
{value:undefined}
```

Now other function within the main thread or dynamically loaded modules can access this object on demand and make changes to it.

Once "./scriptDynamic1_1.js" loads, it executes its pushed function (*conditional*), this function first pauses the entire main thread + execution of other thens/loads:

```
taskq.pause
```

 And within a setTimeout, it changes the value of "retValue" and finally resumes:

 ```
 retValue.value = "I will NOT execute!";
taskq.resume;
 ```

After resuming, the then clause start executing. Since retValue is changed, now we can react to what has been executed previously, the then clause logs:

```
dynamic script 1_1 said: I will NOT execute!
```

You can devise many other patterns using various combinations of *res* , *task.pause* and *taskq.resume*. 

At any time during execution, whether at onload event or manual pushing functions after the load event of the browser, you can always query whether taskq is active by:

```
taskq.running
```

If you have any questions contact me at:

ibowankenobi@ibrahimtanyalcin.com