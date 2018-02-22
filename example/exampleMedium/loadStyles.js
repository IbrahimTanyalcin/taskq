!function(){
	function loadStyles(){
		var link = document.createElement("link");
		link.href = "./styles.css";
		link.type = "text/css";
		link.rel = "stylesheet";
		document.head.appendChild(link);
	};
	taskq.push(loadStyles);
}();