!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				console.log("finally resolving");
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("'then-2' finally resolving");
				res(true);
			},5000);
			console.log("dynamic script 1 'then-2' executed");
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()