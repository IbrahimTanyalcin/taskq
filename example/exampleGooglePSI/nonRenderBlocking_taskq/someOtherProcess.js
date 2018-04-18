!function(){
	function someOtherProcess(){
		texts && texts.forEach(function(d,i){
			var p = document.createElement("p");
			p.textContent = d;
			document.body.firstElementChild.appendChild(p);
		});
	}
	someOtherProcess._taskqId = "someOtherProcess";
	someOtherProcess._taskqWaitFor = ["nonRenderBlocking"];
	taskq.push(someOtherProcess);
}();