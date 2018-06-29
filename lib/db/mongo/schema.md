# Collection Schema

## User

- _id (MongoId)
- facebook - facebook OAuth info
- google - google OAuth info
- name
- email
- createdAt
- updatedAt

### Indexes

```javascript
db.user.createIndex({'facebook.id': 1}, {unique: true, sparse: true, name: 'facebookId'})
db.user.createIndex({'google.id': 1}, {unique: true, sparse: true, name: 'googleId'})
db.user.createIndex({'email': 1}, {unique: true, sparse: true, name: 'email'})
```

## Location

- _id (MongoId)
- createdBy - MongoId of the user that created this document
- members (object of user roles) each object:
  - key (MongoId string) of user in user collection
  - value (string) - one of 'owner', 'manager'
- title (name of the location)
- loc (an Object - Geo location of the Location)
  - type: 'Point'
  - coordinates: {
    "0": Floating Point Number - longitude,
    "1": Floating Point Number - latitude,
  }
- stations (object of weather stations)
  - `<wu-station-id>` - a stationId conforming to WU
    - name (string) - the name the user gives this weather station
    - enabled (boolean) - unused
- public - a boolean flag which is missing (implied `false`) by default. Indicates if the geo
location of these plants can be made public.
- password - an array of objects - allows user with the password access to the geo positions
at this location.
  - (expire-)date - date integer (locale based)
  - (expire-)time - time integer (locale based)
  - password - (password hash)

## Plant

- _id (MongoId)
- title (string)
- purchasedDate (integer YYYYMMDD)
  - acquire date
- plantedDate (integer YYYYMMDD)
  - date planted
- userId (MongoId)
  - the user that created this document
- locationId (MongoId)
  - Corresponding _id in the Location collection
- franken (object)
  - New field at 6/29/2018 being brainstormed in #1856

## Note

- _id (MongoId)
- date - an integer YYYYMMDD
- note - string 
- plantIds - (array of MongoIds that exist in the Plant collection)
- userId - MongoId of the user that created this document
- images - an array of objects
  - id - MongoId that corresponds to the name of the file in S3
  - ext - file extension e.g. jpg, png
  - originalname - original name of the file when it was uploaded
  - size - size in bytes of the original file
  - sizes - an array of objects
    - name - (string) name of the size, e.g. thumb, sm, md, lg, xl
    - width - (int32) pixels wide, e.g. 100, 500, 1000, 1500, 2000
- metrics - an object with key/value pairs. Values are numbers or boolean.
  - See the app/libs/utils.js file for possible keys in this object and the data types

## Station

- _id (MongoId)
- wuId (unique index) - wu station id e.g. KAZSCOTT53
- stationName - (optional) wu station name e.g. "Paper Street"
- disabled - (optional) - missing default to false
- firstDate - an integer (YYYYMMDD) of first date of data available
- lastDate - an integer (YYYYMMDD) of first date of data available

### Indexes

```javascript
db.station.createIndex({'wuId': 1}, {unique: true, sparse: false, name: 'wuId'});
```

## Variety

- _id (MongoId)
- common - e.g. Washington Navel Orange
- family - e.g. Rutaceae (for citrus), Rosaceae (for apples)
- genus - e.g. Citrus, Malus (apple)
- species - e.g. sinensis (sweet orange)
- sub - e.g. Washington Navel
- description - this should be markdown
- rootstock - true/false flag - true if this is used for rootstock

### Indexes

```javascript
// Need to think about the indexes because difficult to find the data
// needed to create a unique index on genus, species, sub and that will
// slow down the process of adding data to use.
// How does sparse work if some of the fields are missing?
db.variety.createIndex({'genus': 1, 'species': 1, 'sub': 1}, {unique: true, sparse: false, name: 'speciesSub'});
// Might be better to just create a unique on the common name as that is
// what will be typed in to find it and genus/species/sub can be shown
// as extra info to qualify
db.variety.createIndex({'common': 1}, {unique: true, sparse: false, name: 'common'});
```
