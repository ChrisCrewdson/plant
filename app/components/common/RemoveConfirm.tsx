import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import PropTypes from 'prop-types';

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

    return (
      <div style={{ textAlign: 'right' }}>
        <strong className="lead">
          {confirmMsg}
        </strong>
        <FloatingActionButton
          mini={mini}
          onClick={this.cancelDelete}
          secondary
          style={{ marginLeft: '10px' }}
          title="Cancel"
        >
          <ClearIcon />
        </FloatingActionButton>
        <FloatingActionButton
          mini={mini}
          onClick={this.reallyDelete}
          style={{ marginLeft: '10px' }}
          title={`Delete ${title}`}
        >
          <DeleteForeverIcon />
        </FloatingActionButton>
      </div>
    );
  }
}
