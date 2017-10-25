const MenuItem = require('material-ui/MenuItem').default;
const PropTypes = require('prop-types');
const React = require('react');
const SelectField = require('material-ui/SelectField').default;
const TextField = require('material-ui/TextField').default;
const Toggle = require('material-ui/Toggle').default;

function inputCombo(props = {}) {
  const {
    changeHandler,
    disabled = false,
    error,
    fullWidth = true,
    label,
    multiLine = false,
    name: namo,
    options,
    placeholder,
    style = {},
    type = 'text',
    value,
  } = props;

  const underlineStyle = {
    display: 'none',
  };

  const styler = Object.assign({
    marginLeft: 20,
  }, style);

  const text = () => (<TextField
    disabled={disabled}
    errorText={error}
    floatingLabelText={label}
    fullWidth={fullWidth}
    hintText={placeholder}
    multiLine={multiLine}
    name={namo}
    onChange={changeHandler}
    style={styler}
    type={type}
    underlineStyle={underlineStyle}
    value={value}
  />);

  const boolean = () => (<Toggle
    toggled={value}
    value={value}
    name={namo}
    onToggle={changeHandler}
  />);

  const select = () => (
    <SelectField
      errorText={error}
      floatingLabelText={label}
      value={value}
      onChange={changeHandler}
      style={styler}
    >
      {
        Object.keys(options).map(key =>
          <MenuItem key={key} value={key} primaryText={options[key]} />)
      }
    </SelectField>);

  switch (type) {
    case 'text':
    case 'number':
      return text();
    case 'boolean':
      return boolean();
    case 'select':
      return select();
    default:
      // eslint-disable-next-line no-console
      console.warn('Unrecognized type in InputCombo', type);
      return null;
  }
}

inputCombo.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  label: PropTypes.string,
  multiLine: PropTypes.bool,
  name: PropTypes.string.isRequired, // eslint-disable-line no-dupe-keys
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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

inputCombo.defaultProps = {
  disabled: false,
  error: '',
  fullWidth: true,
  label: '',
  multiLine: false,
  options: {},
  placeholder: '',
  style: {},
  type: 'text',
};

module.exports = inputCombo;
