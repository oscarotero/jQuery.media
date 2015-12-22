"use strict";

require([
    'jquery',
    'jquery.media'
], function ($, Media) {
    var video = Media.create('#v1');

    $('#fullscreen').click(function () {
        video.fullScreen();
    });

    video.fullScreen(function (event, fullScreen) {
        alert('fullScreen: ' + fullScreen);
    });
});