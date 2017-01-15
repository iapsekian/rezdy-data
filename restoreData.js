/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

var mdbUrl = 'mongodb://tst.tourbooks.cc:27017/tourbooks1207';

var contentTypeId = {
	"city" : "57ed26a06d0e810b357b23c7"
};



MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server");	

	var collection = db.collection('Contents_0111');
	var collection1 = db.collection('Contents');

	var cityCount = 0;

	var wait4CityComplete = () => {
		cityCount--;
		if(0 === cityCount){
			db.close();
			console.log('*** All Complete! ***');
		}
	};

	var projectParam = {
		_id:1,
		text:1,
		workspace:1,
		live:1
	};

	var queryParam4City = { "typeId" : contentTypeId.city };
	collection.find(queryParam4City).project(projectParam).toArray()
		.then((d) => {
			cityCount = d.length;

			d.forEach((item) => {
				var filter = { _id:item._id};
				var tValue = [];
				var updateField = {};
				updateField.workspace = item.workspace;
				updateField.live = item.live;
				var update = {
						$set: updateField
					};
				collection1.updateOne(filter, update)
					.then((r) => {
						wait4CityComplete();
					})
					.catch((e) => {
						console.log('insert city taxonomy error!  ' + e);
					});
			});
		})
		.catch((e) => {
			console.log('find city error! ' + e);
		});
});