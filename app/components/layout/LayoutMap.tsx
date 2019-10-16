import { RouteComponentProps } from 'react-router';

// Used to show the physical layout (a map) of plants at a Location
// Currently under development - was used at one point but no longer functional.
// Needs to be reworked.
// Url: ?

import React from 'react';

import {
  Layer, Text as KonvaText, Circle, Stage, Group,
} from 'react-konva';
import PropTypes from 'prop-types';

import * as gis from '../../libs/gis';
import { actionFunc } from '../../actions';
import Base from '../base/Base';

export default class LayoutMap extends React.Component {
  // TODO: When tsc 3.7+ is in use remove the ! to see hint text on how to change this.
  context!: PlantContext;

  props!: RouteComponentProps;

  unsubscribe!: Function;

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: RouteComponentProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderPlantLocation = this.renderPlantLocation.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context;
    const {
      plants,
      users,
    } = store.getState();

    this.setState({
      color: 'green',
      plants,
      users,
    });

    const { match } = this.props;
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
        store.dispatch(actionFunc.loadPlantsRequest(userId));
      }
    }
    const state = {
      plants,
      users,
    };
    this.setState(state);
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange() {
    const { store } = this.context;

    const {
      plants,
      users,
    } = store.getState();

    const state = {
      plants,
      users,
    };

    this.setState(state);
  }

  handleClick() {
    this.setState({
      color: 'orange',
    });
  }

  renderTitle() {
    const { store } = this.context;
    const { match } = this.props;
    const { params = {} } = match || {};
    // @ts-ignore - fix this - file not in use right now
    const { id: userId } = params;

    const { users } = store.getState();

    const userName = (users && users[userId] && users[userId].name) || '';
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${userName} Layout Map`}
      </h2>
    );
  }

  renderPlantLocation(plant: UiPlantLocation) {
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
    /*
        */
    // @ts-ignore - fix this - file not in use right now
    const { color } = this.state;
    return (
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
          onClick={this.handleClick}
          radius={5}
          shadowBlur={10}
          x={plant.x}
          y={plant.y}
        />
      </Group>
    );
  }

  /**
   * @param {number} width
   * @returns
   * @memberof LayoutMap
   */
  renderPlantLocations(width: number) {
    if (width < 30) {
      // console.error('Width is less than 30');
      return null;
    }
    const { match } = this.props;
    const { store } = this.context;
    const params = match && match.params;
    // @ts-ignore - fix this - file not in use right now
    if (params && params.id) {
    // @ts-ignore - fix this - file not in use right now
      const { id: userId } = params;
      const { plants, users } = store.getState();
      const user = users[userId];
      if (!user) {
        return null;
      }

      const userPlants = Object.keys(plants).reduce((acc, plantId) => {
        const plant = plants[plantId];
        if (plant.userId === userId && plant.loc) {
          // @ts-ignore - fix this - file not in use right now
          acc[plantId] = plant;
        }
        return acc;
      }, /** @type {UiPlants} */ ({}));

      if (!Object.keys(userPlants).length) {
        return null;
      }

      const scaledPlants = gis.scaleToCanvas(userPlants, width);
      const renderedPlants = Object
        .keys(scaledPlants.plants)
        .map((scaledPlant) => this.renderPlantLocation(scaledPlants.plants[scaledPlant]));

      return {
        canvasHeight: scaledPlants.canvasHeight,
        plants: renderedPlants,
      };
    }
    return null;
  }

  render() {
    const canvasWidth = 1000;
    const plantLocations = this.renderPlantLocations(canvasWidth);

    return (
      <Base>
        <div>
          {this.renderTitle()}
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
}
