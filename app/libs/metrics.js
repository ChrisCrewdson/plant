// A helper module for doing metric calculations

const utils = require('./utils');

/**
 * Create the object that represents the component that goes between notes describing
 * what has happened between the notes.
 * @param {Object[]} acc - An array of render information for the list of notes
 * @param {Immutable.Map} note - the note being processed
 * @param {string} noteId - current note's id
 * @param {Moment} lastNoteDate - the date of the previous note
 * @returns {Moment} - The date from the note object as a Moment object
 */
function since(acc, note, noteId, lastNoteDate) {
  const { date } = note || {};
  const currentNoteDate = utils.intToMoment(date);
  const sinceLast = lastNoteDate
    ? `...and then after ${lastNoteDate.from(currentNoteDate, true)}`
    : '';
  if (sinceLast && !lastNoteDate.isSame(currentNoteDate)) {
    acc.push({ noteId, sinceLast, type: 'since' });
  }
  return currentNoteDate;
}

/**
 * Get the change or null if the prop isn't found in the last and at least
 *   one previous item in the collection.
 * @param {Object[]} metrics - An array of the metrics to this point in time
 * @param {string} prop - the metric being checked: 'height' or 'girth'
 * @returns {Object} - with props prev and last which each have a date and a
 *   'height' or 'girth' prop. Or if there wasn't a previous object with this
 *   prop then null.
 */
function getChange(metrics, prop) {
  let index = metrics.length - 1;
  if (index < 1) {
    return null;
  }

  const last = metrics[index];
  if (!last[prop]) {
    return null;
  }

  index -= 1;
  while (index > -1) {
    const prev = metrics[index];
    index -= 1;
    if (prev[prop]) {
      // console.log('diff obj:', { prev, last });
      return { prev, last };
    }
  }

  return null;
}

/**
 * Simple math round function
 * @param {number} number - number to round
 * @param {number} places - number of places to round it to
 * @returns {number} - a rounded number
 */
function round(number, places) {
  // eslint-disable-next-line no-restricted-properties
  const pow = Math.pow(10, places);
  return Math.round(number * pow) / pow;
}

function crunchChangeNumbers(metric, prop) {
  const valueDelta = round(metric.last[prop] - metric.prev[prop], 2);
  const dateDelta = metric.last.date.diff(metric.prev.date, 'days');
  return `The ${prop} has changed by ${valueDelta} inches over the last ${dateDelta} days.`;
}

function calculateMetrics(acc, note = {}, noteId, metrics) {
  const { height, girth } = note.metrics || {};
  if (height || girth) {
    const date = utils.intToMoment(note.date);
    const metric = { date };
    if (height) {
      metric.height = height;
    }
    if (girth) {
      metric.girth = girth;
    }
    metrics.push(metric);
    const heightChange = getChange(metrics, 'height');
    const girthChange = getChange(metrics, 'girth');
    const changes = [];
    if (heightChange) {
      const change = crunchChangeNumbers(heightChange, 'height');
      changes.push(change);
    }
    if (girthChange) {
      const change = crunchChangeNumbers(girthChange, 'girth');
      changes.push(change);
    }
    acc.push({ noteId, change: changes.join(' '), type: 'metric' });
  }
}

/**
 *
 * @param {String[]} sortedNoteIds - an array of noteIds sorted by date
 * @param {Immutable.Map} notes - An Immutable map of notes
 * @returns {Object[]} - A collection of objects that can be rendered on
 *   a Plant's page
 */
function notesToMetricNotes(sortedNoteIds, notes) {
  let lastNoteDate;
  const metrics = [];
  return sortedNoteIds.reduce((acc, noteId) => {
    const note = notes[noteId];
    if (note) {
      lastNoteDate = since(acc, note, noteId, lastNoteDate);
      calculateMetrics(acc, note, noteId, metrics);
      acc.push({ noteId, note, type: 'note' });
    } else {
      acc.push({ noteId, type: 'unfound' });
    }
    return acc;
  }, []);
}

module.exports = {
  notesToMetricNotes,
};
