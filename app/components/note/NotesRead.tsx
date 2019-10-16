import CircularProgress from 'material-ui/CircularProgress';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import { Dispatch } from 'redux';

import NoteEdit from './NoteEdit';
import NoteRead from './NoteRead';
import { notesToMetricNotes } from '../../libs/metrics';
import utils from '../../libs/utils';
import { PlantAction } from '../../../lib/types/redux-payloads';

interface NotesReadProps {
  dispatch: Dispatch<PlantAction<any>>;
  interim: UiInterim;
  locationId: string;
  notes: UiNotes;
  plant: UiPlantsValue;
  plants: UiPlants;
  userCanEdit: boolean;
}

interface NotesReadState {
  sortedIds?: string[];
}

export default class NotesRead extends React.PureComponent {
  // eslint-disable-next-line react/state-in-constructor
  state: NotesReadState;

  props: NotesReadProps;

  static propTypes = {
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

  constructor(props: NotesReadProps) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    this.state = {};
    this.props = props;
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.sortNotes();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: NotesReadProps) {
    this.sortNotes(nextProps);
  }

  sortNotes(props = this.props) {
    const { notes, plant } = props;
    const { notes: noteIds = [] } = plant;

    if (!noteIds.length) {
      return;
    }

    const sortedIds = utils.sortNotes(noteIds, notes);
    this.setState({ sortedIds });
  }

  render() {
    const {
      dispatch,
      interim,
      locationId,
      notes,
      plant,
      plants,
      userCanEdit,
    } = this.props;

    const interimNote = ((interim && interim.note
      && interim.note.note) || {}) as UiInterimNote;
    const { isNew, _id: interimNoteId } = interimNote;

    if (interimNoteId && userCanEdit && !isNew) {
      return (
        <NoteEdit
          dispatch={dispatch}
          interimNote={interimNote}
          plant={plant}
          plants={plants}
          locationId={locationId}
        />
      );
    }

    const { sortedIds } = this.state;
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
        noteId, note, sinceLast, change,
      } = metricNote;
      switch (metricNote.type) {
        case 'note':
          return (
            <NoteRead
              dispatch={dispatch}
              userCanEdit={userCanEdit}
              key={noteId}
              note={note}
              notes={notes}
              plant={plant}
            />
          );
        case 'since':
          return (
            <Paper key={`${noteId}-sincelast`} style={paperStyle} zDepth={1}>
              {sinceLast}
            </Paper>
          );
        case 'metric':
          return (
            <Paper key={`${noteId}-change`} style={paperStyle} zDepth={1}>
              {change}
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
}
