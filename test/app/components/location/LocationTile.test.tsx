import { Dispatch } from 'redux';
import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';

import LocationTile from '../../../../app/components/location/LocationTile';
import { PlantAction } from '../../../../lib/types/redux-payloads';
import { theme } from '../../../helper';

const mockDispatch = (() => {}) as Dispatch<PlantAction<any>>;

describe('LocationTile', () => {
  test('LocationTile should be rendered', () => {
    const component = renderer.create(
      <MuiThemeProvider theme={theme}>
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
