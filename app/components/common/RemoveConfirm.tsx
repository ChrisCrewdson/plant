import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

interface RemoveConfirmProps {
  confirmFn: Function;
  confirmMsg: string;
  deleteData?: object;
  mini: boolean;
  title?: string;
}

export default function removeConfirm(props: RemoveConfirmProps): JSX.Element {
  const {
    title, mini, confirmMsg, confirmFn, deleteData,
  } = props;

  const reallyDelete = (): void => {
    confirmFn(true, deleteData);
  };

  const cancelDelete = (): void => {
    confirmFn(false, deleteData);
  };

  const size = mini ? 'small' : 'medium';

  return (
    <div style={{ textAlign: 'right' }}>
      <strong className="lead">
        {confirmMsg}
      </strong>
      <Fab
        color="secondary"
        onClick={cancelDelete}
        size={size}
        style={{ marginLeft: '10px' }}
        title="Cancel"
      >
        <ClearIcon />
      </Fab>
      <Fab
        color="primary"
        onClick={reallyDelete}
        size={size}
        style={{ marginLeft: '10px' }}
        title={`Delete ${title}`}
      >
        <DeleteForeverIcon />
      </Fab>
    </div>
  );
}

removeConfirm.propTypes = {
  confirmFn: PropTypes.func.isRequired,
  confirmMsg: PropTypes.string.isRequired,
  deleteData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  mini: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

removeConfirm.defaultProps = {
  deleteData: {},
  title: '',
};
