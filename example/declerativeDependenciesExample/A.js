!function(){
	function X(){
		var div = document.body.lastElementChild.appendChild(document.createElement("div"));
		div.textContent = "A\n\u21e9";
		taskq.export({},"exportA");
	}
	X._taskqId = document.currentScript.dataset.taskqid;
	X._taskqWaitFor = document.currentScript.dataset.taskqwaitfor.split(",").filter(d=>d);
	taskq.push(X);
}()