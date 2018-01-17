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
    const { plant, locationId, plants: plantsObj } = this.props;

    const plants = Object.keys(plantsObj).reduce((acc, plantId) => {
      const p = plantsObj[plantId];
      if (p.locationId === locationId) {
        acc[plantId] = p;
      }
      return acc;
    }, {});

    const note = {
      _id: utils.makeMongoId(),
      date: moment().format('MM/DD/YYYY'),
      isNew: true,
      note: '',
      plantIds: [plant._id],
      errors: {},
      plants,
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

    const { isNew: createNote } = interimNote;

    return (
      <div>
        {createNote ?
          <NoteEdit
            dispatch={this.props.dispatch}
            interimNote={interimNote}
            plant={this.props.plant}
            plants={this.props.plants}
            locationId={this.props.locationId}
          />
        :
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
  interimNote: PropTypes.shape({
    note: PropTypes.string,
  }).isRequired,
  plant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  plants: PropTypes.shape({}).isRequired,
  locationId: PropTypes.string.isRequired,
};

module.exports = NoteCreate;
