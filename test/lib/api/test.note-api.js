import _ from 'lodash';
import {makeCouchId} from '../../../app/libs/utils';
import * as helper from '../../helper';
import assert from 'assert';
import constants from '../../../app/libs/constants';

import d from 'debug';
const debug = d('plant:test.note-api');

describe('note-api', function() {
  this.timeout(10000);

  before('it should start the server and setup auth token', done => {
    helper.startServerAuthenticated((err) => {
      assert(!err);
      done();
    });
  });

  const initialPlant = {
    title: 'Plant Title',
    // _id: makeCouchId(),
    userId: makeCouchId(),
  };
  let plantId;

  const initialNote = {
    note: 'This is a note',
    date: new Date()
  };
  let noteId;

  before('it should create a plant to attach a note to', (done) => {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: initialPlant,
      json: true,
      url: '/api/plant'
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      // response should look like:
      // { ok: true,
      // id: '500147d5b68746efa2cc18510d4663a6',
      // rev: '1-bbeb5b8c4a14d2ff9008a4c818443bf7' }
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert(response.ok);
      assert(constants.uuidRE.test(response.id));
      assert(_.startsWith(response.rev, '1-'));

      plantId = response.id;
      initialNote.plantIds = [plantId];

      done();
    });
  });

  it('should fail to create a note document if user is not authenticated', (done) => {
    const reqOptions = {
      method: 'POST',
      authenticate: false,
      body: initialNote,
      json: true,
      url: '/api/note'
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      debug(response);
      debug('httpMsg.statusCode:', httpMsg.statusCode);

      assert(!error);
      assert.equal(httpMsg.statusCode, 401);
      assert(response);
      assert.equal(response.error, `Not Authenticated`);

      done();
    });
  });

  it('should fail server validation if note is missing', (done) => {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: {...initialNote, note: ''},
      json: true,
      url: '/api/note'
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      debug(response);
      // response should look like:
      // { plantIds: [ 'Plant ids must be an array' ], note: [ 'Note can\'t be blank' ] }
      assert(!error);
      assert.equal(httpMsg.statusCode, 400);
      assert(response);
      assert.equal(response.note[0], `Note can't be blank`);

      done();
    });
  });

  it('should create a note', (done) => {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: initialNote,
      json: true,
      url: '/api/note'
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      debug(response);
      // response should look like:
      // { ok: true,
      // id: '500147d5b68746efa2cc18510d4663a6',
      // rev: '1-bbeb5b8c4a14d2ff9008a4c818443bf7' }
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert(response.ok);
      assert(constants.uuidRE.test(response.id));
      assert(_.startsWith(response.rev, '1-'));

      noteId = response.id;

      done();
    });
  });

  // TODO: Convert the tests from here onwards to note tests (copied from plant)

  it.skip('should retrieve the just created plant', (done) => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/${plantId}`
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      // response should look like:
      // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
      // _rev: '1-fecae45e9dfdde023b93ebe313ff6ce1',
      // title: 'Plant Title',
      // userId: '241ff27e28c7448fb22c4f6fb2580923',
      // type: 'plant' }
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      // TODO: Will the client ever need the _rev?
      // If not we should strip out at source.
      assert(response.userId);
      assert.equal(response._id, plantId);
      assert.equal(response.title, initialPlant.title);
      assert.equal(response.type, 'plant');

      done();
    });
  });

  it.skip('should fail to retrieve a plant if the id does not exist', (done) => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/does-not-exist`
    };
    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      debug(response);

      assert(!error);
      assert.equal(httpMsg.statusCode, 404);
      assert(response);
      assert.equal(response.error, 'missing');

      done();
    });
  });

  let updatedPlant;
  it.skip('should update the just created plant', (done) => {
    updatedPlant = {
      ...initialPlant,
      title: 'A New Title',
      _id: plantId
    };

    const reqOptions = {
      method: 'PUT',
      authenticate: true,
      body: updatedPlant,
      json: true,
      url: '/api/plant'
    };

    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      // response should look like:
      // { ok: true,
      // id: 'ff3c5edea01a46b19c3d6af759bcda95',
      // rev: '2-57363e3a510dc13b26e53afccf80294c' }
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert(response.ok);
      assert.equal(response.id, plantId);
      // Should now be on revision #2
      assert(_.startsWith(response.rev, '2-'));

      done();
    });
  });

  it.skip('should retrieve the just updated plant', (done) => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/${plantId}`
    };

    helper.makeRequest(reqOptions, (error, httpMsg, response) => {

      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);

      assert(response.userId);
      assert.equal(response._id, plantId);
      assert.equal(response.title, updatedPlant.title);
      assert.equal(response.type, 'plant');

      done();
    });
  });

});
