import React from 'react';
import PropTypes from 'prop-types';
import { actionFunc } from '../actions';

class App extends React.Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line react/static-property-placement
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { users = {}, locations = {} } = store.getState();

    // TODO: This will cause a problem for a non-initialized site
    // that has zero users and zero locations as these values
    // will be 0 which is falsy.
    const usersCount = Object.keys(users).length;
    const locationsCount = Object.keys(locations).length;

    if (!usersCount) {
      store.dispatch(actionFunc.loadUsersRequest());
    }

    if (!locationsCount) {
      store.dispatch(actionFunc.loadLocationsRequest());
    }
  }

  render() {
    const { children } = this.props;
    return (
      <div className="react-root">
        {children}
      </div>
    );
  }
}

module.exports = App;

export default App;
