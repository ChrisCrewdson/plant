import _ from 'lodash';
// @ts-ignore - Types for @passport-next are not complete yet
import passportGoogle from '@passport-next/passport-google-oauth2';
// @ts-ignore - Types for lalog are not complete yet
import Logger from 'lalog';

import { getDbInstance } from '../db/mongo';

import { SERVICE_NAME } from '../../app/libs/constants';

const mongoDb = getDbInstance();
const moduleName = 'lib/auth/passport-google';

const localLogger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName,
  addTrackId: true,
});

const GoogleStrategy = passportGoogle.Strategy;

export function googlePassport(passport: { use: Function }) {
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

    /**
     * Google will send back the token and profile
     */
    (token: any, refreshToken: any, profile: GoogleOAuth, done: Function) => {
      localLogger.trace({ msg: 'Google passport callback:', profile });
      // Setup for new user in case user is not in DB
      const createdDate = new Date();
      const email = _.get(profile, 'emails.0.value', '');

      const newUser: UserDetails = {
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
        .then((user: any) => { // TODO: remove any
          if (!user) {
            throw new Error('No user returned');
          }
          return done(null, user);
        })
        .catch((findOrCreateUserError: Error) => {
          localLogger.error({ msg: 'findOrCreateUser()', err: findOrCreateUserError, newUser });
          return done(findOrCreateUserError);
        });
    },
  ));
}
