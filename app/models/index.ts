import validatejs from 'validate.js';
import { note } from './note';
import { plant } from './plant';

//  The validator receives the following arguments:
//     value - The value exactly how it looks in the attribute object.
//     options - The options for the validator. Guaranteed to not be null or undefined.
//     key - The attribute name.
//     attributes - The entire attributes object.
//     globalOptions - The options passed when calling validate
//                     (will always be an object, non null).
//
// If the validator passes simply return null or undefined. Otherwise return a string or an
// array of strings containing the error message(s).
// Make sure not to append the key name, this will be done automatically.

interface IntDateValidateOptions {
  name: string;
  presence: boolean; // TODO: Did I correctly type this?
}

/**
 * Validate an integer date. Should be in the range of
 * something like 17000101 to 20201231. Not sure why we'd
 * have dates beyond the current day...
 */
validatejs.validators.intDateValidate = (value: number, options: IntDateValidateOptions) => {
  if (Number.isNaN(value)) {
    // console.warn(`Date validate expected ${value} to not be NaN`);
    return `^${options.name} must be a valid date in the format MM/DD/YYYY`;
  }

  if (!value && !options.presence) {
    return null;
  }

  if (typeof value !== 'number') {
    // console.warn(`Date validate expected ${value} to be a number`);
    return `^${options.name} must be a number`;
  }

  // Don't allow dates before 1 Jan 1700
  if (value < 17000101) {
    // console.warn(`Date validation expected ${value} to be above 17000101`);
    return `^${options.name} must be after 1st Jan 1700`;
  }

  if (value.toString().length !== 8) {
    // console.error(`Date validation expected ${value} to have a string length of 8`);
    return `^${options.name} must be in format YYYYMMDD`;
  }

  const year = Math.round(value / 10000);
  if (year < 1700) {
    // console.warn(`Date validate expected ${value} to have a year greater than 1700`);
    return `^${options.name} must have a valid year, year found was ${year}`;
  }

  const month = Math.round(value / 100) - (year * 100);
  if (month < 1 || month > 12) {
    // console.warn(`Date validate expected ${value} to have a month from 01 to 12`);
    return `^${options.name} must have a valid month, value found was ${month}`;
  }

  const dayOfMonth = Math.round(value) - ((year * 10000) + (month * 100));
  if (dayOfMonth < 1 || dayOfMonth > 31) {
    // console.warn(`Date validate expected ${value} to have a day from 01 to 31`);
    return `^${options.name} must have a valid day-of-month, value found was ${dayOfMonth}`;
  }

  return null;
};

export {
  note, plant,
};

/*
Dates and transformations:

Inserting:
1. UI - date entered as string
2. onSave - date converted to number and validated
3. Ajax client put/post - date converted to string (implicit)
4. Ajax server put/post - date converted back to number and stored in DB as number

Getting:
1. From DB retrieved as number.
2. Ajax Server/Client - get - date retrieve as number
3. UI edit mode - date converted to string for editing

*/
