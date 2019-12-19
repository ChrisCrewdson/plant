import { Store } from 'redux';
import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';

import { MuiThemeProvider, Theme } from '@material-ui/core/styles';

import { PlantAction } from '../types/redux-payloads';
import Article from '../../app/components/article/Article';

interface SsrRenderArticleOptions {
  theme: Theme;
  store: Store<any, PlantAction<any>>;
}

const ssrRenderArticle = (options: SsrRenderArticleOptions): string => {
  const {
    theme,
    store,
  } = options;

  return renderToString(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <Article />
      </Provider>
    </MuiThemeProvider>);
};

export {
  ssrRenderArticle,
};
