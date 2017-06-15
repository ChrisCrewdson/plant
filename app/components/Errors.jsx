
const React = require('react');
const PropTypes = require('prop-types');

function errorHelper(props = {}) {
  let { errors } = props;
  if (!errors || !errors.length) {
    return null;
  }

  if (typeof errors === 'string') {
    errors = [errors];
  }

  return (
    <div className="btn btn-danger" style={{ margin: 10 }}>
      {
        errors.map(error => (<div key={error}>{error}</div>))
      }
    </div>
  );
}

errorHelper.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
};

errorHelper.defaultProps = {
  errors: [],
};

module.exports = errorHelper;
