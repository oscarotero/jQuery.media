/**
 * $media (core) jQuery plugin (v.1.2)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
 *
 * $media is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {

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
		this.isFullScreen = false;

		if (this.$element.is('video')) {
			this.type = 'video';
		} else if (this.$element.is('audio')) {
			this.type = 'audio';
		}

		//Update fragment
		this.totalTime(function () {
			var source = this.source();
			this.fragment((source.substring(source.lastIndexOf('#') + 1)).toLowerCase());	
		});
	}


	$media.plugins = {};


	/**
	 * function fragment ([fragment])
	 *
	 * Get/Set the current fragment
	 */
	$media.prototype.fragment = function (fragment) {
		//Getter
		if (fragment == undefined) {
			return this.$element.data('fragments');
		}

		//Setter
		var fragments = {};

		if (typeof fragment == 'string') {
			var variables = fragment.split('&');
			var fragment = {};

			$.each(variables, function (k, variable) {
				variable = variable.split('=', 2);
				fragment[variable[0]] = variable[1];
			});
		}

		if (typeof fragment != 'object') {
			console.error('The specified fragment is not valid');
			return this;
		}

		$.each(fragment, function (name, value) {
			switch (name) {
				case 't':
					if (typeof value == 'string') {
						var format = value.match(/^(npt|smpte)/gi);
						var times = value.replace(/^(npt:|smpte[^:]+:)/, '').split(',', 2);

						fragments.t = {
							format: format ? format[0] : 'npt',
							start: times[0].toSeconds(),
							end: times[1].toSeconds()
						};
					} else {
						fragments.t = value;

						if (!fragments.t.format) {
							fragments.t.format = 'npt';
						}
					}
					break;

				case 'track':
				case 'id':
					fragments.track = value;
					break;

				case 'xywh':
					if (typeof value == 'string') {
						var format = value.match(/^(pixel|percent)/gi);
						var dimmensions = value.replace(/^(pixel:|percent:)/, '').split(',', 4);

						fragments.xywh = {
							format: format ? format[0] : 'pixel',
							x: dimmensions[0],
							y: dimmensions[1],
							w: dimmensions[2],
							h: dimmensions[3]
						};
					} else {
						fragments.xywh = value;

						if (!fragments.xywh.format) {
							fragments.xywh.format = 'pixel';
						}
					}
					break;
			}
		});

		//Go to start point
		if (fragments.t) {
			this.totalTime(function () {
				this.seek(fragments.t.start);
			});
		}

		this.$element.data('fragments', fragments);

		return this;
	}


	/**
	 * function canPlay ([source])
	 *
	 * Check if the browser can play the media
	 */
	$media.prototype.canPlay = function (source) {
		if (!(this.element.canPlayType)) {
			return false;
		}

		if (source == undefined) {
			if (this.source()) {
				source = this.source();
				return this.canPlay((source.substring(source.lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0]);
			}

			source = this.sources();

			var length = source.length;
			var result = 0;

			for (var i = 0; i < length; i++) {
				var r = this.canPlay((source[i].substring(source[i].lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0]);
				result = (r > result) ? r : result;
			}

			return result;
		}

		var type = source;

		if (/^[a-z0-9]+$/i.test(type)) {
			type = this.mimeType(type);
		}

		switch (this.element.canPlayType(type)) {
			case 'probably':
			return 2;
			
			case 'maybe':
			return 1;
		}

		return 0;
	}


	/**
	 * function mimeType (ext)
	 *
	 * Get the source type
	 */
	$media.prototype.mimeType = function (ext) {
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
	}


	/**
	 * function sources ([sources], [autoload])
	 *
	 * Get or set source values
	 */
	$media.prototype.sources = function (sources, autoload) {
		var $media = this.$element;

		//Getter
		if (sources == undefined) {
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

		if (typeof sources == 'string') {
			$media.attr('src', sources);
		} else {
			if (!$.isArray(sources)) {
				sources = [sources];
			}

			$media.removeAttr('src');

			var that = this;

			$.each(sources, function (k, source) {
				if (typeof source != 'object') {
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

		//Update fragment
		this.totalTime(function () {
			var source = this.source();
			this.fragment((source.substring(source.lastIndexOf('#') + 1)).toLowerCase());	
		});

		return this;
	}


	/**
	 * function source ()
	 *
	 * Get the current source value
	 */
	$media.prototype.source = function () {
		return this.element.currentSrc;
	}


	/**
	 * function attr (name, [value])
	 *
	 * Get or set media attributes
	 */
	$media.prototype.attr = function (name, value) {
		if (name == 'src' || name == 'sources') {
			return this.sources(value);
		}

		if (value == undefined) {
			return this.$element.attr(name);
		}

		this.$element.attr(name, value);

		return this;
	}


	/**
	 * function prop (name, [value])
	 *
	 * Get or set media properties
	 */
	$media.prototype.prop = function (name, value) {
		if (value == undefined) {
			return this.$element.prop(name);
		}

		this.$element.prop(name, value);

		return this;
	}


	/**
	 * function width (videoWidth)
	 *
	 * Get or set the width value
	 */
	$media.prototype.width = function (videoWidth) {
		if (videoWidth === true) {
			return this.element.videoWidth;
		}

		if (videoWidth == undefined) {
			return this.$element.width();
		}

		this.$element.width(videoWidth);

		return this;
	}


	/**
	 * function height (videoHeight)
	 *
	 * Get or set the height value
	 */
	$media.prototype.height = function (videoHeight) {
		if (videoHeight === true) {
			return this.element.videoHeight;
		}

		if (videoHeight == undefined) {
			return this.$element.height();
		}

		this.$element.height(videoHeight);

		return this;
	}


	/**
	 * function play (fn, [one])
	 * function play ()
	 *
	 * Plays media or bind a function to play event
	 */
	$media.prototype.play = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaPlay', fn, one);
		} else if (this.element.paused) {
			this.element.play();
		}

		return this;
	}


	/**
	 * function fullScreen (fn, [one])
	 * function fullScreen (bool)
	 * function fullScreen ()
	 *
	 * Toggles fullscreen mode or binds a function to fullscreen event
	 * This method works only in webkit and mozilla platforms
	 */
	$media.prototype.fullScreen = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaFullScreen', fn, one);
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
	}


	/**
	 * function playing (fn, [one])
	 * function playing ()
	 *
	 * Return if the media is playing or bind a function to playing event
	 */
	$media.prototype.playing = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaPlaying', fn, one);

			return this;
		}

		return (this.element.paused || this.element.ended) ? false : true;
	}


	/**
	 * function waiting (fn, [one])
	 * function waiting ()
	 *
	 * Return if the media is waiting or bind a function to waiting event
	 */
	$media.prototype.waiting = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaWaiting', fn, one);

			return this;
		}

		return (this.element.readyState > 2) ? false : true;
	}


	/**
	 * function pause (fn, [one])
	 * function pause ()
	 *
	 * Pauses media or bind a function to pause event
	 */
	$media.prototype.pause = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaPause', fn, one);
		} else if (!this.element.paused) {
			this.element.pause();
		}

		return this;
	}


	/**
	 * function playPause (fn, [one])
	 * function playPause ()
	 *
	 * Play the media if it's paused or pause if it's playing media or bind a function to playPause event
	 */
	$media.prototype.playPause = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaPlayPause', fn, one);
		} else {
			if (this.element.paused) {
				this.play();
			} else {
				this.pause();
			}

			this.trigger('mediaPlayPause', [this.time(), this.element.paused]);
		}

		return this;
	}


	/**
	 * function stop (fn, [one])
	 * function stop ()
	 *
	 * Stops media (pause and go to start) or bind a function to stop event
	 */
	$media.prototype.stop = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaStop', fn, one);
		} else {
			this.pause().reload();

			this.trigger('mediaStop', [this.time()]);
		}

		return this;
	}


	/**
	 * function end (fn, [one])
	 * function end ()
	 *
	 * Goes to the end of the media or bind a function to end event
	 */
	$media.prototype.end = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaEnd', fn, one);
		} else {
			this.pause().seek(this.element.duration);
		}

		return this;
	}


	/**
	 * function remove (fn)
	 * function remove ()
	 *
	 * Removes the video/audio element or bind a function to remove event
	 */
	$media.prototype.remove = function (fn) {
		if ($.isFunction(fn)) {
			this.bind('mediaRemove', fn);
			return this;
		}

		this.trigger('mediaRemove');

		this.$element.remove();

		for (prop in this) {
			if (this.hasOwnProperty(prop)) {
				this[prop] = {};
			}
		}
	}


	/**
	 * function seek (fn, [one])
	 * function seek (time)
	 *
	 * Seek for specific point of media or bind a function to seek event
	 */
	$media.prototype.seek = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaSeek', fn, one);
		} else {
			this.ready(1, function () {
				var time = this.seekPoint(fn) || this.time(fn);

				if (this.element.currentTime != time) {
					this.element.currentTime = time;
				}
			});
		}

		return this;
	}


	/**
	 * function seekPoint (name, [value])
	 * function seekPoint (name)
	 *
	 * Get/Set a seek point with a name
	 */
	$media.prototype.seekPoint = function (name, value) {
		var seek_points = this.$element.data('seek_points') || {};

		if (value == undefined) {
			return seek_points[name];
		}

		seek_points[name] = this.time(value);

		this.$element.data('seek_points', seek_points);

		return this;
	}


	/**
	 * function seeking (fn, [one])
	 *
	 * Bind a function to seeking event or trigger the event
	 */
	$media.prototype.seeking = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaSeeking', fn, one);

			return this;
		}

		return this.element.seeking;
	}


	/**
	 * function volume (fn, [one])
	 * function volume (vol)
	 * function volume ()
	 *
	 * Set a volume value of media, bind a function to volume event or return the current value (in 0-100 range)
	 */
	$media.prototype.volume = function (fn, one) {
		if (device == 'ios') {
			return this;
		}

		if (fn == undefined) {
			return Math.round(this.element.volume * 100);
		}

		if ($.isFunction(fn)) {
			this.bind('mediaVolume', fn, one);
		} else {
			this.element.volume = parseInt(fn)/100;
		}

		return this;
	}


	/**
	 * function changingVolume (fn, [one])
	 *
	 * Bind a function to changingVolume event
	 */
	$media.prototype.changingVolume = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaChangingVolume', fn, one);
		}

		return this;
	}


	/**
	 * function mute (fn, [one])
	 * function mute (mute)
	 * function mute ()
	 *
	 * Mute or unmute the media or bind a function to mute event
	 */
	$media.prototype.mute = function (fn, one) {
		if (device == 'ios') {
			return this;
		}

		if ($.isFunction(fn)) {
			this.bind('mediaMute', fn, one);
		} else {
			if (typeof fn == 'boolean') {
				this.element.muted = fn;
			} else {
				this.element.muted = this.element.muted ? false : true;
			}

			this.trigger('mediaMute', [this.element.muted]);
		}

		return this;
	}


	/**
	 * function bind (event, fn, [one])
	 *
	 * Bind a function to specific event
	 */
	$media.prototype.bind = function (event, fn, one) {
		var exists = this.$element.data('events');
		var events = event.split(' ');
		var length = events.length;
		var that = this;

		for (var i = 0; i < length; i++) {
			if (exists && exists[events[i]]) {
				continue;
			}

			switch (events[i]) {

				//TODO: Check fullscreen events in Firefox
				case 'mediaFullScreen':
					this.bind('mozfullscreenchange', function (e) {
						this.trigger('mediaFullScreen', [true]);
						this.isFullScreen = true;
					});

					$(document).bind('mozfullscreenchange', function (e) {
						if ((document.mozFullScreen === false) && that.isFullScreen) {
							that.trigger('mediaFullScreen', [false]);
							that.isFullScreen = false;
						}
					});

					this.bind('webkitfullscreenchange', function (e) {
						this.trigger('mediaFullScreen', [document.webkitIsFullScreen]);
						this.isFullScreen = true;
					});
					break;

				case 'mediaEnd':
					this.bind('ended', function () {
						this.trigger('mediaEnd', [this.time()]);
					});
					break;
				
				case 'mediaPause':
					this.bind('pause', function () {
						this.trigger('mediaPause', [this.time()]);
					});
					break;

				case 'mediaWaiting':
					this.bind('waiting', function () {
						this.trigger('mediaWaiting', [this.time()]);
					});
					break;
				
				case 'mediaPlay':
					this.bind('play', function () {
						this.trigger('mediaPlay', [this.time()]);
					});
					break;
				
				case 'mediaPlaying':
					this.bind('timeupdate', function () {
						if (this.playing()) {
							this.trigger('mediaPlaying', [this.time()]);
						}
					});
					break;
				
				case 'mediaSeek':
				case 'mediaSeeking':
					var seek_timeout;
					var execute_seek = function () {
						that.trigger('mediaSeek', [that.time()]);
					}
					this.bind('seeked seeking', function () {
						clearTimeout(seek_timeout);
						seek_timeout = setTimeout(execute_seek, 500);
						this.trigger('mediaSeeking', [this.time()]);
					});
					break;
				
				case 'mediaVolume':
				case 'mediaChangingVolume':
					var volume_timeout;
					var execute_volume = function () {
						that.trigger('mediaVolume', [that.volume()]);
					}
					this.bind('volumechange', function () {
						clearTimeout(volume_timeout);
						volume_timeout = setTimeout(execute_volume, 500);
						this.trigger('mediaChangingVolume', [this.volume()])
					});
					break;
			}
		}

		if (one) {
			this.$element.one(event, $.proxy(fn, this));
		} else {
			this.$element.bind(event, $.proxy(fn, this));
		}

		return this;
	}



	/**
	 * function unbind (event, fn)
	 *
	 * Unbind a function to specific event
	 */
	$media.prototype.unbind = function (event, fn) {
		if (fn) {
			this.$element.unbind(event, $.proxy(fn, this));
		} else {
			this.$element.unbind(event);
		}

		return this;
	}


	/**
	 * function trigger (event, [data])
	 *
	 * Trigger an event
	 */
	$media.prototype.trigger = function (event, data) {
		this.$element.trigger(event, data);

		return this;
	}


	/**
	 * function time (time)
	 *
	 * Return the current time of the media in time or a specific point
	 */
	$media.prototype.time = function (time) {
		if (time == undefined) {
			return this.element.currentTime.toSeconds();
		}

		if (isNaN(parseInt(time))) {
			return 0;
		}

		time = '' + time;

		var int_time = 0;

		if (time.indexOf('+') === 0 || time.indexOf('-') === 0) {
			var sum = time.substr(1).toSeconds();

			if (time.indexOf('-') === 0) {
				sum = -sum;
			}

			if (time.indexOf('%') == -1) {
				int_time = sum + this.element.currentTime.toSeconds();
			} else {
				int_time = Math.round((this.totalTime() / 100) * parseInt(sum)) + this.element.currentTime.toSeconds();
			}
		} else if (time.indexOf('%') != -1) {
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
	}


	/**
	 * function totalTime ()
	 *
	 * Return the media duration in seconds
	 */
	$media.prototype.totalTime = function (fn) {
		if (!$.isFunction(fn)) {
			return this.element.duration.toSeconds();
		}
		
		return this.ready(1, function () {
			$.proxy(fn, this)(this.element.duration.toSeconds());
		});
	}


	/**
	 * function ready ([state], fn)
	 * function ready (fn)
	 *
	 * Return if the video is ready to play
	 */
	$media.prototype.ready = function (state, fn) {
		if (typeof state != 'number') {
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
				that.ready(state, fn)
			}, 13);
		}

		return this;
	}


	/**
	 * function reload ()
	 *
	 * Reload the video
	 */
	$media.prototype.reload = function () {
		this.sources(this.sources());

		return this;
	}


	/**
	 * function extend (name, value)
	 * function extend (object)
	 *
	 * Extends $media with other functions
	 */
	$media.prototype.extend = function (name, value) {
		if (typeof name != 'object') {
			var k = name;
			name = {};
			name[k] = value;
		}

		$.extend(this, name);
	}


	/**
	 * function extend (name, value)
	 * function extend (object)
	 *
	 * Extends $media with other functions
	 */
	$media.extend = function (name, value) {
		if (typeof name != 'object') {
			var k = name;
			name = {};
			name[k] = value;
		}

		$.each(name, function (k, v) {
			$media.prototype[k] = v;
		});
	}


	/**
	 * function addPlugin (name, [config])
	 *
	 * Add a plugin to current $media instance
	 */
	$media.prototype.addPlugin = function (name, config) {
		var plugins = name;

		if (typeof plugins != 'object') {
			plugins = {};
			plugins[name] = config;
		}

		var that = this;

		$.each(plugins, function (plugin_name, plugin_config) {
			if (!$media.plugins[plugin_name]) {
				console.error('The plugin "' + plugin_name + '" is not registered');
				return false;
			}

			that[plugin_name] = new $media.plugins[plugin_name](that, plugin_config);
		});

		return this;
	}


	/**
	 * function jQuery.media (selector, properties)
	 *
	 * Creates and returns a $media object
	 */
	jQuery.media = function (selector, properties) {
		if (properties) {
			if (properties.src) {
				var src = properties.src;
				delete(properties.src);
			}

			selector = $(selector, properties);

			var media = new $media(selector.get(0));

			if (src) {
				media.sources(src);
			}

			return media;
		}

		selector = $(selector);

		if (!selector.is('video, audio')) {
			selector = selector.find('video, audio');
		}

		return new $media(selector.get(0));
	}


	/**
	 * function jQuery.mediaVideo (properties)
	 *
	 * Creates a video element and returns a $media object with it
	 */
	jQuery.mediaVideo = function (properties) {
		if (typeof properties == 'string') {
			properties = {src: properties};
		}

		return $.media('<video>', properties);
	}


	/**
	 * function jQuery.mediaAudio (properties)
	 *
	 * Creates an audio element and returns a $media object with it
	 */
	jQuery.mediaAudio = function (properties) {
		if (typeof properties == 'string') {
			properties = {src: properties};
		}

		return $.media('<audio>', properties);
	}
})(jQuery);


