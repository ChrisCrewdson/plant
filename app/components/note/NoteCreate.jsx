// Used to add a note to a plant

const actions = require('../../actions');
const React = require('react');
const NoteEdit = require('./NoteEdit');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const utils = require('../../libs/utils');
const moment = require('moment');
const PropTypes = require('prop-types');

class NoteCreate extends React.PureComponent {
  constructor(props) {
    super(props);

    this.createNote = this.createNote.bind(this);
  }

  createNote() {
    const { plant, locationId } = this.props;
    const note = {
      _id: utils.makeMongoId(),
      date: moment().format('MM/DD/YYYY'),
      isNew: true,
      note: '',
      plantIds: [plant.get('_id')],
      errors: {},
      plants: this.props.plants.filter(p => p.get('locationId') === locationId),
    };

    this.props.dispatch(actions.editNoteOpen({ note, plant }));
  }

  render() {
    const {
      userCanEdit,
      interimNote,
    } = this.props;

    if (!userCanEdit) {
      return null;
    }

    const createNote = interimNote.get('isNew');

    return (
      <div>
        {createNote &&
          <NoteEdit
            dispatch={this.props.dispatch}
            interimNote={interimNote}
            plant={this.props.plant}
            plants={this.props.plants}
            locationId={this.props.locationId}
          />
        }
        {!createNote &&
          <div style={{ textAlign: 'right' }}>
            <FloatingActionButton
              onClick={this.createNote}
              secondary
              title="Create Note"
            >
              <AddIcon />
            </FloatingActionButton>
          </div>
        }
      </div>
    );
  }
}

NoteCreate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  interimNote: PropTypes.shape({ // Immutable.js Map
    get: PropTypes.func.isRequired,
  }).isRequired,
  plant: PropTypes.shape({ // Immutable.js Map
    get: PropTypes.func.isRequired,
  }).isRequired,
  plants: PropTypes.shape({ // Immutable.js Map
    get: PropTypes.func.isRequired,
    filter: PropTypes.func.isRequired,
  }).isRequired,
  locationId: PropTypes.string.isRequired,
};

module.exports = NoteCreate;
