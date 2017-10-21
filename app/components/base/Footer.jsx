const React = require('react');
// const Divider = require('material-ui/Divider').default;
const { Link } = require('react-router-dom');

function footer() {
  return (
    <nav className="navbar navbar-default navbar-fixed-bottom">
      <div className="container-fluid">
        <Link to="/">Home</Link>
        <Link style={{ marginLeft: '10px' }} to="/privacy">Privacy</Link>
        <Link style={{ marginLeft: '10px' }} to="/terms">Terms</Link>
      </div>
    </nav>
  );
}

module.exports = footer;
