import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function addLocationButton(props: AddPlantButtonProps) {
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
