import {User, Plant} from '../../../lib/db';
import assert from 'assert';
// import d from 'debug';

// const debug = d('plant:test.cloudant');

describe('/db/cloudant/', function() {
  this.timeout(5000);

  var userId;

  describe('/user/', function() {
    it('should create a user account', (done) => {
      const userDB = new User();

      const user = {
        email: 'test@test.com',
        first: 'first',
        last: 'last'
      };

      userDB.findOrCreateUser(user, (err, body) => {

        assert(!err);
        assert(body);
        assert(body._id);
        assert.equal(body.type, 'user');
        assert.equal(body.email, user.email);
        assert.equal(body.first, user.first);

        userId = body._id;

        done();
      });
    });
  });

  describe.only('/plant/', function() {
    const plantDB = new Plant();
    const plant = {
      name: 'Plant Name',
      plantedOn: new Date(2015, 7, 1)
    };

    it('should create a plant', (done) => {

      plantDB.create(userId, plant, (err, body) => {

        assert(!err);
        assert(body);
        assert(body.id);

        plant.id = body.id;

        done();
      });
    });

    it('should get an existing plant', (done) => {

      plantDB.getById(plant.id, (err, result) => {

        assert(!err);
        assert(result);
        assert.equal(result.name, plant.name);
        const plantedOn = new Date(result.plantedOn);
        assert.equal(plantedOn.getTime(), plant.plantedOn.getTime());

        done();
      });
    });

  });

});
