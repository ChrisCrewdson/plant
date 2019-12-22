import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { produce } from 'immer';
import { Dispatch } from 'redux';
import { History } from 'history';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import utils from '../../libs/utils';
import NotesRead from '../note/NotesRead';
import EditDeleteButtons from '../common/EditDeleteButtons';
import { actionFunc } from '../../actions';
import Markdown from '../common/Markdown';

const dateFormat = 'DD-MMM-YYYY';

interface PlantReadState {
  showDeleteConfirmation: boolean;
}

interface PlantReadProps {
  dispatch: Dispatch;
  history: History;
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plant: UiPlantsValue;
  plants: UiPlants;
  userCanEdit: boolean;
}

class PlantRead extends React.PureComponent {
  props!: PlantReadProps;

  static propTypes = {
    // dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    interim: PropTypes.shape({
    }).isRequired,
    // userCanEdit: PropTypes.bool.isRequired,
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
    }).isRequired,
    plants: PropTypes.shape({
    }).isRequired,
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    router: PropTypes.object.isRequired,
  };

  constructor(props: PlantReadProps) {
    super(props);
    this.edit = this.edit.bind(this);
    this.checkDelete = this.checkDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.showImages = this.showImages.bind(this);

    const { plant: { notesRequested, _id }, dispatch } = props;
    if (!notesRequested) {
      if (_id) {
        dispatch(actionFunc.loadNotesRequest({
          plantIds: [_id],
        }));
      } else {
        // console.error('PlantRead: plant object does not have _id', plant);
      }
    }
  }

  edit(): void {
    const { plant: propsPlant, dispatch } = this.props;
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
  }

  checkDelete(): void {
    this.setState({ showDeleteConfirmation: true });
  }

  showImages(): void {
    const { plant, dispatch } = this.props;
    const noteIds = (plant && plant.notes) || [];
    dispatch(actionFunc.showNoteImages(noteIds));
  }

  confirmDelete(yes: boolean): void {
    if (yes) {
      const {
        plant: {
          _id: plantId,
          locationId,
        },
        dispatch,
      } = this.props;
      if (!plantId) {
        throw new Error(`plantId missing in confirmDelete ${JSON.stringify(this.props)}`);
      }
      const { locations, history } = this.props;
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
      } else {
        // console.warn('Could not find location for locationId', plant.locationId);
      }
    } else {
      this.setState({ showDeleteConfirmation: false });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  plantedDateTitle(): string | null {
    const { plant: { plantedDate } } = this.props;
    if (plantedDate) {
      const date = utils.intToMoment(plantedDate);
      const daysAgo = date.isSame(moment(), 'day')
        ? 'today'
        : `${date.fromNow()}`;
      return `Planted on ${date.format(dateFormat)} (${daysAgo})`;
    }
    return null;
  }

  renderDetails(): JSX.Element | null {
    const { plant } = this.props;
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

    const plantedDateTitle = this.plantedDateTitle();
    if (plantedDateTitle) {
      // eslint-disable-next-line function-paren-newline
      basicTitles.push(plantedDateTitle);
    }

    const { isTerminated } = plant;
    if (isTerminated) {
      const { terminatedDate } = plant;
      const dateTerminated = terminatedDate
        ? utils.intToMoment(terminatedDate)
        : null;

      // eslint-disable-next-line function-paren-newline
      basicTitles.push(
        `This plant was terminated${dateTerminated ? ` on ${dateTerminated.format(dateFormat)}` : ''}.`);

      const { plantedDate } = plant;
      if (plantedDate && dateTerminated) {
        const datePlanted = utils.intToMoment(plantedDate);
        if (datePlanted.isBefore(dateTerminated)) {
          // eslint-disable-next-line function-paren-newline
          basicTitles.push(`${datePlanted.from(dateTerminated, true)} after it was planted.`);
        }
      }

      const { terminatedReason } = plant;
      if (terminatedReason) {
        // eslint-disable-next-line function-paren-newline
        basicTitles.push(`Reason: ${terminatedReason}`);
      }

      const { terminatedDescription } = plant;
      if (terminatedDescription) {
      // eslint-disable-next-line function-paren-newline
        basicTitles.push(`(${terminatedDescription})`);
      }
    }

    const price = utils.formatPrice(plant.price);
    if (price) {
      basicTitles.push(`Price: ${price}`);
    }

    return <Markdown markdown={basicTitles.join('\n\n') || ''} />;
  }

  render(): JSX.Element {
    const paperStyle = {
      display: 'inline-block',
      margin: 20,
      padding: 20,
      width: '100%',
    };

    const {
      dispatch,
      interim,
      notes,
      plant,
      plants,
      userCanEdit,
    } = this.props;

    const {
      showDeleteConfirmation = false,
    } = (this.state || {}) as PlantReadState;

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
                {this.renderDetails()}
                <Button
                  color="primary"
                  onMouseUp={this.showImages}
                  style={buttonStyle}
                  variant="contained"
                >
                  {label}
                </Button>
                <div style={{ width: '50%', float: 'right' }}>
                  <EditDeleteButtons
                    clickDelete={this.checkDelete}
                    clickEdit={this.edit}
                    confirmDelete={this.confirmDelete}
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
}

// @ts-ignore - TODO: Solve withRouter() param and tsc
export default withRouter(PlantRead);
