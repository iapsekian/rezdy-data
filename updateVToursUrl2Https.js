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
var ctnTypeName = ['VTours'];

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
			qryFilter: {},
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
		console.log('Index = %s, VTour name - %s', i+1, content.text)

		if(content.workspace.fields.ProductImage){
			if(!util.isNull(content.workspace.fields.ProductImage.match(/^http\:\/\//))){
				content.workspace.fields.ProductImage = content.workspace.fields.ProductImage.replace('http://','https://')
				updateFlag = true
			}
		}
		if(content.workspace.fields.ProductURL){
			if(!util.isNull(content.workspace.fields.ProductURL.match(/^http\:\/\//))){
				content.workspace.fields.ProductURL = content.workspace.fields.ProductURL.replace('http://','https://')
				updateFlag = true
			}
		}
		if(content.workspace.fields.AvgRatingStarURL){
			if(!util.isNull(content.workspace.fields.AvgRatingStarURL.match(/^http\:\/\//))){
				content.workspace.fields.AvgRatingStarURL = content.workspace.fields.AvgRatingStarURL.replace('http://','https://')
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