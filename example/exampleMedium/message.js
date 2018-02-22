!function(){
	function messenger(exports){
		/*export the message so it is visible for other functions*/
		exports.message = message;
		/*function for message generator*/
		function message(text){
			var div = document.createElement("div");
			message.count = message.count || 0;
			message.div = message.div || document.getElementsByClassName("sideCar")[0];
			message.div.appendChild(div);
			div.textContent = ++message.count + ") " + encodeURI(text).replace(/(?:%20)/gi," ");
		};
	};
	taskq.push(messenger);
}();