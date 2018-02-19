!function(){
	function conditional(status){
		if (status) {
			console.log("I will execute!");
		} else {
			console.log("I will NOT execute!");
		}
	}
	taskq.push(conditional);
	console.log("Dynamic-1_1 Script loaded");
}()