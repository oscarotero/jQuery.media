jQuery.media plugin
===================

2012. Created by Oscar Otero (http://oscarotero.com / http://anavallasuiza.com)

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

Plugins
=======

Timeline
---------------------

Allows synchronize content with the timeline of the media element:

```javascript
var video = $.media('#my-video');

//Create the timeline and set some options:

video.setTimeline('myTimeline', {
	enabled: true,
	points: [
		{
			time: '5:32',
			fn: function () {
				this.pause();
			}
		},{
			time: '50%',
			fn: function () {
				alert('This is the middle of the video');
			}
		},{
			time: [23.5, 26],
			fn: function () {
				alert('We are between the seconds 23.5 - 26');
			},
			fn_out: function () {
				alert('We have exit between the seconds 23.5 - 26');
			}
		}
	]
});

//Add more points to this timeline

video.setTimelinePoints('myTimeline', [
	{
		time: 5,
		fn: function () {
			this.seek('+25'); //Advance 25 seconds
		}
	},{
		time: 25,
		fn: function () {
			this.seek('+10%'); //Advance 10% of the video duration
		}
	}
]);

//Disable the timeline

video.disableTimeline('myTimeline');

//Remove the timeline

video.removeTimeline('myTimeline');

```


Tracks
------

Parses a webSrt file (subtitles, chapters, descriptions, etc) and creates a timeline with the data.

```javascript
var video = $.media('#my-video');

video.setTimelineFromTrack('mySubtitles', {
	track: '#my-subtitles-track'
});

//Enable the timeline to show the subtitles

video.enableTimeline('mySubtitles');

```


toCanvas
--------

Export the video to canvas and allowing pixel manipulation in real time.

```javascript
var video = $.media('#my-video');

video.toCanvas('#my-canvas');

//Export to canvas manipulating the pixels (convert to grayscale)

video.toCanvas('#my-canvas', {
	manipulation: function (context, width, height) {
		var frame = context.getImageData(0, 0, width, height);
		var total = frame.data.length;

		for (var i = 0; i < total; i += 4) {
			var r = i, g = i+1, b = i+2, a = i+3;
			frame.data[r] = frame.data[g] = frame.data[b] = (3 * frame.data[r] + 4 * frame.data[g] + frame.data[b]) >>> 3;
		}

		context.putImageData(frame, 0, 0);
	}
});

//Return a screenshot of the video

var screenshot = video.getScreenShot();

$('<img>').attr('src', screenshot).appendTo('#my-video');

```

More info and examples in http://idc.anavallasuiza.com/project/jquerymedia/

jQuery.media is released under the GNU Affero GPL version 3.
More information at http://www.gnu.org/licenses/agpl-3.0.html