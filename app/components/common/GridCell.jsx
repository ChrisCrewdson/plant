// User grid editor

const InputCombo = require('./InputCombo');
const PropTypes = require('prop-types');
const React = require('react');
const CheckBox = require('material-ui/svg-icons/toggle/check-box').default;
const CheckBoxOutlineBlank = require('material-ui/svg-icons/toggle/check-box-outline-blank').default;

class GridCell extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e, index, val) {
    const { type } = this.props;
    let value;
    switch (type) {
      case 'select':
        value = val;
        break;
      case 'boolean':
        value = index;
        break;
      default:
        value = e.target.value;
        break;
    }
    this.props.editCell(this.props.rowId, this.props.index, value);
  }

  render() {
    const { editId, rowId, value, type, title, options, error } = this.props;
    if (editId === rowId) {
      return (
        <InputCombo
          changeHandler={this.onChange}
          error={error}
          name={title}
          options={options}
          placeholder={title}
          style={{}}
          type={type}
          value={value}
        />
      );
    }

    if (type === 'boolean') {
      return value
        ? <CheckBox />
        : <CheckBoxOutlineBlank />;
    }

    let text = value;
    if (type === 'select') {
      text = options[value];
    }

    return (<span>{text}</span>);
  }
}

GridCell.propTypes = {
  editCell: PropTypes.func.isRequired,
  editId: PropTypes.string,
  error: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  rowId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]).isRequired,
};

GridCell.defaultProps = {
  editId: '',
  options: {},
  rows: [],
};

module.exports = GridCell;
