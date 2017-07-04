/*jshint esversion: 6 */

const https = require('https');
const fs = require('fs');
const debug = require('debug');
const debugDev = debug('dev');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// const getMongoDBUrl = require('./lib/bookurUtil.js').getMongoDBUrl
const buUtil = require('./lib/bookurUtil.js')

Array.prototype.clean = (deleteValue) => {
	for(let i = 0 ; i <this.length; i++) { 
		if(this[i] == deleteValue){ 
			this.splice(i, 1 ); 
			i--; 
		} 
	} 
	return this;
};

let targetEnv = process.argv.slice(2)[0];
let dbOPSwitch = process.argv.slice(3)[0];
let operateDB = false;
let mdbUrl = '';

//DB definition/value
let txVocName = ['Country'];
let txTermName = ['United States of America','United States'];
let ctnTypeName = ['Tours'];
let qryFilter = {"workspace.fields.marketplace":{$in:['Rezdy','Rezdy Self-Created']}};
let txTermIdUSA = '', txTermIdUS = '';
let ctnProjection = {'_id':1, 'text': 1, 'workspace':1};
let txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {};
let ctnsUpdateLog = ''
let ctnsUpdateLogCount = 0

let main = () => {
	contents = contents.Tours;
	let ctnsCount = contents.length
	let wait4AllContentsEnd = () => {
		ctnsCount--
		if(!ctnsCount){
			fs.writeFileSync('./logs/updateTXCountryUSA-'+targetEnv+'.log', ctnsUpdateLog);
			console.log('*** Updating Completed! Total updated count = %s ***', ctnsUpdateLogCount);
		}
	}

	contents.forEach( (content) => {
		if(content.workspace.taxonomy[txVocId.Country]){
			// let txTerms = content.workspace.taxonomy[txVocId.Country]
			let usaFlag = false, usaIdx = 0;
			let usFlag = false, usIdx = 0;
			let updateFlag = false
			content.workspace.taxonomy[txVocId.Country].forEach( (termId,idx) => {
				if(termId === txTermIdUS){
					usFlag = true
					usIdx = idx
				}
				if(termId === txTermIdUSA){
					usaFlag = true
					usaIdx = idx
				}
			})

			if(usFlag && usaFlag){
				content.workspace.taxonomy[txVocId.Country].splice(usIdx,1)
				updateFlag = true
			} else if(usFlag && !usaFlag){
				content.workspace.taxonomy[txVocId.Country].push(txTermIdUSA)
				content.workspace.taxonomy[txVocId.Country].splice(usIdx,1)
				updateFlag = true
			}

			if(updateFlag && operateDB){
				// let objID = ObjectID.createFromHexString(content._id)
				let objID = content._id;
				let filter = { _id: objID}
				let updateField = {}
				updateField.workspace = content.workspace
				updateField.live = content.workspace
				let update = { $set: updateField }

				MongoClient.connect(mdbUrl, (err, db) => {					
					let collection = db.collection('Contents')
					collection.updateOne(filter, update)
						.then((r) => {
							debugDev('Modified Count = ' + r.modifiedCount + ', Total Modified Count = ' + r.result.nModified)
							ctnsUpdateLog += 'Content - ' + content.text + ' - Updated!\n'
							ctnsUpdateLogCount++
							wait4AllContentsEnd()
						})
						.catch((e) => {
							console.log('Update content - '+ content.text +' - taxonomy Country Error!  ' + e)
						})
				})
			} else if(updateFlag && !operateDB){
				ctnsUpdateLog += 'Content - ' + content.text + ' - Updated!\n'
				ctnsUpdateLogCount++
				wait4AllContentsEnd()
			} else {
				wait4AllContentsEnd()
			}
		}else {
			wait4AllContentsEnd()
		}
	})
}

buUtil.getMongoDBUrl(targetEnv, dbOPSwitch, (env, op, mUrl) => {
	targetEnv = env;
	operateDB = op;
	mdbUrl = mUrl;

	let waitCount = 2
	let wait = () =>{
		waitCount--
		if(!waitCount){
			main()
		}
	}

	buUtil.getTxTermsMap({
		txVocName: txVocName,
		txTermsFlag: false, //undefined --> default: true
		targetEnv: targetEnv,
		dbOPSwitch: dbOPSwitch
	}, (vocs,terms)=>{
		txVocId = vocs
		buUtil.getSingleTxTermsId({
			txVocName: txVocName[0],
			txTermName: txTermName[0],
			targetEnv: targetEnv,
			dbOPSwitch: dbOPSwitch
		}, (err,txTermsId) => {
			if(!err){
				txTermIdUSA = txTermsId

				buUtil.getSingleTxTermsId({
					txVocName: txVocName[0],
					txTermName: txTermName[1],
					targetEnv: targetEnv,
					dbOPSwitch: dbOPSwitch
				}, (err,txTermsId) => {
					if(!err){
						txTermIdUS = txTermsId
						wait()
					} else {
						console.log(err);
					}
				})
			} else {
				console.log(err);
			}
		})
	})

	buUtil.getContentTypesId({
		ctnTypeName: ctnTypeName,
		// reversedListing: boolean, // undefined --> default: false
		targetEnv: targetEnv,
		dbOPSwitch: dbOPSwitch
	}, (ctnTId) => {
		ctnTypeId = ctnTId

		buUtil.getContents({
			ctnTypeId: ctnTId,
			qryFilter: qryFilter,
			projection: ctnProjection,
			targetEnv: targetEnv,
			dbOPSwitch: dbOPSwitch
		},(ctns) => {
			contents = ctns;
			wait()
		})
	})
})