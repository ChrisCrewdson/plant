// User grid editor

import PropTypes from 'prop-types';
import React from 'react';

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

// TODO: This is probably a subset of GridProps - if so construct that way
interface GridState {
  rows?: GridPropsRow[];
  errors?: string[];
  newRow?: boolean;
  editId?: string;
  deleteId?: string;
}

export default class Grid extends React.Component {
  props!: GridProps;

  // eslint-disable-next-line react/state-in-constructor
  state: GridState;

  static propTypes = {
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

  static defaultProps = {
    rows: [],
    meta: {},
  };

  constructor(props: GridProps) {
    super(props);
    this.addNewRow = this.addNewRow.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.checkDelete = this.checkDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.editCell = this.editCell.bind(this);
    this.editRow = this.editRow.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    // We need to keep a reference of these rows because this component is going
    // to manager the editing and state of the rows from here onwards.
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      rows: props.rows,
    };
  }

  /**
     * The delete button on a row was clicked. Set a flag to switch the Edit/Delete
     * button pair to Cancel/Delete button pair to confirm the delete action.
     * @param deleteData - data needed to identify row to be deleted
     */
  checkDelete(deleteData: { id: string }) {
    const { id: deleteId } = deleteData;
    this.setState({
      deleteId,
    });
  }

  /**
     * The "Confirm Delete" or "Cancel Delete" was clicked. Either delete the row or restore
     * the Edit/Delete button pair.
     * @param yes - True if delete was confirmed. False if cancel was clicked
     * @param deleteData  - data needed to identify row to be deleted
     */
  confirmDelete(yes: boolean, deleteData: {id: string}): void {
    if (yes) {
      const { meta, delete: removeRow } = this.props;
      const { rows } = this.state;
      if (!rows || !rows.length) {
        return;
      }
      const { id } = deleteData;
      const row = rows.find(({ _id }) => _id === id);
      removeRow({ row, meta });
      this.setState({
        rows: rows.filter(({ _id }) => _id !== id),
      });
    } else {
      this.setState({ deleteId: '' });
    }
  }

  /**
     * Toggle a row from View (read-only) Mode to Edit Mode
     * @param editData - holds rowId of the row being switch to edit mode
     */
  editRow(editData: {id: string}) {
    this.setState({
      editId: editData.id,
    });
  }

  /**
     * Change the value in a row/column in the rows collection.
     * aka edit a cell in the grid
     * @param rowId - UUID of the row being edited
     * @param colIndex - Integer index of column being edited
     * @param value - New value for the cell
     */
  editCell(rowId: string, colIndex: number, value: string | boolean): void {
    const {
      errors = [] as string[],
      rows: stateRows,
    } = this.state;

    if (errors[colIndex]) {
      // If we've edited this cell and it previously had an error associated
      // then clear that error
      errors[colIndex] = '';
    }

    if (!stateRows || !stateRows.length) {
      return;
    }

    const rows = stateRows.map((row) => {
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
    this.setState({ rows, errors });
  }

  /**
     * If we're canceling the editing of a new row then we want to completely
     * remove that row. If we're editing an existing row then we want to restore
     * the values from the props to that row in the state.
     */
  cancelEdit() {
    const { editId, newRow = false, rows: stateRows } = this.state;
    if (!stateRows) {
      return;
    }
    let rows;
    if (newRow) {
      rows = stateRows.filter((row) => (row._id !== editId));
    } else {
      const { rows: propRows } = this.props;
      if (!propRows) {
        return;
      }
      const propRow = propRows.find((row) => row._id === editId);
      rows = stateRows.map((row) => (propRow && row._id === propRow._id ? propRow : row));
    }
    this.setState({ editId: '', rows, newRow: false });
  }

  saveEdit() {
    const { rows, editId, newRow: isNew } = this.state;
    if (!rows) {
      return;
    }
    const {
      meta, validate, insert, update,
    } = this.props;
    const row = rows.find((r) => r._id === editId);
    const errors = validate({ row, meta, isNew });
    if (errors.some((error) => !!error)) {
      this.setState({ errors });
    } else {
      if (isNew) {
        insert({ row, meta });
      } else {
        update({ row, meta });
      }
      this.setState({ editId: '', newRow: false });
    }
  }

  addNewRow() {
    const { columns: cols } = this.props;
    const editId = utils.makeMongoId();

    const row: GridPropsRow = {
      _id: editId,
      values: cols.map(({ type, options }) => {
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
    const { rows: stateRows } = this.state;
    if (!stateRows) {
      return;
    }
    const rows = stateRows.concat(row);
    this.setState({ rows, editId, newRow: true });
  }

  render() {
    const paperStyle = {
      padding: 20,
      marginBottom: 25,
    };

    // TODO: Shouldn't this value be pulled from somewhere?
    const userCanEdit = true;

    const size = 'medium';
    const iconStyle = { fontSize: '3em' };

    const { columns, title } = this.props;
    const {
      rows,
      deleteId, // If has a value then in process of confirming delete of this row
      editId, // If has value then currently editing this row
      errors = [],
    } = this.state;

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
            {rows
                && rows.map((row) => (
                  <TableRow key={row._id}>
                    {
                      row.values.map((value, index) => (
                        <TableCell key={columns[index].title} style={bodyCellStyle}>
                          <GridCell
                            editCell={this.editCell}
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
                            clickCancel={this.cancelEdit}
                            clickSave={this.saveEdit}
                            mini
                            showButtons
                          />
                        )
                        : (
                          <EditDeleteButtons
                            clickDelete={this.checkDelete}
                            clickEdit={this.editRow}
                            confirmDelete={this.confirmDelete}
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
            onClick={this.addNewRow}
            size={size}
            title={`Add ${title}`}
          >
            <AddIcon style={iconStyle} />
          </Fab>
        </div>
      </Paper>
    );
  }
}
