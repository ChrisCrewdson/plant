const _ = require('lodash');

// const logger = require('../../logging/logger').create('mongo-helper');

module.exports = class Helper {
  static removeEmpty(doc) {
    if (!doc) {
      return doc;
    }
    if (_.isArray(doc)) {
      return doc.map(item => Helper.removeEmpty(item));
    }
    return _.pickBy(doc, item => item !== '');
  }

  /**
   * Helper function to convert _id from MongoId to string. Used in reads
   * @param {object} obj - Object that might have an _id
   * @returns {object} - the same object with a converted _id
   */
  static convertIdToString(obj) {
    if (_.isArray(obj)) {
      return obj.map(Helper.convertIdToString);
    }
    if (obj && obj._id) {
      // eslint-disable-next-line no-param-reassign
      obj._id = obj._id.toString();
    }
    return obj;
  }
};
