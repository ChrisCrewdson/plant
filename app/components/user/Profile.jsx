// Used for managing the user's settings.
// Only the logged in user can get to their profile page.

const Base = require('../base/Base');
const Immutable = require('immutable');
const LocationsManager = require('../location/LocationsManager');
const PropTypes = require('prop-types');
const RadioButton = require('material-ui/RadioButton').RadioButton;
const RadioButtonGroup = require('material-ui/RadioButton').RadioButtonGroup;
const React = require('react');

// Responsible for:
// 1. Current user: /profile
// 2. Other user: /profile/slug/<id>
// Only implmenting #1 for now.

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
  const { getState, dispatch } = store;
  const users = getState().get('users', Immutable.Map());
  const locations = getState().getIn(['user', 'locationIds']);

  const unitOfMeasurement = imperial ? 'imperial' : 'metric';

  return (
    <Base>
      <div>
        <h2 style={{ textAlign: 'center' }}>
          User Profile
        </h2>
        <h3>{'Unit of Measurement'}</h3>
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
  store: PropTypes.object.isRequired,
};

module.exports = profile;
