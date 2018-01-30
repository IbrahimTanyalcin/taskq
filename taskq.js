!function(){
	var oScript = document.querySelector("script[src*='taskq.js']"),
		name = oScript.getAttribute("global-name") || "taskq",
		taskq = window[name] = new function(){
			var tasks = [],
				exports = {};
			this.flush = function(){
				tasks = [];
				exports = {};
				return this;
			};
			this.export = function(f,name){
				name = name || "default";
				exports[name] = f;
				return this;
			};
			this.push = function(f){
				tasks.push(f);
				return this;
			};
			this.perform = function(){
				var base = Math.max.apply(null,tasks.map(function(d,i){return (d._taskqWaitFor || []).length;})) + 1,//About max 2^16 tasks
					keywordStart = ["start","init","begin","loadstart","loadStart"],//regex could do also - executed first
					keywordEnd = ["end","defer","finish","loadend","loadEnd"];//executed last
				tasks.map(function(d,i){
					return [d,d._taskqId];
				}).sort(function(a,b){
					var aId = a[1],
						bId = b[1];
					if (~keywordStart.indexOf(aId)) {
						return ~keywordStart.indexOf(bId) ? 0 : -1;
					} else if (~keywordEnd.indexOf(aId)) {
						return ~keywordEnd.indexOf(bId) ? 0 : 1;
					} else {
						return 0;
					}
				}).map(function(d,i){
					return [d[0],d[0]._taskqWaitFor];
				}).sort(function(a,b){
					var aL = a[1],
						bL = b[1];
					if (!aL) {
						return !bL ? 0 : -1;
					} else if (!bL) {
						return 1;
					} else {
						return 0;
					}
				}).map(function(d,i){
					return [d[0],d[0]._taskqId,d[1]];
				}).sort(function(a,b){
					var aId = a[1],
						bId = b[1],
						aL = a[2] || [],
						bL = b[2] || [];
					return aL.some(function(d,i){return d === bId;})*base+aL.length - bL.some(function(d,i){return d === aId;})*base - bL.length;
				}).map(function(d,i){
					return d[0];
				}).forEach(function(d,i){
					if(typeof d === "function") {
						var captured = (/function\s*\w*\s*\(((?:\s*\w+\s*\,?\s*)*)\)\s*\{/).exec(d.toString());
						d.apply(
							exports[d._taskqScope] || window,
							captured 
							? captured[1]
								.replace(/\s+/g,"")
								.split(",")
								.map(function(d,i){return exports[d];}) 
							: void(0)
						);
					} else {
						console.log("not a function ref");
					}
				},this);
				return this;
			};
		};
	window.addEventListener("load",function(){
		taskq.perform().flush();
	},false);
}();