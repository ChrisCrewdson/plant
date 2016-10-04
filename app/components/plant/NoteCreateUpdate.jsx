// Used to add a note to a plant

const cloneDeep = require('lodash/cloneDeep');
const isEmpty = require('lodash/isEmpty');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const TextField = require('material-ui/TextField').default;
const CancelSaveButtons = require('./CancelSaveButtons');
const Dropzone = require('react-dropzone');
const LinearProgress = require('material-ui/LinearProgress').default;
const CircularProgress = require('material-ui/CircularProgress').default;
const actions = require('../../actions');
const utils = require('../../libs/utils');

const validators = require('../../models');
const validate = validators.note;

class NoteCreateUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.save = this.save.bind(this);
    this.saveFiles = this.saveFiles.bind(this);

  }

  cancel() {
    this.props.dispatch(actions.editNoteClose());
  }

  componentWillMount() {
    this.initState();
  }

  initState() {
    const {images = []} = this.props;
    this.setState({images});
  }

  onChange(e) {
    this.props.dispatch(actions.editNoteChange({
      [e.target.name]: e.target.value
    }));
  }

  onDrop(files) {
    // console.log('Received files: ', files);
    this.saveFiles(files);
  }

  onOpenClick() {
    this.refs.dropzone.open();
  }

  saveNote(files) {
    const interimNote = cloneDeep(this.props.interimNote);

    if(interimNote.plantIds.indexOf(this.props.plant._id) === -1) {
      interimNote.plantIds.push(this.props.plant._id);
    }

    interimNote._id = interimNote._id || utils.makeMongoId();
    interimNote.date = utils.dateToInt(interimNote.date);

    validate(interimNote, (errors, note) => {

      if(errors) {
        console.log('create: Note validation errors:', errors);
        this.props.dispatch(actions.editNoteChange({errors}));
      } else {
        this.props.dispatch(actions.upsertNoteRequest({note, files}));
        if(this.props.postSaveSuccess) {
          this.props.postSaveSuccess();
        }
      }
    });
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
      interimNote = {},
    } = this.props || {};

    if(interimNote.uploadProgress) {
      const linearProgressStyle = {
        width: '100%',
        height: '20px'
      };
      const {value, max} = interimNote.uploadProgress;
      const progress = `Upload progress ${Math.round(value * 100 / max)} %`;
      return (
        <Paper
          style={paperStyle}
          zDepth={1}
        >
          {value !== max &&
            <div>
              <h1 style={{fontSize: 'xx-large'}}>{progress}</h1>
              <LinearProgress style={linearProgressStyle} mode='determinate' value={value} max={max} />
            </div>
          }
          {value === max &&
            <div style={{display: 'flex', fontSize: 'xx-large', justifyContent: 'space-between'}}>
              <h1>{'Upload complete... Finishing up... Hang on...'}</h1>
              <CircularProgress />
            </div>
          }
        </Paper>
      );
    }

    const {
      images = []
    } = this.state || {};

    const {
      date = '',
      errors = {},
      note = ''
    } = interimNote;

    const textAreaStyle = {
      textAlign: 'left'
    };

    const underlineStyle = {
      display: 'none',
    };

    const textFieldStyle = {
      marginLeft: 20,
      textAlign: 'left'
    };

    const imageStyle = {
      maxWidth: '100%',
      padding: '1%'
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

        <TextField
          errorText={errors.date}
          floatingLabelText='Date'
          fullWidth={true}
          hintText={'MM/DD/YYYY'}
          name='date'
          onChange={this.onChange}
          style={textFieldStyle}
          underlineStyle={underlineStyle}
          value={date}
        />

        <TextField
          errorText={errors.note}
          floatingLabelText='Note'
          fullWidth={true}
          hintText='What has happened since your last note?'
          multiLine={true}
          name='note'
          onChange={this.onChange}
          style={textAreaStyle}
          value={note}
        />

        {!isEmpty(errors) &&
          <div>
            <p className='text-danger col-xs-12'>{'There were errors. Please check your input.'}</p>
          </div>
        }

        <CancelSaveButtons
          clickAddPhoto={this.onOpenClick.bind(this)}
          clickSave={this.save}
          clickCancel={this.cancel}
          showButtons={true}
        />

        <Dropzone
          activeStyle={dropZoneActiveStyle}
          onDrop={this.onDrop}
          ref='dropzone'
          style={dropZoneStyle}
        >
          <div>Drop images here or tap to select images to upload.</div>
        </Dropzone>

        {!!images.length &&
          images.map(image => {
            return (
              <div key={image.preview}>
                <img style={imageStyle} src={image.preview} />
              </div>
            );
          })
        }

      </Paper>
    );
  }
}

NoteCreateUpdate.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  images: React.PropTypes.array,
  plant: React.PropTypes.object.isRequired,
  interimNote:  React.PropTypes.shape({
    date: React.PropTypes.string.isRequired,
    errors: React.PropTypes.object,
    note: React.PropTypes.string,
  }),
  postSaveSuccess: React.PropTypes.func,
};

module.exports = NoteCreateUpdate;
