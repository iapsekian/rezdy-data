/*jshint esversion: 6 */

//This program will include a external json file - rezdytours.json as the updateing source for taxonomy Tour Destination, Themes and Price 
//if you want to update taxonomy Tour Type and Tour Category, you should use another one - updateToursTXTourTypeCategory.js
//
//csvtojson --delimiter=';' mapping/20170704RTours.csv > mapping/rezdytours.json
//put the csv file into ./mapping directory then this program will convert it automatically

const fs = require('fs');
const debug = require('debug');
const debugDev = debug('dev');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const buUtil = require('./lib/bookurUtil.js')
const csv = require('csvtojson')
const csvFilePath = './mapping/rezdytours.csv'

var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];

var productionEnv = false;
var testEnv = false;
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

	var dataReadyCount = 2;
	var wait4DataReady = () => {
		dataReadyCount--;
		if(!dataReadyCount){
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

		var themes = [];
		if(tour.Themes.trim().length)	themes = tour.Themes.trim().split(',');
		var tourDestinations = [];
		if(tour['Tour Destination'].trim().length)	tourDestinations = tour['Tour Destination'].trim().split(',');

		txVocName.forEach( (vocName) => {
			var vocKey = vocName.replace(/\s+/g,'');
			if(vocName === 'Tour Destination'){
				if(tourDestinations.length){
					tourDestinations.forEach( (tourDestination) => {
						var tmpTourDestination = tourDestination.trim();
						if(tmpTourDestination.length){
							if(!txTermsId[vocKey][tmpTourDestination]){
								txShouldBeInserted = true;
								txTDValidationLog += tmpTourDestination + '\n';
								var tourDestinationAddFlag = true;
								destJson.forEach( (t) => {
									if(t.Title === tmpTourDestination)
										tourDestinationAddFlag = false;
								});
								if(tourDestinationAddFlag)
									destJson.push({"Title":tmpTourDestination});
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
						var tmpTheme = theme.trim();
						if(tmpTheme.length){
							if(!txTermsId[vocKey][tmpTheme]){
								txShouldBeInserted = true;
								txThemesValidationLog += tmpTheme + '\n';
								var themeAddFlag = true;
								themesJson.forEach( (t) => {
									if(t.Title === tmpTheme)
										themeAddFlag = false;
								});
								if(themeAddFlag)
									themesJson.push({"Title":tmpTheme});
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
				console.log('------------- Now continue to run the remaining ')
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
							var txThemes = [];
							if(tour.Themes.trim().length)	txThemes = tour.Themes.trim().split(',');
							var txTourDestinations = [];
							if(tour['Tour Destination'].trim().length)	txTourDestinations = tour['Tour Destination'].trim().split(',');

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
											var tmpDest = dest.trim();
											if(tmpDest.length){
												termId = txTermsId[txVoc][tmpDest];

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
											var tmpTheme = theme.trim();
											if(tmpTheme.length){
												termId = txTermsId[txVoc][tmpTheme];

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

csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    rezdyTours.push(jsonObj)
})
.on('done',(err)=>{
	if(err){
		console.log('****** Convert rezdytours.csv to json format ERROR! NOW ABORT!! ******')
	} else{
		dataPreparation();		
	}
})


