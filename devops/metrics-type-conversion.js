/* eslint-disable no-restricted-globals */

// Script for converting metrics props from string to float
// in the plant db. For some reason, sometimes metrics are
// saved as strings.

// const targetDb = 'plant';
const targetDb = 'plant-development';

// Connect to DB
// eslint-disable-next-line no-undef
const conn = new Mongo();
const db = conn.getDB(targetDb);

// The following filter can be used to find metrics
// where the height prop is a string.
// { 'metrics.height': { $type: 'string' } };
// When using this filter against the Note collection on
// 1/8/20 and also changing the $type to 'number' these
// were the count of documents:
// 'string': 121
// 'number': 793

// Similar string values were found in the other 3 metrics...

const metricProps = [
  'height',
  'girth',
  'harvestCount',
  'harvestWeight',
];


metricProps.forEach((prop) => {
  const key = `metrics.${prop}`;
  const beforeCount = db.note.find({ [key]: { $type: 'string' } }).count();
  print(`Before count for ${prop}: ${beforeCount}`);
  db.note.find({ [key]: { $type: 'string' } }).forEach((obj) => {
    obj.metrics[prop] = parseFloat(obj.metrics[prop]);
    db.note.save(obj);
  });
  const afterCount = db.note.find({ [key]: { $type: 'string' } }).count();
  print(`After count for ${prop}: ${afterCount}`);
});

// The following filter finds all metrics for the harvestCount prop that
// are not number types.
// { $and: [
//   { 'metrics.harvestCount': { $exists: true } },
//   { 'metrics.harvestCount': { $not: { $type: 'number' } } }
// ] };
