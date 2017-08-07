/*jshint esversion: 6 */

//This program appends existing data to Dict-main.json
//
//usage: node appendDictFromExisting.js 2017-08-03 [PRODUCTION] [OPDB]
//
//last execution: 2017-08-03

const fs = require('fs');
const debug = require('debug');
const debugDev = debug('dev');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const buUtil = require('./lib/bookurUtil.js')
const buUtil = require('bookur-util')
const dictionaryFilePath = './mapping/Dict-main.json'

let dictionary = {}
if(fs.existsSync(dictionaryFilePath))
	dictionary = require(dictionaryFilePath)
let dictionaryKey = []
if(dictionary)
	dictionaryKey = Object.keys(dictionary)

//always get existing data from PRODUCTION and dbOPSwitch is not used in this program
let execArgv = process.execArgv
var targetEnv = process.argv[3] ? process.argv[3] : 'PRODUCTION'
var dbOPSwitch = process.argv[4] ? process.argv[4] : 'OPDB'
let dateString = process.argv[2]
let dateAfter
if(dateString.length){
	dateAfter = parseInt(((new Date(dateString))/1000).toFixed(0))
}


var operateDB = false;
let mdbUrl

let dbParam = buUtil.getMDBParam(targetEnv, dbOPSwitch)
targetEnv = dbParam.targetEnv
operateDB = dbParam.operateDB
mdbUrl = dbParam.mdbUrl

//base configuration

var txVocName = ['State / Province'];
var ctnTypeName = ['Airport','Attraction','City','Country','Port of Call','Resort'];

var txVocNameCount = txVocName.length;
var ctnTypeNameCount = ctnTypeName.length;
var ctnProjection = {'_id':0, 'text': 1, 'online':1,'workspace.taxonomy':1};
var txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {}, toursNotExisted = [];

var cleanArray = (orig, callback) => {
	var newArray = new Array();
	var updFlag = false;
	for (var i = 0; i < orig.length; i++) {
		if(orig[i]){
			newArray.push(orig[i]);
		} else {
			updFlag = true;
		}
	}
	callback(updFlag ,newArray);
}

//for log
let duplicatesLog = 'Search Term Duplicates as below ------\n'
let appendLog = 'Search Term appended as below ------\n'

let isDictTermDuplicated = obj => {
	let searchTermArray = dictionary[obj.standardTerm]
	let count = searchTermArray.length
	let i =0
	let existed = false
	while(!existed && i < count){
		let item = searchTermArray[i]
		if(item.type === obj.type)	existed = true

		i++
	}
	return existed
}

