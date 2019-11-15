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

export default class RemoveConfirm extends React.Component {
  props!: RemoveConfirmProps;

  static propTypes = {
    confirmFn: PropTypes.func.isRequired,
    confirmMsg: PropTypes.string.isRequired,
    deleteData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    mini: PropTypes.bool.isRequired,
    title: PropTypes.string,
  };

  static defaultProps = {
    deleteData: {},
    title: '',
  };

  constructor(props: RemoveConfirmProps) {
    super(props);
    this.reallyDelete = this.reallyDelete.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
  }

  reallyDelete() {
    const { confirmFn, deleteData } = this.props;
    confirmFn(true, deleteData);
  }

  cancelDelete() {
    const { confirmFn, deleteData } = this.props;
    confirmFn(false, deleteData);
  }

  render() {
    const { title, mini, confirmMsg } = this.props;

    const size = mini ? 'small' : 'medium';

    return (
      <div style={{ textAlign: 'right' }}>
        <strong className="lead">
          {confirmMsg}
        </strong>
        <Fab
          color="secondary"
          onClick={this.cancelDelete}
          size={size}
          style={{ marginLeft: '10px' }}
          title="Cancel"
        >
          <ClearIcon />
        </Fab>
        <Fab
          color="primary"
          onClick={this.reallyDelete}
          size={size}
          style={{ marginLeft: '10px' }}
          title={`Delete ${title}`}
        >
          <DeleteForeverIcon />
        </Fab>
      </div>
    );
  }
}
