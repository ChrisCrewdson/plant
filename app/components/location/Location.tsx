// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import CircularProgress from '@material-ui/core/CircularProgress';

import Base from '../base/Base';
import InputComboText from '../common/InputComboText';
import PlantItem from '../plant/PlantItem';
import { canEdit } from '../../libs/auth-helper';
import { actionFunc } from '../../actions';
import NoteCreate from '../note/NoteCreate';
import utils from '../../libs/utils';
import AddPlantButton from '../common/AddPlantButton';
import { UiInterimNote } from '../../../lib/db/mongo/model-note';
import { PlantStateTree } from '../../../lib/types/react-common';

interface LocationPropsMatchParams {
  id: string;
  slug: string;
}

interface LocationPropsMatch {
  params: LocationPropsMatchParams;
}

export interface LocationProps {
  match: LocationPropsMatch;
}

const addPlantButton = (userCanEdit: boolean): JSX.Element => (
  <div style={{ float: 'right', marginBottom: '60px' }}>
    <AddPlantButton
      show={userCanEdit}
    />
  </div>
);

const renderTitle = (location: UiLocationsValue): JSX.Element => (
  <h2 style={{ textAlign: 'center' }}>
    {`${location.title} - Plant List`}
  </h2>
);

const renderWaiting = (location: UiLocationsValue): JSX.Element => (
  <Base>
    <div>
      {renderTitle(location)}
      <h3 style={{ textAlign: 'center' }}>
        <CircularProgress />
      </h3>
    </div>
  </Base>
);

const renderNoPlants = (location: UiLocationsValue, userCanEdit: boolean): JSX.Element => (
  <Base>
    <div>
      {renderTitle(location)}
      <h3 style={{ textAlign: 'center' }}>
        <div style={{ marginTop: '100px' }}>
No plants added yet...
        </div>
        <AddPlantButton
          show={userCanEdit}
          style={{ marginTop: '10px' }}
        />
      </h3>
    </div>
  </Base>
);

export default function Location(props: LocationProps): JSX.Element {
  const dispatch = useDispatch();
  const locations = useSelector((state: PlantStateTree) => state.locations);
  const interim = useSelector((state: PlantStateTree) => state.interim);
  const allLoadedPlants = useSelector((state: PlantStateTree) => state.plants);
  const authUser = useSelector((state: PlantStateTree) => state.user);

  const { match: { params } } = props;
  const { id: paramLocationId } = params;

  const paramPlantIds = locations[paramLocationId] && locations[paramLocationId].plantIds;
  if (!paramPlantIds) {
    dispatch(actionFunc.loadPlantsRequest(paramLocationId));
  }

  const [filter, setFilter] = useState('');

  const location = locations && locations[params.id];
  if (!location) {
    return (
      <Base>
        <div>
          <CircularProgress />
        </div>
      </Base>
    );
  }

  const interimNote = (interim && interim.note && interim.note.note) || {} as UiInterimNote;
  const plantCreateNote = (interim && interim.note && interim.note.plant) || {} as UiPlantsValue;

  const createNote = !!(interimNote && interimNote.isNew);

  const userCanEdit = canEdit(authUser && authUser._id, location);
  const { _id: locationId } = location;

  if (createNote && userCanEdit) {
    const style: React.CSSProperties = {
      paddingTop: '30px',
      textAlign: 'center',
    };
    return (
      <Base>
        <div>
          <h4 style={style}>
            {`Create a Note for ${plantCreateNote && plantCreateNote.title}`}
          </h4>
          <NoteCreate
            dispatch={dispatch}
            userCanEdit={userCanEdit}
            interimNote={interimNote}
            plant={plantCreateNote}
            plants={allLoadedPlants}
            locationId={locationId}
          />
        </div>
      </Base>
    );
  }

  const { plantIds } = location;
  if (!plantIds || !plantIds.length) {
    if (interim && interim.loadPlantRequest) {
      return renderWaiting(location);
    }
    return renderNoPlants(location, userCanEdit);
  }

  const sortedPlantIds = utils.filterSortPlants(plantIds, allLoadedPlants, filter);
  const plantStats = utils.plantStats(plantIds, allLoadedPlants);

  // Don't send the name into PlantItem to skip the subtitle
  // If all the plants are at the same location then don't need the
  // location name. If the plants are from a search result then send
  // in the name:
  // title={location.title}
  const tileElements = sortedPlantIds.reduce((acc, plantId) => {
    const plant = allLoadedPlants && allLoadedPlants[plantId];
    if (plant) {
      const { _id } = plant;
      acc.found.push(<PlantItem
        key={_id}
        dispatch={dispatch}
        userCanEdit={userCanEdit}
        plant={plant}
      />);
    } else {
      acc.unloaded.push(plantId);
    }
    return acc;
  }, {
    found: [] as JSX.Element[],
    unloaded: [] as string[],
  });

  if (tileElements.unloaded.length) {
    dispatch(actionFunc.loadUnloadedPlantsRequest(tileElements.unloaded));
  }

  const filterInput = (
    <InputComboText
      changeHandler={(_, value): void => { setFilter(value.toLowerCase()); }}
      id="plant-title-filter"
      label="Filter"
      name="filter"
      placeholder="Type a plant name to filter..."
      value={filter}
    />
  );

  // TODO: Search codebase for this and put in a config.
  const base = 'https://plaaant.com';
  const downloadCsv = (): void => {
    const plants = Object.values(allLoadedPlants)
      .filter((plant) => plant.locationId === location._id);
    const lines = plants.map((plant) => {
      const { title, _id = '' } = plant;
      const link = utils.makePlantUrl({ title, _id, base });
      const dashDate = utils.makeDashDate(plant.plantedDate);
      return `"${plant.title}","${dashDate}","${link}"`;
    });

    lines.unshift('"Title","PlantedDate","Link"');
    const csv = lines.join('\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'application/csv' }));

    const hiddenElement = document.createElement('a');
    hiddenElement.href = href;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'plants.csv';
    hiddenElement.click();
  };

  const stats = (
    <div>
      <div style={{ float: 'left' }}>
        <p>
          {`Total: ${plantStats.total}`}
        </p>
        <p>
          {`Alive: ${plantStats.alive}`}
        </p>
      </div>
      <div style={{ float: 'right' }}>
        <a href={window.location.href} onClick={(): any => { downloadCsv(); }}>
          Download CSV
        </a>
      </div>
    </div>
  );

  return (
    <Base>
      <div>
        {renderTitle(location)}
        {stats}
        {filterInput}
        {tileElements.found}
        {addPlantButton(userCanEdit)}
        <div className="clear">
&nbsp;
        </div>
      </div>
    </Base>
  );
}

Location.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
