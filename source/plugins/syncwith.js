/**
 * $media.syncWith jQuery plugin (beta)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.toCanvas is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */

(function ($) {
	var syncReady = function (medias, state) {
		var sync_ready = true;

		$.each(medias, function (i, media) {
			if (!media.ready(state)) {
				sync_ready = false;
				return false;
			}
		});

		return sync_ready;
	}

	var synchronize = function (event, time) {
		var that = this;

		$.each(that.sync, function (i, sync) {
			if (sync.media.seeking()) {
				return;
			}

			var sync_offset = sync.offset + time;
			var sync_time = sync.media.time();

			if (sync_time > (sync_offset + 0.1) || sync_time < (sync_offset - 0.1)) {
				sync.media.seek(sync_offset + 0.1);
			}

			if (that.playing()) {
				sync.media.play();
			} else {
				sync.media.pause();
			}
		});
	}

	$media.extend('syncWith', function (media, offset) {
		offset = offset ? offset.toSeconds() : 0;

		if ($.isArray(this.sync)) {
			this.sync.push({
				media: media,
				offset: offset
			});

			return this;
		}

		this.sync = [];

		this.sync.push({
			media: media,
			offset: offset
		});

		this.bind('mediaPlay mediaPause mediaPlaying', synchronize);

		this.syncReady(function () {
			$.proxy(synchronize, this)(null, this.time());
		});

		return this;
	});

	$media.extend('unSyncWith', function (media) {
		if (!media) {
			this.sync = [];
		} else if ($.isArray(this.sync) && this.sync.length) {
			for (var i = 0; i < this.sync.length; i++) {
				if (this.sync[i].media.$element.is(media.$element)) {
					this.sync.splice(i, 1);
					break;
				}
			}
		} else {
			return this;
		}

		if (!this.sync.length) {
			this.unbind('mediaPlay mediaPause mediaPlaying', synchronize);
		}

		return this;
	});

	$media.extend('syncReady', function (state, fn) {
		if (typeof state != 'number') {
			fn = state;
			state = 3;
		}

		var medias = [this];

		$.each(this.sync, function (i, media) {
			medias.push(media.media);
		});

		if (!$.isFunction(fn)) {
			return syncReady(medias, state);
		}

		if (syncReady(medias, state)) {
			$.proxy(fn, this)();
		} else {
			var that = this;
			var ready = function () {
				if (syncReady(medias, state)) {
					clearInterval(interval_ready);
					$.proxy(fn, that)();
				}
			}

			var interval_ready = setInterval($.proxy(ready, that), 13);
		}

		return this;
	});
})(jQuery);