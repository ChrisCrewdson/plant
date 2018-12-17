// Used to add a note to a plant

const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const moment = require('moment');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');
const NoteEdit = require('./NoteEdit');
const { actionFunc } = require('../../actions');

class NoteCreate extends React.PureComponent {
  /**
   * @param {NoteCreateProps} props
   */
  constructor(props) {
    super(props);

    this.createNote = this.createNote.bind(this);
  }

  createNote() {
    const {
      plant, locationId, plants: plantsObj, dispatch,
    } = /** @type {NoteCreateProps} */ (this.props);

    const plants = Object.keys(plantsObj).reduce((acc, plantId) => {
      const p = plantsObj[plantId];
      if (p.locationId === locationId) {
        acc[plantId] = p;
      }
      return acc;
    }, /** @type {UiPlants} */ ({}));

    const note = {
      _id: utils.makeMongoId(),
      date: moment().format('MM/DD/YYYY'),
      isNew: true,
      note: '',
      plantIds: [plant._id],
      errors: {},
      plants,
    };

    dispatch(actionFunc.editNoteOpen({ note, plant }));
  }

  render() {
    const {
      dispatch,
      interimNote,
      locationId,
      plant,
      plants,
      userCanEdit,
    } = /** @type {NoteCreateProps} */ (this.props);

    if (!userCanEdit) {
      return null;
    }

    const { isNew: createNote } = interimNote;

    return (
      <div>
        {createNote
          ? (
            <NoteEdit
              dispatch={dispatch}
              interimNote={interimNote}
              plant={plant}
              plants={plants}
              locationId={locationId}
            />
          )
          : (
            <div style={{ textAlign: 'right' }}>
              <FloatingActionButton
                onClick={this.createNote}
                secondary
                title="Create Note"
              >
                <AddIcon />
              </FloatingActionButton>
            </div>
          )
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
