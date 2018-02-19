!function(){
	function someOtherOtherTest(){
		taskq.load("./dynamic5.js").then(function(){console.log("Dynamic5-Then!!")});
	}
	taskq.push(someOtherOtherTest);
	console.log("Dynamic4-loaded!!");
}()