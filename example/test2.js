!function(){
	function test(testItem){
		console.log("I'll wait for all and then execute the function that is passed to me!");
		testItem(5);
	}
	test._taskqId = "loadend";
	test._taskqWaitFor = [0,1];//not necessery if 'loadend' is present above
	taskq.push(test);
}()