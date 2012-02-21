/**
 * $media.tracks (2.0)
 *
 * Require:
 * $media
 * $media.timeline
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com)
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
					in: time[1],
					out: time[2],
					settings: settings,
					content: lines.join('<br>')
				});
			});

			return parse;
		},
		fn: function (point) {
			this.point = point.num;

			point.trackElement = $('<div>' + point.data.point.content + '</div>').appendTo(this.settings.target);
		},
		fn_out: function (point) {
			point.trackElement.remove();
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
		this.settings = {};

		if (!settings.target) {
			settings.target = $('<div class="track_' + this.kind + '"></div>').insertAfter(this.media.$element);
		}

		this.setSettings(settings);

		//Channel
		if (settings.channel) {
			this.channel = this.media.getChannel(settings.channel, true);
		} else {
			var date = new Date;
			this.channel = this.media.createChannel(this.kind + date.getTime());
		}

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

			this.channel.removeAllPoints();

			var that = this;

			$.get(source, function (text) {
				that.points = helpers.parseWebSRT(text);

				var points = [];

				$.each(that.points, function (index, point) {
					points.push({
						time: [point.in, point.out],
						point: point,
						fn: helpers.fn,
						fn_out: helpers.fn_out,
						proxy: that
					});
				});

				that.channel.addPoint(points);

				if ($.isFunction(that.settings.load)) {
					$.proxy(that.settings.load, that)();
				}
			});
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
			this.channel.enable();

			return this;
		},

		
		/**
		 * function disable ()
		 *
		 * Disable the track
		 */
		disable: function () {
			this.channel.disable();

			return this;
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
				this.media.seek(point.in);
				this.point = point.num;
			}

			return this;
		}
	};


	$media.extend('getTrack', function (element, settings) {
		var $element = $(element).eq(0);

		if (!$element.is('track')) {
			return false;
		}

		if ($.isFunction(settings)) {
			settings = {load: settings};
		}

		settings = settings || {};

		return new track($element.get(0), this, settings);
	});
})(jQuery);