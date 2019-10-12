import si from 'seamless-immutable';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange500 } from 'material-ui/styles/colors';
import { createStore } from 'redux';

import { indexHtml } from '.';
import { ssrRenderArticle } from './article-render';
import appReducers from '../../app/reducers';

// @ts-ignore
const seamless = si.static;

export const renderArticle = (req: import('express').Request, res: import('express').Response): void => {
  const muiTheme = getMuiTheme({
    palette: {
      accent1Color: deepOrange500,
    },
    userAgent: req.headers['user-agent'],
  });

  const store = createStore(appReducers, seamless.from({}));

  // Render the component to a string
  const html = ssrRenderArticle({
    muiTheme,
    store,
  });

  const data = {
    html,
    // initialState,
    req,
    title: 'A Fruit Tree Emergency',
  };
  res.send(indexHtml(data, false));
};
