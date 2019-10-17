import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import DoneIcon from 'material-ui/svg-icons/action/done';
import AddPhotoIcon from 'material-ui/svg-icons/image/add-a-photo';
import PropTypes from 'prop-types';

interface CancelSaveButtonsProps {
  clickAddPhoto: React.MouseEventHandler<{}>;
  clickCancel: React.MouseEventHandler<{}>;
  clickSave: React.MouseEventHandler<{}>;
  showButtons: boolean;
  mini?: boolean;
}

export default function cancelSaveButtons(props: CancelSaveButtonsProps) {
  const {
    showButtons,
  } = props;

  if (!showButtons) {
    return null;
  }

  const {
    clickAddPhoto,
    clickCancel,
    clickSave,
    mini,
  } = props;

  return (
    <h2 className="vcenter">
      <div style={{ textAlign: 'right' }}>
        {clickAddPhoto
          && (
          <FloatingActionButton
            onClick={clickAddPhoto}
            secondary
            title="Upload Photo"
            mini={mini}
          >
            <AddPhotoIcon />
          </FloatingActionButton>
          )}

        <FloatingActionButton
          onClick={clickCancel}
          secondary
          style={{ marginLeft: '10px' }}
          title="Cancel"
          mini={mini}
        >
          <ClearIcon />
        </FloatingActionButton>

        <FloatingActionButton
          onClick={clickSave}
          style={{ marginLeft: '10px' }}
          title="Save"
          mini={mini}
        >
          <DoneIcon />
        </FloatingActionButton>
      </div>
    </h2>
  );
}

cancelSaveButtons.propTypes = {
  clickAddPhoto: PropTypes.func,
  clickCancel: PropTypes.func.isRequired,
  clickSave: PropTypes.func.isRequired,
  showButtons: PropTypes.bool.isRequired,
  mini: PropTypes.bool,
};

cancelSaveButtons.defaultProps = {
  clickAddPhoto: null,
  mini: false,
};
