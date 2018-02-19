!function(){
	function someFunction(){
		console.log("Dynamic-2 pushed me!");
	}
	taskq.push(someFunction);
	console.log("Dynamic-2 Script loaded");
}()