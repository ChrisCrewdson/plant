const actions = require('../../actions');
const Paper = require('material-ui/Paper').default;
const React = require('react');
const EditDeleteButtons = require('../common/EditDeleteButtons');
const moment = require('moment');
const LinkIcon = require('material-ui/svg-icons/content/link').default;
const utils = require('../../libs/utils');
const Markdown = require('../common/Markdown');
const NoteReadMetrics = require('./NoteReadMetrics');
const PropTypes = require('prop-types');

class NoteRead extends React.PureComponent {
  static renderImages({ images }) {
    if (images && images.length) {
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
      <div key={image.id}>
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
    const { id, ext } = image;
    const folder = process.env.NODE_ENV === 'production' ? 'up' : 'test';
    const { PLANT_IMAGE_CACHE: imageCache = '' } = process.env;
    return `//${imageCache}i.plaaant.com/${folder}/${size}/${id}${ext && ext.length ? '.' : ''}${ext}`;
  }

  static buildImageSrc(image) {
    const sizes = image.sizes || [];
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

    const sizes = image.sizes || [];
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
      this.props.dispatch(actions.deleteNoteRequest(this.props.note._id));
    } else {
      this.setState({ showDeleteConfirmation: false });
    }
  }

  editNote() {
    const note = {
      ...this.props.note,
      date: utils.intToString(this.props.note.date),
      isNew: false,
    };
    const { plant } = this.props;
    this.props.dispatch(actions.editNoteOpen({ plant, note }));
  }

  render() {
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

    const date = utils.intToMoment(note.date);

    const noteDate = date.format('DD-MMM-YYYY') +
      (date.isSame(moment(), 'day')
        ? ' (today)'
        : ` (${date.from(moment().startOf('day'))})`);
    const { _id: noteId } = note;

    return (
      <Paper key={noteId} style={paperStyle} zDepth={1}>
        <div id={noteId}>
          <a href={`?noteid=${noteId}#${noteId}`}>
            <LinkIcon />
          </a>
        </div>
        <h5>{noteDate}</h5>
        <Markdown markdown={note.note} />
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
}

NoteRead.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userCanEdit: PropTypes.bool.isRequired,
  note: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.number.isRequired,
  }).isRequired,
  plant: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

module.exports = NoteRead;
