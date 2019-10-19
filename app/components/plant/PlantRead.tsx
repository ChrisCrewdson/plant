import moment from 'moment';
import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import si from 'seamless-immutable';
import utils from '../../libs/utils';
import NotesRead from '../note/NotesRead';
import EditDeleteButtons from '../common/EditDeleteButtons';
import { actionFunc } from '../../actions';
import Markdown from '../common/Markdown';

const dateFormat = 'DD-MMM-YYYY';
// @ts-ignore
const seamless = si.static;

interface PlantReadState {
  showDeleteConfirmation: boolean;
}

class PlantRead extends React.PureComponent {
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
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { plant: { notesRequested, _id }, dispatch } = this.props as PlantReadProps;
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

  edit() {
    const { plant: propsPlant, dispatch } = this.props as PlantReadProps;
    const plant = seamless.asMutable(propsPlant);
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        plant[dateField] = utils.intToString(plant[dateField]);
      }
    });
    dispatch(actionFunc.editPlantOpen({ plant, meta: { isNew: false } }));
  }

  checkDelete() {
    this.setState({ showDeleteConfirmation: true });
  }

  showImages() {
    const { plant, dispatch } = this.props as PlantReadProps;
    const noteIds = (plant && plant.notes) || [];
    dispatch(actionFunc.showNoteImages(noteIds));
  }

  /**
   * @param {boolean} yes
   * @memberof PlantRead
   */
  confirmDelete(yes: boolean) {
    if (yes) {
      const {
        plant: {
          _id,
          locationId,
        },
        dispatch,
      } = this.props as PlantReadProps;
      const { locations, history } = this.props as PlantReadProps;
      const payload = {
        locationId,
        plantId: _id,
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
  plantedDateTitle() {
    const { plant: { plantedDate } } = this.props as PlantReadProps;
    if (plantedDate) {
      const date = utils.intToMoment(plantedDate);
      const daysAgo = date.isSame(moment(), 'day')
        ? 'today'
        : `${date.fromNow()}`;
      return `Planted on ${date.format(dateFormat)} (${daysAgo})`;
    }
    return null;
  }

  renderDetails() {
    const { plant } = this.props as PlantReadProps;
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

    return <Markdown markdown={basicTitles.join('\n\n') || ''} />;
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    const {
      userCanEdit,
      dispatch,
      interim,
      notes,
      plant,
      plants,
    } = this.props as PlantReadProps;

    const {
      showDeleteConfirmation = false,
    } = (this.state || {}) as PlantReadState;

    const { locationId, title } = plant;

    const label = 'Show All Images';

    return (
      <div>
        {plant
          ? (
            <div className="plant">
              <Paper style={paperStyle} zDepth={1}>
                <h2 className="vcenter" style={{ textAlign: 'center' }}>
                  {title}
                </h2>
                {this.renderDetails()}
                <RaisedButton
                  label={label}
                  style={{ marginTop: '40px' }}
                  onMouseUp={this.showImages}
                  primary
                />
                <div style={{ width: '50%', float: 'right' }}>
                  <EditDeleteButtons
                    clickEdit={this.edit}
                    clickDelete={this.checkDelete}
                    confirmDelete={this.confirmDelete}
                    showDeleteConfirmation={showDeleteConfirmation}
                    showButtons={userCanEdit}
                    deleteTitle={title || ''}
                  />
                </div>
              </Paper>
              <NotesRead
                dispatch={dispatch}
                interim={interim}
                userCanEdit={userCanEdit}
                notes={notes}
                plant={plant}
                plants={plants}
                locationId={locationId}
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