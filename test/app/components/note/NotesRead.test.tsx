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
const NotesRead = require('../../../../app/components/note/NotesRead');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NotesRead', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};

    // Date.parse('01 Jun 2019 00:00:00 GMT');
    // 1559347200000
    // Make the current Date.now a fixed known date so the result is consistent
    // because the component uses Date.now() (via Moment) for the time elapsed.
    const fakeCurrentDateTime = 1559347200000;
    Date.now = jest.fn(() => fakeCurrentDateTime);
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render a NotesRead', () => {
    const interim = {
    };
    const locationId = 'l-1';
    const notes = {
      'n-1': {
        _id: 'n-1',
        date: 20190101,
        note: 'This is note text',
        plantIds: ['p-1'],
        title: 'Note #1',
      },
    };
    const plant = {
      _id: 'p-1',
      notes: ['n-1'],
    };

    const plants = {
      'p-1': plant,
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NotesRead
                dispatch={storeDispatch}
                interim={interim}
                locationId={locationId}
                notes={notes}
                plant={plant}
                plants={plants}
                userCanEdit
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
