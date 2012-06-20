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
		this.points = settings.points;
		this.target = $(settings.target).hide();
		this.enabled = false;
		this.currentPos = 0;
		this.lastPos = this.points.length - 1;
		this.status = 'out';
		this.in = settings.in;
		this.out = settings.out;

		this.restore();
	};


	window.$media.Tween.prototype = {
		/**
		 * function move (ms)
		 *
		 * Adds one or more points to the timeline
		 */
		getPoint: function (ms) {
			if ((this.enabled === false) || (this.points[0].ms > ms) || (this.points[this.lastPos].ms < ms)) {
				this.currentPos = 0;
				return false;
			}

			if (this.points[this.currentPos].ms > ms) {
				this.currentPos = 0;
			}

			var point;

			while (this.points[this.currentPos] && this.points[this.currentPos].ms <= ms) {
				point = this.points[this.currentPos];
				this.currentPos++;
			}

			if (point) {
				this.currentPos--;
				return point;
			}

			return false;
		},

		execute: function (media) {
			var ms = media.time().secondsTo('ms');
			var point = this.getPoint(ms);

			if (point) {
				if (this.status === 'out') {
					this.status = 'in';
					this.target.show();

					if ($.isFunction(this.in)) {
						this.in.call(media, [this]);
					};
				}

				this.target.css({
					left: point.coords[0] +'%',
					top: point.coords[1] + '%'
				});

			} else if (this.status === 'in') {
				this.restore();

				if ($.isFunction(this.out)) {
					this.out.call(media, [this]);
				};
			}
		},

		restore: function () {
			this.status = 'out';

			this.target.hide().css({
				left: this.points[0].coords[0] +'%',
				top: this.points[0].coords[1] + '%'
			});
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
			if (!this.tweens) {
				this.tweens = {};

				this.on('timeupdate', function() {
					this.executeTweens();
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
		enableDisableTweens: function (tweens) {
			if (!tweens || !this.tweens) {
				return this;
			}

			for (var name in tweens) {
				if (tweens[name]) {
					this.enableTween(name);
				} else {
					this.disableTween(name);
				}
			}

			return this;
		},
		

		tweenExists: function (name) {
			if ((name === undefined) || !this.tweens || !this.tweens[name]) {
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
		executeTweens: function () {
			if (!this.tweens) {
				return;
			}

			for (var name in this.tweens) {
				this.tweens[name].execute(this);
			}
		}
	});
})(jQuery);