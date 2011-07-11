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