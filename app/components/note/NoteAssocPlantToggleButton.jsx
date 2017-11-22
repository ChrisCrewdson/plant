// Wrapper for the Raised Button to make it toggle for the Plants
// that are associated with a note.
// TODO: Make this a generic ToggleRaisedButton component
//       and move it to the common folder.
const React = require('react');
const RaisedButton = require('material-ui/RaisedButton').default;
const PropTypes = require('prop-types');

class NoteAssocPlantToggleButton extends React.Component {
  constructor() {
    super();
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.props.toggleFunc(this.props._id);
  }

  render() {
    const {
      _id,
      label,
      primary,
      secondary,
      style,
    } = this.props;

    return (<RaisedButton
      key={_id}
      label={label}
      onClick={this.toggle}
      primary={primary}
      secondary={secondary}
      style={style}
    />);
  }
}

NoteAssocPlantToggleButton.propTypes = {
  _id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  secondary: PropTypes.bool.isRequired,
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  toggleFunc: PropTypes.func.isRequired,
};

module.exports = NoteAssocPlantToggleButton;
