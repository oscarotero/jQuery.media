jQuery.media plugin
===================

Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)
Released under the GNU Affero GPL version 3.
More information at http://www.gnu.org/licenses/agpl-3.0.html

jQuery.media is a jQuery plugin that allows manage html5 video and audio elements: properties, events, etc.

#### Example

```javascript
var video = $.media('#my-video'); //Create a media element

video.seek(3); //Goes to second 3
video.seek('00:03'); //Goes to second 3

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

* [get](#get) Returns the DOM video/audio element
* [$get](#get-1) Returns the jQuery video/audio element

* [canPlayType](#canPlaytype) Check if the browser can play its sources or another specific codec
* [loadedMetadata](#loadedMetadata) Bind an event handler to the "loadedmetadata" JavaScript event, or check if the metadata has been loaded.
* [loadedData](#loadedData) Bind an event handler to the "loadeddata" JavaScript event, or check if the data has been loaded
* [canPlay](#canPlay) Bind an event handler to the "canplay" JavaScript event, or check if the media can start to play
* [canPlayThrough](#canPlayThrough) Bind an event handler to the "canplaythrough" JavaScript event, or check if the media can start to play until the end

* [source](#source) Source getter/setter
* [attr](#attr) Works like jquery's attr() function.
* [prop](#prop) Works like jquery's prop() function.
* [width](#width) Works like jquery's width() function, but can retrieve the videoWidth value (the real with of the video)
* [height](#height) Works like jquery's height() function, but can retrieve the videoHeight value (the real with of the video)

* [play](#play) Bind an event handler to the "play" JavaScript event, or trigger that event on the media element.
* [pause](#pause) Bind an event handler to the "pause" JavaScript event, or trigger that event on the media element.
* [playPause](#playPause) Bind an event handler to the "playpause" JavaScript event, or play or pause the media element and trigger the 'playpause' event.
* [stop](#stop) Bind an event handler to the "stop" JavaScript event, or pause and reload the sources and and trigger the 'stop' event.
* [seek](#seek) Bind an event handler to the "seeked" JavaScript event, or change the currentTime property
* [seeking](#seeking) Bind an event handler to the "seeking" JavaScript event, or check if the media element is seeking
* [ended](#ended) Bind an event handler to the "ended" JavaScript event, or check if the media resource was reached.
* [playing](#playing) Bind an event handler to the "playing" JavaScript event, or check if the media element is playing
* [waiting](#waiting) Bind an event handler to the "waiting" JavaScript event, or check if the media element is waiting

* [volume](#volume) Bind an event handler to the "volumechange" JavaScript event, or get the volume value
* [muted](#muted) Bind an event handler to the "muted" JavaScript event (non browser native), get the muted value or set another value
* [on](#on) Attach an event handler function for one or more events to the media element. It works like jQuery's on() function
* [off](#off) Remove an event handler. It works like jQuery's off() function
* [trigger](#trigger) Execute all handlers and behaviors attached to the matched elements for the given event type. It works like jQuery's trigger function
* [triggerHandler](#triggerHandler) Execute all handlers attached to an element for an event.. It works like jQuery's triggerHandler function

* [playbackRate](#playbackRate) Bind an event handler to the "ratechange" JavaScript event, or returns the playbackRate property of the media element
* [time](#time) Returns the current time of the media element or another specific point
* [duration](#duration) Bind an event handler to the "durationchange" JavaScript event or get the duration value. 

* [reload](#reload) Reload the media resource
* [remove](#remove) Remove the media element from the DOM and all its properties. You can also bind an event handler to the "remove" javascript event (not browser native)
* [error](#error) Bind an event handler to the "error" JavaScript event, or check if an error ocurred while fetching the media data and returns an error object with the code

* [extend](#extend) Extend the instance with more parameters or functions
* [$media.extend](#mediaextend) Extend all instances with more parameters or functions

* [toSeconds](#toseconds) Converts any text/number value to seconds. A number with 3 decimals maximum (for miliseconds)
* [secondsTo](#secondsTo) Converts any text/number value to any other output format ('ms', 'mm:ss', 'hh:mm:ss', 'hh:mm:ss.ms')



#### get()

Returns the DOM video/audio element:

```javascript
var video = $.media('#my-video');

var video = video.get();
```

#### $get()

Returns the jQuery video/audio element:

```javascript
var video = $.media('#my-video');

var video = video.$get();
```

#### canPlayType()

Check if the browser can play its sources or another specific codec

```javascript
var video = $.media('#my-video');

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

#### loadedMetadata()

Bind an event handler to the "loadedmetadata" JavaScript event, or check if the metadata has been loaded.

The event is fired when the user agent has just determined the duration and dimensions of the media resource and the text tracks are ready.

```javascript
var video = $.media('#my-video');

video.loadedMetadata(); //Returns true if metadata has been loaded, false if not

video.loadedMetadata(function () {
	alert('The metada of this video has been loaded');
});
```

#### loadedData()

Bind an event handler to the "loadeddata" JavaScript event, or check if the data has been loaded

The event is fired when the user agent can render the media data at the current playback position for the first time.

```javascript
var video = $.media('#my-video');

video.loadedData(); //Returns true if current data has been loaded, false if not

video.loadedMetadata(function () {
	alert('The data of this frame has been loaded');
});
```

#### canPlay()

Bind an event handler to the "canplay" JavaScript event, or check if the media can start to play

