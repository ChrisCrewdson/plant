
const React = require('react');
const LocationTile = require('../../../../app/components/location/LocationTile');
const renderer = require('react-test-renderer');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const getMuiTheme = require('material-ui/styles/getMuiTheme').default;
const lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
const {
  MemoryRouter,
} = require('react-router-dom');

const muiTheme = getMuiTheme(lightBaseTheme);

describe('LocationTile', () => {
  test('LocationTile should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <MemoryRouter>
          <LocationTile
            _id="mongo-id"
            numPlants={5}
            dispatch={() => {}}
            title="I am a title"
          />
        </MemoryRouter>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
