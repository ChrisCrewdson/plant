import { MuiTheme } from 'material-ui/styles';
import { Store } from 'redux';

import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { PlantAction } from '../types/redux-payloads';
import Article from '../../app/components/article/Article';

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
