// Used to show a list of plants for a user.
// Url: /plants/<optional-user-id>

import {Link} from 'react-router';
import Base from '../Base';
// import PlantActions from '../../actions/PlantActions';
import PlantItem from './PlantItem';
// import PlantStore from '../../stores/PlantStore';
import React from 'react';
import store from '../../store';
import {isLoggedIn} from '../../libs/auth-helper';
import * as actions from '../../actions';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import EditIcon from 'material-ui/svg-icons/content/add';

export default class Plants extends React.Component {

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.state = store.getState();

    const {
      user = {},
      plants = []
    } = this.state || {};
    if(plants.length === 0 && isLoggedIn()) {
      store.dispatch(actions.loadPlants(user._id));
    }
  }

  componentWillMount() {
    const state = store.getState();
    this.setState(state);
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const state = store.getState();
    this.setState(state);
  }

  renderTitle(user) {
    return (
      <h2 style={{textAlign: 'center'}}>{`${user.name} Plant List`}</h2>
    );
  }

  renderNoPlants(user) {
    return (
      <Base>
        <div>
          {this.renderTitle(user)}
          <div className='plant-item-list'>
              <div className='addFirstClassBtn'>
                <Link className='btn btn-primary' to='/plant'>Add your first plant</Link>
              </div>
          </div>
        </div>
      </Base>
    );
  }

  render() {
    var {
      user = {},
      plants = []
    } = this.state || {};

    if(!plants.length) {
      return this.renderNoPlants(user);
    }

    // Don't send the name into PlantItem to skip the subtitle
    // If all the plants are by the same user then don't need the
    // users name. If the plants are from a search result then send
    // in the name:
    // name={user.name}
    const tileElements = plants.map(plant => <PlantItem
        key={plant._id}
        {...plant}
      />
    );

    return (
      <Base>
        <div>
          {this.renderTitle(user)}
          {tileElements}
          <div style={{float: 'right'}}>
            <Link to='/plant'>
              <FloatingActionButton
                title='Add Plant'
              >
                <EditIcon />
              </FloatingActionButton>
            </Link>
          </div>
        </div>
      </Base>
    );
  }
}
