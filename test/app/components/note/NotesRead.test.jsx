
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
        date: 1,
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
