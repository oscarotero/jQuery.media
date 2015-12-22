"use strict";

require([
    'jquery',
    'jquery.media',
    './canvas-effects',
    'jquery.media/canvas',
], function ($, Media, effects) {
    var $ascii = $('#ascii');

    var video = Media.createVideo('files/video2.ogv').toCanvas('canvas', function (context, width, height) {
        var frame = context.getImageData(0, 0, width, height);
        var total = frame.data.length;
        var ascii_frame = '';

        for (var i = 0; i < total; i += 4) {
            effects.grayscale(frame.data, i);
            ascii_frame += effects.ascii(frame.data, i, width);
        }

        context.putImageData(frame, 0, 0);
        $ascii.html(ascii_frame);
    });

    video.muted(true).play();
});