/**
 * $media.tracks plugin for jQuery.media plugin (beta)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.tracks is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {

	//Helpers
	var helpers = {
		parseWebSRT: function (text) {
			var pieces = $.trim(text).replace(/\r/gm, "").split("\n\n");
			var parse = [];
			var num = 0;

			$.each(pieces, function (index, piece) {
				var lines = piece.split("\n");
				var id = '';

				if (lines[0].indexOf(' --> ') == -1) {
					id = $.trim(lines.shift());
				}

				var line = $.trim(lines.shift());
				var time = line.match(/^([0-9:\.,]+) --> ([0-9:\.,]+)(.*)?$/);
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
		},
		startPoint: function (point) {
			$(this.settings.target).append('<div id="track-' + this.kind + '-' + this.channel + '-' + point.num + '">' + point.content + '</div>');
		},
		endPoint: function (point) {
			$('#track-' + this.kind + '-' + this.channel + '-' + point.num).remove();
		}
	}


	//Track class constructor
	var track = function (element, media, settings) {
		this.media = media;
		this.element = element;
		this.$element = $(element);
		this.kind = this.$element.attr('kind');
		this.point = false;

		//Settings
		this.settings = {
			start: helpers.startPoint,
			end: helpers.endPoint
		};

		this.setSettings(settings);

		//Load data
		this.source(this.$element.attr('src'));
	}

	track.prototype = {
		/**
		 * function source ()
		 *
		 * Initialize the media timeline using the data
		 */
		source: function (source) {
			if (!source) {
				return this.$element.attr('src');
			}

			var that = this;

			$.get(source, function (text) {
				that.points = helpers.parseWebSRT(text);
				that.setTimeline();

				if (that.settings.enable) {
					that.enable();
				}

				if ($.isFunction(that.settings.load)) {
					$.proxy(that.settings.load, that)();
				}
			});
		},

		/**
		 * function setTimeline ()
		 *
		 * Initialize the media timeline using the data
		 */
		setTimeline: function () {
			//Empty previous channel
			if (this.channel) {
				this.media.removeChannel(this.channel);
			}

			//Channel name
			var date = new Date;
			this.channel = this.kind + date.getTime();

			if (this.media.channels[this.channel]) {
				return false;
			}

			var that = this;
			var timeline = [];

			$.each(this.points, function (index, point) {
				timeline.push({
					time: [point.start, point.end],
					data: [point],
					fn: that.startPoint,
					fn_out: that.endPoint,
					proxy: that
				});
			});

			that.media.createChannel(this.channel);
			that.media.timeline(timeline, this.channel);
		},


		/**
		 * function getSettings (name)
		 *
		 * Get the track settings
		 */
		getSettings: function (name) {
			if (name == undefined) {
				return this.settings;
			}

			if (typeof name == 'string') {
				return this.settings[name];
			}
		},


		/**
		 * function setSettings (name, value)
		 *
		 * Set the track settings
		 */
		setSettings: function (name, value) {
			if (typeof name == 'string') {
				this.settings[name] = value;
				return this;
			}

			if (typeof name == 'object') {
				$.extend(this.settings, name);
				return this;
			}

			return this;
		},


		/**
		 * function enable ()
		 *
		 * Enable the track
		 */
		enable: function () {
			if (!this.media.enabledChannel(this.channel)) {
				this.media.enableChannel(this.channel, true);
				this.setSettings('enable', true);
			}

			return this;
		},

		
		/**
		 * function disable ()
		 *
		 * Disable the track
		 */
		disable: function () {
			if (this.media.enabledChannel(this.channel)) {
				this.media.enableChannel(this.channel, false);
				this.setSettings('enable', false);
			}

			return this;
		},

		
		/**
		 * function startPoint (ms, point)
		 *
		 * The function executed when the media enter to a point
		 */
		startPoint: function (ms, point) {
			this.point = point.num;

			$.proxy(this.settings.start, this)(point);
		},

		
		/**
		 * function endPoint (ms, point)
		 *
		 * The function executed when the media leaves a point
		 */
		endPoint: function (ms, point) {
			$.proxy(this.settings.end, this)(point);
		},

		
		/**
		 * function getPoint ([position])
		 *
		 * Get the current point or another one
		 */
		getPoint: function (position) {
			if (position == undefined) {
				return this.points[this.point];
			}

			if (typeof position == 'string' && (position.indexOf('+') === 0 || position.indexOf('-') === 0)) {
				var string = position;

				position = parseInt(string.substr(1), 10);

				if (string.indexOf('-') === 0) {
					position = -position;
				}
			}

			if (typeof position == 'number') {
				position += this.point;
				return this.points[position];
			}

			if (typeof position == 'string') {
				for (var i in this.points) {
					if (this.points[i].id == position) {
						return this.points[i];
					}
				}
			}

			return false;
		},

		
		/**
		 * function seek ([position])
		 *
		 * Seek to a point
		 */
		seek: function (position) {
			var point = this.getPoint(position);

			if (point) {
				this.media.seek(point.start);
				this.point = point.num;
			}

			return this;
		}
	};



	//Track plugin
	$media.plugins.tracks = function (media, settings) {
		this.media = media;
		this.settings = {};

		settings = settings || {};
		var kinds = ['subtitles', 'chapters', 'descriptions', 'captions'];

		for (var i in kinds) {
			this.settings[kinds[i]] = {};

			if (settings[kinds[i]]) {
				$.extend(this.settings[kinds[i]], settings[kinds[i]]);
			}

			if (!this.settings[kinds[i]].target) {
				this.settings[kinds[i]].target = $('<div class="track_' + kinds[i] + '"></div>').insertAfter(this.media.$element);
			}
		}
	}

	$media.plugins.tracks.prototype = {

		/**
		 * function load (element, [settings])
		 *
		 * Loads a track from the video and returns the track object
		 */
		load: function (element, settings) {
			var $element = $(element).eq(0);
			var kind = $element.attr('kind');

			if (!$element.is('track') || !this.settings[kind]) {
				return false;
			}

			if ($.isFunction(settings)) {
				settings = {load: settings};
			}

			settings = settings || {};

			return new track($element.get(0), this.media, $.extend({}, this.settings[kind], settings));
		}
	}
})(jQuery);