// Used to show a list of plants for a user.
// Url: /plants/<slug>/<optional-user-id>
// Now it redirects to a Location owned by the user
// Redirect: /location/slug/_location_id

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const getIn = require('lodash/get');
const utils = require('../../libs/utils');

class Plants extends React.Component {
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    router: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  /**
   * @param {PlantsProps} props
   * @memberof Plants
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.redirectIfReady = this.redirectIfReady.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { users, locations } = store.getState();
    this.setState({ users, locations });
  }

  redirectIfReady() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { match, history } = /** @type {PlantsProps} */ (this.props);
    const { params } = match;
    const userId = params && params.id;
    let fwdUrl = '/';
    if (userId) {
      const state = store.getState();
      const user = getIn(state, ['users', userId], {});
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

Plants.propTypes = {
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

// @ts-ignore - TODO: Solve withRouter() param and tsc
module.exports = withRouter(Plants);
