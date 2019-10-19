
interface PlantContext {
  store: PlantStore;
}

/**
 * A finite list of root properties in the Redux state tree for Plant
 */
interface PlantStateTree {
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plants: UiPlants;
  user: UiUser;
  users: UiUsers;
}

declare type PlantStore = import('redux').Store<PlantStateTree>;
