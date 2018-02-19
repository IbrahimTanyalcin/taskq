!function(){
	function someFunction(){
		console.log("Dynamic-0 pushed me!");
		console.log("exporting 'Dynamic0'");
		taskq.export({response:"Dynamic0"},"Dynamic0");
	}
	taskq.push(someFunction);
	console.log("Dynamic-0 Script loaded");
}()