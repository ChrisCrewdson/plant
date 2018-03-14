const _ = require('lodash');
const indexHtml = require('.');
const React = require('react');
const { createStore } = require('redux');
const { Provider } = require('react-redux');
const appReducers = require('../../app/reducers');
const App = require('../../app/components/App');
const Plant = require('../../app/components/plant/Plant');
const { renderToString } = require('react-dom/server');
const singlePlant = require('../db/single-plant');
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const { StaticRouter } = require('react-router-dom');
const Logger = require('../logging/logger');

const logger = new Logger('ssr-plant');

const target = async (req, res) => {
  try {
    const {
      user = {},
      params = {},
      query = {},
    } = req;
    const { id: plantId = '' } = params;
    const { noteid: noteId = '' } = query;
    const searchParams = new Map([['noteid', noteId]]);

    if (!plantId) {
      return res.send(indexHtml());
    }

    const muiTheme = getMuiTheme({
      palette: {
        accent1Color: deepOrange500,
      },
      userAgent: req.headers['user-agent'],
    });

    const initialState = await singlePlant(user, plantId, noteId) || {};
    if (Array.isArray(initialState.locations)) {
      initialState.locations = _.keyBy(initialState.locations, '_id');
    }
    if (Array.isArray(initialState.users)) {
      initialState.users = _.keyBy(initialState.users, '_id');
    }
    // Create a new Redux store instance
    const store = createStore(appReducers, initialState);
    // The Router component needs a history prop. It doesn't need to do anything
    // for server side rendering but will blow up the renderToString() method
    // if it's not there so far the history object.
    // const history = {
    //   push: () => {},
    //   location: {
    //     pathname: '',
    //   },
    //   listen: () => () => {},
    //   createHref: () => '',
    //   replace: () => {},
    // };
    const context = {};

    // Render the component to a string
    /* eslint-disable react/jsx-filename-extension, function-paren-newline */
    const html = renderToString(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <StaticRouter
              context={context}
              location={req.url}
            >
              <Plant params={params} searchParams={searchParams} />
            </StaticRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
      /* eslint-enable react/jsx-filename-extension, function-paren-newline */

    // If context.url is truthy then there was a redirect in the StaticRouter above
    // If this happened then we need to redirect here.
    // More info at:
    // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/server-rendering.md#server-rendering
    if (context.url) {
      logger.error('Unexpected redirect in SSR of Plant', context);
      return res.redirect(301, context.url);
    }

    const plant = (initialState.plants && initialState.plants[plantId]) || {};

    const title = plant.title || 'Plaaant';
    const og = [];
    if (noteId) {
      const note = initialState.notes && initialState.notes[noteId];
      if (note) {
        og.push({ property: 'title', content: title });
        if (note.images && note.images.length) {
          const { id, ext } = note.images[0];
          og.push({ property: 'image', content: `https://i.plaaant.com/up/orig/${id}.${ext}` });
        }
        og.push({ property: 'url', content: `https://plaaant.com${req.originalUrl}` });
        og.push({ property: 'type', content: 'website' });
        if (note.note) {
          const description = note.note.slice(0, 300);
          og.push({ property: 'description', content: description });
        }
      }
    }
    const data = {
      html,
      initialState,
      og,
      title,
    };
    return res.send(indexHtml(data, true));
  } catch (error) {
    logger.error('Unexpected error in SSR of Plant', { error });
    return res.status(404).send(indexHtml());
  }
};

// const current = (req, res) => {
//   res.send(indexHtml());
// };

module.exports = target;

/*
Load:

Users
Locations
Plant
Notes

Final state:

interim: {}
locations: { id1: {}, id2: {}, ...}
notes: { id1: {}, id2: {}, ...}
plants: { id1: {}}
user: {} - if logged in
users: { id1: {}, id2: {}, ...}

*/
