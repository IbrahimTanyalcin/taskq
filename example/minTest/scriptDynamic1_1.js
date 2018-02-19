!function(){
	function conditional(status,retValue){
		if (status) {
			console.log("I will execute!");
		} else {
			console.log("I will NOT execute!");
			taskq.pause;
			setTimeout(function(){
				retValue.value = "I will NOT execute!";
				taskq.resume;
			},10000);
		}
	}
	taskq.push(conditional);
	console.log("Dynamic-1_1 Script loaded");
}()