var sources = ["http://archive.org/download/Lets_Sing_with_Popeye_1936/Popeye_Lets_Sing_with_Popeye_1934_512kb.mp4", "http://ia600409.us.archive.org/10/items/Lets_Sing_with_Popeye_1936/Popeye_Lets_Sing_with_Popeye_1934.ogv"];
var sources2 = ["http://media.w3.org/2010/05/sintel/trailer.mp4", "http://media.w3.org/2010/05/sintel/trailer.webm", "http://media.w3.org/2010/05/sintel/trailer.ogv"];
var media;

var getMedia = function () {
	media = $.media('#video');
	
	return media;
}

module('pasive');

test("get(), $get()", function() {
	var media = getMedia();
	var dom = document.getElementById('video');
	var $dom = $('#video');

	deepEqual(media.get(), media.element);
	deepEqual(media.get(), dom);
	deepEqual(media.$get(), media.$element);
	deepEqual(media.get(), $dom.get(0));
});


test("canPlayType()", function () {
	var media = getMedia();

	ok(media.canPlayType());
	ok(media.canPlayType(media.source(true)));
	deepEqual(media.canPlayType('foo'), 0);
});


test("playbackRate()", function() {
	var media = getMedia();

	deepEqual(media.playbackRate(), 1, 'playbackRate init: 1');

	media.playbackRate(function () {
		deepEqual(media.playbackRate(), 2, 'playbackRate event');
	});

	deepEqual(media.playbackRate(2), media, 'playbackRate change: 2');
});


test("loop()", function() {
	var media = getMedia();

	deepEqual(media.loop(), false);
	deepEqual(media.loop(true), media);
	deepEqual(media.loop(), true);
});

test("autoplay()", function() {
	var media = getMedia();

	deepEqual(media.autoplay(), false);
	deepEqual(media.autoplay(true), media);

	if ($media.support('autoplay')) {
		deepEqual(media.autoplay(), true);
	} else {
		deepEqual(media.autoplay(), false);
	}
});

test("controls()", function() {
	var media = getMedia();

	deepEqual(media.controls(), false);
	deepEqual(media.controls(true), media);
	deepEqual(media.controls(), true);
});

test("poster()", function() {
	var media = getMedia();

	deepEqual(media.poster(), '');
	deepEqual(media.poster('new-poster.jpg'), media);
	deepEqual(media.poster(), document.location + 'new-poster.jpg');
});

test("preload()", function() {
	var media = getMedia();

	deepEqual(media.preload(), 'metadata');
	deepEqual(media.preload('auto'), media);
	deepEqual(media.preload(), 'auto');
});


test("width()", function() {
	var media = getMedia();

	deepEqual(media.width(true), media.get().videoWidth);
	deepEqual(media.width(300), media);
	deepEqual(media.width(), 300);
});

test("height()", function() {
	var media = getMedia();

	deepEqual(media.height(true), media.get().videoHeight);
	deepEqual(media.height(300), media);
	deepEqual(media.height(), 300);
});

test("volume()", 3, function() {
	var media = getMedia();

	media.volume(function () {
		start();

		deepEqual(this.volume(), 0.5);
	});

	deepEqual(media.volume(), 1);
	deepEqual(media.volume(0.5), media);

	if ($media.support('volume')) {
		stop();
	} else {
		ok(true, 'volume not supported');
	}
});


test("muted()", 2, function() {
	var media = getMedia();

	deepEqual(media.muted(), false, 'muted false on init');

	if ($media.support('muted')) {
		media.muted(function () {
			deepEqual(media.muted(), true, 'muted event');
		});

		media.muted(true);
		media.muted(true);
		media.muted(true);
	} else {
		ok(true, 'muted not supported');
	}
});


test("remove()", function() {
	var media = getMedia();

	media.remove(function () {
		ok(true, 'remove event');
	});

	media.remove();

	deepEqual(document.getElementById('video'), null);

	deepEqual(media.get(), null);
	deepEqual(media.$get(), null);
});


test("stop()", function() {
	var media = getMedia();

	media.stop(function () {
		deepEqual(this.playing(), false);
		deepEqual(this.readyState(1), false);
		deepEqual(this.time(), 0);
	});

	media.stop();
});

