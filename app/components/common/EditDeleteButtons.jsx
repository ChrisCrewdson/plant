const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const EditIcon = require('material-ui/svg-icons/editor/mode-edit').default;
const DeleteIcon = require('material-ui/svg-icons/action/delete').default;
const PropTypes = require('prop-types');
const RemoveConfirm = require('./RemoveConfirm').default;

/**
 * @param {EditDeleteButtonsProps} props
 */
function editDeleteButtons(props) {
  const {
    clickDelete,
    clickEdit,
    confirmDelete,
    confirmMsg,
    deleteData,
    deleteTitle,
    disabled,
    mini,
    showButtons,
    showDeleteConfirmation,
  } = /** @type {EditDeleteButtonsProps} */ (props);

  if (!showButtons) {
    return null;
  }

  function onClickDelete() {
    clickDelete(deleteData);
  }

  function onClickEdit() {
    clickEdit(deleteData);
  }

  return (
    <h2 className="vcenter">
      { showDeleteConfirmation
        ? (
          <RemoveConfirm
            confirmFn={confirmDelete}
            confirmMsg={confirmMsg}
            deleteData={deleteData}
            mini={mini}
            title={deleteTitle}
          />
        )
        : (
          <div style={{ textAlign: 'right' }}>
            <FloatingActionButton
              disabled={disabled}
              mini={mini}
              onClick={onClickEdit}
              title="Edit"
            >
              <EditIcon />
            </FloatingActionButton>
            <FloatingActionButton
              disabled={disabled}
              mini={mini}
              onClick={onClickDelete}
              secondary
              style={{ marginLeft: '10px' }}
              title="Delete"
            >
              <DeleteIcon />
            </FloatingActionButton>
          </div>
        )}
    </h2>
  );
}

editDeleteButtons.propTypes = {
  clickDelete: PropTypes.func.isRequired,
  clickEdit: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
  confirmMsg: PropTypes.string,
  deleteData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  deleteTitle: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  mini: PropTypes.bool,
  showButtons: PropTypes.bool.isRequired,
  showDeleteConfirmation: PropTypes.bool.isRequired,
};

editDeleteButtons.defaultProps = {
  confirmMsg: 'Really delete? (This cannot be undone.)',
  deleteData: {},
  disabled: false,
  mini: false,
};

module.exports = editDeleteButtons;
