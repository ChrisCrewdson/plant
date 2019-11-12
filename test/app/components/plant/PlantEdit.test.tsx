import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Dispatch } from 'redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import PlantEdit from '../../../../app/components/plant/PlantEdit';
import store from '../../../../app/store';
import App from '../../../../app/components/App';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

describe('PlantEdit', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = (() => {}) as Dispatch<PlantAction<any>>;
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  /*
  Skipping this test because of this error on 11/11/19:

   FAIL  test/app/components/plant/PlantEdit.test.tsx
  - PlantEdit > should render a PlantEdit

    TypeError: Cannot read property 'style' of null

      at Window.getComputedStyle (
        node_modules/jsdom/lib/jsdom/browser/Window.js:524:20)
      at
      node_modules/@material-ui/core/TextareaAutosize/TextareaAutosize.js:67:32
      at
      node_modules/@material-ui/core/TextareaAutosize/TextareaAutosize.js:120:5
      at commitHookEffectList (
        node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12131:26)
      at commitLifeCycles (
        node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12181:9)
      at commitLayoutEffects (
        node_modules/react-test-renderer/cjs/react-test-renderer.development.js:15331:7)
      at HTMLUnknownElement.callCallback (
        node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11744:14)
      at invokeEventListeners (
        node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:193:27)
      at HTMLUnknownElementImpl._dispatch (
        node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:119:9)
      at HTMLUnknownElementImpl.dispatchEvent (
        node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:82:17)

  This error likely has something to do with how the test runner sets up the environment.
  Hoping that this gets address incidentally in one of the Material-UI updates. Here is a
  very similar issue:
  https://github.com/mui-org/material-ui/issues/16491

  Actions:
  1. Try and remove skip on this test after @material-ui/core@4.x updates. Note the
  dates that this removal and retry was done.
  2. Work on trying to fix this by posting an issue once all of material-ui has
  been converted over to 4.x
  */
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render a PlantEdit', () => {
    const interimPlant = {
      isNew: true,
    };

    const user = {
      _id: 'u-1',
      activeLocationId: 'l-1',
    };

    const users = {
      'u-1': {
        locationIds: ['l-1', 'l-2'],
      },
    };

    const locations = {
      'l-1': {},
      'l-2': {},
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <PlantEdit
                dispatch={() => {}}
                interimPlant={interimPlant}
                user={user}
                users={users}
                locations={locations}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
