const _ = require('lodash');
const jwt = require('jwt-simple');

const moduleName = 'lib/config/token-check';

const tokenSecret = process.env.PLANT_TOKEN_SECRET;

function tokenCheck(req, res, next) {
  const { logger } = req;
  const token = _.get(req, 'headers.authorization');
  req.isAuthenticated = false;

  if (token) {
    const parts = token.split(' ');
    if (parts.length === 2) {
      if (parts[0] !== 'Bearer') {
        logger.error({
          moduleName,
          msg: 'Problem: First part of token is not Bearer',
          tokenFirstPart: parts[0],
          token,
        });
      }
      let user;
      try {
        user = jwt.decode(parts[1], tokenSecret);
      } catch (jwtDecodeError) {
        logger.error({
          moduleName, msg: 'Caught error from jwt.decode', err: jwtDecodeError, token,
        });
      }
      if (user) {
        req.user = user;
        req.isAuthenticated = true;
      }
    } else {
      logger.error({ moduleName, msg: 'Token unexpectedly does not have one space', token });
    }
  }

  next();
}

function requireToken(req, res, next) {
  if (!req.isAuthenticated) {
    // debug('auth failed in requireToken');
    return res.status(401).send({ error: 'Not Authenticated' });
  }
  return next();
}

module.exports = {
  tokenCheck,
  requireToken,
};
