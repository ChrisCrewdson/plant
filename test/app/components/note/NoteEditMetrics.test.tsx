import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Dispatch } from 'redux';
import NoteEditMetrics from '../../../../app/components/note/NoteEditMetrics';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteEditMetrics', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render NoteEditMetrics', () => {
    const interimNote = {
    } as UiInterimNote;

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteEditMetrics
                dispatch={storeDispatch}
                interimNote={interimNote}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const noteEditMetrics = component.toJSON();
    expect(noteEditMetrics).toMatchSnapshot();
  });
});
