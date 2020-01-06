import moment from 'moment';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { Dispatch } from 'redux';
import { useHistory } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import utils from '../../libs/utils';
import NotesRead from '../note/NotesRead';
import EditDeleteButtons from '../common/EditDeleteButtons';
import { actionFunc } from '../../actions';
import Markdown from '../common/Markdown';
import { PlantAction } from '../../../lib/types/redux-payloads';

const dateFormat = 'DD-MMM-YYYY';

interface PlantReadProps {
  dispatch: Dispatch<PlantAction>;
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plant: UiPlantsValue;
  plants: UiPlants;
  userCanEdit: boolean;
}

export default function PlantRead(props: PlantReadProps): JSX.Element {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const history = useHistory();

  const { plant: { notesRequested, _id }, dispatch } = props;
  if (!notesRequested) {
    if (_id) {
      dispatch(actionFunc.loadNotesRequest({
        plantIds: [_id],
      }));
    }
  }

  const edit = (): void => {
    const { plant: propsPlant } = props;
    const dateFields: UiPlantsValueDateKeys[] = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    const plant = produce(propsPlant, (draft) => {
      dateFields.forEach((dateField) => {
        const date = draft[dateField];
        if (date) {
          draft[dateField] = utils.intToString(date);
        }
      });
    });
    dispatch(actionFunc.editPlantOpen({ plant, meta: { isNew: false } }));
  };

  const checkDelete = (): void => {
    setShowDeleteConfirmation(true);
  };

  const showImages = (): void => {
    const { plant } = props;
    const noteIds = (plant && plant.notes) || [];
    dispatch(actionFunc.showNoteImages(noteIds));
  };

  const confirmDelete = (yes: boolean): void => {
    if (yes) {
      const {
        plant: {
          _id: plantId,
          locationId,
        },
      } = props;
      if (!plantId) {
        throw new Error(`plantId missing in confirmDelete ${JSON.stringify(props)}`);
      }
      const { locations } = props;
      const payload = {
        locationId,
        plantId,
      };
      const location = locations[locationId];
      dispatch(actionFunc.deletePlantRequest(payload));
      if (location) {
        // Transition to /location/:slug/:id
        const locationUrl = utils.makeLocationUrl(location);
        history.push(locationUrl);
      }
    } else {
      setShowDeleteConfirmation(false);
    }
  };

  const plantedDateTitle = (): string | null => {
    const { plant: { plantedDate } } = props;
    if (plantedDate) {
      const date = utils.intToMoment(plantedDate);
      const daysAgo = date.isSame(moment(), 'day')
        ? 'today'
        : `${date.fromNow()}`;
      return `Planted on ${date.format(dateFormat)} (${daysAgo})`;
    }
    return null;
  };

  const renderDetails = (): JSX.Element | null => {
    const { plant } = props;
    if (!plant) {
      return null;
    }

    const titles = [{
      name: 'description',
      text: '',
      value: plant.description,
    }, {
      name: 'commonName',
      text: 'Common Name',
      value: plant.commonName,
    }, {
      name: 'botanicalName',
      text: 'Botanical Name',
      value: plant.botanicalName,
    }];

    const basicTitles = titles.map(({ text, value }) => {
      if (!value) {
        return null;
      }
      return `${text ? `${text}: ` : ''}${value}`;
    });

    const plantedDateTitleText = plantedDateTitle();
    if (plantedDateTitleText) {
      basicTitles.push(plantedDateTitleText);
    }

    const { isTerminated } = plant;
    if (isTerminated) {
      const { terminatedDate } = plant;
      const dateTerminated = terminatedDate
        ? utils.intToMoment(terminatedDate)
        : null;

      basicTitles.push(
        `This plant was terminated${dateTerminated ? ` on ${dateTerminated.format(dateFormat)}` : ''}.`,
      );

      const { plantedDate } = plant;
      if (plantedDate && dateTerminated) {
        const datePlanted = utils.intToMoment(plantedDate);
        if (datePlanted.isBefore(dateTerminated)) {
          basicTitles.push(`${datePlanted.from(dateTerminated, true)} after it was planted.`);
        }
      }

      const { terminatedReason } = plant;
      if (terminatedReason) {
        basicTitles.push(`Reason: ${terminatedReason}`);
      }

      const { terminatedDescription } = plant;
      if (terminatedDescription) {
        basicTitles.push(`(${terminatedDescription})`);
      }
    }

    const price = utils.formatPrice(plant.price);
    if (price) {
      basicTitles.push(`Price: ${price}`);
    }

    return <Markdown markdown={basicTitles.join('\n\n') || ''} />;
  };

  const paperStyle = {
    display: 'inline-block',
    margin: 20,
    padding: 20,
    width: '100%',
  };

  const {
    interim,
    notes,
    plant,
    plants,
    userCanEdit,
  } = props;

  const { locationId, title } = plant;

  const label = 'Show All Images';
  const buttonStyle = {
    fontSize: 'medium',
    marginTop: '40px',
  };

  return (
    <div>
      {plant
        ? (
          <div className="plant">
            <Paper style={paperStyle} elevation={5}>
              <h2 className="vcenter" style={{ textAlign: 'center' }}>
                {title}
              </h2>
              {renderDetails()}
              <Button
                color="primary"
                onMouseUp={showImages}
                style={buttonStyle}
                variant="contained"
              >
                {label}
              </Button>
              <div style={{ width: '50%', float: 'right' }}>
                <EditDeleteButtons
                  clickDelete={checkDelete}
                  clickEdit={edit}
                  confirmDelete={confirmDelete}
                  deleteTitle={title || ''}
                  showButtons={userCanEdit}
                  showDeleteConfirmation={showDeleteConfirmation}
                />
              </div>
            </Paper>
            <NotesRead
              dispatch={dispatch}
              interim={interim}
              locationId={locationId}
              notes={notes}
              plant={plant}
              plants={plants}
              userCanEdit={userCanEdit}
            />
          </div>
        )
        : (
          <div>
Plant not found or still loading...
          </div>
        )}
    </div>
  );
}

PlantRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interim: PropTypes.shape({
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  notes: PropTypes.shape({
  }).isRequired,
  locations: PropTypes.shape({
  }).isRequired,
  plant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    botanicalName: PropTypes.string,
    commonName: PropTypes.string,
    description: PropTypes.string,
    isTerminated: PropTypes.bool,
    locationId: PropTypes.string.isRequired,
    notes: PropTypes.arrayOf(PropTypes.string),
    notesRequested: PropTypes.bool,
    plantedDate: PropTypes.number,
    terminatedDate: PropTypes.number,
    terminatedDescription: PropTypes.string,
    terminatedReason: PropTypes.string,
    title: PropTypes.string.isRequired,
    price: PropTypes.number,
  }).isRequired,
  plants: PropTypes.shape({
  }).isRequired,
};
