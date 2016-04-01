/*global module*/
module.exports = function () {
    'use strict';
    var client = './src/client/';
    var config = {
        
        /*
         * Files path
         */
        alljs: [
            './src/**/*.js',
            './*.js'
        ],
        temp: './.tmp',
        less: client + 'styles/styles.less'
    };
    
    return config;
};