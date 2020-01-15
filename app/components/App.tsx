import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { actionFunc } from '../actions';
import { PlantStateTree } from '../../lib/types/react-common';

export default function App(props: any): JSX.Element {
  const dispatch = useDispatch();
  const { children } = props;

  const users = useSelector((state: PlantStateTree) => state.users);
  const locations = useSelector((state: PlantStateTree) => state.locations);

  // TODO: This will cause a problem for a non-initialized site
  // that has zero users and zero locations as these values
  // will be 0 which is falsy.
  const usersCount = Object.keys(users).length;
  const locationsCount = Object.keys(locations).length;
  if (!usersCount) {
    dispatch(actionFunc.loadUsersRequest());
  }

  if (!locationsCount) {
    dispatch(actionFunc.loadLocationsRequest());
  }

  return (
    <div className="react-root">
      {children}
    </div>
  );
}

App.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.object.isRequired,
};
