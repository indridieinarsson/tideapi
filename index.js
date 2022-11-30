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

app.get("/stations/table", tideController.getTideTable);//{

// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
}); 
