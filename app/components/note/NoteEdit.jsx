// Used to add a note to a plant

// const isEmpty = require('lodash/isEmpty');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const CancelSaveButtons = require('../common/CancelSaveButtons');
const Dropzone = require('react-dropzone').default;
const InputCombo = require('../common/InputCombo');
const LinearProgress = require('material-ui/LinearProgress').default;
const CircularProgress = require('material-ui/CircularProgress').default;
const actions = require('../../actions');
const utils = require('../../libs/utils');
const NoteAssocPlant = require('./NoteAssocPlant');
const NoteEditMetrics = require('./NoteEditMetrics');
const Immutable = require('immutable');
const PropTypes = require('prop-types');
const validators = require('../../models');

const { note: noteValidator } = validators;

class NoteEdit extends React.Component {
  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);
    this.save = this.save.bind(this);
    this.saveFiles = this.saveFiles.bind(this);
  }

  componentWillMount() {
    this.initState();
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

  initState() {
    const { images } = this.props;
    this.setState({ images });
  }

  cancel() {
    this.props.dispatch(actions.editNoteClose());
  }

  saveNote(files) {
    const interimNote = this.props.interimNote.toJS();

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
    } = this.props;
    const uploadProgress = interimNote.get('uploadProgress');

    if (uploadProgress) {
      const linearProgressStyle = {
        width: '100%',
        height: '20px',
      };
      const value = uploadProgress.get('value');
      const max = uploadProgress.get('max');
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
      images,
    } = this.state || {};

    const date = interimNote.get('date', '');
    const errors = interimNote.get('errors', Immutable.Map());
    const note = interimNote.get('note', '');
    const plantIds = interimNote.get('plantIds').toJS();

    const textAreaStyle = {
      textAlign: 'left',
    };

    const textFieldStyle = {
      marginLeft: 20,
      textAlign: 'left',
    };

    const imageStyle = {
      maxWidth: '100%',
      padding: '1%',
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

    return (
      <Paper
        style={paperStyle}
        zDepth={1}
      >

        <InputCombo
          changeHandler={this.onChange}
          error={errors.get('date')}
          floatingLabelText="Date"
          name="date"
          placeholder="MM/DD/YYYY"
          style={textFieldStyle}
          value={date}
        />

        <InputCombo
          changeHandler={this.onChange}
          error={errors.get('note')}
          floatingLabelText="Note"
          multiLine
          name="note"
          placeholder="What has happened since your last note?"
          style={textAreaStyle}
          value={note}
        />

        {!!errors.size &&
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

        {!!images.length &&
          images.map(image => (
            <div key={image.preview}>
              <img
                style={imageStyle}
                src={image.preview}
                alt="TODO: Add an alt here"
              />
            </div>
          ))
        }

        <NoteAssocPlant
          dispatch={this.props.dispatch}
          error={errors.get('plantIds')}
          plantIds={plantIds}
          plants={this.props.plants.filter(plant => plant.get('userId') === this.props.user.get('_id'))}
        />

        <NoteEditMetrics
          dispatch={this.props.dispatch}
          error={errors.get('metrics')}
          interimNote={interimNote}
        />

      </Paper>
    );
  }
}

NoteEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({
    preview: PropTypes.string.isRequired,
  })),
  interimNote: PropTypes.shape({
    get: PropTypes.func.isRequired,
    toJS: PropTypes.func.isRequired,
  }).isRequired,
  plants: PropTypes.shape({
    get: PropTypes.func.isRequired,
    filter: PropTypes.func.isRequired,
  }).isRequired,
  postSaveSuccess: PropTypes.func,
  user: PropTypes.shape({ // Immutable.js Map
    get: PropTypes.func.isRequired,
  }).isRequired,
};

NoteEdit.defaultProps = {
  postSaveSuccess: () => {},
  images: [],
};

module.exports = NoteEdit;
