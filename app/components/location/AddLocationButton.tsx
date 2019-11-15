import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import { AddPlantButtonProps } from '../common/AddPlantButton';

export default function addLocationButton(props: AddPlantButtonProps) {
  const {
    mini,
    show,
    style,
  } = props;

  if (!show) {
    return null;
  }

  const size = mini ? 'small' : 'medium';

  return (
    <Link to="/location">
      <Fab
        title="Add Location"
        size={size}
        style={style}
      >
        <AddIcon />
      </Fab>
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
