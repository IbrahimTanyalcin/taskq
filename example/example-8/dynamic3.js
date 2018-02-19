!function(){
	function someOtherTest(someEntity){
		console.log("consoling 'someEntity'");
		console.log(someEntity);
		taskq.load("./dynamic4.js").then(function(){console.log("Dynamic4-Then!!")});
	}
	taskq.push(someOtherTest);
	console.log("Dynamic3-loaded!!");
}()