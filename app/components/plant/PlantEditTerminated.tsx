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

export default class PlantEditTerminated extends React.Component {
  props!: PlantEditTerminatedProps;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    interimPlant: PropTypes.shape({
      errors: PropTypes.object,
      isTerminated: PropTypes.bool,
      terminatedDate: PropTypes.string,
      terminatedDescription: PropTypes.string,
      terminatedReason: PropTypes.string,
    }).isRequired,
  };

  constructor(props: PlantEditTerminatedProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onChangeRadio = this.onChangeRadio.bind(this);
    this.booleanHandler = this.booleanHandler.bind(this);
    this.dispatchChange = this.dispatchChange.bind(this);

    const { dispatch } = this.props;
    const { interimPlant } = this.props;
    let { terminatedReason } = interimPlant;
    if (!terminatedReason) {
      terminatedReason = 'died';
      dispatch(actionFunc.editPlantChange({
        terminatedReason,
      }));
    }
  }

  onChangeRadio(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    this.dispatchChange(name, value);
  }

  /**
   * Change Handler for InputCombo
   */
  onChange(name: string, value: string): void {
    this.dispatchChange(name, value);
  }

  booleanHandler = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    const { name } = event.currentTarget;
    this.dispatchChange(name, checked);
  };

  dispatchChange(name: string, value: string | boolean): void {
    const { dispatch } = this.props;
    dispatch(actionFunc.editPlantChange({ [name]: value }));
  }

  render() {
    const styles = {
      radioGroup: {
        display: 'flex',
      },
      radioButton: {
        marginBottom: 16,
        width: 'inherit',
        fontSize: 'large',
      },
    };

    const {
      interimPlant: {
        errors = {},
        isTerminated = false,
        terminatedDate = '',
        terminatedDescription = '',
        terminatedReason,
      },
    } = this.props;

    const dateFormat = 'MM/DD/YYYY';

    return (
      <div>
        <FormControlLabel
          control={(
            <Switch
              checked={isTerminated}
              color="primary"
              name="isTerminated"
              onChange={this.booleanHandler}
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
              changeHandler={this.onChange}
              error={errors.terminatedDate}
              id="termination-date"
              label="Termination Date"
              name="terminatedDate"
              placeholder={dateFormat}
              value={terminatedDate}
            />
            <RadioGroup
              name="terminatedReason"
              onChange={this.onChangeRadio}
              row
              style={styles.radioGroup}
              value={terminatedReason}
            >
              <FormControlLabel
                control={<Radio />}
                label="Culled"
                style={styles.radioButton}
                value="culled"
              />
              <FormControlLabel
                control={<Radio />}
                label="Died"
                style={styles.radioButton}
                value="died"

              />
              <FormControlLabel
                control={<Radio />}
                label="Transferred"
                style={styles.radioButton}
                value="transferred"
              />
            </RadioGroup>
            <InputComboText
              changeHandler={this.onChange}
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
}
