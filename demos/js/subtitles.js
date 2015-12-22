"use strict";

require([
    'jquery',
    'jquery.media/media',
    'jquery.media/tracks'
], function ($, Media) {
    var video = Media.create('video');
                
    $('#change_subtitles input:checkbox').click(function () {
        var value = $(this).val();

        if (!video.timelineExists(value)) {
            video.createTimelineFromTrack(value, {
                track: value
            });
        }

        if ($(this).prop('checked')) {
            video.enableTimeline(value);
        } else {
            video.disableTimeline(value);
        }
    });
});