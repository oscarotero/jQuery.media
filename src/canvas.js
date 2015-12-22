'use strict';

define([
	'jquery',
	'./media'
], function ($, Media) {

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

	Media.extend('toCanvas', function (canvas, settings) {
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

	Media.extend('getScreenShot', function (format) {
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
});