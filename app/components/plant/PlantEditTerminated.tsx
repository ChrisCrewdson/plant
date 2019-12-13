import React, { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';

import InputComboText from '../common/InputComboText';
import { actionFunc } from '../../actions';

interface PlantEditTerminatedProps {
  dispatch: Dispatch;
  interimPlant: UiPlantsValue;
}

export default function plantEditTerminated(props: PlantEditTerminatedProps) {
  const {
    interimPlant: {
      errors = {},
      isTerminated = false,
      terminatedDate = '',
      terminatedDescription = '',
      terminatedReason: tr,
    },
    dispatch,
  } = props;

  const terminatedReason = tr ?? 'died';

  if (!tr) {
    dispatch(actionFunc.editPlantChange({
      terminatedReason,
    }));
  }
  // }

  const dispatchChange = (name: string, value: string | boolean): void => {
    dispatch(actionFunc.editPlantChange({ [name]: value }));
  };

  /**
   * Change Handler for InputComboText
   */
  const onChange = (name: string, value: string): void => {
    dispatchChange(name, value);
  };

  const booleanHandler = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    const { name } = event.currentTarget;
    dispatchChange(name, checked);
  };

  const onChangeRadio = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    dispatchChange(name, value);
  };

  const styles = {
    radioGroup: {
      display: 'flex',
      marginLeft: '20px',
    },
  };

  const dateFormat = 'MM/DD/YYYY';

  return (
    <div>
      <FormControlLabel
        control={(
          <Switch
            checked={isTerminated}
            color="primary"
            name="isTerminated"
            onChange={booleanHandler}
            style={{ paddingLeft: '5px', maxWidth: '150px' }}
          />
          )}
        label="Terminated"
        labelPlacement="start"
      />
      {isTerminated
        && (
        <div>
          <InputComboText
            changeHandler={onChange}
            error={errors.terminatedDate}
            id="termination-date"
            label="Termination Date"
            name="terminatedDate"
            placeholder={dateFormat}
            value={terminatedDate}
          />
          <RadioGroup
            name="terminatedReason"
            onChange={onChangeRadio}
            row
            style={styles.radioGroup}
            value={terminatedReason}
          >
            <FormControlLabel
              control={<Radio />}
              label="Culled"
              value="culled"
            />
            <FormControlLabel
              control={<Radio />}
              label="Died"
              value="died"

            />
            <FormControlLabel
              control={<Radio />}
              label="Transferred"
              value="transferred"
            />
          </RadioGroup>
          <InputComboText
            changeHandler={onChange}
            error={errors.terminatedDescription}
            id="termination-description"
            label="Termination Description"
            name="terminatedDescription"
            placeholder="(Optional) Describe why this plant was terminated."
            value={terminatedDescription}
          />

          <Divider />
        </div>
        )}
    </div>
  );
}

plantEditTerminated.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interimPlant: PropTypes.shape({
    errors: PropTypes.object,
    isTerminated: PropTypes.bool,
    terminatedDate: PropTypes.string,
    terminatedDescription: PropTypes.string,
    terminatedReason: PropTypes.string,
  }).isRequired,
};
