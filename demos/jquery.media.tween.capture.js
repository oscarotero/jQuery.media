/**
 * $media.tween.capture (0.1.0)
 *
 * Require:
 * $media
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media.tween.capture is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {
	'use strict';

	var mouseCoords = {left: 0, top: 0};

	$(document).ready(function () {
		$('body').on('mousemove', function (e) {
			mouseCoords = {left: e.pageX, top: e.pageY};
		});
	});

	//Extends $media class
	$media.extend({
		captureTweenStart: function () {
			this.play();

			var that = this;
			var offset = this.$element.offset();
			var size = {
				width: this.width(),
				height: this.height()
			};

			this.$element.data('tweenCapture', []);

			this.tweenCaptureInterval = setInterval(function () {
				var coords = [
					Math.round((((mouseCoords.left - offset.left) * 100) / size.width) * 100)/100,
					Math.round((((mouseCoords.top - offset.top) * 100) / size.height) * 100)/100
				];

				that.$element.data('tweenCapture').push({
					ms: that.time().secondsTo('ms'),
					coords: coords
				});
			}, 300);

			return this;
		},

		captureTweenStop: function (callback) {
			this.pause();

			clearInterval(this.tweenCaptureInterval);
			this.tweenCaptureInterval = undefined;

			if ($.isFunction(callback)) {
				callback.apply(this, [this.$element.data('tweenCapture')]);
			}

			this.$element.removeData('tweenCapture');

			return this;
		},

		captureTweenStarted: function () {
			return (this.$element.data('tweenCapture') === undefined) ? false : true;
		}
	});
})(jQuery);