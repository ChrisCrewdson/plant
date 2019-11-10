import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';

/**
 * Also using this for AddLocationButtonProps
 */
export interface AddPlantButtonProps {
  mini?: boolean;
  show: boolean;
  style?: object;
}

export default function addPlantButton(props: AddPlantButtonProps) {
  const {
    mini,
    show = false,
    style,
  } = props || {};

  if (!show) {
    return null;
  }

  const size = mini ? 'small' : 'medium';
  const iconStyle = { fontSize: '3em' };

  return (
    <Link to="/plant">
      <Fab
        color="primary"
        size={size}
        style={style}
        title="Add Plant"
      >
        <AddIcon style={iconStyle} />
      </Fab>
    </Link>
  );
}

/* eslint-disable react/no-unused-prop-types */
addPlantButton.propTypes = {
  mini: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
/* eslint-enable react/no-unused-prop-types */

addPlantButton.defaultProps = {
  mini: false,
  style: {},
};
