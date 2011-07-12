/**
 * $media.toCanvas jQuery plugin (beta)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.toCanvas is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

(function ($) {
	var effects = {
		pixel_manipulation: function (settings) {
			var frame = this.canvas_context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pixels = frame.data;

			settings(pixels);

			frame.data = pixels;

			this.canvas_context.putImageData(frame, 0, 0);

			return;
		}
	};

	var timerCallback = function (media, fx, settings) {
		if (!media.playing()) {
			return false;
		}

		media.canvas_context.drawImage(media.element, 0, 0, media.canvas.width, media.canvas.height);

		if (typeof fx == 'string' && $.isFunction(effects[fx])) {
			$.proxy(effects[fx], media)(settings);
		} else if ($.isFunction(fx)) {
			$.proxy(fx, media)(settings);
		}

		setTimeout(function () {
			timerCallback(media, fx, settings);
		});
	};

	$media.extend('toCanvas', function (canvas, fx, settings) {
		this.$canvas = $(canvas);
		this.canvas = $(canvas).get(0);
		this.canvas_context = this.canvas.getContext('2d');

		this.play(function () {
			this.ready(1, function () {
				this.canvas.width = this.width();
				this.canvas.height = this.height();

				timerCallback(this, fx, settings);
			});
		});
	});
})(jQuery);