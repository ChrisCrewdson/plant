import { ssrRenderPlant } from './plant-render';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const _ = require('lodash');
const { createStore } = require('redux');
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const singlePlant = require('../db/single-plant');
const appReducers = require('../../app/reducers');
const indexHtml = require('.');

const moduleName = 'lib/render/plant';

const target = async (req: import('express').Request, res: import('express').Response): Promise<void> => {
  const { logger } = req;
  try {
    const {
      /** @type {BizUser|undefined} */
      user,
      params = {},
      query = {},
    } = req;

    const { id: plantId = '' } = params;
    const { noteid: noteId = '' } = query;
    const searchParams = new Map([['noteid', noteId]]);

    if (!plantId) {
      res.send(indexHtml({ req }));
      return;
    }

    const muiTheme = getMuiTheme({
      palette: {
        accent1Color: deepOrange500,
      },
      userAgent: req.headers['user-agent'],
    });

    const initialState = await singlePlant(user, plantId, noteId, logger) || {};

    if (user && user.locationIds && user.locationIds.length && !user.activeLocationId) {
      // TODO: This is a hack but probably okay for now. We should store the user's
      // activeLocationId on the server. At the time of writing this it was in
      // localStorage on the client.
      const [dbLocation] = user.locationIds;
      user.activeLocationId = dbLocation;
    }

    if (user) {
      user.isLoggedIn = !!user._id;
      // TODO: Under what circumstance would this not be 'success' with a server render?
      user.status = 'success';
    }
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

    const context: import('react-router').StaticRouterContext = {};

    // Render the component to a string
    const html = ssrRenderPlant({
      muiTheme,
      store,
      context,
      url: req.url,
      params,
      searchParams,
    });

    // If context.url is truthy then there was a redirect in the StaticRouter above
    // If this happened then we need to redirect here.
    // More info at:
    // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/server-rendering.md#server-rendering
    if (context.url) {
      logger.error({ moduleName, msg: 'Unexpected redirect in SSR of Plant', context });
      res.redirect(301, context.url);
      return;
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
      req,
      og,
      title,
    };
    res.send(indexHtml(data, true));
  } catch (error) {
    logger.error({ moduleName, msg: 'Unexpected error in SSR of Plant', err: error });
    res.status(404).send(indexHtml({ req }));
  }
};

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
