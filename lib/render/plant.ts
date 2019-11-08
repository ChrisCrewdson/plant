import _ from 'lodash';
import { createStore } from 'redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange500 } from 'material-ui/styles/colors';
import { Request, Response } from 'express';

import { StaticRouterContext } from 'react-router';
import { ssrRenderPlant } from './plant-render';
import appReducers from '../../app/reducers';
import { singlePlant } from '../db/single-plant';

import { indexHtml } from '.';

const moduleName = 'lib/render/plant';

export const renderPlant = async (req: Request, res: Response): Promise<void> => {
  const { logger } = req;
  try {
    const {
      user,
      params = {},
      query = {},
    } = req;

    const { id: plantId = '' } = params;
    const { noteid: noteId = '' } = query;
    const searchParams = new Map([['noteid', noteId]]);

    if (!plantId) {
      res.send(indexHtml({ req }, false));
      return;
    }

    const muiTheme = getMuiTheme({
      palette: {
        accent1Color: deepOrange500,
      },
      userAgent: req.headers['user-agent'],
    });

    const initialState = await singlePlant(user, plantId, noteId, logger) || {};

    if (user?.locationIds?.length && !user.activeLocationId) {
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

    const context: StaticRouterContext = {};

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
    res.status(404).send(indexHtml({ req }, false));
  }
};

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
