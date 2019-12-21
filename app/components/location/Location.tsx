// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Base from '../base/Base';
import InputComboText from '../common/InputComboText';
import PlantItem from '../plant/PlantItem';
import { canEdit } from '../../libs/auth-helper';
import { actionFunc } from '../../actions';
import NoteCreate from '../note/NoteCreate';
import utils from '../../libs/utils';
import AddPlantButton from '../common/AddPlantButton';


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

interface LocationState {
  filter: string;
  locations?: Record<string, UiLocationsValue>;
  allLoadedPlants?: Record<string, UiPlantsValue>;
  interim?: UiInterim;
  authUser?: UiUsersValue;
}

class Location extends React.Component {
  static addPlantButton(userCanEdit: boolean): JSX.Element {
    return (
      <div style={{ float: 'right', marginBottom: '60px' }}>
        <AddPlantButton
          show={userCanEdit}
        />
      </div>
    );
  }

  context!: PlantContext;

  props!: LocationProps;

  unsubscribe!: Function;

  // eslint-disable-next-line react/state-in-constructor
  state: LocationState;

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: LocationProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    // eslint-disable-next-line react/state-in-constructor
    this.state = { filter: '' };
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount(): void {
    const { store } = this.context;
    const { locations = {} } = store.getState();
    const { match: { params } } = this.props;
    const { id: locationId } = params;

    const plantIds = locations[locationId] && locations[locationId].plantIds;
    if (!plantIds) {
      store.dispatch(actionFunc.loadPlantsRequest(locationId));
    }
    this.onChange();
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange(): void {
    const { store } = this.context;
    const {
      interim,
      locations,
      plants: allLoadedPlants,
      user: authUser,
      users,
    } = store.getState();
    const state = {
      allLoadedPlants,
      authUser,
      interim,
      locations,
      users,
    };
    this.setState(state);
  }

  postSaveSuccessCreateNote(): void {
    const { store } = this.context;
    store.dispatch(actionFunc.editNoteClose());
  }

  static renderTitle(location: UiLocationsValue): JSX.Element {
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${location.title} - Plant List`}
      </h2>
    );
  }

  static renderWaiting(location: UiLocationsValue): JSX.Element {
    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <CircularProgress />
          </h3>
        </div>
      </Base>
    );
  }

  static renderNoPlants(location: UiLocationsValue, userCanEdit: boolean): JSX.Element {
    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
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
  }

  render(): JSX.Element {
    const { store } = this.context;
    const {
      filter = '',
      locations,
      allLoadedPlants = {},
      interim,
      authUser,
    } = this.state;
    const { match: { params } } = this.props;

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
              dispatch={store.dispatch}
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
        return Location.renderWaiting(location);
      }
      return Location.renderNoPlants(location, userCanEdit);
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
          dispatch={store.dispatch}
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
      store.dispatch(actionFunc.loadUnloadedPlantsRequest(tileElements.unloaded));
    }

    const filterInput = (
      <InputComboText
        changeHandler={(_, value) => this.setState({ filter: value.toLowerCase() })}
        id="plant-title-filter"
        label="Filter"
        name="filter"
        placeholder="Type a plant name to filter..."
        value={filter}
      />
    );

    const stats = (
      <div>
        <p>
          {`Total: ${plantStats.total}`}
        </p>
        <p>
          {`Alive: ${plantStats.alive}`}
        </p>
      </div>
    );

    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          {stats}
          {filterInput}
          {tileElements.found}
          {Location.addPlantButton(userCanEdit)}
          <div className="clear">
&nbsp;
          </div>
        </div>
      </Base>
    );
  }
}

// @ts-ignore - TODO: Solve withRouter() param and tsc
export default withRouter(Location);
