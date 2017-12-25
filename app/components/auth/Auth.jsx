const Base = require('../base/Base');
const React = require('react');
const actions = require('../../actions');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

class Auth extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    const { search } = this.props.location;
    const params = new URLSearchParams(search);

    const code = params.get('jwt');

    store.dispatch(actions.loginRequest(code));
  }

  componentDidUpdate() {
    const { store } = this.context;
    const user = store.getState().user || {};
    const { jwt } = user;
    if (jwt) {
      const returnurl = localStorage.getItem('returnurl');
      if (returnurl) {
        localStorage.removeItem('returnurl');
      }
      // TODO: Make this next line work instead of the following
      // const destination = returnurl || utils.makeLocationUrl(location);
      const destination = returnurl || '/';
      const { history } = this.props;
      history.push(destination);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const { store } = this.context;
    this.setState(store.getState().user || {});
  }


  render() {
    return (
      <Base>
        <h2>Authenticating...</h2>
      </Base>
    );
  }
}

Auth.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

module.exports = withRouter(Auth);
