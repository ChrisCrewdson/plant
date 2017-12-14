// Used to update a note in a plant

const React = require('react');
const NoteEdit = require('./NoteEdit');
const PropTypes = require('prop-types');

function noteUpdate(props) {
  if (!props.userCanEdit) {
    return null;
  }

  return (
    <NoteEdit
      dispatch={props.dispatch}
      interimNote={props.interimNote}
      plant={props.plant}
      plants={props.plants}
      locationId={props.locationId}
    />
  );
}

noteUpdate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interimNote: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  plant: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  plants: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  locationId: PropTypes.string.isRequired,
};

module.exports = noteUpdate;
