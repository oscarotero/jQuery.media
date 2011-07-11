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
			var l = frame.data.length / 4;

			for (var i = 0; i < l; i++) {
				var pixel = {
					r:frame.data[i * 4 + 0],
					g:frame.data[i * 4 + 1],
					b:frame.data[i * 4 + 2],
					a:frame.data[i * 4 + 3]
				}

				settings(pixel);

				frame.data[i * 4 + 0] = pixel.r;
				frame.data[i * 4 + 1] = pixel.g;
				frame.data[i * 4 + 2] = pixel.b;
				frame.data[i * 4 + 3] = pixel.a;
			}

			this.canvas_context.putImageData(frame, 0, 0);

			return;
		},

		blur: function (settings) {
			settings = $.extend({}, {passes: 4, level: 2}, settings);

			var i, x, y;
			var start_pos = -(settings.level - 1);
			var end_pos = settings.level;

			this.canvas_context.globalAlpha = 0.125;

			for (i = 1; i <= settings.passes; i += 1) {
				for (y = start_pos; y < end_pos; y += 1) {
					for (x = start_pos; x < end_pos; x += 1) {
						this.canvas_context.drawImage(this.element, x, y);
					}
				}
			}

			this.canvas_context.globalAlpha = 1.0;
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