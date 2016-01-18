'use strict';
var Joi = require('joi');
var Boom = require('boom');
var Grid = require('gridfs-stream');
var mongodb = require('mongodb');
var util = require('./util');

var routes = [];
var methods = {};

methods.deleteFile = (id, request, reply) => {

    var db = request.server.plugins['hapi-mongodb'].db;

    var gfs = new Grid(db, mongodb);

    gfs.remove({_id: id}, err => {

        if (err) {
            reply(Boom.badImplementation(err));
        }
        reply('OK');
    });

};

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
    path: '/stream/image',
    handler: (request, reply) => {

        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

        // generate ID
        var id = new ObjectID();

        // check on correct file
        var file = request.payload.file[1] || request.payload.file;
        if (!file || !file.hapi) {
            return reply(Boom.badRequest('File required!'));
        }

        // test if an image format
        if (!/^image\/(?:jpg|png|jpeg)$/.test(file.hapi.headers['content-type'])) {
            return reply(Boom.unsupportedMediaType('Only picture format allowed'));
        }

        var gfs = new Grid(db, mongodb);

        // create a writestream for the db
        var writestream = gfs.createWriteStream({
            filename: file.hapi.filename,
            _id: id
        });

        // stream image in db
        file.pipe(writestream);

        // succesful upload of image
        writestream.on('close', file => {
            reply(file);
        });

        writestream.on('error', err => {
            reply(Boom.badRequest(err));
        });

    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image to a location',
        tags: ['api', 'location', 'new', 'image'],
        validate: {
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


routes.push({
    method: 'DELETE',
    path: '/stream/image/{imageId}',
    handler: (request, reply) => {

        var id = request.params.imageId;

        methods.deleteFile(id, request, reply);

    },
    config: {
        description: 'Delete Image',
        notes: 'Deletes an image with the given ID',
        tags: ['api', 'delete', 'image'],
        validate: {
            params: {
                imageId: Joi.string().required()
            }
        }
    }
});


        var db = request.server.plugins['hapi-mongodb'].db;

        var gfs = new Grid(db, mongodb);

        gfs.remove({_id: request.params.imageId}, err => {

            if (err) {
                reply(Boom.badImplementation(err));
            }
            reply('OK');
        });

    },
    config: {
        description: 'Delete Image',
        notes: 'Deletes an image with the given ID',
        tags: ['api', 'delete', 'image'],
        validate: {
            params: {
                imageId: Joi.string().required()
            }
        }
    }
});

module.exports = routes;