/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
const util = require('util');
var MongoClient = require('mongodb').MongoClient;

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

let dataPreparation = () => {
	MongoClient.connect(mdbUrl, (err, db) => {
		if(null === err) console.log("Connected successfully to server - " + mdbUrl);

		var collection = db.collection('Contents');
		var collection2 = db.collection('ContentTypes');

		collection.find().project({_id:1, text:1, typeId:1, online:1, workspace: 1, createTime:1, lastUpdateTime:1, createUser:1, lastUpdateUser:1}).toArray()
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
				console.log('find contnet Types error!');
			})
		})
		.catch( (e)=>{
			console.log('find all contents error!');
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
			let kept = {}
			let remove = {}
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

					if(!kept){ //leave only one
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

					if(!kept){ //leave only one
						kept = remove
						toBeOffLineS.pop()
					}

					toBeKeptSLog += kept.text + ' - ' + cntTypes[kept.typeId] + ' - ' + kept._id.toString() + ' - ' + kept.lastUpdateUser.id + ' - ' + kept.createTime + ' - ' +  kept.lastUpdateTime + '\n'
					toBeKeptS.push(kept)
					break
					
				case '':
				default:
			}
		}

		let toBeKept = {}
		let opCntTested = false
		switch(cntTypes[opCnt.typeId]){
			case 'City':
				if(!opCntTested){
					if(opCnt.lastUpdateTime === opCnt.createTime && opCnt.lastUpdateTime > dateNumber && opCnt.lastUpdateUser.id === '55a4ab8b86c747a0758b4567'){
						toBeOffLineS.push(opCnt)
						toBeOffLineSLog += opCnt.text + ' - ' + cntTypes[opCnt.typeId] + ' - ' + opCnt._id.toString() + ' - ' +  opCnt.createTime + ' - ' +  opCnt.lastUpdateTime + '\n'
						toBeKept = JSON.parse(JSON.stringify(compareCnt))
					} else{
						toBeKept = JSON.parse(JSON.stringify(opCnt))
					}
					opCntTested = true
				}

				break

			case '':
				break
			default:
		}

	})

	fs.writeFileSync('./log/findDuplicates.log', duplicatesLog);
}

dataPreparation()
