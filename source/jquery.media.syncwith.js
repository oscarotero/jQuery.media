/**
 * $media.syncWith jQuery plugin (beta)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.toCanvas is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

var n = 0;
(function ($) {
	var inRange = function (time, interval) {
		if (time > (interval + 20) || time < (interval - 20)) {
			return false
		}

		return true;
	}

	var syncInit = function (media) {
		media.synced = true;
		media.syncDirection = false;
		media.syncParents = [];
		media.syncChildren = [];

		media.bind('play pause', function (event, time) {
			var options = {
				time: this.time(),
				event: event.type
			}

			if ((!this.syncDirection || this.syncDirection == 'children') && this.syncChildren.length) {
				recursiveSync(this.syncChildren, 'children', options);
			}

			if ((!this.syncDirection || this.syncDirection == 'parents') && this.syncParents.length) {
				recursiveSync(this.syncParents, 'parents', options);
			}
		});
	}

	var recursiveSync = function (medias, direction, options) {
		$.each(medias, function (index, media) {
			media.media.syncDirection = direction;

			var sync_time = options.time + media.offset;

			if (!inRange(media.media.time(), sync_time)) {
				media.media.seek(sync_time);
			}

			switch (options.event) {
				case 'play':
					media.media.play();
					break;
				
				case 'pause':
					media.media.pause();
					break;
			}

			media.media.syncDirection = false;
		});
	}




	$media.extend('syncWith', function (media, offset) {
		if (offset) {
			offset = offset.toMiliseconds();
		} else {
			offset = 0;
		}

		if (!this.synced) {
			syncInit(this);
		}

		this.syncChildren.push({
			media: media,
			offset: offset
		});

		if (!media.synced) {
			syncInit(media);
		}

		media.syncParents.push({
			media: this,
			offset: (offset * -1)
		});

		return this;
	});
})(jQuery);