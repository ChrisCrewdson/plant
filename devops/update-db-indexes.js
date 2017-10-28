// Script for setting up the indexes in the plant db

// Connect to DB
// eslint-disable-next-line no-undef
const conn = new Mongo();
const db = conn.getDB('plant');

// user
db.user.createIndex({ 'facebook.id': 1 }, { unique: true, sparse: true, name: 'facebookId' });
db.user.createIndex({ 'google.id': 1 }, { unique: true, sparse: true, name: 'googleId' });
db.user.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email' });

// location
// plant
// note

// station
db.station.createIndex({ wuId: 1 }, { unique: true, sparse: false, name: 'wuId' });

