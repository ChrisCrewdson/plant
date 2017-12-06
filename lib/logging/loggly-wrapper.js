// The winston-loggly-bulk module has a dependency on the appropriate
// winston module so don't need to explicitly include it as a
// dependency in package.json

// eslint-disable-next-line import/no-extraneous-dependencies
const winston = require('winston');
require('winston-loggly-bulk');

module.exports = () => {
  if (process.env.PLANT_LOGGLY_TOKEN) {
    winston.add(winston.transports.Loggly, {
      inputToken: process.env.PLANT_LOGGLY_TOKEN,
      subdomain: process.env.PLANT_LOGGLY_SUBDOMAIN,
      // This is a comma separated list of tags used for filtering in reporting.
      tags: [`plant-${process.env.NODE_ENV}`],
      // When the json flag is enabled, objects will be converted to JSON using
      // JSON.stringify before being transmitted to Loggly.
      json: true,
    });

    return (json) => {
      winston.log(json, () => {});
    };
  }
  return () => {};
};
