!function(){
	var scripts = ["./script0.js","./script1.js","./script2.js"];
	process();
	function process(){
		var script = document.createElement("script"),
			scriptName = scripts.shift();
		script.async = true;
		script.onload = scriptLoaded;
		document.head.appendChild(script);
		script.src = scriptName;
	}
	function scriptLoaded(){
		(scripts.length && window.requestAnimationFrame(process))
		|| !function(){
			texts && texts.forEach(function(d,i){
				var p = document.createElement("p");
				p.textContent = d;
				document.body.firstElementChild.appendChild(p);
			});
		}();
	}
}()