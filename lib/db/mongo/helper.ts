import _ from 'lodash';
import produce from 'immer';

export class Helper {
  /**
   * Removes empty string values from properties
   * @param doc - an object with props that might have empty string values
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
   * @param obj - Object that might have an _id
   * @returns - the same object with a converted _id
   */
  static convertIdToString<T extends BizBase>(obj: Readonly<DbBase>): Readonly<any> {
    return produce(obj, (draft: T) => {
      draft._id = draft._id.toString();
    });
  }
}
