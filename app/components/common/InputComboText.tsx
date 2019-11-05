import PropTypes from 'prop-types';
import React from 'react';
import TextField from 'material-ui/TextField';

type InputComboTextPropsType = 'text' | 'number';

export interface InputComboTextProps {
  changeHandler?: (name: string, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: InputComboTextPropsType;
  value: string | number;
}


/**
 * A very light wrapper around the MaterialUI TextField component
 */
export default function inputComboText(props: InputComboTextProps) {
  const {
    changeHandler,
    disabled = false,
    error,
    fullWidth = true,
    id,
    label,
    multiLine = false,
    name: namo,
    placeholder,
    style = {},
    type = 'text',
    value,
  } = props;

  const underlineStyle = {
    display: 'none',
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {
    if (changeHandler) {
      changeHandler(e.target.name, newValue);
    }
  };

  const styler = { marginLeft: 20, ...style };

  return (
    <TextField
      disabled={disabled}
      errorText={error}
      floatingLabelText={label}
      fullWidth={fullWidth}
      hintText={placeholder}
      id={id}
      multiLine={multiLine}
      name={namo}
      onChange={onChange}
      style={styler}
      type={type}
      underlineStyle={underlineStyle}
      value={value}
    />
  );
}

inputComboText.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  multiLine: PropTypes.bool,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
  type: PropTypes.string,
};

inputComboText.defaultProps = {
  disabled: false,
  error: '',
  fullWidth: true,
  label: '',
  multiLine: false,
  placeholder: '',
  style: {},
  type: 'text',
};
