// A helper module for doing metric calculations

const utils = require('./utils');

function since(lastNoteDate, note, noteId, acc) {
  const currentNoteDate = utils.intToMoment(note.get('date'));
  const sinceLast = lastNoteDate
    ? `...and then after ${lastNoteDate.from(currentNoteDate, true)}`
    : '';
  if(sinceLast && !lastNoteDate.isSame(currentNoteDate)) {
    acc.push({noteId, sinceLast, type:'since'});
  }
  return currentNoteDate;
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
  // const metrics = {
  //   lastHeight: 0,
  //   lastHeightDate: 0,
  //   lastGirth: 0,
  //   lastGirthDate: 0,
  //   lastExists: false,
  // };
  return sortedNoteIds.reduce((acc, noteId) => {
    const note = notes.get(noteId);
    if(note) {
      lastNoteDate = since(lastNoteDate, note, noteId, acc);
      acc.push({noteId, note, type: 'note'});
    } else {
      acc.push({noteId, type:'unfound'});
    }
    return acc;
  }, []);
}

module.exports = {
  notesToMetricNotes,
};
