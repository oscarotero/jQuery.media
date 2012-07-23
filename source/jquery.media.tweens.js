/**
 * $media.tween (0.2.0)
 *
 * Require:
 * $media
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media.tween is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {
	'use strict';

	var normalizePoints = function (points) {
		points.sort(function (a, b) {
			return a.ms - b.ms;
		});

		var nPoints = [];
		var previous = points[0];
		nPoints.push(previous);

		for (var i = 1, length = points.length; i < length; i++) {
			var current = points[i];
			var diff_ms = (current.ms - previous.ms);

			if (diff_ms > 210) {
				var num_interpolations = Math.ceil(diff_ms / 200);
				var diff_x = ((current.coords[0] - previous.coords[0]) / num_interpolations);
				var diff_y = ((current.coords[1] - previous.coords[1]) / num_interpolations);

				diff_ms = Math.round(diff_ms / num_interpolations);

				for (var n = 1; n < num_interpolations; n++) {
					nPoints.push({
						ms: previous.ms + (diff_ms * n),
						status: current.status,
						coords: [
							Math.round((previous.coords[0] + (diff_x * n)) * 100) / 100,
							Math.round((previous.coords[1] + (diff_y * n)) * 100) / 100
						]
					});
				}
			}
			
			nPoints.push(current);
			previous = current;
		}

		return nPoints;
	};

	//Tweens class
	window.$media.Tween = function (name, settings) {
		this.name = name;
		this.target = $(settings.target).hide();
		this.enabled = false;
		this.data = settings.data || {};

		this.status = 'out';
		this["in"] = settings["in"];
		this.out = settings.out;
		this.statusChange = settings.statusChange;
		this.create = settings.create;
		this.destroy = settings.destroy;

		this.points = normalizePoints(settings.points);
		this.length = this.points.length - 1;
		this.position = 0;
	};


	window.$media.Tween.prototype = {
		executeDestroy: function (media) {
			if ($.isFunction(this.destroy)) {
				this.destroy.call(media, this);
			}
		},

		executeCreate: function (media) {
			if ($.isFunction(this.create)) {
				this.create.call(media, this);
			}
		},

		reset: function () {
			this.position = 0;
		},

		currentPoint: function () {
			return this.points[this.position];
		},

		nextPoint: function () {
			if (this.position < this.length) {
				return this.points[++this.position];
			}
		},

		firstPoint: function () {
			return this.points[0];
		},

		lastPoint: function () {
			return this.points[this.length];
		},

		getPoint: function (ms) {
			if ((this.enabled === false) || (this.firstPoint().ms > ms) || (this.lastPoint().ms < ms)) {
				return false;
			}

			if (this.currentPoint().ms > ms) {
				return true;
			}

			while (this.currentPoint().ms < ms) {
				if (!this.nextPoint()) {
					return false;
				}
			}

			return this.currentPoint();
		},

		execute: function (media) {
			var ms = media.time().secondsTo('ms');
			var point = this.getPoint(ms);

			if (point === true) {
				return;
			}

			if (point) {
				this.target.css({
					left: point.coords[0] +'%',
					top: point.coords[1] + '%'
				}, {
					duration: 200,
					queue: false
				});

				if (this.status === 'out') {
					this.status = 'in';
					this.target.show();

					if ($.isFunction(this["in"])) {
						this["in"].call(media, this);
					}
				}

				if (point.status && (point.status !== this.status)) {
					this.status = point.status;

					if ($.isFunction(this.statusChange)) {
						this.statusChange.call(media, this);
					}
				}

				return;

			}

			if (this.status !== 'out') {
				this.status = 'out';
				this.target.hide();

				if ($.isFunction(this.out)) {
					this.out.call(media, this);
				}
			}
		}
	};



	//Extends $media class
	window.$media.extend({

		/**
		 * function setTween (name, [tween])
		 *
		 * Gets a tween
		 */
		setTween: function (name, tween) {
			if (!this.tweens) {
				this.tweens = {};

				this.on('play seek', function () {
					this.refreshTweens();
					this.executeTweens();
				});
			}

			this.tweens[name] = new window.$media.Tween(name, tween);

			this.tweens[name].executeCreate(this);

			if (tween.enabled) {
				this.enableTween(name);
			}

			return this;
		},


		/**
		 * function removeTween (name)
		 *
		 * Remove a tween
		 */
		removeTween: function (name) {
			if (!this.tweenExists(name)) {
				return this;
			}

			this.tweens[name].executeDestroy(this);

			delete this.tweens[name];

			return this;
		},


		/**
		 * function enableDisableTweens (object tweens)
		 *
		 * Enables and disables various tweens
		 */
		enableTween: function (name) {
			if (!this.tweenExists(name) || this.tweenIsEnabled(name)) {
				return this;
			}

			this.tweens[name].enabled = true;

			return this;
		},


		/**
		 * function enableDisableTweens (object tweens)
		 *
		 * Enables and disables various tweens
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
		 * Enables and disables various tweens
		 */
		enableDisableTweens: function (tweens) {
			if (!tweens || !this.tweens) {
				return this;
			}

			var name;

			for (name in tweens) {
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
		 * function refreshTween ()
		 *
		 * Set the points array
		 */
		refreshTweens: function () {
			if (!this.tweens) {
				return;
			}

			var name;

			for (name in this.tweens) {
				if (this.tweens.hasOwnProperty(name)) {
					this.tweens[name].reset();
				}
			}

			return this;
		},


		/**
		 * function tweenTimeout ()
		 *
		 * Function to execute on timeOut
		 */
		executeTweens: function () {
			if (!this.tweens) {
				return;
			}

			var name;

			for (name in this.tweens) {
				if (this.tweens.hasOwnProperty(name)) {
					this.tweens[name].execute(this);
				}
			}

			if (this.playing()) {
				this.tweensTimeout = setTimeout($.proxy(this, 'executeTweens'), 200);
			}
		}
	});
})(window.jQuery);