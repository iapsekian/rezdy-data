/*jshint esversion: 6 */

//Important - before executing this js file, getGeoInfoFromGMap.js should be executed in advance
//

var fs = require('fs');
var debug = require('debug');
const util = require('util');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var productionEnv = false;
var testEnv = false;
var operateDB = false;

var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];

if('PRODUCTION' === targetEnv){
	console.log('*** CAUTION!!! NOW this program will operate the PRODUCTION ENV.!!! ***');
	productionEnv = true;
	if('OPDB' === dbOPSwitch){
		console.log('*** & Database will be CHANGED!!! ***');
		operateDB = true;
	} else {
		console.log('*** BUT Database will remain unchanged.  ***');
	}
} else if('TEST' === targetEnv){
	console.log('*** Operate TEST ENV. ***');
	testEnv = true;
	if('OPDB' === dbOPSwitch){
		console.log('*** & Database will be CHANGED!!! ***');
		operateDB = true;
	} else {
		console.log('*** BUT Database will remain unchanged.  ***');
	}
} else if('OPDB' === targetEnv){
	console.log('*** Operate TEST ENV. ***');
	console.log('*** & Database will be CHANGED!!! ***');
	targetEnv = 'TEST';
	testEnv = true;
	operateDB = true;
} else {
	console.log('*** Operate TEST ENV. ***');
	console.log('*** BUT Database will remain unchanged.  ***');
	targetEnv = 'TEST';
	testEnv = true;	

	console.log('Arguments Example - ');
	console.log('	node xxx.js PRODUCTION');
	console.log('	node xxx.js PRODUCTION OPDB');
	console.log('	node xxx.js TEST === node xxx.js');
	console.log('	node xxx.js TEST OPDB === node xxx.js OPDB');
}

//DB definition/value

if(productionEnv){
	var mdbUrl = 'mongodb://52.39.111.227:27017/tourbooks';

	var contentTypeId = {
		"tours" : "58785c576d0e815f4014b288"
	};

	var taxonomyVocabularyId = {
		"TourCategory": "5763a39b6d0e81055c8b456d",
		"TourType": "587862a26d0e81ce4014b288",
		"isoWorldRegion" : "57b18d746d0e81e174c66324",
		"departFrom" : "589c085b6d0e819e13623adc",
		"neighborhood" : "58a416336d0e81e1476a3063",
		"country" : "58a416076d0e81a9466a306b",
		"state" : "58a416516d0e81e1476a3066"
	};
} else if (testEnv){
	var mdbUrl = 'mongodb://tst.tourbooks.cc:27017/tourbooks';

	var contentTypeId = {
		"tours" : "58785c576d0e815f4014b288"
	};

	var taxonomyVocabularyId = {
		"TourCategory": "5763a39b6d0e81055c8b456d",
		"TourType": "587862a26d0e81ce4014b288",
		"isoWorldRegion" : "57b18d746d0e81e174c66324",
		"departFrom" : "589c085b6d0e819e13623adc",
		"neighborhood" : "589d6b26a0af88c9488b4580",
		"country" : "58a2c332a0af881d5d05f402",
		"state" : "58a414aea0af88180f05f404"
	};
}

//base configuration

var debugDev = debug('dev');
var toursWithCoordinateCount = 0, 
	toursWithCityCountryCodeCount = 0;
var toursUpdateLog = '';
var toursUpdateLogCount = 0;
var existingTxnmyTermsIsoWorldRegion = {},
	existingTxnmyTermsDepartFrom = {},
	existingTxnmyTermsNeighborhood = {},
	existingTxnmyTermsCountry = {},
	existingTxnmyTermsState = {};

if(fs.existsSync('./datafiles/toursWithCoordinate-'+ targetEnv +'.json')){
	var toursWithCoordinate = require('./datafiles/toursWithCoordinate-'+ targetEnv +'.json');	
} else {
	var toursWithCoordinate = [];
}
if(fs.existsSync('./datafiles/toursWithCityCountryCode-'+ targetEnv +'.json')){
	var toursWithCityCountryCode = require('./datafiles/toursWithCityCountryCode-'+ targetEnv +'.json');	
} else {
	var toursWithCityCountryCode = [];
}

MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server - " + mdbUrl);

	var collection = db.collection('Contents');
	var collection1 = db.collection('TaxonomyTerms');

	var txnmyInserted = false;

	var preparingData = () => {

		var dataReadyCountDown = 5;
		var wait4DataPreparationReady = () => {
			dataReadyCountDown--;
			if(dataReadyCountDown === 0){
				if(!txnmyInserted){
					fs.writeFileSync('./logs/existingTxnmyTermsIsoWorldRegion-'+ targetEnv +'.json', JSON.stringify(existingTxnmyTermsIsoWorldRegion));
					fs.writeFileSync('./logs/existingTxnmyTermsCountry-'+ targetEnv +'.json', JSON.stringify(existingTxnmyTermsCountry));
					fs.writeFileSync('./logs/existingTxnmyTermsState-'+ targetEnv +'.json', JSON.stringify(existingTxnmyTermsState));
					fs.writeFileSync('./logs/existingTxnmyTermsDepartFrom-'+ targetEnv +'.json', JSON.stringify(existingTxnmyTermsDepartFrom));
					fs.writeFileSync('./logs/existingTxnmyTermsNeighborhood-'+ targetEnv +'.json', JSON.stringify(existingTxnmyTermsNeighborhood));
					processingTaxonomy();					
				} else {
					fs.writeFileSync('./logs/existingTxnmyTermsIsoWorldRegion-'+ targetEnv +'-afterInserting.json', JSON.stringify(existingTxnmyTermsIsoWorldRegion));
					fs.writeFileSync('./logs/existingTxnmyTermsState-'+ targetEnv +'-afterInserting.json', JSON.stringify(existingTxnmyTermsState));
					fs.writeFileSync('./logs/existingTxnmyTermsCountry-'+ targetEnv +'-afterInserting.json', JSON.stringify(existingTxnmyTermsCountry));
					fs.writeFileSync('./logs/existingTxnmyTermsDepartFrom-'+ targetEnv +'-afterInserting.json', JSON.stringify(existingTxnmyTermsDepartFrom));
					fs.writeFileSync('./logs/existingTxnmyTermsNeighborhood-'+ targetEnv +'-afterInserting.json', JSON.stringify(existingTxnmyTermsNeighborhood));
					processingTours();
				}
			}
		};

		if(txnmyInserted){
			existingTxnmyTermsIsoWorldRegion = {};
			existingTxnmyTermsDepartFrom = {};
			existingTxnmyTermsNeighborhood = {};
			existingTxnmyTermsCountry = {};
			existingTxnmyTermsState = {};
		}

		var queryParam4Txnmy = { "vocabularyId" : taxonomyVocabularyId.departFrom };
		var projectParam4Txnmy = {
			'_id': 1,
			'text': 1
		};
		collection1.find(queryParam4Txnmy).project(projectParam4Txnmy).toArray()
			.then( (d) => {
				if(0 !== d.length){
					d.forEach((item)=>{
						existingTxnmyTermsDepartFrom[item.text] = item._id.toString();									
					});
				}
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export taxonomy Depart From to an array Exception - ' + e);
			});

		queryParam4Txnmy = { "vocabularyId" : taxonomyVocabularyId.neighborhood };
		collection1.find(queryParam4Txnmy).project(projectParam4Txnmy).toArray()
			.then( (d) => {
				if(0 !== d.length){
					d.forEach((item)=>{
						existingTxnmyTermsNeighborhood[item.text] = item._id.toString();									
					});
				}
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export taxonomy Neighborhood to an array Exception - ' + e);
			});

		queryParam4Txnmy = { "vocabularyId" : taxonomyVocabularyId.country };
		collection1.find(queryParam4Txnmy).project(projectParam4Txnmy).toArray()
			.then( (d) => {
				if(0 !== d.length){
					d.forEach((item)=>{
						existingTxnmyTermsCountry[item.text] = item._id.toString();									
					});
				}
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export taxonomy Country to an array Exception - ' + e);
			});

		queryParam4Txnmy = { "vocabularyId" : taxonomyVocabularyId.isoWorldRegion };
		collection1.find(queryParam4Txnmy).project(projectParam4Txnmy).toArray()
			.then( (d) => {
				if(0 !== d.length){
					d.forEach((item)=>{
						existingTxnmyTermsIsoWorldRegion[item.text] = item._id.toString();									
					});
				}
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export taxonomy iso world region to an array Exception - ' + e);
			});
			
		queryParam4Txnmy = { "vocabularyId" : taxonomyVocabularyId.state };
		collection1.find(queryParam4Txnmy).project(projectParam4Txnmy).toArray()
			.then( (d) => {
				if(0 !== d.length){
					d.forEach((item)=>{
						existingTxnmyTermsState[item.text] = item._id.toString();									
					});
				}
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export taxonomy State / Province to an array Exception - ' + e);
			});
	};

	var processingTaxonomy = () => {
		var newTerms4DepartFrom = [],
			newTerms4Neighborhood = [],
			newTerms4IsoWorldRegion = [],
			newTerms4State = [],
			newTerms4Country = [];
		var newTerms4DepartFromCount = 0,
			newTerms4IsoWorldRegionCount = 0,
			newTerms4StateCount = 0,
			newTerms4NeighborhoodCount = 0,
			newTerms4CountryCount = 0;
		var newTerms4DepartFromDBRecords = [],
			newTerms4NeighborhoodDBRecords = [],
			newTerms4IsoWorldRegionDBRecords = [],
			newTerms4StateDBRecords = [],
			newTerms4CountryDBRecords = [];

		toursWithCoordinate.forEach((tour)=>{
			var loc = tour.loc;
			if(0 !== loc.continent.length){
				if(util.isNullOrUndefined(existingTxnmyTermsIsoWorldRegion[loc.continent])){
					if(-1 === newTerms4IsoWorldRegion.indexOf(loc.continent))	newTerms4IsoWorldRegion.push(loc.continent);
				}
			}
			if(0 !== loc.country.length){
				if(util.isNullOrUndefined(existingTxnmyTermsCountry[loc.country])){
					if(-1 === newTerms4Country.indexOf(loc.country))	newTerms4Country.push(loc.country);
				}
			}
			if(0 !== loc.state.length){
				if(util.isNullOrUndefined(existingTxnmyTermsState[loc.state])){
					if(-1 === newTerms4State.indexOf(loc.state))	newTerms4State.push(loc.state);
				}
			}
			
			if(0 !== loc.locality.length){
				if(util.isNullOrUndefined(existingTxnmyTermsDepartFrom[loc.locality])){
					if(-1 === newTerms4DepartFrom.indexOf(loc.locality))	newTerms4DepartFrom.push(loc.locality);
				}
			} else if(0 !== loc.city.length){
				if(util.isNullOrUndefined(existingTxnmyTermsDepartFrom[loc.city])){
					if(-1 === newTerms4DepartFrom.indexOf(loc.city))	newTerms4DepartFrom.push(loc.city);
				}
			}
			if(0 !== loc.neighborhood.length){
				if(util.isNullOrUndefined(existingTxnmyTermsNeighborhood[loc.neighborhood])){
					if(-1 === newTerms4Neighborhood.indexOf(loc.neighborhood))	newTerms4Neighborhood.push(loc.neighborhood);
				}
			}
		});

		toursWithCityCountryCode.forEach((tour)=>{
			var loc = tour.loc;
			if(0 !== loc.continent.length){
				if(util.isNullOrUndefined(existingTxnmyTermsIsoWorldRegion[loc.continent])){
					if(-1 === newTerms4IsoWorldRegion.indexOf(loc.continent))	newTerms4IsoWorldRegion.push(loc.continent);
				}
			}
			if(0 !== loc.country.length){
				if(util.isNullOrUndefined(existingTxnmyTermsCountry[loc.country])){
					if(-1 === newTerms4Country.indexOf(loc.country))	newTerms4Country.push(loc.country);
				}
			}
			/*
			if(0 !== loc.state.length){
				if(util.isNullOrUndefined(existingTxnmyTermsDepartFrom[loc.state])){
					newTerms4DepartFrom.push(loc.state);
				}
			}
			*/
			if(0 !== loc.city.length){
				if(util.isNullOrUndefined(existingTxnmyTermsDepartFrom[loc.city])){
					if(-1 === newTerms4DepartFrom.indexOf(loc.city))	newTerms4DepartFrom.push(loc.city);
				}
			}
			/*
			if(0 !== loc.locality.length){
				if(util.isNullOrUndefined(existingTxnmyTermsDepartFrom[loc.locality])){
					newTerms4DepartFrom.push(loc.locality);
				}
			}
			if(0 !== loc.neighborhood.length){
				if(util.isNullOrUndefined(existingTxnmyTermsNeighborhood[loc.neighborhood])){
					newTerms4Neighborhood.push(loc.neighborhood);
				}
			}
			*/
		});

		var insertionReadyCount = 5;
		var wait4AllInsertionComplete = () => {
			insertionReadyCount--;
			if(0 === insertionReadyCount){
				txnmyInserted = true;
				if(!operateDB){
					fs.writeFileSync('./logs/setTxnmyDepartFrom - newTerms4DepartFromDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4DepartFromDBRecords));
					fs.writeFileSync('./logs/setTxnmyDepartFrom - newTerms4NeighborhoodDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4NeighborhoodDBRecords));
					fs.writeFileSync('./logs/setTxnmyDepartFrom - newTerms4IsoWorldRegionDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4IsoWorldRegionDBRecords));
					fs.writeFileSync('./logs/setTxnmyDepartFrom - newTerms4StateDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4StateDBRecords));
					fs.writeFileSync('./logs/setTxnmyDepartFrom - newTerms4CountryDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4CountryDBRecords));
				}
				preparingData();
			}
		};

		newTerms4DepartFromCount = newTerms4DepartFrom.length;
		newTerms4IsoWorldRegionCount = newTerms4IsoWorldRegion.length;
		newTerms4NeighborhoodCount = newTerms4Neighborhood.length;
		newTerms4CountryCount = newTerms4Country.length;
		newTerms4StateCount = newTerms4State.length;

		var txnmyTermDocTemplate = {
			text: '', //term
			version: 1,
			vocabularyId: '', //taxonomyVocabularyId[vocabulary];
			orderValue: 100,
			expandable: false,
			nativeLanguage: 'en',
			i18n: {
				en: {
					text: '', //term
					locale: 'en',
				}
			},
			parentId: 'root',
			lastUpdateUser: {
				id: "55a4ab8b86c747a0758b4567",
				login: "admin",
				fullName: "Web Admin" 		
			},
			createUser: {
				id: "55a4ab8b86c747a0758b4567",
				login: "admin",
				fullName: "Web Admin" 		
			},
			createTime: parseInt((Date.now()/1000).toFixed(0)),
			lastUpdateTime: parseInt((Date.now()/1000).toFixed(0))
		};

		var insertOptions = {forceServerObjectId:true};

		var wait4InsertDepartFromComplete = () => {
			newTerms4DepartFromCount--;
			if(newTerms4DepartFromCount === 0){
				wait4AllInsertionComplete();
			}
		};

		var wait4InsertNeighborhoodComplete = () => {
			newTerms4NeighborhoodCount--;
			if(newTerms4NeighborhoodCount === 0){
				wait4AllInsertionComplete();
			}
		};

		var wait4InsertCountryComplete = () => {
			newTerms4CountryCount--;
			if(newTerms4CountryCount === 0){
				wait4AllInsertionComplete();
			}
		};

		var wait4InsertStateComplete = () => {
			newTerms4StateCount--;
			if(newTerms4StateCount === 0){
				wait4AllInsertionComplete();
			}
		};

		var wait4InsertIsoWorldRegionComplete = () => {
			newTerms4IsoWorldRegionCount--;
			if(newTerms4IsoWorldRegionCount === 0){
				wait4AllInsertionComplete();
			}
		};

		if(0 !== newTerms4DepartFromCount){
			newTerms4DepartFrom.forEach((term)=>{
				var txnmyTermDoc = (JSON.parse(JSON.stringify(txnmyTermDocTemplate)));

				txnmyTermDoc.text = term;
				txnmyTermDoc.vocabularyId = taxonomyVocabularyId.departFrom;
				txnmyTermDoc.i18n.en.text = term;
				txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
				txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

				if(operateDB){
					collection1.insertOne(txnmyTermDoc,insertOptions)
						.then((r)=>{
							if(1 === r.result.ok){
								debugDev('Insert taxonomy Depart From - term - ' + term + ' - Succeeded!!');
								wait4InsertDepartFromComplete();						
							}
						})
						.catch((e)=>{
							console.log('Insert taxonomy Depart From - term - ' + term + ' -  Exception Error Happened!! - ' + e);
							wait4InsertDepartFromComplete();
						});
				} else {
					newTerms4DepartFromDBRecords.push(txnmyTermDoc);
					wait4InsertDepartFromComplete();
				}
			});
		} else {
			wait4AllInsertionComplete();
		}
		
		if(0 !== newTerms4NeighborhoodCount){
			newTerms4Neighborhood.forEach((term)=>{
				var txnmyTermDoc = (JSON.parse(JSON.stringify(txnmyTermDocTemplate)));

				txnmyTermDoc.text = term;
				txnmyTermDoc.vocabularyId = taxonomyVocabularyId.neighborhood;
				txnmyTermDoc.i18n.en.text = term;
				txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
				txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;
				if(operateDB){
					collection1.insertOne(txnmyTermDoc,insertOptions)
						.then((r)=>{
							if(1 === r.result.ok){
								debugDev('Insert taxonomy Neighborhood - term - ' + term + ' - Succeeded!!');
								wait4InsertNeighborhoodComplete();						
							}
						})
						.catch((e)=>{
							console.log('Insert taxonomy Neighborhood - term - ' + term + ' -  Exception Error Happened!! - ' + e);
							wait4InsertNeighborhoodComplete();
						});
				} else {
					newTerms4NeighborhoodDBRecords.push(txnmyTermDoc);
					wait4InsertNeighborhoodComplete();
				}
			});
		} else {
			wait4AllInsertionComplete();
		}
		
		if(0 !== newTerms4CountryCount){			
			newTerms4Country.forEach((term)=>{
				var txnmyTermDoc = (JSON.parse(JSON.stringify(txnmyTermDocTemplate)));

				txnmyTermDoc.text = term;
				txnmyTermDoc.vocabularyId = taxonomyVocabularyId.country;
				txnmyTermDoc.i18n.en.text = term;
				txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
				txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

				if(operateDB){
					collection1.insertOne(txnmyTermDoc,insertOptions)
						.then((r)=>{
							if(1 === r.result.ok){
								debugDev('Insert taxonomy Country - term - ' + term + ' - Succeeded!!');
								wait4InsertCountryComplete();						
							}
						})
						.catch((e)=>{
							console.log('Insert taxonomy Country - term - ' + term + ' -  Exception Error Happened!! - ' + e);
							wait4InsertCountryComplete();
						});
				} else {
					newTerms4CountryDBRecords.push(txnmyTermDoc);
					wait4InsertCountryComplete();
				}
			});
		} else {
			wait4AllInsertionComplete();
		}
		
		if(0 !== newTerms4IsoWorldRegionCount){					
			newTerms4IsoWorldRegion.forEach((term)=>{
				var txnmyTermDoc = (JSON.parse(JSON.stringify(txnmyTermDocTemplate)));

				txnmyTermDoc.text = term;
				txnmyTermDoc.vocabularyId = taxonomyVocabularyId.isoWorldRegion;
				txnmyTermDoc.i18n.en.text = term;
				txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
				txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

				if(operateDB){
					collection1.insertOne(txnmyTermDoc,insertOptions)
						.then((r)=>{
							if(1 === r.result.ok){
								debugDev('Insert taxonomy iso world region - term - ' + term + ' - Succeeded!!');
								wait4InsertIsoWorldRegionComplete();						
							}
						})
						.catch((e)=>{
							console.log('Insert taxonomy iso world region - term - ' + term + ' -  Exception Error Happened!! - ' + e);
							wait4InsertIsoWorldRegionComplete();
						});
				} else {
					newTerms4IsoWorldRegionDBRecords.push(txnmyTermDoc);
					wait4InsertIsoWorldRegionComplete();
				}
			});
		} else {
			wait4AllInsertionComplete();
		}

		if(0 !== newTerms4StateCount){
			newTerms4State.forEach((term)=>{
				var txnmyTermDoc = (JSON.parse(JSON.stringify(txnmyTermDocTemplate)));

				txnmyTermDoc.text = term;
				txnmyTermDoc.vocabularyId = taxonomyVocabularyId.state;
				txnmyTermDoc.i18n.en.text = term;
				txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
				txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

				if(operateDB){
					collection1.insertOne(txnmyTermDoc,insertOptions)
						.then((r)=>{
							if(1 === r.result.ok){
								debugDev('Insert taxonomy State / Province - term - ' + term + ' - Succeeded!!');
								wait4InsertStateComplete();						
							}
						})
						.catch((e)=>{
							console.log('Insert taxonomy State / Province - term - ' + term + ' -  Exception Error Happened!! - ' + e);
							wait4InsertStateComplete();
						});
				} else {
					newTerms4StateDBRecords.push(txnmyTermDoc);
					wait4InsertStateComplete();
				}
			});
		} else {
			wait4AllInsertionComplete();
		}
	};

	var processingTours = () => {

		toursWithCoordinateCount = toursWithCoordinate.length;
		toursWithCityCountryCodeCount = toursWithCityCountryCode.length;
		allToursReadyCount = 2;

		var wait4AllToursComplete = () => {
			allToursReadyCount--;
			if(0 === allToursReadyCount){
				persistTours2MDB();
			}
		};

		var wait4toursWithCoordinateComplete = () => {
			toursWithCoordinateCount--;
			if(toursWithCoordinateCount === 0){
				wait4AllToursComplete();
			}
		};
		var wait4toursWithCityCountryCodeComplete = () => {
			toursWithCityCountryCodeCount--;
			if(toursWithCityCountryCodeCount === 0){
				wait4AllToursComplete();
			}
		};

		if(0 !== toursWithCoordinateCount){
			toursWithCoordinate.forEach((tour)=>{
				var txnmyIsoWorldRegion, txnmyCountry, txnmyDepartFrom, txnmyNeighborhood, txnmyState;

				//toursWithCoordinate.forEach starting point
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom])){
					txnmyDepartFrom = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.departFrom].length){
						txnmyDepartFrom = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.departFrom]){
						txnmyDepartFrom = [];
						txnmyDepartFrom.push(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom])){
						txnmyDepartFrom = tour.workspace.taxonomy[taxonomyVocabularyId.departFrom];
					} else {
						txnmyDepartFrom = [];
					}
				}
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood])){
					txnmyNeighborhood = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood].length){
						txnmyNeighborhood = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood]){
						txnmyNeighborhood = [];
						txnmyNeighborhood.push(tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood])){
						txnmyNeighborhood = tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood];
					} else {
						txnmyNeighborhood = [];
					}
				}
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.country])){
					txnmyCountry = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.country].length){
						txnmyCountry = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.country]){
						txnmyCountry = [];
						txnmyCountry.push(tour.workspace.taxonomy[taxonomyVocabularyId.country]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.country])){
						txnmyCountry = tour.workspace.taxonomy[taxonomyVocabularyId.country];
					} else {
						txnmyCountry = [];
					}
				}
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion])){
					txnmyIsoWorldRegion = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion].length){
						txnmyIsoWorldRegion = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion]){
						txnmyIsoWorldRegion = [];
						txnmyIsoWorldRegion.push(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion])){
						txnmyIsoWorldRegion = tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion];
					} else {
						txnmyIsoWorldRegion = [];
					}
				}
				txnmyIsoWorldRegion = []; //initialize this taxonomy based on tour info for the first time execution
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.state])){
					txnmyState = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.state].length){
						txnmyState = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.state]){
						txnmyState = [];
						txnmyState.push(tour.workspace.taxonomy[taxonomyVocabularyId.state]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.state])){
						txnmyState = tour.workspace.taxonomy[taxonomyVocabularyId.state];
					} else {
						txnmyState = [];
					}
				}
				
				tour.update = false;

				if(tour.loc.continent.length !== 0){
					var continentTermId = existingTxnmyTermsIsoWorldRegion[tour.loc.continent];
					if(-1 === txnmyIsoWorldRegion.indexOf(continentTermId)){
						txnmyIsoWorldRegion.push(continentTermId);
						tour.update = true;
					}
				}
				if(tour.loc.state.length !== 0){
					var stateTermId = existingTxnmyTermsState[tour.loc.state];
					if(-1 === txnmyState.indexOf(stateTermId)){
						txnmyState.push(stateTermId);
						tour.update = true;
					}
				}
				if(tour.loc.country.length !== 0){
					var countryTermId = existingTxnmyTermsCountry[tour.loc.country];
					if(-1 === txnmyCountry.indexOf(countryTermId)){
						txnmyCountry.push(countryTermId);
						tour.update = true;
					}
				}
				if(tour.loc.neighborhood.length !== 0){
					var neighborhoodTermId = existingTxnmyTermsNeighborhood[tour.loc.neighborhood];
					if(-1 === txnmyNeighborhood.indexOf(neighborhoodTermId)){
						txnmyNeighborhood.push(neighborhoodTermId);
						tour.update = true;
					}
				}
				if(tour.loc.locality.length !== 0){
					var localityTermId = existingTxnmyTermsDepartFrom[tour.loc.locality];
					if(-1 === txnmyDepartFrom.indexOf(localityTermId)){
						txnmyDepartFrom.push(localityTermId);
						tour.update = true;
					}
				} else if(tour.loc.city.length !== 0){
					var cityTermId = existingTxnmyTermsDepartFrom[tour.loc.city];
					if(-1 === txnmyDepartFrom.indexOf(cityTermId)){
						txnmyDepartFrom.push(cityTermId);
						tour.update = true;
					}
				}

				tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion] = txnmyIsoWorldRegion;
				tour.workspace.taxonomy[taxonomyVocabularyId.state] = txnmyState;
				tour.workspace.taxonomy[taxonomyVocabularyId.country] = txnmyCountry;
				tour.workspace.taxonomy[taxonomyVocabularyId.departFrom] = txnmyDepartFrom;
				tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood] = txnmyNeighborhood;

				tour.live.taxonomy = tour.workspace.taxonomy;
				wait4toursWithCoordinateComplete();
			});
		} else {
			wait4AllToursComplete();
		}

		if(0 !== toursWithCityCountryCodeCount){
			toursWithCityCountryCode.forEach((tour)=>{
				var txnmyIsoWorldRegion, txnmyCountry, txnmyDepartFrom, txnmyNeighborhood;

				//toursWithCityCountryCode.forEach starting point
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom])){
					txnmyDepartFrom = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.departFrom].length){
						txnmyDepartFrom = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.departFrom]){
						txnmyDepartFrom = [];
						txnmyDepartFrom.push(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.departFrom])){
						txnmyDepartFrom = tour.workspace.taxonomy[taxonomyVocabularyId.departFrom];
					} else {
						txnmyDepartFrom = [];
					}
				}
				/*
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood])){
					txnmyNeighborhood = [];
				} else {
					txnmyNeighborhood = tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood];
				}
				*/
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.country])){
					txnmyCountry = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.country].length){
						txnmyCountry = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.country]){
						txnmyCountry = [];
						txnmyCountry.push(tour.workspace.taxonomy[taxonomyVocabularyId.country]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.country])){
						txnmyCountry = tour.workspace.taxonomy[taxonomyVocabularyId.country];
					} else {
						txnmyCountry = [];
					}
				}
				if(util.isNullOrUndefined(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion])){
					txnmyIsoWorldRegion = [];
				} else {
					if(0 === tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion].length){
						txnmyIsoWorldRegion = [];
					} else if('string' === typeof tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion]){
						txnmyIsoWorldRegion = [];
						txnmyIsoWorldRegion.push(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion]);
					} else if(Array.isArray(tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion])){
						txnmyIsoWorldRegion = tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion];
					} else {
						txnmyIsoWorldRegion = [];
					}
				}
				txnmyIsoWorldRegion = []; //initialize this taxonomy based on tour info for the first time execution
				
				tour.update = false;

				if(tour.loc.continent.length !== 0){
					var continentTermId = existingTxnmyTermsIsoWorldRegion[tour.loc.continent];
					if(-1 === txnmyIsoWorldRegion.indexOf(continentTermId)){
						txnmyIsoWorldRegion.push(continentTermId);
						tour.update = true;
					}
				}
				if(tour.loc.country.length !== 0){
					var countryTermId = existingTxnmyTermsCountry[tour.loc.country];
					if(-1 === txnmyCountry.indexOf(countryTermId)){
						txnmyCountry.push(countryTermId);
						tour.update = true;
					}
				}
				/*
				if(tour.loc.neighborhood.length !== 0){
					var neighborhoodTermId = existingTxnmyTermsNeighborhood[tour.loc.neighborhood];
					if(-1 === txnmyNeighborhood.indexOf(neighborhoodTermId)){
						txnmyNeighborhood.push(neighborhoodTermId);
						tour.update = true;
					}
				}
				*/
				if(tour.loc.city.length !== 0){
					var cityTermId = existingTxnmyTermsDepartFrom[tour.loc.city];
					if(-1 === txnmyDepartFrom.indexOf(cityTermId)){
						txnmyDepartFrom.push(cityTermId);
						tour.update = true;
					}
				}
				/*
				if(tour.loc.state.length !== 0){
					var stateTermId = existingTxnmyTermsDepartFrom[tour.loc.state];
					if(-1 === txnmyDepartFrom.indexOf(stateTermId)){
						txnmyDepartFrom.push(stateTermId);
						tour.update = true;
					}
				}
				if(tour.loc.locality.length !== 0){
					var localityTermId = existingTxnmyTermsDepartFrom[tour.loc.locality];
					if(-1 === txnmyDepartFrom.indexOf(localityTermId)){
						txnmyDepartFrom.push(localityTermId);
						tour.update = true;
					}
				}
				*/

				tour.workspace.taxonomy[taxonomyVocabularyId.isoWorldRegion] = txnmyIsoWorldRegion;
				tour.workspace.taxonomy[taxonomyVocabularyId.country] = txnmyCountry;
				tour.workspace.taxonomy[taxonomyVocabularyId.departFrom] = txnmyDepartFrom;
				//tour.workspace.taxonomy[taxonomyVocabularyId.neighborhood] = txnmyNeighborhood;

				tour.live.taxonomy = tour.workspace.taxonomy;
				wait4toursWithCityCountryCodeComplete();
			});
		} else {
			wait4AllToursComplete();
		}
	};

	var persistTours2MDB = () => {
		var toursWithCoordinateDBRecords = [],
			toursWithCityCountryCodeDBRecords = [];
		toursWithCoordinateCount = toursWithCoordinate.length;
		toursWithCityCountryCodeCount = toursWithCityCountryCode.length;
		allToursReadyCount = 2;

		var wait4AllToursComplete = () => {
			allToursReadyCount--;
			if(0 === allToursReadyCount){
				db.close();
				toursUpdateLog += 'Total Updating Count = ' + toursUpdateLogCount;
				fs.writeFileSync('./logs/setTxnmyDepartFrom - updateLog - '+ targetEnv + '.log', toursUpdateLog);
				if(!operateDB){
					fs.writeFileSync('./logs/toursWithCoordinateDBRecords - '+ targetEnv + '.json', JSON.stringify(toursWithCoordinateDBRecords));
					fs.writeFileSync('./logs/toursWithCityCountryCodeDBRecords - '+ targetEnv + '.json', JSON.stringify(toursWithCityCountryCodeDBRecords));
				}
				console.log(' *************************************************************************************************');
				console.log(' *** Taxonomies iso world region, State / Province, Country, DepartFrom have been set to Tours ***');
				console.log(' *************************************************************************************************');
			}
		};

		var wait4toursWithCoordinateComplete = () => {
			toursWithCoordinateCount--;
			if(toursWithCoordinateCount === 0){
				wait4AllToursComplete();
			}
		};
		var wait4toursWithCityCountryCodeComplete = () => {
			toursWithCityCountryCodeCount--;
			if(toursWithCityCountryCodeCount === 0){
				wait4AllToursComplete();
			}
		};

		//persistTours2MDB() starting point
		if(0 !== toursWithCoordinateCount){
			toursWithCoordinate.forEach((tour)=>{
				if(tour.update){
					var objID = ObjectID.createFromHexString(tour._id); //because toursWithCoordinate was loaded from a json file, _id field is a string not ObjectId type
					var filter = { _id: objID};
					var updateField = {};
					updateField.workspace = tour.workspace;
					updateField.live = tour.live;
					var update = { $set: updateField };

					if(operateDB){
						collection.updateOne(filter, update)
							.then((r) => {
								debugDev('Modified Count = ' + r.modifiedCount+', Total Modified Count = ' + r.result.nModified);
								toursUpdateLog += 'Tour - ' + tour.text + ' - Updated!\n';
								toursUpdateLogCount++;
								wait4toursWithCoordinateComplete();
							})
							.catch((e) => {
								console.log('Update tour - '+ tour.text +' - with coordinate taxonomy error!  ' + e);
							});
					} else {
						toursWithCoordinateDBRecords.push(tour);
						toursUpdateLog += 'Tour - ' + tour.text + ' - Updated!\n';
						toursUpdateLogCount++;
						wait4toursWithCoordinateComplete();
					}
				} else {
					wait4toursWithCoordinateComplete();
				}
			});
		} else {
			wait4AllToursComplete();
		}

		if(0 !== toursWithCityCountryCodeCount){
			toursWithCityCountryCode.forEach((tour)=>{
				if(tour.update){
					var objID = ObjectID.createFromHexString(tour._id); //because toursWithCoordinate was loaded from a json file, _id field is a string not ObjectId type
					var filter = { _id: objID};
					var updateField = {};
					updateField.workspace = tour.workspace;
					updateField.live = tour.live;
					var update = { $set: updateField };

					if(operateDB){
						collection.updateOne(filter, update)
							.then((r) => {
								debugDev('Modified Count = ' + r.modifiedCount+', Total Modified Count = ' + r.result.nModified);
								toursUpdateLog += 'Tour - ' + tour.text + ' - Updated!\n';
								toursUpdateLogCount++;
								wait4toursWithCityCountryCodeComplete();
							})
							.catch((e) => {
								console.log('Update tour - '+ tour.text +' - WITHOUT coordinate taxonomy error!  ' + e);
							});
					} else {
						toursWithCityCountryCodeDBRecords.push(tour);
						toursUpdateLog += 'Tour - ' + tour.text + ' - Updated!\n';
						toursUpdateLogCount++;
						wait4toursWithCityCountryCodeComplete();
					}
				} else {
					wait4toursWithCityCountryCodeComplete();
				}
			});
		} else {
			wait4AllToursComplete();
		}
	};

	//Starting point
	preparingData();
});

