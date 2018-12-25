// User grid editor

const PropTypes = require('prop-types');
const React = require('react');
const CheckBox = require('material-ui/svg-icons/toggle/check-box').default;
const CheckBoxOutlineBlank = require('material-ui/svg-icons/toggle/check-box-outline-blank').default;
const InputCombo = require('./InputCombo');

class GridCell extends React.Component {
  /**
   * @param {GridCellProps} props
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  /**
   * Change Handler
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @param {string} index
   * @param {string} val
   */
  onChange(e, index, val) {
    const {
      type, editCell, rowId, index: idx,
    } = /** @type {GridCellProps} */ (this.props);
    let value;
    switch (type) {
      case 'select':
        value = val;
        break;
      case 'boolean':
        value = index;
        break;
      default:
        ({ value } = e.target);
        break;
    }
    editCell(rowId, idx, value);
  }

  render() {
    const {
      editId, rowId, value, type, title, options, error, index,
    } = /** @type {GridCellProps} */ (this.props);
    const htmlId = `${editId}-${index}`;
    if (editId === rowId) {
      return (
        <InputCombo
          changeHandler={this.onChange}
          error={error}
          id={htmlId}
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
      text = options && options[value];
    }

    return (
      <span>
        {text}
      </span>
    );
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
};

module.exports = GridCell;
