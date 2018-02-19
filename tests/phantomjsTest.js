var page = require('webpage').create();
page.open('./tests/phantomTest/minimal.html',function(status){
	if (status === "success") {
		console.log("Started recording..");
		setTimeout(function(){
			page.evaluate(function(){
				var res = document.defaultView.result;
				if (res) {
					console.log("Succesful! Execution order was according to the specifications. Exiting with 0!");
					phantom.exit();
				} else {
					console.log("Execution order is mixed up. Specifications were not met! Exiting with 1!");
					phantom.exit(1);
				}
			})
		},60000);
	} else {
		phantom.exit(1);
	}
});