!function(){
	function script0(){
		console.log("script0 executed");
		taskq.load("./scriptDynamic0.js")
		.then(function(){
			console.log("dynamic script 0 'then' executed");
		});
	}
	script0._taskqId = "script0";
	taskq.push(script0);
	console.log("scrip0 iief executed");
}()