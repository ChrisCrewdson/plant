
const React = require('react');
const App = require('../../../app/components/App');
const store = require('../../../app/store');
const DebugSettings = require('../../../app/components/DebugSettings');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('DebugSettings', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
    global.localStorage = {
      getItem: () => '',
      setItem: () => {},
    };
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('DebugSettings should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <DebugSettings />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
