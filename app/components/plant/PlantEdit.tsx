// Used to add/edit a plant to/in the user's collection
// Url Create: /plant
// Url Update: /plant/<slug>/<plant-id>

import isEmpty from 'lodash/isEmpty';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import MapsAddLocation from 'material-ui/svg-icons/maps/add-location';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import getIn from 'lodash/get';
import { produce } from 'immer';
import { Dispatch } from 'redux';
import { History } from 'history';
import PlantEditTerminated from './PlantEditTerminated';
import utils from '../../libs/utils';
import CancelSaveButtons from '../common/CancelSaveButtons';
import InputComboText from '../common/InputComboText';
import SelectCombo from '../common/SelectCombo';
import { actionFunc } from '../../actions';
import * as validators from '../../models';

const { makeSlug } = utils;

const { plant: plantValidator } = validators;

interface PlantEditState {
  pageTitle?: string;
}

interface PlantEditProps {
  dispatch: Dispatch;
  history: History;
  interimPlant: UiPlantsValue;
  locations: UiLocations;
  user: UiUsersValue;
  users: UiUsers;
}

class PlantEdit extends React.Component {
  props!: PlantEditProps;

  static propTypes = {
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
      loc: PropTypes.shape({
        coordindates: PropTypes.shape({}),
      }),
      locationId: PropTypes.string,
      plantedDate: PropTypes.string,
      price: PropTypes.string,
      purchasedDate: PropTypes.string,
      title: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string,
      activeLocationId: PropTypes.string,
    }).isRequired,
    users: PropTypes.shape({}).isRequired,
    locations: PropTypes.shape({}).isRequired,
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    router: PropTypes.object,
  };

  constructor(props: PlantEditProps) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.save = this.save.bind(this);
    this.addGeo = this.addGeo.bind(this);

    const { interimPlant } = this.props;
    const pageTitle = interimPlant.isNew
      ? 'Add New Plant'
      : `Edit ${interimPlant.title}`;
    this.state = { pageTitle };
  }

  componentWillUnmount() {
    const { dispatch } = (this.props);
    dispatch(actionFunc.editPlantClose());
  }

  /**
   * Called when the Location dropdown (a Select component) changes
   * its value
   * @param e - event - unused
   * @param index - positional index of new value - unused
   * @param value - new value - MongoId of new value
   */
  onChangeLocation(e: React.SyntheticEvent<{}>, index: number, value: any) {
    const { dispatch } = (this.props);
    dispatch(actionFunc.editPlantChange({
      locationId: value,
    }));
  }

  onChange(name: string, value: string) {
    const { dispatch } = (this.props);
    dispatch(actionFunc.editPlantChange({
      [name]: value,
    }));
  }

  cancel() {
    const { dispatch } = (this.props);
    dispatch(actionFunc.editPlantClose());
  }

  addGeo() {
    if (utils.hasGeo()) {
      utils.getGeo({}, (err, loc) => {
        if (err) {
          // console.error(err);
        } else {
          const { dispatch } = (this.props);
          dispatch(actionFunc.editPlantChange({ loc }));
        }
      });
    } else {
      // console.error('No geo service found on device');
    }
  }

  save(e: React.MouseEvent<{}, MouseEvent>) {
    const {
      interimPlant, user, dispatch, history,
    } = (this.props);
    const { isNew = false } = interimPlant;

    const plant: Readonly<UiPlantsValue> = produce(interimPlant, (draft) => {
      const dateFields: PlantDateFieldNames[] = ['plantedDate', 'purchasedDate', 'terminatedDate'];
      dateFields.forEach((dateField) => {
        if (draft[dateField]) {
          draft[dateField] = utils.dateToInt(draft[dateField]);
        }
      });

      draft.userId = user._id;
    });

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
      interimPlant, user, users, locations, dispatch,
    } = (this.props);
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
      locationIds = [] as string[],
    } = users[_id] || {};

    const locationIdTitleMap = locationIds.reduce((acc, locationId) => {
      acc[locationId] = (locations[locationId] || {}).title;
      return acc;
    }, {} as Record<string, string>);
    // activeLocationId is the one that you last viewed which might not be
    // one that you own/manage. Only set locationId to this if it's one that
    // is in the locationIds list.
    const locationId = interimPlant.locationId
      || (locationIds.some((locId) => locId === activeLocationId) && activeLocationId)
      || locationIds[0];

    const geoPosDisplay = interimPlant.loc
      ? `${getIn(interimPlant, ['loc', 'coordinates', '0'])} / ${getIn(interimPlant, ['loc', 'coordinates', '1'])}`
      : '-- / --';

    const {
      pageTitle = '',
    } = (this.state || {}) as PlantEditState;

    const paperStyle: React.CSSProperties = {
      padding: 20,
      width: '100%',
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

    const textAreaStyle: React.CSSProperties = {
      textAlign: 'left',
    };

    const dateFormat = 'MM/DD/YYYY';
    const hasGeo = utils.hasGeo();

    const errorDivs = isEmpty(errors)
      ? []
      : Object.keys(errors).map((key) => (
        <div key={key}>
          {`${key} - ${errors[key]}`}
        </div>
      ));

    return (
      <Paper style={paperStyle} zDepth={1}>
        <h2 style={{ textAlign: 'center' }}>
          {pageTitle}
        </h2>

        <InputComboText
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

        <InputComboText
          changeHandler={this.onChange}
          error={errors.botanicalName}
          id="botanical-name"
          label="Botanical Name"
          name="botanicalName"
          placeholder="e.g. Citrus sinensis \'Washington Navel\'"
          value={botanicalName}
        />
        <Divider />

        <InputComboText
          changeHandler={this.onChange}
          error={errors.commonName}
          id="common-name"
          label="Common Name"
          name="commonName"
          placeholder="e.g. Washington Navel Orange"
          value={commonName}
        />
        <Divider />

        <InputComboText
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

        <InputComboText
          changeHandler={this.onChange}
          error={errors.purchasedDate}
          id="acquire-date"
          label="Acquire Date"
          name="purchasedDate"
          placeholder={dateFormat}
          value={purchasedDate}
        />
        <Divider />

        <InputComboText
          changeHandler={this.onChange}
          error={errors.plantedDate}
          id="planted-date"
          label="Planted Date"
          name="plantedDate"
          placeholder={dateFormat}
          value={plantedDate}
        />
        <Divider />

        <InputComboText
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
          dispatch={dispatch}
          interimPlant={interimPlant}
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
            <InputComboText
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
          )}

        {!isEmpty(errors)
          && (
          <div>
            <p className="text-danger col-xs-12">
There were errors. Please check your input.
            </p>
            {errorDivs}
            <Divider />
          </div>
          )}

        <CancelSaveButtons
          clickSave={this.save}
          clickCancel={this.cancel}
          showButtons
        />

      </Paper>
    );
  }
}

// @ts-ignore - TODO: Solve withRouter() param and tsc
export default withRouter(PlantEdit);