module('active');

test("readyState()", function () {
	var media = getMedia();

	deepEqual(media.readyState(), 0);
	deepEqual(media.readyState(0), true);

	stop();

	media.readyState(1, function () {
		ok(this.duration());

		this.play().pause().readyState(2, function () {
			ok(this.readyState() >= 2);

			this.readyState(3, function () {
				ok(this.readyState() >= 3);

				this.readyState(4, function () {
					start();
					ok(this.readyState() >= 4);
				});
			});
		});
	});
});


test("play(), playing()", function() {
	var media = getMedia();

	media.play(function () {
		start();

		deepEqual(media.playing(), true, 'play event: playing true');
		deepEqual(media.get().paused, false, 'play event: paused false');

		media.seek('100%');
		stop();
	});

	media.ended(function () {
		start();

		deepEqual(media.playing(), false, 'ended event: playing false');
		deepEqual(media.get().ended, true, 'ended event: ended true');
	});

	deepEqual(media.play(), media, 'play returns media');
	stop();
});

test("waiting()", function () {
	var media = getMedia();

	media.waiting(function () {
		start();

		deepEqual(this.waiting(), true);
		deepEqual(this.readyState(3), false);

		stop();

		this.readyState(3, function () {
			start();

			deepEqual(this.waiting(), false);
		});
	});

	media.source(sources2).play();

	deepEqual(media.waiting(), true);

	stop();
});

test("pause()", 3, function() {
	var media = getMedia();

	media.pause(function () {
		start();

		deepEqual(media.get().paused, true);
	});

	deepEqual(media.pause(), media);
	
	media.play(function () {
		deepEqual(media.pause(), media);
	});

	media.play();

	stop();
});


test("playPause()", 4, function() {
	var media = getMedia();

	media.playPause(function () {
		ok(true, 'playPause event');
	});

	media.play(function () {
		deepEqual(this.playing(), true, 'play event');
		
		this.playPause();
	});

	media.pause(function () {
		start();

		deepEqual(this.playing(), false, 'pause event');
	});

	media.playPause();

	stop();
});


test("ended()", function() {
	var media = getMedia();

	deepEqual(media.ended(), false);

	media.ended(function () {
		start();

		deepEqual(this.ended(), true);
	});

	media.seek('100%').play();

	stop();
});


test("seek(), seeking()", function() {
	var media = getMedia();

	media.seek(function () {
		start();

		deepEqual(Math.round(this.time()), 24, 'seek event: time');
		deepEqual(this.seeking(), false, 'seek event: seeking false');
	});

	media.seeking(function () {
		ok(true, 'seeking event');
	});

	media.seek(24);

	stop();
});


/*
test("fullScreen()", function() {
	var media = getMedia();
});

test("on()", function() {
	var media = getMedia();
});

test("off()", function() {
	var media = getMedia();
});

test("trigger()", function() {
	var media = getMedia();
});

test("triggerHandler()", function() {
	var media = getMedia();
});
*/


test("time()", function () {
	var media = getMedia();

	stop();

	media.readyState(1, function () {
		start();

		deepEqual(media.time(), 0);
		deepEqual(media.time('20'), 20);
		deepEqual(media.time('100%'), media.duration());
		deepEqual(media.time('50%'), (media.duration()/2).toSeconds());
	});
});


test("duration()", function () {
	var media = getMedia();

	stop();

	media.readyState(1, function () {
		start();

		ok(media.duration());
		deepEqual(media.duration(), media.get().duration.toSeconds());
	});
});


test("source()", function() {
	var media = getMedia();

	deepEqual(media.source(), media.get().currentSrc);
	deepEqual(media.source(true), sources);
	
	stop();

	media.readyState(1, function() {
		deepEqual(media.source(media.source()), media);

		media.readyState(1, function () {
			start();
			deepEqual(media.source(true)[0], media.source());

			this.source(sources2);

			stop();

			this.readyState(1, function () {
				start();

				deepEqual(this.source(), media.get().currentSrc);
				deepEqual(this.source(true), sources2);
			});
		});
	});
});