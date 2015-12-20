'use strict';

const db = require('./database');
var Grid = require('gridfs-stream');
var mongodb = require('mongodb');


const fns = {};

/**
 * Returns nothing, nothing
 * @returns {string} - nothing
 * @private
 */
function _anything() {
    return 'nothing';
}

/**
 * This function does something, sometimes
 * @param message - some data from outside
 * @param next - callback function - to be called in node-style: (err, message)
 * @returns {Promise.<T>}
 */
fns.getImage = (message, next) => {


    var gfs = new Grid(db, mongodb);

    var readstream = gfs.createReadStream({
        _id: request.params.companyId
    });

    return next(readstream);

  /*  return db.getAllUsers(message)
        .then(data => {
            next(null, {doc: 'asd', processId: process.pid});
        }).catch(err => {
            return next({message: 'cmd was not test', code: 4000});
        });*/

};

/**
 * This function does something else
 * @param message - some data
 * @param next - callback
 */
fns.doSomethingElse = (message, next) => {
    let noth = _anything();
    next(null, {
        doc: 'asd',
        processId: process.pid,
        howMuch: noth
    });
};

module.exports = fns;