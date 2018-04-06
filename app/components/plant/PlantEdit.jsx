// Used to add/edit a plant to/in the user's collection
// Url Create: /plant
// Url Update: /plant/<slug>/<plant-id>

const isEmpty = require('lodash/isEmpty');
const { makeSlug } = require('../../libs/utils');
const validators = require('../../models');
const actions = require('../../actions');
const Divider = require('material-ui/Divider').default;
const InputCombo = require('../common/InputCombo');
const Paper = require('material-ui/Paper').default;
const CancelSaveButtons = require('../common/CancelSaveButtons');
const React = require('react');
const utils = require('../../libs/utils');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const MapsAddLocation = require('material-ui/svg-icons/maps/add-location').default;
const PlantEditTerminated = require('./PlantEditTerminated');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const getIn = require('lodash/get');
const seamless = require('seamless-immutable').static;

const { plant: plantValidator } = validators;

class PlantEdit extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.save = this.save.bind(this);
    this.addGeo = this.addGeo.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { interimPlant } = this.props;
    const pageTitle = interimPlant.isNew
      ? 'Add New Plant'
      : `Edit ${interimPlant.title}`;
    this.setState({ pageTitle });
  }

  componentWillUnmount() {
    this.props.dispatch(actions.editPlantClose());
  }

  /**
   * Called when the Location dropdown (a Select component) changes
   * its value
   * @param {object} e - event - unused
   * @param {number} index - positional index of new value - unused
   * @param {string} value - new value - MongoId of new value
   * @memberof PlantEdit
   */
  onChangeLocation(e, index, value) {
    this.props.dispatch(actions.editPlantChange({
      locationId: value,
    }));
  }

  onChange(e) {
    const { name, value } = e.target;
    this.props.dispatch(actions.editPlantChange({
      [name]: value,
    }));
  }

  cancel() {
    this.props.dispatch(actions.editPlantClose());
  }

  addGeo() {
    if (utils.hasGeo()) {
      utils.getGeo({}, (err, geoJson) => {
        if (err) {
          // console.error(err);
        } else {
          this.props.dispatch(actions.editPlantChange({
            loc: geoJson,
          }));
        }
      });
    } else {
      // console.error('No geo service found on device');
    }
  }

  save(e) {
    const plant = seamless.asMutable(this.props.interimPlant);
    const { isNew = false } = plant;
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        plant[dateField] = utils.dateToInt(plant[dateField]);
      }
    });

    plant.userId = this.props.user._id;

    const { dispatch, history } = this.props;
    try {
      const transformed = plantValidator(plant, { isNew });
      if (isNew) {
        dispatch(actions.createPlantRequest(transformed));
      } else {
        dispatch(actions.updatePlantRequest(transformed));
      }
      dispatch(actions.editPlantClose());
      const newLocation = `/plant/${makeSlug(transformed.title)}/${transformed._id}`;
      history.push(newLocation);
    } catch (errors) {
      dispatch(actions.editPlantChange({ errors }));
    }
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const {
      interimPlant, user, users, locations,
    } = this.props;
    const {
      title = '',
      botanicalName = '',
      commonName = '',
      description = '',
      purchasedDate = '',
      plantedDate = '',
      price = '',
      errors = {},
    } = interimPlant;

    const {
      _id = '',
      activeLocationId = '',
    } = user;
    const {
      locationIds = [],
    } = users[_id] || {};

    const locationIdTitleMap = locationIds.reduce((acc, locationId) => {
      acc[locationId] = (locations[locationId] || {}).title;
      return acc;
    }, {});
    // activeLocationId is the one that you last viewed which might not be
    // one that you own/manage. Only set locationId to this if it's one that
    // is in the locationIds list.
    const locationId = interimPlant.locationId
      || (locationIds.some(locId => locId === activeLocationId) && activeLocationId)
      || locationIds[0];

    const geoPosDisplay = interimPlant.loc
      ? `${getIn(interimPlant, ['loc', 'coordinates', '0'])} / ${getIn(interimPlant, ['loc', 'coordinates', '1'])}`
      : '-- / --';

    const {
      pageTitle = '',
    } = this.state || {};

    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

    const textAreaStyle = {
      textAlign: 'left',
    };

    const dateFormat = 'MM/DD/YYYY';
    const hasGeo = utils.hasGeo();

    const errorDivs = isEmpty(errors)
      ? []
      : Object.keys(errors).map(key =>
        (
          <div key={key}>
            {`${key} - ${errors[key]}`}
          </div>
        ));

    return (
      <Paper style={paperStyle} zDepth={1}>
        <h2 style={{ textAlign: 'center' }}>{pageTitle}</h2>

        <InputCombo
          changeHandler={this.onChange}
          error={errors.title}
          id="title"
          label="Title"
          name="title"
          placeholder="How do you refer to this plant? (e.g. Washington Navel)"
          value={title}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChangeLocation}
          error={errors.locationId}
          id="location"
          label="Location"
          name="locationId"
          options={locationIdTitleMap}
          placeholder="Which location is this at?"
          style={{ textAlign: 'left', width: '100%' }}
          type="select"
          value={locationId}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.botanicalName}
          extraClasses="col-sm-6"
          id="botanical-name"
          label="Botanical Name"
          name="botanicalName"
          placeholder="e.g. Citrus sinensis \'Washington Navel\'"
          value={botanicalName}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.commonName}
          extraClasses="col-sm-6"
          id="common-name"
          label="Common Name"
          name="commonName"
          placeholder="e.g. Washington Navel Orange"
          value={commonName}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.description}
          id="description"
          label="Description"
          multiLine
          name="description"
          placeholder="Describe this plant and/or the location in your yard"
          style={textAreaStyle}
          value={description}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.purchasedDate}
          extraClasses="col-sm-4"
          id="acquire-date"
          label="Acquire Date"
          name="purchasedDate"
          placeholder={dateFormat}
          value={purchasedDate}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.plantedDate}
          extraClasses="col-sm-4"
          id="planted-date"
          label="Planted Date"
          name="plantedDate"
          placeholder={dateFormat}
          value={plantedDate}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.price}
          extraClasses="col-sm-4"
          id="price"
          label="Price"
          name="price"
          placeholder="$9.99"
          type="number"
          value={price}
        />
        <Divider />

        <PlantEditTerminated
          {...this.props}
        />

        {hasGeo &&
          <div>
            <FloatingActionButton
              onClick={this.addGeo}
              title="Add Location"
            >
              <MapsAddLocation />
            </FloatingActionButton>
            <InputCombo
              changeHandler={this.onChange}
              disabled
              error={errors.geoPosition}
              extraClasses="col-sm-4"
              id="geo-position"
              label="Geo Position"
              name="geoPosition"
              placeholder="Location of this plant"
              value={geoPosDisplay}
            />
            <Divider />
          </div>
        }

        {!isEmpty(errors) &&
          <div>
            <p className="text-danger col-xs-12">There were errors. Please check your input.</p>
            {errorDivs}
            <Divider />
          </div>
        }

        <CancelSaveButtons
          clickSave={this.save}
          clickCancel={this.cancel}
          showButtons
        />

      </Paper>
    );
  }
}

PlantEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  interimPlant: PropTypes.shape({
    botanicalName: PropTypes.string,
    commonName: PropTypes.string,
    description: PropTypes.string,
    errors: PropTypes.object,
    isNew: PropTypes.bool,
    plantedDate: PropTypes.string,
    price: PropTypes.string,
    purchasedDate: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
  }).isRequired,
  users: PropTypes.shape({}).isRequired,
  locations: PropTypes.shape({}).isRequired,
};

module.exports = withRouter(PlantEdit);
