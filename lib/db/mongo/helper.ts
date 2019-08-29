export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const _ = require('lodash');

module.exports = class Helper {
  /**
   * Removes empty string values from properties
   * @param {object|array} doc - an object with props that might have empty string values
   * @returns {object|array}
   */
  static removeEmpty(doc: object | Array<any>): object | Array<any> {
    if (!doc) {
      return doc;
    }
    if (_.isArray(doc)) {
      return (doc as Array<any>).map((item) => Helper.removeEmpty(item));
    }
    return _.pickBy(doc, (item: any) => item !== '');
  }

  /**
   * Helper function to convert _id from MongoId to string. Used in reads
   * @param {object} obj - Object that might have an _id
   * @returns {object} - the same object with a converted _id
   */
  static convertIdToString(obj: any): object {
    if (_.isArray(obj)) {
      return (obj as Array<any>).map(Helper.convertIdToString);
    }
    if (obj && obj._id) {
      // eslint-disable-next-line no-param-reassign
      obj._id = obj._id.toString();
    }
    return obj;
  }
};
