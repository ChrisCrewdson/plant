// Used to show a list of plants for a user.
// Url: /plants/<optional-user-id>

const isEmpty = require('lodash/isEmpty');
const {Link} = require('react-router');
const Base = require('../Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const InputCombo = require('../InputCombo');
const PlantItem = require('./PlantItem');
const React = require('react');
const store = require('../../store');
const {isLoggedIn} = require('../../libs/auth-helper');
const actions = require('../../actions');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const AddIcon = require('material-ui/svg-icons/content/add').default;
const NoteCreate = require('../plant/NoteCreate');

class Plants extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    this.state = {...store.getState().toJS()};
    this.state.filter = '';

    const {
      users = {},
    } = this.state || {};

    if(props.params && props.params.id) {
      // This is the user id for this page.
      const {id: userId} = props.params;
      if(!users[userId]) {
        // For now load all the users if one is missing
        // instead of the single user.
        // store.dispatch(actions.loadUserRequest(userId));
        store.dispatch(actions.loadUsersRequest());
      }
      if(!users[userId] || !users[userId].plantIds) {
        store.dispatch(actions.loadPlantsRequest(userId));
      }
    }
  }

  componentWillMount() {
    const state = {...store.getState().toJS()};
    this.setState(state);
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const state = {...store.getState().toJS()};
    this.setState(state);
  }

  postSaveSuccessCreateNote() {
    store.dispatch(actions.editNoteClose());
  }

  renderTitle(user) {
    return (
      <h2 style={{textAlign: 'center'}}>{`${user.name} Plant List`}</h2>
    );
  }

  addPlantButton() {
    var {
      user: authUser = {},
      users = {},
    } = this.state || {};
    const user = users[this.props.params.id];
    const isOwner = user && (authUser._id === user._id);

    if(isOwner) {
      return (
        <div style={{float: 'right', marginBottom: '60px'}}>
          <Link to='/plant'>
            <FloatingActionButton
              title='Add Plant'
            >
              <AddIcon />
            </FloatingActionButton>
          </Link>
        </div>);
    } else {
      return null;
    }

  }

  renderNoPlants(user) {
    return (
      <Base>
        <div>
          {this.renderTitle(user)}
          <div className='plant-item-list'>
            <div>{'No plants added yet...'}</div>
            {this.addPlantButton()}
          </div>
        </div>
      </Base>
    );
  }

  render() {
    const {
      filter = '',
      plants: allLoadedPlants = {},
      interim = {},
      user: authUser = {},
      users = {},
    } = this.state || {};

    const loggedIn = !!isLoggedIn();

    const user = users[this.props.params.id];
    if(!user) {
      return (
        <Base>
          <div>
            <CircularProgress />
          </div>
        </Base>
      );
    }
    const interimNote = interim && interim.note && interim.note.note;
    const plantCreateNote = interim && interim.note && interim.note.plant;
    const createNote = !!interimNote && interimNote.isNew;

    // console.log('user:', user);
    // console.log('allLoadedPlants:', allLoadedPlants);

    if(createNote && loggedIn) {
      return (
        <Base>
          <div>
            <h4 style={{textAlign: 'center'}}>{`Create a Note for ${plantCreateNote.title}`}</h4>
            <NoteCreate
              dispatch={store.dispatch}
              isOwner={true}
              interimNote={interimNote}
              plant={plantCreateNote}
              postSaveSuccess={this.postSaveSuccessCreateNote}
              user={authUser}
            />
          </div>
        </Base>
      );
    }

    const {plantIds} = user;
    if(isEmpty(plantIds)) {
      return this.renderNoPlants(user);
    }

    const filteredPlantIds = filter
      ? plantIds.filter(plantId => {
        const plant = allLoadedPlants[plantId];
        return !plant || (plant.title || '').toLowerCase().indexOf(filter) >= 0;
      })
      : plantIds;

    const sortedPlantIds = filteredPlantIds.sort((a, b) => {
      const plantA = allLoadedPlants[a];
      const plantB = allLoadedPlants[b];
      if(plantA && plantB) {
        if(plantA.title === plantB.title) {
          return 0;
        }
        return plantA.title > plantB.title ? 1 : -1;
      } else {
        return 0;
      }
    });

    // Don't send the name into PlantItem to skip the subtitle
    // If all the plants are by the same user then don't need the
    // users name. If the plants are from a search result then send
    // in the name:
    // name={user.name}
    const tileElements = sortedPlantIds.reduce((acc, plantId) => {
      const plant = allLoadedPlants[plantId];
      if(plant) {
        acc.push(
          <PlantItem
            key={plant._id}
            dispatch={store.dispatch}
            createNote={this.createNote}
            isOwner={loggedIn && plant.userId === authUser._id}
            plant={plant}
          />
        );
      }
      return acc;
    }, []);

    const filterInput = (<InputCombo
      changeHandler={(e) => this.setState({filter: e.target.value.toLowerCase()})}
      label='Filter'
      placeholder={'Type a plant name to filter...'}
      value={filter}
    />);

    return (
      <Base>
        <div>
          {this.renderTitle(user)}
          {filterInput}
          {tileElements}
          {this.addPlantButton()}
        </div>
      </Base>
    );
  }
}

Plants.propTypes = {
  params:  React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    slug: React.PropTypes.string.isRequired,
  }).isRequired,
};

module.exports = Plants;
