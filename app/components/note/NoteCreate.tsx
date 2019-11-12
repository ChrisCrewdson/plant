// Used to add a note to a plant

import React from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import utils from '../../libs/utils';
import NoteEdit from './NoteEdit';
import { actionFunc } from '../../actions';
import { PlantAction } from '../../../lib/types/redux-payloads';

interface NoteCreateProps {
  dispatch: Dispatch<PlantAction<any>>;
  userCanEdit: boolean;
  interimNote: UiInterimNote;
  plant: UiPlantsValue;
  plants: UiPlants;
  locationId: string;
}

export default class NoteCreate extends React.PureComponent {
  props!: NoteCreateProps;

  static propTypes = {
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

  constructor(props: NoteCreateProps) {
    super(props);

    this.createNote = this.createNote.bind(this);
  }

  createNote() {
    const {
      plant, locationId, plants: plantsObj, dispatch,
    } = this.props;

    const plants = Object.keys(plantsObj).reduce((acc: UiPlants, plantId) => {
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

    dispatch(actionFunc.editNoteOpen({ note, plant }));
  }

  render() {
    const {
      dispatch,
      interimNote,
      locationId,
      plants,
      userCanEdit,
    } = this.props;

    if (!userCanEdit) {
      return null;
    }

    const { isNew: createNote } = interimNote;
    const iconStyle = { fontSize: '3em' };

    return (
      <div>
        {createNote
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
                onClick={this.createNote}
                color="secondary"
                title="Create Note"
              >
                <AddIcon style={iconStyle} />
              </Fab>
            </div>
          )}
      </div>
    );
  }
}
