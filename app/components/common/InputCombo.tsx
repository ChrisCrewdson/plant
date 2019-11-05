import PropTypes from 'prop-types';
import React from 'react';
import Toggle from 'material-ui/Toggle';

interface InputComboProps {
  booleanChangeHandler: (name: string, isInputChecked: boolean) => void;
  name: string;
  value: boolean;
}

export default function inputCombo(props: InputComboProps) {
  const {
    booleanChangeHandler,
    name: namo,
    value,
  } = props;

  const booleanHandler = (e: React.MouseEvent<{}>, isInputChecked: boolean): void => {
    booleanChangeHandler(namo, isInputChecked);
  };

  if (typeof value !== 'boolean') {
    return null;
  }

  return (
    <Toggle
      name={namo}
      onToggle={booleanHandler}
      toggled={value}
    />
  );
}

inputCombo.propTypes = {
  booleanChangeHandler: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
};
