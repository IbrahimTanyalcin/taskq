!function(){
	function script2(){
		console.log("script2 executed");
	}
	script2._taskqId = "script2";
	script2._taskqWaitFor = ["script1"];
	taskq.push(script2);
	console.log("scrip2 iief executed");
}()