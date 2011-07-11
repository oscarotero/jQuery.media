/**
 * $media jQuery plugin (v.1.0)
 *
 * 2011. Created by Oscar Otero (http://oscarotero.com)
 *
 * $media is released under the GNU Affero GPL version 3.
 * More information at http://www.gnu.org/licenses/agpl-3.0.html
 */


(function($) {

	//Generic functions
	var sortObject = function (o) {
		var sorted = {}, key, keys = [];

		for (key in o) {
			if (o.hasOwnProperty(key)) {
				keys.push(key);
			}
		}

		keys.sort(function (a, b) {
			return a - b;
		});

		for (key = 0; key < keys.length; key++) {
			sorted[keys[key]] = o[keys[key]];
		}

		return sorted;
	}

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
		this.fragments = {};
		this.seek_points = {};

		if (this.$element.is('video')) {
			this.type = 'video';
		} else if (this.$element.is('audio')) {
			this.type = 'audio';
		}

		this.channels = {
			timeline: {
				enabled: true
			}
		};

		//Timeline variables
		this.timeline_timeout_id = false;
		this.executing_timeline = false;
		this.timeline_points = {};
		this.active_timeline_points = [];
		this.remaining_timeline_points = [];
		this.remaining_timeline_outpoints = [];

		//Timeline functions
		this.bind('mediaPlay mediaSeek', function() {
			this.executeTimeline();
		});
		this.seeking(function(event, ms) {
			this.executeTimelineOutPoints(ms);
		});

		//Update fragment
		this.totalTime(function () {
			var source = this.source();
			this.fragment((source.substring(source.lastIndexOf('#') + 1)).toLowerCase());	
		});

		//Events
		var that = this;

		//Seek events
		var seek_timeout;
		var execute_seek = function () {
			that.trigger('mediaSeek', [that.time()]);
		}
		this.bind('seeked seeking', function () {
			clearTimeout(seek_timeout);
			seek_timeout = setTimeout(execute_seek, 500);
			this.trigger('mediaSeeking', [this.time()]);
		});

		//Volume events
		var volume_timeout;
		var execute_volume = function () {
			that.trigger('mediaVolume', [that.volume()]);
		}
		this.bind('volumechange', function () {
			clearTimeout(volume_timeout);
			volume_timeout = setTimeout(execute_volume, 500);
			this.trigger('mediaChangingVolume', [this.volume()])
		});

		//Other events
		this.bind('ended', function () {
			this.trigger('mediaEnd', [this.time()]);
		});
		this.bind('pause', function () {
			this.trigger('mediaPause', [this.time()]);
		});
		this.bind('waiting', function () {
			this.trigger('mediaWaiting', [this.time()]);
		});
		this.bind('play', function () {
			this.trigger('mediaPlay', [this.time()]);
		});
		this.bind('timeupdate', function () {
			if (!this.element.paused) {
				this.trigger('mediaPlaying', [this.time()]);
			}
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
			return this.fragments;
		}

		//Setter
		this.fragments = {};

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

		var that = this;

		$.each(fragment, function (name, value) {
			switch (name) {
				case 't':
					if (typeof value == 'string') {
						var format = value.match(/^(npt|smpte)/gi);
						var times = value.replace(/^(npt:|smpte[^:]+:)/, '').split(',', 2);

						that.fragments.t = {
							format: format ? format[0] : 'npt',
							start: times[0].toMiliseconds(),
							end: times[1].toMiliseconds()
						};
					} else {
						that.fragments.t = value;

						if (!that.fragments.t.format) {
							that.fragments.t.format = 'npt';
						}
					}
					break;

				case 'track':
				case 'id':
					that.fragments.track = value;
					break;

				case 'xywh':
					if (typeof value == 'string') {
						var format = value.match(/^(pixel|percent)/gi);
						var dimmensions = value.replace(/^(pixel:|percent:)/, '').split(',', 4);

						that.fragments.xywh = {
							format: format ? format[0] : 'pixel',
							x: dimmensions[0],
							y: dimmensions[1],
							w: dimmensions[2],
							h: dimmensions[3]
						};
					} else {
						that.fragments.xywh = value;

						if (!that.fragments.xywh.format) {
							that.fragments.xywh.format = 'pixel';
						}
					}
					break;
			}
		});

		//Go to start point
		if (this.fragments.t) {
			this.totalTime(function () {
				this.seek(this.fragments.t.start);
			});
		}

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
			source = this.source();
			source = (source.substring(source.lastIndexOf('.') + 1)).toLowerCase().split('#', 2)[0];
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
	 * function sources ([sources])
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
		} else {
			this.element.play();
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

		return this.element.paused ? false : true;
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
		} else {
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
	 * function seek (fn, [one])
	 * function seek (time)
	 *
	 * Seek for specific point of media or bind a function to seek event
	 */
	$media.prototype.seek = function (fn, one) {
		if ($.isFunction(fn)) {
			this.bind('mediaSeek', fn, one);
		} else {
			var time = (typeof this.seek_points[fn] == 'number') ? this.seek_points[fn] : this.time(fn);
			this.element.currentTime = (time/1000);
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
		if (value == undefined) {
			return this.seek_points[name];
		}

		this.seek_points[name] = this.time(value);

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
		if (one) {
			this.$element.one(event, $.proxy(fn, this));
		} else {
			this.$element.bind(event, $.proxy(fn, this));
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
	 * function timeline (time, fn)
	 * function timeline (time)
	 *
	 * Insert a function in media timeline
	 */
	$media.prototype.timeline = function (time, fn, channel) {
		var this_time = time;
		var this_fn = fn;
		var this_channel = channel;

		this.totalTime(function () {
			var points = [];

			if ($.isArray(this_time)) {
				points = this_time;
				this_channel = this_fn;
			} else if (typeof this_time == 'object') {
				points = [this_time];
				this_channel = this_fn;
			} else if ($.isFunction(this_fn)) {
				points[0] = {
					time: this_time,
					fn: this_fn
				};
			}

			this_channel = this_channel ? this_channel : 'timeline';

			var length = points.length;

			if (!length) {
				console.error('There is nothing to add to timeline');
				return this;
			}

			for (var i = 0; i < length; i++) {
				if ($.isArray(points[i].time)) {
					var ms = [this.time(points[i].time[0]), this.time(points[i].time[1])];
				} else {
					var ms = [this.time(points[i].time)];
					ms.push(ms[0]);
				}

				points[i].ms = ms;

				var channel = points[i].channel ? points[i].channel : this_channel;

				if (!this.channels[channel]) {
					console.error(channel + ' is not a valid channel');
					continue;
				}

				if (this.timeline_points[channel] == undefined) {
					this.timeline_points[channel] = {};
				}

				if (this.timeline_points[channel][ms[0]] == undefined) {
					this.timeline_points[channel][ms[0]] = [];
				}

				this.timeline_points[channel][ms[0]].push(points[i]);
			}

			this.refreshTimeline();
		});

		return this;
	}


	/**
	 * function refreshTimeline ()
	 *
	 * Set the active_timeline_points array
	 */
	$media.prototype.refreshTimeline = function () {
		this.active_timeline_points = [];
		var active_points = {};

		for (channel in this.channels) {
			if (!this.channels[channel].enabled) {
				continue;
			}

			for (ms in this.timeline_points[channel]) {
				if (active_points[ms] == undefined) {
					active_points[ms] = [];
				}

				for (p in this.timeline_points[channel][ms]) {
					var point = this.timeline_points[channel][ms][p];
					point.channel = channel;
					active_points[ms].push(point);
				}
			}
		}

		active_points = sortObject(active_points);

		for (ms in active_points) {
			for (p in active_points[ms]) {
				this.active_timeline_points.push(active_points[ms][p]);
			}
		}

		this.executeTimeline();
	}


	/**
	 * function getPoints (ms, [channels], [length])
	 *
	 * Get the timeline points from/to any time
	 */
	$media.prototype.getPoints = function (ms, reverse, channels, offset, length) {
		if (ms == undefined) {
			ms = this.time();
		}

		var active_timeline_points = [];

		if (channels) {
			if (!$.isArray(channels)) {
				channels = [channels];
			}

			for (k in this.active_timeline_points) {
				if ($.inArray(this.active_timeline_points[k].channel, channels) != -1) {
					active_timeline_points.push(this.active_timeline_points[k]);
				}
			}
		} else {
			$.merge(active_timeline_points, this.active_timeline_points);
		}

		if (!active_timeline_points.length) {
			return [];
		}

		var returned_points = [];

		if (reverse) {
			for (k in active_timeline_points) {
				if (ms > active_timeline_points[k].ms[1]) {
					returned_points.push(active_timeline_points[k]);
				}
			}

			returned_points.reverse();
		} else {
			for (k in active_timeline_points) {
				if (ms < active_timeline_points[k].ms[1]) {
					returned_points.push(active_timeline_points[k]);
				}
			}
		}

		if (typeof offset != 'number') {
			return returned_points;
		}

		if (typeof length == 'number') {
			return returned_points.slice(offset, offset + length);
		}

		return returned_points.slice(offset);
	}


	//Execute out functions
	$media.prototype.executeTimelineOutPoints = function (ms) {
		if (!this.remaining_timeline_outpoints.length) {
			return;
		}

		for (s in this.remaining_timeline_outpoints) {
			if (ms < this.remaining_timeline_outpoints[s].ms[0] || ms > this.remaining_timeline_outpoints[s].ms[1] || !this.channels[this.remaining_timeline_outpoints[s].channel].enabled) {
				this.executeTimelinePoint(this.remaining_timeline_outpoints[s], 'fn_out');
				this.remaining_timeline_outpoints[s].waiting = false;
				this.remaining_timeline_outpoints.splice(s, 1);
			}
		}
	}


	$media.prototype.executeTimelinePoint = function (point, fn) {
		if (!fn) {
			fn = 'fn';
		}

		if (!$.isFunction(point[fn])) {
			console.error('There is not function to execute in timeline');
			return false;
		}

		if (!$.isArray(point.data)) {
			point.data = (point.data == undefined) ? [] : [point.data];
		}

		if (!point.proxy) {
			point.proxy = this;
		}

		point[fn].apply(point.proxy, $.merge([point.ms[0]], point.data));
	}


	/**
	 * function executeTimeline (ms)
	 *
	 * Execute the timeline functions
	 */
	$media.prototype.executeTimeline = function () {
		if (!this.active_timeline_points.length && !this.remaining_timeline_points.length && !this.remaining_timeline_outpoints.length) {
			return;
		}

		//Get tmp_timeline (from now to the end)
		this.remaining_timeline_points = this.getPoints(this.time());

		if (!this.remaining_timeline_points.length && !this.remaining_timeline_outpoints.length) {
			return;
		}

		this.timelineTimeout();
	}


	/**
	 * function timelineTimeout (ms)
	 *
	 * Function to execute on timeOut
	 */
	$media.prototype.timelineTimeout = function () {
		if (!this.remaining_timeline_points.length && !this.remaining_timeline_outpoints.length) {
			return;
		}

		//Execute functions
		var ms = this.time();

		while (this.remaining_timeline_points[0] && this.remaining_timeline_points[0].ms[0] <= ms) {
			var point = this.remaining_timeline_points.shift();

			if (!point.waiting) {
				this.executeTimelinePoint(point);

				if ($.isFunction(point.fn_out)) {
					point.waiting = true;
					this.remaining_timeline_outpoints.push(point);
				}
			}
		}

		//Execute out functions
		this.executeTimelineOutPoints(ms);

		//Create other timeout
		if (this.element.paused || this.element.seeking || (!this.remaining_timeline_points.length && !this.remaining_timeline_outpoints.length)) {
			return;
		}

		var new_ms = 0;

		if (this.remaining_timeline_points[0]) {
			new_ms = this.remaining_timeline_points[0].ms[0];
		}

		if (this.remaining_timeline_outpoints.length) {
			for (n in this.remaining_timeline_outpoints) {
				if (!new_ms || this.remaining_timeline_outpoints[n].ms[1] < new_ms) {
					new_ms = this.remaining_timeline_outpoints[n].ms[1];
				}
			}
		}
		
		new_ms = (new_ms - ms) + 10;

		if (new_ms < 20) {
			new_ms = 20;
		}

		clearTimeout(this.timeline_timeout_id);
		this.timeline_timeout_id = setTimeout($.proxy(this.timelineTimeout, this), new_ms);
	},


	/**
	 * function time (time)
	 *
	 * Return the current time of the media in time or a specific point
	 */
	$media.prototype.time = function (time) {
		if (time == undefined) {
			return this.element.currentTime.toMiliseconds();
		}

		if (isNaN(parseInt(time))) {
			return 0;
		}

		time = '' + time;

		var int_time = 0;

		if (time.indexOf('+') === 0 || time.indexOf('-') === 0) {
			var sum = time.substr(1).toMiliseconds();

			if (time.indexOf('-') === 0) {
				sum = -sum;
			}

			if (time.indexOf('%') == -1) {
				int_time = sum + this.element.currentTime.toMiliseconds();
			} else {
				int_time = Math.round((this.totalTime() / 100) * parseInt(sum)) + this.element.currentTime.toMiliseconds();
			}
		} else if (time.indexOf('%') != -1) {
			int_time = Math.round((this.totalTime() / 100) * time.toMiliseconds());
		} else {
			int_time = time.toMiliseconds();
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
	 * Return the media duration in miliseconds
	 */
	$media.prototype.totalTime = function (fn) {
		if (!$.isFunction(fn)) {
			return this.element.duration.toMiliseconds();
		}
		
		return this.ready(1, function () {
			$.proxy(fn, this)(this.element.duration.toMiliseconds());
		});
	}


	/**
	 * function ready ([state], fn)
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
			var ready = function () {
				if (that.element.readyState >= state) {
					clearInterval(interval_ready);
					$.proxy(fn, that)();
				}
			}

			var interval_ready = setInterval($.proxy(ready, that), 13);
		}

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
	 * function pluginAttr (plugin, name, value)
	 *
	 * Get/Set attributes from plugin
	 */
	$media.prototype.pluginAttr = function (plugin, name, value) {
		if (!this.plugins[plugin]) {
			return;
		}

		if ((value == undefined) && (typeof name == 'string')) {
			return this.plugins[plugin][name];
		}

		if (this.plugins[plugin]) {
			if (typeof name == 'object') {
				for (n in name) {
					this.plugins[plugin][n] = name[n];
				}
			} else {
				this.plugins[plugin][name] = value;
			}
		}

		return this;
	}
	
	
	/**
	 * function createChannel (channel, [options])
	 *
	 * Create a new channel
	 */
	$media.prototype.createChannel = function (channel, options) {
		if (!channel || this.channels[channel]) {
			return false;
		}

		if (typeof options != 'object') {
			options = {enabled: options ? true : false}
		}

		this.channels[channel] = options;
	}


	/**
	 * function removeChannel (channel)
	 *
	 * Remove a channel
	 */
	$media.prototype.removeChannel = function (channel) {
		if (!channel || !this.channels[channel]) {
			return false;
		}

		if ($.isFunction(this.channels[channel].remove)) {
			$.proxy(this.channels[channel].remove, this)(channel);
		}

		delete this.channels[channel];
	}


	/**
	 * function enableChannel (channel, [enable])
	 *
	 * Get/set the enabled and disabled channels
	 */
	$media.prototype.enableChannel = function (channel, enable) {
		if (channel == undefined) {
			return this;
		}

		enable = enable ? true : false;
		var refresh = false;

		if (typeof channel == 'string') {
			if (this.channels[channel]) {
				if (this.channels[channel].enabled != enable) {
					if (enable && $.isFunction(this.channels[channel].enable)) {
						$.proxy(this.channels[channel].enable, this)(channel);
					} else if (!enable && $.isFunction(this.channels[channel].disable)) {
						$.proxy(this.channels[channel].disable, this)(channel);
					}

					this.channels[channel].enabled = enable;
					refresh = true;
				}
			}

		} else if ($.isArray(channel)) {
			for (k in channel) {
				if (this.channels[channel[k]]) {
					if (this.channels[channel[k]].enabled != enable) {
						if (enable && $.isFunction(this.channels[channel[k]].enable)) {
							$.proxy(this.channels[channel[k]].enable, this)(channel[k]);
						} else if (!enable && $.isFunction(this.channels[channel[k]].disable)) {
							$.proxy(this.channels[channel[k]].disable, this)(channel[k]);
						}

						this.channels[channel[k]].enabled = enable;
						refresh = true;
					}
				}
			}

		} else if (typeof channel == 'object') {
			for (k in channel) {
				if (this.channels[k]) {
					var enable = channel[k] ? true : false;
					
					if (this.channels[k].enabled != enable) {
						if (enable && $.isFunction(this.channels[k].enable)) {
							$.proxy(this.channels[k].enable, this)(k);
						} else if (!enable && $.isFunction(this.channels[k].disable)) {
							$.proxy(this.channels[k].disable, this)(k);
						}
						this.channels[k].enabled = enable;
						refresh = true;
					}
				}
			}
		}

		if (refresh) {
			this.refreshTimeline();
		}

		return this;
	}
	
	
	/**
	 * function enabledChannel (channel)
	 *
	 * Return true if the channel is enabled
	 */
	$media.prototype.enabledChannel = function (channel) {
		if (!this.channels[channel] || !this.channels[channel].enabled) {
			return false;
		}

		return true;
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
	 * function jQuery.media (selector)
	 *
	 * Creates and return a $media object
	 */
	jQuery.media = function (selector) {
		selector = $(selector);

		if (!selector.is('video, audio')) {
			selector = selector.find('video, audio');
		}

		return new $media(selector.get(0));
	}
})(jQuery);



/**
 * function String.toMiliseconds ()
 *
 * Convert any number to miliseconds
 */
String.prototype.toMiliseconds = function () {
	var time = this;
	
	if (/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}(\.[0-9]+)?(,[0-9]+)?$/.test(time)) {
		time = time.split(':', 3);

		if (time.length == 3) {
			var ms = time[2].split(',', 2);
			ms[1] = ms[1] ? ms[1] : 0;

			return (((parseInt(time[0], 10) * 3600) + (parseInt(time[1], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10);
		}

		var ms = time[1].split(',', 1);
		ms[1] = ms[1] ? ms[1] : 0;

		return (((parseInt(time[0], 10) * 60) + parseFloat(ms[0])) * 1000) + parseInt(ms[1], 10);
	}

	if (/\./.test(time)) {
		return Math.round(parseFloat(time) * 1000);
	}

	return parseInt(time, 10);
}


/**
 * function String.milisecondsTo (outputFormat)
 *
 * Convert a miliseconds time value to any other time format
 */
String.prototype.milisecondsTo = function (outputFormat) {
	time = this;

	if (/\./.test(time)) {
		time = Math.round(parseFloat(time) * 1000);
	} else {
		time = parseInt(time, 10);
	}

	return time.milisecondsTo(outputFormat);
}


/**
 * function Number.toMiliseconds ()
 *
 * Convert any number to miliseconds
 */
Number.prototype.toMiliseconds = function () {
	var time = this;

	if (/\./.test(time)) {
		return Math.round(time * 1000);
	}

	return time;
}


/**
 * function Number.milisecondsTo (outputFormat)
 *
 * Convert a miliseconds time value to any other time format
 */
Number.prototype.milisecondsTo = function (outputFormat) {
	var time = this;

	switch (outputFormat) {
		case 'ss':
			return parseFloat(time / 1000);

		case 'hh:mm:ss':
		case 'hh:mm:ss.ms':
			var hh = Math.floor(time / 3600000);
			time = time - (hh * 3600000);

			var mm = Math.floor(time / 60000);
			time = time - (mm * 60000);

			var ss = (time / 1000);

			if (outputFormat == 'hh:mm:ss') {
				ss = Math.round(ss);
			}

			mm = (mm < 10) ? ("0" + mm) : mm;
			ss = (ss < 10) ? ("0" + ss) : ss;

			return hh + ':' + mm + ':' + ss;
	}

	return time;
};