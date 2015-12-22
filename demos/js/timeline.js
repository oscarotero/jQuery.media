"use strict";

require([
    'jquery',
    'jquery.media/media',
    'jquery.media/timeline'
], function ($, Media) {
    var video = Media.create('video');
    var log = $('#log');
    
    video.createTimeline('first', {
        enabled: true,
        points: [
            {
                time: 2,
                fn: function (point, timeline) {
                    log.html('First timeline, 2s');

                    this.createTimeline('second', {
                        points: {
                            time: 5,
                            fn: function () {
                                log.html('Second timeline, 5s');
                            }
                        }
                    });
                }
            },{
                time: [3, '00:04'],
                fn: function () {
                    log.html('First timeline, 3-4s');
                    this.enableTimeline('second');
                }
            },{
                time: [5, 6],
                fn: function () {
                    log.html('First timeline, in 5-6s');
                },
                fn_out: function () {
                    log.html('First timeline, out 5-6s');
                }
            }
        ]
    }).play();
});