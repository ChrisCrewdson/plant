const React = require('react');
const actions = require('../actions');
const PropTypes = require('prop-types');

class App extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    const { store } = this.context;
    const { users = {}, locations = {} } = store.getState();

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
