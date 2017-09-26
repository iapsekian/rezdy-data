#!/usr/bin/env node --max_old_space_size=4096
/*jshint esversion: 6 */

//This program will generate taxonomy term values for Themes, Tour Destination and Price. The tour searching criteria is provided and defined in command line.
//The result will be saved as a json file for the next step - updateRezdyToursTXThemesTourDestPrice.js 
//
//
//usage: 	node genRezdyToursTXThemesTourDestPrice.js targetEnv dbOPSwitch dateString online status
//eg.: 		node genRezdyToursTXThemesTourDestPrice.js PRODUCTION OPDB
//eg.: 		node genRezdyToursTXThemesTourDestPrice.js PRODUCTION OPDB ALL true draft
//eg.: 		node genRezdyToursTXThemesTourDestPrice.js PRODUCTION OPDB 2017-08-04 true draft

const fs = require('fs');
const debug = require('debug');
const debugDev = debug('dev');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const buUtil = require('./lib/bookurUtil.js')
const buUtil = require('bookur-util')
const dictionaryFilePath = './mapping/Dict-main.json'
const dictTypeTXMappingFilePath = './mapping/Dict-typeTXVocName.json'
const resultFilePath = './mapping/genRezdyToursTXThemesTourDestPrice.json'
const curExTableFilePath = './mapping/curExTable.json'

let execArgv = process.execArgv
let targetEnv = process.argv[2]
let dbOPSwitch = process.argv[3]
let dateString = process.argv[4]
let onlineString = process.argv[5]
let statusString = process.argv[6]
let dateAfter
let qryFilter = {'workspace.fields.marketplace': {$in: ['Rezdy','Rezdy Self-Created']}}

if(util.isNullOrUndefined(dateString)){
	dateString = 'ALL'
} else {
	if(dateString.toLowerCase() === 'all'){
		dateString = 'ALL'
	} else{
		dateAfter = parseInt(((new Date(dateString))/1000).toFixed(0))
		qryFilter.createTime = {$gte: dateAfter}
	}
}
if(util.isNullOrUndefined(onlineString)){
	onlineString = 'ALL'
} else if(onlineString === 'true'){
	qryFilter.online = true
} else if(onlineString === 'false'){
	qryFilter.online = false	
}
if(util.isNullOrUndefined(statusString)){
	statusString = 'ALL'
} else if(statusString === 'draft'){
	qryFilter['workspace.status'] = 'draft'
} else if(statusString === 'published'){
	qryFilter['workspace.status'] = 'published'	
}

console.log('-------- genRezdyToursTXThemesTourDestPrice.js - execArgv=%s - args: targetEnv=%s, dbOPSwitch=%s, dateString=%s, online=%s, status=%s', process.execArgv, targetEnv, dbOPSwitch, dateString, onlineString, statusString)
console.log('-------- qryFilter = %s', JSON.stringify(qryFilter))


let operateDB = false;
let mdbUrl

let dbParam = buUtil.getMDBParam(targetEnv, dbOPSwitch)
targetEnv = dbParam.targetEnv
operateDB = dbParam.operateDB
mdbUrl = dbParam.mdbUrl

//base configuration

let txVocName = ['Tour Destination','Themes','Price'];
let ctnTypeName = ['Tours'];

let txVocNameCount = txVocName.length;
let ctnTypeNameCount = ctnTypeName.length;
let ctnProjection = {'_id':0, 'text': 1, 'online':1,'workspace':1};
let txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {}, toursNotExisted = [];

let cleanArray = (orig, callback) => {
	let newArray = new Array();
	let updFlag = false;
	for (let i = 0; i < orig.length; i++) {
		if(orig[i]){
			newArray.push(orig[i]);
		} else {
			updFlag = true;
		}
	}
	callback(updFlag ,newArray);
}

