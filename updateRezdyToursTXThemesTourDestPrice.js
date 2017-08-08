/*jshint esversion: 6 */

//This program will include auto-generated json file - ./mapping/genRezdyToursTXThemesTourDestPrice.json as the updateing source for taxonomy Tour Destination, Themes and Price 
//if you want to update taxonomy Tour Type and Tour Category, you should use another one - updateToursTXTourTypeCategory.js
//
//
//usage: node updateRezdyToursTXThemesTourDestPrice.js PRODUCTION OPDB

const fs = require('fs');
const debug = require('debug');
const debugDev = debug('dev');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const buUtil = require('./lib/bookurUtil.js')
const buUtil = require('bookur-util')
const resultFilePath = './mapping/genRezdyToursTXThemesTourDestPrice.json'

let execArgv = process.execArgv
var targetEnv = process.argv[2]
var dbOPSwitch = process.argv[3]

console.log('-------- updateRezdyToursTXThemesTourDestPrice.js - execArgv=%s - args: targetEnv=%s, dbOPSwitch=%s', process.execArgv, targetEnv, dbOPSwitch);

var operateDB = false;
let mdbUrl

let dbParam = buUtil.getMDBParam(targetEnv, dbOPSwitch)
targetEnv = dbParam.targetEnv
operateDB = dbParam.operateDB
mdbUrl = dbParam.mdbUrl

//base configuration

var txVocName = ['Tour Destination','Themes','Price'];
var ctnTypeName = ['Tours'];

var txVocNameCount = txVocName.length;
var ctnTypeNameCount = ctnTypeName.length;
var ctnProjection = {'_id':1, 'text': 1, 'online':1,'workspace':1};
var txVocId = {}, txTermsId = {}, ctnTypeId = {}, contents = {}, toursNotExisted = [];
var rezdyTours = []

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

