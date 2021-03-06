import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

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

export default function EditDeleteButtons(props: EditDeleteButtonsProps): JSX.Element | null {
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
  } = props;

  if (!showButtons) {
    return null;
  }

  function onClickDelete(): void {
    clickDelete(deleteData);
  }

  function onClickEdit(): void {
    clickEdit(deleteData);
  }

  const size = mini ? 'medium' : 'large';

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
            <Fab
              color="primary"
              disabled={disabled}
              onClick={onClickEdit}
              size={size}
              title="Edit"
            >
              <EditIcon />
            </Fab>
            <Fab
              color="secondary"
              disabled={disabled}
              onClick={onClickDelete}
              size={size}
              style={{ marginLeft: '10px' }}
              title="Delete"
            >
              <DeleteIcon />
            </Fab>
          </div>
        )}
    </h2>
  );
}

EditDeleteButtons.propTypes = {
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

EditDeleteButtons.defaultProps = {
  confirmMsg: 'Really delete? (This cannot be undone.)',
  deleteData: {},
  disabled: false,
  mini: false,
};
