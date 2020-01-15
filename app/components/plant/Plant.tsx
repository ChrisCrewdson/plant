// Responsible for showing a single Plant for CRUD operations (this.mode)
// i.e. Create (C), Read (R), Update (U), or Delete (D)
// Url: /plant/slug/<plant-id>
// Unless Create then Url: /plant

import React from 'react';
import PropTypes from 'prop-types';
import getIn from 'lodash/get';
import { Location } from 'history';
import { match as matcher } from 'react-router';

import CircularProgress from '@material-ui/core/CircularProgress';

import { useSelector, useDispatch } from 'react-redux';
import { canEdit } from '../../libs/auth-helper';
import utils from '../../libs/utils';
import { actionFunc } from '../../actions';
import Base from '../base/Base';
import PlantEdit from './PlantEdit';
import PlantRead from './PlantRead';
import NoteCreate from '../note/NoteCreate';
import { PlantStateTree } from '../../../lib/types/react-common';

const { makeMongoId } = utils;

interface PlantPropsParams {
  id?: string;
}

interface PlantPropsSearchParams {
  get: Function;
}

/**
 * The params and searchParams are available when Plant is created during SSR.
 * The match and location are available when this is created via React Router.
 * I've no idea why I did this. Seems to be a terrible design.
 * TODO: Fix this so that the SSR provides shapes that replicate the React Router interfaces.
 */
interface PlantProps {
  location?: Location;
  match?: matcher<any>;
  params?: PlantPropsParams;
  searchParams?: PlantPropsSearchParams;
}

export default function Plant(props: PlantProps): JSX.Element {
  const dispatch = useDispatch();
  const locations = useSelector((state: PlantStateTree) => state.locations);
  const user = useSelector((state: PlantStateTree) => state.user);
  const users = useSelector((state: PlantStateTree) => state.users);
  const plants = useSelector((state: PlantStateTree) => state.plants);
  const interim = useSelector((state: PlantStateTree) => state.interim);
  const notes = useSelector((state: PlantStateTree) => state.notes) || {};

  const interimNote = getIn(interim, ['note', 'note'], {});
  const interimPlant = getIn(interim, ['plant', 'plant']);

  if (interimPlant) {
    return (
      <PlantEdit
        dispatch={dispatch}
        interimPlant={interimPlant}
        locations={locations}
        user={user}
        users={users}
      />
    );
  }

  const {
    match, params = {}, location: propsLocation, searchParams,
  } = props;
  const plantId = params.id || (match && match.params && match.params.id);

  const search = (propsLocation && propsLocation.search) || '';
  // TODO: This is not available on server:
  const paramsMap = searchParams || new URLSearchParams(search);
  const noteId: string | undefined = paramsMap.get('noteid');

  if (noteId) {
    // If there's a noteid on the query params then this is a link
    // to a particular note so we want to show the images in this note
    // automatically.
    // const { notes = {} } = store.getState();
    const note = notes[noteId] || {};
    if (!note.showImages) {
      dispatch(actionFunc.showNoteImages(noteId));
    }
  }

  // let plant;
  if (plantId) {
    const plant = plants[plantId];
    if (!plant) {
      dispatch(actionFunc.loadPlantRequest({ _id: plantId }));
    }
  } else {
    const { _id: userId = '', activeLocationId } = user;

    const locationIds = (users[userId] && users[userId].locationIds) || []; // as string[];

    // activeLocationId is the one that you last viewed which might not be
    // one that you own/manage. Only set locationId to this if it's one that
    // is in the locationIds list.
    const locationId = (locationIds.some(
      (locId) => locId === activeLocationId) && activeLocationId)
        || locationIds[0];

    dispatch(actionFunc.editPlantOpen({
      plant: {
        _id: makeMongoId(),
        isNew: true,
        locationId,
      },
    }));
    // return null;
  }

  const plant = plants[plantId];

  if (!plant) {
    return (
      <Base>
        <CircularProgress />
      </Base>
    );
  }

  const { locationId } = (interimPlant || plant);
  const location = locations[locationId];
  const loggedInUserId = user && user._id;
  const userCanEdit = canEdit(loggedInUserId, location);

  return (
    <Base>
      <div>
        <div>
          <PlantRead
            dispatch={dispatch}
            interim={interim}
            userCanEdit={userCanEdit}
            locations={locations}
            notes={notes}
            plant={plant}
            plants={plants}
          />
          {plant && plant.title
            && (
            <NoteCreate
              dispatch={dispatch}
              interimNote={interimNote}
              userCanEdit={userCanEdit}
              plant={plant}
              plants={plants}
              locationId={locationId}
            />
            )}
        </div>
      </div>
    </Base>
  );
}

Plant.propTypes = {
  location: PropTypes.shape({
    hash: PropTypes.string,
    pathname: PropTypes.string,
    search: PropTypes.string, // this has query params
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
  searchParams: PropTypes.shape({
    get: PropTypes.func.isRequired,
  }),
};

Plant.defaultProps = {
  match: {
    params: {},
  },
  params: {},
  searchParams: null,
};
