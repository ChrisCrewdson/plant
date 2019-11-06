import express, { Request, Response, NextFunction } from 'express';

import bodyParser from 'body-parser';
import compression from 'compression';
import http from 'http';
import Logger from 'lalog';
import morgan from 'morgan';
import methodOverride from 'method-override';
import path from 'path';

import { Server } from 'net';
import { getDbInstance } from './db/mongo';
import { indexHtml } from './render';
import * as routes from './routes';

import { SERVICE_NAME } from '../app/libs/constants';
import authPassportSetup from './auth/passport-setup';

import UnhandledRejectionListener = NodeJS.UnhandledRejectionListener;
import UncaughtExceptionListener = NodeJS.UncaughtExceptionListener;


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      body?: any;
      /**
       * I'm sure that this is not always available on the req object unless the Multer middleware
       * always adds it?
       * TODO: Need to test this. If it's not always available then work out how to type this.
       */
      // files: {
      //   [fieldname: string]: Multer.File[];
      // } | Multer.File[];
      isAuthenticated?: Function;
      logger: Logger;
      logIn: Function;
      logout: Function;
      user?: BizUser;
    }
  }
}

const mongoFn = getDbInstance;

const localLogger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName: 'server',
  addTrackId: true,
});

const handleRejection: UnhandledRejectionListener = (err?: {} | null) => {
  localLogger.fatal({ err });
  process.exit(1);
};

const handleException: UncaughtExceptionListener = (err?: {} | null) => {
  localLogger.fatal({ err });
  process.exit(1);
};

process.on('unhandledRejection', handleRejection);
process.on('uncaughtException', handleException);

/**
 * Server
 */
export const serverServer = async (portParam?: number, mongoConnection?: string):
Promise<Server> => {
  const port = portParam || parseInt(process.env.PLANT_PORT || '3001', 10);
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

    const mongo = mongoFn(mongoConnection);
    await mongo.GetDb(localLogger);

    // For passport authentication
    authPassportSetup(app, mongo, localLogger);

    await routes.index(app);

    const tenMinutes = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milliseconds
    // These are the two public folders. All files in these folders are sent as static
    // files to the client.
    // For TypeScript compiled files living in dist/ these folders need to be copied
    // into there.
    app.use(express.static(path.join(__dirname, '../build'), { maxAge: tenMinutes }));
    app.use(express.static(path.join(__dirname, '../public'), { maxAge: tenMinutes }));

    // error handler (after routes)

    /**
     * Error handler
     */
    const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
      const { logger = localLogger } = req;
      logger.error({
        msg: 'Uncaught App Error', err, req, res,
      });
      next();
    };
    app.use(errorHandler);

    app.use((req, res) => res.status(404).send(indexHtml({ req }, false)),
    );

    return new Promise((resolve) => {
      /**
       * Server callback
       */
      const serverCallback = () => {
        // if (err) {
        //   localLogger.fatal({ msg: 'Error in server.listen', err });
        //   return reject(err);
        // }
        localLogger.info({
          msg: 'Express server started and listening',
          port,
          logLevel: Logger.getLevel(),
        });
        return resolve(server);
      };
      server.listen(port, serverCallback);
    });
  } catch (err) {
    localLogger.fatal({
      msg: 'Error during server startup',
      err,
      mongoConnection,
    });
    throw err;
  }
};
