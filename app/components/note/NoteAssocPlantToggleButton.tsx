// Wrapper for the Raised Button to make it toggle for the Plants
// that are associated with a note.
// TODO: Make this a generic ToggleRaisedButton component
//       and move it to the common folder.
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import MaterialCore from '@material-ui/core';

type NoteAssocPlantToggleButtonType =
  'selected' |
  'alive' |
  'dead';

interface NoteAssocPlantToggleButtonProps {
  _id: string;
  label: React.ReactNode;
  selectState: NoteAssocPlantToggleButtonType;
  style: React.CSSProperties;
  toggleFunc: (id: string) => void;
}

export default class NoteAssocPlantToggleButton extends React.PureComponent {
  props!: NoteAssocPlantToggleButtonProps;

  /**
   * The 3 colors that I settled on for associated a note with plants are:
   * Selected - primary color - blue - this means that the plant is tagged on this note
   * Alive - default color - transparent/white - the plant is not tagged and is alive
   * Dead - secondary color - red/pink/orange - the plant is dead and not tagged.
   */
  colors: Record<NoteAssocPlantToggleButtonType, MaterialCore.PropTypes.Color> = {
    alive: 'default',
    dead: 'secondary',
    selected: 'primary',
  };

  static propTypes = {
    _id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    selectState: PropTypes.string.isRequired,
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
      selectState,
      style,
    } = this.props;
    const color = this.colors[selectState];

    const buttonStyle = { ...style, fontSize: 'medium' };

    return (
      <Button
        onClick={this.toggle}
        color={color}
        size="large"
        style={buttonStyle}
        variant="contained"
      >
        {label}
      </Button>
    );
  }
}
