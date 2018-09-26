interface UiPlantsNotes {

}

interface UiPlantsValue {
  _id: string;
  notes: Array<UiPlantsNotes>;
}

interface UiPlants {
  [id: string]: UiPlantsValue;
}
