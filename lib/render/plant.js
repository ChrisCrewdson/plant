const indexHtml = require('.');
const React = require('react');
const { createStore } = require('redux');
const { Provider } = require('react-redux');
const appReducers = require('../../app/reducers');
// const App = require('../../app/components/App');
const Plant = require('../../app/components/plant/Plant');
const { renderToString } = require('react-dom/server');
const singlePlant = require('../db/single-plant');
const Immutable = require('immutable');
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const { Router } = require('react-router-dom');

const target = async (req, res) => {
  try {
    const {
      user = {},
      params = {},
      query = {},
    } = req;
    const { id: plantId = '' } = params;
    const { noteid: noteId = '' } = query;

    if (!plantId) {
      return res.send(indexHtml());
    }

    const muiTheme = getMuiTheme({
      palette: {
        accent1Color: deepOrange500,
      },
      userAgent: req.headers['user-agent'],
    });

    const initialState = await singlePlant(user, plantId) || {};
    // Create a new Redux store instance
    const store = createStore(appReducers, Immutable.fromJS(initialState));
    // The Router component needs a history prop. It doesn't need to do anything
    // for server side rendering but will blow up the renderToString() method
    // if it's not there so far the history object.
    const history = {
      push: () => {},
      location: {
        pathname: '',
      },
      listen: () => () => {},
      createHref: () => '',
      replace: () => {},
    };
      // Render the component to a string
      /* eslint-disable react/jsx-filename-extension */
    const html = renderToString(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <Router history={history}>
            <Plant params={params} />
          </Router>
        </Provider>
      </MuiThemeProvider>,
    );
      /* eslint-enable react/jsx-filename-extension */

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
    return res.send(indexHtml(data));
  } catch (err) {
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

intrim: {}
locations: { id1: {}, id2: {}, ...}
notes: { id1: {}, id2: {}, ...}
plants: { id1: {}}
user: {} - if logged in
users: { id1: {}, id2: {}, ...}

*/
