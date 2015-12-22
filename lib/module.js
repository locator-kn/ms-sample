'use strict';
var Joi = require('joi');
var Grid = require('gridfs-stream');
var mongodb = require('mongodb');

var routes = [];

routes.push({
    method: 'GET',
    path: '/file/{fileId}/{name}.{ext}',
    handler: (request, reply) => {
        var db = request.server.plugins['hapi-mongodb'].db;

        var gfs = new Grid(db, mongodb);

        var readstream = gfs.createReadStream({
            _id: request.params.fileId
        });

        return reply(readstream);
    },
    config: {
        auth: false,
        validate: {
            params: Joi.object().keys({
                fileId: Joi.string().required(),
                name: Joi.string().required(),
                ext: Joi.string().required()
                    .regex(/^jpg|png|jpeg|JPG|PNG|JPEG$/)
            })
        },
        tags: ['api']
    }
});


module.exports = routes;