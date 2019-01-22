// Used to add/edit a plant to/in the user's collection
// Url Create: /plant
// Url Update: /plant/<slug>/<plant-id>

const isEmpty = require('lodash/isEmpty');
const Divider = require('material-ui/Divider').default;
const Paper = require('material-ui/Paper').default;
const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const MapsAddLocation = require('material-ui/svg-icons/maps/add-location').default;
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const getIn = require('lodash/get');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const PlantEditTerminated = require('./PlantEditTerminated');
const utils = require('../../libs/utils');
const CancelSaveButtons = require('../common/CancelSaveButtons');
const InputCombo = require('../common/InputCombo');
const SelectCombo = require('../common/SelectCombo');
const { actionFunc } = require('../../actions');
const validators = require('../../models');
const { makeSlug } = require('../../libs/utils');

const { plant: plantValidator } = validators;

class PlantEdit extends React.Component {
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    router: PropTypes.object,
  };

  /**
   * @param {PlantEditProps} props
   */
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
    const { interimPlant } = /** @type {PlantEditProps} */ (this.props);
    const pageTitle = interimPlant.isNew
      ? 'Add New Plant'
      : `Edit ${interimPlant.title}`;
    this.setState({ pageTitle });
  }

  componentWillUnmount() {
    const { dispatch } = /** @type {PlantEditProps} */ (this.props);
    dispatch(actionFunc.editPlantClose());
  }

  /**
   * Called when the Location dropdown (a Select component) changes
   * its value
   * @param {React.SyntheticEvent<{}>} e - event - unused
   * @param {number} index - positional index of new value - unused
   * @param {any} value - new value - MongoId of new value
   * @memberof PlantEdit
   */
  onChangeLocation(e, index, value) {
    const { dispatch } = /** @type {PlantEditProps} */ (this.props);
    dispatch(actionFunc.editPlantChange({
      locationId: value,
    }));
  }

  /**
   *e: React.ChangeEvent<HTMLInputElement>, newValue: string
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @param {string} value
   * @memberof PlantEdit
   */
  onChange(e, value) {
    const { name } = e.target;
    const { dispatch } = /** @type {PlantEditProps} */ (this.props);
    dispatch(actionFunc.editPlantChange({
      [name]: value,
    }));
  }

  cancel() {
    const { dispatch } = /** @type {PlantEditProps} */ (this.props);
    dispatch(actionFunc.editPlantClose());
  }

  addGeo() {
    if (utils.hasGeo()) {
      utils.getGeo({}, (err, loc) => {
        if (err) {
          // console.error(err);
        } else {
          const { dispatch } = /** @type {PlantEditProps} */ (this.props);
          dispatch(actionFunc.editPlantChange({ loc }));
        }
      });
    } else {
      // console.error('No geo service found on device');
    }
  }

  /**
   * @param {React.MouseEvent<{}, MouseEvent>} e
   * @memberof PlantEdit
   */
  save(e) {
    const {
      interimPlant, user, dispatch, history,
    } = /** @type {PlantEditProps} */ (this.props);
    const plant = seamless.asMutable(interimPlant);
    const { isNew = false } = plant;
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        plant[dateField] = utils.dateToInt(plant[dateField]);
      }
    });

    plant.userId = user._id;

    try {
      const transformed = plantValidator(plant, { isNew });
      if (isNew) {
        dispatch(actionFunc.createPlantRequest(transformed));
      } else {
        dispatch(actionFunc.updatePlantRequest(transformed));
      }
      dispatch(actionFunc.editPlantClose());
      const newLocation = `/plant/${makeSlug(transformed.title)}/${transformed._id}`;
      history.push(newLocation);
    } catch (errors) {
      dispatch(actionFunc.editPlantChange({ errors }));
    }
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const {
      interimPlant, user, users, locations,
    } = /** @type {PlantEditProps} */ (this.props);
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
      locationIds = /** @type {string[]} */ ([]),
    } = users[_id] || {};

    const locationIdTitleMap = locationIds.reduce((acc, locationId) => {
      acc[locationId] = (locations[locationId] || {}).title;
      return acc;
    }, /** @type {Dictionary<string>} */ ({}));
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

    /** @type {React.CSSProperties} */
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

    /** @type {React.CSSProperties} */
    const textAreaStyle = {
      textAlign: 'left',
    };

    const dateFormat = 'MM/DD/YYYY';
    const hasGeo = utils.hasGeo();

    const errorDivs = isEmpty(errors)
      ? []
      : Object.keys(errors).map(key => (
        <div key={key}>
          {`${key} - ${errors[key]}`}
        </div>
      ));

    return (
      <Paper style={paperStyle} zDepth={1}>
        <h2 style={{ textAlign: 'center' }}>
          {pageTitle}
        </h2>

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

        <SelectCombo
          changeHandler={this.onChangeLocation}
          error={errors.locationId}
          id="location"
          label="Location"
          options={locationIdTitleMap}
          placeholder="Which location is this at?"
          style={{ textAlign: 'left', width: '100%' }}
          value={locationId}
        />
        <Divider />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.botanicalName}
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

        {hasGeo
          && (
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
              id="geo-position"
              label="Geo Position"
              name="geoPosition"
              placeholder="Location of this plant"
              value={geoPosDisplay}
            />
            <Divider />
          </div>
          )
        }

        {!isEmpty(errors)
          && (
          <div>
            <p className="text-danger col-xs-12">
There were errors. Please check your input.
            </p>
            {errorDivs}
            <Divider />
          </div>
          )
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

// @ts-ignore - TODO: Solve withRouter() param and tsc
module.exports = withRouter(PlantEdit);
