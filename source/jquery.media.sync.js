/**
 * $media.sync (2.0)
 *
 * Require:
 * $media
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media.sync is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function ($) {
	'use strict';

	var syncReadyState = function (medias, state) {
		var sync_ready = true;

		$.each(medias, function (i, media) {
			if (!media.readyState(state)) {
				return sync_ready = false;
			}
		});

		return sync_ready;
	};

	var synchronize = function (event) {
		var that = this, time = this.time();

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
	};

	window.$media.extend({
		syncWith: function (media, offset) {
			offset = offset ? offset.toSeconds() : 0;

			if ($.isArray(this.sync) && this.sync.length) {
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

			this.on('play pause timeupdate', synchronize);

			this.syncReadyState(3, function () {
				$.proxy(synchronize, this)(null, this.time());
			});

			return this;
		},

		unSyncWith: function (media) {
			if (!media) {
				this.sync = [];
			} else if ($.isArray(this.sync) && this.sync.length) {
				var i;
				
				for (i = 0; i < this.sync.length; i++) {
					if (this.sync[i].media.$element.is(media.$element)) {
						this.sync.splice(i, 1);
						break;
					}
				}
			} else {
				return this;
			}

			if (!this.sync.length) {
				this.off('play pause playing', synchronize);
			}

			return this;
		},

		syncReadyState: function (state, fn) {
			var medias = [this];

			$.each(this.sync, function (i, media) {
				medias.push(media.media);
			});

			if (!$.isFunction(fn)) {
				return syncReadyState(medias, state);
			}

			if (syncReadyState(medias, state)) {
				$.proxy(fn, this)();
			} else {
				var that = this, interval_ready;

				var ready = function () {
					if (syncReadyState(medias, state)) {
						clearInterval(interval_ready);
						$.proxy(fn, that)();
					}
				};

				interval_ready = setInterval($.proxy(ready, that), 13);
			}

			return this;
		}
	});
})(jQuery);