// Used to show a list of plants for a user.
// Url: /plants/<optional-user-id>

const Base = require('../base/Base');
const React = require('react');
const actions = require('../../actions');
const gis = require('../../libs/gis');
const getIn = require('lodash/get');

// const {Layer, Rect, Stage, Group} = require('react-konva');
const {
  Layer, Text: KonvaText, Circle, Stage, Group,
} = require('react-konva');
const PropTypes = require('prop-types');

class LayoutMap extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;
    this.setState({
      color: 'green',
      plants: store.getState().plants,
      users: store.getState().users,
    });

    const { match } = this.props;
    if (match.params && match.params.id) {
      const { id: userId } = match.params;
      const user = store.getState().users[userId] || {};
      // This is the user id for this page.
      if (!user.plantIds) {
        store.dispatch(actions.loadPlantsRequest(userId));
      }
    }
    const state = {
      plants: store.getState().plants,
      users: store.getState().users,
    };
    this.setState(state);
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const { store } = this.context;
    const state = {
      plants: store.getState().plants,
      users: store.getState().users,
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
    const { params = {} } = (this.props || {}).match || {};
    const { id: userId } = params;
    const userName = getIn(store.getState(), ['users', userId, 'name'], '');
    return (
      <h2 style={{ textAlign: 'center' }}>{`${userName} Layout Map`}</h2>
    );
  }

  renderPlantLocation(plant) {
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
          fill={this.state.color}
          onClick={this.handleClick}
          radius={5}
          shadowBlur={10}
          x={plant.x}
          y={plant.y}
        />
      </Group>
    );
  }

  renderPlantLocations(width) {
    if (width < 30) {
      // console.error('Width is less than 30');
      return null;
    }

    const { store } = this.context;
    const params = this.props.match && this.props.match.params;
    if (params && params.id) {
      const { id: userId } = params;
      const user = store.getState().users[userId];
      if (!user) {
        return null;
      }

      const plants = store.getState().plants || [];
      const userPlants = plants.filter(plant => plant.userId === userId && plant.loc);
      if (!userPlants.length) {
        return null;
      }

      const scaledPlants = gis.scaleToCanvas(userPlants, width);
      return {
        canvasHeight: scaledPlants.canvasHeight,
        plants: scaledPlants.plants.map(this.renderPlantLocation.bind(this)),
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
            ?
              <Stage width={canvasWidth} height={plantLocations.canvasHeight}>
                <Layer>
                  {plantLocations.plants}
                </Layer>
              </Stage>
            :
              <h3 style={{ textAlign: 'center' }}>
                <div style={{ marginTop: '100px' }}>No plants have been mapped yet...</div>
              </h3>
          }
        </div>
      </Base>
    );
  }
}

LayoutMap.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

module.exports = LayoutMap;
