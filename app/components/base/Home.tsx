import { Link } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import Base from './Base';
import { isUserLoggedIn } from '../../libs/auth-helper';
import { PlantStateTree } from '../../../lib/types/react-common';

export default function Home(): JSX.Element {
  const users = useSelector((state: PlantStateTree) => state.users);
  const user: UiUser | undefined = useSelector((state: PlantStateTree) => state.user);
  const locations = useSelector((state: PlantStateTree) => state.locations);

  const anonHome = (existingUsers: boolean, existingLocations: boolean): JSX.Element => (
    <div id="hero">
      <section>
        <p>
            Improve the health of your trees and plants...
        </p>
      </section>
      <section>
        <p>
            ...measure, compare, and share your awesomeness...
        </p>
      </section>
      {existingUsers
          && (
          <section>
            <Link
              to="/users"
            >
              ...explore Farmers and Gardeners...
            </Link>
          </section>
          )}
      {existingLocations
          && (
          <section>
            <Link
              to="/locations"
            >
              ...explore Orchards, Gardens, Yards and Farms...
            </Link>
          </section>
          )}
      {!isUserLoggedIn(user)
          && (
          <section>
            <div>
              <Link to="/login">
Login to get started
              </Link>
            </div>
          </section>
          )}
    </div>
  );
  const renderUsers = (): JSX.Element => {
    const usersCount = Object.keys(users).length;
    const locationsCount = Object.keys(locations).length;
    return anonHome(!!usersCount, !!locationsCount);
  };

  return (
    <Base>
      <div>
        {renderUsers()}
      </div>
    </Base>
  );
}
