
const React = require('react');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');
const InputCombo = require('../../../../app/components/common/InputCombo');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('InputCombo', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render Text Input', () => {
    const changeHandler = () => {};
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <InputCombo
                changeHandler={changeHandler}
                id="test-id"
                name="test-name"
                placeholder="placeholder text"
                value="test-value"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });

  test('should render Select Input', () => {
    const changeHandler = () => {};
    const options = {
      one: '1',
      two: '2',
    };
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <InputCombo
                changeHandler={changeHandler}
                id="test-id"
                name="test-name"
                options={options}
                type="select"
                value="test-value"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
