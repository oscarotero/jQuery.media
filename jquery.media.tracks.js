/**
 * $media.tracks plugin for jQuery.media plugin (v.1.2)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.tracks is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {
	$media.plugins.tracks = function (media, settings) {
		this.media = media;
		this.settings = {subtitles: {}, chapters: {}};
		this.tracks = {subtitles: {}, chapters: {}};

		this.chapters = {};
		this.current_chapters = {};

		var that = this;
		
		//Settings
		if (settings) {
			$.each(settings, function (type, setting) {
				that.settingsFor(type, setting);
			});
		}
	}

	$media.plugins.tracks.prototype = {
		
		/**
		 * function settingsFor (type, [settings])
		 *
		 * Get/Set the settings for a kind of track
		 */
		settingsFor: function (type, settings) {
			if (settings == undefined) {
				return this.settings[type];
			}

			if (!this.settings[type]) {
				return false;
			}

			$.extend(this.settings[type], settings);
		},


		/**
		 * function load (elements, [callback])
		 *
		 * Load a track in the video
		 */
		load: function (elements, callback) {
			var that = this;

			$(elements).each(function () {
				that.dataOf(this, function (data, $element) {
					this.setTrack($element, callback);
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
			});
		},


		/**
		 * function dataOf (element, callback)
		 *
		 * Get the data of points of a track element
		 */
		dataOf: function (element, callback) {
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

				this.media.loadWebSRT($element.attr('src'), function (parsed) {
					$element.data('parsed_data', parsed);
					$.proxy(callback, that)(parsed, $element);
				});
			}
		},


		/**
		 * function setTrack ($element, [callback])
		 *
		 * Set a track element
		 */
		setTrack: function ($element, callback) {
			var channel = $element.data('channel_name');

			if (this.media.enabledChannel(channel)) {
				return false;
			}

			switch ($element.attr('kind')) {
				case 'subtitles':
					this.setSubtitles($element);
					break;

				case 'chapters':
					this.setChapters($element);
					break;
			}

			if ($.isFunction(callback)) {
				$.proxy(callback, this)($element);
			}
		},


		/**
		 * function unsetTrack ($element, [callback])
		 *
		 * Set a track element
		 */
		unsetTrack: function ($element, callback) {
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

			if ($.isFunction(callback)) {
				$.proxy(callback, this)($element);
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
			var timeline = [];

			$.each(data, function (index, point) {
				that.tracks.subtitles[channel][point.num] = point.start;

				timeline.push({
					time: [point.start, point.end],
					channel: channel,
					data: [that.settings.subtitles.target, channel, point],
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
			var timeline = [];

			$.each(data, function (index, point) {
				that.tracks.chapters[channel][point.id] = point.start;

				timeline.push({
					time: [point.start, point.end],
					channel: channel,
					data: [channel, point],
					fn: that.startChapter,
					fn_out: that.endChapter,
					proxy: that
				});
			});

			that.media.createChannel(channel, true);
			that.media.timeline(timeline);
		},
		startChapter: function (ms, channel, point) {
			if (!this.current_chapters[channel]) {
				this.current_chapters[channel] = {};
			}

			this.current_chapters[channel][point.num] = point;

			if ($.isFunction(this.settings.chapters.start)) {
				$.proxy(this.settings.chapters.start, this)(point);
			};
		},
		endChapter: function (ms, channel, point) {
			if (this.current_chapters[channel]) {
				delete this.current_chapters[channel][point.num];
			}

			if ($.isFunction(this.settings.chapters.end)) {
				$.proxy(this.settings.chapters.end, this)(point);
			};
		},
		seekTo: function (element, position) {
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
				position *= -1;
			}

			var point = this.media.getPoints(ms, reverse, channel, position, 1)[0];

			if (point) {
				this.media.seek(point.ms[0]);
			}
		}
	};
})(jQuery);