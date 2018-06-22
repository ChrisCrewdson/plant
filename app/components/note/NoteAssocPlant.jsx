
const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const ArrowLeft = require('material-ui/svg-icons/hardware/keyboard-arrow-left').default;
const ArrowRight = require('material-ui/svg-icons/hardware/keyboard-arrow-right').default;
const PropTypes = require('prop-types');
const InputComboText = require('../common/InputComboText');
const Errors = require('../common/Errors');
const utils = require('../../libs/utils');
const actions = require('../../actions');
const NoteAssocPlantToggleButton = require('./NoteAssocPlantToggleButton');

class NoteAssocPlant extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
      filter: '',
    };
    this.expand = this.expand.bind(this);
    this.toggle = this.toggle.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    return this.setState({ filter: e.target.value.toLowerCase() });
  }

  toggle(plantId) {
    const { plantIds: propPlantIds, dispatch } = this.props;
    const plantIds = propPlantIds.indexOf(plantId) >= 0
      ? propPlantIds.filter(pId => pId !== plantId)
      : propPlantIds.concat(plantId);

    dispatch(actions.editNoteChange({ plantIds }));
  }

  expand() {
    const { expanded: exp } = this.state;
    const expanded = !exp;
    this.setState({ expanded });
  }

  renderPlantButton(plant, primary) {
    const { _id, title, isTerminated } = plant;
    const secondary = !primary && !!isTerminated;
    return (
      <NoteAssocPlantToggleButton
        _id={_id}
        key={_id}
        label={title}
        primary={primary}
        secondary={secondary}
        style={{ margin: 12 }}
        toggleFunc={this.toggle}
      />
    );
  }

  renderPlantButtons(plantIds, plants, selected) {
    return plantIds.map((plantId) => {
      const plant = plants[plantId];
      if (!plant) {
        // console.warn(`Missing plant for plantId ${plantId}`);
        return null;
      }
      return this.renderPlantButton(plant, selected);
    });
  }

  render() {
    const { expanded, filter } = this.state;
    const { plantIds, plants, error } = this.props;
    // TODO: If the following pattern is to be kept then:
    // If expanded is true then it might be faster to sort the array once before applying
    // the filter twice rather than filtering twice and sorting twice.
    const checkedPlantIds = utils.filterSortPlants(plantIds, plants, filter);
    const checkedPlants = this.renderPlantButtons(checkedPlantIds, plants, true);

    let uncheckedPlants = null;
    if (expanded) {
      const uncheckedIds = Object.keys(plants).filter(plantId => plantIds.indexOf(plantId) === -1);
      const uncheckedPlantIds = utils.filterSortPlants(uncheckedIds, plants, filter);

      uncheckedPlants = this.renderPlantButtons(uncheckedPlantIds, plants, false);
    }

    const title = `${expanded ? 'Hide' : 'Show'} Unchecked Plants`;
    const arrow = (
      <FloatingActionButton
        mini
        onClick={this.expand}
        secondary
        title={title}
      >
        {expanded
          ? <ArrowLeft />
          : <ArrowRight />
        }
      </FloatingActionButton>);

    const filterInput = (
      <InputComboText
        id="note-assoc-plant-filter"
        changeHandler={this.changeHandler}
        label="Filter"
        placeholder="Filter..."
        value={filter}
        name="filter"
      />
    );

    const errors = error ? [error] : [];

    return (
      <div style={{ textAlign: 'left' }}>
        <Errors errors={errors} />
        <div>
          {'Associated plants:'}
          {filterInput}
          {checkedPlants}
          {uncheckedPlants}
          {arrow}
        </div>
      </div>
    );
  }
}

NoteAssocPlant.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  plantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  plants: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

NoteAssocPlant.defaultProps = {
  error: '',
};

module.exports = NoteAssocPlant;
