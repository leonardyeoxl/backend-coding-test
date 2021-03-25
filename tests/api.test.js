'use strict';

const request = require('supertest');
const expect = require('chai').expect;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
          .get('/health')
          .expect('Content-Type', /text/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride 01 and return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 2, start_long: 1,
            end_lat: 3, end_long: 4,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride 02 and return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 2, start_long: 1,
            end_lat: 3, end_long: 4,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride 03 and return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 2, start_long: 1,
            end_lat: 3, end_long: 4,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride 04 and return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 2, start_long: 1,
            end_lat: 3, end_long: 4,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a invalid '+
    'start_lat start_long ride return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 91, start_long: 181,
            end_lat: 3, end_long: 4,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a invalid '+
    'end_lat end_long ride and return the inserted ride', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 1, start_long: 1,
            end_lat: 91, end_long: 181,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride and '+
    'return the inserted ride with invalid rider datatype', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 1, start_long: 1,
            end_lat: 1, end_long: 1,
            rider_name: '', driver_name: 'Jim',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Rider name must be a non empty string',
          }, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride and '+
    'return the inserted ride with invalid driver datatype', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 1, start_long: 1,
            end_lat: 1, end_long: 1,
            rider_name: 'John', driver_name: '',
            driver_vehicle: 'Bicycle'})
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Driver name must be a non empty string',
          }, done);
    });
  });

  describe('POST /rides', () => {
    it('should insert a ride and '+
    'return the inserted ride with invalid driver vehicle datatype', (done) => {
      request(app)
          .post('/rides')
          .send({start_lat: 1, start_long: 1,
            end_lat: 1, end_long: 1,
            rider_name: 'John', driver_name: 'Jim',
            driver_vehicle: ''})
          .expect('Content-Type', /json/)
          .expect(200, {
            error_code: 'VALIDATION_ERROR',
            message: 'Driver vehicle name must be a non empty string',
          }, done);
    });
  });

  describe('GET /rides', () => {
    it('should return all rides', async () => {
      const response = await request(app)
          .get('/rides');
      expect(response.status).to.eql(200);
      expect(JSON.parse(response.text).length).to.eql(2);
      expect(JSON.parse(response.text)[0].length).to.eql(2);
      expect(JSON.parse(response.text)[1].length).to.eql(2);
      expect(JSON.parse(response.text)[0][0].rideID).to.eql(1);
      expect(JSON.parse(response.text)[0][1].rideID).to.eql(2);
      expect(JSON.parse(response.text)[1][0].rideID).to.eql(3);
      expect(JSON.parse(response.text)[1][1].rideID).to.eql(4);
    });
  });

  describe('GET /rides/:id', () => {
    it('should return a ride by id', (done) => {
      request(app)
          .get('/rides/1')
          .expect('Content-Type', /json/)
          .expect(200, done);
    });
  });
});
