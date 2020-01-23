import React from 'react';
import Base from '../base/Base';

export default function Login(): JSX.Element {
  const devLogin = process.env.NODE_ENV !== 'production';
  /* eslint-disable react/jsx-no-target-blank */
  return (
    <Base>
      <div id="hero">
        <div className="home-subheader">
          By logging in or using the site you agree to our
          <a
            href="/terms"
            target="_blank"
          >
            terms &amp; conditions
          </a>
          .
        </div>
        <div className="home-subheader">
          <a href="/auth/facebook">
            <img
              src="/img/facebook-login.png"
              alt="Facebook Login"
            />
          </a>
          <a href="/auth/google">
            <img
              src="/img/google-login.png"
              alt="Google Login"
            />
          </a>
        </div>
        {devLogin
          && (
          <div className="home-subheader">
            <a href="/auth/dev">
              Developer Login
            </a>
          </div>
          )}
      </div>
    </Base>
  );

  /* eslint-enable react/jsx-no-target-blank */
}
