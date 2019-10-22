
import {
  Application,
} from 'express';

// @ts-ignore - Types for @passport-next are not complete yet
import passport from '@passport-next/passport';
import connectMongo from 'connect-mongo';
import session from 'express-session';

import Logger from 'lalog';
import { getDbInstance, MongoDb } from '../db/mongo';

import * as googleAuth from './passport-google';
import * as facebookAuth from './passport-facebook';

import { sessionKey } from '../constants';

const mongo = getDbInstance;
const MongoStore = connectMongo(session);

const setupSession = (db: MongoDb, app: Application): void => {
  const client = db.getDbClient();
  // @ts-ignore - seems to be a bug in @type definition
  const mongoStoreOptions: NativeMongoOptions = { client };
  const store = new MongoStore(mongoStoreOptions);
  const { PLANT_TOKEN_SECRET: secret } = process.env;

  if (!secret) {
    throw new Error(`PLANT_TOKEN_SECRET env must be defined but it is ${secret}`);
  }

  app.use(session({
    resave: false,
    saveUninitialized: false,
    name: sessionKey,
    secret,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000, // ms
    },
    store,
  }));
};

/**
 * Init
 */
const init = (app: Application, db: MongoDb, logger: Logger): void => {
  setupSession(db, app);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(
    (user: BizUser, cb: Function) => {
      cb(null, user && user._id);
    });

  passport.deserializeUser(
    async (id: string, cb: Function) => {
      try {
        const mongoDb = mongo();
        const user = await mongoDb.getUserById(id, logger);
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    });

  facebookAuth.fbPassport(passport);
  googleAuth.googlePassport(passport);
};

export default init;
