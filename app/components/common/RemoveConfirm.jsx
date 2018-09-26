const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const ClearIcon = require('material-ui/svg-icons/content/clear').default;
const DeleteForeverIcon = require('material-ui/svg-icons/action/delete-forever').default;
const PropTypes = require('prop-types');

class RemoveConfirm extends React.Component {
  constructor(props = {}) {
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

RemoveConfirm.propTypes = {
  confirmFn: PropTypes.func.isRequired,
  confirmMsg: PropTypes.string.isRequired,
  deleteData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  mini: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

RemoveConfirm.defaultProps = {
  deleteData: {},
  title: '',
};

module.exports = RemoveConfirm;
