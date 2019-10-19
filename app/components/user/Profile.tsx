// Used for managing the user's settings.
// Only the logged in user can get to their profile page.

import PropTypes from 'prop-types';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import React from 'react';
import getIn from 'lodash/get';
import LocationsManager from '../location/LocationsManager';
import Base from '../base/Base';

// Responsible for:
// 1. Current user: /profile
// 2. Other user: /profile/slug/<id>
// Only implementing #1 for now.

export default function profile(props: ProfileProps, context: any) {
  const radioGroup: React.CSSProperties = {
    display: 'flex',
  };

  const radioButton: React.CSSProperties = {
    marginBottom: 16,
    width: 'inherit',
  };

  const { userSettings } = props;
  const { imperial } = userSettings;
  const { store } = context as {store: PlantStore};
  const { dispatch } = store;
  const state = store.getState();
  const users = getIn(state, 'users', {});
  const locations = getIn(state, 'locations', {});
  const userId = (state.user && state.user._id) || '';
  const locationIds = (state.users && state.users[userId] && state.users[userId].locationIds) || [];

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
          style={radioGroup}
        >
          <RadioButton
            label="Imperial"
            style={radioButton}
            value="imperial"
          />
          <RadioButton
            label="Metric"
            style={radioButton}
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