/*global module*/
module.exports = function () {
    'use strict';
    var config = {
        
        // all js to vet
        alljs: [
            './src/**/*.js',
            './*.js'
        ]
    };
    
    return config;
};