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
	//version
	var version = "2.2.3";
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
			/*taskq resonates between 3 stages. If taskq.onload is called,
			scriptLoading is true and scriptComplete is false, once script is loaded, 
			scriptLoading is false and scriptLoaded is true, once all pushed
			functions execute and thens are consumed, scriptComplete is true*/
			this.scriptLoading = false;
			this.scriptLoaded = false;
			this.scriptComplete = true;
			/*clear main thread or the immediate thread*/
			this.flush = function(origin){
				if (origin === "main") {
					tasks = [];
					exports = {};
				} else if (origin === "script") {
					immediateTasks = [];
				}
				return this;
			};
			/*export variables with alias*/
			this.export = function(f,name){
				name = name || "default";
				exports[name] = f;
				return this;
			};
			/*if onload is encountered, push the immediateTasks,
			otherwise push to main thread*/
			this.push = function(f){
				if(this.scriptLoading || this.scriptLoaded) {
					//console.log("pushing this to immediate queue");
					immediateTasks.push(f);
				} else {
					tasks.push(f);
				}
				return this;
			};
			/*perform pushed functions*/
			this.perform = function(){
				this.execute(
					this.sortTasks(tasks,true),
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
			/*set the minimum amount of time to pass between execution of
			functions in the main thread*/
			this.minPause = minPause;
			/*taskq.load returns a thennable object,
			for more refer to readme.md*/
			this.thenable = function (that){
				var queue = [],
					_this = this,
					resolverValue = undefined,
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
						that.promise().then(function(){
							f(_this.resolver);
							if(!resolverIsInitiated) {
								_this.counter--;
								_this.next = true;
							}
						});
					});
					return this;
				};
				/*Starts executing the pushed functions within the
				immediate tasks. Upon completion 'status.complete' will be set to
				true and impender can start executing then clauses*/
				this.execute = function(){
					that.execute (
						immediateTasks.length && that.sortTasks(immediateTasks),
						exports,
						{
							origin:"script",
							status:_this.status,
							flush:true
						}
					);
					return this;
				};
				/*When a thennable is created, its impender is immediately active,
				once status is complete, it starts executing the then clauses. When
				all then clauses are finished, the next dynamic load, if any is
				processed*/
				this.impender = function(){
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
							scriptQueue.shift()();
						}
						return;
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
					window.requestAnimationFrame(_this.impender);
				};
				this.impender();
			};
			/*If another load is encountered before current dynamic load
			and its then clauses are processed, it is pushed to the 
			scriptQueue*/
			this.queuePacker = function(src,container){
				var thens = [],
					that = this;
				scriptQueue.push(function(){
					thens.forEach(function(d,i){this.then(d);},that.load(src,container));
				});
				return new function(){
					this.then = function(f){
						thens.push(f);
						return this;
					};
				};
			};
		}),
		prt = taskq.constructor.prototype;
		prt.emptyArr = [];
		prt.version = function(){
			return version;
		};
		/*This internally called method is either passed the tasks array or
		the immediateTasks array. Sorts the passed array and returns a shallow copy*/
		prt.sortTasksUnstable = function(tasks,base,keywordStart,keywordEnd,tasksMap){
				//series of schwartzian transform(s) for sorting, KSC = keywordStartCoefficient, KEC = keywordEndCoefficient
				return tasks.map(function(d,i){
					return [d,d._taskqId,d._taskqWaitFor];
				}).sort(function(a,b){
					var aId = a[1],
						bId = b[1],
						aL = a[2] || prt.emptyArr,
						bL = b[2] || prt.emptyArr,
						a0 = a[0],
						b0 = b[0],
						aKSC = a0._taskqKSC === undefined ? a0._taskqKSC = !~keywordStart.indexOf(aId) : a0._taskqKSC,
						aKEC = a0._taskqKEC === undefined ? a0._taskqKEC = !!~keywordEnd.indexOf(aId) : a0._taskqKEC,
						bKSC =  b0._taskqKSC === undefined ? b0._taskqKSC = !~keywordStart.indexOf(bId) : b0._taskqKSC,
						bKEC = b0._taskqKEC === undefined ? b0._taskqKEC = !!~keywordEnd.indexOf(bId) : b0._taskqKEC,
						aC = aKSC && (aKEC || aL.some(function(d,i){return d === bId || (tasksMap[d]._taskqWaitFor && ~tasksMap[d]._taskqWaitFor.indexOf(bId));})),
						bC = bKSC && (bKEC || bL.some(function(d,i){return d === aId || (tasksMap[d]._taskqWaitFor && ~tasksMap[d]._taskqWaitFor.indexOf(aId));}));
					return aC*base+aL.length - bC*base - bL.length;
				}).map(function(d,i){
					return d[0];
				});
		};
		prt.sortTasks = function(tasks,report){
			var start = Date.now(),
				steps = 1,
				length = tasks.length,
				//About max 2^16 tasks
				base = Math.max.apply(null,tasks.map(function(d,i){return (d._taskqWaitFor || prt.emptyArr).length;})) + 1,
				//regex could do also - executed first
				keywordStart = ["start","init","begin","loadstart","loadStart"],
				//keywordEnd = ["end","defer","finish","loadend","loadEnd"];
				keywordEnd = ["end","defer","finish","loadend","loadEnd"],
				//reverse Map, id to function
				tasksMap = tasks.reduce(function(ac,d,i,a){d._taskqId && (ac[d._taskqId] = d); return ac;},{});
			tasks = this.sortTasksUnstable(tasks,base,keywordStart,keywordEnd,tasksMap);
			
			//chrome sort uses quicksort for  arrays of length > 10, I use windows of 9 to force stable sort.
			outer:
			for(
				var i = 0,a = tasks[i],aId = a._taskqId,aL = a._taskqWaitFor || prt.emptyArr,aKSC,aKEC;
				i<length;
				++i,a = tasks[i],aId = a && a._taskqId,aL = a && (a._taskqWaitFor || prt.emptyArr)
			){
				aKSC = a._taskqKSC === undefined ? a._taskqKSC = !~keywordStart.indexOf(aId) : a._taskqKSC;
				aKEC = a._taskqKEC === undefined ? a._taskqKEC = !!~keywordEnd.indexOf(aId) : a._taskqKEC;
				
				inner:
				for(var j = i+1;j<length;++j) {
					var b = tasks[j],
						bId = b._taskqId,
						bL = b._taskqWaitFor || prt.emptyArr,
						bKSC =  b._taskqKSC === undefined ? b._taskqKSC = !~keywordStart.indexOf(bId) : b._taskqKSC,
						bKEC = b._taskqKEC === undefined ? b._taskqKEC = !!~keywordEnd.indexOf(bId) : b._taskqKEC,
						aC = aKSC && (aKEC || aL.some(function(d,i){return d === bId || (tasksMap[d]._taskqWaitFor && ~tasksMap[d]._taskqWaitFor.indexOf(bId));})),
						bC = bKSC && (bKEC || bL.some(function(d,i){return d === aId || (tasksMap[d]._taskqWaitFor && ~tasksMap[d]._taskqWaitFor.indexOf(aId));}));
					if (aC*base+aL.length - bC*base - bL.length > 0) {
						tasks[i] = b;
						tasks[j] = a;
						var windowStart = Math.max(0,j-8);
						var windowEnd = Math.min(length,Math.max(0,j-8)+9);
						tasks = (tasks.slice(0,windowStart).concat(this.sortTasksUnstable(tasks.slice(windowStart,windowEnd),base,keywordStart,keywordEnd,tasksMap)).concat(tasks.slice(windowEnd)));
						++steps;
						--i;
						break inner;
					}
				}
			}
			
			report ? console.log("Semi stable sorting done in: "+ steps + " steps, ~" +(Date.now()-start)+"ms") : void(0);
			//console.log(tasks.slice());
			return tasks;
		};
		/*requestAnimationFrame (rAF) is used instead of Promise wrapper in older browsers (ie9+)*/
		prt.__promise = function(){
			this.then = function(f) {
				window.requestAnimationFrame(f);
				return this;
			};
		};
		//execute the pushed & sorted functions one by one
		prt.execute = function(sorted,exports,options){
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
		};
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
		};
		/*Load scripts asynchronously and keep DOM clean*/
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
				that.scriptLoading = false;
				that.scriptLoaded = true;
				thenable.execute();
			};
			script.onerror = function(){
				thenable.errored = true;
			};
			script.src = src;
			if (oldNode) {
				container.replaceChild(script,oldNode);
			} else {
				container.appendChild(script);
			}
			return thenable;
		};
	window.addEventListener("load",function(){
		taskq.perform();
	},false);
	return taskq;
}));