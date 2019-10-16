// User grid editor

const PropTypes = require('prop-types');
const React = require('react');
const CheckBox = require('material-ui/svg-icons/toggle/check-box').default;
const CheckBoxOutlineBlank = require('material-ui/svg-icons/toggle/check-box-outline-blank').default;
const InputCombo = require('./InputCombo');
const SelectCombo = require('./SelectCombo').default;

class GridCell extends React.Component {
  /**
   * @param {GridCellProps} props
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onChangeSelect = this.onChangeSelect.bind(this);
  }

  /**
   * Change Handler for Select
   * @param {React.SyntheticEvent<{}>} _e
   * @param {number} _index
   * @param {any} val
   */
  onChangeSelect(_e, _index, val) {
    const {
      editCell, rowId, index,
    } = /** @type {GridCellProps} */ (this.props);
    editCell(rowId, index, val);
  }

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @param {string|boolean} val
   * @memberof GridCell
   */
  onChange(e, val) {
    const {
      type, editCell, rowId, index,
    } = /** @type {GridCellProps} */ (this.props);
    let value;
    switch (type) {
      case 'boolean':
        value = val;
        break;
      case 'text':
        ({ value } = e.target);
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(`unknown type ${type} with e.target ${e.target} val ${val}`);
        value = '';
    }
    editCell(rowId, index, value);
  }

  render() {
    const {
      editId, rowId, value, type, title, options, error, index,
    } = /** @type {GridCellProps} */ (this.props);
    const htmlId = `${editId}-${index}`;

    // If we're in edit mode for this cell then return an edit component
    // Edit mode is defined as the condition below
    if (editId === rowId) {
      if (type === 'select') {
        return (
          <SelectCombo
            changeHandler={this.onChangeSelect}
            error={error}
            id={htmlId}
            options={options}
            placeholder={title}
            style={{}}
            value={value}
          />
        );
      }
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
