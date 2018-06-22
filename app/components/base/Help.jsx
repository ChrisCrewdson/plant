const React = require('react');
const Base = require('./Base');

function help() {
  /* eslint-disable react/jsx-no-target-blank */
  return (
    <Base>
      <div className="well">
        <h3 className="well">
Need Help?
        </h3>
        <p>
          {'Please ask your questions on '}
          <a
            target="_blank"
            href="https://www.facebook.com/groups/fruit.trees.anonymous/"
          >
            {'Fruit Trees Anonymous'}
          </a>
          {'.'}
        </p>
      </div>
    </Base>
  );
  /* eslint-enable react/jsx-no-target-blank */
}


module.exports = help;
