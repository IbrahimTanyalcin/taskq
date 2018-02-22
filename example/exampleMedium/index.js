!function(){
	/*in our main thread there is only index function
	so there is no need to use _taskqId or _taskqWaitFor.
	We define the function and directly do taskq.push 
	to start the main thread.*/
	function index(exports){
		/*start by loading the message generator
		then wait 3 seconds before proceeding next*/
		taskq.load("./message.js")
		.then(function(){
			exports.message("message generator added!;");
		})
		.then(function(res){
			res.init;
			exports.message("Waiting 3 seconds...");
			setTimeout(function(){
				res(true);
			},3000);
		});
		/*load the styles, wait for 3 seconds,
		then export some variables that we will
		need later*/
		taskq.load("./loadStyles.js")
		.then(function(){
			exports.message("styleSheets loaded!;");
		})
		.then(function(res){
			res.init;
			exports.message("Waiting 3 seconds...");
			setTimeout(function(){
				res(true);
			},3000);
		})
		.then(function(){
			/*To draw sin(x), everytime draw.js is loaded, it will
			increment the counter. We will finish the graph in 
			100 steps. Since the period is 2PI, we divide it by 100*/
			exports.counter = 0;
			exports.step = Math.PI*2/100;
			exports.message("Variables set!;");
		});
		/*Let's add a github button, then wait for 3 seconds*/
		taskq.load("./githubButtons.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				exports.message("Added github corner!;");
				res(true);
			},3000);
		})
		.then(function(res){
			res.init;
			setTimeout(function(){
				exports.message("Let's add some buttons!;");
				res(true);
			},3000);
		});
		/*Add buttons to resume or pause, 
		wait for another 3 seconds twice*/
		taskq.load("./buttons.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				exports.message("Buttons made!;");
				res(true);
			},3000);
		})
		.then(function(res){
			res.init;
			exports.message("Starting to draw in 3 seconds...");
			setTimeout(function(){
				res(true);
			},3000);
		});
		/*recursively load draw function,
		this will not blow the stack.
		Wait for 500 milliseconds before 
		proceeding reload*/
		taskq.load("./draw.js")
		.then(function(res){
			res.init;
			setTimeout(function(){
				res(true);
			},500);
		});
	};
	/*since iief executes immediately
	we can export a variable to be available
	for the pushed functions*/
	taskq.export({},"exports");
	/*start the main thread*/
	taskq.push(index);
}();