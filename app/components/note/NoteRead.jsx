const actions = require('../../actions');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const EditDeleteButtons = require('../common/EditDeleteButtons');
const NoteUpdate = require('./NoteUpdate');
const moment = require('moment');
const LinkIcon = require('material-ui/svg-icons/content/link').default;
const utils = require('../../libs/utils');
const Markdown = require('../common/Markdown');
const NoteReadMetrics = require('./NoteReadMetrics');
const Immutable = require('immutable');
const PropTypes = require('prop-types');

const { List } = Immutable;

class NoteRead extends React.PureComponent {
  static renderImages(note) {
    const images = note.get('images');
    if (images && images.size) {
      return images.map(image => NoteRead.renderImage(image));
    }
    return null;
  }

  static renderImage(image) {
    const imageStyle = {
      maxWidth: '100%',
      padding: '1%',
    };
    return (
      <div key={image.get('id')}>
        <img
          style={imageStyle}
          src={NoteRead.buildImageSrc(image)}
          srcSet={NoteRead.buildImageSrcSet(image)}
          alt="A plant, tree, bush, shrub or vine"
        />
      </div>
    );
  }

  static buildImageUrl(size, image) {
    const id = image.get('id');
    const ext = image.get('ext');
    const folder = process.env.NODE_ENV === 'production' ? 'up' : 'test';
    const imageCache = process.env.PLANT_IMAGE_CACHE || '';
    return `//${imageCache}i.plaaant.com/${folder}/${size}/${id}${ext && ext.length ? '.' : ''}${ext}`;
  }

  static buildImageSrc(image) {
    const sizes = image.get('sizes', List()).toJS();
    const size = sizes && sizes.length
      ? sizes[sizes.length - 1].name
      : 'orig';
    return NoteRead.buildImageUrl(size, image);
  }

  static buildImageSrcSet(image) {
    // If the cache is live then don't set a value for srcset
    if (process.env.PLANT_IMAGE_CACHE) {
      return '';
    }

    const sizes = image.get('sizes', List()).toJS();
    if (sizes && sizes.length) {
      // <img src="small.jpg" srcset="medium.jpg 1000w, large.jpg 2000w" alt="yah">
      const items = sizes.map(size => `${NoteRead.buildImageUrl(size.name, image)} ${size.width}w `);
      return items.join(',');
    }
    return '';
  }

  constructor(props) {
    super(props);
    this.checkDelete = this.checkDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.editNote = this.editNote.bind(this);
  }

  checkDelete() {
    this.setState({ showDeleteConfirmation: true });
  }

  confirmDelete(yes) {
    if (yes) {
      this.props.dispatch(actions.deleteNoteRequest(this.props.note.get('_id')));
    } else {
      this.setState({ showDeleteConfirmation: false });
    }
  }

  editNote() {
    const note = {
      ...this.props.note.toJS(),
      date: utils.intToString(this.props.note.get('date')),
      isNew: false,
    };
    const { plant } = this.props;
    this.props.dispatch(actions.editNoteOpen({ plant, note }));
  }

  renderEdit() {
    return (
      <NoteUpdate
        dispatch={this.props.dispatch}
        userCanEdit={this.props.userCanEdit}
        interimNote={this.props.interim.getIn(['note', 'note'])}
        plant={this.props.plant}
        plants={this.props.plants}
        locationId={this.props.locationId}
      />
    );
  }

  renderRead() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    const {
      showDeleteConfirmation = false,
    } = this.state || {};

    const {
      userCanEdit,
      note,
    } = this.props;

    const images = NoteRead.renderImages(note);

    const date = utils.intToMoment(note.get('date'));

    const noteDate = date.format('DD-MMM-YYYY') +
      (date.isSame(moment(), 'day')
        ? ' (today)'
        : ` (${date.from(moment().startOf('day'))})`);
    const noteId = note.get('_id');

    return (
      <Paper key={noteId} style={paperStyle} zDepth={1}>
        <div id={noteId}>
          <a href={`?noteid=${noteId}#${noteId}`}>
            <LinkIcon />
          </a>
        </div>
        <h5>{noteDate}</h5>
        <Markdown markdown={note.get('note')} />
        <NoteReadMetrics note={note} />
        <EditDeleteButtons
          clickDelete={this.checkDelete}
          clickEdit={this.editNote}
          confirmDelete={this.confirmDelete}
          deleteTitle=""
          showButtons={userCanEdit}
          showDeleteConfirmation={showDeleteConfirmation}
        />
        {images}
      </Paper>
    );
  }

  render() {
    const noteId = this.props.interim.getIn(['note', 'note', '_id']);

    return noteId === this.props.note.get('_id')
      ? this.renderEdit()
      : this.renderRead();
  }
}

NoteRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  interim: PropTypes.shape({
    get: PropTypes.func.isRequired,
    getIn: PropTypes.func.isRequired,
  }).isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  note: PropTypes.shape({
    get: PropTypes.func.isRequired,
    toJS: PropTypes.func.isRequired,
  }).isRequired,
  plant: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }).isRequired,
  plants: PropTypes.shape({
    get: PropTypes.func.isRequired,
    filter: PropTypes.func.isRequired,
  }).isRequired,
  locationId: PropTypes.string.isRequired,
};

module.exports = NoteRead;
