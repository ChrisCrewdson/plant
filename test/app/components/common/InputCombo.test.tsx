import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

import InputComboText from '../../../../app/components/common/InputComboText';
import SelectCombo from '../../../../app/components/common/SelectCombo';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

describe('InputComboText and SelectCombo', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render Text Input', () => {
    const changeHandler = () => {};
    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <InputComboText
                changeHandler={changeHandler}
                id="test-id"
                name="test-name"
                placeholder="placeholder text"
                value="test-value"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });

  test('should render Select Input', () => {
    const changeHandler = () => {};
    const options = {
      one: '1',
      two: '2',
    };
    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <SelectCombo
                changeHandler={changeHandler}
                id="test-id"
                options={options}
                value="test-value"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
