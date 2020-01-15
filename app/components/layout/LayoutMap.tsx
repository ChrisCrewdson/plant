// Used to show the physical layout (a map) of plants at a Location
// Currently under development - was used at one point but no longer functional.
// Needs to be reworked.
// Url: ?

import { RouteComponentProps } from 'react-router';
import React, { useState } from 'react';
import {
  Layer, Text as KonvaText, Circle, Stage, Group,
} from 'react-konva';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import * as gis from '../../libs/gis';
import { actionFunc } from '../../actions';
import Base from '../base/Base';
import { PlantStateTree } from '../../../lib/types/react-common';

interface PlantLocations {
  canvasHeight: number;
  plants: JSX.Element[];
}

export default function LayoutMap(props: RouteComponentProps): JSX.Element {
  const [color, setColor] = useState('green');
  const dispatch = useDispatch();
  const users = useSelector((state: PlantStateTree) => state.users);
  const plants = useSelector((state: PlantStateTree) => state.plants);

  const { match } = props;
  // @ts-ignore - fix this - file not in use right now
  if (match.params && match.params.id) {
    // @ts-ignore - fix this - file not in use right now
    const { id: userId } = match.params;
    const user = users[userId] || {};
    // This is the user id for this page.
    // @ts-ignore - plantIds does not exist on user. Because this component is not currently
    // functioning will wait to fix this. The plantIds should be based on location and not
    // user.
    if (!user.plantIds) {
      dispatch(actionFunc.loadPlantsRequest(userId));
    }
  }

  const handleClick = (): void => {
    setColor('orange');
  };

  const renderTitle = (): JSX.Element => {
    const { params = {} } = match || {};
    // @ts-ignore - fix this - file not in use right now
    const { id: userId } = params;

    const userName = (users && users[userId] && users[userId].name) || '';
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${userName} Layout Map`}
      </h2>
    );
  };

  /*
    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    });

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4
    });
    var simpleText = new Konva.Text({
      x: stage.getWidth() / 2,
      y: 15,
      text: 'Simple Text',
      fontSize: 30,
      fontFamily: 'Calibri',
      fill: 'green'
    });
  */
  const renderPlantLocation = (plant: UiPlantLocation): JSX.Element => (
    <Group key={plant._id}>
      <KonvaText
        x={plant.x - 10}
        y={plant.y}
        text={plant.title}
        fontSize={10}
        fontFamily="Calibri"
        fill="red"
      />
      <Circle
        fill={color}
        onClick={handleClick}
        radius={5}
        shadowBlur={10}
        x={plant.x}
        y={plant.y}
      />
    </Group>
  );

  const renderPlantLocations = (width: number): PlantLocations | null => {
    if (width < 30) {
      // console.error('Width is less than 30');
      return null;
    }
    const params = match && match.params;
    // @ts-ignore - fix this - file not in use right now
    if (params && params.id) {
    // @ts-ignore - fix this - file not in use right now
      const { id: userId } = params;
      const user = users[userId];
      if (!user) {
        return null;
      }

      const userPlants = Object.keys(plants).reduce((acc: UiPlants, plantId) => {
        const plant = plants[plantId];
        if (plant.userId === userId && plant.loc) {
          acc[plantId] = plant;
        }
        return acc;
      }, {});

      if (!Object.keys(userPlants).length) {
        return null;
      }

      const scaledPlants = gis.scaleToCanvas(userPlants, width);
      const renderedPlants = Object
        .keys(scaledPlants.plants)
        .map((scaledPlant) => renderPlantLocation(scaledPlants.plants[scaledPlant]));

      return {
        canvasHeight: scaledPlants.canvasHeight,
        plants: renderedPlants,
      };
    }
    return null;
  };

  const canvasWidth = 1000;
  const plantLocations = renderPlantLocations(canvasWidth);

  return (
    <Base>
      <div>
        {renderTitle()}
        {plantLocations
          ? (
            <Stage width={canvasWidth} height={plantLocations.canvasHeight}>
              <Layer>
                {plantLocations.plants}
              </Layer>
            </Stage>
          )
          : (
            <h3 style={{ textAlign: 'center' }}>
              <div style={{ marginTop: '100px' }}>
No plants have been mapped yet...
              </div>
            </h3>
          )}
      </div>
    </Base>
  );
}
// }

LayoutMap.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
