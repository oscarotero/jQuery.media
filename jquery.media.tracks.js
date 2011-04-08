/**
 * $media.tracks plugin for jQuery.media plugin (v.1.2)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.tracks is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {

	//Parse WebSRT
	var parseWebSRT = function (text) {
		var pieces = $.trim(text).replace(/\r/gm, "").split("\n\n");
		var parse = [];
		var num = 0;

		$.each(pieces, function (index, piece) {
			var lines = piece.split("\n");
			var id = '';

			if (lines[0].indexOf(' --> ') == -1) {
				id = $.trim(lines.shift());
			}

			var time = /^([0-9:\.,]+) --> ([0-9:\.,]+) ?(.*)?$/g.exec($.trim(lines.shift()));
			var settings = $.trim(time[3]);

			if (settings) {
				var settings_array = settings.split(' ');
				settings = {};

				for (s in settings_array) {
					var s = settings_array[s].split(':', 2);

					s[0] = $.trim(s[0]);
					settings[s[0]] = $.trim(s[1]);
				}
			}

			parse.push({
				num: num++,
				id: id,
				start: time[1],
				end: time[2],
				settings: settings,
				content: lines.join('<br>')
			});
		});

		return parse;
	};

	$media.plugins.tracks = function (media, settings) {
		this.media = media;
		this.default_settings = {subtitles: {}, chapters: {}};
		this.tracks = {subtitles: {}, chapters: {}};

		this.chapters = {};
		this.current_chapters = {};

		var that = this;

		//Settings
		if (settings) {
			$.each(settings, function (type, setting) {
				that.settings(type, setting);
			});
		}
	}

	$media.plugins.tracks.prototype = {

		/**
		 * function settings (type, [settings])
		 *
		 * Get/Set the settings for a kind of track
		 */
		settings: function (type, settings) {
			if (typeof type == 'string' && this.default_settings[type]) {
				if (settings == undefined) {
					return this.default_settings[type];
				}

				$.extend(this.default_settings[type], settings);
			}

			type = $(type).eq(0);
			
			if (!type.length) {
				return false;
			}

			if (typeof settings != 'object') {
				return type.data('settings');
			}

			var current_settings = type.data('settings');

			if (!current_settings) {
				current_settings = {};
			}

			type.data('settings', $.extend(current_settings, settings));
		},


		/**
		 * function load (elements, [callback], [settings])
		 *
		 * Load a track from the video
		 */
		load: function (elements, callback, settings) {
			var that = this;

			$(elements).each(function () {
				that.data(this, function (data, $element) {
					this.setTrack($element, settings);

					if ($.isFunction(callback)) {
						$.proxy(callback, that)(data, $element);
					}
				});
			});
		},


		/**
		 * function unload (elements, [callback])
		 *
		 * Unload a track from the video
		 */
		unload: function (elements, callback) {
			var that = this;

			$(elements).each(function () {
				that.unsetTrack($(this), callback);

				if ($.isFunction(callback)) {
					$.proxy(callback, that)($(this));
				}
			});
		},


		/**
		 * function data (element, callback)
		 *
		 * Get the data of points of a track element
		 */
		data: function (element, callback) {
			var $element = $(element).eq(0);

			if (!$element.length || !$element.is('track')) {
				return false;
			}

			if ($element.data('parsed_data')) {
				$.proxy(callback, this)($element.data('parsed_data'), $element);
			} else {
				var that = this;

				if (!$element.data('channel_name')) {
					var date = new Date;
					$element.data('channel_name', $element.attr('kind') + date.getTime());
				}

				$.get($element.attr('src'), function (text) {
					var parsed = parseWebSRT(text);

					$element.data('parsed_data', parsed);
					$.proxy(callback, that)(parsed, $element);
				});
			}
		},


		/**
		 * function setTrack ($element, settings)
		 *
		 * Set a track element
		 */
		setTrack: function ($element, settings) {
			var channel = $element.data('channel_name');

			if (this.media.enabledChannel(channel)) {
				return false;
			}

			var current_settings = $element.data('settings');

			if (!current_settings) {
				current_settings = {};
			}

			switch ($element.attr('kind')) {
				case 'subtitles':
					this.settings($element, $.extend({}, this.default_settings.subtitles, current_settings, settings));
					this.setSubtitles($element);
					break;

				case 'chapters':
					this.settings($element, $.extend({}, this.default_settings.chapters, current_settings, settings));
					this.setChapters($element);
					break;
			}
		},


		/**
		 * function unsetTrack ($element)
		 *
		 * Set a track element
		 */
		unsetTrack: function ($element) {
			var channel = $element.data('channel_name');

			if (!this.media.enabledChannel(channel)) {
				return false;
			}

			switch ($element.attr('kind')) {
				case 'subtitles':
				case 'chapters':
					this.media.enableChannel(channel, false);
					break;
			}
		},


		/**
		 * function setSubtitles ($element)
		 *
		 * Set new subtitles
		 */
		setSubtitles: function ($element) {
			var channel = $element.data('channel_name');

			if (this.media.channels[channel]) {
				this.media.enableChannel(channel, true);
				return true;
			}

			this.tracks.subtitles[channel] = {};

			var that = this;
			var data = $element.data('parsed_data');
			var settings = $element.data('settings');
			var timeline = [];

			$.each(data, function (index, point) {
				that.tracks.subtitles[channel][point.num] = point.start;

				timeline.push({
					time: [point.start, point.end],
					channel: channel,
					data: [settings.target, channel, point],
					fn: that.showSubtitle,
					fn_out: that.hideSubtitle,
					proxy: that.video
				});
			});

			that.media.createChannel(channel, true);
			that.media.timeline(timeline);
		},
		showSubtitle: function (ms, target, channel, point) {
			$(target).append('<div id="subtitle_' + channel + '_' + point.num + '">' + point.content + '</div>');
		},
		hideSubtitle: function (ms, target, channel, point) {
			$('#subtitle_' + channel + '_' + point.num).remove();
		},



		/**
		 * function setChapters ($element)
		 *
		 * Set new chapters
		 */
		setChapters: function ($element) {
			var channel = $element.data('channel_name');

			if (this.media.channels[channel]) {
				this.media.enableChannel(channel, true);
				return true;
			}

			this.tracks.chapters[channel] = {};

			var that = this;
			var data = $element.data('parsed_data');
			var settings = $element.data('settings');
			var timeline = [];

			$.each(data, function (index, point) {
				that.tracks.chapters[channel][point.id] = point.start;

				timeline.push({
					time: [point.start, point.end],
					channel: channel,
					data: [channel, point, settings],
					fn: that.startChapter,
					fn_out: that.endChapter,
					proxy: that
				});
			});

			that.media.createChannel(channel, true);
			that.media.timeline(timeline);
		},
		startChapter: function (ms, channel, point, settings) {
			if (!this.current_chapters[channel]) {
				this.current_chapters[channel] = {};
			}

			this.current_chapters[channel][point.num] = point;

			if (settings && $.isFunction(settings.start)) {
				$.proxy(settings.start, this)(point);
			};
		},
		endChapter: function (ms, channel, point, settings) {
			if (this.current_chapters[channel]) {
				delete this.current_chapters[channel][point.num];
			}

			if (settings && $.isFunction(settings.end)) {
				$.proxy(settings.end, this)(point);
			};
		},


		seek: function (element, position) {
			var $element = $(element);
			var channel = $element.data('channel_name');
			var type = $element.attr('kind');

			if (!this.tracks[type] || !this.tracks[type][channel] || !this.media.enabledChannel(channel)) {
				console.error('This track is not valid');
				return false;
			}

			if (typeof position == 'string') {
				var point = this.tracks[type][channel][position];

				if (point) {
					this.media.seek(point);
					return true;
				}
				console.error('The id ' + position + ' is not available in this track');
				return false;
			}

			var ms = this.media.time();
			var reverse = false;

			if (typeof position != 'number') {
				position = 0;
			} else if (position < 0) {
				reverse = true;
				position = (position * -1) -1;
			}

			var point = this.media.getPoints(ms, reverse, channel, position, 1)[0];

			if (point) {
				this.media.seek(point.ms[0]);
			}
		}
	};
})(jQuery);