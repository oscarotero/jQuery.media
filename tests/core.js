test("Loading media elements", function() {
	var media = $.media('#video');
	var videoElement = document.getElementById('video');
	var video = $.mediaVideo(media.source());
	var sources = ['http://archive.org/download/Sinbad/Sinbad.ogv', 'http://archive.org/download/Sinbad/Sinbad_512kb.mp4'];

	deepEqual(media.get(), videoElement, 'Get html media element');
	deepEqual(media.jQuery(), $(videoElement), 'Get jQuery instance with the media element');

	ok(video.canPlayType(), 'Can play the dinamic video?');
	ok(media.canPlayType(), 'Can play the DOM video?');

	stop();

	video.ready(function () {
		deepEqual(this.ready(), true, 'Dinamic video is ready?');
		deepEqual(this.duration().secondsTo('mm:ss'), '02:02', 'Dinamic video duration');

		media.ready(function () {
			start();

			deepEqual(this.ready(), true, 'DOM video is ready?');
			deepEqual(video.source(), media.source(), 'Dinamic and DOM video have the same src?');
			
			ok(video.canPlayType(), 'Can really play the dinamic video?');
			ok(media.canPlayType(), 'Can really play the DOM video?');

			video.source(sources);
			deepEqual(video.source(true), sources, 'Added new sources?');
			ok(video.canPlayType(), 'Can play the new sources?');

			stop();

			video.ready(function () {
				start();

				deepEqual(this.ready(), true, 'New sources are ready?');
				deepEqual(this.duration().secondsTo('mm:ss'), '11:50', 'New sources duration');
				ok(this.canPlayType(), 'Can really play the new sources?');
			});
		});
	});
});

test("Time functions", function() {
	var media = $.media('#video');
	var duration = 122.055;
	var durationms = 122055;
	var durationstring = '0:02:02.055';

	if (!media.canPlay('ogv')) {
		duration = 122.056;
		durationms = 122056;
		durationstring = '0:02:02.056';
	}

	if (media.ready(1)) {
		deepEqual(media.duration(), duration, 'Get duration if video is loaded');
	} else {
		deepEqual(media.duration(), 0, 'Duration is 0 if video is not loaded');
	}

	deepEqual(media.time(), 0, 'Current time is 0');
	
	stop();

	media.duration(function () {
		start();

		deepEqual(media.duration(), duration, 'Get duration when video is loaded');

		deepEqual(media.duration().secondsTo('ms'), durationms, 'duration: ms');
		deepEqual(media.duration().secondsTo('mm:ss'), '02:02', 'duration: mm:ss');
		deepEqual(media.duration().secondsTo('hh:mm:ss'), '0:02:02', 'duration: hh:mm:ss');
		deepEqual(media.duration().secondsTo('hh:mm:ss.ms'), durationstring, 'duration: hh:mm:ss.ms');

		deepEqual(media.time('50%'), 61.028, 'time: 50%');
		deepEqual(media.time('+50%'), 61.028, 'time: +50%');
		deepEqual(media.time('-50%'), 0, 'time: -50%');
		deepEqual(media.time('100%'), duration, 'time: 100%');
		deepEqual(media.time('+100'), 100, 'time: +100');
		deepEqual(media.time('100.0'), 100, 'time: 100.0');
		deepEqual(media.time('100.1'), 100.1, 'time: 100.1');
		deepEqual(media.time('+110%'), duration, 'time: +100%');
		deepEqual(media.time(duration + 1), duration, 'time: duration + 1');
		deepEqual(media.time(-1), 0, 'time: -1');
		deepEqual(media.time('-1'), 0, 'time: -1');
	});
});

test("Sound functions", function() {
	var media = $.media('#video');
	
	media.mute();
	deepEqual(media.get().muted, true, 'Mute');

	media.mute();
	deepEqual(media.get().muted, false, 'Unmute');

	media.mute(false);
	deepEqual(media.get().muted, false, 'Unmute');

	media.mute(true);
	deepEqual(media.get().muted, true, 'Mute');

	media.mute(true);
	deepEqual(media.get().muted, true, 'Mute');

	deepEqual(media.volume(), 1, 'Volume');

	media.volume(0.5);

	deepEqual(media.volume(), 0.5, 'Volume 0.5');

	media.volume(2);

	deepEqual(media.volume(), 1, 'Volume 2');

	media.volume(-1);

	deepEqual(media.volume(), 0, 'Volume -1');
});

test("Seek functions", function() {
	var media = $.media('#video');
	
	stop();

	media.ready(function () {
		start();

		deepEqual(media.playing(), false, 'Playing');

		media.play();
		deepEqual(media.playing(), true, 'Playing');

		media.pause().seek(20);
		deepEqual(media.time(), 20, 'Seek 20');

		media.end();
		deepEqual(media.time(), media.duration(), 'End');

		media.stop();
		deepEqual(media.playing(), false, 'Stop');

		media.playPause();
		deepEqual(media.playing(), true, 'PlayPause');

		media.playPause();
		deepEqual(media.playing(), false, 'PlayPause');

		stop();

		media.seek('+10').ready(function () {
			start();
			
			deepEqual(media.time(), 10, 'Seek 10');
		});
	});
});

test("Events functions", 17, function() {
	var media = $.media('#video');

	media.play(function () {
		ok(true, 'Play event 1/2');
	});

	media.on('play', function () {
		ok(true, 'Play event 2/2');
	});

	media.seek(function (event) {
		deepEqual(event.type, 'seeked', 'Seek event 1/3');
	});

	media.on('seek', function (event) {
		deepEqual(event.type, 'seeked', 'Seek event 2/3');
	});

	media.on('seeked', function (event) {
		deepEqual(event.type, 'seeked', 'Seek event 3/3');
	});

	media.volume(function (event) {
		deepEqual(event.type, 'volumechange', 'Volume event 1/4');
	});

	media.on('volume', function (event) {
		deepEqual(event.type, 'volumechange', 'Volume event 1/2');
	});

	media.on('volumechange', function (event) {
		deepEqual(event.type, 'volumechange', 'Volume event 1/3');
	});

	media.on('volumeChange', function (event) {
		deepEqual(event.type, 'volumechange', 'Volume event 1/4');
	});

	media.end(function (event) {
		start();

		deepEqual(event.type, 'ended', 'End event 1/2');
		ok(this.get().ended, 'End event 2/2');

		media.trigger('volume');
		media.triggerHandler('play');

		media.off('play seek volume end');

		media.play();
		media.volume(0.5);
		media.seek('+10');
		media.seek('99%');
	});

	stop();

	media.ready(function () {
		start();

		media.play();
		media.volume(0.5);
		media.seek('99%');

		stop();
	});
});