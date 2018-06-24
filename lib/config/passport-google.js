const _ = require('lodash');
const passportGoogle = require('passport-google-oauth20');
const Logger = require('lalog');
const mongoDb = require('../db/mongo')();
const { SERVICE_NAME } = require('../../app/libs/constants');

const moduleName = 'lib/config/passport-google';

const localLogger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName,
  addTrackId: true,
});

const GoogleStrategy = passportGoogle.Strategy;

function googlePassport(passport) {
  const { PLANT_GOOGLE_ID, PLANT_GOOGLE_SECRET } = process.env;
  if (!PLANT_GOOGLE_ID) {
    localLogger.error({
      msg: 'Missing PLANT_GOOGLE_ID environment variables',
      PLANT_GOOGLE_ID,
    });
  }
  if (!PLANT_GOOGLE_SECRET) {
    localLogger.error({
      msg: 'Missing PLANT_GOOGLE_SECRET environment variables',
      PLANT_GOOGLE_SECRET,
    });
  }

  passport.use(new GoogleStrategy(
    {
      clientID: PLANT_GOOGLE_ID,
      clientSecret: PLANT_GOOGLE_SECRET,
      callbackURL: '/auth/google/callback',
      profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
    },

    // Google will send back the token and profile
    (token, refreshToken, profile, done) => {
      localLogger.trace({ msg: 'Google passport callback:', profile });
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
      mongoDb.findOrCreateUser(newUser, localLogger)
        .then((user) => {
          if (!user) {
            throw new Error('No user returned');
          }
          return done(null, user);
        })
        .catch((findOrCreateUserError) => {
          localLogger.error({ msg: 'findOrCreateUser()', err: findOrCreateUserError, newUser });
          return done(findOrCreateUserError);
        });
    },
  ));
}

module.exports = { googlePassport };