The event is fired when the user agent can resume playback of the media data, but estimates that if playback were to be started now, the media resource could not be rendered at the current playback rate up to its end without having to stop for further buffering of content. 

```javascript
var video = $.media('#my-video');

video.canPlay(); //Returns true if enought data has been loaded and can start playing, false if not

video.canPlay(function () {
	alert('This video can play now');
});
```

#### canPlayThrough()

Bind an event handler to the "canplaythrough" JavaScript event, or check if the media can start to play until the end

The event is fired when the user agent estimates that if playback were to be started now, the media resource could be rendered at the current playback rate all the way to its end without having to stop for further buffering.

```javascript
var video = $.media('#my-video');

video.canPlayThrough(); //Returns true if enought data has been loaded to play until the end, false if not

video.canPlayThrough(function () {
	alert('This video can play now');
});
```

#### error()

Bind an event handler to the "error" JavaScript event, or check if an error ocurred while fetching the media data and returns an error object with the code

```javascript
var video = $.media('#my-video');

video.error(); //Returns true if enought data has been loaded to play until the end, false if not

video.error(function () {
	var error = this.error();

	console.log(error.code);
});
```

#### playbackRate()

Bind an event handler to the "ratechange" JavaScript event, or returns the playbackRate property of the media element

```javascript
var video = $.media('#my-video');

video.playbackRate(function () {
	console.log('The current playback rate is ' + this.playbackRate());
});

video.playbackRate(0.5); //Define a new playback rate
```

#### source()

Source getter/setter

```javascript
var video = $.media('#my-video');

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

#### attr()

Works like jquery's attr() function.

```javascript
var video = $.media('#my-video');

video.attr('poster'); //Getter
video.attr('poster', 'new-poster.jpg'); //Setter
```

#### prop()

Works like jquery's prop() function.

```javascript
var video = $.media('#my-video');

video.prop('controls'); //Getter
video.prop('controls', true); //Setter
```

#### width()

Works like jquery's width() function, but can retrieve the videoWidth value (the real with of the video)

```javascript
var video = $.media('#my-video');

video.width(); //Get the element dimmensions
video.width(true); //Get the videoWidth property

video.width(300); //Setter
```

#### height()

Works like jquery's height() function, but can retrieve the videoHeight value (the real with of the video)

```javascript
var video = $.media('#my-video');

video.height(); //Get the element dimmensions
video.height(true); //Get the videoHeight property

video.height(300); //Setter
```


#### play()

Bind an event handler to the "play" JavaScript event, or trigger that event on the media element.

```javascript
var video = $.media('#my-video');

video.play(function () {
	alert('Playing');
});

video.play();
```


#### playing()

Bind an event handler to the "playing" JavaScript event, or check if the media element is playing

```javascript
var video = $.media('#my-video');

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
var video = $.media('#my-video');

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
var video = $.media('#my-video');

video.pause(function () {
	alert('Video is paused');
});

video.pause();
```

#### playPause()

Bind an event handler to the "playpause" JavaScript event, or play or pause the media element and trigger the 'playpause' event.

This event is not browser native and is fired using playPause function, not play or pause functions.

```javascript
var video = $.media('#my-video');

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
var video = $.media('#my-video');

video.play(); //Video plays
video.stop(); //Video stops, and reload the sources
```

#### ended()

Bind an event handler to the "ended" JavaScript event, or check if the media resource was reached.

```javascript
var video = $.media('#my-video');

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
var video = $.media('#my-video');

video.remove(function () {
	alert('The video has been removed');
});

video.remove();
```

#### seek()

Bind an event handler to the "seeked" JavaScript event, or change the currentTime property

```javascript
var video = $.media('#my-video');

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
var video = $.media('#my-video');

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
var video = $.media('#my-video');

video.volume(function () {
	alert('Video volume is changed to ' + this.volume());
});

video.volume(0.5);
```


#### muted()

Bind an event handler to the "muted" JavaScript event (non browser native), get the muted value or set another value

```javascript
var video = $.media('#my-video');

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
var video = $.media('#my-video');

video.on('click', function () {
	video.playPause();
});
```


#### off()

Remove an event handler. It works like jQuery's off() function

```javascript
var video = $.media('#my-video');

video.on('click', function () {
	video.playPause();
});

video.off('click');
```


#### trigger()

Execute all handlers and behaviors attached to the matched elements for the given event type. It works like jQuery's trigger function

```javascript
var video = $.media('#my-video');

video.on('click', function () {
	video.playPause();
});

video.trigger('click');
```


#### triggerHandler()

Execute all handlers attached to an element for an event.. It works like jQuery's triggerHandler function

```javascript
var video = $.media('#my-video');

video.on('play', function () {
	video.volume(1);
});

video.triggerHandler('play');
```


#### time()

Returns the current time of the media element or another specific point

```javascript
var video = $.media('#my-video');

video.time(); //Get the current time

video.time('+10'); //Get the current time + 10 seconds
video.time('25%'); //Get the seconds of the 25% of the total duration
```


#### duration()

Bind an event handler to the "durationchange" JavaScript event or get the duration value.

If the duration is not available (metadata has been not loaded), returns 0 instead of NaN.

```javascript
var video = $.media('#my-video');

video.duration(); //Get the total duration

video.duration(function () {
	alert('The new duration is ' + this.duration());
});
```


#### reload()

Reload the media resource

```javascript
var video = $.media('#my-video');

video.reload();
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