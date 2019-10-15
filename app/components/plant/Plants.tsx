// Used to show a list of plants for a user.
// Url: /plants/<slug>/<optional-user-id>
// Now it redirects to a Location owned by the user
// Redirect: /location/slug/_location_id

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import getIn from 'lodash/get';
import utils from '../../libs/utils';

class Plants extends React.Component {
  unsubscribe: any;

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    router: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: PlantsProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.redirectIfReady = this.redirectIfReady.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context as {store: PlantStore};
    this.unsubscribe = store.subscribe(this.onChange);
    this.onChange();
    this.redirectIfReady();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate() {
    this.redirectIfReady();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange() {
    const { store } = this.context as {store: PlantStore};
    const { users, locations } = store.getState();
    this.setState({ users, locations });
  }

  redirectIfReady() {
    const { store } = this.context as {store: PlantStore};
    const { match, history } = this.props as PlantsProps;
    const { params } = match;
    const userId = params && params.id;
    let fwdUrl = '/';
    if (userId) {
      const state = store.getState();
      const user = getIn(state, ['users', userId], {}) as UiUsersValue;
      const locationIds = user.locationIds || [];
      if (locationIds.length) {
        const locationId = locationIds[0];
        const location = getIn(state, ['locations', locationId]);
        if (location) {
          const title = location.title || '';
          fwdUrl = `/location/${utils.makeSlug(title)}/${locationId}`;
          history.push(fwdUrl);
        }
      }
    } else {
      // console.warn('No params.id', this.props);
    }
  }

  render() {
    return (
      <div>
        {'Working on redirecting you to the right place...'}
      </div>
    );
  }
}

// @ts-ignore - TODO: Solve withRouter() param and tsc
export default withRouter(Plants);
