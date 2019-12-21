import PropTypes from 'prop-types';
import React from 'react';
import { Dispatch } from 'redux';

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import NoteEdit from './NoteEdit';
import NoteRead from './NoteRead';
import { notesToMetricNotes } from '../../libs/metrics';
import utils from '../../libs/utils';
import { PlantAction } from '../../../lib/types/redux-payloads';
import Markdown from '../common/Markdown';

interface NotesReadProps {
  dispatch: Dispatch<PlantAction<any>>;
  interim: UiInterim;
  locationId: string;
  notes: UiNotes;
  plant: UiPlantsValue;
  plants: UiPlants;
  userCanEdit: boolean;
}

export default function notesRead(props: NotesReadProps): JSX.Element | null {
  const {
    dispatch,
    interim,
    locationId,
    notes,
    plant,
    plants,
    userCanEdit,
  } = props;
  const { notes: noteIds = [] } = plant;

  const sortedIds = noteIds.length
    ? utils.sortNotes(noteIds, notes)
    : [];


  const interimNote = ((interim && interim.note
      && interim.note.note) || {}) as UiInterimNote;
  const { isNew, _id: interimNoteId } = interimNote;

  if (interimNoteId && userCanEdit && !isNew) {
    return (
      <NoteEdit
        dispatch={dispatch}
        interimNote={interimNote}
        plants={plants}
        locationId={locationId}
      />
    );
  }

  if (!sortedIds || !sortedIds.length) {
    return null;
  }

  const paperStyle: React.CSSProperties = {
    backgroundColor: '#ddd',
    display: 'inline-block',
    margin: 20,
    padding: 20,
    width: '100%',
  };

  const metricNotes = notesToMetricNotes(sortedIds, notes);
  const renderedNotes = metricNotes.map((metricNote) => {
    const {
      noteId, note, sinceLast, change, type: noteType,
    } = metricNote;

    if (noteType === 'note') {
      if (note) {
        return (
          <NoteRead
            dispatch={dispatch}
            userCanEdit={userCanEdit}
            key={noteId}
            note={note}
            plant={plant}
          />
        );
      }
      return null;
    }

    switch (metricNote.type) {
      case 'since':
        return (
          <Paper key={`${noteId}-sincelast`} style={paperStyle} elevation={5}>
            {sinceLast}
          </Paper>
        );
      case 'metric':
        return (
          <Paper key={`${noteId}-change`} style={paperStyle} elevation={5}>
            <Markdown markdown={change} />
          </Paper>
        );
      case 'unfound':
        return (<CircularProgress key={noteId} />);
      default:
        throw new Error(`Unknown note render type ${metricNote.type}`);
    }
  });

  return (
    <div>
      {renderedNotes}
    </div>
  );
}


notesRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interim: PropTypes.shape({
    note: PropTypes.object,
  }).isRequired,
  locationId: PropTypes.string.isRequired,
  notes: PropTypes.shape({
    // _id: PropTypes.string.required,
  }).isRequired,
  plant: PropTypes.shape({
    notes: PropTypes.array,
  }).isRequired,
  plants: PropTypes.shape({
    notes: PropTypes.array,
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
};
