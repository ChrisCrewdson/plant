// For the user to manage their Locations (Orchards/Yards)

const actions = require('../../actions');
const Grid = require('../common/Grid');
const seamless = require('seamless-immutable').static;
const Paper = require('material-ui/Paper').default;
const PropTypes = require('prop-types');
const React = require('react');

const userColumns = seamless.from([{
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
}]);

const weatherColumns = seamless.from([{
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
}]);

const getMembers = members => Object.keys(members || {}).map((_id) => {
  const role = members[_id];
  return {
    _id,
    values: [_id, role],
  };
});

const getStations = stations => Object.keys(stations || {}).map((_id) => {
  const { name, enabled } = stations[_id];
  return {
    _id,
    values: [_id, name, enabled],
  };
});

class LocationsManager extends React.Component {
  /**
   * Called with a save on an edit/new is done. Validation is failed by returning an
   * array that has at least 1 truthy value in it.
   * @param {Object} data.row - The row that is being validated
   * @param {string} data.row._id - The _id of the row which is the user's _id
   * @param {any[]} data.row.values - The values being changed/inserted
   * @param {Object} data.meta - Meta data sent to Grid for passing back container methods
   * @param {Object} data.meta.location - The location object that this applies to
   * @param {Object} data.meta.location.member - The members at this location - the key is the
   *                                             userId (a UUID) and the value is the role
   * @param {boolean} data.isNew - True if this is a new row
   * @returns {string[]} - An array of errors, empty strings or a mixture of the two
   */
  static validateLocationMember({ row, meta, isNew }) {
    const { values, _id } = row;

    // Check that each of the Select components has a value selected
    const errors = values.map(value => (value === '<select>' ? 'You must select a value' : ''));

    // For an insert, check that the user is not already listed at the location
    if (isNew) {
      const { location } = meta;
      if (location.members[_id]) {
        errors[0] = 'This user already belongs to this location';
      }
    }

    return errors;
  }

  static validateLocationWeather({ row, meta, isNew }) {
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
      if (Object.keys(stations).some(id => stations[id].name === name)) {
        errors[1] = 'This Name already used';
      }
    }

    return errors;
  }

  constructor(props) {
    super(props);
    this.upsertLocationMember = this.upsertLocationMember.bind(this);
    this.deleteLocationMember = this.deleteLocationMember.bind(this);

    this.upsertLocationWeather = this.upsertLocationWeather.bind(this);
    this.deleteLocationWeather = this.deleteLocationWeather.bind(this);

    userColumns[0].options = props.users.reduce((acc, { _id, name }) =>
      Object.assign({ [_id]: name }, acc), {});
    userColumns[0].options['<select>'] = '<select>';
  }

  /**
   * To insert/update a user for a location we need 3 things on the client side:
   * locationId, userId, role
   * On the server we also need the logged-in user to verify that they are an
   * owner of that location and therefore authorized.
   * @param {Object} data - the data needed for the insert
   * @param {Object} data.row - the _id and values array from the row in the grid
   * @param {any[]} data.row.values - the values from the row
   * @param {Object} data.meta - An object we passed to the Grid component to pass back to us
   *                             when an insert/update/delete is done.
   * @param {Object} data.meta.location - The location that this insert is for
   * @param {string} data.meta.location._id - The id of the location that this insert is for
   * @param {string} data.action - Distinguish between insert and update
   */
  upsertLocationMember({ row, meta }) {
    const { _id: locationId } = meta.location;
    const [userId, role] = row.values;
    const action = actions.UPSERT_LOCATION_MEMBER;

    const payload = {
      locationId, userId, role, action,
    };
    this.props.dispatch(actions.modifyLocationRequest(payload));
  }

  upsertLocationWeather({ row, meta }) {
    const { _id: locationId } = meta.location;
    const [stationId, name, enabled] = row.values;
    const action = actions.UPSERT_LOCATION_WEATHER;

    const payload = {
      locationId, stationId, name, enabled, action,
    };
    this.props.dispatch(actions.modifyLocationRequest(payload));
  }

  deleteLocationMember({ row, meta }) {
    const { _id: locationId } = meta.location;
    const [userId] = row.values;
    const action = actions.DELETE_LOCATION_MEMBER;

    const payload = { locationId, userId, action };
    this.props.dispatch(actions.modifyLocationRequest(payload));
  }

  deleteLocationWeather({ row, meta }) {
    const { _id: locationId } = meta.location;
    const [stationId] = row.values;
    const action = actions.DELETE_LOCATION_WEATHER;

    const payload = { locationId, stationId, action };
    this.props.dispatch(actions.modifyLocationRequest(payload));
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    const { locations } = this.props;

    return (
      <div>
        {
          locations.map(location => (
            <Paper
              key={location._id}
              style={paperStyle}
              zDepth={5}
            >
              <h3>{`${location.title}`}</h3>
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
          ))
        }
      </div>
    );
  }
}

LocationsManager.propTypes = {
  dispatch: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

module.exports = LocationsManager;
