const actions = require('../../actions');
const EditDeleteButtons = require('../common/EditDeleteButtons');
const NotesRead = require('../note/NotesRead');
const moment = require('moment');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const utils = require('../../libs/utils');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

const dateFormat = 'DD-MMM-YYYY';

class PlantRead extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.edit = this.edit.bind(this);
    this.checkDelete = this.checkDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
  }

  componentWillMount() {
    const { plant } = this.props;
    if (!plant.has('notesRequested')) {
      if (plant.has('_id')) {
        this.props.dispatch(actions.loadNotesRequest({
          plantId: plant.get('_id'),
        }));
      } else {
        // console.error('PlantRead: plant object does not have _id', plant.toJS());
      }
    }
  }

  edit() {
    const plant = this.props.plant.toJS();
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        plant[dateField] = utils.intToString(plant[dateField]);
      }
    });
    this.props.dispatch(actions.editPlantOpen({ plant, meta: { isNew: false } }));
  }

  checkDelete() {
    this.setState({ showDeleteConfirmation: true });
  }

  confirmDelete(yes) {
    if (yes) {
      const { plant, locations, history } = this.props;
      const payload = {
        locationId: plant.get('locationId'),
        plantId: plant.get('_id'),
      };
      const location = locations.get(plant.get('locationId'));
      this.props.dispatch(actions.deletePlantRequest(payload));
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
  plantedDateTitle(plant) {
    const plantedDate = plant.get('plantedDate');
    if (plantedDate) {
      const date = utils.intToMoment(plantedDate);
      const daysAgo = date.isSame(moment(), 'day')
        ? 'today'
        : `${date.fromNow()}`;
      return `Planted on ${date.format(dateFormat)} (${daysAgo})`;
    }
    return null;
  }

  renderDetails(plant) {
    if (!plant) {
      return null;
    }

    const titles = [
      { name: 'description', text: '' },
      { name: 'commonName', text: 'Common Name' },
      { name: 'botanicalName', text: 'Botanical Name' },
    ];
    const basicTitles = titles.map((title) => {
      const value = plant.get(title.name);
      if (!value) {
        return null;
      }
      const renderText = `${title.text ? `${title.text}: ` : ''}${value}`;
      return (
        <div key={title.name}>
          {renderText}
        </div>);
    });

    const plantedDateTitle = this.plantedDateTitle(plant);
    if (plantedDateTitle) {
      // eslint-disable-next-line function-paren-newline
      basicTitles.push(
        <div key="plantedDate">
          {plantedDateTitle}
        </div>);
    }

    const isTerminated = plant.get('isTerminated');
    if (isTerminated) {
      const terminatedDate = plant.get('terminatedDate');
      const dateTerminated = terminatedDate
        ? utils.intToMoment(terminatedDate)
        : null;

      // eslint-disable-next-line function-paren-newline
      basicTitles.push(
        <div key="terminatedDate">
          {`This plant was terminated${terminatedDate ? ` on ${dateTerminated.format(dateFormat)}` : ''}.`}
        </div>);

      const plantedDate = plant.get('plantedDate');
      if (plantedDate && dateTerminated) {
        const datePlanted = utils.intToMoment(plantedDate);
        if (datePlanted.isBefore(dateTerminated)) {
          // eslint-disable-next-line function-paren-newline
          basicTitles.push(
            <div key="terminatedDaysAfterPlanting">
              {`${datePlanted.from(dateTerminated, true)} after it was planted.`}
            </div>);
        }
      }

      const terminatedReason = plant.get('terminatedReason', 'unknown');
      if (terminatedReason === 'unknown') {
        // console.error('terminatedReason not set', plant.toJS());
      } else {
      // eslint-disable-next-line function-paren-newline
        basicTitles.push(
          <div key="terminatedReason">
            {`Reason: ${terminatedReason}`}
          </div>);
      }

      const terminatedDescription = plant.get('terminatedDescription');
      if (terminatedDescription) {
      // eslint-disable-next-line function-paren-newline
        basicTitles.push(
          <div key="terminatedDescription">
            {`(${terminatedDescription})`}
          </div>);
      }
    }

    return basicTitles;
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
      plant,
    } = this.props;

    const {
      showDeleteConfirmation = false,
    } = this.state || {};

    const locationId = plant.get('locationId');

    return (
      <div>
        {plant ?
          <div className="plant">
            <Paper style={paperStyle} zDepth={1}>
              <h2 className="vcenter" style={{ textAlign: 'center' }}>
                {plant.get('title')}
              </h2>
              {this.renderDetails(plant)}
              <EditDeleteButtons
                clickEdit={this.edit}
                clickDelete={this.checkDelete}
                confirmDelete={this.confirmDelete}
                showDeleteConfirmation={showDeleteConfirmation}
                showButtons={userCanEdit}
                deleteTitle={plant.get('title') || ''}
              />
            </Paper>
            <NotesRead
              dispatch={this.props.dispatch}
              interim={this.props.interim}
              userCanEdit={userCanEdit}
              notes={this.props.notes}
              plant={plant}
              plants={this.props.plants}
              locationId={locationId}
            />
          </div>
          :
          <div>Plant not found or still loading...</div>
        }
      </div>
    );
  }
}

PlantRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  interim: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  notes: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  locations: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  plant: PropTypes.shape({
    get: PropTypes.func.isRequired,
    toJS: PropTypes.func.isRequired,
  }).isRequired,
  plants: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
};

module.exports = withRouter(PlantRead);
