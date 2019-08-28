export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const React = require('react');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');
const Privacy = require('../../../../app/components/info/Privacy');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('Privacy', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('Privacy should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <Privacy />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
