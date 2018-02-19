!function(){
	function conditional(status,retValue){
		if (status) {
			console.log("I will execute!");
			window.result += "I will execute!\n";
		} else {
			console.log("I will NOT execute!");
			window.result += "I will NOT execute!\n";
			taskq.pause;
			setTimeout(function(){
				retValue.value = "I will NOT execute!";
				taskq.resume;
			},10000);
		}
	}
	taskq.push(conditional);
	console.log("Dynamic-1_1 Script loaded");
	window.result += "Dynamic-1_1 Script loaded\n";
}()