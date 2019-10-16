// Used to show each plant on a user's plant list page.
// Url: /location/<location-name>/<location-id>

import { Link } from 'react-router-dom';
import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import moment from 'moment';
import PropTypes from 'prop-types';

import utils from '../../libs/utils';
import { actionFunc } from '../../actions';

const { makeSlug } = utils;

export default class PlantItem extends React.PureComponent {
  props!: PlantItemProps;

  static propTypes = {
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

  constructor(props: PlantItemProps) {
    super(props);
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
        dispatch(actionFunc.loadNotesRequest({
          plantIds: [plant._id],
        }));
      } else {
        // console.error('PlantItem: plant object does not have _id', plant);
      }
    }

    dispatch(actionFunc.editNoteOpen({
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
      // @ts-ignore - Fix this later by defining a style type for this
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
          )}
        {renderLink}
      </div>
    );
  }
}
