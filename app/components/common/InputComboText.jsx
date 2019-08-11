const PropTypes = require('prop-types');
const React = require('react');
const TextField = require('material-ui/TextField').default;

/**
 * A very light wrapper around the MaterialUI TextField component
 * @param {InputComboTextProps} props
 */
function inputComboText(props) {
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
      onChange={changeHandler}
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

module.exports = inputComboText;
