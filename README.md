jQuery.media plugin
===================

Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
Released under the GNU Affero GPL version 3.
More information at http://www.gnu.org/licenses/agpl-3.0.html

jQuery.media is a jQuery plugin that allows manage html5 video and audio elements: properties, events, etc.

#### Example

```javascript
var video = $.media('#my-video'); //Create a media element

video.controls(true); //Set the controls property to true

var poster = video.poster(); //Get the poster value

video.seek(3); //Go to second 3
video.seek('00:03'); //Go to second 3
video.seek('+20'); //Advance 20 seconds
video.seek('50%'); //Go to 50% of the video duration

video.play(function () {
	alert('This is a play event!');
});

video.play(); //Plays the video (and trigger the play event)
```


Create new instance
-------------------

jQuery way:

```javascript
var video = $.media('#my-video');
```

DOM:

```javascript
var video = new $media(document.getElementById('my-video'));
```

Creating DOM elements on the fly

```javascript
var video = new $mediaVideo('my-video.ogg');
var audio = new $mediaAudio(['my-audio.ogg', 'my-audio.mp3']);
```



API
---

#### Media attributes:

* [loop](#loop)
* [autoplay](#autoplay)
* [controls](#controls)
* [poster](#poster)
* [preload](#preload)
* [height](#height)
* [width](#width)
* [source](#source)

#### Playback

* [play](#play)
* [playing](#playing)
* [playPause](#playpause)
* [pause](#pause)
* [stop](#stop)
* [time](#time)
* [duration](#duration)
* [seek](#seek)
* [seeking](#seeking)
* [ended](#ended)
* [playbackRate](#playbackRate)
* [volume](#volume)
* [muted](#muted)
* [fullscreen](#fullScreen)

#### Loading utilities

* [ready](#ready)
* [readyState](#readystate)
* [networkState](#networkstate)
* [reload](#reload)
* [canPlayType](#canPlaytype)
* [waiting](#waiting)

#### Events

* [off](#off)
* [on](#on)
* [trigger](#trigger)
* [triggerHandler](#triggerHandler)

#### Other utilities

* [data](#data)
* [extend](#extend)
* [$media.extend](#mediaextend)
* [get](#get)
* [$get](#get-1)
* [remove](#remove)

#### String/Number prototype

* [toSeconds](#toseconds)
* [secondsTo](#secondsTo)


#### loop()

Returns the value of loop property or set a new value (true or false)

```javascript
video.loop(); //Getter
video.loop(true); //Setter
```

#### autoplay()

Returns the value of autoplay property or set a new value (true or false)

```javascript
video.autoplay(); //Getter
video.autoplay(true); //Setter
```

#### controls()

Returns the value of controls property or set a new value (true or false)

```javascript
video.controls(); //Getter
video.controls(true); //Setter
```

#### poster()

Returns the value of poster attribute or set a new value

```javascript
video.poster(); //Getter
video.poster('screenshot.jpg'); //Setter
```

#### preload()

Returns the value of preload property or set a new value (auto, metadata or none)

```javascript
video.preload(); //Getter
video.preload('none'); //Setter
```

#### get()

Returns the DOM video/audio element:

```javascript
var video = video.get();
```

#### $get()

Returns the jQuery video/audio element:

```javascript
var $video = video.$get();
```

#### canPlayType()

Check if the browser can play its sources or another specific codec

```javascript
if (video.canPlayType()) {
	alert('video can play its source');
}
if (video.canPlayType('ogg')) {
	alert('video can play ogg format');
}
if (video.canPlayType(video/ogg)) {
	alert('video can play video/ogg format');
}
```

#### ready()

Shortcut for readyState(1, fn), execute a function when the video is ready to play (have the metadata).

```javascript
video.ready(function () {
	this.play();
});
```

#### readyState()

Bind an event handler to any readyState JavaScript event, or check a specific readyState. There are five possible states:
* 0 = HAVE_NOTHING - no information whether or not the audio/video is ready
* 1 = HAVE_METADATA - metadata for the audio/video is ready
* 2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
* 3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
* 4 = HAVE_ENOUGH_DATA - enough data available to start playing

```javascript
video.readyState(); //Returns 0, 1, 2, 3 or 4, depending of the readyState

video.readyState(2); //Returns true if the readyState is equal or upper than 2, or false

video.readyState(3, function () {
	alert('The readyState property is equal or upper than 3');
});
```

#### networkState()

Returns the current networkState property. There are four possible states:
* 0 = NETWORK_EMPTY - audio/video has not yet been initialized
* 1 = NETWORK_IDLE - audio/video is active and has selected a resource, but is not using the network
* 2 = NETWORK_LOADING - browser is downloading data
* 3 = NETWORK_NO_SOURCE - no audio/video source found

```javascript
video.networkState(); //Returns 0, 1, 2 or 3, depending of the networkState
```

#### playbackRate()

Bind an event handler to the "ratechange" JavaScript event, or returns the playbackRate property of the media element

```javascript
video.playbackRate(function () {
	console.log('The current playback rate is ' + this.playbackRate());
});

video.playbackRate(0.5); //Define a new playback rate
```

#### source()

Source getter/setter

```javascript
var currentSource = video.source();
var allDefinedSources = video.source(true);

video.source('new-video.ogg'); //Set new source
video.source(['new-video.ogg', 'new-video.mp4']);
video.source({
	src: 'new-video.ogg',
	type: 'video/ogg'
});
video.source([
	{
		src: 'new-video.ogg',
		type: 'video/ogg'
	},{
		src: 'new-video.mp4',
		type: 'video/mp4'
	}
]);
```

#### width()

Works like jquery's width() function, but can retrieve the videoWidth value (the real with of the video)

```javascript
video.width(); //Get the element dimmensions
video.width(true); //Get the videoWidth property

video.width(300); //Setter
```

#### height()

Works like jquery's height() function, but can retrieve the videoHeight value (the real with of the video)

```javascript
video.height(); //Get the element dimmensions
video.height(true); //Get the videoHeight property

video.height(300); //Setter
```


#### play()

Bind an event handler to the "play" JavaScript event, or trigger that event on the media element.

```javascript
video.play(function () {
	alert('Playing');
});

video.play();
```


#### playing()

Bind an event handler to the "playing" JavaScript event, or check if the media element is playing

```javascript
video.playing(function () {
	alert('Video is playing');
});

if (video.playing()) {
	alert('Video is playing');
}
```


#### waiting()

Bind an event handler to the "waiting" JavaScript event, or check if the media element is waiting

```javascript
video.waiting(function () {
	alert('Video is waiting');
});

if (video.waiting()) {
	alert('Video is waiting');
}
```

#### pause()

Bind an event handler to the "pause" JavaScript event, or trigger that event on the media element.

```javascript
video.pause(function () {
	alert('Video is paused');
});

video.pause();
```

#### playPause()

Bind an event handler to the "playpause" JavaScript event, or play or pause the media element and trigger the 'playpause' event.

This event is not browser native and is fired using playPause function, not play or pause functions.

```javascript
video.playPause(); //Video plays
video.playPause(); //Video pauses

video.playPause(function () {
	alert('Video is playing or paused');
});
```

#### stop()

Bind an event handler to the "stop" JavaScript event, or pause and reload the sources and and trigger the 'stop' event.

This event is not browser native and is fired only using stop function.

```javascript
video.stop(); //Video stops, and reload the sources
```

#### ended()

Bind an event handler to the "ended" JavaScript event, or check if the media resource was reached.

```javascript
video.ended(function () {
	alert('This is the end');
});

if (video.ended()) {
	alert('Video is ended');
}
```

#### remove()

Remove the media element from the DOM and all its properties. You can also bind an event handler to the "remove" javascript event (not browser native)

```javascript
video.remove(function () {
	alert('The video has been removed');
});

video.remove();
```

#### seek()

Bind an event handler to the "seeked" JavaScript event, or change the currentTime property

```javascript
video.seek(function () {
	alert('current time is changed');
});

video.seek(30); //Goes to second 30
video.seek('+30'); //Forward 30 seconds
video.seek('-30'); //Backward 30 seconds
video.seek('50%'); //Goes to 50% of the video duration
video.seek('+10%'); //Forward 10% of the video duration

//You can use hh:mm:ss format
video.seek('01:35');
video.seek('01:35.504');
video.seek('01:01:35');
video.seek('01:01:35.245');
```

#### seeking()

Bind an event handler to the "seeking" JavaScript event, or check if the media element is seeking

```javascript
video.seeking(function () {
	alert('Video is seeking');
});

if (video.seeking()) {
	alert('Video is seeking');
}
```

#### volume()

Bind an event handler to the "volumechange" JavaScript event, or get the volume value

```javascript
video.volume(function () {
	alert('Video volume is changed to ' + this.volume());
});

video.volume(0.5);
```


#### muted()

Bind an event handler to the "muted" JavaScript event (non browser native), get the muted value or set another value

```javascript
video.muted(function () {
	if (video.muted()) {
		alert('video is muted');
	} else {
		alert('video is not muted');
	}
});

video.muted(); //Getter
video.muted(true); //Setter
```


#### on()

Attach an event handler function for one or more events to the media element. It works like jQuery's on() function

```javascript
video.on('click', function () {
	video.playPause();
});
```


#### off()

Remove an event handler. It works like jQuery's off() function

```javascript
video.on('click', function () {
	video.playPause();
});

video.off('click');
```


#### trigger()

Execute all handlers and behaviors attached to the matched elements for the given event type. It works like jQuery's trigger function

```javascript
video.on('click', function () {
	video.playPause();
});

video.trigger('click');
```


#### triggerHandler()

Execute all handlers attached to an element for an event. It works like jQuery's triggerHandler function

```javascript
video.on('play', function () {
	video.volume(1);
});

video.triggerHandler('play');
```


#### time()

Returns the current time of the media element or another specific point or bind an event handler to the "timeupdate" JavaScript event

```javascript
video.time(); //Get the current time
video.time('+10'); //Get the current time + 10 seconds
video.time('25%'); //Get the seconds of the 25% of the total duration

video.time(function () {
	console.log('current time is ' + this.time());
});
```


#### duration()

Bind an event handler to the "durationchange" JavaScript event or get the duration value.

If the duration is not available (metadata has been not loaded), returns 0 instead of NaN.

```javascript
video.duration(); //Get the total duration

video.duration(function () {
	alert('The new duration is ' + this.duration());
});
```


#### reload()

Reload the media resource

```javascript
video.reload();
```

#### data()

Save or returns asociated data to this element. Works like jquery's .data()

```javascript
var video = $.media('#my-video');

video.data('title', 'video title'); //Set data

alert(video.data('title')); //Returns the data
```

#### extend()

Extend the instance with more parameters or functions

```javascript
var video = $.media('#my-video');
var video2 = $.media('#my-video2');

video.extend('goToStart', function () {
	this.seek(0);
});

video.goToStart(); //Goes to second 0
video2.goToStart(); //Throws an error exception, the function does not exists
```


#### $media.extend()

Extend all instances with more parameters or functions

```javascript
var video = $.media('#my-video');
var video2 = $.media('#my-video2');

$media.extend('goToStart', function () {
	this.seek(0);
});

video.goToStart(); //Goes to second 0
video2.goToStart(); //Goes to second 0
```


Extending javascript native classes
-----------------------------------

jQuery.media extends String and Number classes with two new functions to work with time values more easily:

#### toSeconds()

Converts any text/number value to seconds. A number with 3 decimals maximum (for miliseconds):

```javascript
(23.4567).toSeconds(); //23.457

'34.00'.toSeconds(); //34

'00:34'.toSeconds(); //34

'00:34.567'.toSeconds(); //34.567
```

#### secondsTo()

Converts any text/number value to any other output format ('ms', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')

```javascript
(23.4567).secondsTo('mm:ss'); //00:23.457

'128.00'.secondsTo('hh:mm:ss'); //00:02:08
```
