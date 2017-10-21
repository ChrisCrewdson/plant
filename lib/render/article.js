const indexHtml = require('.');
const React = require('react');
const { createStore } = require('redux');
const { Provider } = require('react-redux');
const appReducers = require('../../app/reducers');
const Article = require('../../app/components/article/Article');
const { renderToString } = require('react-dom/server');
const Immutable = require('immutable');
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const { deepOrange500 } = require('material-ui/styles/colors');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;

const target = (req, res) => {
  const {
    params = {},
  } = req;

  const muiTheme = getMuiTheme({
    palette: {
      accent1Color: deepOrange500,
    },
    userAgent: req.headers['user-agent'],
  });

  const store = createStore(appReducers, Immutable.fromJS({}));

  // Render the component to a string
  /* eslint-disable react/jsx-filename-extension, function-paren-newline */
  const html = renderToString(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Provider store={store}>
        <Article params={params} />
      </Provider>
    </MuiThemeProvider>);
  /* eslint-enable react/jsx-filename-extension, function-paren-newline */

  const data = {
    html,
    // initialState,
    title: 'A Fruit Tree Emergency',
  };
  res.send(indexHtml(data));
};

module.exports = target;

