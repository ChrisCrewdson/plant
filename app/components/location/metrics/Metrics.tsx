// Used to show a collection of metrics for a location.
// Url: /metrics/<location-name>/_location_id

import CircularProgress from 'material-ui/CircularProgress';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Base from '../../base/Base';
import PlantItem from '../../plant/PlantItem';
import { canEdit } from '../../../libs/auth-helper';
import { actionFunc } from '../../../actions';
import utils from '../../../libs/utils';
import AddPlantButton from '../../common/AddPlantButton';
import LastMeasured, { MetricDate } from './LastMeasured';

// TODO: AT THIS POINT THIS FILE IS JUST A COPY OF THE Location file/class
// with the class renamed to Metrics. It's tested and works on the url.
// With this as an initial commit it is easy to iterate on this.

class Metrics extends React.Component {
  static addPlantButton(userCanEdit: boolean) {
    return (
      <div style={{ float: 'right', marginBottom: '60px' }}>
        <AddPlantButton
          show={userCanEdit}
        />
      </div>
    );
  }

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

  // @ts-ignore - This file is a copy of the Location file and needs to be finished
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    // eslint-disable-next-line react/state-in-constructor
    this.state = { filter: '' };
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { locations = {} } = store.getState();
    // @ts-ignore - This file is a copy of the Location file and needs to be finished
    const { match } = this.props;
    const { id: locationId } = match.params;

    const plantIds = locations[locationId] && locations[locationId].plantIds;
    if (!plantIds) {
      store.dispatch(actionFunc.loadPlantsRequest(locationId));
    }
    this.onChange();
    // @ts-ignore - This file is a copy of the Location file and needs to be finished
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
  // @ts-ignore - This file is a copy of the Location file and needs to be finished
    if (this.unsubscribe) {
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      this.unsubscribe();
    }
  }

  onChange() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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

  postSaveSuccessCreateNote() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    store.dispatch(actionFunc.editNoteClose());
  }

  // @ts-ignore - This file is a copy of the Location file and needs to be finished
  static renderTitle(location) {
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${location.title} - Metrics`}
      </h2>
    );
  }

  // @ts-ignore - This file is a copy of the Location file and needs to be finished
  static renderWaiting(location) {
    return (
      <Base>
        <div>
          {Metrics.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <CircularProgress />
          </h3>
        </div>
      </Base>
    );
  }

  // @ts-ignore - This file is a copy of the Location file and needs to be finished
  static renderNoPlants(location, userCanEdit) {
    return (
      <Base>
        <div>
          {Metrics.renderTitle(location)}
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

  render() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const {
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      allLoadedPlants,
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      authUser,
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      filter = '',
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      interim,
      // @ts-ignore - This file is a copy of the Location file and needs to be finished
      locations,
    } = this.state || {};

    // @ts-ignore - This file is a copy of the Location file and needs to be finished
    const { match } = this.props;
    const location = locations && locations[match.params.id];

    if (!location) {
      return (
        <Base>
          <div>
            <CircularProgress />
          </div>
        </Base>
      );
    }

    const userCanEdit = canEdit(authUser._id, location);

    const { plantIds = [] } = location;
    if (!plantIds.length) {
      if (interim.loadPlantRequest) {
        return Metrics.renderWaiting(location);
      }
      return Metrics.renderNoPlants(location, userCanEdit);
    }

    const sortedPlantIds = utils.filterSortPlants(plantIds, allLoadedPlants, filter);
    const plantStats = utils.plantStats(plantIds, allLoadedPlants);

    // Don't send the name into PlantItem to skip the subtitle
    // If all the plants are at the same location then don't need the
    // location name. If the plants are from a search result then send
    // in the name:
    // title={location.title}
    const tileElements = sortedPlantIds.reduce((acc, plantId) => {
      const plant = allLoadedPlants[plantId];
      if (plant) {
        const { _id } = plant;
        // @ts-ignore - This file is a copy of the Location file and needs to be finished
        acc.found.push(<PlantItem
          key={_id}
          dispatch={store.dispatch}
  // @ts-ignore - This file is a copy of the Location file and needs to be finished
          createNote={this.createNote}
          userCanEdit={userCanEdit}
          plant={plant}
        />);
      } else {
        // @ts-ignore - This file is a copy of the Location file and needs to be finished
        acc.unloaded.push(plantId);
      }
      return acc;
    }, { found: [], unloaded: [] });

    if (tileElements.unloaded.length) {
      store.dispatch(actionFunc.loadUnloadedPlantsRequest(tileElements.unloaded));
    }

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

    // TODO: metricDate must come from a collection of toggle/checkbox inputs that
    // the user selects to determine what the most recent date is for that metric
    const metricDates: MetricDate[] = ['height', 'girth'];

    return (
      <Base>
        <div>
          {Metrics.renderTitle(location)}
          {stats}
          <LastMeasured
            plantIds={plantIds}
            plants={allLoadedPlants}
            metricDates={metricDates}
            dispatch={store.dispatch}
          />
          <div className="clear">
&nbsp;
          </div>
        </div>
      </Base>
    );
  }
}

// @ts-ignore
export default withRouter(Metrics);
