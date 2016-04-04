/*global module,require*/
module.exports = function () {
    'use strict';
    var client = './src/client/',
        clientApp = client + 'app/',
        config = {
        
        /*
         * Files path
         */
            alljs: [
                './src/**/*.js',
                './*.js'
            ],
            client: client,
            index: client + 'index.html',
            js: [
                clientApp + '**/*.module.js',
                clientApp + '**/*.js',
                '!' + clientApp + '**/*.spec.js'
            ],
            temp: './.tmp/',
            less: client + 'styles/styles.less',
            /**
             * Bowe and NPM location
             */
            bower: {
                json: require('./bower.json'),
                directory: './bower_components/',
                ignorePath: '../..'
            }
             
            
        };
    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };
    return config;
};