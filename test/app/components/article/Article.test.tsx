import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';
import Article from '../../../../app/components/article/Article';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('Article', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('Article should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <Article />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
