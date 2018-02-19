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
	}
	test1._taskqId = 1;
	test1._taskqWaitFor = [0];
	test1._taskqScope = "refToThis";
	taskq.export(somePrivateObject,"refToThis");
	taskq.push(test1);
}()