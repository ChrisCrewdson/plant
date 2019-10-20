import { combineReducers, ReducersMapObject } from 'redux';
import { interim } from './interim';
import { locations } from './locations';
import { notes } from './notes';
import { plants } from './plants';
import { user } from './user';
import { users } from './users';
import { PlantAction } from '../../lib/types/redux-payloads';

const reducersMap: ReducersMapObject<any, PlantAction> = {
  interim,
  locations,
  notes,
  plants,
  user,
  users,
};

export default combineReducers(reducersMap);

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
