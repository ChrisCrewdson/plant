const _ = require('lodash');
const mongo = require('../db/mongo');
const passportGoogle = require('passport-google-oauth20');
const logger = require('../logging/logger').create('passport-google');

const GoogleStrategy = passportGoogle.Strategy;

function googlePassport(passport) {
  const { PLANT_GOOGLE_ID, PLANT_GOOGLE_SECRET } = process.env;
  if (!PLANT_GOOGLE_ID || !PLANT_GOOGLE_SECRET) {
    logger.error('Missing PLANT_GOOGLE_ID and/or PLANT_GOOGLE_SECRET environment variables',
      { PLANT_GOOGLE_ID, PLANT_GOOGLE_SECRET });
  }

  passport.use(new GoogleStrategy({
    clientID: PLANT_GOOGLE_ID,
    clientSecret: PLANT_GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
  },

  // Google will send back the token and profile
  (token, refreshToken, profile, done) => {
    logger.trace('Google passport callback:', { profile });
    // Setup for new user in case user is not in DB
    const createdDate = new Date();
    const email = _.get(profile, 'emails.0.value', '');

    const newUser = {
      google: profile._json,
      name: profile.displayName,
      createdAt: createdDate,
      updatedAt: createdDate,
    };

    if (email) {
      newUser.email = email.toLowerCase();
    }

    // find the user in the database based on their Google id
    mongo.findOrCreateUser(newUser, (findOrCreateUserError, user) => {
      if (findOrCreateUserError || !user) {
        logger.error('Error from findOrCreateUser or no user returned', { findOrCreateUserError }, { user });
        return done(findOrCreateUserError || new Error('Could not find or create user.'));
      }

      // if the user is found, then log them in
      return done(null, user);
    });
  }));
}

module.exports = { googlePassport };
