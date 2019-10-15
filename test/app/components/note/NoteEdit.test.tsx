import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import NoteEdit from '../../../../app/components/note/NoteEdit';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteEdit', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  // TODO: Complete this test.
  // Added to repo in a disabled state because it's in my stash and I don't want to lose it.
  // Issue #7

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render NoteEdit', () => {
    const interimNote = {
      note: 'test note text',
      plantIds: ['p-1'],
    };
    const plants = {
      'p-1': {
        locationId: 'l-1',
        title: 'p-1 title',
        _id: 'p-1',
      },
    };
    const locationId = 'l-1';

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteEdit
                dispatch={storeDispatch}
                interimNote={interimNote}
                plants={plants}
                locationId={locationId}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const noteEdit = component.toJSON();
    expect(noteEdit).toMatchSnapshot();
  });
});
