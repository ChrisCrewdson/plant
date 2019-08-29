const React = require('react');
const { Provider } = require('react-redux');
const { renderToString } = require('react-dom/server');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const Article = require('../../app/components/article/Article');

interface SsrRenderArticleOptions {
  muiTheme: string;
  store: string;
}

const ssrRenderArticle = (options: SsrRenderArticleOptions) => {
  const {
    muiTheme,
    store,
  } = options;

  return renderToString(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Provider store={store}>
        <Article />
      </Provider>
    </MuiThemeProvider>);
};

export {
  ssrRenderArticle,
};
