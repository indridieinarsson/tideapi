const tideprediction = require('@neaps/tide-predictor');
const yaml = require('js-yaml');
const fs   = require('fs');

const getStationList = (req, res, next) => {
  var locations = [];
  try {
    //const doc = yaml.load(fs.readFileSync('/home/indridi/dev/tideapi/users/tidesites.yml', 'utf8'));
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


// eg : http://localhost:3001/stations/table?stationid=grindavik&startdate=2022-01-01&enddate=2022-12-01
const getTideTable = (req, res, next) => {
  var tidepred;
  let station = req.query.stationid;
  // Get document, or throw exception on error
  var startDate = new Date(req.query.startdate);
  var endDate = new Date(req.query.enddate);
  var csv = "";
  try {
    const doc = yaml.load(fs.readFileSync('./data/tidesites.yml', 'utf8'));
    // console.log(doc);
    for (const [key, value] of Object.entries(doc)) {
      if (value.datafile == station){
        let fname = '/home/indridi/dev/tideapi/users/assets/'+value.datafile+'.json';
        let rawdata = fs.readFileSync(fname);
        let harm = JSON.parse(rawdata);
        // console.log(fname);
        tidePred = tideprediction(harm, {phaseKey: 'phase',});

        // console.log("Dates : " + startDate);
        // console.log("Dates : " + endDate);
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
      }
    }
  } catch (e) {
    console.log(e);
  }

  // res.json(["Tony","Lisa","Michael","Ginger","Food"]);
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
  getTideTable
};
