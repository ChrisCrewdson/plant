// Used to show a list of plants for a user.
// Url: /plants/<optional-user-id>

import {Link} from 'react-router';
import Base from '../Base';
// import PlantActions from '../../actions/PlantActions';
import PlantItem from './PlantItem';
// import PlantStore from '../../stores/PlantStore';
import React from 'react';
import store from '../../store';
import GridList from 'material-ui/lib/grid-list/grid-list';

export default class Plants extends React.Component {

  componentWillMount() {
    const state = store.getState();
    this.setState(state);
    this.unsubscribe = store.subscribe(this.onChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const state = store.getState();
    this.setState(state);
  }

  render() {
    var {
      user = {},
      plants = []
    } = this.state || {};


    const tileElements = plants.map(plant => <PlantItem
        {...plant}
        name={user.name}
      />
    );

    const gridListStyle = {width: 500, height: 400, overflowY: 'auto', marginBottom: 24};

    return (
      <Base>
        <h2 style={{textAlign: 'center'}}>{user.name} Plant List ({plants.length})</h2>
        {plants.length === 0 &&
          <div className='plant-item-list'>
              <div className='addFirstClassBtn'>
                <Link className='btn btn-primary' to='/plant'>Add your first plant</Link>
              </div>
          </div>
        }

        {plants.length > 0 &&
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around'}}>
            <GridList
              cellHeight={200}
              style={gridListStyle}
              >
              {tileElements}
            </GridList>
          </div>
        }

      </Base>
    );
  }
}
