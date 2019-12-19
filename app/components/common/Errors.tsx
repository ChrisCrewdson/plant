
import React from 'react';
import PropTypes from 'prop-types';

interface ErrorHelperProps {
  errors: string[] | string;
}

export default function errorHelper(props: ErrorHelperProps): JSX.Element | null {
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
        errors.map((error) => (
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
