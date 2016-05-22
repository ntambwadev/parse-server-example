var moment = require("moment");
// var schedule = require('node-schedule');

// var rule = new schedule.RecurrenceRule();
// rule.minute = 1;
// var j = schedule.scheduleJob(rule, function(){
//   console.log('The answer to life, the universe, and everything!');
// });

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hello from DocWhere cloud code! ');
});

Parse.Cloud.define("queryGovDataPlaces", function(request, response) {

    var url = "https://data.medicare.gov/resource/yv7e-xc69?measure_id=OP_20" 
    Parse.Cloud.httpRequest({
        url: url}).then(function(httpResponse) {

            response.success(httpResponse.data);

        }, function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        });

});

Parse.Cloud.define("saveGovDataPlacesToParse", function(request, response) {

      Parse.Cloud.run('queryGovDataPlaces', {}).then(function(emergencyPlacesArray) {

            var promises = []
            var parse_objects = []
            for (var index in emergencyPlacesArray){   

                var place_item = emergencyPlacesArray[index]
                var dataGovPlace = createDataGovPlace(place_item)
                // promises.push(dataGovPlace.save());
                parse_objects.push(dataGovPlace)
            }
            // return Parse.Promise.when(promises)
            return parse_objects//Parse.Object.saveAll(parse_objects) 

      }).then(function(dataGovPlaces) {

        var facilities = []
        for (var index in dataGovPlaces){  

            var dataGovPlace = dataGovPlaces[index]
            var facility = createFacility(dataGovPlace)
            facilities.push(facility);
        }

        return Parse.Object.saveAll(facilities) 
        
      }).then(function (facilities) {

            response.success(gov_data_places)

      }, function(error) {
            // handle error
            console.log(error);
            response.error()
      });
})

function createFacility(dataGovPlace){

    var Facility = Parse.Object.extend("Facility");
    var facility = new Facility();

    facility.set("name", dataGovPlace.get("hospital_name"));
    facility.set("city", dataGovPlace.get("city"));
    facility.set("state", dataGovPlace.get("state_short"));
    facility.set("address", dataGovPlace.get("address"));
    facility.set("placeID", dataGovPlace.get("provider_id"));
    facility.set("location", dataGovPlace.get("location"));
    facility.set("zip", dataGovPlace.get("zip_code"));
    facility.set("dataGovPlace", dataGovPlace);

    return facility
}

function createDataGovPlace(place_item){

    var place_item_addr = place_item.human_address_json
    var human_address_json = place_item.location.human_address
    var human_address_object = JSON.parse(human_address_json)
    var address = human_address_object.address
    var state_short = human_address_object.state
    var zip_code = human_address_object.zip

    var provider_id = place_item.provider_id
    var condition = place_item.condition
    var score = place_item.score
    var hospital_name = place_item.hospital_name
    if (place_item.location.latitude && place_item.location.longitude) {

        var latitude =  parseFloat(place_item.location.latitude)
        var longitude =  parseFloat(place_item.location.longitude)
        var result_string = "longitude:" + longitude + " :  latitude: " + latitude 
        console.log(result_string)
        var location = new Parse.GeoPoint({latitude: latitude, longitude: longitude})
    }
    
    var city = place_item.city
    var measure_id = place_item.measure_id
    var county_name = place_item.county_name
    var sample = place_item.sample
    var measure_end_date = place_item.measure_end_date
    var measure_start_date = place_item.measure_start_date
    var phone_numer = place_item.phone_number.phone_number

    var DataGovPlace = Parse.Object.extend("DataGovPlace");
    var dataGovPlace = new DataGovPlace();
    dataGovPlace.set("hospital_name", hospital_name);
    dataGovPlace.set("provider_id", provider_id);
    dataGovPlace.set("condition", condition);
    dataGovPlace.set("location", location);
    dataGovPlace.set("city", city);
    dataGovPlace.set("score", score);
    dataGovPlace.set("measure_id", measure_id);
    dataGovPlace.set("measure_start_date", measure_start_date);
    dataGovPlace.set("measure_end_date", measure_end_date);
    dataGovPlace.set("county_name", county_name);
    dataGovPlace.set("phone_numer", phone_numer);
    dataGovPlace.set("state_short", state_short);
    dataGovPlace.set("zip_code", zip_code);
    dataGovPlace.set("human_address_json", human_address_json);
    dataGovPlace.set("address", address);

    if(location){
        dataGovPlace.set("location", location);
    }

    return dataGovPlace

}

function createGooglePlace(place_item){

    var place_item_addr = place_item.formatted_address
    if(place_item_addr){

        var result = place_item_addr.match(/[^,]+,[^,]+/g);
        var state_zip_code_country = result[1]
        console.log(place_item_addr)
        var split_array = state_zip_code_country.split(' ');
        var state_short = split_array[1]
        var zip_code = parseInt(split_array[2].split(',')[0]);
    }

    var google_id = place_item.id
    var place_id = place_item.place_id
    var formatted_address = place_item.formatted_address
    var hospital_name = place_item.name
    if(place_item.location){

        var latitude =  place_item.location.lat
        var longitude =  place_item.location.lng
        var location = new Parse.GeoPoint({latitude: latitude, longitude: longitude})
    }

    var GooglePlace = Parse.Object.extend("GooglePlace");
    var googlePlaceObject = new GooglePlace();
    if(place_item_addr){

        googlePlaceObject.set("formatted_address", place_item.formatted_address);
        googlePlaceObject.set("state_short", state_short);
        googlePlaceObject.set("zip_code", zip_code);

    }
    if (location){
        googlePlaceObject.set("location", location);
    }
    
    googlePlaceObject.set("hospital_name", hospital_name);
    googlePlaceObject.set("google_id", google_id);
    googlePlaceObject.set("place_id", place_id);

    return googlePlaceObject
}
function createGooglePlaceFromNative(place_item){

    googlePlaceObject.set("name", place_item.name);
    googlePlaceObject.set("city", place_item.city);
    googlePlaceObject.set("state", place_item.state);
    googlePlaceObject.set("address", place_item.address);
    googlePlaceObject.set("google_id", place_item.google_id);
    googlePlaceObject.set("placeID", place_item.placeID);
    googlePlaceObject.set("location", place_item.location);
    googlePlaceObject.set("zip", place_item.zip);
    return googlePlaceObject
}

