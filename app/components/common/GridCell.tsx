// User grid editor

import PropTypes from 'prop-types';
import React from 'react';

import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import InputCombo from './InputCombo';
import InputComboText from './InputComboText';

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

export default function gridCell(props: GridCellProps) {
  const {
    editCell,
    editId,
    error,
    index,
    options,
    rowId,
    title,
    type,
    value,
  } = props;

  /**
   * Change Handler for Select
   */
  const onChangeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value as string;
    editCell(rowId, index, val);
  };

  const onChangeText = (name: string, val: string) => {
    editCell(rowId, index, val);
  };

  const onChangeBoolean = (name: string, val: boolean) => {
    editCell(rowId, index, val);
  };

  const htmlId = `${editId}-${index}`;

  // If we're in edit mode for this cell then return an edit component
  // Edit mode is defined as the condition below
  if (editId === rowId) {
    if (type === 'select' && options) {
      return (
        <Select
          id={htmlId}
          value={value}
          onChange={onChangeSelect}
          style={{ marginLeft: 20 }}
        >
          {
            Object.keys(options).map((key) => (
              <MenuItem
                key={key}
                value={key}
              >
                {options[key]}
              </MenuItem>
            ))
          }
        </Select>
      );
    }
    if (type === 'text' && typeof value === 'string') {
      return (
        <InputComboText
          changeHandler={onChangeText}
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
          booleanChangeHandler={onChangeBoolean}
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

gridCell.propTypes = {
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

gridCell.defaultProps = {
  editId: '',
  options: {},
};
