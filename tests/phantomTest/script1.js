!function(){
	function script1(retValue){
		console.log("script1 executed");
		window.result += "script1 executed\n";
		taskq.load("./scriptDynamic1.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("setTimeout executed");
				window.result += "setTimeout executed\n";
				taskq.load("./scriptDynamic1_1.js")
				.then(function(res){
					res.init;
					setTimeout(function(){
						console.log("dynamic script 1_1 said: " + retValue.value);
						window.result += "dynamic script 1_1 said: " + retValue.value + "\n";
						console.log("dynamic script 1_1 'then' executed");
						window.result += "dynamic script 1_1 'then' executed\n";
						res(true);
					},5000)
				});
				console.log("finally resolving");
				window.result += "finally resolving\n";
				res(true);
			},10000);
			console.log("dynamic script 1 'then' executed");
			window.result += "dynamic script 1 'then' executed\n";
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				res(false);
				taskq.export(false,"status");
				console.log("catch will be executed, rest of the thens will be skipped.");
				window.result += "catch will be executed, rest of the thens will be skipped.\n";
			},5000);
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				console.log("dynamic script 1 'then-2' executed");
				window.result += "dynamic script 1 'then-2' executed\n";
				res(true);
			},5000)
		})
		.then(function(){
			console.log("dynamic script 1 'then-3' executed");
			window.result += "dynamic script 1 'then-3' executed\n";
		})
		.catch(function(){
			console.log("This is the catch function attached!");
			window.result += "This is the catch function attached!\n";
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()