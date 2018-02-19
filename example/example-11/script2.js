!function(){
	function script2(){
		console.log("script2 executed");
		taskq.load("./scriptDynamic2.js")
		.then(function(){
			console.log("dynamic script 2 'then' executed");
		});
	}
	script2._taskqId = "script2";
	script2._taskqWaitFor = ["script1"];
	taskq.push(script2);
	console.log("scrip2 iief executed");
}()