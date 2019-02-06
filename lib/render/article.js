const React = require('react');
const { createStore } = require('redux');
const { Provider } = require('react-redux');
const { renderToString } = require('react-dom/server');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const Article = require('../../app/components/article/Article');
const appReducers = require('../../app/reducers');
const indexHtml = require('.');

/**
 * target
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @returns {void}
 */
const target = (req, res) => {
  const muiTheme = getMuiTheme({
    palette: {
      accent1Color: deepOrange500,
    },
    userAgent: req.headers['user-agent'],
  });

  const store = createStore(appReducers, seamless.from({}));

  // Render the component to a string
  /* eslint-disable react/jsx-filename-extension, function-paren-newline */
  const html = renderToString(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Provider store={store}>
        <Article />
      </Provider>
    </MuiThemeProvider>);
  /* eslint-enable react/jsx-filename-extension, function-paren-newline */

  const data = {
    html,
    // initialState,
    req,
    title: 'A Fruit Tree Emergency',
  };
  res.send(indexHtml(data));
};

module.exports = target;
