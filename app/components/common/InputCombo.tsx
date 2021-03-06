import PropTypes from 'prop-types';
import React, { ChangeEvent } from 'react';

import Switch from '@material-ui/core/Switch';

interface InputComboProps {
  booleanChangeHandler: (name: string, isInputChecked: boolean) => void;
  name: string;
  value: boolean;
}

export default function InputCombo(props: InputComboProps): JSX.Element | null {
  const {
    booleanChangeHandler,
    name: namo,
    value,
  } = props;

  // event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  const booleanHandler = (_: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    booleanChangeHandler(namo, checked);
  };

  if (typeof value !== 'boolean') {
    return null;
  }

  return (
    <Switch
      color="primary"
      name={namo}
      onChange={booleanHandler}
      checked={value}
    />
  );
}

InputCombo.propTypes = {
  booleanChangeHandler: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
};
