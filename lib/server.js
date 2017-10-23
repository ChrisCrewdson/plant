const facebookAuth = require('./config/passport-facebook');
const googleAuth = require('./config/passport-google');
const routes = require('./routes');
const tokenCheck = require('./config/token-check');

const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const Logger = require('./logging/logger');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongo = require('./db/mongo')();
const passport = require('passport');
const path = require('path');
const indexHtml = require('./render');

const logLevel = process.env.PLANT_LOG_LEVEL ||
  process.env.NODE_ENV === 'production' ? 'info' : 'trace';
Logger.setLevel(logLevel);

const logger = new Logger('server');

module.exports = async (port = 3001) => {
  const app = express();
  const server = http.createServer(app);

  // So that Passport uses the appropriate scheme when behind a reverse proxy
  app.enable('trust proxy');
  app.disable('x-powered-by');
  app.use(compression());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.use(passport.initialize());

  facebookAuth.fbPassport(passport);
  googleAuth.googlePassport(passport);

  // Setup authentication
  app.use(tokenCheck.tokenCheck);

  routes.index(app, passport);

  const tenMinutes = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milliseconds
  app.use(express.static(path.join(__dirname, '../build'), { maxAge: tenMinutes }));
  app.use(express.static(path.join(__dirname, '../public'), { maxAge: tenMinutes }));

  // error handler (after routes)
  app.use((err, req, res, next) => {
    logger.error('Uncaught App Error', { err, req, res });
    next();
  });

  app.use((req, res) => {
    // At this point nothing has handled the request.
    // This is probably an invalid request.
    // We can let the React Router show the error page, however
    // we should also return a 404 status
    logger.error('Could not find route', { url: req.url });
    return res.status(404).send(indexHtml());
  });

  try {
    await mongo.GetDb();
    return new Promise((resolve, reject) => {
      server.listen(port, (error) => {
        if (error) {
          logger.fatal('Error in server.listen', { error });
          return reject(error);
        }
        logger.info(`Express server listening on port ${port}`);
        return resolve(server);
      });
    });
  } catch (dbErr) {
    logger.fatal('Error connecting to DB or starting server', {
      dbErr,
      dbConnection: mongo.getDbConnection(),
    });
    throw dbErr;
  }
};