/**
 * function String.toSeconds ()
 *
 * Convert any number to seconds
 */
String.prototype.toSeconds = function () {
	var time = this;

	if (/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}(\.[0-9]+)?(,[0-9]+)?$/.test(time)) {
		time = time.split(':', 3);

		if (time.length == 3) {
			var ms = time[2].split(',', 2);
			ms[1] = ms[1] ? ms[1] : 0;

			return ((((parseInt(time[0], 10) * 3600) + (parseInt(time[1], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
		}

		var ms = time[1].split(',', 1);
		ms[1] = ms[1] ? ms[1] : 0;

		return ((((parseInt(time[0], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10)) / 1000;
	}

	return parseFloat(time).toSeconds();
}


/**
 * function String.secondsTo (outputFormat)
 *
 * Convert a seconds time value to any other time format
 */
String.prototype.secondsTo = function (outputFormat) {
	return this.toSeconds().secondsTo(outputFormat);
}


/**
 * function Number.toSeconds ()
 *
 * Convert any number to seconds
 */
Number.prototype.toSeconds = function () {
	return Math.round(this * 1000) / 1000;
}


/**
 * function Number.secondsTo (outputFormat)
 *
 * Convert a seconds time value to any other time format
 */
Number.prototype.secondsTo = function (outputFormat) {
	var time = this;

	switch (outputFormat) {
		case 'ms':
			return Math.round(time * 1000);

		case 'mm:ss':
		case 'hh:mm:ss':
		case 'hh:mm:ss.ms':
			var hh = '';

			if (outputFormat != 'mm:ss') {
				hh = Math.floor(time / 3600);
				time = time - (hh * 3600);
				hh += ':';
			}

			var mm = Math.floor(time / 60);
			time = time - (mm * 60);
			mm = (mm < 10) ? ("0" + mm) : mm;
			mm += ':';

			var ss = time;

			if (outputFormat == 'hh:mm:ss') {
				ss = Math.round(ss);
			}
			ss = (ss < 10) ? ("0" + ss) : ss;

			return hh + mm + ss;
	}

	return time;
};