// Wrapper for the Raised Button to make it toggle for the Plants
// that are associated with a note.
// TODO: Make this a generic ToggleRaisedButton component
//       and move it to the common folder.
import React from 'react';
import PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';

interface NoteAssocPlantToggleButtonProps {
  _id: string;
  label: React.ReactNode;
  primary: boolean;
  secondary: boolean;
  style: React.CSSProperties;
  toggleFunc: (id: string) => void;
}

export default class NoteAssocPlantToggleButton extends React.PureComponent {
  props!: NoteAssocPlantToggleButtonProps;

  static propTypes = {
    _id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    primary: PropTypes.bool.isRequired,
    secondary: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    toggleFunc: PropTypes.func.isRequired,
  };

  constructor(props: NoteAssocPlantToggleButtonProps) {
    super(props);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { toggleFunc, _id } = this.props;
    toggleFunc(_id);
  }

  render() {
    const {
      label,
      primary,
      secondary,
      style,
    } = this.props;

    return (
      <RaisedButton
        label={label}
        onClick={this.toggle}
        primary={primary}
        secondary={secondary}
        style={style}
      />
    );
  }
}
