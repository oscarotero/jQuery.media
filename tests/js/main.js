"use strict";

require.config({
    paths: {
        "jquery": "../../node_modules/jquery/dist/jquery"
    },
    packages: [
        {
            name: 'jquery.media',
            location: '../../src',
            main: 'media'
        }
    ]
});

require([
    "jquery"
], function ($) {
    $('script[data-module]').each(function () {
        require(['./' + $(this).data('module')]);
    });
});
