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

```
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
- public - a boolean flag which is missing (implied `false`) by default. Indicates if the geo location of these plants can be made public.
- password - an array of objects - allows user with the password access to the geo positions at this location.
  - (expire-)date - date integer (locale based)
  - (expire-)time - time integer (locale based)
  - password - (password hash)

## Plant

- _id (MongoId)
- title - string
- purchasedDate - actually acquired date - integer YYYYMMDD
- plantedDate - an integer YYYYMMDD
- userId - MongoId of the user that created this document
- locationId - MongoId of the corresponding _id in the Location collection

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
- _id
- wuId (unique index) - wu station id e.g. KAZSCOTT53
- stationName - (optional) wu station name e.g. "Paper Street"
- disabled - (optional) - missing default to false
- firstDate - an integer (YYYYMMDD) of first date of data available
- lastDate - an integer (YYYYMMDD) of first date of data available

### Indexes

```
db.station.createIndex({'wuId': 1}, {unique: true, sparse: false, name: 'wuId'})
```
