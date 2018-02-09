(function (root,factory) {
	if(typeof root.window !== "object" && typeof root.document !== "object" ) {
		var __f = function(){};
		var __o = {};
		root.window = {
			requestAnimationFrame: __f,
			addEventListener: __f,
			document: {
				getElementById: __f,
				querySelector: __f,
				querySelectorAll: __f,
				elementFromPoint: __f,
				head: __o,
				body: __o
			}
		};
	}
	if (typeof define === "function" && define.amd) {
		define(factory);
	} else if (typeof exports === "object") {
		module.exports = factory(root.window,root.window.document);
	} else {
		factory(root,root.document);
    }
}(this,function(window,document){
	//current script
	var oScript = document.querySelector("script[src*='taskq.js']"),
		name = (oScript && oScript.getAttribute("global-name")) || "taskq",
		//the minimum desired pause between pushed function execution
		minPause = (oScript && +oScript.getAttribute("data-min-pause")) || 0,
		taskq = (window[name] = new function (){
			//internal variables to keep track of pushed functions and exports
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
				//About max 2^16 tasks
				var base = Math.max.apply(null,tasks.map(function(d,i){return (d._taskqWaitFor || []).length;})) + 1,
					//regex could do also - executed first
					keywordStart = ["start","init","begin","loadstart","loadStart"],
					//executed last
					keywordEnd = ["end","defer","finish","loadend","loadEnd"];
				this.execute(
					//series of schwartzian transforms for sorting
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
					}),
					exports
				);
				return this;
			};
			//If native Promise or polyfill available use that, otherwise fallback to rAF
			this.promise = function(){
				if (this.promise.promise) {
					return this.promise.promise;
				} else if (window.Promise && Promise.constructor === Function) {
					//console.log("using promise");
					return this.promise.promise = Promise.resolve();
				} else {
					//console.log("using rAF");
					return this.promise.promise = new this.__promise;
				}
			};
			this.minPause = minPause;
		}),
		prt = taskq.constructor.prototype;
		prt.__promise = function(){
			this.then = function(f) {
				window.requestAnimationFrame(f);
				return this;
			}
		}
		//execute the pushed & sorted functions one by one
		prt.execute = function(sorted,exports){
			if (!sorted.length) {
				//console.log("last routine!");
				this.flush();
				return;
			}
			var that = this,
				promise = this.promise(),
				time = Date.now();
			promise = promise.then(function(res){
				window.requestAnimationFrame(function(){
					var f = sorted.shift(),
						diff = 0;
					if(typeof f === "function") {
						var captured = (/function\s*\w*\s*\(((?:\s*\w+\s*\,?\s*)*)\)\s*\{/).exec(f.toString());
						f.apply(
							exports[f._taskqScope] || window,
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
					//control the frequency of function execution
					if ( (diff = Date.now() - time) >= that.minPause) {
						that.execute(sorted,exports);
					} else {
						that.wait(that.minPause - diff,sorted,exports);
					}
				});
			});
		}
		//wait until minimum required delay to honor minPause, then resume execution
		prt.wait = function(delay,sorted,exports) {
			var that = this,
				startTime = 0,
				tick = function(t){
					startTime = startTime || t;
					if (delay + startTime - t <= 0) {
						that.execute(sorted,exports);
					} else {
						window.requestAnimationFrame(tick);
					}
				};
			window.requestAnimationFrame(tick);
		}
	window.addEventListener("load",function(){
		taskq.perform();
	},false);
	return taskq;
}));