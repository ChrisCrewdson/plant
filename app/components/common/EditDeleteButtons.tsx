import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import PropTypes from 'prop-types';
import RemoveConfirm from './RemoveConfirm';

interface EditDeleteButtonsProps {
  clickDelete: Function;
  clickEdit: Function;
  confirmDelete: Function;
  confirmMsg?: string;
  deleteData?: object;
  deleteTitle: string;
  disabled?: boolean;
  mini?: boolean;
  showButtons: boolean;
  showDeleteConfirmation: boolean;
}

export default function editDeleteButtons(props: EditDeleteButtonsProps) {
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
            confirmMsg={confirmMsg || ''}
            deleteData={deleteData}
            mini={!!mini}
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
