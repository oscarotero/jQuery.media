/**
 * $media.tracks (2.1)
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
	'use strict';

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
					'num': num++,
					'id': id,
					'in': time[1],
					'out': time[2],
					'settings': settings,
					'content': lines.join('<br>')
				});
			});

			return parse;
		},

		fn: function (dataPoint, dataTimeline) {
			if (!dataTimeline.target) {
				dataTimeline.target = $('<div class="track_' + dataTimeline.track.attr('kind') + '"></div>').insertAfter(this.$element);
			}

			dataPoint.trackElement = $('<div>' + dataPoint.content + '</div>').appendTo(dataTimeline.target);
		},

		fn_out: function (dataPoint, dataTimeline) {
			dataPoint.trackElement.remove();
		}
	}


	$media.extend('setTimelineFromTweens', function (name, options) {
		options = options || {};
		options.data = options.data || {};

		options.data.target = $(options.target);

		if (!options.data.target.length) {
			return false;
		}

		this.setTimeline(name, options);

		var points = options.points;

		var moveTo = function (event, time) {
			if (!points[0]) {
				return;
			}

			do {
				var point = points.shift();
			} while (point.time < time);

			if (point)
		}

		this.playing(moveTo);

		$.get(options.data.track.attr('src'), function (text) {
			var result = helpers.parseWebSRT(text);
			var points = [];

			$.each(result, function (index, point) {
				points.push({
					time: [point.in, point.out],
					fn: helpers.fn,
					fn_out: helpers.fn_out,
					data: point
				});
			});

			media.setTimelinePoints(name, points);
		});

		return this;
	});
})(jQuery);