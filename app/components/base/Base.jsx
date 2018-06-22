const React = require('react');
const PropTypes = require('prop-types');
const Navbar = require('./Navbar');
const Footer = require('./Footer');

function base(props) {
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

module.exports = base;
