// Used to add a note to a plant

import React from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { Dispatch } from 'redux';

import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';

import CancelSaveButtons from '../common/CancelSaveButtons';
import InputComboText from '../common/InputComboText';
import { actionFunc } from '../../actions';
import utils from '../../libs/utils';
import NoteAssocPlant from './NoteAssocPlant';
import NoteEditMetrics from './NoteEditMetrics';
import * as validators from '../../models';
import { PlantAction, UpsertNoteRequestPayload } from '../../../lib/types/redux-payloads';

const { note: noteValidator } = validators;

const paperStyle: React.CSSProperties = {
  padding: 20,
  width: '100%',
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
};

const textAreaStyle: React.CSSProperties = {
  textAlign: 'left',
};

const textFieldStyle: React.CSSProperties = {
  marginLeft: 20,
  textAlign: 'left',
};

const dropZoneStyle: React.CSSProperties = {
  backgroundColor: 'beige',
  borderColor: 'khaki',
  borderStyle: 'solid',
  borderWidth: '3px',
  height: '40px',
  width: '100%',
};

const dropZoneActiveStyle: React.CSSProperties = {
  backgroundColor: 'darkseagreen',
  borderColor: 'tan',
};

interface NoteEditProps {
  dispatch: Dispatch<PlantAction<any>>;
  interimNote: UiInterimNote;
  plants: UiPlants;
  postSaveSuccess: Function;
  locationId: string;
}

export default class NoteEdit extends React.PureComponent {
  props!: NoteEditProps;

  dropzone: any;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    interimNote: PropTypes.shape({
      _id: PropTypes.string,
      date: PropTypes.string,
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

  static defaultProps = {
    postSaveSuccess: (): void => {},
  };

  constructor(props: NoteEditProps) {
    super(props);
    this.cancel = this.cancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onOpenClick = this.onOpenClick.bind(this);
    this.save = this.save.bind(this);
    this.saveFiles = this.saveFiles.bind(this);
  }

  componentWillUnmount(): void {
    const { dispatch } = this.props;
    dispatch(actionFunc.editNoteClose());
  }

  /**
   * Change Handler
   */
  onChange(name: string, value: string): void {
    const { dispatch } = this.props;
    dispatch(actionFunc.editNoteChange({
      [name]: value,
    }));
  }

  onDrop(acceptedFiles: File[], rejectedFiles: File[]): void {
    if (rejectedFiles && rejectedFiles.length) {
      // eslint-disable-next-line no-console
      console.warn('Some files were rejected', rejectedFiles);
    }
    this.saveFiles(acceptedFiles);
  }

  /**
   * @type {React.MouseEventHandler<{}>}
   */
  onOpenClick(): void {
    this.dropzone.open();
  }

  cancel(): void {
    const { dispatch } = this.props;
    dispatch(actionFunc.editNoteClose());
  }

  saveNote(files?: File[]): void {
    const {
      dispatch, interimNote: propInterimNote, postSaveSuccess,
    } = this.props;
    const interimNote: Readonly<BizNote> = produce<BizNote>(
      propInterimNote as unknown as BizNote, (draft: BizNote) => {
        draft._id = draft._id || utils.makeMongoId();
        draft.date = utils.dateToInt(draft.date);
      });

    try {
      const note = noteValidator(interimNote);
      const payload: UpsertNoteRequestPayload = { note, files };
      dispatch(actionFunc.upsertNoteRequest(payload));
      postSaveSuccess();
    } catch (errors) {
      dispatch(actionFunc.editNoteChange({ errors }));
    }
  }

  saveFiles(files: File[]): void {
    this.saveNote(files);
  }

  save(e: React.MouseEvent<{}>): void {
    this.saveNote();
    e.preventDefault();
    e.stopPropagation();
  }

  render(): JSX.Element {
    const {
      dispatch,
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
      const uploadPercent = Math.round((value * 100) / max);
      const progress = `Upload progress ${uploadPercent} %`;
      return (
        <Paper
          style={paperStyle}
          elevation={5}
        >
          {value !== max
            && (
            <div>
              <h1 style={{ fontSize: 'xx-large' }}>
                {progress}
              </h1>
              <LinearProgress
                style={linearProgressStyle}
                value={uploadPercent}
                variant="determinate"
              />
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
    const plantsAtLocation = Object.keys(plants).reduce((acc: UiPlants, plantId) => {
      const plant = plants[plantId];
      const { locationId: locId } = plant;
      if (locId === locationId) {
        acc[plantId] = plant;
      }
      return acc;
    }, {});

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
        elevation={5}
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
          ref={(node): void => { this.dropzone = node; }}
        >
          {({ getRootProps, getInputProps, isDragActive }): JSX.Element => {
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
