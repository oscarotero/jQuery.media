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

		fn: function (media, timeline) {
			if (!timeline.settings.target) {
				timeline.settings.target = $('<div class="track_' + timeline.settings.track.attr('kind') + '"></div>').insertAfter(media.$element);
			}

			this.trackElement = $('<div>' + this.settings.point.content + '</div>').appendTo(timeline.settings.target);
		},

		fn_out: function (media, point) {
			this.trackElement.remove();
		}
	}

	$media.getTimelineFromTrack = function (track, settings) {
		var track = $(track);
		var settings = settings || {};

		if (!track.length) {
			return false;
		}

		var timeline = new $media.Timeline();

		timeline.settings.track = track;

		$.get(track.attr('src'), function (text) {
			var result = helpers.parseWebSRT(text);
			var points = [];

			$.each(result, function (index, point) {
				points.push({
					time: [point.in, point.out],
					fn: helpers.fn,
					fn_out: helpers.fn_out,
					point: point
				});
			});

			timeline.addPoint(points);

			if ($.isFunction(settings.load)) {
				$.proxy(settings.load, timeline)(timeline.media);
			}
		});

		return timeline;
	};


	$media.extend('getTimelineFromTrack', function (track, settings, name) {
		var timeline = $media.getTimelineFromTrack(track, settings);

		if (!timeline) {
			return false;
		}

		if (!name) {
			name = $.now() + timeline.settings.track.attr('kind');
		}

		this.setTimeline(name, timeline);

		return timeline;
	});
})(jQuery);