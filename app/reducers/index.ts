export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const { combineReducers } = require('redux');
const interim = require('./interim');
const locations = require('./locations');
const notes = require('./notes');
const plants = require('./plants');
const user = require('./user');
const users = require('./users');

/** @type {import('redux').ReducersMapObject<any, PlantRedux.PlantAction>} */
const reducersMap = {
  interim,
  locations,
  notes,
  plants,
  user,
  users,
};

module.exports = combineReducers(reducersMap);

/*
State Shapes:

user: {
  _id: '',
  name: '',
  token: '',
  locations: [{
    _id: '',
    title: '',
    role: '',
    loc: {type: 'Point', coordinates: {'0': 111, '1': 66}},
    users: [{
      _id: '',
      name: '',
      role: 'owner/manager/viewer?'
    }]
  }]
},

users: { // Each user the same as user above but without token

},

plants: {
  <plant-id>: {
    _id: <plant-id>,
    summary: true, // if true then notes have not been fetched
    userId: <user-id>,
    title: '',
    commonName: '',
    botanicalName: '',
    notes: [{
      _id: <note-id>,
      date: ''
    }] // if summary is false then this is complete
  }
}

notes: {
  <note-id>: {
    _id: <note-id>
    date: a date
    plantIds: [plantId, plantId, ...]
    images: [{
      id: id of file on S3
      ext: file extension
      originalname: original file name
      size: a number,
      sizes: [{
        width: a number,
        name: 'thumb/orig?/sm/md/lg/xl'
      }]
    }, ...]
  }
}

*/
