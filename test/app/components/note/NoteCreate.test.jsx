
const React = require('react');
const App = require('../../../../app/components/App');
const store = require('../../../../app/store');
const NoteCreate = require('../../../../app/components/note/NoteCreate');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteCreate', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render a NoteCreate', () => {
    const interimNote = {
      note: 'test note text',
    };

    const plant = {
      _id: 'p-1',
    };

    const plants = {
      'p-1': {
        _id: 'p-1',
      },
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteCreate
                dispatch={storeDispatch}
                userCanEdit
                interimNote={interimNote}
                plant={plant}
                plants={plants}
                locationId="l-1"
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
