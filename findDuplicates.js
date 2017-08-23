/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
const util = require('util');
var MongoClient = require('mongodb').MongoClient;
const buUtil = require('bookur-util')

var mdbUrl = 'mongodb://52.25.67.91:27017/bookurdb';
var duplicatesLog = '--- Log started ---\n';

var opContents = []
var compareContents = []
var contentsName = []
var cntTypes = {}
var validCntTypes = ['Country','Province','Attraction','City','City Details', 'Attraction Details','Country Details']
var validatedContents = []
var toBeOffLineS = []
var toBeKeptS = []
var toBeOffLineSLog = 'The list of to-be-offline ----\n\n'
var toBeKeptSLog = 'The list of to-be-kept ----\n\n'

let dateNumber = parseInt(((new Date('2017-7-31'))/1000).toFixed(0))

let execArgv = process.execArgv
var targetEnv = process.argv[2]
var dbOPSwitch = process.argv[3]

console.log('-------- findDuplicates.js.js - execArgv=%s - args: targetEnv=%s, dbOPSwitch=%s', process.execArgv, targetEnv, dbOPSwitch);

var operateDB = false;
// let mdbUrl

let dbParam = buUtil.getMDBParam(targetEnv, dbOPSwitch)
targetEnv = dbParam.targetEnv
operateDB = dbParam.operateDB
mdbUrl = dbParam.mdbUrl


let dataPreparation = () => {
	MongoClient.connect(mdbUrl, (err, db) => {
		if(null === err) console.log("Connected successfully to server - " + mdbUrl);

		var collection = db.collection('Contents');
		var collection2 = db.collection('ContentTypes');

		collection.find({online:true}).project({_id:1, text:1, typeId:1, online:1, workspace: 1, createTime:1, lastUpdateTime:1, createUser:1, lastUpdateUser:1}).toArray()
		.then( (d)=>{
			opContents = d.slice()
			compareContents = d.slice()
			d.forEach( item=>{
				contentsName.push(item.text+'-'+item.typeId)
			})

			collection2.find().project({_id:1, type:1}).toArray()
			.then( defs=>{
				defs.forEach(def=>{
					cntTypes[def._id.toString()] = def.type
				})

				db.close()
				dataComparison()				
			})
			.catch(e=>{
				console.log('find contnet Types error!'+e);
			})
		})
		.catch( (e)=>{
			console.log('find all contents error!'+e);
		})
	})
}

