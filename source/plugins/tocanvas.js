/**
 * $media.toCanvas jQuery plugin (beta)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.toCanvas is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

(function ($) {
	var timerCallback = function (media, settings, width, height) {
		if (!media.playing()) {
			return false;
		}

		media.canvas_context.drawImage(media.element, 0, 0, width, height);

		if (settings.manipulation) {
			$.proxy(settings.manipulation, media)(media.canvas_context, width, height);
		}

		setTimeout(function () {
			timerCallback(media, settings, width, height);
		}, (settings.fps ? (1000/settings.fps) : 0));
	};

	$media.extend('toCanvas', function (canvas, settings) {
		settings = settings || {};
		this.$canvas = $(canvas);

		if (this.$canvas.data('toCanvas')) {
			console.error('The canvas just have a video related');
			return this;
		}

		this.$canvas.data('toCanvas', true);

		this.canvas = $(canvas).get(0);
		this.canvas_context = this.canvas.getContext('2d');

		this.play(function () {
			this.ready(1, function () {
				var width = this.canvas.width = this.width(true);
				var height = this.canvas.height = this.height(true);

				timerCallback(this, settings, width, height);
			});
		}).remove(function () {
			this.$canvas.removeData('toCanvas');
		});

		return this;
	});
})(jQuery);