var dataPreparation = () => {

	var dataReadyCount = 2;
	var wait4DataReady = () => {
		dataReadyCount--;
		if(!dataReadyCount){
			dataProcessing();
		}
	}

	// var getTXMap = require('./lib/getTXTermsMap.js');
	let options = {
		'txVocName': txVocName,
		//'txTermsFlag': true,
		//'reversedListing': false,
		'targetEnv': targetEnv,
		'dbOPSwitch': dbOPSwitch
	};

	buUtil.getTxTermsMap(options, (vocs,terms)=>{
		txVocId = vocs;
		txTermsId = terms;
		wait4DataReady();
	});

	// var getContentTypesId = require('./lib/getContentTypeId.js');
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
			qryFilter: {createTime: {$gte: dateAfter}},
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

var dataProcessing = () => {
	let stateProvince = Object.keys(txTermsId['State/Province'])
	let airport = contents['Airport']
	let city = contents['City']
	let country = contents['Country']
	let port = contents['PortofCall']
	let resort = contents['Resort']
	let attraction = contents['Attraction']

	stateProvince.forEach( item => {
		console.log('State / Province - %s, Dict Existing - %s', item, dictionaryKey.indexOf(item) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item) === -1){
			dictionaryKey.push(item)
			dictionary[item] = []
			let tmpObj = {
				type: "State / Province",
				standardTerm: item				
			}
			dictionary[item].push(tmpObj)
			appendLog += 'State / Province - ' + item + '\n'
		} else{
			let tmpObj = {
				type: "State / Province",
				standardTerm: item				
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item].push(tmpObj)
				appendLog += 'State / Province - ' + item + '\n'
			} else{
				duplicatesLog += 'State / Province - ' + item + '\n'
			}

		}
	})

	airport.forEach( item => {
		console.log('Airport - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "Airport",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'Airport - ' + item.text + '\n'
		} else{
			let tmpObj = {
				type: "Airport",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'Airport - ' + item.text + '\n'
			} else{
				duplicatesLog += 'Airport - ' + item.text + '\n'
			}

		}
	})

	attraction.forEach( item => {
		console.log('Attraction - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')

		if(item.text === 'National Parks'){ //problem attraction
			return
		}

		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "Attraction",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'Attraction - ' + item.text + '\n'

			//for UNESCO & National Park
			if(item.workspace.taxonomy['57ea19736d0e81454c7b23d0']){
				let txThemes = item.workspace.taxonomy['57ea19736d0e81454c7b23d0']
				let addUNESCOFlag = false
				let addNationalParkFlag = false
				if(txThemes.length){
					txThemes.forEach( id => {
						if(id === '57fa52016d0e817b2a5680a2'){ //World Heritage Site is
							addUNESCOFlag = true
						} else if(id === '57ea19746d0e81454c7b29f8'){ //National Park
							addNationalParkFlag = true
						}
					})
					if(addUNESCOFlag){
						tmpObj = {
							type: "UNESCO",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'UNESCO - ' + item.text + '\n'
						} else{
							duplicatesLog += 'UNESCO - ' + item.text + '\n'
						}
					}
					if(addNationalParkFlag){
						tmpObj = {
							type: "National-Park",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'National-Park - ' + item.text + '\n'
						} else{
							duplicatesLog += 'National-Park - ' + item.text + '\n'
						}
					}
				}
			}
		} else{
			let tmpObj = {
				type: "Attraction",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'Attraction - ' + item.text + '\n'
			} else{
				duplicatesLog += 'Attraction - ' + item.text + '\n'
			}

			//for UNESCO
			if(item.workspace.taxonomy['57ea19736d0e81454c7b23d0']){
				let txThemes = item.workspace.taxonomy['57ea19736d0e81454c7b23d0']
				let addUNESCOFlag = false
				let addNationalParkFlag = false
				if(txThemes.length){
					txThemes.forEach( id => {
						if(id === '57fa52016d0e817b2a5680a2'){ //World Heritage Site is
							addUNESCOFlag = true
						} else if(id === '57ea19746d0e81454c7b29f8'){ //National Park
							addNationalParkFlag = true
						}
					})
					if(addUNESCOFlag){
						tmpObj = {
							type: "UNESCO",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'UNESCO - ' + item.text + '\n'
						} else{
							duplicatesLog += 'UNESCO - ' + item.text + '\n'
						}
					}
					if(addNationalParkFlag){
						tmpObj = {
							type: "National-Park",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'National-Park - ' + item.text + '\n'
						} else{
							duplicatesLog += 'National-Park - ' + item.text + '\n'
						}
					}
				}
			}
		}
	})

	city.forEach( item => {
		console.log('City - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "City",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'City - ' + item.text + '\n'

			//for UNESCO
			if(item.workspace.taxonomy['57ea19736d0e81454c7b23d0']){
				let txThemes = item.workspace.taxonomy['57ea19736d0e81454c7b23d0']
				let addUNESCOFlag = false
				if(txThemes.length){
					txThemes.forEach( id => {
						if(id === '57fa52016d0e817b2a5680a2'){ //World Heritage Site is
							addUNESCOFlag = true
						}
					})
					if(addUNESCOFlag){
						tmpObj = {
							type: "UNESCO",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'UNESCO - ' + item.text + '\n'
						} else{
							duplicatesLog += 'UNESCO - ' + item.text + '\n'
						}
					}
				}
			}
		} else{
			let tmpObj = {
				type: "City",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'City - ' + item.text + '\n'
			} else{
				duplicatesLog += 'City - ' + item.text + '\n'
			}

			//for UNESCO
			if(item.workspace.taxonomy['57ea19736d0e81454c7b23d0']){
				let txThemes = item.workspace.taxonomy['57ea19736d0e81454c7b23d0']
				let addUNESCOFlag = false
				if(txThemes.length){
					txThemes.forEach( id => {
						if(id === '57fa52016d0e817b2a5680a2'){ //World Heritage Site is
							addUNESCOFlag = true
						}
					})
					if(addUNESCOFlag){
						tmpObj = {
							type: "UNESCO",
							standardTerm: item.text
						}
						if(!isDictTermDuplicated(tmpObj)){
							dictionary[item.text].push(tmpObj)
							appendLog += 'UNESCO - ' + item.text + '\n'
						} else{
							duplicatesLog += 'UNESCO - ' + item.text + '\n'
						}
					}
				}
			}
		}
	})

	country.forEach( item => {
		console.log('Country - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "Country",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'Country - ' + item.text + '\n'

		} else{
			let tmpObj = {
				type: "Country",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'Country - ' + item.text + '\n'
			} else{
				duplicatesLog += 'Country - ' + item.text + '\n'
			}
		}
	})

	port.forEach( item => {
		console.log('Port - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "Port",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'Port - ' + item.text + '\n'

		} else{
			let tmpObj = {
				type: "Port",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'Port - ' + item.text + '\n'
			} else{
				duplicatesLog += 'Port - ' + item.text + '\n'
			}
		}
	})

	resort.forEach( item => {
		console.log('Resort - %s, Dict Existing - %s', item.text, dictionaryKey.indexOf(item.text) ? 'true' : 'false')
		if(dictionaryKey.indexOf(item.text) === -1){
			dictionaryKey.push(item.text)
			dictionary[item.text] = []
			let tmpObj = {
				type: "Resort",
				standardTerm: item.text
			}
			dictionary[item.text].push(tmpObj)
			appendLog += 'Resort - ' + item.text + '\n'

		} else{
			let tmpObj = {
				type: "Resort",
				standardTerm: item.text
			}
			if(!isDictTermDuplicated(tmpObj)){
				dictionary[item.text].push(tmpObj)
				appendLog += 'Resort - ' + item.text + '\n'
			} else{
				duplicatesLog += 'Resort - ' + item.text + '\n'
			}
		}
	})

	fs.writeFileSync('./log/appendDictFromExisting-duplicates.log', duplicatesLog)
	fs.writeFileSync('./log/appendDictFromExisting-append.log', appendLog)
	fs.writeFileSync(dictionaryFilePath, JSON.stringify(dictionary))

	console.log('*** appendDictFromExisting.js Finished!! ***')
}

//Starting point

dataPreparation()
