/*jshint esversion: 6 */

//Important - before executing this js file, getGeoInfoFromGMap.js should be executed in advance
//

var fs = require('fs');
var debug = require('debug');
var debugDev = debug('dev');
const util = require('util');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
let buUtil = require('./lib/bookurUtil.js')

//for standalone execution
var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];
console.log('getGeoInfoFromGMap - execArgv=%s - args: targetEnv=%s, dbOPSwitch=%s', process.execArgv, targetEnv, dbOPSwitch);


//for module exports
// let targetEnv = '';
// let dbOPSwitch = '';

let operateDB = false;
let mdbUrl = '';

let txVocName = ['Tour Category','Tour Type','iso world region','City','Neighborhood','Country','State / Province'];
let ctnTypeName = ['Tours'];
let txVocNameCount = txVocName.length;
let ctnTypeNameCount = ctnTypeName.length;
let ctnProjection = {'_id':1, 'text': 1, 'workspace':1};
let txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {};

//base configuration
let toursWithCoordinate = [];
let toursWithCityCountryCode = [];
var toursWithCoordinateCount = 0, 
	toursWithCityCountryCodeCount = 0;
var toursUpdateLog = '';
var toursUpdateLogCount = 0;
// var existingTxnmyTermsIsoWorldRegion = {},
// 	existingTxnmyTermsDepartFrom = {},
// 	existingTxnmyTermsNeighborhood = {},
// 	existingTxnmyTermsCountry = {},
// 	existingTxnmyTermsState = {};

