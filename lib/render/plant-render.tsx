import { StaticRouterContext } from 'react-router';
import { MuiTheme } from 'material-ui/styles';
import { Store } from 'redux';

import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { StaticRouter } from 'react-router-dom';
import Plant from '../../app/components/plant/Plant';
import App from '../../app/components/App';

interface SsrRenderPlantOptions {
  muiTheme: MuiTheme;
  store: Store<any, PlantRedux.PlantAction<any>>;
  context: StaticRouterContext;
  url: string;
  params: string;
  searchParams: Map<string, any>;
}

const ssrRenderPlant = (options: SsrRenderPlantOptions) => {
  const {
    muiTheme,
    store,
    context,
    url,
    params,
    searchParams,
  } = options;

  return renderToString(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Provider store={store}>
        <App>
          <StaticRouter
            context={context}
            location={url}
          >
            <Plant params={params} searchParams={searchParams} />
          </StaticRouter>
        </App>
      </Provider>
    </MuiThemeProvider>);
};

export {
  ssrRenderPlant,
};
