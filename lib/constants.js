
const appConstants = require('../app/libs/constants');

module.exports = Object.freeze(Object.assign({}, appConstants, {
  sessionKey: 'plantSession', // Key for cookie to hold session. Managed by Passport
}));
