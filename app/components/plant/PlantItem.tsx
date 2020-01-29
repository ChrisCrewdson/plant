// Used to show each plant on a user's plant list page.
// Url: /location/<location-name>/<location-id>

import { Link } from 'react-router-dom';
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import utils from '../../libs/utils';
import { actionFunc } from '../../actions';

interface PlantItemProps {
  dispatch: Dispatch;
  plant: UiPlantsValue;
  userCanEdit: boolean;
}

export default function PlantItem(props: PlantItemProps): JSX.Element {
  const createNote = (): void => {
    const { plant, dispatch } = props;
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
  };

  const {
    userCanEdit,
    plant,
  } = props;

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
  const link = utils.makePlantUrl({ title, _id: _id || '' });
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
          <Fab
            color="primary"
            onClick={createNote}
            size="medium"
            title="Add Note"
          >
            <AddIcon />
          </Fab>
        </div>
        )}
      {renderLink}
    </div>
  );
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
