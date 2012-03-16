/**
 * $media.timeline (2.1)
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
	window.$media.Point = function (settings, timeline) {
		if (typeof settings != 'object') {
			settings = {};
		}

		this.settings = settings;
		this.timeline = timeline;
		this.count = 0;
		this.enabled = true;

		if (!$.isFunction(settings.fn)) {
			console.error('There is not function to execute in this point');
		}

		if (settings.fn_out && !$.isFunction(settings.fn_out)) {
			console.error('There out function is not valid');
			settings.fn_out = false;
		}

		var relative = '' + ($.isArray(this.settings.time) ? this.settings.time.join() : this.settings.time);

		if (relative.indexOf('%') !== -1) {
			this.relative = false;
		} else {
			this.relative = true;
		}
	};

	window.$media.Point.prototype = {
		updateRelativeTime: function () {
			if (!this.timeline || !this.timeline.media) {
				return;
			}

			if ($.isArray(this.settings.time)) {
				this.start = this.timeline.media.time(this.settings.time[0]).secondsTo('ms');
				this.end = this.timeline.media.time(this.settings.time[1]).secondsTo('ms');
			} else {
				this.start = this.timeline.media.time(this.settings.time).secondsTo('ms');
				this.end = this.start;
			}
		},

		enable: function () {
			this.enabled = true;
		},

		disable: function () {
			this.enabled = false;
		},

		isEnabled: function () {
			return (this.enabled && this.timeline && this.timeline.isEnabled()) ? true : false;
		},

		execute: function () {
			if (this.waiting || !this.enabled) {
				return false;
			}

			this.count++;

			this.settings.fn.call(this, this.timeline.media, this.timeline);

			if (this.settings.fn_out) {
				this.waiting = true;
			}

			return true;
		},

		executeOut: function () {
			if (!this.waiting || !this.settings.fn_out) {
				this.waiting = false;

				return false;
			}

			this.settings.fn_out.call(this, this.timeline.media, this.timeline);

			this.waiting = false;
		}
	};

	
	//Timeline class
	window.$media.Timeline = function (settings) {
		this.enabled = false;
		this.points = {};
		this.media = false;

		if (typeof settings != 'object') {
			settings = {};
		}

		this.settings = settings;

		if (!$.isArray(this.settings.points)) {
			this.settings.points = [];
		}
	};


	window.$media.Timeline.prototype = {
		/**
		 * function enable ([bool refreshMedia])
		 *
		 * Enable the timeline
		 */
		enable: function (refreshMedia) {
			if (!this.enabled) {
				this.enabled = true;

				if ($.isFunction(this.settings.enable)) {
					$.proxy(this.settings.enable, this)(this.media);
				}

				if (this.media && refreshMedia !== false) {
					this.media.refreshTimeline();
				}
			}

			return this;
		},


		/**
		 * function disable ([bool refreshMedia])
		 *
		 * Disable the timeline
		 */
		disable: function (refreshMedia) {
			if (this.enabled) {
				this.enabled = false;

				if ($.isFunction(this.settings.disable)) {
					$.proxy(this.settings.disable, this)(this.media);
				}

				if (this.media && refreshMedia !== false) {
					this.media.refreshTimeline();
				}
			}

			return this;
		},


		/**
		 * function isEnabled ()
		 *
		 * Returns if the timeline is enabled
		 */
		isEnabled: function () {
			return this.enabled;
		},


		/**
		 * function applyPointsToMedia (points)
		 *
		 * Adds one or more points to the timeline
		 */
		applyPointsToMedia: function (points) {
			if (!this.media || !points || !points.length) {
				return;
			}

			var percent = [];
			var totaltime = this.media.totalTime();

			for (var i = 0, length = points.length; i < length; i++) {
				var point = points[i];

				if (!totaltime && point.relative) {
					percent.push(point);
					continue;
				}

				point.updateRelativeTime();

				if (this.points[point.start] == undefined) {
					this.points[point.start] = [point];
				} else {
					this.points[point.start].push(point);
				}
			}

			if (percent.length) {
				var that = this;

				this.media.totalTime(function () {
					that.applyPointsToMedia(percent);
				});
			}

			if (this.media && this.enabled) {
				this.media.refreshTimeline();
			}

			return this;
		},


		/**
		 * function addPoint (time, function)
		 * function addPoint (object point)
		 * function addPoint (array points)
		 *
		 * Adds one or more points to the timeline
		 */
		addPoint: function (time, fn) {
			if ($.isArray(time)) {
				var points = time;
				refreshTimeline = fn;
			} else if (typeof time == 'object') {
				var points = [time];
				refreshTimeline = fn;
			} else if ($.isFunction(fn)) {
				var points = [{
					time: time,
					fn: fn
				}];
			}

			for (var i = 0, length = points.length; i < length; i++) {
				points[i] = new $media.Point(points[i], this);
				this.settings.points.push(points[i]);
			}

			this.applyPointsToMedia(points);

			return this;
		},


		/**
		 * function getPoints ()
		 *
		 * Returns the points from the timeline
		 */
		getPoints: function () {
			if (!this.enabled) {
				return {};
			}

			return this.points;
		}
	}



	//Extends $media class
	$media.extend({

		/**
		 * function setTimeline (name, timeline)
		 *
		 * Join a timeline object
		 */
		setTimeline: function (name, timeline) {
			if (this.timelines && this.timelines[name]) {
				this.removeTimeline(name);
			}

			timeline.media = this;
			timeline.name = name;
			timeline.points = {};
			timeline.applyPointsToMedia(timeline.settings.points);

			if (!this.timeline || !this.timelines) {
				this.timelines = {};
				this.timeline = {
					points: [],
					inPoints: [],
					outPoints: [],
					timeout: 0
				};

				this.bind('mediaPlay mediaSeek', function() {
					this.executeTimeline();
				}).seeking(function(event, time) {
					var length = this.timeline.outPoints.length;

					if (length) {
						var ms = time.secondsTo('ms');

						for (var k = 0; k < length; k++) {
							var point = this.timeline.outPoints[k];

							if (point && (ms < point.start || ms > point.end || !point.isEnabled())) {
								point.executeOut();
								this.timeline.outPoints.splice(k, 1);
							}
						}
					}
				});
			}

			this.timelines[name] = timeline;

			if (timeline.isEnabled()) {
				this.refreshTimeline();
			}

			return this;
		},


		/**
		 * function getTimeline (name, [createIfNotExists], [options])
		 *
		 * Gets a timeline
		 */
		getTimeline: function (name, createIfNotExists, options) {
			if (name && (!this.timelines || !this.timelines[name]) && createIfNotExists === true) {
				this.setTimeline(name, new $media.Timeline(options));
			} else if (this.timelines) {
				return this.timelines[name];;
			}
		},


		/**
		 * function getTimelines ()
		 *
		 * Returns all timelines
		 */
		getTimelines: function () {
			return this.timelines;
		},



		/**
		 * function removeTimeline (name)
		 *
		 * Remove a timeline
		 */
		removeTimeline: function (name) {
			var timeline = this.getTimeline(name);

			if (!timeline) {
				return false;
			}

			timeline.points = {};
			timeline.media = false;
			timeline.name = null;

			delete this.timelines[name];

			this.refreshTimeline();

			return this;
		},



		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		enableDisableTimelines: function (timelines) {
			var refresh = false;

			for (var k = 0, lenght = timelines.length; k < length; k++) {
				var timeline = this.getTimeline(k);

				if (timeline) {
					if (timelines[k]) {
						if (!timeline.isEnabled()) {
							timeline.enable(false);
							refresh = true;
						}
					} else {
						if (timeline.isEnabled()) {
							timeline.disable(false);
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


		/**
		 * function refreshTimeline ()
		 *
		 * Set the points array
		 */
		refreshTimeline: function () {
			this.timeline.points = [];

			var points = {};

			for (name in this.timelines) {
				var timeline = this.getTimeline(name);

				if (!timeline.isEnabled()) {
					continue;
				}

				var timelinePoints = timeline.getPoints();

				for (ms in timelinePoints) {
					if (points[ms] == undefined) {
						points[ms] = [];
					}

					for (var k = 0, length = timelinePoints[ms].length; k < length; k++) {
						points[ms].push(timelinePoints[ms][k]);
					}
				}
			}

			points = sortObject(points);

			for (ms in points) {
				for (var k = 0, length = points[ms].length; k < length; k++) {
					this.timeline.points.push(points[ms][k]);
				}
			}

			this.executeTimeline();

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
				if (from < this.timeline.points[k].end && this.timeline.points[k].isEnabled()) {
					points.push(this.timeline.points[k]);
				}
			}

			return points;
		},



		/**
		 * function executeTimeline ()
		 *
		 * Execute the timeline functions
		 */
		executeTimeline: function () {
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

					if (point && (ms < point.start || ms > point.end || !point.isEnabled())) {
						point.executeOut();
						this.timeline.outPoints.splice(k, 1);
					}
				}
			}

			//Execute "in" functions
			while (this.timeline.inPoints && this.timeline.inPoints[0] && this.timeline.inPoints[0].start <= ms && this.timeline.inPoints[0].start < total_ms) {
				var point = this.timeline.inPoints.shift();

				if (point.execute() && point.waiting) {
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