/**
 * $media (timeline module) jQuery plugin (v.2.0)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media is released under the GNU Affero GPL version 3.
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

	
	//Channel class
	var channel = function (media, settings) {
		this.enabled = false;
		this.points = {};
		this.media = media;

		if (typeof settings != 'object') {
			settings = {};
		}

		this.settings = settings;
	}


	channel.prototype = {
		
		/**
		 * function enable ([bool refreshTimeline])
		 *
		 * Enable the channel
		 */
		enable: function (refreshTimeline) {
			if (!this.enabled) {
				this.enabled = true;

				if ($.isFunction(this.settings.enable)) {
					$.proxy(this.settings.enable, this)(media);
				}

				if (refreshTimeline !== false) {
					this.media.refreshTimeline();
				}
			}
		},


		/**
		 * function disable ([bool refreshTimeline])
		 *
		 * Disable the channel
		 */
		disable: function (refreshTimeline) {
			if (this.enabled) {
				this.enabled = false;

				if ($.isFunction(this.settings.disable)) {
					$.proxy(this.settings.disable, this)(media);
				}

				if (refreshTimeline !== false) {
					this.media.refreshTimeline();
				}
			}
		},


		/**
		 * function isEnabled ()
		 *
		 * Returns if the channel is enabled
		 */
		isEnabled: function () {
			return this.enabled;
		},


		/**
		 * function addPoint (time, function, [bool refreshTimeline])
		 * function addPoint (object point, [bool refreshTimeline])
		 * function addPoint (array points, [bool refreshTimeline])
		 *
		 * Adds one or more points to the channel
		 */
		addPoint: function (time, fn, refreshTimeline) {
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

			var percent = [];
			var totaltime = this.media.totalTime();

			for (var i = 0, length = points.length; i < length; i++) {
				if (!totaltime && ('' + ($.isArray(points[i].time) ? points[i].time.join() : points[i].time)).indexOf('%') !== -1) {
					percent.push(points[i]);
					continue;
				}

				var p = new point(this, points[i], totaltime);

				if (this.points[p.start] == undefined) {
					this.points[p.start] = [p];
				} else {
					this.points[p.start].push(p);
				}
			}

			if (percent.length) {
				var that = this;

				this.totalTime(function () {
					that.addPoint(percent);
				});
			}

			if (refreshTimeline !== false) {
				this.media.refreshTimeline();
			}

			return this;
		},


		/**
		 * function getPoints ()
		 *
		 * Returns the points from the channel
		 */
		getPoints: function () {
			if (!this.enabled) {
				return {};
			}

			return this.points;
		},


		/**
		 * function remove ()
		 *
		 * Removes the channel
		 */
		remove: function () {
			this.points = {};
			this.enabled = false;

			if ($.isFunction(this.settings.remove)) {
				$.proxy(this.settings.remove, this)();
			}
		}
	}


	//Point class
	var point = function (channel, settings) {
		this.channel = channel;
		this.data = settings;

		if ($.isArray(settings.time)) {
			this.start = this.channel.media.time(settings.time[0]).secondsTo('ms');
			this.end = this.channel.media.time(settings.time[1]).secondsTo('ms');
		} else {
			this.start = this.channel.media.time(settings.time).secondsTo('ms');
			this.end = this.start;
		}

		if (!$.isFunction(settings.fn)) {
			console.error('There is not function to execute in this point');
		} else if (!settings.proxy) {
			settings.proxy = this.channel.media;
		}

		if (settings.fn_out && !$.isFunction(settings.fn_out)) {
			console.error('There out function is not valid');
			settings.fn_out = false;
		}
	}

	point.prototype = {
		execute: function () {
			if (this.waiting) {
				return false;
			}

			this.data.fn.call(this.data.proxy, this);

			if (this.data.fn_out) {
				this.waiting = true;
			}

			return true;
		},

		executeOut: function () {
			if (!this.waiting || !this.data.fn_out) {
				return false;
			}

			this.data.fn_out.call(this.data.proxy, this);
			this.waiting = false;
		}
	};



	//Extends $media class
	$media.extend({
		channels: {},
		timeline: {
			points: [],
			inPoints: [],
			outPoints: [],
			timeout: false
		},


		/**
		 * function clearTimeline ()
		 *
		 * Removes all timeline data
		 */
		clearTimeline: function () {
			this.timeline = {
				points: [],
				inPoints: [],
				outPoints: []
			};
		},


		/**
		 * function createChannel (name, [options])
		 *
		 * Create a new channel
		 */
		createChannel: function (name, options) {
			if (this.channels[name]) {
				this.removeChannel(name);
			}

			this.channels[name] = new channel(this, options);

			if (this.timeline.timeout === false) {
				this.timeline.timeout = 0;

				this.bind('mediaPlay mediaSeek', function() {
					this.executeTimeline();
				}).seeking(function(event, time) {
					var length = this.timeline.outPoints.length;

					if (length) {
						var ms = time.secondsTo('ms');

						for (var k = 0; k < length; k++) {
							var point = this.timeline.outPoints[k];

							if (point && (ms < point.start || ms > point.end || !point.channel.isEnabled())) {
								point.executeOut();
								this.timeline.outPoints.splice(k, 1);
							}
						}
					}
				});
			}

			return this.channels[name];
		},


		/**
		 * function removeChannel (name)
		 *
		 * Remove a channel
		 */
		removeChannel: function (name) {
			if (!name || !this.channels[name]) {
				return false;
			}

			this.channels[name].remove();

			delete this.channels[name];
		},


		/**
		 * function enableDisableChannels (object channels)
		 *
		 * Enables and disables various channels
		 */
		enableDisableChannels: function (channels) {
			var refresh = false;

			for (var k = 0, lenght = channels.length; k < length; k++) {
				if (this.channels[k]) {
					var channel = this.channels[k];

					if (channels[k]) {
						if (!channel.isEnabled()) {
							channel.enable(false);
							refresh = true;
						}
					} else {
						if (channel.isEnabled()) {
							channel.disable(false);
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

			for (name in this.channels) {
				var channel = this.channels[name];

				if (!channel.isEnabled()) {
					continue;
				}

				var channelPoints = channel.getPoints();

				for (ms in channelPoints) {
					if (points[ms] == undefined) {
						points[ms] = [];
					}

					var length = channelPoints[ms].length;

					for (var p = 0; p < length; p++) {
						points[ms].push(channelPoints[ms][p]);
					}
				}
			}

			points = sortObject(points);

			for (ms in points) {
				var length = points[ms].length;

				for (var p = 0; p < length; p++) {
					this.timeline.points.push(points[ms][p]);
				}
			}

			this.executeTimeline();
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
				if (from < this.timeline.points[k].end) {
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

			//Execute functions
			var ms = this.time().secondsTo('ms');
			var total_ms = this.totalTime().secondsTo('ms');

			while (this.timeline.inPoints && this.timeline.inPoints[0] && this.timeline.inPoints[0].start <= ms && this.timeline.inPoints[0].start < total_ms) {
				var point = this.timeline.inPoints.shift();

				if (point.execute() && point.waiting) {
					this.timeline.outPoints.push(point);
				}
			}

			//Execute out functions
			var length = this.timeline.outPoints.length;

			if (length) {
				for (var k = 0; k < length; k++) {
					var point = this.timeline.outPoints[k];

					if (point && (ms < point.start || ms > point.end || !point.channel.isEnabled())) {
						point.executeOut();
						this.timeline.outPoints.splice(k, 1);
					}
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
			
			new_ms = (new_ms - ms) + 10;

			if (new_ms < 20) {
				new_ms = 20;
			}

			clearTimeout(this.timeline.timeout);
			this.timeline.timeout = setTimeout($.proxy(this.timelineTimeout, this), new_ms);
		}
	});
})(jQuery);