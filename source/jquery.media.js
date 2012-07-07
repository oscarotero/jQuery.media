/**
 * $media jQuery plugin (v.1.3.1)
 *
 * 2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function ($) {
	'use strict';

	//Detect device
	var device = navigator.userAgent.toLowerCase();

	if (device.match(/(iphone|ipod|ipad)/)) {
		device = 'ios';
	} else {
		device = 'browser';
	}

	window.$media = function (element) {
		this.element = element;
		this.$element = $(element);

		if (this.$element.is('video')) {
			this.type = 'video';
		} else if (this.$element.is('audio')) {
			this.type = 'audio';
		}
	};



	/**
	 * function get ()
	 *
	 * Returns the html media element
	 */
	window.$media.prototype.get = function () {
		return this.element;
	};



	/**
	 * function jQuery ()
	 *
	 * Returns the jquery object
	 */
	window.$media.prototype.jQuery = function () {
		return this.$element;
	};



	/**
	 * function canPlay ([source])
	 *
	 * Check if the browser can play the media
	 */
	window.$media.prototype.canPlay = function (source) {
		var length, result, r, i;

		if (!(this.element.canPlayType)) {
			return false;
		}

		if (source === undefined) {
			if (this.source()) {
				source = this.source();
				return this.canPlay((source.substring(source.lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0]);
			}

			source = this.sources();

			length = source.length;
			result = 0;

			for (i = 0; i < length; ++i) {
				r = this.canPlay((source[i].substring(source[i].lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0]);
				result = (r > result) ? r : result;
			}

			return result;
		}

		if (/^[a-z0-9]+$/i.test(source)) {
			source = this.mimeType(source);
		}

		switch (this.element.canPlayType(source)) {
			case 'probably':
				return 2;

			case 'maybe':
				return 1;
		}

		return 0;
	};


	/**
	 * function mimeType (ext)
	 *
	 * Get the source type
	 */
	window.$media.prototype.mimeType = function (ext) {
		switch (ext) {
			case 'mp4':
			case 'acc':
				return this.type + '/mp4';

			case 'ogg':
			case 'ogv':
				return this.type + '/ogg';

			case 'webm':
				return this.type + '/webm';

			case 'mp3':
				return this.type + '/mpeg';

			case 'wav':
				return this.type + '/wav';
		}
	};


	/**
	 * function sources ([sources], [autoload])
	 *
	 * Get or set source values
	 */
	window.$media.prototype.sources = function (sources, autoload) {
		var $media = this.$element;

		//Getter
		if (sources === undefined) {
			var src = [];

			if ($media.attr('src')) {
				src.push($media.attr('src'));
			}

			$media.find('source').each(function () {
				src.push($(this).attr('src'));
			});

			return src;
		}

		//Setter
		$media.find('source').remove();

		if (typeof sources === 'string') {
			$media.attr('src', sources);
		} else {
			if (!$.isArray(sources)) {
				sources = [sources];
			}

			$media.removeAttr('src');

			var that = this;

			$.each(sources, function (k, source) {
				if (typeof source !== 'object') {
					source = {src: source};
				}

				if (!source.type) {
					var ext = (source.src.substring(source.src.lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0];
					source.type = that.mimeType(ext);
				}

				$('<source>', source).appendTo($media);
			});
		}

		//Autoload
		if (autoload !== false) {
			this.element.load();
		}

		return this;
	};


	/**
	 * function source ()
	 *
	 * Get the current source value
	 */
	window.$media.prototype.source = function () {
		return this.element.currentSrc;
	};


	/**
	 * function attr (name, [value])
	 *
	 * Get or set media attributes
	 */
	window.$media.prototype.attr = function (name, value) {
		if (name === 'src' || name === 'sources') {
			return this.sources(value);
		}

		if (value === undefined) {
			return this.$element.attr(name);
		}

		this.$element.attr(name, value);

		return this;
	};


	/**
	 * function prop (name, [value])
	 *
	 * Get or set media properties
	 */
	window.$media.prototype.prop = function (name, value) {
		if (value === undefined) {
			return this.$element.prop(name);
		}

		this.$element.prop(name, value);

		return this;
	};


	/**
	 * function width (videoWidth)
	 *
	 * Get or set the width value
	 */
	window.$media.prototype.width = function (videoWidth) {
		if (videoWidth === true) {
			return this.element.videoWidth;
		}

		if (videoWidth === undefined) {
			return this.$element.width();
		}

		this.$element.width(videoWidth);

		return this;
	};


	/**
	 * function height (videoHeight)
	 *
	 * Get or set the height value
	 */
	window.$media.prototype.height = function (videoHeight) {
		if (videoHeight === true) {
			return this.element.videoHeight;
		}

		if (videoHeight === undefined) {
			return this.$element.height();
		}

		this.$element.height(videoHeight);

		return this;
	};


	/**
	 * function play (fn)
	 * function play ()
	 *
	 * Plays media or bind a function to play event
	 */
	window.$media.prototype.play = function (fn) {
		if ($.isFunction(fn)) {
			this.on('play', fn);
		} else if (this.element.paused) {
			this.element.play();
		}

		return this;
	};


	/**
	 * function fullScreen (fn)
	 * function fullScreen (bool)
	 * function fullScreen ()
	 *
	 * Toggles fullscreen mode or binds a function to fullscreen event
	 * This method works only in webkit and mozilla platforms
	 */
	window.$media.prototype.fullScreen = function (fn) {
		if ($.isFunction(fn)) {
			this.on('fullScreen', fn);
			return this;
		}

		if (fn === false) {
			if ($.isFunction(document.webkitCancelFullScreen)) {
				document.webkitCancelFullScreen();
			} else if ($.isFunction(document.mozCancelFullScreen)) {
				document.mozCancelFullScreen();
			}
		} else if (fn === true) {
			if ($.isFunction(this.element.webkitRequestFullScreen)) {
				this.element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			} else if ($.isFunction(this.element.mozRequestFullScreen)) {
				this.element.mozRequestFullScreen();
			}
		} else {
			if (document.mozFullScreen || document.webkitIsFullScreen) {
				this.fullScreen(false);
			} else {
				this.fullScreen(true);
			}
		}

		return this;
	};


	/**
	 * function playing (fn)
	 * function playing ()
	 *
	 * Return if the media is playing or bind a function to playing event
	 */
	window.$media.prototype.playing = function (fn) {
		if ($.isFunction(fn)) {
			this.on('playing', fn);

			return this;
		}

		return (this.element.paused || this.element.ended) ? false : true;
	};


	/**
	 * function waiting (fn)
	 * function waiting ()
	 *
	 * Return if the media is waiting or bind a function to waiting event
	 */
	window.$media.prototype.waiting = function (fn) {
		if ($.isFunction(fn)) {
			this.on('waiting', fn);

			return this;
		}

		return (this.element.readyState > 2) ? false : true;
	};


	/**
	 * function pause (fn)
	 * function pause ()
	 *
	 * Pauses media or bind a function to pause event
	 */
	window.$media.prototype.pause = function (fn) {
		if ($.isFunction(fn)) {
			this.on('pause', fn);
		} else if (!this.element.paused) {
			this.element.pause();
		}

		return this;
	};


	/**
	 * function playPause (fn)
	 * function playPause ()
	 *
	 * Play the media if it's paused or pause if it's playing media or bind a function to playPause event
	 */
	window.$media.prototype.playPause = function (fn) {
		if ($.isFunction(fn)) {
			this.on('playPause', fn);
		} else {
			if (this.element.paused) {
				this.play();
			} else {
				this.pause();
			}

			this.trigger('playPause', [this.element.paused]);
		}

		return this;
	};


	/**
	 * function stop (fn)
	 * function stop ()
	 *
	 * Stops media (pause and go to start) or bind a function to stop event
	 */
	window.$media.prototype.stop = function (fn) {
		if ($.isFunction(fn)) {
			this.on('stop', fn);
		} else {
			this.pause().reload();

			this.trigger('stop');
		}

		return this;
	};


	/**
	 * function end (fn)
	 * function end ()
	 *
	 * Goes to the end of the media or bind a function to end event
	 */
	window.$media.prototype.end = function (fn) {
		if ($.isFunction(fn)) {
			this.bind('end', fn);
		} else {
			this.pause().seek(this.element.duration);
		}

		return this;
	};


	/**
	 * function remove (fn)
	 * function remove ()
	 *
	 * Removes the video/audio element or bind a function to remove event
	 */
	window.$media.prototype.remove = function (fn) {
		if ($.isFunction(fn)) {
			this.on('remove', fn);
			return this;
		}

		this.trigger('remove');

		this.$element.remove();

		var prop;

		for (prop in this) {
			if (this.hasOwnProperty(prop)) {
				this[prop] = {};
			}
		}
	};


	/**
	 * function seek (fn)
	 * function seek (time)
	 *
	 * Seek for specific point of media or bind a function to seek event
	 */
	window.$media.prototype.seek = function (fn) {
		if ($.isFunction(fn)) {
			this.on('seek', fn);
		} else {
			this.ready(1, function () {
				var time = this.time(fn);

				if (this.element.currentTime !== time) {
					this.element.currentTime = time;
				}
			});
		}

		return this;
	};


	/**
	 * function seeking (fn)
	 *
	 * Bind a function to seeking event or trigger the event
	 */
	window.$media.prototype.seeking = function (fn) {
		if ($.isFunction(fn)) {
			this.on('seeking', fn);

			return this;
		}

		return this.element.seeking;
	};


	/**
	 * function volume (fn)
	 * function volume (vol)
	 * function volume ()
	 *
	 * Set a volume value of media, bind a function to volume event or return the current value (in 1-0 range)
	 */
	window.$media.prototype.volume = function (fn) {
		if (device === 'ios') {
			return this;
		}

		if (fn === undefined) {
			return this.element.volume;
		}

		if ($.isFunction(fn)) {
			this.on('volume', fn);
		} else {
			this.element.volume = fn;
		}

		return this;
	};


	/**
	 * function mute (fn)
	 * function mute (mute)
	 * function mute ()
	 *
	 * Mute or unmute the media or bind a function to mute event
	 */
	window.$media.prototype.mute = function (fn) {
		if (device === 'ios') {
			return this;
		}

		if ($.isFunction(fn)) {
			this.bind('mute', fn);
		} else {
			if (typeof fn === 'boolean') {
				this.element.muted = fn;
			} else {
				this.element.muted = this.element.muted ? false : true;
			}

			this.trigger('mute', [this.element.muted]);
		}

		return this;
	};


	/**
	 * function on (event, fn)
	 *
	 * Bind a function to specific event
	 */
	window.$media.prototype.on = function (event, fn) {
		var registeredEvents = this.$element.data('events') || {}, events = event.split(' '), i, length = events.length;

		fn = $.proxy(fn, this);

		for (i = 0; i < length; i++) {
			switch (events[i]) {
				case 'fullScreen':
					if (!registeredEvents[events[i]]) {
						var that = this;

						$(document).on('mozfullscreenchange', function (e) {
							if (document.mozFullScreenElement && that.$element.is(document.mozFullScreenElement)) {
								that.$element.data('fullScreen', true);
							} else if (that.$element.data('fullScreen')) {
								that.$element.data('fullScreen', false);
							} else {
								return;
							}

							that.trigger('fullScreen', [that.$element.data('fullScreen')]);
						});

						this.on('webkitfullscreenchange', function (e) {
							this.trigger('fullScreen', [document.webkitIsFullScreen]);
						});
					}

					this.$element.bind('fullScreen', fn);
					break;

				case 'end':
					this.$element.bind('ended', fn);
					break;

				case 'playing':
					if (!registeredEvents[events[i]]) {
						this.$element.on('timeupdate', function () {
							if (!this.paused && !this.ended) {
								this.trigger('playing');
							}
						});
					}

					this.$element.bind('playing', fn);
					break;

				case 'seek':
					this.$element.bind('seeked', fn);
					break;

				case 'volume':
					this.$element.bind('volumechange', fn);
					break;

				default:
					this.$element.bind(events[i], fn);
			}
		}

		return this;
	};



	/**
	 * function off (event, fn)
	 *
	 * Unbind a function to specific event
	 */
	window.$media.prototype.off = function (event, fn) {
		if (fn) {
			this.$element.unbind(event, $.proxy(fn, this));
		} else {
			this.$element.unbind(event);
		}

		return this;
	};


	/**
	 * function trigger (event, [data])
	 *
	 * Trigger an event
	 */
	window.$media.prototype.trigger = function (event, data) {
		this.$element.trigger(event, data);

		return this;
	};


	/**
	 * function time (time)
	 *
	 * Return the current time of the media in time or a specific point
	 */
	window.$media.prototype.time = function (time) {
		if (time === undefined) {
			return this.element.currentTime.toSeconds();
		}

		if (isNaN(parseInt(time, 10))) {
			return 0;
		}

		time = '' + time;

		var int_time = 0;

		if (time.indexOf('+') === 0 || time.indexOf('-') === 0) {
			var sum = time.substr(1).toSeconds();

			if (time.indexOf('-') === 0) {
				sum = -sum;
			}

			if (time.indexOf('%') === -1) {
				int_time = sum + this.element.currentTime.toSeconds();
			} else {
				int_time = Math.round((this.totalTime() / 100) * parseInt(sum, 10)) + this.element.currentTime.toSeconds();
			}
		} else if (time.indexOf('%') !== -1) {
			int_time = Math.round((this.totalTime() / 100) * time.toSeconds());
		} else {
			int_time = time.toSeconds();
		}

		if (int_time < 0) {
			int_time = 0;
		} else if (int_time > this.totalTime()) {
			int_time = this.totalTime();
		}

		return int_time;
	};


	/**
	 * function totalTime ()
	 *
	 * Return the media duration in seconds
	 */
	window.$media.prototype.totalTime = function (fn) {
		if (!$.isFunction(fn)) {
			return this.element.duration.toSeconds();
		}

		return this.ready(1, function () {
			$.proxy(fn, this)(this.element.duration.toSeconds());
		});
	};


	/**
	 * function ready ([state], fn)
	 * function ready (fn)
	 *
	 * Return if the video is ready to play
	 */
	window.$media.prototype.ready = function (state, fn) {
		if (typeof state !== 'number') {
			fn = state;
			state = 3;
		}

		if (!$.isFunction(fn)) {
			return (this.element.readyState < state) ? false : true;
		}

		if (this.element.readyState >= state) {
			$.proxy(fn, this)();
		} else {
			var that = this;
			setTimeout(function () {
				that.ready(state, fn);
			}, 13);
		}

		return this;
	};


	/**
	 * function reload ()
	 *
	 * Reload the video
	 */
	window.$media.prototype.reload = function () {
		this.sources(this.sources());

		return this;
	};


	/**
	 * function extend (name, value)
	 * function extend (object)
	 *
	 * Extends $media with other functions
	 */
	window.$media.prototype.extend = function (name, value) {
		if (typeof name !== 'object') {
			var k = name;
			name = {};
			name[k] = value;
		}

		$.extend(this, name);
	};


	/**
	 * function extend (name, value)
	 * function extend (object)
	 *
	 * Extends $media with other functions
	 */
	window.$media.extend = function (name, value) {
		if (typeof name !== 'object') {
			var k = name;
			name = {};
			name[k] = value;
		}

		$.each(name, function (k, v) {
			window.$media.prototype[k] = v;
		});
	};



	/**
	 * function jQuery.media (selector, properties)
	 *
	 * Creates and returns a new $media object
	 */
	$.media = function (selector, properties) {
		if (properties) {
			var src;

			if (properties.src) {
				src = properties.src;
				delete(properties.src);
			}

			selector = $(selector, properties);

			var media = new window.$media(selector.get(0));

			if (src) {
				media.sources(src);
			}

			return media;
		}

		selector = $(selector);

		if (!selector.is('video, audio')) {
			selector = selector.find('video, audio');
		}

		return new window.$media(selector.get(0));
	};


	/**
	 * function jQuery.mediaVideo (properties)
	 *
	 * Creates a video element and returns a $media object with it
	 */
	$.mediaVideo = function (properties) {
		if (typeof properties === 'string' || $.isArray(properties)) {
			properties = {src: properties};
		}

		return $.media('<video>', properties);
	};


	/**
	 * function jQuery.mediaAudio (properties)
	 *
	 * Creates an audio element and returns a $media object with it
	 */
	$.mediaAudio = function (properties) {
		if (typeof properties === 'string' || $.isArray(properties)) {
			properties = {src: properties};
		}

		return $.media('<audio>', properties);
	};

})(window.jQuery);


/**
 * function String.toSeconds ()
 *
 * Convert any number to seconds
 */
String.prototype.toSeconds = function () {
	'use strict';

	var time = this, ms;

	if (/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}(\.[0-9]+)?(,[0-9]+)?$/.test(time)) {
		time = time.split(':', 3);

		if (time.length === 3) {
			ms = time[2].split(',', 2);
			ms[1] = ms[1] || 0;

			return ((((parseInt(time[0], 10) * 3600) + (parseInt(time[1], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
		}

		ms = time[1].split(',', 1);
		ms[1] = ms[1] || 0;

		return ((((parseInt(time[0], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
	}

	return parseFloat(time).toSeconds();
};


/**
 * function String.secondsTo (outputFormat)
 *
 * Convert a seconds time value to any other time format
 */
String.prototype.secondsTo = function (outputFormat) {
	'use strict';

	return this.toSeconds().secondsTo(outputFormat);
};


/**
 * function Number.toSeconds ()
 *
 * Convert any number to seconds
 */
Number.prototype.toSeconds = function () {
	'use strict';

	return Math.round(this * 1000) / 1000;
};


/**
 * function Number.secondsTo (outputFormat)
 *
 * Convert a seconds time value to any other time format
 */
Number.prototype.secondsTo = function (outputFormat) {
	'use strict';

	var time = this;

	switch (outputFormat) {
		case 'ms':
			return Math.round(time * 1000);

		case 'mm:ss':
		case 'hh:mm:ss':
		case 'hh:mm:ss.ms':
			var hh = '';

			if (outputFormat !== 'mm:ss') {
				hh = Math.floor(time / 3600);
				time = time - (hh * 3600);
				hh += ':';
			}

			var mm = Math.floor(time / 60);
			time = time - (mm * 60);
			mm = (mm < 10) ? ("0" + mm) : mm;
			mm += ':';

			var ss = time;

			if (outputFormat === 'hh:mm:ss') {
				ss = Math.round(ss);
			}
			ss = (ss < 10) ? ("0" + ss) : ss;

			return hh + mm + ss;
	}

	return time;
};