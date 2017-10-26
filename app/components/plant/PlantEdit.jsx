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
const Immutable = require('immutable');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const MapsAddLocation = require('material-ui/svg-icons/maps/add-location').default;
const PlantEditTerminated = require('./PlantEditTerminated');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

const validate = validators.plant;

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

  componentWillMount() {
    const { interimPlant } = this.props;
    const pageTitle = interimPlant.get('isNew')
      ? 'Add New Plant'
      : `Edit ${interimPlant.get('title')}`;
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
            loc: Immutable.fromJS(geoJson),
          }));
        }
      });
    } else {
      // console.error('No geo service found on device');
    }
  }

  save(e) {
    const plant = this.props.interimPlant.toJS();
    const { isNew = false } = plant;
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        plant[dateField] = utils.dateToInt(plant[dateField]);
      }
    });

    plant.userId = this.props.user.get('_id');

    validate(plant, { isNew }, (errors, transformed) => {
      const { dispatch, history } = this.props;
      if (errors) {
        // console.warn('Validation errors:', errors);
        dispatch(actions.editPlantChange({ errors }));
      } else {
        if (isNew) {
          dispatch(actions.createPlantRequest(transformed));
        } else {
          dispatch(actions.updatePlantRequest(transformed));
        }
        dispatch(actions.editPlantClose());
        const newLocation = `/plant/${makeSlug(transformed.title)}/${transformed._id}`;
        history.push(newLocation);
      }
    });
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const { interimPlant, user } = this.props;
    const title = interimPlant.get('title', '');
    const botanicalName = interimPlant.get('botanicalName', '');
    const commonName = interimPlant.get('commonName', '');
    const description = interimPlant.get('description', '');
    const purchasedDate = interimPlant.get('purchasedDate', '');
    const plantedDate = interimPlant.get('plantedDate', '');
    const price = interimPlant.get('price', '');
    const errors = interimPlant.get('errors', Immutable.Map()).toJS();

    const locationIds = user.get('locationIds', Immutable.List()).toJS() || [];
    const activeLocationId = user.get('activeLocationId', '');
    const locations = locationIds.reduce((acc, locationId) => {
      acc[locationId._id] = locationId.title;
      return acc;
    }, {});
    // TODO: Should be able to mark locationIds with one of them as a default
    const locationId = interimPlant.get('locationId', '')
      || activeLocationId || (locationIds[0] || {})._id;

    const geoPosDisplay = interimPlant.has('loc')
      ? `${interimPlant.getIn(['loc', 'coordinates', '0'])} / ${interimPlant.getIn(['loc', 'coordinates', '1'])}`
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
          label="Title"
          name="title"
          placeholder="How do you refer to this plant? (e.g. Washington Navel)"
          value={title}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChangeLocation}
          error={errors.locationId}
          label="Location"
          name="locationId"
          options={locations}
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
          label="Common Name"
          name="commonName"
          placeholder="e.g. Washington Navel Orange"
          value={commonName}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.description}
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
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
  interimPlant: PropTypes.shape({
    get: PropTypes.func.isRequired,
    toJS: PropTypes.func.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
};

module.exports = withRouter(PlantEdit);
