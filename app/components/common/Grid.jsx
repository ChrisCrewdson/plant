// User grid editor

const AddIcon = require('material-ui/svg-icons/content/add').default;
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const Paper = require('material-ui/Paper').default;
const PropTypes = require('prop-types');
const React = require('react');
const {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} = require('material-ui/Table');

const utils = require('../../libs/utils');
const GridCell = require('./GridCell');
const EditDeleteButtons = require('./EditDeleteButtons');
const CancelSaveButtons = require('./CancelSaveButtons');

class Grid extends React.Component {
  /**
   *
   * @param {GridProps} props
   */
  constructor(props) {
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
    /** @type {GridState} */
    this.state = {
      rows: props.rows,
    };
  }

  /**
   * The delete button on a row was clicked. Set a flag to switch the Edit/Delete
   * button pair to Cancel/Delete button pair to confirm the delete action.
   * @param {object} deleteData - data needed to identify row to be deleted
   */
  checkDelete(deleteData) {
    const { id: deleteId } = deleteData;
    this.setState({
      deleteId,
    });
  }

  /**
   * The "Confirm Delete" or "Cancel Delete" was clicked. Either delete the row or restore
   * the Edit/Delete button pair.
   * @param {boolean} yes - True if delete was confirmed. False if cancel was clicked
   * @param {object} deleteData  - data needed to identify row to be deleted
   * @param {string} deleteData.id
   * @returns {void}
   */
  confirmDelete(yes, deleteData) {
    if (yes) {
      const { meta, delete: removeRow } = /** @type {GridProps} */ (this.props);
      const { rows } = /** @type {GridState} */ (this.state);
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
   * @param {object} editData - holds rowId of the row being switch to edit mode
   */
  editRow(editData) {
    this.setState({
      editId: editData.id,
    });
  }

  /**
   * Change the value in a row/column in the rows collection.
   * aka edit a cell in the grid
   * @param {string} rowId - UUID of the row being edited
   * @param {number} colIndex - Integer index of column being edited
   * @param {string} value - New value for the cell
   * @returns {void}
   */
  editCell(rowId, colIndex, value) {
    const {
      errors = /** @type {string[]} */ ([]),
      rows: stateRows,
    } = /** @type {GridState} */ (this.state);

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
        return Object.assign({ ...row }, { values });
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
    const { editId, newRow = false, rows: stateRows } = /** @type {GridState} */ (this.state);
    if (!stateRows) {
      return;
    }
    let rows;
    if (newRow) {
      rows = stateRows.filter(row => (row._id !== editId));
    } else {
      const { rows: propRows } = /** @type {GridProps} */ (this.props);
      if (!propRows) {
        return;
      }
      const propRow = propRows.find(row => row._id === editId);
      rows = stateRows.map(row => (propRow && row._id === propRow._id ? propRow : row));
    }
    this.setState({ editId: '', rows, newRow: false });
  }

  saveEdit() {
    const { rows, editId, newRow: isNew } = /** @type {GridState} */ (this.state);
    if (!rows) {
      return;
    }
    const {
      meta, validate, insert, update,
    } = /** @type {GridProps} */ (this.props);
    const row = rows.find(r => r._id === editId);
    const errors = validate({ row, meta, isNew });
    if (errors.some(error => !!error)) {
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
    const { columns: cols } = /** @type {GridProps} */ (this.props);
    const editId = utils.makeMongoId();
    /** @type {GridPropsRow} */
    const row = {
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
    const { rows: stateRows } = /** @type {GridState} */ (this.state);
    if (!stateRows) {
      return;
    }
    const rows = stateRows.concat(row);
    this.setState({ rows, editId, newRow: true });
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    // TODO: Shouldn't this value be pulled from somewhere?
    const userCanEdit = true;

    const { columns, title } = /** @type {GridProps} */ (this.props);
    const {
      rows,
      deleteId, // If has a value then in process of confirming delete of this row
      editId, // If has value then currently editing this row
      errors = /** @type {string[]} */ ([]),
    } = /** @type {GridState} */ (this.state);

    return (
      <Paper
        style={paperStyle}
        zDepth={5}
      >
        <h5>
          {title}
        </h5>
        <Table>
          <TableHeader
            adjustForCheckbox={false}
            displaySelectAll={false}
          >
            <TableRow>
              {
                columns.map(column => (
                  <TableHeaderColumn key={column.title}>
                    {column.title}
                  </TableHeaderColumn>
                ))
              }
              <TableHeaderColumn key="action">
Action
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {rows
              && rows.map(row => (
                <TableRow key={row._id}>
                  {
                    row.values.map((value, index) => (
                      <TableRowColumn key={columns[index].title}>
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
                      </TableRowColumn>))
                  }
                  <TableRowColumn key="action">
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
                      )
                    }
                  </TableRowColumn>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <div style={{ textAlign: 'right' }}>
          <FloatingActionButton
            disabled={!!editId}
            mini
            onClick={this.addNewRow}
            title={`Add ${title}`}
          >
            <AddIcon />
          </FloatingActionButton>
        </div>
      </Paper>
    );
  }
}

Grid.propTypes = {
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

Grid.defaultProps = {
  rows: [],
  meta: {},
};

module.exports = Grid;
