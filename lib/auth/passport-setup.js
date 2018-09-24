// @ts-ignore - Types for @passport-next are not complete yet
const passport = require('@passport-next/passport');
const connectMongo = require('connect-mongo');
const session = require('express-session');

const mongo = require('../db/mongo');
const googleAuth = require('./passport-google');
const facebookAuth = require('./passport-facebook');
const { sessionKey } = require('../constants');

const MongoStore = connectMongo(session);

/**
 * Init
 * @param {import("mongodb").Db} db
 * @param {import("express").Application} app
 * @returns {void}
 */
const setupSession = (db, app) => {
  const store = new MongoStore({ db });
  const { PLANT_TOKEN_SECRET: secret } = process.env;

  app.use(session({
    resave: false,
    saveUninitialized: false,
    key: sessionKey,
    secret,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000, // ms
    },
    store,
  }));
};

/**
 * Init
 * @param {import("express").Application} app
 * @param {import("mongodb").Db} db
 * @param {Logger} logger
 * @returns {void}
 */
const init = (app, db, logger) => {
  setupSession(db, app);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, cb) => {
    cb(null, user && user._id);
  });

  passport.deserializeUser(async (id, cb) => {
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
