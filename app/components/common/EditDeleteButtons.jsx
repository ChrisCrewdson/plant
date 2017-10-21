const React = require('react');
const RemoveConfirm = require('./RemoveConfirm');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const EditIcon = require('material-ui/svg-icons/editor/mode-edit').default;
const DeleteIcon = require('material-ui/svg-icons/action/delete').default;
const PropTypes = require('prop-types');

function editDeleteButtons(props) {
  const {
    showButtons,
    showDeleteConfirmation,
    disabled,
  } = props;

  if (!showButtons) {
    return null;
  }

  function onClickDelete() {
    props.clickDelete(props.deleteData);
  }

  function onClickEdit() {
    props.clickEdit(props.deleteData);
  }

  return (
    <h2 className="vcenter">
      { showDeleteConfirmation
        ? <RemoveConfirm
          confirmFn={props.confirmDelete}
          confirmMsg={props.confirmMsg}
          deleteData={props.deleteData}
          mini={props.mini}
          title={props.deleteTitle}
        />
        :
        <div style={{ textAlign: 'right' }}>
          <FloatingActionButton
            disabled={disabled}
            mini={props.mini}
            onClick={onClickEdit}
            title="Edit"
          >
            <EditIcon />
          </FloatingActionButton>
          <FloatingActionButton
            disabled={disabled}
            mini={props.mini}
            onClick={onClickDelete}
            secondary
            style={{ marginLeft: '10px' }}
            title="Delete"
          >
            <DeleteIcon />
          </FloatingActionButton>
        </div>
      }
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
