// Used to show each plant on a user's plant list page.
// Url: /location/<location-name>/<location-id>

const { Link } = require('react-router-dom');
const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const moment = require('moment');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');
const actions = require('../../actions');
const { makeSlug } = require('../../libs/utils');

class PlantItem extends React.PureComponent {
  constructor() {
    super();
    this.createNote = this.createNote.bind(this);
  }

  createNote() {
    const { plant, dispatch } = this.props;
    const plantIds = [plant._id];

    const note = {
      _id: utils.makeMongoId(),
      date: moment().format('MM/DD/YYYY'),
      isNew: true,
      note: '',
      plantIds,
      errors: {},
    };

    if (!plant.notesRequested) {
      if (plant._id) {
        dispatch(actions.loadNotesRequest({
          plantIds: [plant._id],
        }));
      } else {
        // console.error('PlantItem: plant object does not have _id', plant);
      }
    }

    dispatch(actions.editNoteOpen({
      note,
      plant,
    }));
  }

  render() {
    const {
      userCanEdit,
      plant,
    } = this.props;

    const {
      _id, title, isTerminated, botanicalName,
    } = plant;

    const floatingActionButtonStyle = {
      marginLeft: '10px',
      width: '50px',
      // 0 = don't grow, 0 = don't shrink, 50px = start at this size
      flex: '0 0 50px',
    };

    const linkStyle = {
      margin: '20px',
    };
    if (isTerminated === true) {
      linkStyle.color = 'red';
    }

    const fullTitle = `${title}${botanicalName ? ` (${botanicalName})` : ''}`;
    const link = `/plant/${makeSlug(title)}/${_id}`;
    const renderLink = (
      <Link
        style={linkStyle}
        to={link}
      >
        <span>
          {fullTitle}
        </span>
      </Link>
    );

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {userCanEdit
          && (
          <div style={floatingActionButtonStyle}>
            <FloatingActionButton
              mini
              onClick={this.createNote}
              title="Add Note"
            >
              <AddIcon />
            </FloatingActionButton>
          </div>
          )
        }
        {renderLink}
      </div>
    );
  }
}

PlantItem.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  plant: PropTypes.shape({
    _id: PropTypes.string,
    botanicalName: PropTypes.string,
    isTerminated: PropTypes.bool,
    notesRequested: PropTypes.bool,
    title: PropTypes.string,
  }).isRequired,
};

module.exports = PlantItem;
