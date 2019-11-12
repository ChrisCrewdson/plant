
import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import NotesRead from '../../../../app/components/note/NotesRead';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NotesRead', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;

    // Date.parse('01 Jun 2019 00:00:00 GMT');
    // 1559347200000
    // Make the current Date.now a fixed known date so the result is consistent
    // because the component uses Date.now() (via Moment) for the time elapsed.
    const fakeCurrentDateTime = 1559347200000;
    Date.now = jest.fn(() => fakeCurrentDateTime);
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render a NotesRead', () => {
    const interim = {
    };
    const locationId = 'l-1';
    const notes = {
      'n-1': {
        _id: 'n-1',
        date: 20190101,
        note: 'This is note text',
        plantIds: ['p-1'],
        title: 'Note #1',
      },
    } as unknown as UiNotes;
    const plant = {
      _id: 'p-1',
      notes: ['n-1'],
    } as unknown as UiPlantsValue;

    const plants: UiPlants = {
      'p-1': plant,
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NotesRead
                dispatch={storeDispatch}
                interim={interim}
                locationId={locationId}
                notes={notes}
                plant={plant}
                plants={plants}
                userCanEdit
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
