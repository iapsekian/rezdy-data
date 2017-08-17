/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

var mdbUrl = 'mongodb://52.25.67.91:27017/bookurdb';

var contentTypeId = {
	"city" : "57ed26a06d0e810b357b23c7",
	"attraction" : "57ea19736d0e81454c7b23d2",
	"country" : "57e9e2556d0e819c44dc0fc0",
	"cityDetails" : "587dbe0c6d0e813d6c53b662",
	"attractionDetails" : "587dbef16d0e81d36d53b660",
	"countryDetails" : "587dbf5f6d0e81b96d53b660"
};

var taxonomyVocabularyId = {
	"regionCityId" : "57b18d746d0e81e174c66328",
	"attractionId": "57b18d746d0e81e174c6632e",
	"countryCode": "57b18d746d0e81e174c66322"
};


//Copy Country to Country Details but delete taxonomy Search Selector

var debugDev = debug('dev');
var cityLog = '--- Log started ---\n';
var attractionLog = '--- Log started ---\n';
var countryLog = '--- Log started ---\n';

var queryParam4City = { "typeId" : contentTypeId.city };
var queryParam4CityDetails = { "typeId" : contentTypeId.cityDetails };
var queryParam4Attraction = { "typeId" : contentTypeId.attraction };
var queryParam4AttractionDetails = { "typeId" : contentTypeId.attractionDetails };
var queryParam4Country = { "typeId" : contentTypeId.country };
var queryParam4CountryDetails = { "typeId" : contentTypeId.countryDetails };
var dataReadyCount = 6;


MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server");

	var collection = db.collection('Contents');

	var cityCount = -1;
	var attractionCount = -1;
	var countryCount = -1;

	var arrayCity, arrayCityDetails, arrayAttraction, arrayAttractionDetails, arrayCountry, arrayCountryDetails;

	var wait4CityComplete = () => {
		cityCount--;
		debugDev('City Details remains - ' + cityCount);
		if(0 === cityCount){
			wait4AllComplete();
		}
	};

	var wait4AttractionComplete = () => {
		attractionCount--;
		debugDev('Attraction Details remains - ' + attractionCount);
		if(0 === attractionCount){
			wait4AllComplete();
		}
	};

	var wait4CountryComplete = () => {
		countryCount--;
		debugDev('Country Details remains - ' + countryCount);
		if(0 === countryCount){
			wait4AllComplete();
		}
	};

	var wait4AllComplete = () => {
		if(0 === cityCount && 0 === attractionCount && 0 === countryCount){
			db.close();
		    fs.writeFileSync('./logs/syncCityImage.log', cityLog);
		    fs.writeFileSync('./logs/syncAttractionImage.log', attractionLog);
		    fs.writeFileSync('./logs/syncCountryImage.log', countryLog);
			console.log('*************************************');
			console.log('*********   All Complete!   *********');
			console.log('*************************************');
		}
	};

	var existingDataReady = () => {
		dataReadyCount--;
		debugDev('Existing Data remains - ' + dataReadyCount);
		if(0 === dataReadyCount){
			dataProcessor();
		}
	};

	collection.find(queryParam4City).toArray()
		.then( (d) => {
			cityCount = d.length;
			debugDev('cityCount = ' + cityCount);

			arrayCity = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find city error! ' + e);
		}); //end of catch() and collection.find()
	collection.find(queryParam4CityDetails).toArray()
		.then( (d) => {
			debugDev('cityDetailsCount = ' + d.length);
			arrayCityDetails = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find city Details error! ' + e);
		}); //end of catch() and collection.find()

	collection.find(queryParam4Attraction).toArray()
		.then( (d) => {
			attractionCount = d.length;
			debugDev('attractionCount = ' + attractionCount);

			arrayAttraction = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find attraction error! ' + e);
		}); //end of catch() and collection.find()
	collection.find(queryParam4AttractionDetails).toArray()
		.then( (d) => {
			debugDev('attractionDetailsCount = ' + d.length);
			arrayAttractionDetails = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find attraction Details error! ' + e);
		}); //end of catch() and collection.find()

	collection.find(queryParam4Country).toArray()
		.then( (d) => {
			countryCount = d.length;
			debugDev('countryCount = ' + countryCount);

			arrayCountry = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find country error! ' + e);
		}); //end of catch() and collection.find()
	collection.find(queryParam4CountryDetails).toArray()
		.then( (d) => {
			debugDev('countryDetailsCount = ' + d.length);
			arrayCountryDetails = d;
			existingDataReady();
		}) //end of then()
		.catch((e) => {
			console.log('find country Details error! ' + e);
		}); //end of catch() and collection.find()


	var dataProcessor = () => {
		arrayCity.forEach( (master) => {
			var updated = false;
			var text = master.text;
			var regionCityId = master.workspace.taxonomy[taxonomyVocabularyId.regionCityId];
			arrayCityDetails.forEach( (detail) => {
				if(text === detail.text && regionCityId === detail.workspace.taxonomy[taxonomyVocabularyId.regionCityId]){
					if(util.isNullOrUndefined(detail.workspace.fields.image) || '' === detail.workspace.fields.image){
						detail.workspace.fields.image = master.workspace.fields.image;
						detail.live.fields.image = master.live.fields.image;

						var filter = {_id: detail._id};
						var options = {};

						collection.updateOne(filter,detail,options)
							.then( (r) => {
								updated = true;						
							})
							.catch( (e) => {
								console.log('Update city detail Error - ' + e);
							});

					}
				}
			});
			if(updated){
				cityLog += 'City master - ' + text + ' image already synced to city detail. \n';
			}
			wait4CityComplete();
		});

		arrayAttraction.forEach( (master) => {
			var updated = false;
			var text = master.text;
			var attractionId = master.workspace.taxonomy[taxonomyVocabularyId.attractionId];
			arrayAttractionDetails.forEach( (detail) => {
				if(text === detail.text && attractionId === detail.workspace.taxonomy[taxonomyVocabularyId.attractionId]){
					if(util.isNullOrUndefined(detail.workspace.fields.image) || '' === detail.workspace.fields.image){
						detail.workspace.fields.image = master.workspace.fields.image;
						detail.live.fields.image = master.live.fields.image;

						var filter = {_id: detail._id};
						var options = {};

						collection.updateOne(filter,detail,options)
							.then( (r) => {
								updated = true;						
							})
							.catch( (e) => {
								console.log('Update attraction detail Error - ' + e);
							});

					}
				}
			});
			if(updated){
				attractionLog += 'Attraction master - ' + text + ' image already synced to attraction detail. \n';
			}
			wait4AttractionComplete();
		});

		arrayCountry.forEach( (master) => {
			var updated = false;
			var text = master.text;
			var countryCode = master.workspace.taxonomy[taxonomyVocabularyId.countryCode];
			arrayCountryDetails.forEach( (detail) => {
				if(text === detail.text && countryCode === detail.workspace.taxonomy[taxonomyVocabularyId.countryCode]){
					if(util.isNullOrUndefined(detail.workspace.fields.image) || '' === detail.workspace.fields.image){
						detail.workspace.fields.image = master.workspace.fields.image;
						detail.live.fields.image = master.live.fields.image;

						var filter = {_id: detail._id};
						var options = {};

						collection.updateOne(filter,detail,options)
							.then( (r) => {
								updated = true;						
							})
							.catch( (e) => {
								console.log('Update country detail Error - ' + e);
							});

					}
				}
			});
			if(updated){
				countryLog += 'Country master - ' + text + ' image already synced to country detail. \n';
			}
			wait4CountryComplete();
		});

	};
});