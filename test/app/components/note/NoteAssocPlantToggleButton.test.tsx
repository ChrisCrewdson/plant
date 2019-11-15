import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

import NoteAssocPlantToggleButton from '../../../../app/components/note/NoteAssocPlantToggleButton';
import store from '../../../../app/store';
import App from '../../../../app/components/App';

import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

describe('NoteAssocPlantToggleButton', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('NoteAssocPlantToggleButton should be rendered', () => {
    const selectState = 'selected';
    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteAssocPlantToggleButton
                _id="buttonId"
                label="Button Label"
                selectState={selectState}
                style={{ color: 'blue' }}
                toggleFunc={() => {}}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
