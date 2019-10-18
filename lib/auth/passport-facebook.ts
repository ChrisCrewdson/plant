import _ from 'lodash';


// @ts-ignore - Types for lalog are not complete yet
import Logger from 'lalog';

// @ts-ignore - Types for @passport-next are not complete yet
import fb from '@passport-next/passport-facebook';
import { getDbInstance } from '../db/mongo';

import { SERVICE_NAME } from '../../app/libs/constants';

const FacebookStrategy = fb.Strategy;

const mongoDb = getDbInstance();

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

export function fbPassport(passport: { use: Function}) {
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

    /**
     * Facebook will send back the token and profile
     */
    (token: any, refreshToken: any, profile: FacebookOAuth, done: Function) => {
      localLogger.trace({
        msg: 'Facebook passport callback:',
        profile,
      });
      // Setup for new user in case user is not in DB
      const createdDate = new Date();
      const email = _.get(profile, '_json.emails.0', '') || _.get(profile, '_json.email', '');
      const newUser: UserDetails = {
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
        .then((user: any) => {
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
