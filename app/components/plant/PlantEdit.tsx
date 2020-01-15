// Used to add/edit a plant to/in the location's collection
// Url Create: /plant
// Url Update: /plant/<slug>/<plant-id>

import isEmpty from 'lodash/isEmpty';
import React from 'react';
import PropTypes from 'prop-types';
import getIn from 'lodash/get';
import { produce } from 'immer';
import { Dispatch } from 'redux';

import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { useHistory } from 'react-router';
import PlantEditTerminated from './PlantEditTerminated';
import utils from '../../libs/utils';
import CancelSaveButtons from '../common/CancelSaveButtons';
import InputComboText from '../common/InputComboText';
import { actionFunc } from '../../actions';
import * as validators from '../../models';
import { PlantAction } from '../../../lib/types/redux-payloads';

const { makeSlug } = utils;

const { plant: plantValidator } = validators;

interface PlantEditProps {
  dispatch: Dispatch<PlantAction>;
  interimPlant: UiPlantsValue;
  locations: UiLocations;
  user: UiUser;
  users: UiUsers;
}

export default function PlantEdit(props: PlantEditProps): JSX.Element {
  const history = useHistory();

  const {
    interimPlant, user, dispatch, users, locations,
  } = props;
  const pageTitle = interimPlant.isNew
    ? 'Add New Plant'
    : `Edit ${interimPlant.title}`;

  /**
   * Called when the Location dropdown (a Select component) changes
   * its value
   * @param locationId - MongoId of new value
   */
  const onChangeLocation = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const locationId = event.target.value as string;
    dispatch(actionFunc.editPlantChange({
      locationId,
    }));
  };

  const onChange = (name: string, value: string): void => {
    dispatch(actionFunc.editPlantChange({
      [name]: value,
    }));
  };

  const cancel = (): void => {
    history.goBack();
    dispatch(actionFunc.editPlantClose());
  };

  const addGeo = async (): Promise<void> => {
    try {
      const loc = await utils.getCurrentGeoPosition({});
      dispatch(actionFunc.editPlantChange({ loc }));
    } catch (ex) {
      // continue because okay if geo is not supported
      // TODO: Add a message in UI for the user when it's not supported
    }
  };

  const save = (e: React.MouseEvent<{}, MouseEvent>): void => {
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
  };

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
    <Paper style={paperStyle} elevation={5}>
      <h2 style={{ textAlign: 'center' }}>
        {pageTitle}
      </h2>

      <InputComboText
        changeHandler={onChange}
        error={errors.title}
        id="title"
        label="Title"
        name="title"
        placeholder="How do you refer to this plant? (e.g. Washington Navel)"
        value={title}
      />

      <Select
        id="location"
        onChange={onChangeLocation}
        style={{ textAlign: 'left', width: '100%', marginLeft: 20 }}
        value={locationId}
      >
        {
        Object.keys(locationIdTitleMap).map((key) => (
          <MenuItem
            key={key}
            value={key}
          >
            {locationIdTitleMap[key]}
          </MenuItem>
        ))
      }
      </Select>

      <InputComboText
        changeHandler={onChange}
        error={errors.botanicalName}
        id="botanical-name"
        label="Botanical Name"
        name="botanicalName"
        placeholder="e.g. Citrus sinensis \'Washington Navel\'"
        value={botanicalName}
      />

      <InputComboText
        changeHandler={onChange}
        error={errors.commonName}
        id="common-name"
        label="Common Name"
        name="commonName"
        placeholder="e.g. Washington Navel Orange"
        value={commonName}
      />

      <InputComboText
        changeHandler={onChange}
        error={errors.description}
        id="description"
        label="Description"
        multiLine
        name="description"
        placeholder="Describe this plant and/or the location in your yard"
        style={textAreaStyle}
        value={description}
      />

      <InputComboText
        changeHandler={onChange}
        error={errors.purchasedDate}
        id="acquire-date"
        label="Acquire Date"
        name="purchasedDate"
        placeholder={dateFormat}
        value={purchasedDate}
      />

      <InputComboText
        changeHandler={onChange}
        error={errors.plantedDate}
        id="planted-date"
        label="Planted Date"
        name="plantedDate"
        placeholder={dateFormat}
        value={plantedDate}
      />

      <InputComboText
        changeHandler={onChange}
        error={errors.price}
        id="price"
        label="Price"
        name="price"
        placeholder="$9.99"
        type="number"
        value={price}
      />

      <PlantEditTerminated
        dispatch={dispatch}
        interimPlant={interimPlant}
      />

      {hasGeo
        && (
        <div>
          <Fab
            onClick={addGeo}
            title="Add Location"
          >
            <AddLocationIcon />
          </Fab>
          <InputComboText
            changeHandler={onChange}
            disabled
            error={errors.geoPosition}
            id="geo-position"
            label="Geo Position"
            name="geoPosition"
            placeholder="Location of this plant"
            value={geoPosDisplay}
          />
        </div>
        )}

      {!isEmpty(errors)
        && (
        <div>
          <p className="text-danger col-xs-12">
There were errors. Please check your input.
          </p>
          {errorDivs}
        </div>
        )}

      <CancelSaveButtons
        clickSave={save}
        clickCancel={cancel}
        showButtons
      />

    </Paper>
  );
}

PlantEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
