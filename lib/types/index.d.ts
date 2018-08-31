// Definitions file for Plant Project
/// <reference types="express" />

interface Logger {
  trace: Function;
  info: Function;
  warn: Function;
  error: Function;
  fatal: Function;
  security: Function;
  time: Function;
  timeEnd: Function;
}

interface PlantReq extends Express.Request {
  logger: Logger;
}