let main = () => {
	MongoClient.connect(mdbUrl, (err, db) => {
		if(null === err) console.log("Connected successfully to server - " + mdbUrl);

		var collection = db.collection('Contents');
		var collection1 = db.collection('TaxonomyTerms');

		var txnmyInserted = false;

		var preparingData = () => {

			if(txnmyInserted){
				txVocId = {};
				txTermsId = {};
			}

			buUtil.getTxTermsMap({
				'txVocName': txVocName,
				'txTermsFlag': true,
				//'reversedListing': false,
				'targetEnv': targetEnv,
				'dbOPSwitch': dbOPSwitch
			}, (vocs,terms)=>{
				txVocId = vocs;
				txTermsId = terms;
				if(!txnmyInserted){
					fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-txTermsId-'+ targetEnv +'.json', JSON.stringify(txTermsId));
					processingTaxonomy();					
				} else {
					fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-txTermsId-'+ targetEnv +'-afterInserting.json', JSON.stringify(txTermsId));
					processingTours();
				}
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
					if(util.isNullOrUndefined(txTermsId.isoworldregion[loc.continent])){
						if(-1 === newTerms4IsoWorldRegion.indexOf(loc.continent))	newTerms4IsoWorldRegion.push(loc.continent);
					}
				}
				if(0 !== loc.country.length){
					if(util.isNullOrUndefined(txTermsId.Country[loc.country])){
						if(-1 === newTerms4Country.indexOf(loc.country))	newTerms4Country.push(loc.country);
					}
				}
				if(0 !== loc.state.length){
					if(util.isNullOrUndefined(txTermsId['State/Province'][loc.state])){
						if(-1 === newTerms4State.indexOf(loc.state))	newTerms4State.push(loc.state);
					}
				}
				
				if(0 !== loc.locality.length){
					if(util.isNullOrUndefined(txTermsId.City[loc.locality])){
						if(-1 === newTerms4DepartFrom.indexOf(loc.locality))	newTerms4DepartFrom.push(loc.locality);
					}
				} else if(0 !== loc.city.length){
					if(util.isNullOrUndefined(txTermsId.City[loc.city])){
						if(-1 === newTerms4DepartFrom.indexOf(loc.city))	newTerms4DepartFrom.push(loc.city);
					}
				}
				if(0 !== loc.neighborhood.length){
					if(util.isNullOrUndefined(txTermsId.Neighborhood[loc.neighborhood])){
						if(-1 === newTerms4Neighborhood.indexOf(loc.neighborhood))	newTerms4Neighborhood.push(loc.neighborhood);
					}
				}
			});

			toursWithCityCountryCode.forEach((tour)=>{
				var loc = tour.loc;
				if(0 !== loc.continent.length){
					if(util.isNullOrUndefined(txTermsId.isoworldregion[loc.continent])){
						if(-1 === newTerms4IsoWorldRegion.indexOf(loc.continent))	newTerms4IsoWorldRegion.push(loc.continent);
					}
				}
				if(0 !== loc.country.length){
					if(util.isNullOrUndefined(txTermsId.Country[loc.country])){
						if(-1 === newTerms4Country.indexOf(loc.country))	newTerms4Country.push(loc.country);
					}
				}
				/*
				if(0 !== loc.state.length){
					if(util.isNullOrUndefined(txTermsId['State/Province'][loc.state])){
						newTerms4DepartFrom.push(loc.state);
					}
				}
				*/
				if(0 !== loc.city.length){
					if(util.isNullOrUndefined(txTermsId.City[loc.city])){
						if(-1 === newTerms4DepartFrom.indexOf(loc.city))	newTerms4DepartFrom.push(loc.city);
					}
				}
				/*
				if(0 !== loc.locality.length){
					if(util.isNullOrUndefined(txTermsId.City[loc.locality])){
						newTerms4DepartFrom.push(loc.locality);
					}
				}
				if(0 !== loc.neighborhood.length){
					if(util.isNullOrUndefined(txTermsId.Neighborhood[loc.neighborhood])){
						newTerms4Neighborhood.push(loc.neighborhood);
					}
				}
				*/
			});

			var insertionReadyCount = 5;
			var wait4AllInsertionComplete = () => {
				insertionReadyCount--;
				if(0 === insertionReadyCount){
					if(!operateDB){
						fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - newTerms4DepartFromDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4DepartFromDBRecords));
						fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - newTerms4NeighborhoodDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4NeighborhoodDBRecords));
						fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - newTerms4IsoWorldRegionDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4IsoWorldRegionDBRecords));
						fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - newTerms4StateDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4StateDBRecords));
						fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - newTerms4CountryDBRecords'+ targetEnv +'.json', JSON.stringify(newTerms4CountryDBRecords));
					}
					if(operateDB){
						if(txnmyInserted){
							preparingData();
						} else {
							processingTours();
						}
					} else {
						processingTours();
					}
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
					txnmyTermDoc.vocabularyId = txVocId.City;
					txnmyTermDoc.i18n.en.text = term;
					txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
					txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

					if(operateDB){
						collection1.insertOne(txnmyTermDoc,insertOptions)
							.then((r)=>{
								if(1 === r.result.ok){
									txnmyInserted = true;
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
					txnmyTermDoc.vocabularyId = txVocId.Neighborhood;
					txnmyTermDoc.i18n.en.text = term;
					txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
					txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;
					if(operateDB){
						collection1.insertOne(txnmyTermDoc,insertOptions)
							.then((r)=>{
								if(1 === r.result.ok){
									txnmyInserted = true;
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
					txnmyTermDoc.vocabularyId = txVocId.Country;
					txnmyTermDoc.i18n.en.text = term;
					txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
					txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

					if(operateDB){
						collection1.insertOne(txnmyTermDoc,insertOptions)
							.then((r)=>{
								if(1 === r.result.ok){
									txnmyInserted = true;
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
					txnmyTermDoc.vocabularyId = txVocId.isoworldregion;
					txnmyTermDoc.i18n.en.text = term;
					txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
					txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

					if(operateDB){
						collection1.insertOne(txnmyTermDoc,insertOptions)
							.then((r)=>{
								if(1 === r.result.ok){
									txnmyInserted = true;
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
					txnmyTermDoc.vocabularyId = txVocId['State/Province'];
					txnmyTermDoc.i18n.en.text = term;
					txnmyTermDoc.createTime = parseInt((Date.now()/1000).toFixed(0));
					txnmyTermDoc.lastUpdateTime = txnmyTermDoc.createTime;

					if(operateDB){
						collection1.insertOne(txnmyTermDoc,insertOptions)
							.then((r)=>{
								if(1 === r.result.ok){
									txnmyInserted = true;
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
					fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-toursWithCoordinate-'+ targetEnv +'.json', JSON.stringify(toursWithCoordinate));
					wait4AllToursComplete();
				}
			};
			var wait4toursWithCityCountryCodeComplete = () => {
				toursWithCityCountryCodeCount--;
				if(toursWithCityCountryCodeCount === 0){
					fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-toursWithCityCountryCode-'+ targetEnv +'.json', JSON.stringify(toursWithCityCountryCode));
					wait4AllToursComplete();
				}
			};

			if(0 !== toursWithCoordinateCount){
				toursWithCoordinate.forEach((tour)=>{
					var txnmyIsoWorldRegion, txnmyCountry, txnmyDepartFrom, txnmyNeighborhood, txnmyState;

					//toursWithCoordinate.forEach starting point
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.City])){
						txnmyDepartFrom = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.City].length){
							txnmyDepartFrom = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.City]){
							txnmyDepartFrom = [];
							txnmyDepartFrom.push(tour.workspace.taxonomy[txVocId.City]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.City])){
							txnmyDepartFrom = tour.workspace.taxonomy[txVocId.City];
						} else {
							txnmyDepartFrom = [];
						}
					}
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.Neighborhood])){
						txnmyNeighborhood = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.Neighborhood].length){
							txnmyNeighborhood = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.Neighborhood]){
							txnmyNeighborhood = [];
							txnmyNeighborhood.push(tour.workspace.taxonomy[txVocId.Neighborhood]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.Neighborhood])){
							txnmyNeighborhood = tour.workspace.taxonomy[txVocId.Neighborhood];
						} else {
							txnmyNeighborhood = [];
						}
					}
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.Country])){
						txnmyCountry = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.Country].length){
							txnmyCountry = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.Country]){
							txnmyCountry = [];
							txnmyCountry.push(tour.workspace.taxonomy[txVocId.Country]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.Country])){
							txnmyCountry = tour.workspace.taxonomy[txVocId.Country];
						} else {
							txnmyCountry = [];
						}
					}
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.isoworldregion])){
						txnmyIsoWorldRegion = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.isoworldregion].length){
							txnmyIsoWorldRegion = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.isoworldregion]){
							txnmyIsoWorldRegion = [];
							txnmyIsoWorldRegion.push(tour.workspace.taxonomy[txVocId.isoworldregion]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.isoworldregion])){
							txnmyIsoWorldRegion = tour.workspace.taxonomy[txVocId.isoworldregion];
						} else {
							txnmyIsoWorldRegion = [];
						}
					}
					// txnmyIsoWorldRegion = []; //initialize this taxonomy based on tour info for the first time execution
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId['State/Province']])){
						txnmyState = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId['State/Province']].length){
							txnmyState = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId['State/Province']]){
							txnmyState = [];
							txnmyState.push(tour.workspace.taxonomy[txVocId['State/Province']]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId['State/Province']])){
							txnmyState = tour.workspace.taxonomy[txVocId['State/Province']];
						} else {
							txnmyState = [];
						}
					}
					
					tour.update = false;

					if(tour.loc.continent.length !== 0){
						var continentTermId = txTermsId.isoworldregion[tour.loc.continent];
						if(-1 === txnmyIsoWorldRegion.indexOf(continentTermId)){
							txnmyIsoWorldRegion.push(continentTermId);
							tour.update = true;
						}
					}
					if(tour.loc.state.length !== 0){
						var stateTermId = txTermsId['State/Province'][tour.loc.state];
						if(-1 === txnmyState.indexOf(stateTermId)){
							txnmyState.push(stateTermId);
							tour.update = true;
						}
					}
					if(tour.loc.country.length !== 0){
						var countryTermId = txTermsId.Country[tour.loc.country];
						if(-1 === txnmyCountry.indexOf(countryTermId)){
							txnmyCountry.push(countryTermId);
							tour.update = true;
						}
					}
					if(tour.loc.neighborhood.length !== 0){
						var neighborhoodTermId = txTermsId.Neighborhood[tour.loc.neighborhood];
						if(-1 === txnmyNeighborhood.indexOf(neighborhoodTermId)){
							txnmyNeighborhood.push(neighborhoodTermId);
							tour.update = true;
						}
					}
					if(tour.loc.locality.length !== 0){
						var localityTermId = txTermsId.City[tour.loc.locality];
						if(-1 === txnmyDepartFrom.indexOf(localityTermId)){
							txnmyDepartFrom.push(localityTermId);
							tour.update = true;
						}
					} else if(tour.loc.city.length !== 0){
						var cityTermId = txTermsId.City[tour.loc.city];
						if(-1 === txnmyDepartFrom.indexOf(cityTermId)){
							txnmyDepartFrom.push(cityTermId);
							tour.update = true;
						}
					}

					tour.workspace.taxonomy[txVocId.isoworldregion] = txnmyIsoWorldRegion;
					tour.workspace.taxonomy[txVocId['State/Province']] = txnmyState;
					tour.workspace.taxonomy[txVocId.Country] = txnmyCountry;
					tour.workspace.taxonomy[txVocId.City] = txnmyDepartFrom;
					tour.workspace.taxonomy[txVocId.Neighborhood] = txnmyNeighborhood;

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
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.City])){
						txnmyDepartFrom = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.City].length){
							txnmyDepartFrom = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.City]){
							txnmyDepartFrom = [];
							txnmyDepartFrom.push(tour.workspace.taxonomy[txVocId.City]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.City])){
							txnmyDepartFrom = tour.workspace.taxonomy[txVocId.City];
						} else {
							txnmyDepartFrom = [];
						}
					}
					/*
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.Neighborhood])){
						txnmyNeighborhood = [];
					} else {
						txnmyNeighborhood = tour.workspace.taxonomy[txVocId.Neighborhood];
					}
					*/
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.Country])){
						txnmyCountry = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.Country].length){
							txnmyCountry = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.Country]){
							txnmyCountry = [];
							txnmyCountry.push(tour.workspace.taxonomy[txVocId.Country]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.Country])){
							txnmyCountry = tour.workspace.taxonomy[txVocId.Country];
						} else {
							txnmyCountry = [];
						}
					}
					if(util.isNullOrUndefined(tour.workspace.taxonomy[txVocId.isoworldregion])){
						txnmyIsoWorldRegion = [];
					} else {
						if(0 === tour.workspace.taxonomy[txVocId.isoworldregion].length){
							txnmyIsoWorldRegion = [];
						} else if('string' === typeof tour.workspace.taxonomy[txVocId.isoworldregion]){
							txnmyIsoWorldRegion = [];
							txnmyIsoWorldRegion.push(tour.workspace.taxonomy[txVocId.isoworldregion]);
						} else if(Array.isArray(tour.workspace.taxonomy[txVocId.isoworldregion])){
							txnmyIsoWorldRegion = tour.workspace.taxonomy[txVocId.isoworldregion];
						} else {
							txnmyIsoWorldRegion = [];
						}
					}
					txnmyIsoWorldRegion = []; //initialize this taxonomy based on tour info for the first time execution
					
					tour.update = false;

					if(tour.loc.continent.length !== 0){
						var continentTermId = txTermsId.isoworldregion[tour.loc.continent];
						if(-1 === txnmyIsoWorldRegion.indexOf(continentTermId)){
							txnmyIsoWorldRegion.push(continentTermId);
							tour.update = true;
						}
					}
					if(tour.loc.country.length !== 0){
						var countryTermId = txTermsId.Country[tour.loc.country];
						if(-1 === txnmyCountry.indexOf(countryTermId)){
							txnmyCountry.push(countryTermId);
							tour.update = true;
						}
					}
					/*
					if(tour.loc.neighborhood.length !== 0){
						var neighborhoodTermId = txTermsId.Neighborhood[tour.loc.neighborhood];
						if(-1 === txnmyNeighborhood.indexOf(neighborhoodTermId)){
							txnmyNeighborhood.push(neighborhoodTermId);
							tour.update = true;
						}
					}
					*/
					if(tour.loc.city.length !== 0){
						var cityTermId = txTermsId.City[tour.loc.city];
						if(-1 === txnmyDepartFrom.indexOf(cityTermId)){
							txnmyDepartFrom.push(cityTermId);
							tour.update = true;
						}
					}
					/*
					if(tour.loc.state.length !== 0){
						var stateTermId = txTermsId.City[tour.loc.state];
						if(-1 === txnmyDepartFrom.indexOf(stateTermId)){
							txnmyDepartFrom.push(stateTermId);
							tour.update = true;
						}
					}
					if(tour.loc.locality.length !== 0){
						var localityTermId = txTermsId.City[tour.loc.locality];
						if(-1 === txnmyDepartFrom.indexOf(localityTermId)){
							txnmyDepartFrom.push(localityTermId);
							tour.update = true;
						}
					}
					*/

					tour.workspace.taxonomy[txVocId.isoworldregion] = txnmyIsoWorldRegion;
					tour.workspace.taxonomy[txVocId.Country] = txnmyCountry;
					tour.workspace.taxonomy[txVocId.City] = txnmyDepartFrom;
					//tour.workspace.taxonomy[txVocId.neighborhood] = txnmyNeighborhood;

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
					fs.writeFileSync('./logs/UpdateTourTXByGeoInfo - updateLog - '+ targetEnv + '.log', toursUpdateLog);
					if(!operateDB){
						fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-toursWithCoordinateDBRecords - '+ targetEnv + '.json', JSON.stringify(toursWithCoordinateDBRecords));
						fs.writeFileSync('./datafiles/UpdateTourTXByGeoInfo-toursWithCityCountryCodeDBRecords - '+ targetEnv + '.json', JSON.stringify(toursWithCityCountryCodeDBRecords));
					}
					console.log(' *************************************************************************************************');
					console.log(' *** Taxonomies iso world region, State / Province, Country, City have been set to Tours ***');
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
	})
}

//DB definition/value
//
// exports.run = (tEnv, dbOPS) => {
// 	dbOPSwitch = dbOPS;
buUtil.getMongoDBUrl(targetEnv, dbOPSwitch, (env, op, mUrl) => {
// buUtil.getMongoDBUrl(tEnv, dbOPS, (env, op, mUrl) => {
	targetEnv = env;
	operateDB = op;
	mdbUrl = mUrl;

	if(fs.existsSync('./mapping/toursWithCoordinate-'+ targetEnv +'.json')){
		toursWithCoordinate = require('./mapping/toursWithCoordinate-'+ targetEnv +'.json');	
	}

	if(fs.existsSync('./mapping/toursWithCityCountryCode-'+ targetEnv +'.json')){
		toursWithCityCountryCode = require('./mapping/toursWithCityCountryCode-'+ targetEnv +'.json');	
	}

	main()
})
// }

