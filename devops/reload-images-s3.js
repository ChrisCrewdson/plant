// Utility to reload images on S3 so that the Lambda Function picks them
// up and processes them again.

// require('babel-core/register');

// const Logger = require('../lib/logging/logger');
// const _ = require('lodash');
// const async = require('async');
// const AWS = require('aws-sdk');
// const constants = require('../app/libs/constants');
// const mongo = require('../lib/db/mongo');

// Logger.setLevel('trace');
// const logger = Logger.create('plant:reload-images');
// const s3 = new AWS.S3();
// const Bucket = 'i.plaaant.com';
// const Prefix = 'up/orig';

// function getListOfKeys(cb) {
//   logger.trace('getListOfKeys() start');
//   const params = { Bucket, Prefix };
//   s3.listObjectsV2(params, (listObjectsErr, objects) => {
//     if (listObjectsErr) {
//       logger.error('listObjectsV2', { listObjectsErr });
//     }
//     /* data: { IsTruncated: false,
//     Contents:
//     [ { Key: 'test/orig/2016-09-15 19.10.00.jpg',
//         LastModified: 2016-09-16T19:58:40.000Z,
//         ETag: '"5291ce2b140317adfd5dc44e"',
//         Size: 3494653,
//         StorageClass: 'STANDARD' },
//         ...
//     ],
//     Name: 'i.plaaant.com',
//     Prefix: 'test/orig',
//     MaxKeys: 1000,
//     CommonPrefixes: [],
//     KeyCount: 4 }
//   */
//     const keys = objects.Contents.map(content => content.Key);
//     logger.trace('Number of keys', { keyCount: keys.length });
//     cb(listObjectsErr, keys);
//   });
// }

// function getImageIds(keys, cb) {
//   logger.trace('getImageIds() start');
//   const filenames = keys.map((key) => {
//     const parts = key.split('/');
//     return {
//       key,
//       imageId: _.last(parts).split('.')[0],
//     };
//   });
//   logger.trace(`${filenames.length} keys before filtering`);

//   const imageIds = filenames.filter(fn => constants.mongoIdRE.test(fn.imageId));
//   logger.trace(`${imageIds.length} image ids after filtering`);

//   cb(null, imageIds);
// }

// // data is an array. Each object in array:
// //   key, imageId
// function getMetadata(data, cb) {
//   logger.trace('getMetadata() start');
//   async.map(data, (item, done) => {
//     mongo.getNoteByImageId(item.imageId, (getNoteByImageIdErr, note) => {
//       if (getNoteByImageIdErr) {
//         logger.error('Error getting note:', { getNoteByImageIdErr });
//         return done(getNoteByImageIdErr);
//       }
//       if (!note.images || !note.images.length) {
//         logger.error('No images in note:', { note });
//         return done('No images');
//       }
//       const image = note.images.find(img => img.id === item.imageId);
//       if (!image) {
//         logger.error('Image not found in note',
//            { imageId: item.imageId, 'note.images': note.images });
//         return done('No image');
//       }
//       return done(null, {
//         Key: item.key,
//         Metadata: {
//           userid: note.userId,
//           id: image.id,
//           noteid: note._id,
//           originalname: image.originalname,
//         },
//       });
//     });
//   }, (asyncMapError, results) => {
//     if (asyncMapError) {
//       logger.error('asyncMapError in getMetadata', { asyncMapError });
//     }
//     cb(asyncMapError, results);
//   });
// }

// // data is an array with {Key, Metadata}
// function resaveImage(data, cb) {
//   logger.trace('resaveImage() start', { data });
//   // Slow this part down by running in series
//   async.mapSeries(data, (item, done) => {
//     const { Key, Metadata } = item;
//     const getParams = { Key, Bucket };
//     s3.getObject(getParams, (getObjectErr, getObjectResult) => {
//       if (getObjectErr) {
//         return done(getObjectErr);
//       }
//       const putParams = {
//         Key: Key.replace('up', 'test'),
//         Body: getObjectResult.Body,
//         Bucket,
//         Metadata,
//       };
//       logger.trace('About to put object', { putParams });
//       return s3.putObject(putParams, (err, result) => {
//         logger.trace('PUT complete, wait for 1 second...', { Key });
//         // Pause at this point to let server keep up with Lambda requests
//         setTimeout(() => { done(err, result); }, 1000);
//       });
//     });
//   }, (asyncMapError, results) => {
//     if (asyncMapError) {
//       logger.error('resaveImage async.map', { asyncMapError });
//     }
//     return cb(asyncMapError, results);
//   });
// }

// logger.trace('Start process...');

// async.waterfall([
//   getListOfKeys,
//   getImageIds,
//   getMetadata,
//   resaveImage,
// ], (waterfallErr, data) => {
//   logger.trace('Waterfall completed', { waterfallErr, data });
// });


// function getMetadata(data, cb) {
//   async.map(data.keys, (Key, done) => {
//     const headParams = {Bucket, Key};
//     s3.headObject(headParams, (err, head) => {
//       return done(err, {
//         Key,
//         Metadata: head.Metadata
//       });
//     });
//   }, (headObjectErr, results) => {
//     /*
//     results:
//     [ { Key: 'up/orig/', Metadata: {} },
//   { Key: 'up/orig/57cf46f4b3xeaa59f748927e.jpg', Metadata: {} },
//   { Key: 'up/orig/57cf51cfbxdeaa59f748927f.jpg',
//     Metadata:
//      { userid: '57b4e90d9f0e4e114b44bcf8',
//        originalname: '2016-08-28 08.27.58.jpg' } },
//   { Key: 'up/orig/57cf51cfb3deaa59f7489280.jpg',
//     Metadata:
//      { userid: '57b4e90d9f0e4e114b44bcf8',
//        originalname: '2016-08-28 08.28.13.jpg' } },
//        ...
//     Metadata:
//      { userid: '57b4e90d9f0e4e114b44bcf8',
//        id: '57dc0b1c3b2e230cf7f53b50',
//        noteid: '57dc0b13e94fe900009b53c6',
//        originalname: '14740384909001648264926' }
//      */
//     logger.trace('headObjectErr:', headObjectErr);
//     logger.trace('results:', results);
//     logger.trace('users:', results.map(result => result.Metadata.userid));
//     data.metadata = results;
//     cb(headObjectErr, data);
//   });
// }
