/**
 * $media.timeline (3.1.1)
 *
 * Require:
 * $media 2.x
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media.timeline is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function ($) {
	'use strict';

	//Private function to sort the parameters of an object
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

		for (key = 0; key < keys.length; ++key) {
			sorted[keys[key]] = o[keys[key]];
		}

		return sorted;
	};


	//Point constructor
	window.$media.Point = function (settings) {
		settings = settings || {};
		this.data = settings.data || {};
		this.time = settings.time;

		if ($.isFunction(settings.fn)) {
			this.fn = settings.fn;
		} else {
			$.error('fn is not a valid function');
		}

		if (!$.isArray(this.time)) {
			this.time = [this.time, this.time];
		}

		if ($.isFunction(settings.fn_out)) {
			this.fn_out = settings.fn_out;
		} else if (settings.fn_out) {
			$.error('fn_out is not a valid function');
		} else if (this.time[1] === undefined) {
			this.time[1] = this.time[0];
		}

		this.relative = (this.time.join().indexOf('%') === -1) ? false : true;
	};

	window.$media.Point.prototype = {

		/**
		 * Sets the start and end of the point based in the media object
		 *
		 * @param media The $media instance
		 */
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

			this.data.time = [this.start/1000, this.end/1000];
		},


		/**
		 * Executes the "in" function of the point
		 *
		 * @param thisArg The value of the variable "this"
		 * @param array args The arguments passed to the function
		 *
		 * @return boolean True is the function has executed, false if not
		 */
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

		
		/**
		 * Executes the "out" function of the point
		 *
		 * @param thisArg The value of the variable "this"
		 * @param array args The arguments passed to the function
		 *
		 * @return boolean True is the function has executed, false if not
		 */
		executeOut: function (thisArg, args) {
			if (!this.waiting || !this.fn_out) {
				this.waiting = false;

				return false;
			}

			this.fn_out.apply(thisArg, (args || []));

			this.waiting = false;
		}
	};


	//Timeline constructor
	window.$media.Timeline = function (data) {
		this.data = data || {};
		this.points = {};
		this.enabled = false;
	};


	window.$media.Timeline.prototype = {

		/**
		 * Saves the points into the timeline
		 *
		 * @param media The $media instance related with the timeline
		 * @param points Array with the points to save.
		 */
		savePoints: function (media, points) {
			if (!media || !points || !points.length) {
				return;
			}

			var percent = [], duration = media.duration(), i, length, point;

			for (i = 0, length = points.length; i < length; ++i) {
				point = points[i];

				if (!duration && (point.relative === true)) {
					percent.push(point);
					continue;
				}

				point.updateTime(media);

				if (this.points[point.start] === undefined) {
					this.points[point.start] = [point];
				} else {
					this.points[point.start].push(point);
				}
			}

			if (percent.length) {
				var that = this;

				media.readyState(1, function () {
					that.savePoints(this, percent);

					if (that.enabled) {
						this.refreshTimeline();
					}
				});
			}

			if (this.enabled) {
				media.refreshTimeline();
			}
		},


		/**
		 * Creates one or more points and saves in the timeline
		 *
		 * @param media The $media instance related with the timeline
		 * @param points Array with the settings for the points
		 *
		 * @return this
		 */
		addPoints: function (media, points) {
			var newPoints = [], i, length = points.length;

			for (i = 0; i < length; ++i) {
				newPoints.push(new window.$media.Point(points[i]));
			}

			this.savePoints(media, newPoints);

			return this;
		}
	};



	//Extends $media class
	window.$media.extend({

		/**
		 * Creates a new timeline
		 *
		 * @param string name The name for the timeline
		 * @param object options The settings for the timeline
		 *
		 * @return this
		 */
		createTimeline: function (name, options) {
			options = options || {};

			if (!this.timeline || !this.timelines) {
				this.timelines = {};
				this.timeline = {
					points: [],
					inPoints: [],
					outPoints: [],
					timeout: 0
				};

				this.on('play seeked', function () {
					this.startTimeline();
				}).on('seeking', function (event) {
					var length = this.timeline.outPoints.length;

					if (length) {
						var ms = this.time().secondsTo('ms'), k;

						for (k = 0; k < length; k++) {
							var point = this.timeline.outPoints[k];

							if (point && (ms < point.start || ms > point.end)) {
								point.executeOut(this, [point.data, this.timelines[point.timelineName].data]);
								this.timeline.outPoints.splice(k, 1);
							}
						}
					}
				});
			}

			this.timelines[name] = new window.$media.Timeline(options.data);

			if (options.points) {
				this.addTimelinePoints(name, options.points);
			}

			if (options.enabled) {
				this.enableTimeline(name);
			}

			return this;
		},


		/**
		 * Sets more
		 *
		 * Gets a timeline
		 */
		addTimelinePoints: function (name, points) {
			if (!this.timelineExists(name)) {
				return this;
			}

			if (!$.isArray(points)) {
				points = [points];
			}
			
			this.timelines[name].addPoints(this, points);

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
			
			if (!$.isEmptyObject(this.timelines[name].points)) {
				this.refreshTimeline();
			}

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

			if (!$.isEmptyObject(this.timelines[name].points)) {
				this.refreshTimeline();
			}

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

			var refresh = false, name;

			for (name in timelines) {
				if (timelines.hasOwnProperty(name)) {
					var timeline = this.timelines[name];

					if (timeline) {
						var enable = timelines[name] ? true : false;

						if (timeline.enabled !== enable) {
							timeline.enabled = enable;
							refresh = true;
						}
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
			var points = {}, name, timeline, timelinePoints, ms, k, point, length;

			this.timeline.points = [];

			for (name in this.timelines) {
				if (this.timelines.hasOwnProperty(name)) {
					timeline = this.timelines[name];

					if (!timeline.enabled) {
						continue;
					}

					timelinePoints = timeline.points;

					for (ms in timelinePoints) {
						if (timelinePoints.hasOwnProperty(ms)) {
							if (points[ms] === undefined) {
								points[ms] = [];
							}

							for (k = 0, length = timelinePoints[ms].length; k < length; k++) {
								point = timelinePoints[ms][k];
								point.timelineName = name;
								points[ms].push(point);
							}
						}
					}
				}
			}

			points = sortObject(points);

			for (ms in points) {
				if (points.hasOwnProperty(ms)) {
					for (k = 0, length = points[ms].length; k < length; k++) {
						this.timeline.points.push(points[ms][k]);
					}
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
			if (from === undefined) {
				from = 0;
			}

			from = from.secondsTo('ms');

			var points = [], k, length = this.timeline.points.length;

			for (k = 0; k < length; k++) {
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
			if (!this.timeline || (!this.timeline.points.length && !this.timeline.inPoints.length && !this.timeline.outPoints.length)) {
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
			if (!this.timeline || (!this.timeline.inPoints.length && !this.timeline.outPoints.length)) {
				return;
			}

			var ms = this.time().secondsTo('ms');
			var total_ms = this.duration().secondsTo('ms');
			var point, k, length;

			//Execute "out" functions
			length = this.timeline.outPoints.length;

			if (length) {
				for (k = 0; k < length; k++) {
					point = this.timeline.outPoints[k];

					if (point && (ms < point.start || ms > point.end || !this.timelines[point.timelineName].enabled)) {
						point.executeOut(this, [point.data, this.timelines[point.timelineName].data]);
						this.timeline.outPoints.splice(k, 1);
					}
				}
			}

			//Execute "in" functions
			while (this.timeline.inPoints && this.timeline.inPoints[0] && this.timeline.inPoints[0].start <= ms && this.timeline.inPoints[0].start < total_ms) {
				point = this.timeline.inPoints.shift();

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

			length = this.timeline.outPoints.length;

			if (length) {
				for (k = 0; k < length; k++) {
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
