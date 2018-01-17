
const React = require('react');
const App = require('../../../../app/components/App');
const store = require('../../../../app/store');
const NoteAssocPlant = require('../../../../app/components/note/NoteAssocPlant');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteAssocPlant', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('NoteAssocPlant should be rendered', () => {
    const plantIds = ['p-1', 'p-2'];
    const plants = {
      'p-1': {
        _id: 'p-1',
        title: 'Plant One',
        isTerminated: false,
      },
      'p-2': {
        _id: 'p-2',
        title: 'Plant Two',
        isTerminated: false,
      },
      'p-3': {
        _id: 'p-3',
        title: 'Plant Three',
      },
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteAssocPlant
                dispatch={storeDispatch}
                plantIds={plantIds}
                plants={plants}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
