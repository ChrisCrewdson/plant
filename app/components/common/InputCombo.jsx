const MenuItem = require('material-ui/MenuItem').default;
const PropTypes = require('prop-types');
const React = require('react');
const SelectField = require('material-ui/SelectField').default;
const Toggle = require('material-ui/Toggle').default;
const inputComboText = require('./InputComboText');

/**
 *
 * @param {InputComboProps} props
 */
function inputCombo(props) {
  const {
    changeHandler,
    error,
    id,
    label,
    name: namo,
    options,
    style = {},
    type = 'text',
    value,
  } = props;

  const styler = Object.assign({
    marginLeft: 20,
  }, style);

  const boolean = () => {
    if (typeof value !== 'boolean') {
      return null;
    }

    return (
      <Toggle
        name={namo}
        onToggle={changeHandler}
        toggled={value}
      />
    );
  };

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

  switch (type) {
    case 'text':
    case 'number':
      return inputComboText(props);
    case 'boolean':
      return boolean();
    case 'select':
      return select();
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

module.exports = inputCombo;
