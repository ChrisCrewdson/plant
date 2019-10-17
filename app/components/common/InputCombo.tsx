import PropTypes from 'prop-types';
import React from 'react';
import Toggle from 'material-ui/Toggle';
import inputComboText from './InputComboText';

declare type InputComboPropsType = 'text' | 'number' | 'boolean';

interface InputComboProps {
  changeHandler: (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => void;
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
    changeHandler,
    name: namo,
    type = 'text',
    value,
  } = props;

  const booleanHandler = (e: React.MouseEvent<{}>, isInputChecked: boolean): void => {
    // TODO: Once typing is done on this repo we need to revisit this InputCombo
    // and package up a single object that is passed to the changeHandler that has
    // everything that the caller needs to make the changeHandler param identical
    // for all calls.
    // @ts-ignore - come back and fix this per TODO above.
    changeHandler(e, isInputChecked);
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


  switch (type) {
    case 'text':
    case 'number':
      // @ts-ignore - FIX - Remove this ignore comment when fixing the InputCombo handler types
      return inputComboText(props);
    case 'boolean':
      return boolean();
    default:
      throw new Error(`Unknown input type ${type}`);
  }
}

inputCombo.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  error: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
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
