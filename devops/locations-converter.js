// One off utility to convert the locations collection
// from this shape:

// const oldShape = {
//   _id: ObjectId('123'),
//   userId: ObjectId('456'),     // rename to "createdBy"
//   userIds: [                   // Change to key/value object and rename to "members"
//     {
//       id: ObjectId('456'),
//       role: 'owner',
//     },
//   ],
//   title: 'John Smith Yard',
//   loc: {
//     type: 'Point',
//     coordinates: {
//       0: 0,
//       1: 0,
//     },
//   },
// };

// // To this shape:

// const newShape = {
//   _id: ObjectId('123'),
//   createdBy: ObjectId('456'),
//   members: {
//     456: 'owner',
//   },
//   stations: {},                           // New collection
//   title: 'John Smith Yard',
//   loc: {
//     type: 'Point',
//     coordinates: {
//       0: 0,
//       1: 0,
//     },
//   },
// };

// const mongo = require('../lib/db/mongo');
// const async = require('async');
// const Logger = require('../lib/logging/logger');

// /* eslint-disable no-param-reassign, no-console */

// if (!process.env.DEBUG) {
//   console.log('Set DEBUG env to "plant:*" before running...');
//   process.exit(1);
// }

// Logger.setLevel('trace');
// const logger = new Logger('devops-location-converter');

// mongo.queryByCollection('location', {}, (allLocationsErr, locations) => {
//   if (allLocationsErr) {
//     logger.trace('allLocationsErr', { allLocationsErr });
//     return;
//   }

//   logger.trace(`About to process ${locations.length} locations`);

//   async.each(locations, (location, cb) => {
//     location.createdBy = location.userId;
//     delete location.userId;

//     location.members = {};
//     location.userIds.forEach((userId) => {
//       location.members[userId.id.toString()] = userId.role;
//     });
//     delete location.userIds;

//     location.stations = {};

//     mongo.replaceDocument('location', location, cb);
//   }, (asyncEachLocationErr) => {
//     if (asyncEachLocationErr) {
//       logger.trace('asyncEachLocationErr', { asyncEachLocationErr });
//     } else {
//       logger.trace('All complete');
//     }
//     logger.trace('Closing...');
//     mongo._close();
//   });
// });
