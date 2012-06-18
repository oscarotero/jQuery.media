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

	//Tweens class
	window.$media.Tween = function (settings) {
		this.target = $(settings.target);
		this.points = settings.points;
		this.enabled = false;
		this.lastPos = 0;
	};


	window.$media.Tween.prototype = {
		/**
		 * function move (time)
		 *
		 * Adds one or more points to the timeline
		 */
		getPoint: function (time) {
			if (this.enabled === false) {
				return false;
			}

			var point;

			for (var length = this.points.length; this.lastPos < length; this.lastPos++) {
				if (time > this.points[this.lastPos].time) {
					point = this.points[this.lastPos];
				} else {
					return point;
				}
			}

			return false;
		},

		refresh: function () {
			this.lastPos = 0;
		},

		execute: function (time) {
			var point = this.getPoint(time);

			if (point) {
				this.target.css({
					top: point.coords[0] +'%',
					left: point.coords[1] + '%'
				});
			}
		}
	}



	//Extends $media class
	$media.extend({

		/**
		 * function setTimeline (name, [tween])
		 *
		 * Gets a timeline
		 */
		setTween: function (name, tween) {
			if (!this.tween || !this.tweens) {
				this.tweens = {};
				this.tween = {
					points: [],
					timeout: 0
				};

				this.bind('timeupdate', function(event) {
					this.executeTweens(this.time().secondsTo('ms'));
				});
			}

			this.tweens[name] = new $media.Tween(tween);

			if (tween.enabled) {
				this.enableTween(name);
			}

			return this;
		},


		/**
		 * function removeTimeline (name)
		 *
		 * Remove a timeline
		 */
		removeTween: function (name) {
			if (!this.timelineExists(name)) {
				return this;
			}
			
			delete this.timelines[name];

			return this;
		},


		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		enableTween: function (name) {
			if (!this.tweenExists(name) || this.tweenIsEnabled(name)) {
				return this;
			}

			this.tweens[name].enabled = true;
			this.tweens[name].refresh();

			return this;
		},


		/**
		 * function enableDisableTimelines (object timelines)
		 *
		 * Enables and disables various timelines
		 */
		disableTween: function (name) {
			if (!this.tweenIsEnabled(name)) {
				return this;
			}

			this.tweens[name].enabled = false;

			return this;
		},



		/**
		 * function enableDisableTweens (object tweens)
		 *
		 * Enables and disables various timelines
		 */
		enableDisableTimelines: function (tweens) {
			if (!tweens || !this.tweens) {
				return this;
			}

			for (var name in tweens) {
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
		

		tweenExists: function (name) {
			if (!name || !this.tweens || !this.tweens[name]) {
				return false;
			}

			return true;
		},

		tweenIsEnabled: function (name) {
			if (this.tweenExists(name) && this.tweens[name].enabled) {
				return true;
			}

			return false;
		},


		/**
		 * function refreshTimeline ()
		 *
		 * Set the points array
		 */
		refreshTweens: function () {
			if (!this.tweens) {
				return;
			}

			for (var name in this.tweens) {
				this.tweens[name].refresh();
			}

			return this;
		},


		/**
		 * function timelineTimeout ()
		 *
		 * Function to execute on timeOut
		 */
		executeTweens: function (ms) {
			if (!this.tweens) {
				return;
			}

			for (var name in this.tweens) {
				this.tweens[name].execute(ms);
			}
		}
	});
})(jQuery);