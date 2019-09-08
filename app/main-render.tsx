export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const {
  BrowserRouter, Route, Redirect, Switch,
} = require('react-router-dom');
const { deepOrange500 } = require('material-ui/styles/colors');
const { Provider } = require('react-redux');
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const React = require('react');
const ReactDOM = require('react-dom');
const App = require('./components/App');
const Help = require('./components/base/Help');
const Home = require('./components/base/Home');
const Login = require('./components/auth/Login');
const Plant = require('./components/plant/Plant');
const Article = require('./components/article/Article');
const Plants = require('./components/plant/Plants');
const Privacy = require('./components/info/Privacy');
const Profile = require('./components/user/Profile');
const LayoutMap = require('./components/layout/LayoutMap');
const store = require('./store');
const Terms = require('./components/info/Terms');
const Location = require('./components/location/Location');
const Metrics = require('./components/location/metrics/Metrics');
const Locations = require('./components/location/Locations');
const Users = require('./components/user/Users');

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

// /location/**location-name**/_location_id - a list of plants at that location
//                       (analogous to the old /plants/**user-name**/_user_id)
// /locations - a list of all locations
// /locations/**user-name**/_user_id - a list of locations managed or owned by user

// TODO: Put a Not Found / No Match component in here.
const routes = (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/article/:slug/:id" component={Article} />
      <Route path="/help" component={Help} />
      <Route path="/layout/:slug/:id" component={LayoutMap} />
      <Route path="/location/:slug/:id" component={Location} />
      <Route path="/locations" exact component={Locations} />
      <Route path="/locations/:slug/:id" component={Locations} />
      <Route path="/login" component={Login} />
      <Route path="/metrics/:slug/:id" component={Metrics} />
      <Route path="/plant" exact component={Plant} />
      <Route path="/plant/:slug/:id" component={Plant} />
      <Route path="/plants/:slug/:id" component={Plants} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/profile" component={Profile} />
      <Route path="/terms" component={Terms} />
      <Route path="/users" component={Users} />
      <Redirect to="/help" />
    </Switch>
  </BrowserRouter>
);

const renderMain = function render() {
  const content = document.getElementById('wrapper');

  // @ts-ignore - __SSR__ is something we add on the server
  const { __SSR__: serverRendered } = window;
  const renderer = serverRendered
    ? ReactDOM.hydrate
    : ReactDOM.render;
  // @ts-ignore - __SSR__ is something we add on the server
  window.__SSR__ = false;

  renderer(
    (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            {routes}
          </App>
        </Provider>
      </MuiThemeProvider>
    ), content,
  );
};

export {
  renderMain,
};
