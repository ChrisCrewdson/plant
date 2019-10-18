import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';

export default function base(props: any) {
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

base.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.object.isRequired,
};
