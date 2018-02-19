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
	//a salt for getters/setters
	var salt = Math.random();
	//current script
	var oScript = document.querySelector("script[src*='taskq.js']"),
		name = (oScript && oScript.getAttribute("global-name")) || "taskq",
		//the minimum desired pause between pushed function execution
		minPause = (oScript && +oScript.getAttribute("data-min-pause")) || 0,
		taskq = (window[name] = new function (){
			//internal variables to keep track of pushed functions and exports
			var tasks = [],
				exports = {},
				immediateTasks = [],
				scriptQueue = [],
				_random = Math.random(),
				_paused = false,
				_running = false;
			Object.defineProperties(
				this,
				{
					paused: {
						configurable: false,
						enumerable: false,
						get: function(){
							return _paused;
						},
						set: function(obj) {
							if (typeof obj !== "object" || obj.hash !== _random) {
								console.log("You cannot set this manually");
								return false;
							} else if (typeof obj.value === "boolean") {
								_paused = obj.value;
								return true;
							} else {
								return false;
							}
						}
					},
					pause: {
						configurable: false,
						enumerable: false,
						get: function(){
							var retValue = !_paused;
							return ((this.paused = {hash:_random, value: true}),retValue);
						}
					},
					resume: {
						configurable: false,
						enumerable: false,
						get: function() {
							var retValue = _paused;
							return ((this.paused = {hash:_random, value: false}),retValue);
						}
					},
					running: {
						configurable: false,
						enumerable: false,
						get: function(){
							return _running;
						},
						set: function(obj) {
							if (typeof obj !== "object" || obj.hash !== salt) {
								console.log("You cannot set this manually");
								return false;
							} else if (typeof obj.value === "boolean") {
								_running = obj.value;
								return true;
							} else {
								return false;
							}
						}
					}
				}
			);
			this.scriptLoading = false;
			this.scriptLoaded = false;
			this.scriptComplete = true;
			this.flush = function(origin){
				if (origin === "main") {
					tasks = [];
					exports = {};
				} else if (origin === "script") {
					immediateTasks = [];
				}
				return this;
			};
			this.export = function(f,name){
				name = name || "default";
				exports[name] = f;
				return this;
			};
			this.push = function(f){
				if(this.scriptLoading || this.scriptLoaded) {
					//console.log("pushing this to immediate queue");
					immediateTasks.push(f);
				} else {
					tasks.push(f);
				}
				return this;
			};
			this.perform = function(){
				this.execute(
					this.sortTasks(tasks),
					exports,
					{
						origin:"main"
					}
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
			this.thenable = function (that){
				var queue = [],
					_this = this,
					resolverValue = undefined;
					resolverIsFrozen = false,
					resolverIsInitiated = false,
					_catch = function(){};
				this.errored = false;
				this.rejected = false;
				this.catch = function(f){
					if (typeof f === "function") {
						_catch = f;
					}
					return this;
				};
				this.target = that;
				this.status = {complete:false};
				this.counter = 0;
				this.next = undefined;
				this.resolver = Object.defineProperties(
					function(value){
						if(resolverIsFrozen) {
							return false;
						}
						if (resolverValue = !!value) {
							_this.counter--;
							_this.next = true;
						} else {
							_this.rejected = true;
						}
						return resolverIsFrozen = true;
					},
					{
						init: {
							configurable:false,
							enumerable:false,
							get:function(){
								return resolverIsInitiated  = true;
							}
						},
						value: {
							configurable:false,
							enumerable:false,
							get:function(){
								return resolverValue;
							}
						}
					}
				);
				this.then = function(f){
					this.counter++;
					queue.push(function(){
						//console.log("Queue executes??");
						that.promise().then(function(){
							//console.log("Promise executes??");
							f(_this.resolver);
							if(!resolverIsInitiated) {
								_this.counter--;
								_this.next = true;
							}
						});
					});
					return this;
				};
				this.execute = function(){
					//console.log("execute???");
					that.execute (
						that.sortTasks(immediateTasks),
						exports,
						{
							origin:"script",
							status:/*this.status*/_this.status,
							flush:/*false*/true
						}
					);
					return this;
				};
				this.impender = function(){
					//console.log("running!!");
					if (!that.running) {
						that.running = {hash:salt, value: true};
					}
					if (
						!_paused
						&& ( 
							_this.errored
							|| _this.rejected
							|| (!_this.counter && _this.status.complete)
						)
					){
						that.running = {hash:salt, value: false};
						that.scriptLoaded = false;
						that.scriptComplete = true;
						if (_this.rejected) {
							_catch();
						}
						if (scriptQueue.length) {
							//console.log("Do I keep shifting???");
							scriptQueue.shift()();
						}
						return
					}
					if ( 
						!_paused 
						&& (
							_this.status.complete 
							&& (
								_this.next === undefined
								|| _this.next
							)
						)
					){
						resolverIsInitiated = false;
						resolverIsFrozen = false;
						resolverValue = undefined;
						_this.next = false;
						queue.shift()();
					}
					//console.log(_this.next);
					window.requestAnimationFrame(_this.impender);
				};
				this.impender();
			};
			this.queuePacker = function(src,container){
				var thens = [],
					that = this;
				scriptQueue.push(function(){
					thens.forEach(function(d,i){this.then(d)},that.load(src,container));
				});
				return new function(){
					this.then = function(f){
						thens.push(f);
						return this;
					};
				}
			};
		}),
		prt = taskq.constructor.prototype;
		prt.sortTasks = function(tasks){
			//About max 2^16 tasks
				var base = Math.max.apply(null,tasks.map(function(d,i){return (d._taskqWaitFor || []).length;})) + 1,
					//regex could do also - executed first
					keywordStart = ["start","init","begin","loadstart","loadStart"],
					//executed last
					keywordEnd = ["end","defer","finish","loadend","loadEnd"];
				//series of schwartzian transforms for sorting
				return tasks.map(function(d,i){
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
				});
		}
		prt.__promise = function(){
			this.then = function(f) {
				window.requestAnimationFrame(f);
				return this;
			}
		}
		//execute the pushed & sorted functions one by one
		prt.execute = function(sorted,exports,options){
			//console.log("execute MAIN???");
			//console.log(options.origin);
			if (!this.running) {
				this.running = {hash:salt, value: true};
			}
			if (!sorted.length) {
				//console.log("last routine!");
				options.flush === undefined || options.flush ? this.flush(options.origin) : void(0);
				options.status ? options.status.complete = true : void(0);
				this.running = {hash:salt, value: false};
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
					if ( 
						!that.paused
						&& (
							(diff = Date.now() - time) >= that.minPause 
							&& (
								(options.origin === "main" && that.scriptComplete)
								|| options.origin === "script"
							)
						)
					) {
						that.execute(sorted,exports,options);
					} else {
						that.wait(that.minPause - diff,sorted,exports,options);
					}
				});
			});
		}
		//wait until minimum required delay to honor minPause, then resume execution
		prt.wait = function(delay,sorted,exports,options) {
			var that = this,
				startTime = 0,
				tick = function(t){
					startTime = startTime || t;
					if (
						!that.paused
						&& (
							delay + startTime - t <= 0
							&& (
								(options.origin === "main" && that.scriptComplete)
								|| options.origin === "script"
							)
						)
					) {
						that.execute(sorted,exports,options);
					} else {
						window.requestAnimationFrame(tick);
					}
				};
			window.requestAnimationFrame(tick);
		}
		prt.load = function(src,container){
			if(!this.scriptComplete) {
				return this.queuePacker(src,container);
			}
			container = container || document.head;
			var that = this,
				oldNode = container.querySelector("script[src*='" + src.replace(/\?.*$/gi,"") + "']"),
				script = document.createElement("script"),
				thenable = (new this.thenable(that));
			this.scriptLoading = true;
			this.scriptComplete = false;
			script.async = true;
			script.onload = function(){
				//console.log("I fire too???");
				that.scriptLoading = false;
				that.scriptLoaded = true;
				thenable.execute();
			};
			script.onerror = function(){
				//console.log("I fire???");
				thenable.errored = true;
			};
			script.src = src;
			if (oldNode) {
				container.replaceChild(script,oldNode);
			} else {
				container.appendChild(script);
			}
			return thenable;
		}
	window.addEventListener("load",function(){
		taskq.perform();
	},false);
	return taskq;
}));