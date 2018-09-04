const bodyParser = require('body-parser');
const compression = require('compression');
// const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const Logger = require('lalog');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const mongoFn = require('./db/mongo');
// const tokenCheck = require('./config/token-check');
const routes = require('./routes');
const indexHtml = require('./render');
const { SERVICE_NAME } = require('../app/libs/constants');
const authPassportSetup = require('./auth/passport-setup');

const localLogger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName: 'server',
  addTrackId: true,
});

/**
 * Handle Error
 * @param {Error} err
 */
const handleError = (err) => {
  localLogger.fatal({ err });
  process.exit(1);
};

process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

/**
 * Server
 * @param {number} port
 * @param {string} mongoConnection
 */
module.exports = async (port = 3001, mongoConnection) => {
  /**
   * @type {MongoDb}
   */
  let mongo;
  try {
    const app = express();
    const server = http.createServer(app);

    // So that Passport uses the appropriate scheme when behind a reverse proxy
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.use(compression());
    app.use(morgan('dev')); // TODO: Is this still needed?

    // Attach a logger to the request object
    app.use((req, res, next) => {
      req.logger = Logger.create({
        addTrackId: true,
        isTransient: true,
        moduleName: 'express-request',
        serviceName: SERVICE_NAME,
      });
      next();
    });

    // app.use(cookieParser());
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    mongo = mongoFn(mongoConnection);
    const db = await mongo.GetDb(localLogger);

    // For passport authentication
    authPassportSetup(app, db, localLogger);

    routes.index(app);

    const tenMinutes = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milliseconds
    app.use(express.static(path.join(__dirname, '../build'), { maxAge: tenMinutes }));
    app.use(express.static(path.join(__dirname, '../public'), { maxAge: tenMinutes }));

    // error handler (after routes)

    /**
     * Error handler
     * @param {Error} err
     * @param {import("express").Request} req - Express request object
     * @param {import("express").Response} res - Express response object
     * @param {import("express").NextFunction} next
     */
    const errorHandler = (err, req, res, next) => {
      const { logger = localLogger } = req;
      logger.error({
        msg: 'Uncaught App Error', err, req, res,
      });
      next();
    };
    app.use(errorHandler);

    app.use((req, res) => res.status(404).send(indexHtml({ req })),
    );

    return new Promise((resolve, reject) => {
      server.listen(port, (error) => {
        if (error) {
          localLogger.fatal({ msg: 'Error in server.listen', err: error });
          return reject(error);
        }
        localLogger.info({
          msg: 'Express server started and listening',
          port,
          logLevel: Logger.getLevel(),
        });
        return resolve(server);
      });
    });
  } catch (dbErr) {
    localLogger.fatal({
      msg: 'Error connecting to DB or starting server',
      err: dbErr,
      dbConnection: mongo && mongo.getDbConnection && mongo.getDbConnection(),
      mongoConnection,
    });
    throw dbErr;
  }
};
