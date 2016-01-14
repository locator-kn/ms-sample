'use strict';
const Glue = require('glue');

require('dotenv').config({path: '../.env'});
const routes = require('./lib/module');


// declare  plugins
var manifest = {
    connections: [{
        //host: process.env['API_HOST'] || 'localhost',
        port: process.env['FILE_SERVE_PORT'] || 3453
    }],
    plugins: [{
        'hapi-mongodb': [{
            options: {
                'url': 'mongodb://localhost:27017/locator',
                'settings': {
                    'db': {
                        'native_parser': false
                    }
                }
            }
        }]
    }, {
        'inert': {}
    }, {
        'vision': {}
    }, {
        'hapi-swagger': {}
    }, {
        'hapi-auth-cookie': {}
    }, {
        'good': [{
            options: {
                requestPayload: true,
                reporters: [{
                    reporter: require('good-console'),
                    events: {log: '*', response: '*', request: '*'}
                }]
            }
        }]
    }]
};


// compose Server with plugins
Glue.compose(manifest, {relativeTo: __dirname}, (err, server) => {

    if (err) {
        throw err;
    }

    server.route(routes);

    // start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