var dataPreparation = () => {
	console.log('Enter data preparation ......')

	if(fs.existsSync(resultFilePath)){
		rezdyTours = require(resultFilePath)
	} else{
		console.log('... Lacking of rezdy tours %s file! Abort!! ...', resultFilePath)
		process.exist(1)
	}

	var dataReadyCount = 2;
	var wait4DataReady = () => {
		dataReadyCount--;
		if(!dataReadyCount){
			console.log('Exit data preparation ......')
			dataValidation();
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

	console.log('Getting TX & Terms ......')
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

	console.log('Getting Contents ......')
	buUtil.getContentTypesId(options1, (types)=>{
		ctnTypeId = types;

		// var getContents = require('./lib/getContents.js');
		let options2 = {
			ctnTypeId: ctnTypeId,
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

var dataValidation = () => {
	var txPriceValidationLog = '', txTDValidationLog = '', txThemesValidationLog = '', rezdyToursValidationLog = '';
	var priceJson = [], destJson = [], themesJson = [];
	var txShouldBeInserted = false;

	rezdyTours.forEach( (tour) => {
		console.log('tour["Tour Code"] = ' + tour["Tour Code"]);

		var themes = tour.Themes
		var tourDestinations = tour['Tour Destination']

		txVocName.forEach( (vocName) => {
			var vocKey = vocName.replace(/\s+/g,'');
			if(vocName === 'Tour Destination'){
				if(tourDestinations.length){
					tourDestinations.forEach( (tourDestination) => {
						if(tourDestination.length){
							if(!txTermsId[vocKey][tourDestination]){
								txShouldBeInserted = true;
								txTDValidationLog += tourDestination + '\n';
								var tourDestinationAddFlag = true;
								destJson.forEach( (t) => {
									if(t.Title === tourDestination)
										tourDestinationAddFlag = false;
								});
								if(tourDestinationAddFlag)
									destJson.push({"Title":tourDestination});
							}																		
						}
					});
				}
			} else if (vocName === 'Price'){
				if(!txTermsId[vocKey][tour.Price]){
					txShouldBeInserted = true;
					txPriceValidationLog += tour.Price + '\n';
					var addFlag = true;
					priceJson.forEach( (price) => {
						if(price.Title === tour.Price)
							addFlag = false;
					});
					if(addFlag)
						priceJson.push({"Title":tour.Price});
				}
			} else if(vocName === 'Themes') {
				if(themes.length){
					themes.forEach( (theme) => {
						if(theme.length){
							if(!txTermsId[vocKey][theme]){
								txShouldBeInserted = true;
								txThemesValidationLog += theme + '\n';
								var themeAddFlag = true;
								themesJson.forEach( (t) => {
									if(t.Title === theme)
										themeAddFlag = false;
								});
								if(themeAddFlag)
									themesJson.push({"Title":theme});
							}																		
						}
					});
				}
			}
		});

		ctnTypeName.forEach( (typeName) => {
			var ctns = [];
			var key = typeName.replace(/\s+/g,'');
			ctns = contents[key];
			var notExisted = true;
			ctns.forEach( (ctn) => {
				if(ctn.workspace.fields.productCode === tour["Tour Code"])	notExisted = false;
			});
			if(notExisted){
				rezdyToursValidationLog += tour["Tour Code"] + '\n';
				toursNotExisted.push(tour["Tour Code"]);
			}
		});	
	});

	fs.writeFileSync('./log/notExistedInTaxonomyPrice-' + targetEnv + '.log', txPriceValidationLog);
	fs.writeFileSync('./log/notExistedInTaxonomyTourDest-' + targetEnv + '.log', txTDValidationLog);
	fs.writeFileSync('./log/notExistedInTaxonomyThemes-' + targetEnv + '.log', txThemesValidationLog);
	fs.writeFileSync('./log/notExistedInContentTours-' + targetEnv + '.log', rezdyToursValidationLog);
	fs.writeFileSync('./mapping/price.json', JSON.stringify(priceJson));
	fs.writeFileSync('./mapping/dest.json', JSON.stringify(destJson));
	fs.writeFileSync('./mapping/themes.json', JSON.stringify(themesJson));

	if(txShouldBeInserted){
		console.log('***********************')
		console.log('******	ATTENTION ******')
		console.log('***********************')
		console.log('\n-----------------------------------------------------------------------')
		console.log('****** There still is taxonomy data which should be dealed with! ******');
		console.log('****** Now will run "updateTXTerms.js" AUTOMATICALLY!! ******')
		console.log('-----------------------------------------------------------------------\n')

		let args = []
		let options = {}

		options.execArgv = execArgv.slice()
		args.push(targetEnv)
		args.push(dbOPSwitch)		
		buUtil.runScript('./updateTXTerms.js', args, options, err => {
			if(err)	
				throw err
			else {
				console.log('\n****** Now continue to run the remaining ******\n')
				dataProcessing()
			}
		})
		// endProgram();
	} else {
		dataProcessing();
	}
}

var dataProcessing = () => {
	var allContents = Object.keys(contents);
	// var allContentsCount = allContents.length;
	var txVocs = Object.keys(txVocId);
	var txVocsCount = txVocs.length;
	var ctnsToursUpdLog = '';

	var start = () => {
		var dbConnection = MongoClient.connect(mdbUrl);

		dbConnection.then( (db) => {
			var cltContents = db.collection('Contents');

			var rezdyToursCount = rezdyTours.length;
			var wait4RezdyToursEnd = () => {
				rezdyToursCount--;
				if(!rezdyToursCount){
					db.close();
					// fs.writeFileSync('./log/contentsAfterDataProcessing-' + 'Tours' + '-' + targetEnv + '.json', JSON.stringify(contents)); //for debuging
					fs.writeFileSync('./log/updateRezdyToursTXThemesTourDestPrice-'+targetEnv+'.log', ctnsToursUpdLog);
					endProgram();
				}
			}

			rezdyTours.forEach( (tour) => {

				var allContentsCount = allContents.length;
				var wait4AllContentsEnd = () => {
					allContentsCount--;
					if(!allContentsCount){
						wait4RezdyToursEnd();
					}
				}

				allContents.forEach( (key) => {
					var ctns = contents[key];

					var ctnsCount = ctns.length;
					var wait4ctnsEnd = () => {
						ctnsCount--;
						if(!ctnsCount){
							wait4AllContentsEnd();
						}
					}

					ctns.forEach( (ctn) => {
						var productCode = ctn.workspace.fields.productCode;
						var updFlag = false;
						if(tour['Tour Code'] === productCode){
							var tourProductCode = tour['Tour Code'];
							var txPrice = tour.Price;
							var txThemes = tour.Themes
							var txTourDestinations = tour['Tour Destination']

							txVocs.forEach( (txVoc) => {
								var vocId = txVocId[txVoc];
								var termId = '', tmpTermsArray = [];

								//remove null from txTerms
								if(ctn.workspace.taxonomy[vocId]){
									if(Array.isArray(ctn.workspace.taxonomy[vocId])){
										cleanArray(ctn.workspace.taxonomy[vocId], (uf, na) => {
											if(uf){
												updFlag = true;
												ctn.workspace.taxonomy[vocId] = na.slice();
											}
										});
									} else{
										if(util.isNullOrUndefined(ctn.workspace.taxonomy[vocId])){
											ctn.workspace.taxonomy[vocId] = '';
											updFlag = true;
										}
									}
								}

								if(txVoc === 'Price'){
									termId = txTermsId[txVoc][txPrice];
									if(ctn.workspace.taxonomy[vocId]){
										if(Array.isArray(ctn.workspace.taxonomy[vocId])){
											tmpTermsArray = ctn.workspace.taxonomy[vocId];
											if(tmpTermsArray.indexOf(termId) === -1){
												tmpTermsArray.push(termId);
												updFlag = true;
											}
											ctn.workspace.taxonomy[vocId] = tmpTermsArray;
										} else{
											tmpTermsArray.push(ctn.workspace.taxonomy[vocId]);
											if(tmpTermsArray.indexOf(termId) === -1){
												tmpTermsArray.push(termId);
												updFlag = true;
											}
											ctn.workspace.taxonomy[vocId] = tmpTermsArray;
										}
									} else {
										updFlag = true;
										tmpTermsArray.push(termId);
										ctn.workspace.taxonomy[vocId] = tmpTermsArray;
									}
								} else if(txVoc === 'TourDestination'){
									if(txTourDestinations.length){
										txTourDestinations.forEach( (dest) => {
											if(dest.length){
												termId = txTermsId[txVoc][dest];

												if(ctn.workspace.taxonomy[vocId]){
													if(Array.isArray(ctn.workspace.taxonomy[vocId])){
														tmpTermsArray = ctn.workspace.taxonomy[vocId];
														if(tmpTermsArray.indexOf(termId) === -1){
															tmpTermsArray.push(termId);
															updFlag = true;
														}
														ctn.workspace.taxonomy[vocId] = tmpTermsArray;
													} else{
														tmpTermsArray.push(ctn.workspace.taxonomy[vocId]);
														if(tmpTermsArray.indexOf(termId) === -1){
															tmpTermsArray.push(termId);
															updFlag = true;
														}
														ctn.workspace.taxonomy[vocId] = tmpTermsArray;
													}
												} else {
													updFlag = true;
													tmpTermsArray.push(termId);
													ctn.workspace.taxonomy[vocId] = tmpTermsArray;
												}
											}
										});
									}
								} else if(txVoc === 'Themes'){
									if(txThemes.length){
										txThemes.forEach( (theme) => {
											if(theme.length){
												termId = txTermsId[txVoc][theme];

												if(ctn.workspace.taxonomy[vocId]){
													if(Array.isArray(ctn.workspace.taxonomy[vocId])){
														tmpTermsArray = ctn.workspace.taxonomy[vocId];
														if(tmpTermsArray.indexOf(termId) === -1){
															tmpTermsArray.push(termId);
															updFlag = true;
														}
														ctn.workspace.taxonomy[vocId] = tmpTermsArray;
													} else{
														tmpTermsArray.push(ctn.workspace.taxonomy[vocId]);
														if(tmpTermsArray.indexOf(termId) === -1){
															tmpTermsArray.push(termId);
															updFlag = true;
														}
														ctn.workspace.taxonomy[vocId] = tmpTermsArray;
													}
												} else {
													updFlag = true;
													tmpTermsArray.push(termId);
													ctn.workspace.taxonomy[vocId] = tmpTermsArray;
												}
											}
										});
									}
								}
							});
						}

						if(updFlag){
							//var objID = ObjectID.createFromHexString(ctn._id);
							var objID = ctn._id;
							var filter = { _id: objID};
							var updateField = {};

							ctn.workspace.status = 'published'
							updateField.online = true;

							updateField.workspace = ctn.workspace;
							updateField.live = ctn.workspace;
							var update = { $set: updateField };

							cltContents.updateOne(filter, update)
								.then((r) => {
									debugDev('Content - ' + key + ': ' + productCode + ' has been updated successfully!');
									ctnsToursUpdLog += 'Content - ' + key + ': ' + productCode + ' has been updated successfully!\n';
									wait4ctnsEnd();
								})
								.catch((e) => {
									debugDev('Content - ' + key + ': ' + productCode + ' failed to be updated! - ' + e);
									ctnsToursUpdLog += 'Content - ' + key + ': ' + productCode + ' failed to be updated! - '+e+'\n';
									wait4ctnsEnd();
								});
							
						} else {
							wait4ctnsEnd();
						}

						//wait4ctnsEnd(); //for debuging
					});
				});
			});
		}).catch( (e) => {
			console.log('dataProcessing Error happened!! - %s',e);
		});
	}

	// dataProcessing() starting point
	if(allContents.length){
		if(operateDB){
			start();
		} else {
			console.log('operateDB=False, so escape.....');
			endProgram();
		}
	} else {
		console.log('Nothing to do, ESCAPE.....');
		endProgram();
	}
}

var endProgram = () => {
	console.log('*** updateRezdyToursTXThemesTourDestPrice.js Finished!! ***');	
}

//Starting point
//

dataPreparation()
