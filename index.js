'use strict';

const express = require('express');
const app = express();
const port = 8010;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

const https = require('https');
const fs = require('fs');

db.serialize(() => {
  buildSchemas(db);

  const app = require('./src/app')(db);

  // app.listen(port, () => console.log(`App started and listening on port ${port}`));
  https.createServer({
    key: fs.readFileSync('./certificates/key.pem'),
    cert: fs.readFileSync('./certificates/cert.pem'),
    passphrase: 'password123',
  }, app)
      .listen(port, () => console.log(`App started and listening on port ${port}`));
});
