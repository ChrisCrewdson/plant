interface UiPlantsNotes {

}

interface UiPlantsValue {
  _id: string;
  notes: Array<UiPlantsNotes>;
  locationId: string;
}

interface UiPlants {
  [id: string]: UiPlantsValue;
}
