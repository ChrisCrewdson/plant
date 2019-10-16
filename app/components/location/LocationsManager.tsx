// For the user to manage their Locations (Orchards/Yards)

import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import Grid from '../common/Grid';
import { actionFunc, actionEnum } from '../../actions';

const userColumns: GridColumn[] = [{
  title: 'Name',
  type: 'select',
  width: 50,
}, {
  options: {
    '<select>': '<select>',
    owner: 'Owner',
    manager: 'Manager',
    member: 'Member',
  },
  title: 'Role',
  type: 'select',
  width: 50,
}];

const weatherColumns: GridColumn[] = [{
  title: 'Station ID',
  type: 'text',
  width: 33,
}, {
  title: 'Name',
  type: 'text',
  width: 33,
}, {
  title: 'Enabled',
  type: 'boolean',
  width: 33,
}];

const getMembers = (members: Record<string, Role>) => Object.keys(members || {}).map((_id) => {
  const role = members[_id];
  return {
    _id,
    values: [_id, role],
  };
});

const getStations = (stations: Record<string, UiLocationsStation>) => Object.keys(stations || {})
  .map((_id) => {
    const { name, enabled } = stations[_id];
    return {
      _id,
      values: [_id, name, enabled],
    };
  });

interface LocationsManagerProps {
  dispatch: import('redux').Dispatch;
  locationIds: string[];
  locations: UiLocations;
  users: UiUsers;
}

export default class LocationsManager extends React.Component {
  /**
   * Called with a save on an edit/new is done. Validation is failed by returning an
   * array that has at least 1 truthy value in it.
   * @returns - An array of errors, empty strings or a mixture of the two
   */
  static validateLocationMember({ row, meta, isNew }: LocationsManagerRowUpdate): string[] {
    const { values, _id } = row;

    // Check that each of the Select components has a value selected
    const errors: string[] = values.map((value) => (value === '<select>' ? 'You must select a value' : ''));

    // For an insert, check that the user is not already listed at the location
    if (isNew) {
      const { location } = meta;
      if (location.members[_id]) {
        errors[0] = 'This user already belongs to this location';
      }
    }

    return errors;
  }

  static validateLocationWeather({ row, meta, isNew }: LocationsManagerRowUpdate) {
    const { values } = row;
    const [stationId, name] = values;
    const errors = [];
    errors[0] = (stationId || '').length < 1
      ? 'Station ID must be at least 1 character'
      : '';
    errors[1] = (name || '').length < 1
      ? 'Station Name must be at least 1 character'
      : '';
    errors[2] = '';

    // For an insert, check that the stationId is not already listed at the location
    if (isNew) {
      const { location } = meta;
      const { stations = {} } = location;
      if (stations[stationId]) {
        errors[0] = 'This Station ID already belongs to this location';
      }
      if (Object.keys(stations).some((id) => stations[id].name === name)) {
        errors[1] = 'This Name already used';
      }
    }

    return errors;
  }

  props!: LocationsManagerProps;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    locationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    locations: PropTypes.shape({}).isRequired,
    users: PropTypes.shape({}).isRequired,
  };

  constructor(props: LocationsManagerProps) {
    super(props);
    this.upsertLocationMember = this.upsertLocationMember.bind(this);
    this.deleteLocationMember = this.deleteLocationMember.bind(this);

    this.upsertLocationWeather = this.upsertLocationWeather.bind(this);
    this.deleteLocationWeather = this.deleteLocationWeather.bind(this);

    userColumns[0].options = Object.keys(props.users).reduce(
      (acc: Record<string, string>, userId) => {
        const { _id, name } = props.users[userId];
        acc[_id] = name;
        return acc;
      }, {});
    userColumns[0].options['<select>'] = '<select>';
  }

  /**
   * To insert/update a user for a location we need 3 things on the client side:
   * locationId, userId, role
   * On the server we also need the logged-in user to verify that they are an
   * owner of that location and therefore authorized.
   */
  upsertLocationMember({ row, meta }: LocationsManagerRowUpdate) {
    const { dispatch } = this.props;
    const { _id: locationId } = meta.location;
    const [userId, role] = row.values;
    const action = actionEnum.UPSERT_LOCATION_MEMBER;

    const payload = {
      locationId, userId, role, action,
    };
    dispatch(actionFunc.modifyLocationRequest(payload));
  }

  upsertLocationWeather({ row, meta }: LocationsManagerRowUpdate) {
    const { dispatch } = this.props;
    const { _id: locationId } = meta.location;
    const [stationId, name, enabled] = row.values;
    const action = actionEnum.UPSERT_LOCATION_WEATHER;

    const payload = {
      locationId, stationId, name, enabled, action,
    };
    dispatch(actionFunc.modifyLocationRequest(payload));
  }

  deleteLocationMember({ row, meta }: LocationsManagerRowUpdate) {
    const { dispatch } = this.props;
    const { _id: locationId } = meta.location;
    const [userId] = row.values;
    const action = actionEnum.DELETE_LOCATION_MEMBER;

    const payload = { locationId, userId, action };
    dispatch(actionFunc.modifyLocationRequest(payload));
  }

  deleteLocationWeather({ row, meta }: LocationsManagerRowUpdate) {
    const { dispatch } = this.props;
    const { _id: locationId } = meta.location;
    const [stationId] = row.values;
    const action = actionEnum.DELETE_LOCATION_WEATHER;

    const payload = { locationId, stationId, action };
    dispatch(actionFunc.modifyLocationRequest(payload));
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    const { locationIds, locations } = this.props;

    return (
      <div>
        {
          locationIds.map((locationId) => {
            const location = locations[locationId];
            return (
              <Paper
                key={location._id}
                style={paperStyle}
                zDepth={5}
              >
                <h3>
                  {`${location.title}`}
                </h3>
                <Grid
                  columns={userColumns}
                  delete={this.deleteLocationMember}
                  insert={this.upsertLocationMember}
                  meta={{ location }}
                  rows={getMembers(location.members)}
                  title="Users"
                  update={this.upsertLocationMember}
                  validate={LocationsManager.validateLocationMember}
                />
                <Grid
                  columns={weatherColumns}
                  delete={this.deleteLocationWeather}
                  insert={this.upsertLocationWeather}
                  meta={{ location }}
                  rows={getStations(location.stations)}
                  title="Weather Stations"
                  update={this.upsertLocationWeather}
                  validate={LocationsManager.validateLocationWeather}
                />
              </Paper>
            );
          })
        }
      </div>
    );
  }
}
