import { UiNotes } from '../db/mongo/model-note';
import { UiInterim } from './model-interim';

export type PlantStore = import('redux').Store<PlantStateTree>;

export interface PlantContext {
  store: PlantStore;
}

/**
 * A finite list of root properties in the Redux state tree for Plant
 */
export interface PlantStateTree {
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plants: UiPlants;
  user: UiUser;
  users: UiUsers;
}
