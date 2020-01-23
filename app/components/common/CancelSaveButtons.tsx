import React from 'react';
import PropTypes from 'prop-types';

import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import AddPhotoIcon from '@material-ui/icons/AddAPhoto';
import Fab from '@material-ui/core/Fab';

interface CancelSaveButtonsProps {
  clickAddPhoto: React.MouseEventHandler<{}>;
  clickCancel: React.MouseEventHandler<{}>;
  clickSave: React.MouseEventHandler<{}>;
  showButtons: boolean;
  mini?: boolean;
}

export default function CancelSaveButtons(props: CancelSaveButtonsProps): JSX.Element | null {
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

  const size = mini ? 'small' : 'medium';

  return (
    <h2 className="vcenter">
      <div style={{ textAlign: 'right' }}>
        {clickAddPhoto
          && (
          <Fab
            color="secondary"
            onClick={clickAddPhoto}
            size={size}
            title="Upload Photo"
          >
            <AddPhotoIcon />
          </Fab>
          )}

        <Fab
          color="secondary"
          onClick={clickCancel}
          size={size}
          style={{ marginLeft: '10px' }}
          title="Cancel"
        >
          <ClearIcon />
        </Fab>

        <Fab
          color="primary"
          onClick={clickSave}
          size={size}
          style={{ marginLeft: '10px' }}
          title="Save"
        >
          <DoneIcon />
        </Fab>
      </div>
    </h2>
  );
}

CancelSaveButtons.propTypes = {
  clickAddPhoto: PropTypes.func,
  clickCancel: PropTypes.func.isRequired,
  clickSave: PropTypes.func.isRequired,
  showButtons: PropTypes.bool.isRequired,
  mini: PropTypes.bool,
};

CancelSaveButtons.defaultProps = {
  clickAddPhoto: null,
  mini: false,
};
