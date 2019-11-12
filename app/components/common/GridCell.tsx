// User grid editor

import PropTypes from 'prop-types';
import React from 'react';
import Switch from '@material-ui/core/Switch';

import InputCombo from './InputCombo';
import InputComboText from './InputComboText';
import SelectCombo from './SelectCombo';

export type GridCellInputType = 'select' | 'boolean' | 'text';

interface GridCellProps {
  editCell: (rowId: string, colIndex: number, value: string|boolean) => void;
  editId?: string;
  error: string;
  index: number;
  options?: Record<string, string>;
  rowId: string;
  title: string;
  type: GridCellInputType;
  value: string|boolean;
}

export default class GridCell extends React.Component {
  props!: GridCellProps;

  static propTypes = {
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

  static defaultProps = {
    editId: '',
    options: {},
  };

  constructor(props: GridCellProps) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onChangeBoolean = this.onChangeBoolean.bind(this);
    this.onChangeSelect = this.onChangeSelect.bind(this);
  }

  /**
   * Change Handler for Select
   */
  onChangeSelect(val: string) {
    const {
      editCell, rowId, index,
    } = this.props;
    editCell(rowId, index, val);
  }

  onChangeText(name: string, val: string) {
    const {
      editCell, rowId, index,
    } = this.props;
    editCell(rowId, index, val);
  }

  onChangeBoolean(name: string, val: boolean) {
    const {
      editCell, rowId, index,
    } = this.props;
    editCell(rowId, index, val);
  }

  render() {
    const {
      editId, rowId, value, type, title, options, error, index,
    } = this.props;
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
      if (type === 'text' && typeof value === 'string') {
        return (
          <InputComboText
            changeHandler={this.onChangeText}
            error={error}
            id={htmlId}
            name={title}
            placeholder={title}
            style={{}}
            type={type}
            value={value}
          />
        );
      }
      if (type === 'boolean' && typeof value === 'boolean') {
        return (
          <InputCombo
            booleanChangeHandler={this.onChangeBoolean}
            name={title}
            value={value}
          />
        );
      }
      return null;
    }

    // We're in read-only mode for this cell

    // If the type is boolean then show a checkbox div.
    // value will be typeof boolean
    if (type === 'boolean' || typeof value === 'boolean') {
      const checked = !!value;
      return (
        <Switch
          disabled
          checked={checked}
        />
      );
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
