'use strict';

var requestEvent = require("./../event/requestEvent");
// var Request = require("./../models/request");

var winston = require('../config/winston');
var geoip = require('geoip-lite');

class GeoService {


  listen() {
    


 
  // var ip = "95.255.73.34";
  // var geo = geoip.lookup(ip);
  
  // console.log("geo", geo);

  // { range: [ 1610565632, 1610566143 ],
  //     country: 'IT',
  //     region: '65',
  //     eu: '1',
  //     timezone: 'Europe/Rome',
  //     city: 'Roseto degli Abruzzi',
  //     ll: [ 42.6716, 14.0148 ],
  //     metro: 0,
  //     area: 200 }


  requestEvent.on('request.create', function(request) {

    winston.debug("request", request.toObject());

    var ip = (request.location && request.location.ipAddress) || (request.attributes && request.attributes.ipAddress);
    winston.debug("ip" + ip);
    if (ip) {
        var geo = geoip.lookup(ip);  
        winston.debug("geo", geo);

        var update = {};
        if (geo) {
            if (geo.country && !request.location.country) {
                winston.debug("geo.country:"+ geo.country);
                request.location.country = geo.country;
                // update["location.country"] = geo.country;

            }
            if (geo.region && !request.location.region) {
                winston.debug("geo.region: "+ geo.region);
                request.location.region = geo.region;
                // update["location.region"] = geo.region;
            }
            if (geo.city && !request.location.city) {
                winston.debug("geo.city: " + geo.city);
                request.location.city = geo.city;
                // update["location.city"] = geo.city;
            }

            // console.log(request.location.toString());
            

            // var locFound=false;
            // try {
            //     var loc = request.location.geometry;
            //     locFound = true;
            // } catch (e) {locFound = false;}
            
            if (geo.ll && !request.location.geometry) {
                // if (geo.ll && request.location.geometry != undefined) {
                winston.debug("geo.ll: " + geo.ll);
                request.location.geometry = {type: "Point", coordinates: geo.ll};
                // update["location.geometry"]  = {type: "Point", coordinates: geo.ll};
            }
            
            
            // var setObj = { $set: {location: update} }        
            // winston.info("setObj", setObj);
            winston.debug("update", update);

            request.markModified('location');
            request.save(function(err, reqL) {            
            // return Request.findByIdAndUpdate("5fb297bd1d838b14607b3b62", update, { new: true, upsert: false }).exec( function(err, reqL) {                
                if (err) {
                    return winston.error("Error saving location metadata for request with id " + request._id, err);
                }
                return winston.info("Saved location metadata for request with id " + request._id);
            }); 
               
        }
    }
    });
  }


}
var geoService = new GeoService();


module.exports = geoService;
