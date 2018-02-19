!function(){
	function someFunction(){
		console.log("Dynamic-1_3_2 pushed me!");
		console.log("exporting 'Dynamic1_3_2'");
		taskq.export({response:"Dynamic1_3_2"},"Dynamic1_3_2");
	}
	taskq.push(someFunction);
	console.log("Dynamic-1_3_2 Script loaded");
}()