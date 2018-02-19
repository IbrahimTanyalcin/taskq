!function(){
	window.result = "";
	function script0(){
		console.log("script0 executed");
		window.result += "script0 executed\n";
		taskq.load("./scriptDynamic0.js")
		.then(function(){
			console.log("dynamic script 0 'then' executed");
			window.result += "dynamic script 0 'then' executed\n";
		});
	}
	script0._taskqId = "script0";
	taskq.push(script0);
	console.log("scrip0 iief executed");
}()