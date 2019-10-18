const React = require('react');
const PropTypes = require('prop-types');
const Navbar = require('./Navbar').default;
const Footer = require('./Footer');

/**
 * base
 * @param {object} props
 * @param {object} props.children
 */
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
