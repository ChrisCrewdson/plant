// Used to add a note to a plant

// const isEmpty = require('lodash/isEmpty');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const CancelSaveButtons = require('../common/CancelSaveButtons');
const Dropzone = require('react-dropzone').default;
const InputComboText = require('../common/InputComboText');
const LinearProgress = require('material-ui/LinearProgress').default;
const CircularProgress = require('material-ui/CircularProgress').default;
const actions = require('../../actions');
const utils = require('../../libs/utils');
const NoteAssocPlant = require('./NoteAssocPlant');
const NoteEditMetrics = require('./NoteEditMetrics');
const PropTypes = require('prop-types');
const validators = require('../../models');
const seamless = require('seamless-immutable').static;

const { note: noteValidator } = validators;

const textAreaStyle = {
  textAlign: 'left',
};

const textFieldStyle = {
  marginLeft: 20,
  textAlign: 'left',
};

const dropZoneStyle = {
  backgroundColor: 'beige',
  borderColor: 'khaki',
  borderStyle: 'solid',
  borderWidth: '3px',
  height: '40px',
  width: '100%',
};

const dropZoneActiveStyle = {
  backgroundColor: 'darkseagreen',
  borderColor: 'tan',
};

class NoteEdit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);
    this.save = this.save.bind(this);
    this.saveFiles = this.saveFiles.bind(this);
  }

  componentWillUnmount() {
    this.props.dispatch(actions.editNoteClose());
  }

  onChange(e) {
    this.props.dispatch(actions.editNoteChange({
      [e.target.name]: e.target.value,
    }));
  }

  onDrop(files) {
    this.saveFiles(files);
  }

  onOpenClick() {
    this.dropzone.open();
  }

  cancel() {
    this.props.dispatch(actions.editNoteClose());
  }

  saveNote(files) {
    const interimNote = seamless.asMutable(this.props.interimNote, { deep: true });

    interimNote._id = interimNote._id || utils.makeMongoId();
    interimNote.date = utils.dateToInt(interimNote.date);

    try {
      const note = noteValidator(interimNote);
      this.props.dispatch(actions.upsertNoteRequest({ note, files }));
      this.props.postSaveSuccess();
    } catch (errors) {
      this.props.dispatch(actions.editNoteChange({ errors }));
    }
  }

  saveFiles(files) {
    this.saveNote(files);
  }

  save(e) {
    this.saveNote();
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    };

    const {
      interimNote,
      locationId,
      plants,
    } = this.props;
    const { uploadProgress } = interimNote;

    if (uploadProgress) {
      const linearProgressStyle = {
        width: '100%',
        height: '20px',
      };
      const { value, max } = uploadProgress;
      const progress = `Upload progress ${Math.round((value * 100) / max)} %`;
      return (
        <Paper
          style={paperStyle}
          zDepth={1}
        >
          {value !== max &&
            <div>
              <h1 style={{ fontSize: 'xx-large' }}>{progress}</h1>
              <LinearProgress style={linearProgressStyle} mode="determinate" value={value} max={max} />
            </div>
          }
          {value === max &&
            <div style={{ display: 'flex', fontSize: 'xx-large', justifyContent: 'space-between' }}>
              <h1>Upload complete... Finishing up... Hang on...</h1>
              <CircularProgress />
            </div>
          }
        </Paper>
      );
    }

    const {
      date = '', errors = {}, note = '', plantIds,
    } = interimNote;

    // TODO: Next line (reduce) should happen in NoteAssocPlant and not here because
    // then NoteAssocPlant can be a PureComponent
    const plantsAtLocation = Object.keys(plants).reduce((acc, plantId) => {
      const plant = plants[plantId];
      const { locationId: locId } = plant;
      if (locId === locationId) {
        acc[plantId] = plant;
      }
      return acc;
    }, {});

    const associatedPlants = (
      <NoteAssocPlant
        dispatch={this.props.dispatch}
        error={errors.plantIds}
        plantIds={plantIds}
        plants={plantsAtLocation}
      />
    );

    return (
      <Paper
        style={paperStyle}
        zDepth={1}
      >

        <InputComboText
          changeHandler={this.onChange}
          error={errors.date}
          floatingLabelText="Date"
          id="note-date"
          name="date"
          placeholder="MM/DD/YYYY"
          style={textFieldStyle}
          value={date}
        />

        <InputComboText
          changeHandler={this.onChange}
          error={errors.note}
          floatingLabelText="Note"
          id="note-text"
          multiLine
          name="note"
          placeholder="What has happened since your last note?"
          style={textAreaStyle}
          value={note}
        />

        {!!errors.length &&
          <div>
            <p className="text-danger col-xs-12">There were errors. Please check your input.</p>
          </div>
        }

        <CancelSaveButtons
          clickAddPhoto={this.onOpenClick}
          clickSave={this.save}
          clickCancel={this.cancel}
          showButtons
        />

        <Dropzone
          activeStyle={dropZoneActiveStyle}
          onDrop={this.onDrop}
          accept="image/*"
          ref={(node) => { this.dropzone = node; }}
          style={dropZoneStyle}
        >
          <div>Drop images here or tap to select images to upload.</div>
        </Dropzone>

        {associatedPlants}

        <NoteEditMetrics
          dispatch={this.props.dispatch}
          error={errors.metrics}
          interimNote={interimNote}
        />

      </Paper>
    );
  }
}

NoteEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interimNote: PropTypes.shape({
    note: PropTypes.string,
  }).isRequired,
  plants: PropTypes.shape({
  }).isRequired,
  postSaveSuccess: PropTypes.func,
  locationId: PropTypes.string.isRequired,
};

NoteEdit.defaultProps = {
  postSaveSuccess: () => {},
};

module.exports = NoteEdit;
