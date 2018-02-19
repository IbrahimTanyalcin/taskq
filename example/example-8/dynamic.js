!function(){
	function someTest(){
		console.log("Dynamic.js pushed me!!");
		taskq.load("./dynamic3.js").then(function(){console.log("Dynamic3-Then!!")});
	}
	console.log("Pushing 'someTest' function!!");
	taskq.push(someTest);
	console.log("Pushed 'someTest' function!!");
}()