import { Dispatch } from 'redux';
import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import LocationTile from '../../../../app/components/location/LocationTile';
import { PlantAction } from '../../../../lib/types/redux-payloads';

const muiTheme = getMuiTheme(lightBaseTheme);

const mockDispatch = (() => {}) as Dispatch<PlantAction<any>>;

describe('LocationTile', () => {
  test('LocationTile should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider muiTheme={muiTheme}>
        <MemoryRouter>
          <LocationTile
            _id="mongo-id"
            numPlants={5}
            dispatch={mockDispatch}
            title="I am a title"
          />
        </MemoryRouter>
      </MuiThemeProvider>);
    const badgeTotals = component.toJSON();
    expect(badgeTotals).toMatchSnapshot();
  });
});
