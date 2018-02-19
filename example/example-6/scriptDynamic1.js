!function(){
	function someFunction(){
		console.log("Dynamic-1 pushed me!");
	}
	taskq.push(someFunction);
	console.log("Dynamic-1 Script loaded");
}()