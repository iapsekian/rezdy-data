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

let dataPreparation = () => {
	MongoClient.connect(mdbUrl, (err, db) => {
		if(null === err) console.log("Connected successfully to server - " + mdbUrl);

		var collection = db.collection('Contents');

		collection.find().project({_id:1, text:1, online:1}).toArray()
		.then( (d)=>{
			opContents = d.slice()
			compareContents = d.slice()
			d.forEach( item=>{
				contentsName.push(item.text)
			})
			db.close()
			dataComparison()
		})
		.catch( (e)=>{
			console.log('find all contents error!');
		})
	})
}

let dataComparison = () => {
	console.log('Compare Data Starting......');
	opContents.forEach( (opCnt, opCntIdx) => {
		let opCntLog = opCnt.text + ' - ' + opCnt._id.toString() + '\n'

		let startPos = contentsName.indexOf(opCnt.text)
		if(contentsName.indexOf(opCnt.text, startPos+1) === -1){
			return
		}

		console.log(opCnt.text + ' - ' + opCnt._id.toString())
		compareContents.forEach( (compareCnt, compareCntIdx) => {
			if(compareCntIdx === opCntIdx){
				return
			}

			if(compareCnt.text === opCnt.text){
				opCntLog += '----  ' + compareCnt.text + ' - ' + compareCnt._id.toString() + '\n'
				console.log('----  ' + compareCnt.text + ' - ' + compareCnt._id.toString())
			}
		})

		duplicatesLog += opCntLog + '\n'
	})

	fs.writeFileSync('./log/findDuplicates.log', duplicatesLog);
}

dataPreparation()
