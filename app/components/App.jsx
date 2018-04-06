const React = require('react');
const actions = require('../actions');
const PropTypes = require('prop-types');

class App extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { store } = this.context;
    const { users = {}, locations = {} } = store.getState();

    // TODO: This will cause a problem for a non-initialized site
    // that has zero users and zero locations as these values
    // will be 0 which is falsy.
    const usersCount = Object.keys(users).length;
    const locationsCount = Object.keys(locations).length;

    if (!usersCount) {
      store.dispatch(actions.loadUsersRequest());
    }

    if (!locationsCount) {
      store.dispatch(actions.loadLocationsRequest());
    }
  }

  render() {
    return (
      <div className="react-root">
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.object.isRequired,
};

module.exports = App;
