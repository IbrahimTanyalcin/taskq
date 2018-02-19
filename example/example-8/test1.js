!function(){
	var somePrivateObject = new (function(){this.y = 99;})
	function innerFunc(){
		console.log("innerFunc!!");
	}
	function test1 (someEntity) {
		console.log("As test1, I will first execute a function from inner scope,\
		then log what is exported as 'someEntity',\
		then log 'this',\
		and finally export myself as 'testItem'");
		innerFunc();
		console.log(someEntity);
		console.log(this);
		taskq.export(test1,"testItem");
		console.log("Load dynamic.js encountered!!");
		taskq.load("./dynamic.js").then(function(){console.log("Dynamic-Then!!")})
		.then(function(){console.log("Dynamic-Then-2!!")})
		.then(function(){
			taskq.load("./dynamicX.js").then(function(){console.log("DynamicX-Then!!")});
		});
		console.log("Load dynamic2.js encountered!!");
		taskq.load("./dynamic2.js").then(function(){console.log("Dynamic2-Then!!")});
	}
	test1._taskqId = 1;
	test1._taskqWaitFor = [0];
	test1._taskqScope = "refToThis";
	taskq.export(somePrivateObject,"refToThis");
	taskq.push(test1);
}()