var sources = ["http://archive.org/download/Lets_Sing_with_Popeye_1936/Popeye_Lets_Sing_with_Popeye_1934_512kb.mp4", "http://ia600409.us.archive.org/10/items/Lets_Sing_with_Popeye_1936/Popeye_Lets_Sing_with_Popeye_1934.ogv"];
var sources2 = ["http://media.w3.org/2010/05/sintel/trailer.mp4", "http://media.w3.org/2010/05/sintel/trailer.webm", "http://media.w3.org/2010/05/sintel/trailer.ogv"];
var media;

var getMedia = function () {
	media = $.media('#video');
	
	return media;
}

module("pasive");

test("createTimeline(name)", function () {
	var media = getMedia();

	media.createTimeline('test');

	ok(media.timelines.test);
	deepEqual(media.timelines.test.enabled, false);
	deepEqual(media.timelines.test.data, {});
	deepEqual(media.timelines.test.points, {});

	media.removeTimeline('test');
	deepEqual(media.timelines.test, undefined);
});

test("createTimeline(name, options)", function () {
	var media = getMedia();

	media.createTimeline('test', {
		enabled: true,
		data: {foo: "bar"},
		points: {
			time: '00:03',
			fn: function () {
				this.pause();
			}
		}
	});

	deepEqual(media.timelines.test.enabled, true);
	deepEqual(media.timelines.test.data.foo, "bar");
	deepEqual(media.timelines.test.points[3000][0].time, ["00:03", "00:03"]);
	deepEqual(media.timelines.test.points[3000][0].data, {});
	deepEqual(media.timeline.points.length, 1);
});

test("add points, enable/disable, etc", function () {
	var media = getMedia();

	media.createTimeline('test');

	media.addTimelinePoints('test', {
		time: 3,
		data: {foo: "bar"},
		fn: function () {
			this.pause();
		}
	});
	media.addTimelinePoints('test', [
		{
			time: 3,
			data: {foo: "bar2"},
			fn: function () {
				this.pause();
			}
		},
		{
			time: 6,
			fn: function () {
				this.pause();
			}
		},
		{
			time: 9,
			fn: function () {
				this.pause();
			}
		}
	]);

	deepEqual(media.timelines.test.enabled, false);
	deepEqual(media.timelines.test.points[3000][0].time, [3, 3]);
	deepEqual(media.timelines.test.points[3000][0].data.foo, "bar");
	deepEqual(media.timelines.test.points[3000][1].data.foo, "bar2");
	deepEqual(media.timelines.test.points[9000][0].data, {});
	
	deepEqual(media.timeline.points.length, 0);
	deepEqual(media.timelineIsEnabled('test'), false);
	media.enableTimeline('test');
	deepEqual(media.timelineIsEnabled('test'), true);
	deepEqual(media.timeline.points.length, 4);
	media.disableTimeline('test');
	deepEqual(media.timelineIsEnabled('test'), false);
	deepEqual(media.timelineIsEnabled('test2'), false);
	deepEqual(media.timeline.points.length, 0);

	deepEqual(media.timelineExists('test'), true);
	deepEqual(media.timelineExists('test2'), false);
});

module("active");

test("timeline functions", function () {
	var media = getMedia();

	stop();

	media.createTimeline('test', {
		enabled: true,
		points: [
			{
				time: '00:03',
				fn: function () {
					ok(true, '00:03');
				}
			},{
				time: '00:04',
				fn: function () {
					ok(true, '00:04');
				}
			},{
				time: '00:06',
				fn: function () {
					ok(true, '00:06');
				}
			},{
				time: '5%',
				fn: function () {
					ok(true, '5%');
				}
			},{
				time: [10, 12],
				fn: function () {
					var time = this.time();

					ok((time > 10 && time < 12), '10-12 in');
				},
				fn_out: function () {
					var time = this.time();

					ok((time < 10 || time > 12), '10-12 out');
					start();
				}
			}
		]
	}).play();
});