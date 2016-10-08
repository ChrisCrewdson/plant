
const actions = require('../../actions');
const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const RaisedButton = require('material-ui/RaisedButton').default;
const ArrowLeft = require('material-ui/svg-icons/hardware/keyboard-arrow-left').default;
const ArrowRight = require('material-ui/svg-icons/hardware/keyboard-arrow-right').default;

class NoteAssocPlant extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false
    };
    this.expand = this.expand.bind(this);
  }

  toggle(plantId) {
    const plantIds = this.props.plantIds.indexOf(plantId) >= 0
      ? this.props.plantIds.filter(pId => pId !== plantId)
      : this.props.plantIds.concat(plantId);

    this.props.dispatch(actions.editNoteChange({plantIds}));
  }

  expand() {
    const expanded = !this.state.expanded;
    this.setState({expanded});
  }

  renderPlantButton(plant, primary) {
    return <RaisedButton
      key={plant._id}
      label={plant.title}
      style={{paddint: '5px'}}
      onClick={this.toggle.bind(this, plant._id)}
      primary={primary}
    />;
  }

  render() {
    const {expanded} = this.state;
    const {plantIds, plants} = this.props;

    const checkedPlants = plantIds.map(plantId => {
      const plant = plants.get(plantId);
      if(!plant) {
        console.warn(`Missing plant for plantId ${plantId}`);
        return null;
      }
      return this.renderPlantButton(plant.toJS(), true);
    });

    const uncheckedPlants = expanded
      ? plants.reduce((acc, immutablePlant) => {
        const plant = immutablePlant.toJS();
        if(plantIds.indexOf(plant._id) === -1) {
          acc.push(this.renderPlantButton(plant, false));
        }
        return acc;
      }, [])
      : null;

    const arrow = <FloatingActionButton
      mini={true}
      onClick={this.expand}
      secondary={true}
      title='Expand/Collapse Unchecked Plants'
    >
      {expanded
        ? <ArrowLeft />
        : <ArrowRight />
      }
    </FloatingActionButton>;


    return (
      <div style={{float: 'left'}}>
        {'Associated plants:'}
        {checkedPlants}
        {uncheckedPlants}
        {arrow}
      </div>
    );
  }
}

NoteAssocPlant.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  plantIds: React.PropTypes.array.isRequired,
  plants: React.PropTypes.object.isRequired, // Immutable.js Map
};

module.exports = NoteAssocPlant;
