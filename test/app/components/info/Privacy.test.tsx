import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

import Privacy from '../../../../app/components/info/Privacy';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

describe('Privacy', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('Privacy should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <Privacy />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
