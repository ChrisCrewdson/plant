import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

import NoteCreate from '../../../../app/components/note/NoteCreate';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

describe('NoteCreate', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render a NoteCreate', () => {
    const interimNote = {
      note: 'test note text',
    } as UiInterimNote;

    const plant = {
      _id: 'p-1',
    } as UiPlantsValue;

    const plants = {
      'p-1': {
        _id: 'p-1',
      },
    } as unknown as UiPlants;

    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteCreate
                dispatch={storeDispatch}
                userCanEdit
                interimNote={interimNote}
                plant={plant}
                plants={plants}
                locationId="l-1"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
