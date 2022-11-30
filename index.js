// ./src/index.js
// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const tideprediction = require('@neaps/tide-predictor');
const yaml = require('js-yaml');
const fs   = require('fs');
const tideController = require('./controllers/tide');

// defining the Express app
const app = express();

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.get("/stations/list",  tideController.getStationList);
app.get("/stations/listwithpos",  tideController.getStationListWithPos);

app.get("/stations/table", tideController.getTideTable);
app.get("/stations/tidesjson", tideController.getTideJson);
app.get("/stations/currentsjson", tideController.getCurrentJson);

// starting the server
app.listen(5000, () => {
  console.log('listening on port 5000');
}); 
