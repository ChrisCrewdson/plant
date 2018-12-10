// Used to show a summary tile/card of a Location

const React = require('react');
const { Link } = require('react-router-dom');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');
const { actionFunc } = require('../../actions');

const { makeSlug } = utils;

/**
 *
 * @param {string} _id
 * @param {import('redux').Dispatch} dispatch
 */
function onLinkClick(_id, dispatch) {
  dispatch(actionFunc.changeActiveLocationId({ _id }));
}

function locationTile(props) {
  const {
    _id,
    dispatch,
    numPlants,
    title,
  } = props;

  const link = `/location/${makeSlug(title)}/${_id}`;
  const locationTitle = `${title} (${numPlants})`;

  const style = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={style}>
      <Link
        style={{ margin: '20px' }}
        to={link}
        onClick={() => { onLinkClick(_id, dispatch); }}
      >
        <span>
          {locationTitle}
        </span>
      </Link>
    </div>
  );
}

locationTile.propTypes = {
  _id: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  numPlants: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

module.exports = locationTile;
