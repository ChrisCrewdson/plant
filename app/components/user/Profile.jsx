// Used for managing the user's settings.
// Only the logged in user can get to their profile page.

const PropTypes = require('prop-types');
const { RadioButton } = require('material-ui/RadioButton');
const { RadioButtonGroup } = require('material-ui/RadioButton');
const React = require('react');
const getIn = require('lodash/get');
const LocationsManager = require('../location/LocationsManager');
const Base = require('../base/Base');

// Responsible for:
// 1. Current user: /profile
// 2. Other user: /profile/slug/<id>
// Only implementing #1 for now.

function profile(props, context) {
  const styles = {
    radioGroup: {
      display: 'flex',
    },
    radioButton: {
      marginBottom: 16,
      width: 'inherit',
    },
  };

  const { userSettings } = props;
  const { imperial } = userSettings;
  const { store } = context;
  const { dispatch } = store;
  const state = store.getState();
  const users = getIn(state, 'users', {});
  const locations = getIn(state, 'locations', {});
  const userId = getIn(state, ['user', '_id'], '');
  const locationIds = getIn(users, [userId, 'locationIds'], []);

  const unitOfMeasurement = imperial ? 'imperial' : 'metric';

  return (
    <Base>
      <div>
        <h2 style={{ textAlign: 'center' }}>
          User Profile
        </h2>
        <h3>
Unit of Measurement
        </h3>
        <RadioButtonGroup
          defaultSelected={unitOfMeasurement}
          name="unitOfMeasurement"
          style={styles.radioGroup}
        >
          <RadioButton
            label="Imperial"
            style={styles.radioButton}
            value="imperial"
          />
          <RadioButton
            label="Metric"
            style={styles.radioButton}
            value="metric"
          />
        </RadioButtonGroup>
        <LocationsManager
          locations={locations}
          locationIds={locationIds}
          users={users}
          dispatch={dispatch}
        />
      </div>
    </Base>
  );
}

profile.propTypes = {
  userSettings: PropTypes.shape({
    imperial: PropTypes.bool,
  }),
};

profile.defaultProps = {
  userSettings: {
    imperial: true,
  },
};

profile.contextTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object.isRequired,
};

module.exports = profile;
