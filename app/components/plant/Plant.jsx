// Responsible for showing a single Plant for CRUD operations (this.mode)
// i.e. Create (C), Read (R), Update (U), or Delete (D)
// Url: /plant/slug/<plant-id>
// Unless Create then Url: /plant

import _ from 'lodash';
import {isOwner} from '../../libs/auth-helper';
import * as actions from '../../actions';
import Base from '../Base';
import PlantCreateUpdate from './PlantCreateUpdate';
import PlantRead from './PlantRead';
import React from 'react';
import slug from 'slug';
import store from '../../store';
import uuid from 'node-uuid';

export default class Plant extends React.Component {
  static contextTypes = {
    history: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    // this.onChange = this.onChange.bind(this);
    this.setMode = this.setMode.bind(this);
    this.delete = this.delete.bind(this);
    this.createPlant = this.createPlant.bind(this);
    this.updatePlant = this.updatePlant.bind(this);
  }

  componentWillMount() {
    // TODO: store to move higher to container .jsx and user should be passed in as a prop
    const {
      user = {},
      plants = []
    } = store.getState();
    let _id = _.get(this, 'props.params.id');
    const plant = _.find(plants, p => p._id === _id);
    const mode = _id ? 'read' : 'create';
    _id = _id || uuid.v4();
    this.setState({
      _id,
      isOwner: isOwner(plant, user),
      plant,
      mode
    });

    // if(!plant || plant.summary) {
    //   PlantStore.listen(this.onChange);
    //   // PlantActions.loadOne(_id);
    // }
  }

  componentWillReceiveProps(nextProps) {
    console.log('#1 Plant componentWillReceiveProps', this.props, nextProps);
    if(nextProps.params.id && nextProps.params.slug) {
      // Can not be in create mode - only read or edit mode at this point.
      if(this.state.mode === 'create') {
        console.log('Setting mode to read');
        this.setState({mode: 'read'});
      }
    }
    console.log('#2 Plant componentWillReceiveProps', this.state, store.getState());
  }

  componentWillUnmount() {
    // PlantStore.unlisten(this.onChange);
  }

  // onChange() {
  //   // We get the whole plant store. We only want one plant.
  //   const plant = PlantStore.getPlant(this.props.params.id);
  //   this.setState({plant});
  // }

  setMode(mode) {
    this.setState({mode});
  }

  createPlant(plant) {
    console.log('Plant: createPlant:', plant);
    store.dispatch(actions.addPlant(plant));
    this.setMode('read');
    this.context.history.pushState(null, `/plant/${slug(plant.title)}/${plant._id}`);
  }

  updatePlant(plant) {
    console.log('Plant: updatePlant:', plant);
    store.dispatch(actions.updatePlant(plant));
    this.setMode('read');
    this.context.history.pushState(null, `/plant/${slug(plant.title)}/${plant._id}`);
  }

  delete() {
    store.dispatch(actions.deletePlant(this.state._id));
    // PlantActions.delete(this.state._id);
    // Transition to /plants
    this.context.history.pushState(null, '/plants');
  }

  render() {
    const {
      owner,
      plant,
      mode
    } = this.state || {};

    return (
      <Base>
        {mode === 'read' &&
          <PlantRead
            plant={plant}
            isOwner={owner}
            setMode={this.setMode}
            delete={this.delete}
            />
        }
        {(mode === 'edit' || mode === 'create') &&
          <PlantCreateUpdate
            plant={plant}
            mode={mode}
            setMode={this.setMode}
            save={mode === 'create' ? this.createPlant : this.updatePlant}
            />
        }
      </Base>
    );
  }
}
