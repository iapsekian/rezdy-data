/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

var mdbUrl = 'mongodb://52.39.111.227:27017/tourbooks';

var contentTypeId = {
	"cityDetails" : "587dbe0c6d0e813d6c53b662",
	"attractionDetails" : "587dbef16d0e81d36d53b660",
	"countryDetails" : "587dbf5f6d0e81b96d53b660"
};

var taxonomyThemesVocabularyId = {
	"themes" : "57ea19736d0e81454c7b23d0"
};


//Copy Country to Country Details but delete taxonomy Search Selector

var debugDev = debug('dev');
var cityInsertLog = '';
var attractionInsertLog = '';
var countryInsertLog = '';

MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server");

	var collection = db.collection('Contents');

	var cityCount = -1;
	var attractionCount = -1;
	var countryCount = -1;

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
			console.log('*************************************');
			console.log('*********   All Complete!   *********');
			console.log('*************************************');
		}
	};

	var queryParam4City = { "typeId" : contentTypeId.cityDetails };
	collection.find(queryParam4City).toArray()
		.then( (d) => {
			cityCount = d.length;
			debugDev('cityCount = ' + cityCount);

			d.forEach((item) => {
				if(undefined !== item.workspace.taxonomy[taxonomyThemesVocabularyId.themes]){
					delete item.workspace.taxonomy[taxonomyThemesVocabularyId.themes];
					delete item.live.taxonomy[taxonomyThemesVocabularyId.themes];

					var filter = { _id : item._id };
					var updateOptions = {};
					collection.updateOne(filter, item, updateOptions)
						.then( (r) =>{
							wait4CityComplete();
						})
						.catch( (e) => {
							console.log('update city details error - ' + e);
						});
				} else {
					wait4CityComplete();
				}
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find city details error! ' + e);
		}); //end of catch() and collection.find()

	var queryParam4Attraction = { "typeId" : contentTypeId.attractionDetails };
	collection.find(queryParam4Attraction).toArray()
		.then( (d) => {
			attractionCount = d.length;
			debugDev('attractionCount = ' + attractionCount);

			d.forEach((item) => {
				if(undefined !== item.workspace.taxonomy[taxonomyThemesVocabularyId.themes]){
					delete item.workspace.taxonomy[taxonomyThemesVocabularyId.themes];
					delete item.live.taxonomy[taxonomyThemesVocabularyId.themes];

					var filter = { _id : item._id };
					var updateOptions = {};
					collection.updateOne(filter, item, updateOptions)
						.then( (r) =>{
							wait4AttractionComplete();
						})
						.catch( (e) => {
							console.log('update attraction details error - ' + e);
						});
				} else {
					wait4AttractionComplete();
				}
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find attraction details error! ' + e);
		}); //end of catch() and collection.find()

	var queryParam4Country = { "typeId" : contentTypeId.countryDetails };
	collection.find(queryParam4Country).toArray()
		.then( (d) => {
			countryCount = d.length;
			debugDev('countryCount = ' + countryCount);

			d.forEach((item) => {
				if(undefined !== item.workspace.taxonomy[taxonomyThemesVocabularyId.themes]){
					delete item.workspace.taxonomy[taxonomyThemesVocabularyId.themes];
					delete item.live.taxonomy[taxonomyThemesVocabularyId.themes];

					var filter = { _id : item._id };
					var updateOptions = {};
					collection.updateOne(filter, item, updateOptions)
						.then( (r) =>{
							wait4CountryComplete();
						})
						.catch( (e) => {
							console.log('update country details error - ' + e);
						});
				} else {
					wait4CountryComplete();
				}
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find country details error! ' + e);
		}); //end of catch() and collection.find()
});