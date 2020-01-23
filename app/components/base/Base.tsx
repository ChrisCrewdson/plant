import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Base(props: any): JSX.Element {
  const { children } = props;
  return (
    <div className="page">
      <Navbar />
      <div id="main">
        {children}
      </div>
      <Footer />
    </div>
  );
}

Base.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.object.isRequired,
};
