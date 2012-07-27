var getMedia = function () {
	return $.media('#video');
}


test("attr()", function() {
	var media = getMedia();

	deepEqual(media.attr('id'), 'video');
	deepEqual(media.attr('controls', 'controls'), media);
	deepEqual(media.attr('controls'), 'controls');
});


test("readyState()", function () {
	var media = getMedia();

	deepEqual(media.readyState(), 0);
	deepEqual(media.readyState(0), true);

	stop();

	media.readyState(1, function () {
		start();

		ok(this.duration());
	});
});


test("canPlayType()", function () {
	var media = getMedia();

	ok(media.canPlayType());
	ok(media.canPlayType(media.source(true)));
	deepEqual(media.canPlayType('foo'), 0);
});


test("duration()", function () {
	var media = getMedia();

	deepEqual(media.duration(), 0);

	stop();

	media.duration(function () {
		start();

		ok(media.duration());
		deepEqual(media.duration(), media.get().duration.toSeconds());
		ok(media.readyState(1));
	});
});