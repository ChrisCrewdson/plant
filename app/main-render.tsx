
import {
  BrowserRouter, Route, Redirect, Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import cyan from '@material-ui/core/colors/cyan';
import deepOrange from '@material-ui/core/colors/deepOrange';
import App from './components/App';
import Help from './components/base/Help';
import Home from './components/base/Home';
import Login from './components/auth/Login';
import Plant from './components/plant/Plant';
import Article from './components/article/Article';
import Plants from './components/plant/Plants';
import Privacy from './components/info/Privacy';
import Profile from './components/user/Profile';
import LayoutMap from './components/layout/LayoutMap';
import store from './store';
import Terms from './components/info/Terms';
import Location from './components/location/Location';
import Metrics from './components/location/metrics/Metrics';
import Locations from './components/location/Locations';
import Users from './components/user/Users';


const theme = createMuiTheme({
  palette: {
    primary: cyan,
    secondary: deepOrange,
  },

  // status: {
  //   danger: 'orange',
  // },
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
      <MuiThemeProvider theme={theme}>
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
