// Used to show a summary tile/card of a Location

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dispatch } from 'redux';

import utils from '../../libs/utils';
import { actionFunc } from '../../actions';
import { PlantAction, ChangeActiveLocationIdPayload } from '../../../lib/types/redux-payloads';

const { makeSlug } = utils;

interface LocationTileProps {
  _id: string;
  dispatch: Dispatch<PlantAction<ChangeActiveLocationIdPayload>>;
  numPlants: number;
  title: string;
}

function onLinkClick(
  _id: string, dispatch: Dispatch<PlantAction<ChangeActiveLocationIdPayload>>,
): void {
  const payload: ChangeActiveLocationIdPayload = { _id };
  dispatch(actionFunc.changeActiveLocationId(payload));
}

export default function LocationTile(props: LocationTileProps): JSX.Element {
  const {
    _id,
    dispatch,
    numPlants,
    title,
  } = props;

  const link = `/location/${makeSlug(title)}/${_id}`;
  const locationTitle = `${title} (${numPlants})`;

  const style = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={style}>
      <Link
        style={{ margin: '20px' }}
        to={link}
        onClick={(): any => { onLinkClick(_id, dispatch); }}
      >
        <span>
          {locationTitle}
        </span>
      </Link>
    </div>
  );
}

LocationTile.propTypes = {
  _id: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  numPlants: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};
