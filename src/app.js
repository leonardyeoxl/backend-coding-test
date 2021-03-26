/* eslint-disable no-invalid-this */
'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./../documentation/swagger.json');

const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({filename: './logs/combined.log'}),
  ],
});

const validateLatLong = function(startLatitude, startLongitude,
    endLatitude, endLongitude) {
  if (startLatitude < -90 || startLatitude > 90 ||
    startLongitude < -180 || startLongitude > 180) {
    logger.error('VALIDATION_ERROR' +
      'Start start latitude and start longitude must be between ' +
      '-90 - 90 and -180 to 180 degrees respectively');
    return {
      status: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Start start latitude and start longitude must be between ' +
        '-90 - 90 and -180 to 180 degrees respectively',
    };
  }

  if (endLatitude < -90 || endLatitude > 90 ||
    endLongitude < -180 || endLongitude > 180) {
    logger.error('VALIDATION_ERROR' +
      'Start end latitude and end longitude must be between ' +
      '-90 - 90 and -180 to 180 degrees respectively');
    return {
      status: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Start start latitude and start longitude must be between ' +
        '-90 - 90 and -180 to 180 degrees respectively',
    };
  }

  return true;
};

const validatePerson = function(riderName, driverName, driverVehicle) {
  if (typeof riderName !== 'string' || riderName.length < 1) {
    logger.error('VALIDATION_ERROR' + 'Rider name must be a non empty string');
    return {
      status: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    };
  }

  if (typeof driverName !== 'string' || driverName.length < 1) {
    logger.error('VALIDATION_ERROR' + 'Driver name must be a non empty string');
    return {
      status: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    };
  }

  if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
    logger.error('VALIDATION_ERROR' +
      'Driver vehicle name must ' +
      'be a non empty string');
    return {
      status: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Driver vehicle name must be a non empty string',
    };
  }

  return {
    status: true,
    error_code: null,
    message: null,
  };
};

const validation = function(latLongValidationResult, PersonValidationResult) {
  if (latLongValidationResult.status === false) {
    return {
      status: false,
      error_code: latLongValidationResult.error_code,
      message: latLongValidationResult.message,
    };
  }

  if (PersonValidationResult.status === false) {
    return {
      status: false,
      error_code: PersonValidationResult.error_code,
      message: PersonValidationResult.message,
    };
  }

  return {
    status: true,
    error_code: null,
    message: null,
  };
};

module.exports = (db) => {
  const getRide = async function(sql, value) {
    return new Promise((resolve, reject) => {
      db.all(sql, value, (err, rows) => {
        if (err) {
          logger.error('SERVER_ERROR' + 'Unknown error');
          reject(err);
        }
        resolve(rows);
      });
    });
  };

  const createRide = async function(res, req) {
    const values = [req.body.start_lat, req.body.start_long,
      req.body.end_lat, req.body.end_long,
      req.body.rider_name, req.body.driver_name,
      req.body.driver_vehicle];
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO Rides' +
        '(startLat, startLong, endLat, endLong, ' +
        'riderName, driverName, driverVehicle) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?)', values, function(err) {
        if (err) {
          logger.error('SERVER_ERROR' + 'Unknown error');
          reject(err);
        }
        resolve(this.lastID);
      });
    }).then(function(lastID) {
      db.all('SELECT * FROM Rides ' +
        'WHERE rideID = ?', [lastID], function(err, rows) {
        if (err) {
          logger.error('SERVER_ERROR' + 'Unknown error');
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        res.send(rows);
      });
    });
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    logger.info('Create rides');

    const latLongValidationResult = validateLatLong(
        startLatitude, startLongitude,
        endLatitude, endLongitude);
    const PersonValidationResult = validatePerson(riderName,
        driverName, driverVehicle);
    const validationResult = validation(latLongValidationResult,
        PersonValidationResult);
    if (validationResult.status === false) {
      return res.send({
        status: false,
        error_code: validationResult.error_code,
        message: validationResult.message,
      });
    }
    await createRide(res, req);
  });

  app.get('/rides/:id/:limit', async (req, res) => {
    try {
      const sql = 'SELECT * FROM Rides ' +
        'WHERE rideID > ?' +
        ' LIMIT ?';
      const rows = await getRide(sql, [req.params.id, req.params.limit]);

      if (rows.length === 0) {
        logger.error('RIDES_NOT_FOUND_ERROR' + 'Could not find any rides');
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.send(rows);
    } catch (err) {
      logger.error('SERVER_ERROR' + 'Unknown error');
      return res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const sql = 'SELECT * FROM Rides ' +
        'WHERE rideID = ?';
      const rows = await getRide(sql, [req.params.id]);

      if (rows.length === 0) {
        logger.error('RIDES_NOT_FOUND_ERROR' + 'Could not find any rides');
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.send(rows);
    } catch (err) {
      logger.error('SERVER_ERROR' + 'Unknown error');
      return res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  return app;
};
