/*jshint esversion: 6 */

const fs = require('fs');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const buUtil = require('./lib/bookurUtil.js')
const buUtil = require('bookur-util')
const atts = require('./mapping/compareAttNoResult.json')

let execArgv = process.execArgv
var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];

var productionEnv = false;
var testEnv = false;
var operateDB = false;
let mdbUrl

let dbParam = buUtil.getMDBParam(targetEnv, dbOPSwitch)
targetEnv = dbParam.targetEnv
operateDB = dbParam.operateDB
mdbUrl = dbParam.mdbUrl

//base configuration

// var txVocName = [];
// var ctnTypeName = ['Attraction'];

// var txVocNameCount = txVocName.length;
// var ctnTypeNameCount = ctnTypeName.length;
// var ctnProjection = {'_id':1, 'text': 1, 'online':1};
// var txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {}, toursNotExisted = [];

let start = async () => {

	let count = atts.length
	console.log('Total count = %s', count)
	let i = 0
	let u = 0
	let nu = 0
	while(i < count){
		let att = atts[i]
		console.log('Index = %s, Att name - %s, wikiDataType - %s', i+1, att.bookurData, att.wikiDataType)

		if(att.wikiDataType === 'disambiguation'){
			let res
			if(operateDB){
				console.log('Entering put offline process.....')
				res = await buUtil.updateSingleContent(mdbUrl, {_id: ObjectID.createFromHexString(att.bookurDataId)}, {$set: {'online': false}})
				console.log('res = %s', JSON.stringify(res))
				u++
			}
		} else{
			nu++
		}

		i++
	}
	console.log('Total updated count = %s', u)
	console.log('Total disambiguation count = %s', nu)
}

start()