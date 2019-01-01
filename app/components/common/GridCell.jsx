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
   * @param {string|boolean} index - index will be a number when the type is "select". We don't
   * type it here as a number because it's not used when it's a number.
   * @param {string} val - this is undefined unless the type is "select" and then it's the value.
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
      case 'text':
        ({ value } = e.target);
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(`unknown type ${type} with e.target ${e.target} index ${index} val ${val}`);
        value = '';
    }
    editCell(rowId, idx, value);
  }

  render() {
    const {
      editId, rowId, value, type, title, options, error, index,
    } = /** @type {GridCellProps} */ (this.props);
    const htmlId = `${editId}-${index}`;

    // If we're in edit mode for this cell then return an edit component
    // Edit mode is defined as the condition below
    if (editId === rowId) {
      return (
        <InputCombo
          // @ts-ignore - FIX - Remove this ignore comment when fixing the InputCombo handler types
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

    // We're in read-only mode for this cell

    // If the type is boolean then show a checkbox div.
    // value will be typeof boolean
    if (type === 'boolean' || typeof value === 'boolean') {
      return value
        ? <CheckBox />
        : <CheckBoxOutlineBlank />;
    }

    // Assume that the text to show will be the value
    let text = value;

    // If the type is "select" then the value is a MongoId prop in the options that
    // will have the value.
    if (type === 'select') {
      text = (options && options[value]) || '';
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
