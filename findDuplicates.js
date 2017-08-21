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

let dataPreparation = () => {
	MongoClient.connect(mdbUrl, (err, db) => {
		if(null === err) console.log("Connected successfully to server - " + mdbUrl);

		var collection = db.collection('Contents');
		var collection2 = db.collection('ContentTypes');

		collection.find().project({_id:1, text:1, typeId:1, online:1, createTime:1, lastUpdateTime:1}).toArray()
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
		if(contentsName.indexOf(opCnt.text+'-'+opCnt.typeId, startPos+1) === -1){
			return
		}

		console.log(opCnt.text + ' - ' + cntTypes[opCnt.typeId] + ' - ' + opCnt._id.toString() + ' - ' +  opCnt.createTime + ' - ' +  opCnt.lastUpdateTime )
		compareContents.forEach( (compareCnt, compareCntIdx) => {
			if(compareCntIdx === opCntIdx){
				return
			}

			if(compareCnt.text === opCnt.text && compareCnt.typeId === opCnt.typeId){
				opCntLog += '----  ' + compareCnt.text + ' - ' + cntTypes[compareCnt.typeId] + ' - ' + compareCnt._id.toString() + ' - ' +  compareCnt.createTime + ' - ' + compareCnt.lastUpdateTime + '\n'
				console.log('----  ' + compareCnt.text + ' - ' + cntTypes[compareCnt.typeId] + ' - ' + compareCnt._id.toString() + ' - ' +  compareCnt.createTime + ' - ' +  compareCnt.lastUpdateTime)
			}
		})

		duplicatesLog += opCntLog + '\n'
	})

	fs.writeFileSync('./log/findDuplicates.log', duplicatesLog);
}

dataPreparation()
