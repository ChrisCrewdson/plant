import PropTypes from 'prop-types';
import React from 'react';
import Toggle from 'material-ui/Toggle';

type InputComboPropsType = 'boolean';

interface InputComboProps {
  booleanChangeHandler: (name: string, isInputChecked: boolean) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type: InputComboPropsType;
  value: string | number | boolean;
  options?: Record<string, string>;
}

export default function inputCombo(props: InputComboProps) {
  const {
    booleanChangeHandler,
    name: namo,
    type = 'text',
    value,
  } = props;

  const booleanHandler = (e: React.MouseEvent<{}>, isInputChecked: boolean): void => {
    if (booleanChangeHandler) {
      booleanChangeHandler(namo, isInputChecked);
    }
  };

  const boolean = () => {
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
  };

  if (type === 'boolean') {
    return boolean();
  }

  throw new Error(`Unknown input type ${type}`);
}

inputCombo.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  error: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
  type: PropTypes.string,
};

inputCombo.defaultProps = {
  error: '',
  label: '',
  options: {},
  style: {},
  type: 'text',
};