let dict, 
	dictTXMap,
	curExTable,
	result = [], 
	searchTerms = [], 
	processingLog = 'Successful Data Processing as below ......\n', 
	processingERRLog = 'Error happened during data processing as below ........\n'

let dataPreparation = () => {
	console.log('Enter data preparation ......')

	if(fs.existsSync(dictionaryFilePath)){
		dict = require(dictionaryFilePath)
		searchTerms = Object.keys(dict)
	} else{
		console.log('... Lacking of dictionary file! Abort!! ...')
		process.exist(1)
	}
	if(fs.existsSync(dictTypeTXMappingFilePath))
		dictTXMap = require(dictTypeTXMappingFilePath)
	else{
		console.log('... Lacking of dictionary Type and Taxonomy Mapping file! Abort!! ...')
		process.exist(1)
	}
	if(fs.existsSync(curExTableFilePath))
		curExTable = require(curExTableFilePath)
	else{
		console.log('... Lacking of currency exchange table file! Abort!! ...')
		process.exist(1)
	}

	let dataReadyCount = 1;
	let wait4DataReady = () => {
		dataReadyCount--;
		if(!dataReadyCount){
			console.log('Exit data preparation ......')
			dataProcessing();
		}
	}

	let options1 = {
		'ctnTypeName': ctnTypeName,
		'targetEnv': targetEnv,
		'dbOPSwitch': dbOPSwitch
	};

	buUtil.getContentTypesId(options1, (types)=>{
		ctnTypeId = types;

		// var getContents = require('./lib/getContents.js');
		let options2 = {
			ctnTypeId: ctnTypeId,
			qryFilter: qryFilter,
			projection: ctnProjection,
			targetEnv: targetEnv,
			dbOPSwitch: dbOPSwitch
		};
		buUtil.getContents(options2, (ctns)=>{
			contents = ctns;
			wait4DataReady();
		});
	});
}

