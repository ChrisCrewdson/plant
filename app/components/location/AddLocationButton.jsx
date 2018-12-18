const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const { Link } = require('react-router-dom');
const PropTypes = require('prop-types');

/**
 * @param {AddPlantButtonProps} props
 */
function addLocationButton(props) {
  const {
    mini,
    show,
    style,
  } = props;

  if (!show) {
    return null;
  }

  return (
    <Link to="/location">
      <FloatingActionButton
        title="Add Location"
        mini={mini}
        style={style}
      >
        <AddIcon />
      </FloatingActionButton>
    </Link>
  );
}

addLocationButton.propTypes = {
  mini: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

addLocationButton.defaultProps = {
  mini: false,
  style: {},
};

module.exports = addLocationButton;
