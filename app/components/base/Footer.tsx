import React from 'react';
import { Link } from 'react-router-dom';

export default function footer(): JSX.Element {
  return (
    <nav className="navbar navbar-default navbar-fixed-bottom">
      <div className="container-fluid">
        <Link to="/">
Home
        </Link>
        <Link style={{ marginLeft: '10px' }} to="/privacy">
Privacy
        </Link>
        <Link style={{ marginLeft: '10px' }} to="/terms">
Terms
        </Link>
      </div>
    </nav>
  );
}
