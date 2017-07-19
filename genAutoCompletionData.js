/*jshint esversion: 6 */

const fs = require('fs');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const buUtil = require('./lib/bookurUtil.js')
const ccMap = require('./mapping/ccMap.json')

//for standalone execution
let execArgv = process.execArgv;
let targetEnv = process.argv.slice(2)[0];
let dbOPSwitch = process.argv.slice(3)[0];

let operateDB = false;
let mdbUrl = '';

let txVocName = ['City','country code','Country'];
let ctnTypeName = ['City','Attraction','Travel Article','Tours'];
let txVocNameCount = txVocName.length;
let ctnTypeNameCount = ctnTypeName.length;
let ctnProjection = {'_id':1, 'text': 1, 'workspace':1};
let txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {};

let acData = {
	"City": [],
	"Attraction": [],
	"Article": [],
	"Tour": []
}

let main = () => {
	console.log('Entering main......');

	let outputJSONFile = () => {
		console.log('Entering outputJSONFile......');
		fs.writeFileSync('./mapping/BookUrContents.json', JSON.stringify(acData));
		console.log('****** DONE ******');
	}

	let step4Tour = () => {
		console.log('Entering step4Tour......');

		let genJSON = () =>{
			let cityVocId = txVocId.City
			let countryVocId = txVocId.Country
			let txTermsIdCity = txTermsId[cityVocId]
			let txTermsIdCountry = txTermsId[countryVocId]

			contents.Tours.forEach( tour => {
				if(tour.workspace.fields.marketplace !== 'Rezdy' && tour.workspace.fields.marketplace !== 'Rezdy Self-Created'){
					return
				}

				let item = {}
				let cityTermId = ''
				let cityName = ''
				if(tour.workspace.taxonomy[cityVocId]){
					cityTermId = tour.workspace.taxonomy[cityVocId][0]
					cityName = txTermsIdCity[cityTermId]
				}
				let countryTermId = ''
				let countryName = ''
				if(tour.workspace.taxonomy[countryVocId]){
					countryTermId = tour.workspace.taxonomy[countryVocId][0]
					countryName = txTermsIdCountry[countryTermId]
				}

				item.title = tour.text
				item.city = cityName
				item.country = countryName
				item.image = tour.workspace.fields.photoPath
				item.url = 'https://bookur.com/en/tour/' + tour._id.toString() + '/' + tour.text.toLowerCase().replace(/\s/g,'-')

				acData.Tour.push(item)
			})

			outputJSONFile()
		}

		genJSON()

		// let options = {
		// 	ctnTypeName: ctnTypeName,
		// 	// reversedListing: boolean, // undefined --> default: false
		// 	targetEnv: targetEnv,
		// 	dbOPSwitch: dbOPSwitch
		// }

		// buUtil.getContentTypesId(options, types => {
		// 	let options = {
		// 		ctnTypeId: types,
		// 		projection: {'_id':1, 'text': 1, 'workspace':1},
		// 		targetEnv: targetEnv,
		// 		dbOPSwitch: dbOPSwitch
		// 	}
		// 	buUtil.getContents(options, ctns => {
		// 		contents = ctns;

		// 		let options = {
		// 			txVocName: txVocName,
		// 			txTermsFlag: false, //undefined --> default: true
		// 			reversedListing: false, // undefined --> default: false
		// 			targetEnv: targetEnv,
		// 			dbOPSwitch: dbOPSwitch
		// 		}
		// 		buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 			txVocId = vocsId

		// 			let options = {
		// 				txVocName: txVocName,
		// 				txTermsFlag: true, //undefined --> default: true
		// 				reversedListing: true, // undefined --> default: false
		// 				targetEnv: targetEnv,
		// 				dbOPSwitch: dbOPSwitch
		// 			}
		// 			buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 				txTermsId = termsId

		// 				genJSON()
		// 			})
		// 		})
		// 	})
		// })				
	}

	let step3Article = () => {
		console.log('Entering step3Article......');

		let genJSON = () =>{
			contents.TravelArticle.forEach( ta => {
				let item = {}

				item.title = ta.text
				item.city = ''
				item.country = ''
				item.image = 'https://bookur.com/dam?media-id=' + ta.workspace.fields.image
				item.url = 'https://bookur.com/en/article/' + ta._id.toString() + '/' + ta.text.toLowerCase().replace(/\s/g,'-')

				acData.Article.push(item)
			})

			step4Tour()

		}

		genJSON()

		// let options = {
		// 	ctnTypeName: ctnTypeName,
		// 	// reversedListing: boolean, // undefined --> default: false
		// 	targetEnv: targetEnv,
		// 	dbOPSwitch: dbOPSwitch
		// }

		// buUtil.getContentTypesId(options, types => {
		// 	let options = {
		// 		ctnTypeId: types,
		// 		projection: {'_id':1, 'text': 1, 'workspace':1},
		// 		targetEnv: targetEnv,
		// 		dbOPSwitch: dbOPSwitch
		// 	}
		// 	buUtil.getContents(options, ctns => {
		// 		contents = ctns;

		// 		genJSON()
		// 	})
		// })				
	}

	let step2Attraction = () => {
		console.log('Entering step2Attraction......');

		let genJSON = () =>{
			let cityVocId = txVocId.City
			let countrycodeVocId = txVocId.countrycode
			let txTermsIdCity = txTermsId[cityVocId]
			let txTermsIdCountryCode = txTermsId[countrycodeVocId]

			contents.Attraction.forEach( att => {
				let item = {}
				let cityTermId = ''
				let cityName = ''
				if(att.workspace.taxonomy[cityVocId]){
					cityTermId = att.workspace.taxonomy[cityVocId][0]
					cityName = txTermsIdCity[cityTermId]
				}
				let countrycodeTermId = ''
				let countryCode = ''
				let countryName = ''
				if(att.workspace.taxonomy[countrycodeVocId]){
					countrycodeTermId = att.workspace.taxonomy[countrycodeVocId][0]
					countryCode = txTermsIdCountryCode[countrycodeTermId]
					if(ccMap[countryCode])
						countryName = ccMap[countryCode].countryName
					else
						console.log('Country Code: %s is not included in ccMap.json', countryCode)
				}

				item.title = att.text
				item.city = cityName
				item.country = countryName
				item.image = 'https://bookur.com/dam?media-id=' + att.workspace.fields.image
				item.url = 'https://bookur.com/en/landmark/' + att._id.toString() + '/' + att.text.toLowerCase().replace(/\s/g,'-')

				acData.Attraction.push(item)
			})

			step3Article()
		}

		genJSON()

		// let options = {
		// 	ctnTypeName: ctnTypeName,
		// 	// reversedListing: boolean, // undefined --> default: false
		// 	targetEnv: targetEnv,
		// 	dbOPSwitch: dbOPSwitch
		// }

		// buUtil.getContentTypesId(options, types => {
		// 	let options = {
		// 		ctnTypeId: types,
		// 		projection: {'_id':1, 'text': 1, 'workspace':1},
		// 		targetEnv: targetEnv,
		// 		dbOPSwitch: dbOPSwitch
		// 	}
		// 	buUtil.getContents(options, ctns => {
		// 		contents = ctns;

		// 		let options = {
		// 			txVocName: txVocName,
		// 			txTermsFlag: false, //undefined --> default: true
		// 			reversedListing: false, // undefined --> default: false
		// 			targetEnv: targetEnv,
		// 			dbOPSwitch: dbOPSwitch
		// 		}
		// 		buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 			txVocId = vocsId

		// 			let options = {
		// 				txVocName: txVocName,
		// 				txTermsFlag: true, //undefined --> default: true
		// 				reversedListing: true, // undefined --> default: false
		// 				targetEnv: targetEnv,
		// 				dbOPSwitch: dbOPSwitch
		// 			}
		// 			buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 				txTermsId = termsId

		// 				genJSON()
		// 			})
		// 		})
		// 	})
		// })		
	}

	let step1City = () => {
		console.log('Entering step1City......');

		let genJSON = () =>{
			let countryVocId = txVocId.Country
			let txTermsIdCountry = txTermsId[countryVocId]

			contents.City.forEach( city => {
				let item = {}
				let countryTermId = ''
				let countryName = ''
				if(city.workspace.taxonomy[countryVocId]){
					countryTermId = city.workspace.taxonomy[countryVocId][0]
					countryName = txTermsIdCountry[countryTermId]
				}

				item.title = city.text
				item.city = ''
				item.country = countryName
				item.image = 'https://bookur.com/dam?media-id=' + city.workspace.fields.image
				item.url = 'https://bookur.com/en/regions-cities/' + city._id.toString() + '/' + city.text.toLowerCase().replace(/\s/g,'-')

				acData.City.push(item)
			})

			step2Attraction()
		}

		genJSON()

		// let options = {
		// 	ctnTypeName: ctnTypeName,
		// 	// reversedListing: boolean, // undefined --> default: false
		// 	targetEnv: targetEnv,
		// 	dbOPSwitch: dbOPSwitch
		// }

		// buUtil.getContentTypesId(options, types => {

		// 	let options = {
		// 		ctnTypeId: types,
		// 		projection: {'_id':1, 'text': 1, 'workspace':1},
		// 		targetEnv: targetEnv,
		// 		dbOPSwitch: dbOPSwitch
		// 	}
		// 	buUtil.getContents(options, ctns => {
		// 		contents = ctns;

		// 		let options = {
		// 			txVocName: txVocName,
		// 			txTermsFlag: false, //undefined --> default: true
		// 			reversedListing: false, // undefined --> default: false
		// 			targetEnv: targetEnv,
		// 			dbOPSwitch: dbOPSwitch
		// 		}
		// 		buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 			txVocId = vocsId

		// 			let options = {
		// 				txVocName: txVocName,
		// 				txTermsFlag: true, //undefined --> default: true
		// 				reversedListing: true, // undefined --> default: false
		// 				targetEnv: targetEnv,
		// 				dbOPSwitch: dbOPSwitch
		// 			}
		// 			buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
		// 				txTermsId = termsId

		// 				genJSON()
		// 			})
		// 		})
		// 	})
		// })
	}

	step1City()
}

