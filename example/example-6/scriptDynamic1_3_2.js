!function(){
	function someFunction(){
		console.log("Dynamic-1_3_2 pushed me!");
	}
	taskq.push(someFunction);
	console.log("Dynamic-1_3_2 Script loaded");
}()