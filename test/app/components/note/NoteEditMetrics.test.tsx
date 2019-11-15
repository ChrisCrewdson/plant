import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

import NoteEditMetrics from '../../../../app/components/note/NoteEditMetrics';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

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
      <MuiThemeProvider theme={theme}>
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
