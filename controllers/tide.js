const tideprediction = require('@neaps/tide-predictor');
const yaml = require('js-yaml');
const fs   = require('fs');

const getStationList = (req, res, next) => {
  var locations = [];
  try {
    const doc = yaml.load(fs.readFileSync('./data/tidesites.yml', 'utf8'));
    console.log(doc);
    for (const [key, value] of Object.entries(doc)) {
      locations.push({
        "id": value.datafile,
        "description" : value.sitename
      });
    }
  } catch (e) {
    console.log(e);
  }
  res.json(locations);
};

const getStationListWithPos = (req, res, next) => {
  var locations = [];
  try {
    const doc = yaml.load(fs.readFileSync('./data/tidesites.yml', 'utf8'));
    console.log(doc);
    for (const [key, value] of Object.entries(doc)) {
      locations.push({
        "id": value.datafile,
        "description" : value.sitename,
        "lat" : value.latitude,
        "lon" : value.longitude
      });
    }
  } catch (e) {
    console.log(e);
  }
  res.json({"Stations": locations});
};

const getHarmonics = (station) => {
  try {
    const doc = yaml.load(fs.readFileSync('./data/tidesites.yml', 'utf8'));
    // console.log(doc);
    for (const [key, value] of Object.entries(doc)) {
      if (value.datafile == station){
        let fname = './users/assets/'+value.datafile+'.json';
        let rawdata = fs.readFileSync(fname);
        let harm = JSON.parse(rawdata);
        // console.log(fname);
        tidePred = tideprediction(harm, {phaseKey: 'phase',});
        return tidePred;
      }
    }
  } catch (e) {
    console.log(e);
    return None;
  }
  return None;
};

const getCurrHarmonics = (station) => {
  try {
    const doc = yaml.load(fs.readFileSync('./data/tidesites.yml', 'utf8'));
    // console.log(doc);
    for (const [key, value] of Object.entries(doc)) {
      if (value.datafile == station){
        let fname_u = './users/assets/'+value.datafile+'_u.json';
        let fname_v = './users/assets/'+value.datafile+'_v.json';
        let rawdata_u = fs.readFileSync(fname_u);
        let harm_u = JSON.parse(rawdata_u);
        let depth_u=harm_u.shift();

        let tidePred_u = tideprediction(harm_u, {phaseKey: 'phase',});
        
        let rawdata_v = fs.readFileSync(fname_v);
        let harm_v = JSON.parse(rawdata_v);
        let depth_v=harm_v.shift();
        // console.log(fname);
        let tidePred_v = tideprediction(harm_v, {phaseKey: 'phase',});
        return [tidePred_u, tidePred_v, depth_u, depth_v];
      }
    }
  } catch (e) {
    console.log(e);
    return None;
  }
  return None;
};

const getCurrentJson = (req, res, next) => {
  var tidepred_u, tidepred_v;
  let station = req.query.stationid;
  // Get document, or throw exception on error
  var startDate = new Date(req.query.startdate);
  var endDate = new Date(req.query.enddate);
  var tmp;
  try {
    tmp = getCurrHarmonics(station);
    tidepred_u = tmp[0].getTimelinePrediction({
        start: startDate,
        end: endDate,
        timeFidelity: 10*60*60
    });
    tidepred_v = tmp[1].getTimelinePrediction({
        start: startDate,
        end: endDate,
        timeFidelity: 10*60*60
    });
  } catch (e) {
    console.log(e);
  }
  res.send({"curr_u": tidepred_u, "depth_u": tmp[2].depth, "curr_v": tidepred_v, "depth_v": tmp[3].depth});
};


const getTideJson = (req, res, next) => {
  var tidepred;
  let station = req.query.stationid;
  // Get document, or throw exception on error
  var startDate = new Date(req.query.startdate);
  var endDate = new Date(req.query.enddate);
  var csv = "";
  var tideres;
  try {
    tidePred = getHarmonics(station);
    tideres = tidePred.getTimelinePrediction({
        start: startDate,
        end: endDate,
        timeFidelity: 10*60*60
    });
  } catch (e) {
    console.log(e);
  }
  res.send(tideres);
};

// eg : http://localhost:3001/stations/table?stationid=grindavik&startdate=2022-01-01&enddate=2022-12-01
const getTideTable = (req, res, next) => {
  var tidepred;
  let station = req.query.stationid;
  // Get document, or throw exception on error
  var startDate = new Date(req.query.startdate);
  var endDate = new Date(req.query.enddate);
  var csv = "";
  try {
    tidePred = getHarmonics(station);
    var highLow = tidePred.getExtremesPrediction({ // To calculate high/low tide
      start: startDate,
      end: endDate,
      labels: {
        //optional human-readable labels
        high: 'High tide',
        low: 'Low tide',
      },
    });
    csv = getCSVForBangle(highLow);
  } catch (e) {
    console.log(e);
  }
  res.send(csv);
};


const getCSVForBangle = (hl) => {
  // console.log("Tides : ");
  // console.log(hl);
  // console.log("**********");
  let lat0=-2.3*100;

  filestr = [];
  for (key in hl){
    entry = hl[key];
    line = [entry['time'].getTime(), Math.trunc(entry['level']-lat0), entry['high']].join(",");
    filestr.push(line);
  }
  myString = "\""+filestr.join(";")+"\"";
  return myString;
};

//export controller functions
module.exports = {
  getStationList,
  getStationListWithPos,
  getTideTable,
  getTideJson,
  getCurrentJson
};
