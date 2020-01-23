
import React from 'react';
import PropTypes from 'prop-types';

interface ErrorHelperProps {
  errors: string[] | string;
}

export default function ErrorHelper(props: ErrorHelperProps): JSX.Element | null {
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

ErrorHelper.propTypes = {
  errors: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

ErrorHelper.defaultProps = {
  errors: [],
};
