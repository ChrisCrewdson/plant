
const React = require('react');
const App = require('../../../../app/components/App');
const store = require('../../../../app/store');
const NoteEditMetrics = require('../../../../app/components/note/NoteEditMetrics');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');
const { Provider } = require('react-redux');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('NoteEditMetrics', () => {
  const storeDispatch = store.dispatch;

  beforeAll(() => {
    store.dispatch = () => {};
  });

  afterAll(() => {
    store.dispatch = storeDispatch;
  });

  test('should render NoteEditMetrics', () => {
    const interimNote = {
    };

    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <App>
            <MemoryRouter>
              <NoteEditMetrics
                dispatch={storeDispatch}
                interimNote={interimNote}
              />
            </MemoryRouter>
          </App>
        </Provider>
      </MuiThemeProvider>);
    const noteEditMetrics = component.toJSON();
    expect(noteEditMetrics).toMatchSnapshot();
  });
});
