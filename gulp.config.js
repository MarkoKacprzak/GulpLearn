/*global module,require*/
module.exports = function () {
    'use strict';
    var client = 'src/client/',
        clientApp = client + 'app/',
        server = 'src/server/',
        temp = '.tmp/',
        config = {
            /*
            ** Files path
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
            less: client + 'styles/styles.less',
            server: server,
            temp: temp,
            /**
             * Bowe and NPM location
             */
            bower: {
                json: require('./bower.json'),
                directory: 'bower_components/',
                ignorePath: '../..'
            },
            css: temp + 'styles.css',
            /**
             * Node settings
             */
            defaultPort: 7203,
            nodeServer: './src/server/app.js'
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
