const _ = require('lodash');
const mongoDb = require('../db/mongo');
const passportFacebook = require('passport-facebook');
const logger = require('../logging/logger').create('passport-facebook');
const FacebookStrategy = passportFacebook.Strategy;

function fbPassport (passport) {

  passport.use(new FacebookStrategy({
    clientID: process.env.PLANT_FB_ID,
    clientSecret: process.env.PLANT_FB_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
  },

  // facebook will send back the token and profile
  (token, refreshToken, profile, done) => {
    logger.trace('Facebook passport callback:', {profile});
    // Setup for new user in case user is not in DB
    const createdDate = new Date();
    const email = _.get(profile, '_json.emails.0', '') || _.get(profile, '_json.email', '');
    var newUser = {
      facebook: profile._json,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      createdAt: createdDate,
      updatedAt: createdDate
    };

    if(email) {
      newUser.email = email.toLowerCase();
    }

    // find the user in the database based on their facebook id
    mongoDb.findOrCreateUser(newUser, (findOrCreateUserError, user) => {

      if (findOrCreateUserError || !user) {
        logger.error('Error from findOrCreateUser or no user returned', {findOrCreateUserError}, {user});
        return done(findOrCreateUserError || new Error('Could not find or create user.'));
      }

      // if the user is found, then log them in
      done(null, user);

    });

  }));
};

module.exports = {fbPassport};
