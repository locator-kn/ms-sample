'use strict';
var Joi = require('joi');
var Boom = require('boom');
var Grid = require('gridfs-stream');
var mongodb = require('mongodb');
var util = require('./util');

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

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/stream/image',
    handler: (request, reply) => {

        reply(Boom.notImplemented('wait for it'));

        util.safeObjectId(request.auth.credentials.id)
            .then()
            .catch();


        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;


    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image to a location',
        tags: ['api', 'location', 'new', 'image'],
        validate: {
            params: Joi.string().required(),
            payload: {
                file: Joi.any().required().meta({swaggerType: 'file'})
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6 // 6MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});


module.exports = routes;