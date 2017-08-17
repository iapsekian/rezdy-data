/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

var mdbUrl = 'mongodb://52.25.67.91:27017/bookurdb';

var contentTypeId = {
	"rTours" : "587866b06d0e810d4114b288" //contentType = RTours
};

var taxonomyVocabularyId = {
	"searchSelector" : "587863e56d0e81fb4014b289"
};


//delete taxonomy Search Selector in RTours

var debugDev = debug('dev');

MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server - " + mdbUrl);

	var collection = db.collection('Contents');

	var rToursCount = -1;

	var wait4RToursComplete = () => {
		rToursCount--;
		debugDev('RTours remains - ' + rToursCount);
		if(0 === rToursCount){
			db.close();
			console.log('*************************************');
			console.log('*********   All Complete!   *********');
			console.log('*************************************');
		}
	};

	var queryParam4RTours = { "typeId" : contentTypeId.rTours };
	collection.find(queryParam4RTours).toArray()
		.then( (d) => {
			rToursCount = d.length;
			debugDev('rToursCount = ' + rToursCount);

			d.forEach((item) => {
				if(undefined !== item.workspace.taxonomy[taxonomyVocabularyId.searchSelector]){
					delete item.workspace.taxonomy[taxonomyVocabularyId.searchSelector];
					delete item.live.taxonomy[taxonomyVocabularyId.searchSelector];

					var filter = { _id : item._id };
					var updateOptions = {};
					collection.updateOne(filter, item, updateOptions)
						.then( (r) =>{
							wait4RToursComplete();
						})
						.catch( (e) => {
							console.log('update RTours error - ' + item.text + ' - '+ e);
						});
				} else {
					wait4RToursComplete();
				}
			}); //end of d.forEach()
		}) //end of then()
		.catch((e) => {
			console.log('find RTours error! ' + e);
		}); //end of catch() and collection.find()

});