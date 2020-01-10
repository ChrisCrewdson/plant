import { Link } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import Base from './Base';
import { isLoggedIn } from '../../libs/auth-helper';
import { PlantContext } from '../../../lib/types/react-common';

export default class Home extends React.Component {
  // TODO: When tsc 3.7+ is in use remove the ! to see hint text on how to change this.
  context!: PlantContext;

  unsubscribe!: Function;

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: object) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount(): void {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.updateState();
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange(): void {
    this.updateState();
  }

  updateState(): void {
    const { store } = this.context;
    const { users, locations } = store.getState();
    this.setState({ users, locations });
  }

  anonHome(existingUsers: boolean, existingLocations: boolean): JSX.Element {
    const { store } = this.context;
    return (
      <div id="hero">
        <section>
          <p>
            Improve the health of your trees and plants...
          </p>
        </section>
        <section>
          <p>
            ...measure, compare, and share your awesomeness...
          </p>
        </section>
        {existingUsers
          && (
          <section>
            <Link
              to="/users"
            >
              ...explore Farmers and Gardeners...
            </Link>
          </section>
          )}
        {existingLocations
          && (
          <section>
            <Link
              to="/locations"
            >
              ...explore Orchards, Gardens, Yards and Farms...
            </Link>
          </section>
          )}
        {!isLoggedIn(store)
          && (
          <section>
            <div>
              <Link to="/login">
Login to get started
              </Link>
            </div>
          </section>
          )}
      </div>
    );
  }

  renderUsers(): JSX.Element {
    const { store } = this.context;
    const { users = {}, locations = {} } = store.getState();
    const usersCount = Object.keys(users).length;
    const locationsCount = Object.keys(locations).length;
    return this.anonHome(!!usersCount, !!locationsCount);
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
