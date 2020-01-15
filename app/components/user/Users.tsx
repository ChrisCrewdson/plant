// Used to show a list of users.
// Url: /users

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import utils from '../../libs/utils';
import Base from '../base/Base';
import { PlantStateTree } from '../../../lib/types/react-common';

const { makeSlug } = utils;

export default function Users(): JSX.Element {
  const locations = useSelector((state: PlantStateTree) => state.locations);
  const users = useSelector((state: PlantStateTree) => state.users);

  /**
   * Render the users
   * @param user - user is from the users collection and not the loggedIn user
   */
  const renderUser = (user: UiUsersValue): JSX.Element => {
    const { _id, name: userName, locationIds } = user;
    let link = `/locations/${makeSlug(userName)}/${_id}`;

    if (locationIds.length === 1) {
      if (locations) {
        const [firstLocationId] = locationIds;
        const singleLocation = locations[firstLocationId];
        if (singleLocation) {
          link = `/location/${makeSlug(singleLocation.title)}/${firstLocationId}`;
        }
      }
    }

    return (
      <div key={_id} style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          style={{ margin: '20px' }}
          to={link}
        >
          <span>
            {userName}
          </span>
        </Link>
      </div>
    );
  };

  const renderUsers = (): JSX.Element[] | null => {
    const userIds = Object.keys(users);
    if (userIds.length) {
      return userIds.map((userId) => renderUser(users[userId]));
    }
    return null;
  };

  return (
    <Base>
      <div>
        {renderUsers()}
      </div>
    </Base>
  );
}
