import { Dispatch } from 'redux';
import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PropTypes from 'prop-types';

import InputComboText from '../common/InputComboText';
import Errors from '../common/Errors';
import utils from '../../libs/utils';
import { actionFunc } from '../../actions';
import NoteAssocPlantToggleButton from './NoteAssocPlantToggleButton';
import { PlantAction } from '../../../lib/types/redux-payloads';

interface NoteAssocPlantProps {
  dispatch: Dispatch<PlantAction<any>>;
  error: string;
  plantIds: string[];
  plants: Record<string, UiPlantsValue>;
}

interface NoteAssocPlantState {
  expanded: boolean;
  filter: string;
}

export default class NoteAssocPlant extends React.Component {
  props!: NoteAssocPlantProps;

  // eslint-disable-next-line react/state-in-constructor
  state: NoteAssocPlantState;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    error: PropTypes.string,
    plantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    plants: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    error: '',
  };

  constructor(props: NoteAssocPlantProps) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      expanded: false,
      filter: '',
    };
    this.expand = this.expand.bind(this);
    this.toggle = this.toggle.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    return this.setState({ filter: e.target.value.toLowerCase() });
  }

  /**
   * Toggles the selected state for the button for an associated plant
   */
  toggle(plantId: string) {
    const {
      plantIds: propPlantIds,
      dispatch,
    } = this.props;
    const plantIds = propPlantIds.indexOf(plantId) >= 0
      ? propPlantIds.filter((pId) => pId !== plantId)
      : propPlantIds.concat(plantId);

    dispatch(actionFunc.editNoteChange({ plantIds }));
  }

  expand() {
    const { expanded: exp } = this.state;
    const expanded = !exp;
    this.setState({ expanded });
  }

  /**
   * Renders a button that allows for attaching or removing a plant on
   * a note.
   */
  renderPlantButton(plant: UiPlantsValue, primary: boolean) {
    const { _id, title, isTerminated } = plant;
    const secondary = !primary && !!isTerminated;
    return (
      <NoteAssocPlantToggleButton
        _id={_id || ''}
        key={_id}
        label={title}
        primary={primary}
        secondary={secondary}
        style={{ margin: 12 }}
        toggleFunc={this.toggle}
      />
    );
  }

  renderPlantButtons(plantIds: ReadonlyArray<string>, plants: Record<string, UiPlantsValue>,
    selected: boolean) {
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
      const uncheckedIds = Object.keys(plants).filter(
        (plantId) => plantIds.indexOf(plantId) === -1);
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
          : <ArrowRight />}
      </FloatingActionButton>
    );

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
