import { ssrRenderArticle } from './article-render';

const { createStore } = require('redux');
const seamless = require('seamless-immutable').static;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const appReducers = require('../../app/reducers');
const indexHtml = require('.');

const target = (req: import('express').Request, res: import('express').Response): void => {
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
  res.send(indexHtml(data));
};

module.exports = target;
