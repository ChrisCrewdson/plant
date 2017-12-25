// Used to show a list of users.
// Url: /users

const Base = require('../base/Base');
const React = require('react');
const { Link } = require('react-router-dom');
const utils = require('../../libs/utils');
const PropTypes = require('prop-types');

const { makeSlug } = utils;

class Users extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.onChange();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const state = this.context.store.getState();
    const { users, locations } = state;
    this.setState({ users, locations });
  }

  renderUser(user) {
    const { _id, name: userName, locationIds } = user;
    let link = `/locations/${makeSlug(userName)}/${_id}`;

    if (locationIds.length === 1) {
      const state = this.context.store.getState();
      const { locations } = state;
      if (locations) {
        const [singleLocationId] = locationIds;
        const singleLocation = locations[singleLocationId];
        if (singleLocation) {
          link = `/location/${makeSlug(singleLocation.title)}/${singleLocationId}`;
        }
      }
    }

    return (
      <div key={_id} style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          style={{ margin: '20px' }}
          to={link}
        >
          <span>{userName}</span>
        </Link>
      </div>
    );
  }

  renderUsers() {
    const { users } = this.context.store.getState();
    if (users && users.length) {
      return users.map(user => this.renderUser(user));
    }
    return null;
  }

  render() {
    return (
      <Base>
        <div>
          {this.renderUsers()}
        </div>
      </Base>
    );
  }
}

module.exports = Users;
