// Used to add a note to a plant

import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import utils from '../../libs/utils';
import NoteEdit from './NoteEdit';
import { actionFunc } from '../../actions';
import { PlantAction } from '../../../lib/types/redux-payloads';
import { UiInterimNote } from '../../../lib/db/mongo/model-note';

interface NoteCreateProps {
  dispatch: Dispatch<PlantAction<any>>;
  userCanEdit: boolean;
  interimNote: UiInterimNote;
  plant: UiPlantsValue;
  plants: UiPlants;
  locationId: string;
}

export default function noteCreate(props: NoteCreateProps): JSX.Element | null {
  const createNote = (): void => {
    const {
      plant, dispatch,
    } = props;

    if (!plant._id) {
      throw new Error(`Missing plant._id ${plant._id}`);
    }

    const note: UiInterimNote = {
      _id: utils.makeMongoId(),
      date: moment().format('MM/DD/YYYY'),
      isNew: true,
      note: '',
      plantIds: [plant._id],
      errors: {},
    };

    dispatch(actionFunc.editNoteOpen({ note, plant }));
  };

  const {
    dispatch,
    interimNote,
    locationId,
    plants,
    userCanEdit,
  } = props;

  if (!userCanEdit) {
    return null;
  }

  const { isNew } = interimNote;

  return (
    <div>
      {isNew
        ? (
          <NoteEdit
            dispatch={dispatch}
            interimNote={interimNote}
            plants={plants}
            locationId={locationId}
          />
        )
        : (
          <div style={{ textAlign: 'right' }}>
            <Fab
              onClick={createNote}
              color="secondary"
              title="Create Note"
            >
              <AddIcon />
            </Fab>
          </div>
        )}
    </div>
  );
}


noteCreate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  interimNote: PropTypes.shape({
    note: PropTypes.string,
    isNew: PropTypes.bool,
  }).isRequired,
  plant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  plants: PropTypes.shape({}).isRequired,
  locationId: PropTypes.string.isRequired,
};
