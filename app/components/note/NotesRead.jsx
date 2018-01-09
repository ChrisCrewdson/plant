const CircularProgress = require('material-ui/CircularProgress').default;
const metrics = require('../../libs/metrics');
const NoteRead = require('./NoteRead');
const NoteEdit = require('./NoteEdit');
const Paper = require('material-ui/Paper').default;
const PropTypes = require('prop-types');
const React = require('react');
const getIn = require('lodash/get');
const utils = require('../../libs/utils');

class NotesRead extends React.PureComponent {
  componentWillMount() {
    this.sortNotes();
  }

  componentWillReceiveProps(nextProps) {
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
      userCanEdit,
      notes,
      plant,
    } = this.props;

    const interimNoteId = getIn(interim, ['note', 'note', '_id']);
    if (interimNoteId && userCanEdit) {
      const interimNote = getIn(interim, ['note', 'note']);

      return (
        <NoteEdit
          dispatch={this.props.dispatch}
          interimNote={interimNote}
          plant={this.props.plant}
          plants={this.props.plants}
          locationId={this.props.locationId}
        />
      );
    }

    const { sortedIds } = this.state || {};
    if (!sortedIds || !sortedIds.length) {
      return null;
    }

    const paperStyle = {
      backgroundColor: '#ddd',
      display: 'inline-block',
      margin: 20,
      padding: 20,
      width: '100%',
    };

    const metricNotes = metrics.notesToMetricNotes(sortedIds, notes);
    const renderedNotes = metricNotes.map((metricNote) => {
      const {
        noteId, note, sinceLast, change,
      } = metricNote;
      switch (metricNote.type) {
        case 'note':
          return (<NoteRead
            dispatch={dispatch}
            userCanEdit={userCanEdit}
            key={noteId}
            note={note}
            notes={notes}
            plant={plant}
          />);
        case 'since':
          return (
            <Paper key={`${noteId}-sincelast`} style={paperStyle} zDepth={1}>
              {sinceLast}
            </Paper>);
        case 'metric':
          return (
            <Paper key={`${noteId}-change`} style={paperStyle} zDepth={1}>
              {change}
            </Paper>);
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

NotesRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interim: PropTypes.shape({
    note: PropTypes.object,
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  notes: PropTypes.shape({
    _id: PropTypes.string.required,
  }).isRequired,
  plant: PropTypes.shape({
    notes: PropTypes.array,
  }).isRequired,
  plants: PropTypes.shape({
    notes: PropTypes.array,
  }).isRequired,
  locationId: PropTypes.string.isRequired,
};

module.exports = NotesRead;
