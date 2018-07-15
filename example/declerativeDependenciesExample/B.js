!function(){
	function X(exportA){
		var div = document.body.lastElementChild.appendChild(document.createElement("div"));
		div.textContent = "B\n\u21e9";
		taskq.export({},"exportB");
	}
	window.ass = document.currentScript;
	X._taskqId = document.currentScript.dataset.taskqid;
	X._taskqWaitFor = document.currentScript.dataset.taskqwaitfor.split(",").filter(d=>d);
	taskq.push(X);
}()