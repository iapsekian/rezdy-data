/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

//console.log('process.argv = ' + process.argv);
//var operateDB = process.argv.slice(2)[0] === 'OPDB' ? true : false;
//console.log('operateDB = ' + operateDB);
//
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

//base configuration

var debugDev = debug('dev');
var tours = [];
var attractions = [];
var taxonomyTerms = [];
var attIdThemesMap = {};
var toursCount = 0;
var toursUpdateLog = '', tourNoAttIdLog = '', tourWAttIdWOThemes = '';
var toursUpdateLogCount = 0, tourNoAttIdLogCount = 0, tourWAttIdWOThemesCount = 0;



//DB definition/value

var mdbUrl = '';

if(productionEnv){
	mdbUrl = 'mongodb://52.25.67.91:27017/bookurdb';
} else if (testEnv){
	mdbUrl = 'mongodb://tst.tourbooks.cc:27017/tourbooks';
}


var contentTypeId = {
	"attraction" : "57ea19736d0e81454c7b23d2",
	"tours" : "58785c576d0e815f4014b288"
};

var taxonomyVocabularyId = {
	"regionCityId": "57b18d746d0e81e174c66328",
	"attractionId": "57b18d746d0e81e174c6632e",
	"themes" : "57ea19736d0e81454c7b23d0"
};

MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server - " + mdbUrl);

	var collection = db.collection('Contents');
	var collection1 = db.collection('TaxonomyTerms');

	var preparingData = () => {
		var dataReadyCountDown = 3;

		var wait4DataPreparationReady = () => {
			dataReadyCountDown--;
			if(dataReadyCountDown === 0){
				processingTours();
			}
		};

		var queryParam4Tours = { "typeId" : contentTypeId.tours };
		var queryParam4Attractions = { "typeId" : contentTypeId.attraction };
		var queryParam4TxnmyTerms = {"vocabularyId":{$in:[taxonomyVocabularyId.themes,taxonomyVocabularyId.attractionId]}};
		var projectParam4Tours = {
			'_id':1,
			'text':1,
			'workspace':1,
			'live':1
		};
		var projectParam4Attractions = {
			'_id':0,
			'text':1,
			'workspace.taxonomy':1
		};
		var projectParam4TxnmyTerms = {
			'_id':1,
			'text':1
		};

		collection.find(queryParam4Tours).project(projectParam4Tours).toArray()
			.then( (d) => {
				toursCount = d.length;
				tours = d;
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export all tours to an array Exception - ' + e);
			});

		collection.find(queryParam4Attractions).project(projectParam4Attractions).toArray()
			.then( (d) => {
				attractions = d;
				wait4DataPreparationReady(); 
			})
			.catch( (e) => {
				console.log('Export all attractions to an array Exception - ' + e);
			});

		collection1.find(queryParam4TxnmyTerms).project(projectParam4TxnmyTerms).toArray()
			.then( (d) => {
				taxonomyTerms = d;
				wait4DataPreparationReady(); 
			})
			.catch( (e) => {
				console.log('Export taxonomy terms to an array Exception - ' + e);
			});
	};

	var processingTours = () => {

		var getTermByTxnmyObjId = (objId) => {
			debugDev('===> getTermByTxnmyObjId()');
			for (var i = 0; i < taxonomyTerms.length; i++) {
				if(objId === taxonomyTerms[i]._id.toString()){
					return taxonomyTerms[i].text;
				}
			}
		};

		var getAttNameByAttractionIdTerm = (objId) => {
			debugDev('===> getAttNameByAttractionIdTerm()');
			var  attName = '';
			for (var i = 0; i < attractions.length; i++) {
				var attId = attractions[i].workspace.taxonomy[taxonomyVocabularyId.attractionId];
				if(util.isNullOrUndefined(attId)){
					attId = '';
				} else {
					attId = attractions[i].workspace.taxonomy[taxonomyVocabularyId.attractionId][0];
					if(util.isNullOrUndefined(attId)){
						attId = '';
					}
				}
				if(objId === attId){
					attName =  attractions[i].text;
				}
			}
			return attName;
		};

		var wait4AllToursComplete = () => {
			toursCount--;
			debugDev('toursCount = ' + toursCount);
			if(0 === toursCount){
				toursUpdateLog += 'Total Count = ' + toursUpdateLogCount+'\n';
				tourWAttIdWOThemes += 'Total Count = ' + tourWAttIdWOThemesCount+'\n';
				tourNoAttIdLog += 'Total Count = ' + tourNoAttIdLogCount+'\n';
			    fs.writeFileSync('./logs/syncThemesWithTours-withAttIdNThemes-'+ targetEnv +'.log', toursUpdateLog);
			    fs.writeFileSync('./logs/syncThemesWithTours-withAttIdOnly-'+ targetEnv +'.log', tourWAttIdWOThemes);
			    fs.writeFileSync('./logs/syncThemesWithTours-withoutAttId-'+ targetEnv +'.log', tourNoAttIdLog);
				persistTours2MDB();
			}
		};

		var logNoThemes = false; // flag for tour with attraction id but no themes

		tours.forEach( (tour) => {
			debugDev('Tour name = ' + tour.text);
			tour.updated = false; // a flag for determining if this record needs to be updated
			logNoThemes = true;

			var txnmyThemesTerms = tour.workspace.taxonomy[taxonomyVocabularyId.themes];
			if(util.isNullOrUndefined(txnmyThemesTerms) || txnmyThemesTerms.length === 0){
				txnmyThemesTerms = [];
			}

			var attractionIdTerms = tour.workspace.taxonomy[taxonomyVocabularyId.attractionId];
			if(util.isNullOrUndefined(attractionIdTerms) || attractionIdTerms.length === 0){
				attractionIdTerms = [];
			}

			/*
			if(tour.text === 'Paris, Brussels and Amsterdam Tour'){
				console.log('Debug Starting....');
			}*/

			if(attractionIdTerms.length !== 0){
				attractionIdTerms.forEach((attIdTerm) => {					
					debugDev('attIdTerm = ' + attIdTerm);
					/*if(attIdTerm === '57b18d8c6d0e81e174c66e94'){
						console.log('break point');
					}*/
					attractions.forEach((attraction) => { //asume there is the only one attraction id for each attraction
						var tmpAttIdTerm = attraction.workspace.taxonomy[taxonomyVocabularyId.attractionId];
						if(util.isNullOrUndefined(tmpAttIdTerm)){
							tmpAttIdTerm = '';
						} else {
							tmpAttIdTerm = attraction.workspace.taxonomy[taxonomyVocabularyId.attractionId][0];
							if(util.isNullOrUndefined(tmpAttIdTerm)){
								tmpAttIdTerm = '';
							}
						}
						if(attIdTerm === tmpAttIdTerm){
							var tmpTxnmyThemesTerms = attraction.workspace.taxonomy[taxonomyVocabularyId.themes];
							if(!util.isNullOrUndefined(tmpTxnmyThemesTerms) && tmpTxnmyThemesTerms.length !== 0){
								tmpTxnmyThemesTerms.forEach((tmpTxnmyThemesTerm)=>{
									if(txnmyThemesTerms.indexOf(tmpTxnmyThemesTerm) === -1){
										txnmyThemesTerms.push(tmpTxnmyThemesTerm);
										tour.updated = true;
										logNoThemes = false;
									}
								});
							}
						}
					});
				});
			} else {
				tourNoAttIdLog += 'Tour - ' + tour.text + " - taxonomy attration id hasn't been set!\n";
				tourNoAttIdLogCount++;
				logNoThemes = false;
			}

			if(tour.updated){
				debugDev('===> tour.updated = true');
				tour.workspace.taxonomy[taxonomyVocabularyId.themes] = txnmyThemesTerms;
				tour.live.taxonomy[taxonomyVocabularyId.themes] = txnmyThemesTerms;
				toursUpdateLog += 'Tour - ' + tour.text + ' - with taxonomy attraction id and taxonomy Themes.\n';
				attractionIdTerms.forEach((attIdTerm)=>{
					toursUpdateLog += '		--- ' + getTermByTxnmyObjId(attIdTerm) + ' - ' + getAttNameByAttractionIdTerm(attIdTerm) +'\n';
					attractions.forEach((attraction) => {
						var tmpAttIdTerm = attraction.workspace.taxonomy[taxonomyVocabularyId.attractionId];
						if(util.isNullOrUndefined(tmpAttIdTerm)){
							tmpAttIdTerm = '';
						} else {
							tmpAttIdTerm = attraction.workspace.taxonomy[taxonomyVocabularyId.attractionId][0];
							if(util.isNullOrUndefined(tmpAttIdTerm)){
								tmpAttIdTerm = '';
							}
						}
						if(attIdTerm === tmpAttIdTerm){
							var tmpTxnmyThemesTerms = attraction.workspace.taxonomy[taxonomyVocabularyId.themes];
							if(!util.isNullOrUndefined(tmpTxnmyThemesTerms) && tmpTxnmyThemesTerms.length !== 0){
								tmpTxnmyThemesTerms.forEach((tmpTxnmyThemesTerm)=>{
									toursUpdateLog += '			--- ' + getTermByTxnmyObjId(tmpTxnmyThemesTerm) + '\n';
								});								
							}							
						}						
					});
				});
				toursUpdateLogCount++;
			}

			if(logNoThemes){
				debugDev('===> logNoThemes');
				tourWAttIdWOThemes += 'Tour - ' + tour.text + ' - with taxonomy attraction id but no taxonomy Themes.\n';
				attractionIdTerms.forEach((attIdTerm)=>{
					tourWAttIdWOThemes += '		--- ' + getTermByTxnmyObjId(attIdTerm) + ' - ' + getAttNameByAttractionIdTerm(attIdTerm) +'\n';
				});
				tourWAttIdWOThemesCount++;
			}

			wait4AllToursComplete();
		});

	};

	var persistTours2MDB = () => {

		toursCount = tours.length;
		var modifiedCount = 0;

		var wait4PersistenceComplete = () => {
			toursCount--;
			if(0 === toursCount){
				db.close();
				toursUpdateLog += 'Total Modified Count = ' + modifiedCount;
			    fs.writeFileSync('./logs/syncThemesWithTours-withAttIdNThemes-'+ targetEnv +'.log', toursUpdateLog);
			    console.log('**************************************************************************');
			    console.log('****  Taxonomy Themes Sync Completed between Tours and Attractions  ******');
			    console.log('**************************************************************************');
			}
		};
		
		toursUpdateLog += '\n\n\n';

		tours.forEach( (tour) => {
			if(tour.updated){
				var filter = {_id:tour._id};
				var updateField = {};
				updateField.workspace = tour.workspace;
				updateField.live = tour.live;
				var update = {$set: updateField};

				if(operateDB){					
					collection.updateOne(filter, update)
						.then((r) => {
							if(r.modifiedCount !== 0){
								modifiedCount += r.modifiedCount;
								toursUpdateLog += 'Tour - ' + tour.text + ' - has been modified !\n';
							}
							wait4PersistenceComplete();
						})
						.catch((e) => {
							console.log('update tour taxonomy themes error!  ' + e);
						});
				} else {
					wait4PersistenceComplete();
				}
			} else {
				wait4PersistenceComplete();
			}
		});
	};

	//Starting point
	preparingData();
});
