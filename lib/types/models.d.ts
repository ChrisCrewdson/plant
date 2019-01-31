// Generic definitions that apply to multiple models.
// For specific models see the model-<name>.d.ts file.

// The model-<name>.d.ts files should follow a specific pattern where the shapes
// for the DB are defined at the top, then the Biz layer and then the Ui layer.
// Each shape will build on and change the previous shape.

declare type DbShape = DbLocation | DbNote | DbPlant;

declare type DbCollectionName = 'user' | 'plant' | 'note' | 'location';
