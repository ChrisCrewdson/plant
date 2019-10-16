// Used to add a note to a plant

const Paper = require('material-ui/Paper').default;
const React = require('react');
const Dropzone = require('react-dropzone').default;
const LinearProgress = require('material-ui/LinearProgress').default;
const CircularProgress = require('material-ui/CircularProgress').default;
const PropTypes = require('prop-types');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;

const CancelSaveButtons = require('../common/CancelSaveButtons');
const InputComboText = require('../common/InputComboText');
const { actionFunc } = require('../../actions');
const utils = require('../../libs/utils');
const NoteAssocPlant = require('./NoteAssocPlant');
const NoteEditMetrics = require('./NoteEditMetrics').default;
const validators = require('../../models');

const { note: noteValidator } = validators;

/** @type {React.CSSProperties} */
const paperStyle = {
  padding: 20,
  width: '100%',
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
};

/** @type {React.CSSProperties} */
const textAreaStyle = {
  textAlign: 'left',
};

/** @type {React.CSSProperties} */
const textFieldStyle = {
  marginLeft: 20,
  textAlign: 'left',
};

/** @type {React.CSSProperties} */
const dropZoneStyle = {
  backgroundColor: 'beige',
  borderColor: 'khaki',
  borderStyle: 'solid',
  borderWidth: '3px',
  height: '40px',
  width: '100%',
};

/** @type {React.CSSProperties} */
const dropZoneActiveStyle = {
  backgroundColor: 'darkseagreen',
  borderColor: 'tan',
};

class NoteEdit extends React.PureComponent {
  /**
   * @param {NoteEditProps} props
   */
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
    const { dispatch } = /** @type {NoteEditProps} */ (this.props);
    dispatch(actionFunc.editNoteClose());
  }

  /**
   * Change Handler
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  onChange(e) {
    const { dispatch } = /** @type {NoteEditProps} */ (this.props);
    dispatch(actionFunc.editNoteChange({
      [e.target.name]: e.target.value,
    }));
  }

  /**
   * @param {File[]} acceptedFiles
   * @param {File[]} rejectedFiles
   * param {React.DragEvent<HTMLElement>}
   */
  onDrop(acceptedFiles, rejectedFiles) {
    if (rejectedFiles && rejectedFiles.length) {
      // eslint-disable-next-line no-console
      console.warn('Some files were rejected', rejectedFiles);
    }
    this.saveFiles(acceptedFiles);
  }

  /**
   * @type {React.MouseEventHandler<{}>}
   */
  onOpenClick() {
    // @ts-ignore - TODO: Come back to this.
    this.dropzone.open();
  }

  cancel() {
    const { dispatch } = /** @type {NoteEditProps} */ (this.props);
    dispatch(actionFunc.editNoteClose());
  }

  /**
   * @param {File[]=} files
   */
  saveNote(files) {
    const {
      dispatch, interimNote: propInterimNote, postSaveSuccess,
    } = /** @type {NoteEditProps} */ (this.props);
    const interimNote = /** @type {UiInterimNote} */ (seamless.asMutable(propInterimNote, {
      deep: true,
    }));

    interimNote._id = interimNote._id || utils.makeMongoId();
    interimNote.date = utils.dateToInt(interimNote.date);

    try {
      const note = noteValidator(interimNote);
      dispatch(actionFunc.upsertNoteRequest({ note, files }));
      postSaveSuccess();
    } catch (errors) {
      dispatch(actionFunc.editNoteChange({ errors }));
    }
  }

  /**
   * @param {File[]} files
   */
  saveFiles(files) {
    this.saveNote(files);
  }

  /**
   * Change Handler
   * @param {React.MouseEvent<{}>} e
   * @returns {void}
   */
  save(e) {
    this.saveNote();
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const {
      dispatch,
      interimNote,
      locationId,
      plants,
    } = /** @type {NoteEditProps} */ (this.props);
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
          {value !== max
            && (
            <div>
              <h1 style={{ fontSize: 'xx-large' }}>
                {progress}
              </h1>
              <LinearProgress style={linearProgressStyle} mode="determinate" value={value} max={max} />
            </div>
            )}
          {value === max
            && (
            <div style={{ display: 'flex', fontSize: 'xx-large', justifyContent: 'space-between' }}>
              <h1>
Upload complete... Finishing up... Hang on...
              </h1>
              <CircularProgress />
            </div>
            )}
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
    }, /** @type {UiPlants} */ ({}));

    const associatedPlants = (
      <NoteAssocPlant
        dispatch={dispatch}
        error={errors.plantIds}
        plantIds={plantIds}
        plants={plantsAtLocation}
      />
    );

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <Paper
        style={paperStyle}
        zDepth={1}
      >

        <InputComboText
          changeHandler={this.onChange}
          error={errors.date}
          label="Date"
          id="note-date"
          name="date"
          placeholder="MM/DD/YYYY"
          style={textFieldStyle}
          value={date}
        />

        <InputComboText
          changeHandler={this.onChange}
          error={errors.note}
          label="Note"
          id="note-text"
          multiLine
          name="note"
          placeholder="What has happened since your last note?"
          style={textAreaStyle}
          value={note}
        />

        {!!errors.length
          && (
          <div>
            <p className="text-danger col-xs-12">
There were errors. Please check your input.
            </p>
          </div>
          )}

        <CancelSaveButtons
          clickAddPhoto={this.onOpenClick}
          clickSave={this.save}
          clickCancel={this.cancel}
          showButtons
        />

        <Dropzone
          onDrop={this.onDrop}
          accept="image/*"
          ref={(node) => { this.dropzone = node; }}
        >
          {({ getRootProps, getInputProps, isDragActive }) => {
            let styles = { ...dropZoneStyle };
            styles = isDragActive ? { ...styles, ...dropZoneActiveStyle } : styles;
            return (
              <div {...getRootProps()} style={styles}>
                <input {...getInputProps()} />
                <div>Drop images here or tap to select images to upload.</div>
              </div>
            );
          }}
        </Dropzone>

        {associatedPlants}

        <NoteEditMetrics
          dispatch={dispatch}
          error={errors.metrics}
          interimNote={interimNote}
        />

      </Paper>
    );
    /* eslint-enable react/jsx-props-no-spreading */
  }
}

NoteEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interimNote: PropTypes.shape({
    _id: PropTypes.string,
    date: PropTypes.number,
    errors: PropTypes.shape({
      date: PropTypes.string,
      length: PropTypes.number,
      metrics: PropTypes.string,
      note: PropTypes.string,
      plantIds: PropTypes.string,
    }),
    note: PropTypes.string,
    plantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    uploadProgress: PropTypes.shape({
      max: PropTypes.number,
      value: PropTypes.number,
    }),
  }).isRequired,
  locationId: PropTypes.string.isRequired,
  plants: PropTypes.shape({
  }).isRequired,
  postSaveSuccess: PropTypes.func,
};

NoteEdit.defaultProps = {
  postSaveSuccess: () => {},
};

module.exports = NoteEdit;
