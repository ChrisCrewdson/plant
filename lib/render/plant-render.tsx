import { StaticRouterContext } from 'react-router';
import { MuiTheme } from 'material-ui/styles';
import { Store } from 'redux';

const React = require('react');
const { Provider } = require('react-redux');
const { renderToString } = require('react-dom/server');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const { StaticRouter } = require('react-router-dom');
const Plant = require('../../app/components/plant/Plant');
const App = require('../../app/components/App');

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
