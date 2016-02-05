import {makeCouchId} from '../app/libs/utils';

// import d from 'debug';
// const debug = d('plant:test.fake-passport');

const userId = makeCouchId();

export default {

  getUserId: () => {
    return userId;
  },

  initialize: () => {
    // debug('fake fb initialize setup');
    return (req, res, next) => {
      // debug('fake fb initialize called');
      next();
    };
  },

  authenticate: (type, cb) => {
    if(cb) {
      // debug('fake fb authenticate setup with cb');
      const err = null;
      const user = {
        _id: userId,
        name: 'John Smith'
      };
      const info = {};
      return () => {
        // debug('fake fb authenticate called with cb, arg.length:', arguments.length);
        return cb(err, user, info);
      };
    } else {
      // debug('fake fb authenticate setup');
      return (req, res, next) => {
        // debug('fake fb authenticate called, arg.length:', arguments.length);
        return next();
      };
    }
  },

  use: (/* strategy */) => {
    // debug('fake fb use:', arguments.length);
  }
};
