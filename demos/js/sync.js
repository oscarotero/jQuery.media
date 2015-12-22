"use strict";

require([
    'jquery',
    'jquery.media',
    'jquery.media/sync',
], function ($, Media) {
    var video1 = Media.create('#v1');
    var video2 = Media.create('#v2');
    var video3 = Media.create('#v3');
    var video4 = Media.create('#v4');

    video1.syncWith(video2).syncWith(video3).syncWith(video4);
});