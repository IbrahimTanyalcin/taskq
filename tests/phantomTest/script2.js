!function(){
	function script2(){
		console.log("script2 executed");
		window.result += "script2 executed\n";
		taskq.load("./scriptDynamic2.js")
		.then(function(){
			console.log("dynamic script 2 'then' executed");
			window.result += "dynamic script 2 'then' executed\n";
		})
		.then(function(){
			window.result = window.result === "script0 executed\nDynamic-0 Script loaded\nExporting retValue\ndynamic script 0 'then' executed\nscript1 executed\nDynamic-1 Script loaded\ndynamic script 1 'then' executed\nsetTimeout executed\nfinally resolving\ncatch will be executed, rest of the thens will be skipped.\nThis is the catch function attached!\nDynamic-1_1 Script loaded\nI will NOT execute!\ndynamic script 1_1 said: I will NOT execute!\ndynamic script 1_1 'then' executed\nscript2 executed\nDynamic-2 Script loaded\ndynamic script 2 'then' executed\n";
		});
	}
	script2._taskqId = "script2";
	script2._taskqWaitFor = ["script1"];
	taskq.push(script2);
	console.log("scrip2 iief executed");
}()