!function(){
	var someObject = {x:3,y:2};
	function test0(){
		console.log("As test0.js, I will export some object as 'someEntity'");
		taskq.export(someObject,"someEntity");
	}
	test0._taskqId = 0;
	taskq.push(test0);
}()