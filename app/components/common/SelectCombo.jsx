const MenuItem = require('material-ui/MenuItem').default;
const PropTypes = require('prop-types');
const React = require('react');
const SelectField = require('material-ui/SelectField').default;

/**
 * @param {SelectComboProps} props
 */
function selectCombo(props) {
  const {
    changeHandler,
    error,
    id,
    label,
    options,
    style = {},
    value,
  } = props;

  const styler = Object.assign({
    marginLeft: 20,
  }, style);

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
        Object.keys(options).map(key => (
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

module.exports = selectCombo;
