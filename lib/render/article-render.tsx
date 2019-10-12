import { MuiTheme } from 'material-ui/styles';
import { Store } from 'redux';
import { PlantAction } from '../types/redux-payloads';

const React = require('react');
const { Provider } = require('react-redux');
const { renderToString } = require('react-dom/server');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const Article = require('../../app/components/article/Article');

interface SsrRenderArticleOptions {
  muiTheme: MuiTheme;
  store: Store<any, PlantAction<any>>;
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
