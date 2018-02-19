!function(){
	console.log("Dynamic-0 Script loaded");
	window.result += "Dynamic-0 Script loaded\n";
	console.log("Exporting retValue");
	window.result += "Exporting retValue\n";
	taskq.export({value:undefined},"retValue");
}()