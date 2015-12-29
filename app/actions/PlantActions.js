import _ from 'lodash';
import $ from 'jquery';
import alt from '../libs/alt';
import store from '../store';

function setJwtHeader(request) {
  const loginState = store.getState() || {};
  const jwt = _.get(loginState, 'user.jwt', '');
  if(jwt) {
    request.setRequestHeader('Authorization', 'Bearer ' + jwt);
  }
}

class PlantActions {

  create(plant) {
    $.ajax({
      type: 'POST',
      url: '/api/plant',
      data: plant,
      beforeSend: setJwtHeader,
      // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
      success: (createdPlant) => {
        this.dispatch({plant: createdPlant});
      },
      // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
      error: (jqXHR, textStatus, errorThrown) => {
        console.log('POST /api/plant failure:', errorThrown);
        this.dispatch({error: errorThrown});
      }
    });
  }

  update(plant) {
    $.ajax({
      type: 'PUT',
      url: '/api/plant',
      data: plant,
      beforeSend: setJwtHeader,
      // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
      success: (updatedPlant) => {
        this.dispatch({plant: updatedPlant});
      },
      // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
      error: (jqXHR, textStatus, errorThrown) => {
        console.log('PUT /api/plant failure:', errorThrown);
        this.dispatch({error: errorThrown});
      }
    });
  }

  delete(id) {
    $.ajax({
      type: 'DELETE',
      url: `/api/plant/${id}`,
      beforeSend: setJwtHeader,
      // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
      success: () => {
        this.dispatch(id);
      },
      // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
      error: (jqXHR, textStatus, errorThrown) => {
        console.log('DELETE /api/plant failure:', errorThrown);
        this.dispatch({error: errorThrown});
      }
    });
  }

  loadOne(plantId) {
    $.ajax({
      type: 'GET',
      url: `/api/plant/${plantId}`,
      beforeSend: setJwtHeader,
      // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
      success: (retrievedPlant) => {
        this.dispatch(retrievedPlant);
      },
      // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(`GET /api/plant/${plantId} failure:`, errorThrown);
        this.dispatch({error: errorThrown});
      }
    });
  }

  // Get all the plants a user has created
  load(userId) {
    // this.dispatch();
    $.ajax({
      type: 'GET',
      url: `/api/plants/${userId}`,
      beforeSend: setJwtHeader,
      // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
      success: (payload) => {
        this.dispatch({payload: payload});
      },
      // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
      error: (jqXHR, textStatus, errorThrown) => {
        console.log('PlantAction.loadError:', errorThrown);
        this.dispatch({error: errorThrown});
      }
    });
  }


  addNote(note) {
    $.ajax({
      type: 'POST',
      url: '/api/plant-note',
      data: note,
      beforeSend: this.setJwtHeader,
      success: (createdNote) => {
        this.dispatch(createdNote);
      }
    });
  }

}

export default alt.createActions(PlantActions);
