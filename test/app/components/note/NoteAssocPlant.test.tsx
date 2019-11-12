import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import NoteAssocPlant from '../../../../app/components/note/NoteAssocPlant';
import store from '../../../../app/store';
import App from '../../../../app/components/App';

import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteAssocPlant', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('NoteAssocPlant should be rendered', () => {
    const plantIds = ['p-1', 'p-2'];
    const plants = {
      'p-1': {
        _id: 'p-1',
        title: 'Plant One',
        isTerminated: false,
      },
      'p-2': {
        _id: 'p-2',
        title: 'Plant Two',
        isTerminated: false,
      },
      'p-3': {
        _id: 'p-3',
        title: 'Plant Three',
      },
    } as unknown as Record<string, UiPlantsValue>;

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteAssocPlant
                dispatch={storeDispatch}
                plantIds={plantIds}
                plants={plants}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
