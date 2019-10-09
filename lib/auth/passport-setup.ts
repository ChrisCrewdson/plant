
import {
  Application,
} from 'express';
import { Db } from 'mongodb';
import { getDbInstance } from '../db/mongo';

// @ts-ignore - Types for @passport-next are not complete yet
const passport = require('@passport-next/passport');
const connectMongo = require('connect-mongo');
const session = require('express-session');

const mongo = getDbInstance;
const googleAuth = require('./passport-google');
const facebookAuth = require('./passport-facebook');
const { sessionKey } = require('../constants');

const MongoStore = connectMongo(session);

/**
 * Init
 */
const setupSession = (db: Db, app: Application): void => {
  // @ts-ignore - mongodb type library is referencing v3.x and the connect-mongo library has
  // a reference to v2.x of the mongodb library.
  const store = new MongoStore({ db });
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
const init = (app: Application, db: Db, logger: Logger): void => {
  setupSession(db, app);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(
    /**
     * @param {BizUser} user
     * @param {Function} cb
     */
    (user: BizUser, cb: Function) => {
      cb(null, user && user._id);
    });

  passport.deserializeUser(
    /**
     * @param {string} id
     * @param {Function} cb
     */
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

module.exports = init;
