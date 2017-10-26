// Used to show a summary tile/card of a Location

const actions = require('../../actions');
const React = require('react');
const { Link } = require('react-router-dom');
const utils = require('../../libs/utils');
const PropTypes = require('prop-types');

const { makeSlug } = utils;

function onLinkClick(_id, dispatch) {
  dispatch(actions.changeActiveLocationId({ _id }));
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
        <span>{locationTitle}</span>
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
