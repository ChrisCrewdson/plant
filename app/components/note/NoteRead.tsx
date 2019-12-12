import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment';
import { Dispatch } from 'redux';

import Button from '@material-ui/core/Button';
import LinkIcon from '@material-ui/icons/Link';
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

const buildImageUrl = (size: ImageSizeName, image: NoteImage) => {
  const { id, ext } = image;
  const folder = process.env.NODE_ENV === 'production' ? 'up' : 'test';
  const { PLANT_IMAGE_CACHE: imageCache = '' } = process.env;
  return `//${imageCache}i.plaaant.com/${folder}/${size}/${id}${ext && ext.length ? '.' : ''}${ext}`;
};

const buildImageSrc = (image: NoteImage) => {
  const sizes = image.sizes || [];
  const size = sizes && sizes.length
    ? sizes[sizes.length - 1].name
    : 'orig';
  return buildImageUrl(size, image);
};

const buildImageSrcSet = (image: NoteImage) => {
  // If the cache is live then don't set a value for srcset
  if (process.env.PLANT_IMAGE_CACHE) {
    return '';
  }

  const sizes = image.sizes || [];
  if (sizes && sizes.length) {
    // <img src="small.jpg" srcset="medium.jpg 1000w, large.jpg 2000w" alt="yah">
    const items = sizes.map((size) => `${buildImageUrl(size.name, image)} ${size.width}w `);
    return items.join(',');
  }
  return '';
};

export default function noteRead(props: NoteReadProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  /**
   * Called after user clicks on delete
   */
  const checkDelete = () => {
    setShowDeleteConfirmation(true);
  };

  /**
   * Called after user confirms or cancels a delete action
   */
  const confirmDelete = (yes: boolean) => {
    if (yes) {
      const { dispatch, note: { _id } } = props;
      dispatch(actionFunc.deleteNoteRequest(_id));
    } else {
      setShowDeleteConfirmation(false);
    }
  };

  const editNote = () => {
    const { note: propNote, dispatch } = props;
    const note = {
      ...propNote,
      date: utils.intToString(propNote.date),
      isNew: false,
    };
    const { plant } = props;
    dispatch(actionFunc.editNoteOpen({ plant, note }));
  };

  const renderImage = (image: NoteImage) => {
    const imageStyle = {
      maxWidth: '100%',
      padding: '1%',
    };
    return (
      <div key={image.id}>
        <img
          style={imageStyle}
          src={buildImageSrc(image)}
          srcSet={buildImageSrcSet(image)}
          alt="A plant, tree, bush, shrub or vine"
        />
      </div>
    );
  };

  const renderImages = ({ images, showImages, _id }: UiNotesValue) => {
    if (images && images.length) {
      if (showImages) {
        return images.map((image) => renderImage(image));
      }

      const label = `Show ${images.length} image${images.length > 1 ? 's' : ''}`;

      const { dispatch } = props;
      const buttonStyle = { fontSize: 'medium' };

      return (
        <div>
          <Button
            color="primary"
            onMouseUp={() => dispatch(actionFunc.showNoteImages(_id))}
            style={buttonStyle}
            variant="contained"
          >
            {label}
          </Button>
        </div>
      );
    }
    return null;
  };

  const paperStyle = {
    padding: 20,
    width: '100%',
    margin: 20,
    display: 'inline-block',
  };

  const {
    userCanEdit,
    note,
  } = props;

  const images = renderImages(note);

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
        clickDelete={checkDelete}
        clickEdit={editNote}
        confirmDelete={confirmDelete}
        deleteTitle=""
        showButtons={userCanEdit}
        showDeleteConfirmation={showDeleteConfirmation}
      />
      {images}
    </Paper>
  );
}

noteRead.propTypes = {
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
