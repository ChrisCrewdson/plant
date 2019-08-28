
const appConstants = require('../app/libs/constants');

// Key for cookie to hold session. Managed by Passport
module.exports = Object.freeze({ ...appConstants, sessionKey: 'plantSession' });
