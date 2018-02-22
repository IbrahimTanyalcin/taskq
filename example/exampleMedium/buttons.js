!function(){
	/*I will use this variable for storing frames
	for button clicks below*/
	var resetFrame;
	function makeButtons(exports){
		/*create an 2 element array of arrays,
		I will chain forEach to generate buttons 
		using the button function*/
		[
			[
				"Stop",
				function(event){
					/*either resume or pause taskq, changing the button
					text accordingly*/
					this.textContent = this.textContent === "Stop"
					? (taskq.pause,exports.message("paused!;"),"Resume")
					: (taskq.resume,exports.message("resumed!;"),"Stop");
				}
			],
			[
				"Restart",
				function(event){
					/*clear all the points, and reset the counter*/
					var row = document.getElementsByClassName("row")[0];
					while(row.hasChildNodes()){
						row.removeChild(row.lastChild);
					};
					exports.counter = 0;
					/*if the main thread has ended, we have to restart. But here is
					the catch: taskq.running is set by 2 threads when they shift() their tasks
					at start, the main and the immediate thread. They both operate under 
					Promises and requestAnimationFrame. So in a single frame of ~17ms, 
					taskq.running might return false before it is true again the next frame.
					When you are checking taskq.running, it good to check it next frame as well
					to make sure the threads are done. Below is normally not necessary unless
					someone spams the buttons faster than ~17ms.*/
					if(!taskq.running){
						window.cancelAnimationFrame(resetFrame);
						resetFrame = window.requestAnimationFrame(function(){
							/*taskq was infact running, return*/
							if(taskq.running){
								return;
							}
							/*push a function to main thread and call perform to start. 
							This was automatically done for you at the load event.*/
							taskq
							.push(function(){
								/*exports are flushed from taskq at the end of main thread.
								Luckily its kept in memory here, so we can re-export it.*/
								taskq.export(exports,"exports");
								taskq.load("./draw.js")
								.then(function(res){
									res.init;
									setTimeout(function(){
										res(true);
									},500);
								});
							}).perform();
						});
					}
				}
			]
		].forEach(function(d,i){
			button.apply(null,d);
		});
		/*create a button generator that takes
		as arguments a text to display and a function
		to fire on click event.*/
		function button(text,f){
			var div = document.createElement("div");
			div.addEventListener("click",f,false);
			button.div = button.div || document.getElementsByClassName("buttons")[0];
			button.div.appendChild(div);
			div.textContent = encodeURI(text).replace(/(?:%20)/gi," ");
		};
	};
	taskq.push(makeButtons);
}();