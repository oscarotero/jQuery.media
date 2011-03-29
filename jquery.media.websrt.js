/**
 * $media.WebSRT plugin for jQuery plugin (v.1.2)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.WebSRT is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {
	$media.extend({
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
		},

		loadWebSRT: function (url, callback) {
			var that = this;

			$.get(url, function (text) {
				var parsed = that.parseWebSRT(text);
				
				if ($.isFunction(callback)) {
					$.proxy(callback, that)(parsed);
				}
			});
		}
	});
})(jQuery);