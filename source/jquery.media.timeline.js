/**
 * $media.timeline (2.2.1)
 *
 * Require:
 * $media
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media.timeline is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {
	'use strict';

	//sort object
	var sortObject = function (o) {
		var sorted = {}, key, keys = [];

		for (key in o) {
			if (o.hasOwnProperty(key)) {
				keys.push(key);
			}
		}

		keys.sort(function (a, b) {
			return a - b;
		});

		for (key = 0; key < keys.length; key++) {
			sorted[keys[key]] = o[keys[key]];
		}

		return sorted;
	}


	//Point class
	window.$media.Point = function (settings) {
		settings = settings || {};
		this.data = settings.data || {};
		this.time = settings.time;

		if ($.isFunction(settings.fn)) {
			this.fn = settings.fn;
		} else {
			console.error('fn is not a valid function');
		}

		if ($.isFunction(settings.fn_out)) {
			this.fn_out = settings.fn_out;
		} else if (settings.fn_out) {
			console.error('fn_out is not a valid function');
		}

		if (!$.isArray(this.time)) {
			this.time = [this.time, this.time];
		}

		this.relative = (this.time.join().indexOf('%') !== -1) ? false : true;
	};

	window.$media.Point.prototype = {
		updateTime: function (media) {
			if (!media) {
				return;
			}

			if (this.time[0] === this.time[1]) {
				this.start = this.end = media.time(this.time[0]).secondsTo('ms');
			} else {
				this.start = media.time(this.time[0]).secondsTo('ms');
				this.end = media.time(this.time[1]).secondsTo('ms');
			}
		},

		execute: function (thisArg, args) {
			if (this.waiting) {
				return false;
			}

			this.fn.apply(thisArg, (args || []));

			if (this.fn_out) {
				this.waiting = true;
			}

			return true;
		},

		executeOut: function (thisArg, args) {
			if (!this.waiting || !this.fn_out) {
				this.waiting = false;

				return false;
			}

			this.fn_out.apply(thisArg, (args || []));

			this.waiting = false;
		}
	};

	
	//Timeline class
	window.$media.Timeline = function (data) {
		this.data = data || {};
		this.points = {};
		this.enabled = false;
	};


	window.$media.Timeline.prototype = {
		/**
		 * function applyPointsToMedia (points)
		 *
		 * Adds one or more points to the timeline
		 */
		savePoints: function (media, points) {
			if (!media || !points || !points.length) {
				return;
			}

			var percent = [];
			var totaltime = media.totalTime();

			for (var i = 0, length = points.length; i < length; i++) {
				var point = points[i];

				if (!totaltime && point.relative === true) {
					percent.push(point);
					continue;
				}

				point.updateTime(media);

				if (this.points[point.start] == undefined) {
					this.points[point.start] = [point];
				} else {
					this.points[point.start].push(point);
				}
			}

			if (percent.length) {
				var that = this;

				media.totalTime(function () {
					that.savePoints(this, percent);
				});
			}

			return this;
		},


		/**
		 * function addPoint (object point)
		 * function addPoint (array points)
		 *
		 * Adds one or more points to the timeline
		 */
		addPoints: function (media, points) {
			var newPoints = [];

			for (var i = 0, length = points.length; i < length; i++) {
				newPoints.push(new $media.Point(points[i]));
			}

			this.savePoints(media, newPoints);

			return this;
		}
	}



	//Extends $media class
	$media.extend({

		/**
		 * function setTimeline (name, [options])
		 *
		 * Gets a timeline
		 */
		setTimeline: function (name, options) {
			options = options || {};

			if (!this.timeline || !this.timelines) {
				this.timelines = {};
				this.timeline = {
					points: [],
					inPoints: [],
					outPoints: [],
					timeout: 0
				};

				this.bind('mediaPlay mediaSeek', function() {
					this.startTimeline();
				}).seeking(function(event, time) {
					var length = this.timeline.outPoints.length;

					if (length) {
						var ms = time.secondsTo('ms');

						for (var k = 0; k < length; k++) {
							var point = this.timeline.outPoints[k];

							if (point && (ms < point.start || ms > point.end)) {
								point.executeOut();
								this.timeline.outPoints.splice(k, 1);
							}
						}
					}
				});
			}

			this.timelines[name] = new $media.Timeline(options.data);

			if (options.points) {
				this.setTimelinePoints(name, options.points);
			}

			if (options.enabled) {
				this.enableTimeline(name);
			}

			return this;
		},


		/**
		 * function setTimelinePoints (name, [points])
		 *
		 * Gets a timeline
		 */
		setTimelinePoints: function (name, points) {
			if (!this.timelineExists(name)) {
				return this;
			}

			var timeline = this.timelines[name];

			if (!$.isArray(points)) {
				points = [points];
			}

			timeline.addPoints(this, points);

			if (timeline.enabled) {
				this.refreshTimeline();
			}

			return this;
		},


		/**
		 * function removeTimeline (name)
		 *
		 * Remove a timeline
		 */
		removeTimeline: function (name) {
			if (!this.timelineExists(name)) {
				return this;
			}
			
			if (this.timelines[name].enabled) {
				delete this.timelines[name];
				this.refreshTimeline();
			} else {
				delete this.timelines[name];
			}

			return this;
		},


		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		enableTimeline: function (name) {
			if (!this.timelineExists(name) || this.timelineIsEnabled(name)) {
				return this;
			}

			this.timelines[name].enabled = true;
			this.refreshTimeline();

			return this;
		},


		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		disableTimeline: function (name) {
			if (!this.timelineIsEnabled(name)) {
				return this;
			}

			this.timelines[name].enabled = false;
			this.refreshTimeline();

			return this;
		},



		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		enableDisableTimelines: function (timelines) {
			if (!timelines || !this.timelines) {
				return this;
			}

			var refresh = false;

			for (var name in timelines) {
				var timeline = this.timelines[name];

				if (timeline) {
					var enable = timelines[name] ? true : false;

					if (timeline.enabled !== enable) {
						timeline.enabled = enable;
						refresh = true;
					}
				}
			}

			if (refresh) {
				this.refreshTimeline();
			}

			return this;
		},

		timelineExists: function (name) {
			if (!name || !this.timelines || !this.timelines[name]) {
				return false;
			}

			return true;
		},


		timelineIsEnabled: function (name) {
			if (this.timelineExists(name) && this.timelines[name].enabled) {
				return true;
			}

			return false;
		},


		/**
		 * function refreshTimeline ()
		 *
		 * Set the points array
		 */
		refreshTimeline: function () {
			this.timeline.points = [];

			var points = {};

			for (var name in this.timelines) {
				var timeline = this.timelines[name];

				if (!timeline.enabled) {
					continue;
				}

				var timelinePoints = timeline.points;

				for (var ms in timelinePoints) {
					if (points[ms] == undefined) {
						points[ms] = [];
					}

					for (var k = 0, length = timelinePoints[ms].length; k < length; k++) {
						var point = timelinePoints[ms][k];
						point.timelineName = name;
						points[ms].push(point);
					}
				}
			}

			points = sortObject(points);

			for (ms in points) {
				for (var k = 0, length = points[ms].length; k < length; k++) {
					this.timeline.points.push(points[ms][k]);
				}
			}

			this.startTimeline();

			return this;
		},


		/**
		 * function getPoints (from)
		 *
		 * Get the timeline points from any time to the end
		 */
		getPoints: function (from) {
			if (from == undefined) {
				from = 0;
			}

			from = from.secondsTo('ms');

			var points = [];

			for (var k = 0, length = this.timeline.points.length; k < length; k++) {
				if (from <= this.timeline.points[k].end) {
					points.push(this.timeline.points[k]);
				}
			}

			return points;
		},



		/**
		 * function startTimeline ()
		 *
		 * Execute the timeline functions
		 */
		startTimeline: function () {
			if (!this.timeline.points.length && !this.timeline.inPoints.length && !this.timeline.outPoints.length) {
				return;
			}

			this.timeline.inPoints = this.getPoints(this.time());

			this.timelineTimeout();

			return this;
		},



		/**
		 * function timelineTimeout ()
		 *
		 * Function to execute on timeOut
		 */
		timelineTimeout: function () {
			if (!this.timeline.inPoints.length && !this.timeline.outPoints.length) {
				return;
			}

			var ms = this.time().secondsTo('ms');
			var total_ms = this.totalTime().secondsTo('ms');

			//Execute "out" functions
			var length = this.timeline.outPoints.length;

			if (length) {
				for (var k = 0; k < length; k++) {
					var point = this.timeline.outPoints[k];

					if (point && (ms < point.start || ms > point.end || !this.timelines[point.timelineName].enabled)) {
						point.executeOut(this, [point.data, this.timelines[point.timelineName].data]);
						this.timeline.outPoints.splice(k, 1);
					}
				}
			}

			//Execute "in" functions
			while (this.timeline.inPoints && this.timeline.inPoints[0] && this.timeline.inPoints[0].start <= ms && this.timeline.inPoints[0].start < total_ms) {
				var point = this.timeline.inPoints.shift();

				if (point.execute(this, [point.data, this.timelines[point.timelineName].data]) && point.waiting) {
					this.timeline.outPoints.push(point);
				}
			}

			//Create other timeout
			if (!this.playing() || this.element.seeking || (!this.timeline.inPoints.length && !this.timeline.outPoints.length)) {
				return;
			}

			var new_ms = 0;

			if (this.timeline.inPoints[0]) {
				new_ms = this.timeline.inPoints[0].start;
			}

			var length = this.timeline.outPoints.length;

			if (length) {
				for (var k = 0; k < length; k++) {
					if (!new_ms || this.timeline.outPoints[k].end < new_ms) {
						new_ms = this.timeline.outPoints[k].end;
					}
				}
			}
			
			new_ms = new_ms - ms;

			if (new_ms < 20) {
				new_ms = 20;
			}

			clearTimeout(this.timeline.timeout);
			this.timeline.timeout = setTimeout($.proxy(this.timelineTimeout, this), new_ms);
		}
	});
})(jQuery);