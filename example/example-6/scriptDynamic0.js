!function(){
	function someFunction(){
		console.log("Dynamic-0 pushed me!");
	}
	taskq.push(someFunction);
	console.log("Dynamic-0 Script loaded");
}()