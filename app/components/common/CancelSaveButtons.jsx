const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const ClearIcon = require('material-ui/svg-icons/content/clear').default;
const DoneIcon = require('material-ui/svg-icons/action/done').default;
const AddPhotoIcon = require('material-ui/svg-icons/image/add-a-photo').default;
const PropTypes = require('prop-types');

/**
 * @param {CancelSaveButtonsProps} props
 */
function cancelSaveButtons(props) {
  const {
    showButtons,
  } = /** @type {CancelSaveButtonsProps} */ (props);

  if (!showButtons) {
    return null;
  }

  const {
    clickAddPhoto,
    clickCancel,
    clickSave,
    mini,
  } = /** @type {CancelSaveButtonsProps} */ (props);

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

module.exports = cancelSaveButtons;
