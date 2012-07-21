/**
 * $media jQuery plugin (v.1.3.3)
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
	 * Returns the html audio/video element
	 *
	 * @return html element
	 */
	window.$media.prototype.get = function () {
		return this.element;
	};



	/**
	 * Returns the jquery object with the audio/video element
	 *
	 * @return jQuery object
	 */
	window.$media.prototype.jQuery = function () {
		return this.$element;
	};



	/**
	 * Check if the browser can play the source or a specific codec
	 * canPlay();
	 * canPlay('ogg');
	 * canPlay('video/mp4');
	 *
	 * @param source A specific source to check. If it's not defined, checks the element sources
	 *
	 * @return false If the browser doesn't support audio/video element
	 * @return 0 If the browser supports audio/video element but can't play the sources/specific codec
	 * @return 1 If the browser maybe can play
	 * @return 2 If the browser probably can play
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

			source = this.source(true);
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
	 * Get/set the playback rate
	 * If the browser doesn't support playbackRate property does nothing
	 *
	 * @param float playbackRate The new playback rate
	 *
	 * @return this (for setters)
	 * @return float (for getters)
	 */
	$media.prototype.playbackRate = function (playbackRate) {
		//if playbackRate no supported
		if (!('playbackRate' in this.element)) {
			return (playbackRate === undefined) ? 1 : this;
		}

		if (playbackRate === undefined) {
			return this.element.playbackRate;
		}

		this.element.playbackRate = playbackRate;

		return this;
	}



	/**
	 * Gets the source type for a specific extension
	 *
	 * @param string ext The extension (for example 'ogg', 'mp3', etc)
	 *
	 * @return string The mimetype of the extension (for example 'video/ogg').
	 * @return undefined If the extension is not valid.
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
	 * Get/set the sources for the media element
	 *
	 * source();
	 * source('my-video.ogv');
	 * source(['my-video.ogv', 'my-video.mp4']);
	 * source({src: 'my-video.ogv', type: 'video/ogv'});
	 * source([{src: 'my-video.ogv', type: 'video/ogv'}, {src: 'my-video.mp4', type: 'video/mp4'}]);
	 *
	 * @param string/array/object sources The new sources for the element.
	 * @param bool autoload Set to false to disable the automatic autoload for the new sources
	 *
	 * @return string/array (for getter)
	 * @return this (for setter)
	 */
	window.$media.prototype.source = function (sources, autoload) {
		var $media = this.$element;

		//Getter
		if (sources === undefined) {
			return this.element.currentSrc;
		}

		if (sources === true) {
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
	 * Get or set media attributes. It works like attr() jQuery function
	 *
	 * attr('poster');
	 * attr('poster', 'new-poster.jpg');
	 * attr({poster: 'new-poster.jpg'});
	 *
	 * @param string The name of the parameter
	 * @param string The new value of the parameter
	 *
	 * @return mixed (for getter)
	 * @return this (for setter)
	 */
	window.$media.prototype.attr = function (name, value) {
		if (value === undefined) {
			return this.$element.attr(name);
		}

		this.$element.attr(name, value);

		return this;
	};


	/**
	 * Get or set media properties. It works like prop() jQuery function
	 *
	 * prop('controls');
	 * prop('controls', true);
	 *
	 * @param string The name of the property
	 * @param string The new value of the property
	 *
	 * @return mixed (for getter)
	 * @return this (for setter)
	 */
	window.$media.prototype.prop = function (name, value) {
		if (value === undefined) {
			return this.$element.prop(name);
		}

		this.$element.prop(name, value);

		return this;
	};


	/**
	 * Get or set the width of the media element
	 *
	 * width();
	 * width(true);
	 * width(234);
	 *
	 * @param bool/int videoWidth Set true to return the real width of the video. Set number to change the width of the video
	 *
	 * @return integer (for getter)
	 * @return this (for setter)
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
	 * Get or set the height of the media element
	 *
	 * height();
	 * height(true);
	 * height(234);
	 *
	 * @param bool/int videoHeight Set true to return the real height of the video. Set number to change the height of the video
	 *
	 * @return integer (for getter)
	 * @return this (for setter)
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
	 * Plays the media or adds a play event listener
	 *
	 * play (fn)
	 * play ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this
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
	 * Toggles fullscreen mode or binds a function to fullscreen event
	 * This method works only in webkit and mozilla platforms
	 *
	 * function fullScreen (fn)
	 * function fullScreen (true)
	 * function fullScreen (false)
	 * function fullScreen ()
	 *
	 * @param function/bool fn The function to the event listener. Set true or false to enter or exit of fullscreen
	 *
	 * @return this
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
	 * Return if the media is playing or bind a function to playing event
	 * The playing event is similar to timeupdate event but it doesn't trigger if the video is paused or ended
	 *
	 * playing (fn)
	 * playing ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return bool True if the media is playing, false if not
	 * @return this On bind event
	 */
	window.$media.prototype.playing = function (fn) {
		if ($.isFunction(fn)) {
			this.on('playing', fn);

			return this;
		}

		return (this.element.paused || this.element.ended) ? false : true;
	};


	/**
	 * Return if the media is waiting or bind a function to waiting event
	 *
	 * waiting (fn)
	 * waiting ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return bool True if the media is waiting, false if not
	 * @return this On bind event
	 */
	window.$media.prototype.waiting = function (fn) {
		if ($.isFunction(fn)) {
			this.on('waiting', fn);

			return this;
		}

		return (this.element.readyState > 2) ? false : true;
	};


	/**
	 * Pauses the media or adds a play event listener
	 *
	 * pause (fn)
	 * pause ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this
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
	 * Toggle between play and pause, or bind a function to playPause event
	 * playPause event is not the same than play or pause events (separately)
	 *
	 * function playPause (fn)
	 * function playPause ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this
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
	 * Stops media (pauses, goes to start and stops loading the sources) or bind a function to stop event
	 *
	 * function stop (fn)
	 * function stop ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this
	 */
	window.$media.prototype.stop = function (fn) {
		if ($.isFunction(fn)) {
			this.on('stop', fn);
		} else {
			this.pause().reload().trigger('stop');
		}

		return this;
	};


	/**
	 * Goes to the end of the media or adds a end (ended) event listener
	 *
	 * end (fn)
	 * end ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this
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
	 * Removes the video/audio element or bind a function to remove event
	 *
	 * remove (fn)
	 * remove ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return this On bind event
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
	 * Seek for specific point of media or adds a seek event listener
	 *
	 * seek (fn)
	 * seek (23)
	 * seek ('+23')
	 * seek ('05:04')
	 * seek ('50%')
	 * ...
	 *
	 * @param function/string/int fn The function to the event listener or the point to seek
	 *
	 * @return this
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
	 * Return if the media is seeking or bind a function to seeking event
	 *
	 * seeking (fn)
	 * seeking ()
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return bool True if the media is seeking, false if not
	 * @return this On bind event
	 */
	window.$media.prototype.seeking = function (fn) {
		if ($.isFunction(fn)) {
			this.on('seeking', fn);

			return this;
		}

		return this.element.seeking;
	};


	/**
	 * Set/set the volume value of media or bind a function to volume event
	 *
	 * volume (fn)
	 * volume (0.5)
	 * volume ()
	 *
	 * @param function/float fn The function to the event listener or the new volume value (0-1 range)
	 *
	 * @return float (for getter)
	 * @return this (for setter / on bind event)
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
	 * Get/set mute to the media or bind a function to mute event
	 *
	 * mute (fn)
	 * mute (true)
	 * mute (false)
	 * mute ()
	 *
	 * @param function/bool fn The function to the event listener. True to mute, false to unmute and void to toggle
	 *
	 * @return float (for getter)
	 * @return this (for setter / on bind event)
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
	 * Adds an event listener to media element
	 *
	 * on('click', fn)
	 *
	 * @param string event The event name. You can set more than one event space separated
	 * @param function fn The function to execute on trigger the event
	 * 
	 * @return this
	 */
	window.$media.prototype.on = function (event, fn) {
		var registeredEvents = this.$element.data('events') || {}, events = event.split(' '), i, length = events.length, that = this;

		fn = $.proxy(fn, this);

		for (i = 0; i < length; i++) {
			switch (events[i]) {
				case 'fullScreen':
					if (!registeredEvents[events[i]]) {
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
							if (!that.paused && !that.ended) {
								that.trigger('playing');
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
	 * Removes one or more event listener to media element
	 *
	 * off('click', fn)
	 * off('click')
	 * off()
	 *
	 * @param string event The event name. You can set more than one event space separated
	 * @param function fn The function to delete in the event
	 * 
	 * @return this
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
	 * Trigger an event
	 *
	 * trigger('click')
	 *
	 * @param string event The event name to trigger.
	 * @param array data Optional arguments to pass to function events
	 * 
	 * @return this
	 */
	window.$media.prototype.trigger = function (event, data) {
		this.$element.trigger(event, data);

		return this;
	};



	/**
	 * Returns the current time of the media or a specific point in seconds
	 *
	 * time()
	 * time('+10')
	 * time('10%')
	 *
	 * @param string time The point of the media you get
	 * 
	 * @return float The time in seconds
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
	 * Returns the media duration in seconds or bind a function when the duration is available
	 *
	 * totalTime()
	 * totalTime(fn)
	 *
	 * @param function fn The function to the event listener
	 *
	 * @return float The duration of the media
	 * @return this On bind event
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
	 * Returns if the media is ready to play or bind a function on ready event
	 *
	 * ready()
	 * ready(2)
	 * ready(fn)
	 * ready(2, fn)
	 *
	 * @param int state The minimal state for the video to evaluate as ready (3 by default)
	 * @param function fn The function to the event listener
	 *
	 * @return boolean True if is ready, false if not
	 * @return this On bind event
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
	 * Reload the media element (back to inital state)
	 *
	 * @return this
	 */
	window.$media.prototype.reload = function () {
		this.sources(this.sources());

		return this;
	};


	/**
	 * Extends this media instance with other functions and properties
	 *
	 * extend('myFunction', fn);
	 *
	 * @param string/object name The name of the property or an object with all new properties
	 * @param mixed value The value of the property
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
	 * Extends the $media prototype with other functions or properties
	 *
	 * $media.extend('myFunction', fn);
	 *
	 * @param string/object name The name of the property or an object with all new properties
	 * @param mixed value The value of the property
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
	 * Creates and returns a new $media object
	 *
	 * @param string/html/jQuery selector The selector of the media element
	 * @param string/object properties The properties of the media element
	 *
	 * @return The $media intance.
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
				media.source(src);
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
	 * Creates a new html video element and returns a $media object with it
	 *
	 * @param string/object The src or an object with all properties of the media element
	 *
	 * @return The $media instance
	 */
	$.mediaVideo = function (properties) {
		if (typeof properties === 'string' || $.isArray(properties)) {
			properties = {src: properties};
		}

		return $.media('<video>', properties);
	};


	/**
	 * Creates a new html audio element and returns a $media object with it
	 *
	 * @param string/object The src or an object with all properties of the media element
	 *
	 * @return The $media instance
	 */
	$.mediaAudio = function (properties) {
		if (typeof properties === 'string' || $.isArray(properties)) {
			properties = {src: properties};
		}

		return $.media('<audio>', properties);
	};

})(window.jQuery);


/**
 * Extends the String object to convert any number to seconds
 *
 * '00:34'.toSeconds(); // 34
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
 * Extends the String object to convert any number value to seconds
 *
 * '34'.secondsTo('mm:ss'); // '00:34'
 *
 * @param string outputFormat One of the avaliable output formats ('ms', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')
 */
String.prototype.secondsTo = function (outputFormat) {
	'use strict';

	return this.toSeconds().secondsTo(outputFormat);
};



/**
 * Extends the Number object to convert any number to seconds
 *
 * (23.34345).toSeconds(); // 23.343
 */
Number.prototype.toSeconds = function () {
	'use strict';

	return Math.round(this * 1000) / 1000;
};


/**
 * Extends the Number object to convert any number value to seconds
 *
 * 34.secondsTo('mm:ss'); // '00:34'
 *
 * @param string outputFormat One of the avaliable output formats ('ms', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')
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