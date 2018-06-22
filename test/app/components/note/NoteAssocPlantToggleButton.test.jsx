
const React = require('react');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');
const NoteAssocPlantToggleButton = require('../../../../app/components/note/NoteAssocPlantToggleButton');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteAssocPlantToggleButton', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('NoteAssocPlantToggleButton should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteAssocPlantToggleButton
                _id="buttonId"
                label="Button Label"
                primary
                secondary={false}
                style={{ color: 'blue' }}
                toggleFunc={() => {}}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
