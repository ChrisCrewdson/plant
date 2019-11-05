import PropTypes from 'prop-types';
import React from 'react';
import Toggle from 'material-ui/Toggle';
import inputComboText, { InputComboTextProps } from './InputComboText';

type InputComboPropsType = 'text' | 'number' | 'boolean';

interface InputComboProps {
  changeHandler?: (name: string, newValue: string) => void;
  booleanChangeHandler?: (name: string, isInputChecked: boolean) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: InputComboPropsType;
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

  if (type === 'text' || type === 'number') {
    if (typeof value === 'boolean') {
      throw new Error('Invalid value type of boolean when type is text or number');
    }
    const v = value;
    const t = type === 'text' ? 'text' : 'number';
    const comboTextProps: InputComboTextProps = {
      ...props,
      type: t,
      value: v,
    };
    return inputComboText(comboTextProps);
  }

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
