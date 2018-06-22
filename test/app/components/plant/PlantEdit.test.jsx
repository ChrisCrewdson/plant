
const React = require('react');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');
const PlantEdit = require('../../../../app/components/plant/PlantEdit');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('PlantEdit', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render a PlantEdit', () => {
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
