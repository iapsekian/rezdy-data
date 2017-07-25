/*jshint esversion: 6 */

const fs = require('fs');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const buUtil = require('./lib/bookurUtil.js')

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

var txVocName = [];
var ctnTypeName = ['Tours'];

var txVocNameCount = txVocName.length;
var ctnTypeNameCount = ctnTypeName.length;
var ctnProjection = {'_id':1, 'text': 1, 'workspace':1};
var txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {}, toursNotExisted = [];

let start = async () => {
	try{
		let options = {
			mdbUrl: mdbUrl,
			ctnTypeName: ctnTypeName,
			reversedListing: false
		}
		ctnTypeId = await buUtil.getContentTypesIdAsync(options)
	} catch(err){
		console.log('Get content type id error !! Abort!....' + err)
		throw err
		return
	}

	try{
		let options = {
			mdbUrl: mdbUrl,
			ctnTypeId: ctnTypeId,
			qryFilter: { 'workspace.fields.marketplace': 'Viator' },
			projection: ctnProjection
		}
		contents = await buUtil.getContentsAsync(options)
	} catch(err){
		console.log('Get contents error !! Abort!....' + err)
		throw err
		return
	}

	let count = contents.Tours.length
	console.log('Total count = %s', count)
	let i = 0
	while(i < count){
		let updateFlag = false
		let content = contents.Tours[i]
		console.log('Index = %s, Tour name - %s, marketplace - %s', i+1, content.text, content.workspace.fields.marketplace)

		if(content.workspace.fields.calendarWidgetUrl){
			if(!util.isNull(content.workspace.fields.calendarWidgetUrl.match(/^http\:\/\//))){
				content.workspace.fields.calendarWidgetUrl = content.workspace.fields.calendarWidgetUrl.replace('http://','https://')
				updateFlag = true
			}
		}
		if(content.workspace.fields.productPageUrl){
			if(!util.isNull(content.workspace.fields.productPageUrl.match(/^http\:\/\//))){
				content.workspace.fields.productPageUrl = content.workspace.fields.productPageUrl.replace('http://','https://')
				updateFlag = true
			}
		}
		if(content.workspace.fields.photoPath){
			if(!util.isNull(content.workspace.fields.photoPath.match(/^http\:\/\//))){
				content.workspace.fields.photoPath = content.workspace.fields.photoPath.replace('http://','https://')
				updateFlag = true
			}
		}

		if(updateFlag)
			content.live = content.workspace

		let res
		if(updateFlag && operateDB){
			console.log('Entering updating process.....')
			res = await buUtil.updateSingleContent(mdbUrl, {_id: content._id}, {$set: content})
			console.log('res = %s', JSON.stringify(res))
		}

		i++
	}
	console.log('Total count = %s', count)
}

start()