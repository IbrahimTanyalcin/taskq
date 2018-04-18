!function(){
	function nonRenderBlocking(){
		taskq.load("./script0.js");
		taskq.load("./script1.js");
		taskq.load("./script2.js");
	}
	nonRenderBlocking._taskqId = "nonRenderBlocking";
	taskq.push(nonRenderBlocking);
}();