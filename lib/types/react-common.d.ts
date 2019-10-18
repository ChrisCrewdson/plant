
interface OpenGraphMeta {
  property: string;
  content: string;
}

interface ServerSideRenderData {
  html?: string;
  initialState?: PlantStateTree;
  og?: OpenGraphMeta[]; // Facebook Open Graph
  req: import('express').Request;
  title?: string;
}

interface PlantContext {
  store: PlantStore;
}

type PlantStateTreeProps =
  'interim' |
  'locations' |
  'notes' |
  'plants' |
  'user' |
  'users';

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

interface ProfilePropsUserSettings {
  imperial: boolean;
}

interface ProfileProps {
  userSettings: ProfilePropsUserSettings;
}

interface UsersProps {

}
