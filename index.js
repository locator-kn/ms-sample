'use strict';
const seneca = require('seneca')();
const file = require('./lib/module');
const database = require('./lib/database');

require('dotenv').config({path: '../.env'});

// select desired transport method
const transportMethod = process.env['SENECA_TRANSPORT_METHOD'] || 'rabbitmq';
const patternPin = 'role:file';

// init database and then seneca and expose functions
database.connect()
    .then(() => {
        seneca
            .use(transportMethod + '-transport')
            .add(patternPin + ',cmd:get', file.getImage)
            .listen({type: transportMethod, pin: patternPin});
    });
