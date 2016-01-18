'use strict';
var Joi = require('joi');
var Boom = require('boom');
var Grid = require('gridfs-stream');
var mongodb = require('mongodb');
var util = require('./util');

var routes = [];
var methods = {
    genericFileUpload: (request, reply, type, regex) => {

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
        if (!regex.test(file.hapi.headers['content-type'])) {
            return reply(Boom.unsupportedMediaType('Only ' + type + ' format allowed'));
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
    }
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
                    .regex(/^jpg|png|jpeg|JPG|PNG|JPEG|mp4|mpeg|MP4|MPEG$/)
            })
        },
        tags: ['api']
    }
});

routes.push({
    method: 'POST',
    path: '/stream/image',
    handler: (request, reply) => {

        let regex = /^image\/(?:jpg|png|jpeg)$/;
        methods.genericFileUpload(request, reply, 'image', regex)

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
    method: 'POST',
    path: '/stream/video',
    handler: (request, reply) => {

        let regex = /^video\/(?:mp4|mpeg)$/;
        methods.genericFileUpload(request, reply, 'video', regex);

    },
    config: {
        description: 'Add video',
        notes: 'Uploads a video to db',
        tags: ['api', 'new', 'video'],
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
    method: 'POST',
    path: '/stream/video',
    handler: (request, reply) => {

        let regex = /^audio\/mp3$/;
        methods.genericFileUpload(request, reply, 'video', regex);

    },
    config: {
        description: 'Add audio',
        notes: 'Uploads an audio file to db',
        tags: ['api', 'new', 'audio'],
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
    path: '/file/{fileId}',
    handler: (request, reply) => {

        var id = request.params.fileId;

        var db = request.server.plugins['hapi-mongodb'].db;

        var gfs = new Grid(db, mongodb);

        gfs.remove({_id: id}, err => {

            if (err) {
                reply(Boom.badImplementation(err));
            }
            reply('OK');
        });

    },
    config: {
        description: 'Delete file',
        notes: 'Deletes a file with the given ID',
        tags: ['api', 'delete', 'file'],
        validate: {
            params: {
                fileId: Joi.string().required()
            }
        }
    }
});


module.exports = routes;