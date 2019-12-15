// User grid editor

import PropTypes from 'prop-types';
import React, { useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import utils from '../../libs/utils';
import GridCell, { GridCellInputType } from './GridCell';
import EditDeleteButtons from './EditDeleteButtons';
import CancelSaveButtons from './CancelSaveButtons';


interface GridPropsColumn {
  options?: Record<string, string>; // Might not be right
  title: string;
  type: GridCellInputType;
  width: number;
}

export interface GridPropsRow {
  _id: string;
  values: (string|boolean)[];
}

export interface GridRowValidate {
  isNew?: boolean;
  meta?: any;
  row?: GridPropsRow;
}

interface GridProps {
  columns: GridPropsColumn[];
  delete: Function;
  insert: Function;
  meta?: object;
  rows?: GridPropsRow[];
  title: string;
  update: Function;
  validate: (data: GridRowValidate) => string[];
}

export default function grid(props: GridProps) {
  const {
    columns,
    delete: removeRow,
    insert,
    meta,
    rows,
    title,
    update,
    validate,
  } = props;

  // We need to keep a reference of these rows because this component is going
  // to manage the editing and state of the rows from here onwards.
  const [stateRows, setStateRows] = useState(rows);
  const [deleteId, setDeleteId] = useState('');
  const [editId, setEditId] = useState('');
  const [errors, setErrors] = useState([] as string[]);
  const [newRow, setNewRow] = useState(false);

  /**
   * The delete button on a row was clicked. Set a flag to switch the Edit/Delete
   * button pair to Cancel/Delete button pair to confirm the delete action.
   * @param deleteData - data needed to identify row to be deleted
   */
  const checkDelete = (deleteData: { id: string }) => {
    const { id } = deleteData;
    setDeleteId(id);
  };

  /**
   * The "Confirm Delete" or "Cancel Delete" was clicked. Either delete the row or restore
   * the Edit/Delete button pair.
   * @param yes - True if delete was confirmed. False if cancel was clicked
   * @param deleteData  - data needed to identify row to be deleted
   */
  const confirmDelete = (yes: boolean, deleteData: {id: string}): void => {
    if (yes) {
      if (!stateRows || !stateRows.length) {
        return;
      }
      const { id } = deleteData;
      const row = stateRows.find(({ _id }) => _id === id);
      removeRow({ row, meta });
      setStateRows(stateRows.filter(({ _id }) => _id !== id));
    } else {
      setDeleteId('');
    }
  };

  /**
   * Toggle a row from View (read-only) Mode to Edit Mode
   * @param editData - holds rowId of the row being switch to edit mode
   */
  const editRow = (editData: {id: string}) => {
    setEditId(editData.id);
  };

  /**
   * Change the value in a row/column in the rows collection.
   * aka edit a cell in the grid
   * @param rowId - UUID of the row being edited
   * @param colIndex - Integer index of column being edited
   * @param value - New value for the cell
   */
  const editCell = (rowId: string, colIndex: number, value: string | boolean): void => {
    if (errors[colIndex]) {
      // If we've edited this cell and it previously had an error associated
      // then clear that error
      errors[colIndex] = '';
    }

    if (!stateRows || !stateRows.length) {
      return;
    }

    const newRows = stateRows.map((row) => {
      if (row._id === rowId) {
        const values = row.values.map((currentValue, index) => {
          if (colIndex === index) {
            return value;
          }
          return currentValue;
        });
        return { ...row, values };
      }
      return row;
    });
    setStateRows(newRows);
    setErrors(errors);
  };

  /**
   * If we're canceling the editing of a new row then we want to completely
   * remove that row. If we're editing an existing row then we want to restore
   * the values from the props to that row in the state.
   */
  const cancelEdit = () => {
    if (!stateRows || !stateRows.length) {
      return;
    }
    if (newRow) {
      const newRows = stateRows.filter((row) => (row._id !== editId));
      setStateRows(newRows);
    } else {
      if (!rows) {
        return;
      }
      const propRow = rows.find((row) => row._id === editId);
      const newRows = stateRows.map((row) => (propRow && row._id === propRow._id ? propRow : row));
      setStateRows(newRows);
    }
    setNewRow(false);
    setEditId('');
  };

  const saveEdit = () => {
    if (!stateRows) {
      return;
    }
    const row = stateRows.find((r) => r._id === editId);
    const newErrors = validate({ row, meta, isNew: newRow });
    if (newErrors.some((error) => !!error)) {
      setErrors(newErrors);
    } else {
      if (newRow) {
        insert({ row, meta });
      } else {
        update({ row, meta });
      }
      setEditId('');
      setNewRow(false);
    }
  };

  const addNewRow = () => {
    const mongoId = utils.makeMongoId();

    const row: GridPropsRow = {
      _id: mongoId,
      values: columns.map(({ type, options }) => {
        switch (type) {
          case 'text':
            return '';
          case 'boolean':
            return true;
          case 'select':
            return (options && options['<select>']) || '';
          default:
            // eslint-disable-next-line no-console
            console.warn('Unknown type in addNewRow', type);
            return '';
        }
      }),
    };
    if (!stateRows) {
      return;
    }
    const newRows = stateRows.concat(row);
    setStateRows(newRows);
    setEditId(mongoId);
    setNewRow(true);
  };

  const paperStyle = {
    padding: 20,
    marginBottom: 25,
  };

  // TODO: Shouldn't this value be pulled from somewhere?
  const userCanEdit = true;

  const size = 'medium';

  const headerCellStyle = { fontSize: 16 };
  const bodyCellStyle = { fontSize: 14 };

  return (
    <Paper
      elevation={24}
      style={paperStyle}
    >
      <h5>
        {title}
      </h5>
      <Table>
        <TableHead>
          <TableRow>
            {
                  columns.map((column) => (
                    <TableCell key={column.title} style={headerCellStyle}>
                      {column.title}
                    </TableCell>
                  ))
                }
            <TableCell key="action" style={headerCellStyle}>
  Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stateRows
                && stateRows.map((row) => (
                  <TableRow key={row._id}>
                    {
                      row.values.map((value, index) => (
                        <TableCell key={columns[index].title} style={bodyCellStyle}>
                          <GridCell
                            editCell={editCell}
                            editId={editId}
                            error={errors[index] || ''}
                            index={index}
                            options={columns[index].options}
                            rowId={row._id}
                            title={columns[index].title}
                            type={columns[index].type}
                            value={value}
                          />
                        </TableCell>
                      ))
                    }
                    <TableCell key="action" style={bodyCellStyle}>
                      {editId === row._id
                        ? (
                          <CancelSaveButtons
                            clickCancel={cancelEdit}
                            clickSave={saveEdit}
                            mini
                            showButtons
                          />
                        )
                        : (
                          <EditDeleteButtons
                            clickDelete={checkDelete}
                            clickEdit={editRow}
                            confirmDelete={confirmDelete}
                            confirmMsg="Really?"
                            deleteData={{ id: row._id }}
                            deleteTitle=""
                            disabled={!!editId}
                            mini
                            showButtons={userCanEdit}
                            showDeleteConfirmation={deleteId === row._id}
                          />
                        )}
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
      <div style={{ textAlign: 'right' }}>
        <Fab
          color="primary"
          disabled={!!editId}
          onClick={addNewRow}
          size={size}
          title={`Add ${title}`}
        >
          <AddIcon />
        </Fab>
      </div>
    </Paper>
  );
}


grid.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    options: PropTypes.object,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  })).isRequired,
  delete: PropTypes.func.isRequired,
  insert: PropTypes.func.isRequired,
  meta: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  rows: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
  })),
  title: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  validate: PropTypes.func.isRequired,
};

grid.defaultProps = {
  rows: [],
  meta: {},
};
