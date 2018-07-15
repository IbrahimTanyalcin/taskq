!function(){
	function X(exportA,exportB){
		var div = document.body.lastElementChild.appendChild(document.createElement("div"));
		div.textContent = "C\n\u21e9";
		taskq.export({},"exportC");
	}
	X._taskqId = document.currentScript.dataset.taskqid;
	X._taskqWaitFor = document.currentScript.dataset.taskqwaitfor.split(",").filter(d=>d);
	taskq.push(X);
}()