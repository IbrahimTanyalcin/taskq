!function(){
	function script1(){
		console.log("script1 executed");
		taskq.load("./scriptDynamic1.js")
		.then(function(){
			console.log("dynamic script 1 'then' executed");
		})
		.then(function(){
			taskq.load("./scriptDynamic1_2.js")
			.then(function(){
				console.log("dynamic script 1_2 'then' executed");
			});
		})
		.then(function(){
			console.log("dynamic script 1_2 final 'then' executed");
		});
		
		taskq.load("./scriptDynamic1_3.js")
		.then(function(){
			console.log("dynamic script 1_3 'then' executed");
		})
		.then(function(){
			taskq.load("./scriptDynamic1_4.js")
			.then(function(){
				console.log("dynamic script 1_4 'then' executed");
			});
		})
		.then(function(){
			console.log("script 1 final then clause");
		});
	}
	script1._taskqId = "script1";
	script1._taskqWaitFor = ["script0"];
	taskq.push(script1);
	console.log("scrip1 iief executed");
}()