buUtil.getMongoDBUrl(targetEnv, dbOPSwitch, (env, op, mUrl) => {
	targetEnv = env
	operateDB = op
	mdbUrl = mUrl

	let options = {
		ctnTypeName: ctnTypeName,
		// reversedListing: boolean, // undefined --> default: false
		targetEnv: targetEnv,
		dbOPSwitch: dbOPSwitch
	}

	buUtil.getContentTypesId(options, types => {
		let options = {
			ctnTypeId: types,
			projection: {'_id':1, 'text': 1, 'workspace':1},
			targetEnv: targetEnv,
			dbOPSwitch: dbOPSwitch
		}
		buUtil.getContents(options, ctns => {
			contents = ctns;

			let options = {
				txVocName: txVocName,
				txTermsFlag: false, //undefined --> default: true
				reversedListing: false, // undefined --> default: false
				targetEnv: targetEnv,
				dbOPSwitch: dbOPSwitch
			}
			buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
				txVocId = JSON.parse(JSON.stringify(vocsId))

				let options = {
					txVocName: txVocName,
					txTermsFlag: true, //undefined --> default: true
					reversedListing: true, // undefined --> default: false
					targetEnv: targetEnv,
					dbOPSwitch: dbOPSwitch
				}
				buUtil.getTxTermsMap(options, (vocsId,termsId) =>{
					txTermsId = JSON.parse(JSON.stringify(termsId))

					main()
				})
			})
		})
	})
})
