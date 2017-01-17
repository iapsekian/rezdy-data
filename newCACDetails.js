/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

var mdbUrl = 'mongodb://52.39.111.227:27017/tourbooks';

var contentTypeId = {
	"city" : "57ed26a06d0e810b357b23c7",
	"attraction" : "57ea19736d0e81454c7b23d2",
	"country" : "57e9e2556d0e819c44dc0fc0",
	"cityDetails" : "587dbe0c6d0e813d6c53b662",
	"attractionDetails" : "587dbef16d0e81d36d53b660",
	"countryDetails" : "587dbf5f6d0e81b96d53b660"
};

//SS means taxonomy - Search Selector
var taxonomySSVocabularyId = {
	"searchSelector" : "587863e56d0e81fb4014b289"
};

var taxonomySSTermsId = {
	"generalSearch" : "5878647c6d0e816e4114b288"
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
		    fs.writeFileSync('./logs/insertCityDetails.log', cityInsertLog);
		    fs.writeFileSync('./logs/insertAttractionDetails.log', attractionInsertLog);
		    fs.writeFileSync('./logs/insertCountryDetails.log', countryInsertLog);
			console.log('*************************************');
			console.log('*********   All Complete!   *********');
			console.log('*************************************');
		}
	};

	var projectParam = {
		_id:0
	};

	var insertOptions = {
		forceServerObjectId : true
	};

	var queryParam4City = { "typeId" : contentTypeId.city };
	collection.find(queryParam4City).project(projectParam).toArray()
		.then( (d) => {
			cityCount = d.length;
			debugDev('cityCount = ' + cityCount);

			d.forEach((item) => {
				item.typeId = contentTypeId.cityDetails;
				if(item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector]){
					delete item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector];
					delete item.live.taxonomy[taxonomySSVocabularyId.searchSelector];
				}

				var queryParam4CityDetails = { "typeId": item.typeId, "text" : item.text };
				collection.find(queryParam4CityDetails).toArray()
					.then( (dCD) => {
						if(0 === dCD.length){
							collection.insertOne(item,insertOptions)
								.then( (r) => {
									if(1 === r.result.ok){
										cityInsertLog += r.ops[0].text + ' inserted successfully! \n';
									} else {
										cityInsertLog += "Something Wrong whent inserting to City Details - \n" + JSON.stringify(r.ops) + '\n';
									}
									wait4CityComplete();
								}) //end of then() of insertOne
								.catch( (e) => {
									console.log('Exception happened when insert to City Details! - ' + e);
								}); //end of catch() and insertOne
						} else {
							cityInsertLog += item.text + ' city details already existed. Do Nothing! \n';
							wait4CityComplete();
						}
					}) // end of then() of find City Details
					.catch( (e) => {
						console.log('Find city details exception! ' + e);
					}); // end of catch and find city details
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find city error! ' + e);
		}); //end of catch() and collection.find()

	var queryParam4Attraction = { "typeId" : contentTypeId.attraction };
	collection.find(queryParam4Attraction).project(projectParam).toArray()
		.then( (d) => {
			attractionCount = d.length;
			debugDev('attractionCount = ' + attractionCount);

			d.forEach((item) => {
				item.typeId = contentTypeId.attractionDetails;
				if(item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector]){
					delete item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector];
					delete item.live.taxonomy[taxonomySSVocabularyId.searchSelector];
				}

				var queryParam4AttractionDetails = { "typeId": item.typeId, "text" : item.text };
				collection.find(queryParam4AttractionDetails).toArray()
					.then( (dCD) => {
						if(0 === dCD.length){
							collection.insertOne(item,insertOptions)
								.then( (r) => {
									if(1 === r.result.ok){
										attractionInsertLog += r.ops[0].text + ' inserted successfully! \n';
									} else {
										attractionInsertLog += "Something Wrong whent inserting to Attraction Details - \n" + JSON.stringify(r.ops) + '\n';
									}
									wait4AttractionComplete();
								}) //end of then() of insertOne
								.catch( (e) => {
									console.log('Exception happened when insert to Attraction Details! - ' + e);
								}); //end of catch() and insertOne
						} else {
							attractionInsertLog += item.text + ' attraction details already existed. Do Nothing! \n';
							wait4AttractionComplete();
						}
					}) // end of then() of find Attraction Details
					.catch( (e) => {
						console.log('Find attraction details exception! ' + e);
					}); // end of catch and find attraction details
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find attraction error! ' + e);
		}); //end of catch() and collection.find()

	var queryParam4Country = { "typeId" : contentTypeId.country };
	collection.find(queryParam4Country).project(projectParam).toArray()
		.then( (d) => {
			countryCount = d.length;
			debugDev('countryCount = ' + countryCount);

			d.forEach((item) => {
				item.typeId = contentTypeId.countryDetails;
				if(item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector]){
					delete item.workspace.taxonomy[taxonomySSVocabularyId.searchSelector];
					delete item.live.taxonomy[taxonomySSVocabularyId.searchSelector];
				}

				var queryParam4CountryDetails = { "typeId": item.typeId, "text" : item.text };
				collection.find(queryParam4CountryDetails).toArray()
					.then( (dCD) => {
						if(0 === dCD.length){
							collection.insertOne(item,insertOptions)
								.then( (r) => {
									if(1 === r.result.ok){
										countryInsertLog += r.ops[0].text + ' inserted successfully! \n';
									} else {
										countryInsertLog += "Something Wrong whent inserting to Country Details - \n" + JSON.stringify(r.ops) + '\n';
									}
									wait4CountryComplete();
								}) //end of then() of insertOne
								.catch( (e) => {
									console.log('Exception happened when insert to Country Details! - ' + e);
								}); //end of catch() and insertOne
						} else {
							countryInsertLog += item.text + ' country details already existed. Do Nothing! \n';
							wait4CountryComplete();
						}
					}) // end of then() of find Country Details
					.catch( (e) => {
						console.log('Find country details exception! ' + e);
					}); // end of catch and find country details
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find country error! ' + e);
		}); //end of catch() and collection.find()
});