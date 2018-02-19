!function(){
	function someFunction(Dynamic0,Dynamic1_3_2){
		console.log("Dynamic-2 pushed me!");
		console.log("reading exported objects:");
		console.log(Dynamic0);
		console.log(Dynamic1_3_2);
	}
	taskq.push(someFunction);
	console.log("Dynamic-2 Script loaded");
}()