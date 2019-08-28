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
const NoteEdit = require('../../../../app/components/note/NoteEdit');
const store = require('../../../../app/store');
const App = require('../../../../app/components/App');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteEdit', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  // TODO: Complete this test.
  // Added to repo in a disabled state because it's in my stash and I don't want to lose it.
  // Issue #7

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render NoteEdit', () => {
    const interimNote = {
      note: 'test note text',
      plantIds: ['p-1'],
    };
    const plants = {
      'p-1': {
        locationId: 'l-1',
        title: 'p-1 title',
        _id: 'p-1',
      },
    };
    const locationId = 'l-1';

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteEdit
                dispatch={storeDispatch}
                interimNote={interimNote}
                plants={plants}
                locationId={locationId}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const noteEdit = component.toJSON();
    expect(noteEdit).toMatchSnapshot();
  });
});