let dataComparison = () => {
	console.log('Compare Data Starting......');
	opContents.forEach( (opCnt, opCntIdx) => {
		if(validCntTypes.indexOf(cntTypes[opCnt.typeId]) === -1){
			return
		}

		if(validatedContents.indexOf(opCnt.text+'-'+opCnt.typeId) === -1){
			validatedContents.push(opCnt.text+'-'+opCnt.typeId)
		} else{
			return
		}

		let opCntLog = opCnt.text + ' - ' + cntTypes[opCnt.typeId] + ' - ' + opCnt._id.toString() + ' - ' +  opCnt.createTime + ' - ' +  opCnt.lastUpdateTime + '\n'

		let startPos = contentsName.indexOf(opCnt.text+'-'+opCnt.typeId)
		if(contentsName.indexOf(opCnt.text+'-'+opCnt.typeId, startPos+1) === -1){	//No Duplicates
			toBeKeptSLog += opCnt.text + ' - ' + cntTypes[opCnt.typeId] + ' - ' + opCnt._id.toString() + ' - ' +  opCnt.createTime + ' - ' +  opCnt.lastUpdateTime + '\n'
			toBeKeptS.push(opCnt)
			return
		}

		console.log(opCnt.text + ' - ' + cntTypes[opCnt.typeId] + ' - ' + opCnt._id.toString() + ' - ' +  opCnt.createTime + ' - ' +  opCnt.lastUpdateTime )

		if(opCnt._id.toString() === '597f48d365a57ae9b140a801'){
			console.log('bp1.....');
		}

		let testItems =[]
		testItems.push(opCnt)

		compareContents.forEach( (compareCnt, compareCntIdx) => {
			if(compareCntIdx === opCntIdx){
				return
			}

			if(compareCnt.text === opCnt.text && compareCnt.typeId === opCnt.typeId){
				opCntLog += '----  ' + compareCnt.text + ' - ' + cntTypes[compareCnt.typeId] + ' - ' + compareCnt._id.toString() + ' - ' +  compareCnt.createTime + ' - ' + compareCnt.lastUpdateTime + '\n'
				console.log('----  ' + compareCnt.text + ' - ' + cntTypes[compareCnt.typeId] + ' - ' + compareCnt._id.toString() + ' - ' +  compareCnt.createTime + ' - ' +  compareCnt.lastUpdateTime)
				testItems.push(compareCnt)
			}
		})

		duplicatesLog += opCntLog + '\n'

		if(testItems.length > 1){
			let kept
			let remove
			switch(cntTypes[opCnt.typeId]){
				case 'City':
					for (let i = 0; i < testItems.length; i++) {
						let testItem = testItems[i]
						if(testItem.lastUpdateTime === testItem.createTime && testItem.lastUpdateTime > dateNumber && testItem.lastUpdateUser.id === '55a4ab8b86c747a0758b4567'){
							toBeOffLineS.push(testItem)
							toBeOffLineSLog += testItem.text + ' - ' + cntTypes[testItem.typeId] + ' - ' + testItem._id.toString() + ' - ' + testItem.lastUpdateUser.id + ' - ' + testItem.createTime + ' - ' +  testItem.lastUpdateTime + '\n'
							remove = testItem
						} else{
							kept = testItem
						}
					}

					if(util.isNullOrUndefined(kept)){ //leave only one
						kept = remove
						toBeOffLineS.pop()
					}

					toBeKeptSLog += kept.text + ' - ' + cntTypes[kept.typeId] + ' - ' + kept._id.toString() + ' - ' + kept.lastUpdateUser.id + ' - ' + kept.createTime + ' - ' +  kept.lastUpdateTime + '\n'
					toBeKeptS.push(kept)
					break

				case 'City Details':
					for (let i = 0; i < testItems.length; i++) {
						let testItem = testItems[i]
						if(testItem.lastUpdateTime === testItem.createTime && testItem.lastUpdateTime > dateNumber && testItem.lastUpdateUser.id === '55a4ab8b86c747a0758b4567'){
							toBeOffLineS.push(testItem)
							toBeOffLineSLog += testItem.text + ' - ' + cntTypes[testItem.typeId] + ' - ' + testItem._id.toString() + ' - ' + testItem.lastUpdateUser.id + ' - ' + testItem.createTime + ' - ' +  testItem.lastUpdateTime + '\n'
							remove = testItem
						} else{
							kept = testItem
						}
					}

					if(util.isNullOrUndefined(kept)){ //leave only one
						kept = remove
						toBeOffLineS.pop()
					}

					toBeKeptSLog += kept.text + ' - ' + cntTypes[kept.typeId] + ' - ' + kept._id.toString() + ' - ' + kept.lastUpdateUser.id + ' - ' + kept.createTime + ' - ' +  kept.lastUpdateTime + '\n'
					toBeKeptS.push(kept)
					break
					
				default:
			}
		}
	})

	fs.writeFileSync('./log/findDuplicates-duplicates.log', duplicatesLog);
	fs.writeFileSync('./log/findDuplicates-toBeKeptS.log', toBeKeptSLog);
	fs.writeFileSync('./log/findDuplicates-toBeOffLineS.log', toBeOffLineSLog);

	if(toBeOffLineS.length){
		if(operateDB){
			dataProcessing()
		} else {
			fs.writeFileSync('./log/findDuplicates-toBeOffLineS.json', JSON.stringify(toBeOffLineS))
			fs.writeFileSync('./log/findDuplicates-toBeKeptS.json', JSON.stringify(toBeKeptS))
			console.log('Please review .json files in "log" dir!!')
		}
	} else{
		console.log('*** Nothing to do! Abort Now! ***')
	}
}

let dataProcessing = () => {
	let ctnsToursUpdLog = ''
	var dbConnection = MongoClient.connect(mdbUrl);

	dbConnection.then( (db) => {
		let cltContents = db.collection('Contents')

		let count = toBeOffLineS.length
		let wait4ctnsEnd = () => {
			count--
			if(!count){
				db.close()
				fs.writeFileSync('./log/findDuplicates-offlined.log', ctnsToursUpdLog)
				console.log('### findDuplicates.js Completed ###')
			}
		}

		toBeOffLineS.forEach( ctn => {
			//var objID = ObjectID.createFromHexString(ctn._id);
			var objID = ctn._id;
			var filter = { _id: objID};
			var updateField = {};

			updateField.online = false

			ctn.workspace.status = 'draft'
			updateField.workspace = ctn.workspace
			updateField.live = ctn.workspace
			var update = { $set: updateField }

			cltContents.updateOne(filter, update)
			.then((r) => {
				console.log('Content - ' + ctn._id.toString() + ' - ' + ctn.text + ' has been offlined successfully!');
				ctnsToursUpdLog += 'Content - ' + ctn._id.toString() + ' - ' + ctn.text + ' has been offlined successfully!' + '\n';
				wait4ctnsEnd();
			})
			.catch((e) => {
				console.log('Content - ' + ctn._id.toString() + ' - ' + ctn.text + ' failed to be offlined! - ' + e);
				ctnsToursUpdLog += 'Content - ' + ctn._id.toString() + ' - ' + ctn.text + ' failed to be offlined! - ' + e + '\n';
				wait4ctnsEnd();
			})
		})		
	})
}

dataPreparation()
