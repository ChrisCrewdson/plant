import PropTypes from 'prop-types';
import React, { ChangeEvent } from 'react';

import TextField from '@material-ui/core/TextField';
import { InputLabelProps } from '@material-ui/core/InputLabel';
import { FormHelperTextProps } from '@material-ui/core/FormHelperText';
import { InputProps } from '@material-ui/core/Input';

type InputComboTextPropsType = 'text' | 'number';

export interface InputComboTextProps {
  changeHandler: (name: string, newValue: string) => void;
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
export default function inputComboText(props: InputComboTextProps): JSX.Element {
  const {
    changeHandler,
    disabled = false,
    error: errorText,
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

  // const underlineStyle = {
  //   display: 'none',
  // };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    changeHandler(e.target.name, e.target.value);
  };

  const fontSize = '1.5em';
  const styler = {
    marginLeft: 20, marginRight: 20, marginBottom: 20, ...style,
  };
  const error = !!errorText;

  // These "sub" styles are for the sub-components that are wrapped
  // inside the TextField component and will be pushed down to their
  // respective components.
  const subStyle = {
    style: { fontSize },
  };
  const subInputLabelProps: InputLabelProps = subStyle;
  const subFormHelperTextProps: FormHelperTextProps = subStyle;
  const subInputProps: InputProps = subStyle;

  return (
    <TextField
      disabled={disabled}
      error={error}
      FormHelperTextProps={subFormHelperTextProps}
      fullWidth={fullWidth}
      helperText={errorText}
      id={id}
      InputLabelProps={subInputLabelProps}
      InputProps={subInputProps}
      label={label}
      multiline={multiLine}
      name={namo}
      onChange={onChange}
      placeholder={placeholder}
      style={styler}
      type={type}
      value={value}
      variant="standard"
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