function createFacilityFromGooglePlace(googlePlace){

    var Facility = Parse.Object.extend("Facility");
    var facility = new Facility();

    facility.set("name", googlePlace.get("name"));
    facility.set("city", googlePlace.get("city"));
    facility.set("state", googlePlace.get("state"));
    facility.set("address", googlePlace.get("address"));
    facility.set("placeID", googlePlace.get("placeID"));
    facility.set("location", googlePlace.get("location"));
    facility.set("zip", googlePlace.get("zip"));
    facility.set("googlePlace", googlePlace);

    return facility
}

Parse.Cloud.define("queryGooglePlaceHospitals", function(request, response) {

    console.log("HERE")
    var request_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=emergency+room+urgent+care&key=AIzaSyAvgfUnUQzI7b3DeIT7hRLus28guaormrU" 
    Parse.Cloud.httpRequest({
        url: request_url}).then(function(httpResponse) {

            console.log(httpResponse.data.results)
            response.success(httpResponse.data.results);

        }, function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        });
        
});

Parse.Cloud.define("saveGooglePlacesToParse", function(request, response) {

      Parse.Cloud.run('queryGooglePlaceHospitals', {} ).then(function(emergency_places_array) {

            var promises = []
            var parse_objects = []
            for (var index in emergency_places_array){   
                // console.log("google place")
                var place_item = emergency_places_array[index]
                var googlePlaceObject = createGooglePlace(place_item)
                
                promises.push(googlePlaceObject.save());
                // promises.push(Parse.Cloud.run('addGooglePlaceToParse', { useMasterKey: true }, {place_item:place_item}));
                // parse_objects.push(googlePlaceObject)
            }
            return Parse.Promise.when(promises)
            // return Parse.Object.saveAll(parse_objects) 

      }).then(function (google_places) {

            response.success(google_places)

      }, function(error) {
            // handle error
            console.log(error);
            response.error()
      });

});

Parse.Cloud.define("addGooglePlaceToParse", function(request, response) {

    console.log("addGooglePlaceToParse")
      var place_item = request.params.place_item

      var query = new Parse.Query("GooglePlace");
      query.equalTo('google_id', place_item.google_id)
      query.equalTo('place_id', place_item.place_id)
      
      query.first({ useMasterKey: true }).then(function(google_place) {

        if(google_place){

            return google_place

        }else{

            var googlePlaceObject = createGooglePlace(place_item)
            return googlePlaceObject.save()
        }

      }).then(function(googlePlaceObject) {
        var facility = createFacilityFromGooglePlace(googlePlaceObject)
        console.log("Success updating tracks")
        response.success(googlePlaceObject)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});

Parse.Cloud.define("addGooglePlaceToParseFromNative", function(request, response) {

    console.log("addGooglePlaceToParse")
      var place_item = request.params.place_item

      var query = new Parse.Query("Facility");
      // query.equalTo('google_id', place_item.google_id)
      query.equalTo('place_id', place_item.place_id)
      
      query.first({ useMasterKey: true }).then(function(facility) {

        if(facility){

            return facility

        }else{

            var googlePlaceObject = createGooglePlaceFromNative(place_item)
            var facility = createFacilityFromGooglePlace(googlePlaceObject)
            return facility.save()
        }

      }).then(function(facilityObject) {
        console.log("Success addGooglePlaceToParseFromNative")
        response.success(facility)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});


Parse.Cloud.define("addDataGovPlaceToParse", function(request, response) {

      var place_item = request.params.place_item

      var DataGovPlace = Parse.Object.extend("DataGovPlace");
      var query = new Parse.Query(DataGovPlace);
      query.equalTo('provider_id', place_item.provider_id)
      
      query.first({ useMasterKey: true }).then(function(dataGovPlace) {

        if(dataGovPlace){
            return dataGovPlace

        }else{
            var dataGovPlace = createDataGovPlace(place_item)
            return dataGovPlace.save()
        }

      }).then(function(googlePlaceObject) {

        console.log("Success updating tracks")
        response.success(googlePlaceObject)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});

Parse.Cloud.define("RemoveFacilities", function(request, response) {

      var Facility = Parse.Object.extend("Facility");
      var query = new Parse.Query(Facility);
      var activeSince = moment().subtract(1,"days").toDate();
      query.greaterThan('createdAt', activeSince)
      
      query.find({ useMasterKey: true }).then(function(facilities) {
        console.log("Facility count: " + facilities.length)
        var promises = []
            for (var index in facilities){   
                var facility = facilities[index]
                promises.push(facility.destroy());
            }
        return Parse.Promise.when(promises)

      }).then(function(facilities) {

        console.log("Success RemoveFacilities")
        response.success("facilities")

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});