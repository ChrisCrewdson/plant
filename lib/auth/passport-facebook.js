const _ = require('lodash');
const Logger = require('lalog');

const FacebookStrategy = require('@passport-next/passport-facebook').Strategy;

const mongoDb = require('../db/mongo')();
const { SERVICE_NAME } = require('../../app/libs/constants');

const moduleName = 'lib/auth/passport-facebook';

const localLogger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName,
  addTrackId: true,
});

// These are the user fields we are requesting from Facebook
const profileFields = [
  'id',
  'emails',
  'gender',
  'link',
  'locale',
  'name',
  'timezone',
  'updated_time',
  'verified',
];

function fbPassport(passport) {
  const { PLANT_FB_ID, PLANT_FB_SECRET } = process.env;

  if (!PLANT_FB_ID) {
    localLogger.error({
      msg: 'Missing PLANT_FB_ID environment variable',
      PLANT_FB_ID,
    });
  }

  if (!PLANT_FB_SECRET) {
    localLogger.error({
      msg: 'Missing PLANT_FB_SECRET environment variable',
      PLANT_FB_SECRET,
    });
  }

  passport.use(new FacebookStrategy(
    {
      clientID: PLANT_FB_ID,
      clientSecret: PLANT_FB_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields,
      graphApiVersion: 'v2.12',
    },

    // facebook will send back the token and profile
    (token, refreshToken, profile, done) => {
      localLogger.trace({
        msg: 'Facebook passport callback:',
        profile,
      });
      // Setup for new user in case user is not in DB
      const createdDate = new Date();
      const email = _.get(profile, '_json.emails.0', '') || _.get(profile, '_json.email', '');
      const newUser = {
        facebook: profile._json,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        createdAt: createdDate,
        updatedAt: createdDate,
      };

      if (email) {
        newUser.email = email.toLowerCase();
      }

      // find the user in the database based on their facebook id
      return mongoDb.findOrCreateUser(newUser, localLogger)
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

module.exports = { fbPassport };
