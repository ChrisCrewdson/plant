// Used to show a list of users.
// Url: /users

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import utils from '../../libs/utils';
import Base from '../base/Base';
import { PlantContext } from '../../../lib/types/react-common';

const { makeSlug } = utils;

export default class Users extends React.Component {
  // TODO: When tsc 3.7+ is in use remove the ! to see hint text on how to change this.
  context!: PlantContext;

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: {}) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount(): void {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.onChange();
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange(): void {
    const { store } = this.context;
    const state = store.getState();
    const { users, locations } = state;
    this.setState({ users, locations });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  unsubscribe(): void {}

  /**
   * Render the users
   * @param user - user is from the users collection and not the loggedIn user
   */
  renderUser(user: UiUsersValue): JSX.Element {
    const { _id, name: userName, locationIds } = user;
    let link = `/locations/${makeSlug(userName)}/${_id}`;

    if (locationIds.length === 1) {
      const { store } = this.context;
      const state = store.getState();
      const { locations } = state;
      if (locations) {
        const [firstLocationId] = locationIds;
        const singleLocation = locations[firstLocationId];
        if (singleLocation) {
          link = `/location/${makeSlug(singleLocation.title)}/${firstLocationId}`;
        }
      }
    }

    return (
      <div key={_id} style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          style={{ margin: '20px' }}
          to={link}
        >
          <span>
            {userName}
          </span>
        </Link>
      </div>
    );
  }

  renderUsers(): JSX.Element[] | null {
    const { store } = this.context;
    const { users } = store.getState();
    const userIds = Object.keys(users);
    if (userIds.length) {
      return userIds.map((userId) => this.renderUser(users[userId]));
    }
    return null;
  }

  render(): JSX.Element {
    return (
      <Base>
        <div>
          {this.renderUsers()}
        </div>
      </Base>
    );
  }
}
