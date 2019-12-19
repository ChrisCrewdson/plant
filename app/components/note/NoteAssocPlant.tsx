import { Dispatch } from 'redux';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import ArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import ArrowRight from '@material-ui/icons/KeyboardArrowRight';

import InputComboText from '../common/InputComboText';
import Errors from '../common/Errors';
import utils from '../../libs/utils';
import { actionFunc } from '../../actions';
import NoteAssocPlantToggleButton, { NoteAssocPlantToggleButtonType } from './NoteAssocPlantToggleButton';
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

const getSelectedState = (
  selected: boolean, isTerminated: boolean,
): NoteAssocPlantToggleButtonType => {
  if (selected) {
    return 'selected';
  }
  return isTerminated ? 'dead' : 'alive';
};

export default function noteAssocPlant(props: NoteAssocPlantProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('');

  const changeHandler = (_: string, value: string): void => setFilter(value.toLowerCase());

  /**
   * Toggles the selected state for the button for an associated plant
   */
  const toggle = (plantId: string): void => {
    const {
      plantIds: propPlantIds,
      dispatch,
    } = props;
    const plantIds = propPlantIds.indexOf(plantId) >= 0
      ? propPlantIds.filter((pId) => pId !== plantId)
      : propPlantIds.concat(plantId);

    dispatch(actionFunc.editNoteChange({ plantIds }));
  };

  const expand = (): void => setExpanded(!expanded);

  /**
   * Renders a button that allows for attaching or removing a plant on
   * a note.
   */
  const renderPlantButton = (plant: UiPlantsValue, primary: boolean): JSX.Element => {
    const { _id, title, isTerminated } = plant;
    const selectState = getSelectedState(primary, !!isTerminated);

    return (
      <NoteAssocPlantToggleButton
        _id={_id || ''}
        key={_id}
        label={title}
        selectState={selectState}
        style={{ margin: 12 }}
        toggleFunc={toggle}
      />
    );
  };

  const renderPlantButtons = (
    plantIds: ReadonlyArray<string>, plants: Record<string, UiPlantsValue>, selected: boolean,
  ): (JSX.Element | null)[] => plantIds.map((plantId) => {
    const plant = plants[plantId];
    if (!plant) {
      // console.warn(`Missing plant for plantId ${plantId}`);
      return null;
    }
    return renderPlantButton(plant, selected);
  });

  const { plantIds, plants, error } = props;
  // TODO: If the following pattern is to be kept then:
  // If expanded is true then it might be faster to sort the array once before applying
  // the filter twice rather than filtering twice and sorting twice.
  const checkedPlantIds = utils.filterSortPlants(plantIds, plants, filter);
  const checkedPlants = renderPlantButtons(checkedPlantIds, plants, true);

  let uncheckedPlants = null;
  if (expanded) {
    const uncheckedIds = Object.keys(plants).filter(
      (plantId) => plantIds.indexOf(plantId) === -1);
    const uncheckedPlantIds = utils.filterSortPlants(uncheckedIds, plants, filter);

    uncheckedPlants = renderPlantButtons(uncheckedPlantIds, plants, false);
  }

  const title = `${expanded ? 'Hide' : 'Show'} Unchecked Plants`;
  const arrow = (
    <Fab
      size="medium"
      onClick={expand}
      color="secondary"
      title={title}
    >
      {expanded
        ? <ArrowLeft />
        : <ArrowRight />}
    </Fab>
  );

  const filterInput = (
    <InputComboText
      id="note-assoc-plant-filter"
      changeHandler={changeHandler}
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
          Associated plants:
        {filterInput}
        {checkedPlants}
        {uncheckedPlants}
        {arrow}
      </div>
    </div>
  );
}


noteAssocPlant.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  plantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  plants: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

noteAssocPlant.defaultProps = {
  error: '',
};
