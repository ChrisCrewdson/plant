import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';


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
