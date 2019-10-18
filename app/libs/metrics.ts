// A helper module for doing metric calculations
import { Moment } from 'moment';
import utils from './utils';

/**
 * Create the object that represents the component that goes between notes describing
 * what has happened between the notes.
 * @param acc - An array of render information for the list of notes
 * @param note - the note being processed
 * @param noteId - current note's id
 * @param lastNoteDate - the date of the previous note
 * @returns - The date from the note object as a Moment object
 */
function since(acc: MetricNote[], note: UiNotesValue, noteId: string,
  lastNoteDate?: Moment): Moment {
  const { date } = note;
  const currentNoteDate = utils.intToMoment(date);
  const sinceLast = lastNoteDate
    ? `...and then after ${lastNoteDate.from(currentNoteDate, true)}`
    : '';
  if (lastNoteDate && !lastNoteDate.isSame(currentNoteDate)) {
    acc.push({ noteId, sinceLast, type: 'since' });
  }
  return currentNoteDate;
}

/**
 * Get the change or null if the prop isn't found in the last and at least
 *   one previous item in the collection.
 * @param metrics - An array
 * of the metrics to this point in time
 * @param prop - the metric being checked: 'height' or 'girth'
 * @returns - with props prev and last which each have a date and a
 *   'height' or 'girth' prop. Or if there wasn't a previous object with this
 *   prop then null.
 */
function getChange(metrics: MetricItem[], prop: MetricItemMetricTypes): MetricChangePair | null {
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
 * @param number - number to round
 * @param places - number of places to round it to
 * @returns - a rounded number
 */
function round(number: number, places: number): number {
  // eslint-disable-next-line no-restricted-properties
  const pow = Math.pow(10, places);
  return Math.round(number * pow) / pow;
}

function crunchChangeNumbers(metric: MetricChangePair, prop: MetricItemMetricTypes): string {
  const { last, prev } = metric;
  const lastValue = last[prop];
  const prevValue = prev[prop];
  if (typeof lastValue !== 'number' || typeof prevValue !== 'number') {
    return '';
  }
  const valueDelta = round(lastValue - prevValue, 2);
  const dateDelta = last.date.diff(prev.date, 'days');
  return `The ${prop} has changed by ${valueDelta} inches over the last ${dateDelta} days.`;
}

function calculateMetrics(acc: MetricNote[], note: UiNotesValue, noteId: string,
  metrics: MetricItem[]) {
  const { metrics: noteMetrics } = note;
  if (noteMetrics) {
    const { height, girth } = noteMetrics;
    if (height || girth) {
      const date = utils.intToMoment(note.date);
      const metric: MetricItem = { date };
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
        if (change) {
          changes.push(change);
        }
      }
      if (girthChange) {
        const change = crunchChangeNumbers(girthChange, 'girth');
        if (change) {
          changes.push(change);
        }
      }
      acc.push({ noteId, change: changes.join(' '), type: 'metric' });
    }
  }
}

/**
 * @param sortedNoteIds - an array of noteIds sorted by date
 * @param notes - An Immutable map of notes
 * @returns - A collection of objects that can be rendered on a Plant's page
 */
export function notesToMetricNotes(sortedNoteIds: string[], notes: UiNotes): MetricNote[] {
  let lastNoteDate: Moment;
  const metrics: MetricItem[] = [];

  const metricReducer = (acc: MetricNote[], noteId: string): MetricNote[] => {
    const note = notes[noteId];
    if (note) {
      lastNoteDate = since(acc, note, noteId, lastNoteDate);
      calculateMetrics(acc, note, noteId, metrics);
      acc.push({ noteId, note, type: 'note' });
    } else {
      acc.push({ noteId, type: 'unfound' });
    }
    return acc;
  };

  return sortedNoteIds.reduce(metricReducer, []);
}
