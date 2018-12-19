
const React = require('react');
const PropTypes = require('prop-types');

/**
 * errorHelper
 * @param {object} props
 * @param {string[]|string} props.errors
 * @returns
 */
function errorHelper(props) {
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
        errors.map(error => (
          <div key={error}>
            {error}
          </div>
        ))
      }
    </div>
  );
}

errorHelper.propTypes = {
  errors: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

errorHelper.defaultProps = {
  errors: [],
};

module.exports = errorHelper;
