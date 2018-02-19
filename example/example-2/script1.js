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