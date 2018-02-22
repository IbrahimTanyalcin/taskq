!function(){
	function draw(exports){
		/*instead of recreating similar divs,
		I will make one template div, store it
		in exports and then clone it each time.*/
		if(!exports.point) {
			var div = document.createElement("div");
			div.className = "point";
			exports.point = div;
		}
		/*Store the main div, so we dont have to
		grab it each time*/
		if(!exports.row){
			exports.row = document.getElementsByClassName("row")[0];
		}
		div = exports.point.cloneNode();
		div.style.top = (50 - Math.sin(exports.counter * exports.step) * 50) + "%";
		div.style.left = exports.counter + "%";
		exports.row.appendChild(div);
		/*introduce a small delay which allows the
		css styles to kick in.*/
		window.requestAnimationFrame(function(){
			div.style.boxShadow = "0px 0px 0px 0px Orange";
		});
		/*if we reach 101, we are done*/
		exports.counter = ++exports.counter % 101;
		/*if we did not reach 101, load draw.js again,
		updating the immediate thread*/
		if (exports.counter) {
			taskq.load("./draw.js")
			.then(function(res){
				res.init;
				setTimeout(function(){
					res(true);
				},500);
			});
		} else {
			/*otherwise report*/
			exports.message("routine ended!;");
		}
	};
	taskq.push(draw);
}();