const _ = require('lodash');

const assert = require('assert');
const constants = require('../../../../app/libs/constants');
const helper = require('../../../helper');
const proxyquire = require('proxyquire');

// const logger = require('../../../../lib/logging/logger').create('test.mongo-index');

const proxylog = {
  trace: () => {},
  warn: () => {
    throw new Error('Unexpected warn');
  },
  error: () => {
    throw new Error('Unexpected error');
  },
};

const mongo = proxyquire('../../../../lib/db/mongo', {
  '../../logging/logger': {
    create: () => proxylog,
  },
});

describe('/lib/db/mongo/', () => {
  let userId;
  let fbUser;
  let locationId;

  before('should create a user account by starting the server', (done) => {
    helper.startServerAuthenticated((err, data) => {
      assert(!err);
      fbUser = data.user;
      userId = fbUser._id;
      assert(userId);
      locationId = data.user.locationIds[0]._id;
      assert.equal(typeof userId, 'string');
      Object.freeze(fbUser);
      done();
    });
  });

  describe('user', () => {
    it('should fail to create a user account if there is no object', (done) => {
      mongo.findOrCreateUser(null, (err, body) => {
        assert(err);
        assert.equal(err.message, 'No facebook.id or google.id:');
        assert(!body);

        done();
      });
    });

    it('should fetch the user created in the before setup', (done) => {
      const user = {
        facebook: {
          id: fbUser.facebook.id,
        },
      };
      mongo.findOrCreateUser(user, (err, body) => {
        assert(!err);
        assert(body);
        assert(body._id);
        assert(constants.mongoIdRE.test(body._id));
        assert(constants.mongoIdRE.test(body.locationIds[0]._id));
        assert.deepStrictEqual(body, fbUser);

        done();
      });
    });

    it('should fetch all users', (done) => {
      mongo.getAllUsers((err, body) => {
        assert(!err);
        assert(body);
        assert(_.isArray(body));
        assert.equal(body.length, 1);
        const user = body[0];
        assert(user._id);
        assert(constants.mongoIdRE.test(user._id));

        done();
      });
    });
  });

  describe('plant', () => {
    const plant = {
      name: 'Plant Name',
      plantedOn: 20150701,
    };
    let plantId;

    before(() => {
      plant.locationId = locationId;
    });

    it('should create a plant', (done) => {
      plant.userId = userId;
      assert.equal(typeof plant.userId, 'string');
      mongo.createPlant(plant, userId, (createPlantErr, body) => {
        assert(!createPlantErr);
        assert(body);
        assert(body._id);
        assert.equal(typeof body._id, 'string');
        assert.equal(typeof body.userId, 'string');
        assert.equal(typeof plant.userId, 'object');
        assert.equal(typeof plant.plantedOn, 'number');

        // To be used in next test...
        plantId = body._id;

        done();
      });
    });

    it('should get an existing plant', (done) => {
      mongo.getPlantById(plantId, userId, (err, result) => {
        assert.equal(typeof result.userId, 'string');
        assert(!err);
        assert.equal(result.name, plant.name);
        assert.equal(result.plantedOn, plant.plantedOn);
        assert.equal(result.userId, plant.userId.toString());
        done();
      });
    });

    it('should get existing plants', (done) => {
      mongo.getPlantsByIds([plantId], userId, (err, results) => {
        assert(!err);
        assert(_.isArray(results));
        assert.equal(results.length, 1);
        const result = results[0];
        assert.equal(typeof result.userId, 'string');
        assert.equal(result.name, plant.name);
        assert.equal(result.plantedOn, plant.plantedOn);
        assert.equal(result.userId, plant.userId.toString());
        done();
      });
    });

    it('should update an existing plant with "Set"', (done) => {
      const plantUpdate = {
        name: 'New Name',
        other: 'Other Text',
        _id: plantId,
        userId,
      };

      mongo.updatePlant(plantUpdate, userId, (err, result) => {
        assert(!err);
        assert.deepEqual(result, plantUpdate);
        done();
      });
    });
  });
});
