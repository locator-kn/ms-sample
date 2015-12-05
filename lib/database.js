'use strict';
const mongo = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/unicorn';

const fns = {};

fns.getAllUsers = (message) => {
    if (message.cmd !== 'test') {
        return Promise.reject({message: 'cmd was not test', code: 4000});
    }
    return Promise.resolve({doc: 'asd', processId: process.pid});
};

fns.connect = () => {
    return mongo.connect(mongoUrl);
};


module.exports = fns;