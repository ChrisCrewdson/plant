import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { Dispatch } from 'redux';

import RaisedButton from 'material-ui/RaisedButton';
import LinkIcon from 'material-ui/svg-icons/content/link';
import Paper from '@material-ui/core/Paper';

import { actionFunc } from '../../actions';
import EditDeleteButtons from '../common/EditDeleteButtons';
import utils from '../../libs/utils';
import Markdown from '../common/Markdown';
import NoteReadMetrics from './NoteReadMetrics';
import { PlantAction } from '../../../lib/types/redux-payloads';

interface NoteReadProps {
  dispatch: Dispatch<PlantAction<any>>;
  userCanEdit: boolean;
  note: UiNotesValue;
  plant: UiPlantsValue;
}

interface NoteReadState {
  showDeleteConfirmation: boolean;
}

export default class NoteRead extends React.PureComponent {
  static buildImageUrl(size: ImageSizeName, image: NoteImage) {
    const { id, ext } = image;
    const folder = process.env.NODE_ENV === 'production' ? 'up' : 'test';
    const { PLANT_IMAGE_CACHE: imageCache = '' } = process.env;
    return `//${imageCache}i.plaaant.com/${folder}/${size}/${id}${ext && ext.length ? '.' : ''}${ext}`;
  }

  static buildImageSrc(image: NoteImage) {
    const sizes = image.sizes || [];
    const size = sizes && sizes.length
      ? sizes[sizes.length - 1].name
      : 'orig';
    return NoteRead.buildImageUrl(size, image);
  }

  static buildImageSrcSet(image: NoteImage) {
    // If the cache is live then don't set a value for srcset
    if (process.env.PLANT_IMAGE_CACHE) {
      return '';
    }

    const sizes = image.sizes || [];
    if (sizes && sizes.length) {
      // <img src="small.jpg" srcset="medium.jpg 1000w, large.jpg 2000w" alt="yah">
      const items = sizes.map((size) => `${NoteRead.buildImageUrl(size.name, image)} ${size.width}w `);
      return items.join(',');
    }
    return '';
  }

  props!: NoteReadProps;

  // eslint-disable-next-line react/state-in-constructor
  state: NoteReadState;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    userCanEdit: PropTypes.bool.isRequired,
    note: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      date: PropTypes.number.isRequired,
      images: PropTypes.array,
      note: PropTypes.string,
      showImages: PropTypes.bool,
    }).isRequired,
    plant: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  constructor(props: NoteReadProps) {
    super(props);
    this.checkDelete = this.checkDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.editNote = this.editNote.bind(this);
    // eslint-disable-next-line react/state-in-constructor
    this.state = { showDeleteConfirmation: false };
  }

  /**
   * Called after user clicks on delete
   */
  checkDelete() {
    this.setState({ showDeleteConfirmation: true });
  }

  /**
   * Called after user confirms or cancels a delete action
   */
  confirmDelete(yes: boolean) {
    if (yes) {
      const { dispatch, note: { _id } } = this.props;
      dispatch(actionFunc.deleteNoteRequest(_id));
    } else {
      this.setState({ showDeleteConfirmation: false });
    }
  }

  editNote() {
    const { note: propNote, dispatch } = this.props;
    const note = {
      ...propNote,
      date: utils.intToString(propNote.date),
      isNew: false,
    };
    const { plant } = this.props;
    dispatch(actionFunc.editNoteOpen({ plant, note }));
  }

  static renderImage(image: NoteImage) {
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

  renderImages({ images, showImages, _id }: UiNotesValue) {
    if (images && images.length) {
      if (showImages) {
        return images.map((image) => NoteRead.renderImage(image));
      }

      const label = `Show ${images.length} image${images.length > 1 ? 's' : ''}`;

      const { dispatch } = this.props;

      return (
        <div>
          <RaisedButton
            label={label}
            onMouseUp={() => dispatch(actionFunc.showNoteImages(_id))}
            primary
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const paperStyle = {
      padding: 20,
      width: '100%',
      margin: 20,
      display: 'inline-block',
    };

    const {
      showDeleteConfirmation,
    } = this.state;

    const {
      userCanEdit,
      note,
    } = this.props;

    const images = this.renderImages(note);

    const date = utils.intToMoment(note.date);

    const noteDate = date.format('DD-MMM-YYYY')
      + (date.isSame(moment(), 'day')
        ? ' (today)'
        : ` (${date.from(moment().startOf('day'))})`);
    const { _id: noteId } = note;

    return (
      <Paper key={noteId} style={paperStyle} elevation={5}>
        <div id={noteId}>
          <a href={`?noteid=${noteId}#${noteId}`}>
            <LinkIcon />
          </a>
        </div>
        <h5>
          {noteDate}
        </h5>
        <Markdown markdown={note.note || ''} />
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
