/*jshint esversion: 6 */

//this program converts Dict.csv to a json object then compares with Dict-main.json to add new records
//In case of any new dictionary item, you can edit Dict.csv directly then re-run this program
//
//Usage: node genDictionary.js
//
//Relevant program: appendDictFromExisting.js which will extract all related data from the existing data then append new records to Dict-main.json

const fs = require('fs')
const csv = require('csvtojson')
const csvFilePath = './mapping/Dict.csv'
const dictionaryFilePath = './mapping/Dict-main.json'

let dictJson = []
//format looks as below
// [
// {"Type":"Category","Standard Term":"Food Tour","Search Term":"Food Tour"},
// {"Type":"Category","Standard Term":"Food Tour","Search Term":"Foodie Tour"},
// {"Type":"Category","Standard Term":"Food Tour","Search Term":"Wine Tour"}
// ]
let dictionary = {}
if(fs.existsSync(dictionaryFilePath))
	dictionary = require(dictionaryFilePath)
let dictionaryKey = []
if(dictionary)
	dictionaryKey = Object.keys(dictionary)

//for log
let duplicatesLog = 'Search Term Duplicates as below ------\n'

let isDictTermDuplicated = obj => {
	if(dictionaryKey.indexOf(obj["Search Term"]) === -1)
		return false
	else{
		let searchTermArray = dictionary[obj["Search Term"]]
		let count = searchTermArray.length
		let i =0
		let existed = false
		while(!existed && i < count){
			let item = searchTermArray[i]
			if(item.type === obj["Type"])	existed = true

			i++
		}
		return existed
	}
}

let transformOrigin2Dict = () => {
	dictJson.forEach( item => {
		// {
		// 	searchTerm:[
		// 		{
		// 			type: item.Type,
		// 			standardTerm: item["Standard Term"]
		// 		},
		// 		{
		// 			type: item.Type,
		// 			standardTerm: item["Standard Term"]
		// 		}
		// 	]				
		// }
		
		if(!item["Search Term"])
			return

		if(!isDictTermDuplicated(item)){
			let searchTerm = item["Search Term"]
			dictionaryKey.push(searchTerm)

			let tmpObj = {}
			tmpObj.type = item["Type"]
			tmpObj.standardTerm = item["Standard Term"]
			if(!dictionary[searchTerm]){
				dictionary[searchTerm] = []
				dictionary[searchTerm].push(tmpObj)
			} else{
				if(dictionary[searchTerm].length)
					dictionary[searchTerm].push(tmpObj)
				else{
					dictionary[searchTerm] = []
					dictionary[searchTerm].push(tmpObj)
				}
			}
		} else{
			duplicatesLog += item["Search Term"] + ' - ' +JSON.stringify(item) + '\n'
		}
	})

	fs.writeFileSync('./log/genDictionary-duplicates.log', duplicatesLog)
	fs.writeFileSync(dictionaryFilePath, JSON.stringify(dictionary))
}

//Starting point

csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    dictJson.push(jsonObj)
})
.on('done',(err)=>{
	if(err){
		console.log('****** Convert %s to json format ERROR! NOW ABORT!! ******', csvFilePath)
	} else{
		transformOrigin2Dict();		
	}
})
