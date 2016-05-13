// var moment = require("moment");
// var schedule = require('node-schedule');

// var rule = new schedule.RecurrenceRule();
// rule.minute = 1;
// var j = schedule.scheduleJob(rule, function(){
//   console.log('The answer to life, the universe, and everything!');
// });

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi Igsaan. DocWhere is live :D');
});


Parse.Cloud.define("queryGooglePlaceHospitals", function(request, response) {
    Parse.Cloud.httpRequest({
        url: "https://maps.googleapis.com/maps/api/place/textsearch/json?query=emergency+room+urgent+care&key=AIzaSyAvgfUnUQzI7b3DeIT7hRLus28guaormrU",
        success: function(httpResponse) {
            console.log(httpResponse.text);
            response.success("Google places: " + httpResponse.text); // This will respond with the contents of the http response
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
});

Parse.Cloud.define("queryGovDataPlaces", function(request, response) {
    Parse.Cloud.httpRequest({
        url: "https://data.medicare.gov/resource/yv7e-xc69?measure_id=OP_20",
        success: function(httpResponse) {
            console.log(httpResponse.text);
            response.success("Data.gov:" + httpResponse.text); // This will respond with the contents of the http response
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
});