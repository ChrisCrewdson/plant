const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const { Link } = require('react-router-dom');
const PropTypes = require('prop-types');

/**
 *
 * @param {AddPlantButtonProps} props
 */
function addPlantButton(props = { show: false }) {
  const {
    mini,
    show,
    style,
  } = props;

  if (!show) {
    return null;
  }

  return (
    <Link to="/plant">
      <FloatingActionButton
        title="Add Plant"
        mini={mini}
        style={style}
      >
        <AddIcon />
      </FloatingActionButton>
    </Link>
  );
}

addPlantButton.propTypes = {
  mini: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

addPlantButton.defaultProps = {
  mini: false,
  style: {},
};

module.exports = addPlantButton;
