!function(){
	function someFunction(){
		console.log("Dynamic script 1_3 pushed me!");
		taskq.load("./scriptDynamic1_3_2.js")
		.then(function(){
			console.log("dynamic script 1_3_2 'then' executed");
		});
	}
	taskq.push(someFunction);
	console.log("Dynamic-1_3 Script loaded");
}()