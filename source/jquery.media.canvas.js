/**
 * $media.canvas (2.0)
 *
 * Require:
 * $media 2.x
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.toCanvas is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

(function ($) {
	'use strict';
	
	var timerCallback = function (media, settings, width, height) {
		if (!media.playing()) {
			return false;
		}

		media.canvas_context.drawImage(media.element, 0, 0, width, height);
		settings.manipulation.apply(media, [media.canvas_context, width, height]);

		setTimeout(function () {
			timerCallback(media, settings, width, height);
		}, (settings.fps ? (1000/settings.fps) : 0));
	};

	window.$media.extend('toCanvas', function (canvas, settings) {
		settings = ($.isFunction(settings)) ? { manipulation: settings } : (settings || {});
		settings = $.extend({manipulation: $.noop}, settings);

		this.$canvas = $(canvas);

		if (this.$canvas.data('toCanvas')) {
			$.error('The canvas just have a video related');
			return this;
		}

		this.$canvas.data('toCanvas', true);

		this.canvas = $(canvas).get(0);
		this.canvas_context = this.canvas.getContext('2d');

		this.on('play seeked', function () {
			this.readyState(1, function () {
				var width = this.canvas.width = this.width(true);
				var height = this.canvas.height = this.height(true);

				timerCallback(this, settings, width, height);
			});
		}).remove(function () {
			this.$canvas.removeData('toCanvas');
		});

		return this;
	});

	window.$media.extend('getScreenShot', function (format) {
		var canvas = $('<canvas></canvas>').get(0);

		var width = canvas.width = this.width(true);
		var height = canvas.height = this.height(true);

		canvas.getContext('2d').drawImage(this.element, 0, 0, width, height);

		if (format === 'canvas') {
			return canvas;
		} else {
			return canvas.toDataURL("image/png");
		}
		
	});
})(window.jQuery);