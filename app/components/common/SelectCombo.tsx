import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import SelectField from 'material-ui/SelectField';

interface SelectComboProps {
  changeHandler: (e: React.SyntheticEvent<{}>, index: number, menuItemValue: any) => void;
  // changeHandler: (e: React.FormEvent<{}>, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  value: string | number | boolean;
  options?: Record<string, string>;
}

export default function selectCombo(props: SelectComboProps) {
  const {
    changeHandler,
    error,
    id,
    label,
    options,
    style = {},
    value,
  } = props;

  const styler = { marginLeft: 20, ...style };

  const select = () => {
    if (!options) {
      // eslint-disable-next-line no-console
      console.error(`No options were passed in for the select: ${options}`);
      return null;
    }
    return (
      <SelectField
        errorText={error}
        floatingLabelText={label}
        id={id}
        value={value}
        onChange={changeHandler}
        style={styler}
      >
        {
        Object.keys(options).map((key) => (
          <MenuItem
            key={key}
            value={key}
            primaryText={options[key]}
          />
        ))
      }
      </SelectField>
    );
  };

  return select();
}

selectCombo.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  error: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
};

selectCombo.defaultProps = {
  error: '',
  label: '',
  options: {},
  style: {},
};
