!function(){
	function script0(){
		console.log("script0 executed");
	}
	script0._taskqId = "script0";
	taskq.push(script0);
	console.log("scrip0 iief executed");
}()