let dataProcessing = () => {
	let ctns = contents.Tours
	let ctnsCount = ctns.length
	
	let searchTermMatching = (productCode, text, currency, price, cb) => {
		let go = true
		let err = ''
		let res = {}

		if(productCode.length){
			res['Tour Code'] = productCode
			res['Themes'] = []
			res['Tour Destination'] = []
			res.Price = ''
		} else{
			err += 'Tour product code is required. Nothing to do!!'
			console.log(err)
			go = false
		}
		if(!text.length){
			err += 'Base Text for comparison is required. Nothing to do!!'
			console.log(err)
			go = false
		}

		if(go){
			searchTerms.forEach( searchTerm => {
				if(searchTerm === '[no name]'){
					return
				}

				let regex = new RegExp(searchTerm, 'g')
				let testFlag = regex.test(text)
				if(testFlag){
					let dictContents = dict[searchTerm]
					dictContents.forEach( dictContent => {
						let arrTX = dictTXMap[dictContent.type]
						arrTX.forEach( tx => {
							switch(tx){
								case 'Tour Destination':
									if(res['Tour Destination'].indexOf(dictContent.standardTerm) === -1){
										res['Tour Destination'].push(dictContent.standardTerm)
									}
									break

								case 'Themes':
									if(dictContent.type === 'Category'){
										if(res['Themes'].indexOf(dictContent.standardTerm) === -1){
											res['Themes'].push(dictContent.standardTerm)
										}										
									} else if(dictContent.type === 'Port'){
										let stdTerm = 'Water Sports'
										if(res['Themes'].indexOf(stdTerm) === -1){
											res['Themes'].push(stdTerm)
										}										
									} else if(dictContent.type === 'UNESCO'){
										let stdTerm = 'World Heritage Site'
										if(res['Themes'].indexOf(stdTerm) === -1){
											res['Themes'].push(stdTerm)
										}																				
									} else if(dictContent.type === 'National-Park'){
										let stdTerm = 'National Park'
										if(res['Themes'].indexOf(stdTerm) === -1){
											res['Themes'].push(stdTerm)
										}																				
									}
									break

								default:
							}
						})
					})
				}
			})

			if(!util.isNullOrUndefined(currency)){
				if(!util.isNullOrUndefined(curExTable[currency])){
					let curExRate = curExTable[currency]
					let usdPrice = price > 0 ? price/curExRate : -1
					if(usdPrice <= 0)
						res.Price = ''
					if(usdPrice > 0 && usdPrice <= 50)
						res.Price = '$'
					else if(usdPrice > 50 && usdPrice <= 150)
						res.Price = '$$'
					else if(usdPrice > 150 && usdPrice <= 300)
						res.Price = '$$$'
					else if(usdPrice > 300)
						res.Price = '$$$'
				}
			}
		}

		cb(err, res)
	}

	let wait4ctnsEnd = () => {
		ctnsCount--
		if(!ctnsCount){
			endProgram()
		}
	}

	let start = () => {
		ctns.forEach( (ctn,idx) => {
			console.log('Tour name: %s, Product Code = %s, Count = %s', ctn.text, ctn.workspace.fields.productCode, idx+1)

			let text = ctn.workspace.i18n.en.fields.text + '.'
						+ ctn.workspace.i18n.en.fields.shortDescription + '.' 
						+ ctn.workspace.i18n.en.fields.description ? ctn.workspace.i18n.en.fields.description.replace(/<.*?>/g,'') : ''

			searchTermMatching(ctn.workspace.fields.productCode, text, ctn.workspace.fields.currency, ctn.workspace.fields.advertisedPrice, (err, res) => {
				if(!err){
					if(res){
						result.push(res)
					}
				} else{
					console.log('Search Terms Matching ERR! - Tour Name: %s. Please check! Error Message - %s', ctn.text, err)
					processingERRLog += 'Search Terms Matching ERR! - Tour Name: ' + ctn.text + '. Please check! Error Message - ' + err + '\n'
				}
				wait4ctnsEnd()
			})
		})
	}

	// dataProcessing() starting point
	if(ctns.length){
		start()
	} else {
		console.log('Nothing to do, ESCAPE.....');
		endProgram();
	}
}

let endProgram = () => {
	fs.writeFileSync('./log/genRezdyToursTXThemesTourDestPrice-Success-'+targetEnv+'.log', processingLog)
	fs.writeFileSync('./log/genRezdyToursTXThemesTourDestPrice-Error-'+targetEnv+'.log', processingERRLog)

	if(result.length){
		fs.writeFileSync(resultFilePath, JSON.stringify(result))
	}
	console.log('*** genRezdyToursTXThemesTourDestPrice.js Finished!! ***')

	if(operateDB){
		if(result.length){
			console.log('***********************')
			console.log('******	Next Step ******')
			console.log('***********************')
			console.log('\n-----------------------------------------------------------------------------------------')
			console.log('****** Now will run "updateRezdyToursTXThemesTourDestPrice.js" AUTOMATICALLY!! ******')
			console.log('-----------------------------------------------------------------------------------------\n')

			let args = []
			let options = {}

			options.execArgv = execArgv.slice()
			args.push(targetEnv)
			args.push(dbOPSwitch)		
			buUtil.runScript('./updateRezdyToursTXThemesTourDestPrice.js', args, options, err => {
				if(err)	
					throw err
				else {
					console.log('\n--- updateRezdyToursTXThemesTourDestPrice.js Completed!\n')
				}
			})
		} else {
			console.log('\n******************************************************************************************************************************************')
			console.log('******	Since %s file is empty, there is no need to go next. ******', resultFilePath)
			console.log('******************************************************************************************************************************************\n')
		}
	} else{
		console.log('\n****************************************************************************************')
		console.log('******	Since operateDB is false, there is no need to go next. Program Terminated! ******')
		console.log('****************************************************************************************\n')		
	}

}

//Starting point

dataPreparation()

