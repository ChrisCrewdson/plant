const _ = require('lodash');
const mongoDb = require('../db/mongo')();
const passportFacebook = require('passport-facebook');
const logger = require('../logging/logger').create('passport-facebook');

const FacebookStrategy = passportFacebook.Strategy;

function fbPassport(passport) {
  const { PLANT_FB_ID, PLANT_FB_SECRET } = process.env;
  if (!PLANT_FB_ID || !PLANT_FB_SECRET) {
    logger.error(
      'Missing PLANT_FB_ID and/or PLANT_FB_SECRET environment variables',
      { PLANT_FB_ID, PLANT_FB_SECRET },
    );
  }

  passport.use(new FacebookStrategy(
    {
      clientID: PLANT_FB_ID,
      clientSecret: PLANT_FB_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
    },

    // facebook will send back the token and profile
    (token, refreshToken, profile, done) => {
      logger.trace('Facebook passport callback:', { profile });
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
      return mongoDb.findOrCreateUser(newUser)
        .then((user) => {
          if (!user) {
            throw new Error('No user returned');
          }
          return done(null, user);
        })
        .catch((findOrCreateUserError) => {
          logger.error('findOrCreateUser()', { findOrCreateUserError, newUser });
          return done(findOrCreateUserError);
        });
    },
  ));
}

module.exports = { fbPassport };
