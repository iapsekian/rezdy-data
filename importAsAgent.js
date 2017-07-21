#!/usr/bin/env node --max_old_space_size=4096
/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
var debugDev = debug('dev');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;
const buUtil = require('./lib/bookurUtil.js')


//console.log('process.argv = ' + process.argv);
//var operateDB = process.argv.slice(2)[0] === 'OPDB' ? true : false;
//console.log('operateDB = ' + operateDB);

// var productionEnv = false;
// var testEnv = false;
// var operateDB = false;

let execArgv = process.execArgv;
var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];
let operateDB = false;
let mdbUrl = '';
buUtil.getMongoDBUrl(targetEnv, dbOPSwitch, (env, op, mUrl) => {
	targetEnv = env;
	operateDB = op;
	mdbUrl = mUrl;
})

//base configuration

var apiCallComplete = false;
var getExistingComplete = false;
let targetMyCategories = ['ALL','New All Tours','2-New All Tours'];

var conf = {
    host : 'api.rezdy.com',
    port : 443,
    path : '/latest',
    apiKey : '71e6bdb078ba42bdb1c5ef23744f4b69',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
    }
};

var arrayJsonCategories = [];
var arrayJsonProducts = [];
var arrayJsonToursProducts = [];
var arrayJsonSuppliers = [];
var existingSuppliers = [];
var existingProducts = [];
var existingToursProducts = [];
let catOfflineTemp = {};


//DB definition/value

var contentTypeId = {
	"supplier" : "5878743c6d0e81354114b288",
	"product" : "587866b06d0e810d4114b288", //contentType = RTours
	"tours" : "58785c576d0e815f4014b288" //contentType = Tours
};

var crudUser = {
	"id": "55a4ab8b86c747a0758b4567",
	"login": "admin",
	"fullName": "Web Admin" 		
};

var taxonomyVocabularyId = {
	"Promotion": "592654d76d0e81b5537b23c8", //should be updated
	"TourCategory": "5763a39b6d0e81055c8b456d",
	"TourType": "587862a26d0e81ce4014b288",
	"supplierId" : "587862d76d0e81dd4014b289",
	"supplierAlias" : "5878630a6d0e81fc4014b288",
	"productType" : "587862a26d0e81ce4014b288",
	"agentPaymentType" : "5878633e6d0e81e44014b289",
	"productCode" : "587863aa6d0e815d4114b288",
	"searchSelector" : "587863e56d0e81fb4014b289"
};


var taxonomySSVocabularyId = {
	"searchSelector" : "587863e56d0e81fb4014b289"
};

var taxonomySSTermsId = {
	"generalSearch" : "5878647c6d0e816e4114b288"
};

var taxonomyNavigation = [
	"57e227bb6d0e81ad168b4768",
	"582bf94c6d0e81d65f7b293b" 
];

var taxonomySupplierId = {};
var taxonomySupplierAlias = {};
var taxonomyProductType = {};
var taxonomyAgentPaymentType = {};
var taxonomyProductCode = {};
var taxonomyTourCategory = {};



//Part1-1 - using Rezdy RESTFul API to get tours' information

// get category
function step1GetCategories(){

	console.log('step1GetCategories Starts!');

	var queryParam = 'limit=100';
	var optionsCategories = {
	    host : conf.host,
	    port : conf.port,
	    path : conf.path + '/categories' + '?apiKey=' + conf.apiKey + '&' + queryParam,
	    method : 'GET',
	    headers: conf.headers
	};

	//debugDev(optionsCategories);

	var getCatgories = https.request(optionsCategories, function(res) {

		var rawCategories = '';

	    res.on('data', (d) => {
	        rawCategories += d;
	    });

	    res.on('end', () => {
	    	var tempJsonCategories = JSON.parse(rawCategories);
	    	//debugDev('request status success = ' + tempJsonCategories.requestStatus.success);
	    	if (tempJsonCategories.requestStatus.success === true) {
		    	delete tempJsonCategories.requestStatus;
		    	rawCategories = JSON.stringify(tempJsonCategories);
		    	fs.writeFileSync('./datafiles/rawCategories-'+targetEnv+'.json', rawCategories);

		    	//
		    	targetMyCategories.forEach( myCategory =>{
		    		tempJsonCategories.categories.forEach( (item) => {
			    		if(myCategory === item.name){
			    			arrayJsonCategories.push({
			    				id: item.id,
			    				name: item.name,
			    				visible: item.visible
			    			});
			    		}
		    		});
		    	});

		    	tempJsonCategories.categories.forEach( (item) => {
		    		if(item.name === 'Off-line temporarily'){
		    			catOfflineTemp.id = item.id;
		    			catOfflineTemp.name = item.name;
		    			catOfflineTemp.visible = item.visible;
		    		}
		    	})

		        debugDev('step1GetCategories Ended!');
		        step2GetProducts();
	    	}
	    });

	});

	getCatgories.end();
	getCatgories.on('error', (e) => {
	    console.error('getCatgories Error happened - ' + e);
	});
}

// get Products by category "ALL" only
function step2GetProducts(){

	console.log('Step2GetProducts starts!');

	var jsonProducts = { "products":[] };
	var jsonProductsFromXml = { "products":[] };
	var tmpXMLProductsCount = -1;
	var tmpArrayCategoriesCount4Xml = arrayJsonCategories.length;

	function handleProductsResult(){

		var missingFlag = true;
		var missingRecords = [];
		jsonProductsFromXml.products.forEach( (item1) => {
			missingFlag = true;
			jsonProducts.products.forEach( (item2) => {
				if(item2.productCode === item1.productCode){
					missingFlag = false;
				}
			});
			if(missingFlag){
				missingRecords.push(item1);
			}
		});
    	fs.writeFileSync('./logs/missingRecordsBTWXmlRTours-'+targetEnv+'.json', JSON.stringify(missingRecords));

		jsonProducts.products.forEach( (jsonProductsItem, jsonProductsIndex) => {
			jsonProductsFromXml.products.forEach( (jsonProductsFromXmlItem, jsonProductsFromXmlIndex) => {
				if(jsonProductsFromXmlItem.productCode === jsonProductsItem.productCode){
					jsonProductsItem.rzdId = jsonProductsFromXmlItem.id;
					jsonProductsItem.productPageUrl = jsonProductsFromXmlItem.productPageUrl;
					jsonProductsItem.calendarWidgetUrl = jsonProductsFromXmlItem.calendarWidgetUrl;
				}
			});
		});
    	var rawProducts = JSON.stringify(jsonProducts);
    	fs.writeFileSync('./datafiles/rawProducts-'+targetEnv+'.json', rawProducts);
        arrayJsonProducts = jsonProducts.products;

        var supplierAliasFromProducts = [];
        arrayJsonProducts.forEach( (item1,index1) => {
        	var newFlag = true;
        	supplierAliasFromProducts.forEach( (item2,index2) => {    		
        		if(item1.supplierAlias === item2.supplierAlias){
        			newFlag = false;
        		}
        	});
        	if (newFlag) {
        		var supplierInfo = {};
        		supplierInfo.supplierId = util.isNullOrUndefined(item1.supplierId) ? '' : item1.supplierId.toString();
        		supplierInfo.supplierAlias = item1.supplierAlias;
	        	supplierAliasFromProducts.push(supplierInfo);
        	}
        });
        debugDev('Total Suppliers Count = ' + supplierAliasFromProducts.length);
        debugDev('step2GetProducts Ended!');
        step3GetSuppliersByProducts(supplierAliasFromProducts);
	}

	// function wait4BothComplete(){
	// 	// debugDev('tmpArrayCategoriesCount4Xml = ' + tmpArrayCategoriesCount4Xml);
	// 	// debugDev('tmpXMLProductsCount = ' + tmpXMLProductsCount);
	// 	if(tmpArrayCategoriesCount4Xml === 0 && tmpXMLProductsCount <= 0){
	// 		handleProductsResult();
	// 	}
	// }

	// function wait4ApiCallComplete(){
	// 	//debugDev('Enter Step2 wait4ApiCallComplete');
	// 	tmpXMLProductsCount -= 100;
	// 	//debugDev('incompleted category/products count = ' + tmpArrayCategoriesCount);
	// 	// debugDev('tmpXMLProductsCount = ' + tmpXMLProductsCount);
	// 	if (tmpXMLProductsCount <= 0) {
	// 		// debugDev('RTours Count = ' + jsonProducts.products.length);
	//     	//fs.writeFileSync('./jsonProducts.json', JSON.stringify(jsonProducts));
	// 		wait4BothComplete();
	// 	}
	// }

	let getProductsByXMLProducts = () => {

		let optionsProductsByCategory = {	
		    host : conf.host,
		    port : conf.port,
		    method : 'GET',
		    headers: conf.headers
		};

		let queryParam =  '/products/marketplace';
		let total = tmpXMLProductsCount;

		let arrayJsonCategoriesCount = arrayJsonCategories.length
		let wait4MyCatEnd = () => {
			arrayJsonCategoriesCount--
			if(!arrayJsonCategoriesCount){
				handleProductsResult()
			}
		}

		arrayJsonCategories.forEach( myCategory => {
			let count = Math.ceil(myCategory.count/100);
			let wait4GetEnd = () => {
				count--
				if(!count){
					wait4MyCatEnd()
				}
			}

			let continueFlag = true
			let offset = 0;
			let queryPath = conf.path + queryParam + '?apiKey=' + conf.apiKey + '&category=' + myCategory.id;

			while(continueFlag){
				optionsProductsByCategory.path = queryPath + '&offset=' + offset;
				offset += 100;
				if(myCategory.count-offset <= 0){
					continueFlag = false;
				}
				//tmpXMLProductsCount -= 100;
				// debugDev('optionsProductsByCategory.path = ' + optionsProductsByCategory.path);

				let getProductsByCategory = https.request(optionsProductsByCategory, function(res) {

					let tmpRawProducts = '';
					let tmpJsonProducts;

				    res.on('data', (d) => {
				        tmpRawProducts += d;
				    });

				    res.on('end', () => {
				    	if(tmpRawProducts){
					    	tmpJsonProducts = JSON.parse(tmpRawProducts);
					    	debugDev('request status success = ' + tmpJsonProducts.requestStatus.success);

					    	if (tmpJsonProducts.requestStatus.success === true) {	    		
					    		debugDev('Products Count = ' + tmpJsonProducts.products.length);
					    		// if(tmpJsonProducts.products.length < 100)	continueFlag = false
					    		tmpJsonProducts.products.forEach( (item) => {
							    	jsonProducts.products.push(item);
					    		});
					    	}
				    	// }else{
				    	// 	continueFlag = false
				    	}
				    	wait4GetEnd()
				    });

				});

				getProductsByCategory.end();
				getProductsByCategory.on('error', (e) => {
				    console.error('getProductsByXMLProducts get product error - '+e);
				});
			}
		})
	};

	function wait4XmlProductsGetComplete(){
		//debugDev('Enter Step2 wait4XmlProductsGetComplete');
		tmpArrayCategoriesCount4Xml--;
		//debugDev('incompleted category/products xml count = ' + tmpArrayCategoriesCount4Xml);
		if (!tmpArrayCategoriesCount4Xml) {
			debugDev('xml RTours Count = ' + jsonProductsFromXml.products.length);
			tmpXMLProductsCount = jsonProductsFromXml.products.length;
			getProductsByXMLProducts();
		}
	}

	arrayJsonCategories.forEach( myCategory => {
		
		let xmlProductGetByCategoryUrl = 'https://bookur.rezdy.com/catalog/' + myCategory.id + '/' + myCategory.name.toLowerCase() + '?format=xml';
		//debugDev('xmlProductGetByCategoryUrl = ' + xmlProductGetByCategoryUrl);

		https.get(xmlProductGetByCategoryUrl, (res) => {
		  const statusCode = res.statusCode;
		  const contentType = res.headers['content-type'];

		  let error;
		  if (statusCode !== 200) {
		    error = new Error(`XML Request Failed.\n` +
		                      `Status Code: ${statusCode}`);
		  } else if (!/^text\/xml/.test(contentType)) {
		    error = new Error(`Invalid content-type.\n` +
		                      `Expected text/xml but received ${contentType}`);
		  }
		  if (error) {
		    console.log(error.message);
		    // consume response data to free up memory
		    res.resume();
		    return;
		  }

		  res.setEncoding('utf8');
		  let rawData = '';
		  //let tmpJsonProductsFromXml;

		  res.on('data', (chunk) => rawData += chunk);
		  res.on('end', () => {
		  	if(!rawData.length){
			    try {
					parseString(rawData, {explicitArray:false}, function (err, result) {
						console.log('Cat - %s : Count = %s',myCategory.name,result.products.product.length);
						myCategory.count = result.products.product.length;
					    if(Array.isArray(result.products.product)){			    	
					    	result.products.product.forEach( item => {
					    		jsonProductsFromXml.products.push(item);
				    		});				    
					    } else {
					    	jsonProductsFromXml.products.push(result.products.product);
					    }
					});
					wait4XmlProductsGetComplete();
			    } catch (e) {
			      console.log(e.message);
			    }
			}
		  });
		}).on('error', (e) => {
		  console.log(`Got error during getting XML RTours from my categories: ${e.message}`);
		});
	})
}

function step3GetSuppliersByProducts(supplierAliasFromProducts){

	console.log('Step3GetSuppliersByProducts starts!');
	//debugDev('supplierAliasFromProducts = ' + JSON.stringify(supplierAliasFromProducts));

	var jsonSuppliers = { "companies":[] };
	var supplierCount = supplierAliasFromProducts.length;
	//debugDev('Supplier Count = ' + supplierCount);

	var optionsSuppliersByProduct = {	
	    host : conf.host,
	    port : conf.port,
	    method : 'GET',
	    headers: conf.headers
	};

	function addSupplierCategory2ProductTourCategory(){
		arrayJsonSuppliers.forEach( (supplierItem,supplierIndex) => {
			var alias = supplierItem.alias;
			var category = supplierItem.category;

			arrayJsonProducts.forEach( (productItem,productIndex) => {
				if( alias === productItem.supplierAlias){
					productItem.tourCategory = category;
				}
			});
		});
	}

	function handleSupplierResult(){		
		//debugDev('Enter handleSupplierResult');
		//debugDev('jsonSupplier count = ' + jsonSuppliers.companies.length);
    	fs.writeFileSync('./datafiles/rawSuppliers-'+targetEnv+'.json', JSON.stringify(jsonSuppliers));
		arrayJsonSuppliers = jsonSuppliers.companies;

		addSupplierCategory2ProductTourCategory();

    	fs.writeFileSync('./datafiles/arrayJsonSuppliers-'+targetEnv+'.json', JSON.stringify(arrayJsonSuppliers));
    	fs.writeFileSync('./datafiles/arrayJsonProducts-'+targetEnv+'.json', JSON.stringify(arrayJsonProducts));
    	fs.writeFileSync('./datafiles/arrayJsonCategories-'+targetEnv+'.json', JSON.stringify(arrayJsonCategories));
    	
		debugDev('Step3GetSuppliersByProducts END!');
    	step4GenerateMDBRecords();
	}

	function wait4ApiCallComplete(){
		//debugDev('Enter wait4ApiCallComplete');
		supplierCount--;
		//debugDev('incompleted supplier count = ' + supplierCount);
		if (!supplierCount) {
			handleSupplierResult();
		}
	}
	
	supplierAliasFromProducts.forEach( (item,index) => {
		if(item.supplierId.match(/ˆ10792-/)){
			return
		}

		var supplierId = item.supplierId;
		var queryParam = '/' + item.supplierAlias;
		// console.log('item.supplierAlias = ' + item.supplierAlias);
		optionsSuppliersByProduct.path = conf.path + '/companies' + queryParam + '?apiKey=' + conf.apiKey;
		var getSupplierByProduct = https.request(optionsSuppliersByProduct, function(res) {

			var tempRawSuppliers = '';
			var tempJsonSuppliers = {};

		    res.on('data', (d) => {
		        tempRawSuppliers += d;
		    });

		    res.on('end', () => {
		    	tempJsonSuppliers = JSON.parse(tempRawSuppliers);
		    	//debugDev('request status success = ' + tempJsonSuppliers.requestStatus.success);
		    	if (tempJsonSuppliers.requestStatus.success === true) {
			    	delete tempJsonSuppliers.requestStatus;
			    	tempJsonSuppliers.companies.forEach( (item,index) => {
			    		item.id = supplierId;
			    		jsonSuppliers.companies.push(item);
			    	});
		    	}
		        wait4ApiCallComplete();
		    });

		});

		getSupplierByProduct.end();
		getSupplierByProduct.on('error', (e) => {
		    console.error('getSupplierByProduct error - \n' + e);
		});
	});
	//debugDev('new Supplier Getting Count = ' + jsonSuppliers.companies.length);

}

function step4GenerateMDBRecords(){

	console.log('step4GenerateMDBRecords starts!');
	var supplierRecordsGenComplete = false;
	var productRecordsGenComplete = false;
	var mapping = require('./lib/mapping-util.js');

	var wait4MDBRecordsGenComplete = () => {
		if(supplierRecordsGenComplete && productRecordsGenComplete){
			apiCallComplete = true;
			debugDev('step4GenerateMDBRecords END!');
			stage2Save2MDB();
		}
	};

	// functions
	function handleSupplierRecords(){

		var checkTaxonomySupplierIdComplete = false;
		var checkTaxonomySupplierAliasComplete = false;


		function setSupplierTaxonomy(supplierId,supplierAlias,city){
			var taxonomy = {};

			//navigation
			taxonomy.navigation = taxonomyNavigation;

			//Supplier ID
			taxonomy[taxonomyVocabularyId.supplierId] = taxonomySupplierId[supplierId];

			//Supplier Alias
			taxonomy[taxonomyVocabularyId.supplierAlias] = taxonomySupplierAlias[supplierAlias];
			
			return taxonomy;
		}

		//format Tour Suppliers records
		var genRSupplierRecords = () => {
			if(checkTaxonomySupplierIdComplete && checkTaxonomySupplierAliasComplete){
		    	fs.writeFileSync('./datafiles/taxonomySupplierId-'+targetEnv+'.json', JSON.stringify(taxonomySupplierId));
		    	fs.writeFileSync('./datafiles/taxonomySupplierAlias-'+targetEnv+'.json', JSON.stringify(taxonomySupplierAlias));

				arrayJsonSuppliers.forEach( (item,index) => {
					item.text = item.companyName;
					item.typeId = contentTypeId.supplier;
					item.version = 1;
					item.online = true;
					item.lastUpdateTime = parseInt((Date.now()/1000).toFixed(0));
					item.createTime = item.lastUpdateTime;
					item.isProduct = false;
					item.productProperties = "";
					item.workspace = {};
						item.workspace.fields = {};
							item.workspace.fields.alias = item.alias;
							item.workspace.fields.firstName = item.firstName;
							item.workspace.fields.lastName = item.lastName;
							item.workspace.fields.address = item.address;
							item.workspace.fields.position = {};
								item.workspace.fields.position.address = item.address.addressLine + ' ' + item.address.city + ' ' + item.address.state + ' ' + (undefined !== item.address.countryCode) ? item.address.countryCode.toUpperCase() : '' + ' ' + item.locationAddress.postCode;
								item.workspace.fields.position.location = {};
									item.workspace.fields.position.location.type = 'Point';
									item.workspace.fields.position.location.coordinates = [];
									item.workspace.fields.position.location.coordinates.push(item.address.longitude);
									item.workspace.fields.position.location.coordinates.push(item.address.latitude);
								item.workspace.fields.position.lat = item.address.latitude;
								item.workspace.fields.position.lon = item.address.longitude;
							item.workspace.fields.destinationName = item.destinationName;
							item.workspace.fields.destinationCountryCode = item.destinationCountryCode;
							item.workspace.fields.destinationPath = item.destinationPath;
							item.workspace.fields.companyLogoUrl = item.companyLogoUrl;
							item.workspace.fields.currency = item.currency;
							item.workspace.fields.locale = item.locale;
							item.workspace.fields.timezone = item.timezone;
							item.workspace.fields.category = item.category;
							item.workspace.fields.companyDescription = item.companyDescription;
							item.workspace.fields.phone = item.phone;
							item.workspace.fields.mobile = item.mobile;
							item.workspace.fields.fax = item.fax;
							item.workspace.fields.skype = item.skype;
							item.workspace.fields.terms = item.terms;
							item.workspace.fields.openingHours = item.openingHours;
							item.workspace.fields.facebookPage = item.facebookPage;
							item.workspace.fields.googlePlus = item.googlePlus;
							item.workspace.fields.yelp = item.yelp;
							item.workspace.fields.instagram = item.instagram;
							item.workspace.fields.pinterest = item.pinterest;
							item.workspace.fields.youtubeChannel = item.youtubeChannel;
							item.workspace.fields.tripAdvisor = item.tripAdvisor;
							item.workspace.fields.twitter = item.twitter;
							item.workspace.fields.website = item.website;
							item.workspace.fields.id = item.id;
							item.workspace.fields.fbPageId = item.fbPageId;
						item.workspace.status = "published";
						item.workspace.taxonomy  = setSupplierTaxonomy(item.id,item.alias,item.destinationName);
						//console.log('item.workspace.taxonomy = '+JSON.stringify(item.workspace.taxonomy));
						item.workspace.startPublicationDate = null;
						item.workspace.endPublicationDate = null;
						item.workspace.target = ["global"];
						item.workspace.writeWorkspace = "global";
						item.workspace.pageId = "";
						item.workspace.maskId = "";
						item.workspace.blockId = "";
						item.workspace.i18n = {};
							item.workspace.i18n.en = {};
								item.workspace.i18n.en.fields = {};
									item.workspace.i18n.en.fields.text = item.text;
									item.workspace.i18n.en.fields.urlSegment = "";
									item.workspace.i18n.en.fields.summary = item.text;
								item.workspace.i18n.en.locale = "en";
						item.workspace.nativeLanguage = "en";
						item.workspace.clickStreamEvent = "";

					item.live = item.workspace;

					item.lastUpdateUser = crudUser;
					item.createUser = crudUser;

					delete item.alias;
					delete item.companyName;
					delete item.firstName;
					delete item.lastName;
					delete item.address;
					delete item.destinationName;
					delete item.destinationCountryCode;
					delete item.destinationPath;
					delete item.companyLogoUrl;
					delete item.currency;
					delete item.locale;
					delete item.timezone;
					delete item.category;
					delete item.companyDescription;
					delete item.phone;
					delete item.mobile;
					delete item.fax;
					delete item.skype;
					delete item.terms;
					delete item.openingHours;
					delete item.facebookPage;
					delete item.googlePlus;
					delete item.yelp;
					delete item.instagram;
					delete item.pinterest;
					delete item.youtubeChannel;
					delete item.tripAdvisor;
					delete item.twitter;
					delete item.website;
					delete item.id;
					delete item.fbPageId;
				});
		    	fs.writeFileSync('./datafiles/arrayJsonSuppliers4db-'+targetEnv+'.json', JSON.stringify(arrayJsonSuppliers));
		    	supplierRecordsGenComplete = true;
		    	wait4MDBRecordsGenComplete();
			}
		};

    	//function definition within handleSupplierRecords
    	//
    	function checkTaxonomySupplierAlias(){

			var supplierAliasCount = arrayJsonSuppliers.length;
			//debugDev('supplierAliasCount = ' + supplierAliasCount);
			var wait4TxnmSupplierAliasComplete = (db) => {
				supplierAliasCount--;
				if(0 === supplierAliasCount){
					checkTaxonomySupplierAliasComplete = true;
					db.close();
					genRSupplierRecords();
				}
			};

			//add taxonomy - Supplier ID
			MongoClient.connect(mdbUrl, (err, db) => {

				if(null === err) console.log("		---checkTaxonomySupplierAlias Connected successfully to server");

				var insertTaxonomySupplierAlias = (supplier,cb) => {
					debugDev(supplier.alias + ' NOT found!! and enter insert process.');
					var data = {};
					data.text = supplier.alias;
					data.version = 1;
					data.vocabularyId = taxonomyVocabularyId.supplierAlias;
					data.orderValue = 100;
					data.expandable = false;
					data.nativeLanguage = "en";
					data.i18n = {};
						data.i18n.en = {};
							data.i18n.en.text = supplier.alias;
							data.i18n.en.locale = "en";
					data.parentId = "root";
					data.lastUpdateUser = crudUser;
					data.createUser = crudUser;
					data.createTime = parseInt((Date.now()/1000).toFixed(0));
					data.lastUpdateTime = data.createTime;
					collection.insertOne(data, {forceServerObjectId:true})
						.then((r) => {
							cb();
						})
						.catch((e) => {
							console.log('taxonomy insert error: '+e+'; '+JSON.stringify(data));
						});
				};

				var collection = db.collection('TaxonomyTerms');

				arrayJsonSuppliers.forEach( (item, index) => {			
					var queryParam = { vocabularyId : taxonomyVocabularyId.supplierAlias, text: item.alias };
					var options = {};
					collection.findOne(queryParam, options, (e,d) => {
						if(null === e){
							if(null !== d){
								taxonomySupplierAlias[d.text] = d['_id']+'';
								wait4TxnmSupplierAliasComplete(db);
							}else{
								insertTaxonomySupplierAlias(item, () => {
									collection.findOne(queryParam,options, (e,d) =>{
										if(null === e){
											taxonomySupplierAlias[d.text] = d['_id']+'';
											wait4TxnmSupplierAliasComplete(db);
										} else {
											console.log('taxonomy supplier alias after-inserted find error!');
										}
									});
								});
							}
						}else{
							console.log('Find taxonomy supplier alias error!');
						}
					});
				});
			});
    	}
		
    	function checkTaxonomySupplierId(){

			var supplierIdCount = arrayJsonSuppliers.length;
			//debugDev('supplierIdCount = ' + supplierIdCount);
			var wait4TxnmSupplierIdComplete = (db) => {
				supplierIdCount--;
				if(0 === supplierIdCount){
					checkTaxonomySupplierIdComplete = true;
					db.close();
					genRSupplierRecords();
				}
			};

			//add taxonomy - Supplier ID
			MongoClient.connect(mdbUrl, (err, db) => {

				if(null === err) console.log("		--- checkTaxonomySupplierId Connected successfully to server");

				var insertTaxonomySupplierId = (supplier,cb) => {
					debugDev(supplier.id + ' NOT found!! and enter insert process.');
					var data = {};
					data.text = supplier.id;
					data.version = 1;
					data.vocabularyId = taxonomyVocabularyId.supplierId;
					data.orderValue = 100;
					data.expandable = false;
					data.nativeLanguage = "en";
					data.i18n = {};
						data.i18n.en = {};
							data.i18n.en.text = supplier.id;
							data.i18n.en.locale = "en";
					data.parentId = "root";
					data.lastUpdateUser = crudUser;
					data.createUser = crudUser;
					data.createTime = parseInt((Date.now()/1000).toFixed(0));
					data.lastUpdateTime = data.createTime;
					collection.insertOne(data, {forceServerObjectId:true})
						.then((r) => {
							cb();
						})
						.catch((e) => {
							console.log('taxonomy insert error: '+e+'; '+JSON.stringify(data));
						});
				};

				var collection = db.collection('TaxonomyTerms');

				arrayJsonSuppliers.forEach( (item, index) => {			
					var queryParam = { vocabularyId : taxonomyVocabularyId.supplierId, text: item.id };
					var options = {};
					collection.findOne(queryParam, options, (e,d) => {
						if(null === e){
							if(null !== d){
								//d['_id']+'' notation is because _id type is ObjectId. if you want to convert ObjectId to a string
								//concat it with empty string '' then you will get _id's string value.
								taxonomySupplierId[d.text] = d['_id']+'';
								wait4TxnmSupplierIdComplete(db);
							}else{
								insertTaxonomySupplierId(item, () => {
									collection.findOne(queryParam,options, (e,d) =>{
										if(null === e){
											taxonomySupplierId[d.text] = d['_id']+'';
											wait4TxnmSupplierIdComplete(db);
										} else {
											console.log('taxonomy supplier id after-inserted find error!');
										}
									});
								});
							}
						}else{
							console.log('Find taxonomy supplier id error!');
						}
					});
				});
			});
    	}

		//starting point
    	checkTaxonomySupplierId();
    	checkTaxonomySupplierAlias();
	}

	function handleProductRecords(){

		var allProductType = []; //has been renamed to Tour Type
		var allAgentPaymentType = [];
		var allProductCode = [];

		var checkTaxonomyProductTypeComplete = false;
		var checkTaxonomyAgentPaymentTypeComplete = false;
		var checkTaxonomyProductCodeComplete = false;
		var getTXMap = require('./lib/getTXTermsMap.js');
		var options = {
			'txVocName': ['Tour Category'],
			//'txTermsFlag': true,
			//'reversedListing': false,
			'targetEnv': targetEnv,
			'dbOPSwitch': dbOPSwitch
		};

		getTXMap(options, (vocs,terms)=>{
			taxonomyTourCategory = terms.TourCategory;
		});

		arrayJsonProducts.forEach( (item,index) => {

			//modified for taxonomy tour type mapping
			var source = item.productType;
			var target = '';
			if(source)	target = mapping.getTargetTourType(source);
			if(target){
				if( -1 === allProductType.indexOf(target)){
					allProductType.push(target);
				}
			}

			if( -1 === allAgentPaymentType.indexOf(item.agentPaymentType)){
				allAgentPaymentType.push(item.agentPaymentType);
			}

			if( -1 === allProductCode.indexOf(item.productCode)){
				allProductCode.push(item.productCode);
			}

		});

    	checkTaxonomyProductType();
    	checkTaxonomyAgentPaymentType();
    	checkTaxonomyProductCode();

    	//format Tours & RTours DB records
    	var genTourProductRecords = () => {

    		if(checkTaxonomyProductTypeComplete && checkTaxonomyAgentPaymentTypeComplete && checkTaxonomyProductCodeComplete){

		    	fs.writeFileSync('./datafiles/taxonomyProductType-'+targetEnv+'.json', JSON.stringify(taxonomyProductType));
		    	fs.writeFileSync('./datafiles/taxonomyAgentPaymentType-'+targetEnv+'.json', JSON.stringify(taxonomyAgentPaymentType));
		    	fs.writeFileSync('./datafiles/taxonomyProductCode-'+targetEnv+'.json', JSON.stringify(taxonomyProductCode));

		    	// RTours
				arrayJsonProducts.forEach( (item,index) => {

					item.text = item.name;
					item.typeId = contentTypeId.product;
					item.version = 1;
					item.online = true;
					item.lastUpdateTime = parseInt((Date.now()/1000).toFixed(0));
					item.createTime = item.lastUpdateTime;
					item.isProduct = false;
					item.productProperties = "";
					item.workspace = {};
						item.workspace.fields = {};
						item.workspace.fields.productType = item.productType;
						item.workspace.fields.productCode = item.productCode;
						item.workspace.fields.internalCode = item.internalCode;
						item.workspace.fields.supplierId = util.isNullOrUndefined(item.supplierId) ? '' : item.supplierId.toString();
						item.workspace.fields.supplierAlias = item.supplierAlias;
						item.workspace.fields.supplierName = item.supplierName;
						item.workspace.fields.timezone = item.timezone;
						item.workspace.fields.advertisedPrice = item.advertisedPrice;
						item.workspace.fields.priceOptions = item.priceOptions;
						item.workspace.fields.currency = item.currency;
						item.workspace.fields.unitLabel = item.unitLabel;
						item.workspace.fields.unitLabelPlural = item.unitLabelPlural;
						item.workspace.fields.quantityRequired = item.quantityRequired;
						item.workspace.fields.quantityRequiredMin = item.quantityRequiredMin;
						item.workspace.fields.uantityRequiredMax = item.uantityRequiredMax;
						item.workspace.fields.images = item.images;
						item.workspace.fields.bookingMode = item.bookingMode;
						item.workspace.fields.charter = item.charter;
						item.workspace.fields.terms = item.terms;
						item.workspace.fields.generalTerms = item.generalTerms;
						item.workspace.fields.extras = item.extras;
						item.workspace.fields.bookingFields = item.bookingFields;
						item.workspace.fields.latitude = item.latitude;
						item.workspace.fields.longitude = item.longitude;
						item.workspace.fields.confirmMode = item.confirmMode;
						item.workspace.fields.confirmModeMinParticipants = item.confirmModeMinParticipants;
						item.workspace.fields.agentPaymentType = item.agentPaymentType;
						item.workspace.fields.maxCommissionPercent = item.maxCommissionPercent;
						item.workspace.fields.commissionIncludesExtras = item.commissionIncludesExtras;
						item.workspace.fields.cancellationPolicyDays = item.cancellationPolicyDays;
						item.workspace.fields.dateCreated = item.dateCreated;
						item.workspace.fields.minimumNoticeMinutes = item.minimumNoticeMinutes;
						item.workspace.fields.durationMinutes = item.durationMinutes;
						item.workspace.fields.dateUpdated = item.dateUpdated;
						if(item.pickupId !== undefined){
							item.workspace.fields.pickupId = item.pickupId.toString();
						}
						if(util.isNullOrUndefined(item.locationAddress)){
							item.locationAddress = {};
						}
						item.workspace.fields.locationAddress = item.locationAddress;
						item.workspace.fields.position = {};

							item.workspace.fields.position.address = util.isNullOrUndefined(item.locationAddress.addressLine) ? '' : item.locationAddress.addressLine
								+ ' ' + util.isNullOrUndefined(item.locationAddress.city) ? '' : item.locationAddress.city 
								+ ' ' + util.isNullOrUndefined(item.locationAddress.state) ? '' : item.locationAddress.state
								+ ' ' + util.isNullOrUndefined(item.locationAddress.countryCode) ? '' : item.locationAddress.countryCode
								+ ' ' + util.isNullOrUndefined(item.locationAddress.postCode) ? '' : item.locationAddress.postCode;
							item.workspace.fields.position.location = {};
								item.workspace.fields.position.location.type = 'Point';
								item.workspace.fields.position.location.coordinates = [];
								item.workspace.fields.position.location.coordinates.push(util.isNullOrUndefined(item.locationAddress.longitude)?0:item.locationAddress.longitude);
								item.workspace.fields.position.location.coordinates.push(util.isNullOrUndefined(item.locationAddress.latitude)?0:item.locationAddress.latitude);
							item.workspace.fields.position.lat = util.isNullOrUndefined(item.locationAddress.latitude)?0:item.locationAddress.latitude;
							item.workspace.fields.position.lon = util.isNullOrUndefined(item.locationAddress.longitude)?0:item.locationAddress.longitude;
						item.workspace.fields.additionalInformation = item.additionalInformation;
						item.workspace.fields.languages = item.languages;
						item.workspace.fields.rzdId = item.rzdId;
						item.workspace.fields.calendarWidgetUrl = item.calendarWidgetUrl;
						item.workspace.fields.productPageUrl = item.productPageUrl;
						item.workspace.fields.tourCategory = item.tourCategory;
						item.workspace.fields.badgeImage = '';
						if(util.isNullOrUndefined(item.images)){
							item.workspace.fields.photoPath = "https://static.rezdy.com/1487224471/themes/rezdyv2/images/no-image.jpg";
						} else if(util.isNullOrUndefined(item.images[0])){
							item.workspace.fields.photoPath = "https://static.rezdy.com/1487224471/themes/rezdyv2/images/no-image.jpg";
						} else {
							item.workspace.fields.photoPath = item.images[0].itemUrl;
						}
						item.workspace.fields.source = 'Marketplace';
						item.workspace.fields.badgeTargetUrl = '';
						

						item.workspace.status = "published";
						item.workspace.taxonomy = setProductTaxonomy(item.workspace.fields.supplierId, item.supplierAlias, item.productType, item.agentPaymentType, item.productCode);
						item.workspace.startPublicationDate = null;
						item.workspace.endPublicationDate = null;
						item.workspace.target = ["global"];
						item.workspace.writeWorkspace = "global";
						item.workspace.pageId = "";
						item.workspace.maskId = "";
						item.workspace.blockId = "";
						item.workspace.i18n = {};
						item.workspace.i18n.en = {};
							item.workspace.i18n.en.fields = {};
								item.workspace.i18n.en.fields.text = item.name;
								item.workspace.i18n.en.fields.urlSegment = "";
								item.workspace.i18n.en.fields.summary = item.shortDescription;
								item.workspace.i18n.en.fields.name = item.name;
								item.workspace.i18n.en.fields.shortDescription = item.shortDescription;
								item.workspace.i18n.en.fields.description = item.description;
							item.workspace.i18n.en.locale = "en";
						item.workspace.nativeLanguage = "en";
						item.workspace.clickStreamEvent = "";

					item.live = item.workspace;

					item.lastUpdateUser = crudUser;
					item.createUser = crudUser;

					delete item.productType;
					delete item.name;
					delete item.shortDescription;
					delete item.description;
					delete item.productCode;
					delete item.internalCode;
					delete item.supplierId;
					delete item.supplierAlias;
					delete item.supplierName;
					delete item.timezone;
					delete item.advertisedPrice;
					delete item.priceOptions;
					delete item.currency;
					delete item.unitLabel;
					delete item.unitLabelPlural;
					delete item.quantityRequired;
					delete item.quantityRequiredMin;
					delete item.quantityRequiredMax;
					delete item.images;
					delete item.bookingMode;
					delete item.charter;
					delete item.terms;
					delete item.generalTerms;
					delete item.extras;
					delete item.bookingFields;
					delete item.latitude;
					delete item.longitude;
					delete item.confirmMode;
					delete item.confirmModeMinParticipants;
					delete item.commissionIncludesExtras;
					delete item.minimumNoticeMinutes;
					delete item.durationMinutes;
					delete item.dateUpdated;
					delete item.locationAddress;
					delete item.additionalInformation;
					delete item.languages;
					delete item.rzdId;
					delete item.productPageUrl;
					delete item.calendarWidgetUrl;
					delete item.tourCategory;
					delete item.agentPaymentType;
					delete item.maxCommissionPercent;
					delete item.cancellationPolicyDays;
					delete item.dateCreated;
					delete item.pickupId;

					if(item.workspace.fields.productCode === 'P785EE'){
						console.log('### Debug break poit 2 ###');
					}


				});
		    	fs.writeFileSync('./datafiles/arrayJsonProducts4db-'+targetEnv+'.json', JSON.stringify(arrayJsonProducts));

		    	//for content type - tours
		    	arrayJsonProducts.forEach( (item,index) => {

					if(item.workspace.fields.productCode === 'P785EE'){
						console.log('### Debug break poit 3 ###');
					}

		    		var tours={};

					tours.text = item.text;
					tours.typeId = contentTypeId.tours;
					tours.version = item.version;
					tours.online = false;
					tours.lastUpdateTime = item.lastUpdateTime;
					tours.createTime = item.lastUpdateTime;
					tours.isProduct = item.isProduct;
					tours.productProperties = item.productProperties;
					tours.workspace = {};
						tours.workspace.fields = {};
							tours.workspace.fields.productType = item.workspace.fields.productType;
							tours.workspace.fields.productCode = item.workspace.fields.productCode;
							tours.workspace.fields.supplierId = item.workspace.fields.supplierId;
							tours.workspace.fields.supplierAlias = item.workspace.fields.supplierAlias;
							tours.workspace.fields.advertisedPrice = item.workspace.fields.advertisedPrice;
							tours.workspace.fields.currency = item.workspace.fields.currency;
							tours.workspace.fields.languages = item.workspace.fields.languages;
							tours.workspace.fields.calendarWidgetUrl = item.workspace.fields.calendarWidgetUrl;
							tours.workspace.fields.productPageUrl = item.workspace.fields.productPageUrl;
							tours.workspace.fields.photoPath = item.workspace.fields.photoPath;
							tours.workspace.fields.locationAddress = item.workspace.fields.locationAddress;
							tours.workspace.fields.marketplace = 'Rezdy';
							tours.workspace.fields.promotionCode = '';
							tours.workspace.fields.discount = '';
							tours.workspace.fields.travelBefore = '';
							tours.workspace.fields.badgeImage = '';
							tours.workspace.fields.badgeTargetUrl = '';
						tours.workspace.status = 'draft';
						//tours.workspace.taxonomy = item.workspace.taxonomy; //this line doesn't work because after this line tours.workspace.taxonomy will point to the same object of item.workspace.taxonomy
						tours.workspace.taxonomy = JSON.parse(JSON.stringify(item.workspace.taxonomy));

						//Add Code here
						//Tour Category --> tourCategory should be added
						var source = item.workspace.fields.tourCategory;
						var target = '';
						if(source)	target = mapping.getTargetTourCategory(source);
						if(target){
							tours.workspace.taxonomy[taxonomyVocabularyId.TourCategory] = [];
							tours.workspace.taxonomy[taxonomyVocabularyId.TourCategory].push(taxonomyTourCategory[target]);
						}
						tours.workspace.taxonomy[taxonomyVocabularyId.Promotion] = '';
					
						tours.workspace.startPublicationDate = item.workspace.startPublicationDate;
						tours.workspace.endPublicationDate = item.workspace.endPublicationDate;
						tours.workspace.target = item.workspace.target;
						tours.workspace.writeWorkspace = item.workspace.writeWorkspace;
						tours.workspace.pageId = item.workspace.pageId;
						tours.workspace.maskId = item.workspace.maskId;
						tours.workspace.blockId = item.workspace.blockId;
						tours.workspace.i18n = {};
						tours.workspace.i18n.en = {};
							tours.workspace.i18n.en.fields = {};
								tours.workspace.i18n.en.fields.text = item.workspace.i18n.en.fields.text;
								tours.workspace.i18n.en.fields.urlSegment = item.workspace.i18n.en.fields.urlSegment;
								tours.workspace.i18n.en.fields.summary = item.workspace.i18n.en.fields.summary;
								tours.workspace.i18n.en.fields.name = item.workspace.i18n.en.fields.name;
								tours.workspace.i18n.en.fields.shortDescription = item.workspace.i18n.en.fields.shortDescription;
								tours.workspace.i18n.en.fields.description = item.workspace.i18n.en.fields.description;
							tours.workspace.i18n.en.locale = item.workspace.i18n.en.locale;
						tours.workspace.nativeLanguage = item.workspace.nativeLanguage;
						tours.workspace.clickStreamEvent = item.workspace.clickStreamEvent;
						
						//set Taxonomy Search Selector to Tours
						tours.workspace.taxonomy[taxonomySSVocabularyId.searchSelector] = [];
						tours.workspace.taxonomy[taxonomySSVocabularyId.searchSelector].push(taxonomySSTermsId.generalSearch);

					tours.live = tours.workspace;

					tours.lastUpdateUser = crudUser;
					tours.createUser = crudUser;

					if(item.workspace.fields.productCode === 'P785EE'){
						console.log('### Debug break poit 4 ###');
					}

					arrayJsonToursProducts.push(tours);

		    	});
		    	fs.writeFileSync('./datafiles/arrayJsonToursProducts4db-'+targetEnv+'.json', JSON.stringify(arrayJsonToursProducts));
		    	productRecordsGenComplete = true;
		    	wait4MDBRecordsGenComplete();
	    	}
    	};

    	function checkTaxonomyProductCode(){

    		var productCodeCount = allProductCode.length;

			//add taxonomy - Product Code
			MongoClient.connect(mdbUrl, (err, db) => {

				if(null === err) console.log("		--- checkTaxonomyProductCode Connected successfully to server");

				var collection = db.collection('TaxonomyTerms');

				allProductCode.forEach( (item, index) => {			
					var queryParam = { vocabularyId : taxonomyVocabularyId.productCode, text: item };
					var options = {};
					collection.findOne(queryParam, options, (e,d) => {
						if(null === e){
							if(null !== d){
								taxonomyProductCode[d.text] = d['_id']+'';
								wait4TxnmProductCodeComplete(db);
							}else{
								insertTaxonomyProductCode(item, () => {
									collection.findOne(queryParam,options, (e,d) =>{
										if(null === e){
											taxonomyProductCode[d.text] = d['_id']+'';
											wait4TxnmProductCodeComplete(db);
										} else {
											console.log('taxonomy Product Code after-inserted find error!');
										}
									});
								});
							}
						}else{
							console.log('Find taxonomy Product Code error!');
						}
					});
				});

				var insertTaxonomyProductCode = (productCode,cb) => {
					debugDev('Product Code: ' + productCode + ' NOT found!! and enter insert process.');
					var data = {};
					data.text = productCode;
					data.version = 1;
					data.vocabularyId = taxonomyVocabularyId.productCode;
					data.orderValue = 100;
					data.expandable = false;
					data.nativeLanguage = "en";
					data.i18n = {};
						data.i18n.en = {};
							data.i18n.en.text = productCode;
							data.i18n.en.locale = "en";
					data.parentId = "root";
					data.lastUpdateUser = crudUser;
					data.createUser = crudUser;
					data.createTime = parseInt((Date.now()/1000).toFixed(0));
					data.lastUpdateTime = data.createTime;
					collection.insertOne(data, {forceServerObjectId:true})
						.then((r) => {
							cb();
						})
						.catch((e) => {
							console.log('taxonomy product code insert error: '+e+'; '+JSON.stringify(data));
						});

				};


			});


			var wait4TxnmProductCodeComplete = (db) => {
				productCodeCount--;
				if(0 === productCodeCount){
					checkTaxonomyProductCodeComplete = true;
					db.close();
					genTourProductRecords();
				}
			};

    	}

    	function checkTaxonomyProductType(){
    		
    		var productTypeCount = allProductType.length;
    		var txTourTypeCheckingLog = '';
    		var txTermMissing = false;

			//add taxonomy - Product Type
			MongoClient.connect(mdbUrl, (err, db) => {

				if(null === err) console.log("		--- checkTaxonomyProductType Connected successfully to server");

				var collection = db.collection('TaxonomyTerms');

				allProductType.forEach( (item, index) => {			
					var queryParam = { vocabularyId : taxonomyVocabularyId.productType, text: item };
					var options = {};
					collection.findOne(queryParam, options, (e,d) => {
						if(null === e){
							if(null !== d){
								taxonomyProductType[d.text] = d['_id']+'';
								wait4TxnmProductTypeComplete(db);
							}else{
								txTermMissing = true;
								txTourTypeCheckingLog += 'Taxonomy Product Type (Tour Type) - ' + item + ' - MISSING.\n';
								wait4TxnmProductTypeComplete(db);
								//Commented because taxonomy Product Type(Tour Type) should be inserted by tours-merging/updateTXTerms.js with tours-merging/mapping/type.json
								//
								// insertTaxonomyProductType(item, () => {
								// 	collection.findOne(queryParam,options, (e,d) =>{
								// 		if(null === e){
								// 			taxonomyProductType[d.text] = d['_id']+'';
								// 			wait4TxnmProductTypeComplete(db);
								// 		} else {
								// 			console.log('taxonomy Product Type after-inserted find error!');
								// 		}
								// 	});
								// });
							}
						}else{
							console.log('Find taxonomy Product Type error! - ' + err);
						}
					});
				});

				var insertTaxonomyProductType = (productType,cb) => {
					debugDev('Product Type: ' + productType + ' NOT found!! and enter insert process.');
					var data = {};
					data.text = productType;
					data.version = 1;
					data.vocabularyId = taxonomyVocabularyId.productType;
					data.orderValue = 100;
					data.expandable = false;
					data.nativeLanguage = "en";
					data.i18n = {};
						data.i18n.en = {};
							data.i18n.en.text = productType;
							data.i18n.en.locale = "en";
					data.parentId = "root";
					data.lastUpdateUser = crudUser;
					data.createUser = crudUser;
					data.createTime = parseInt((Date.now()/1000).toFixed(0));
					data.lastUpdateTime = data.createTime;
					collection.insertOne(data, {forceServerObjectId:true})
						.then((r) => {
							cb();
						})
						.catch((e) => {
							console.log('taxonomy product type insert error: '+e+'; '+JSON.stringify(data));
						});

				};


			});


			var wait4TxnmProductTypeComplete = (db) => {
				productTypeCount--;
				if(0 === productTypeCount){
					if(txTermMissing){
						checkTaxonomyProductTypeComplete = false;
						fs.writeFileSync('./logs/TXTourTypeTermsMissing-'+targetEnv+'.log', txTourTypeCheckingLog);
						console.log('****** TX Product Type (Tour Type) terms MISSING!! Please press CTRL-C for breaking the excution then refer to the file - ./logs/TXTourTypeTermsMissing.log !! ****');
					}else{
						checkTaxonomyProductTypeComplete = true;
					}
					db.close();
					genTourProductRecords();
				}
			};

    	}

    	function checkTaxonomyAgentPaymentType(){
    		
    		var agentPaymentTypeCount = allAgentPaymentType.length;

			//add taxonomy - Product Type
			MongoClient.connect(mdbUrl, (err, db) => {

				if(null === err) console.log("		--- checkTaxonomyAgentPaymentType Connected successfully to server");

				var collection = db.collection('TaxonomyTerms');

				allAgentPaymentType.forEach( (item, index) => {			
					var queryParam = { vocabularyId : taxonomyVocabularyId.agentPaymentType, text: item };
					var options = {};
					collection.findOne(queryParam, options, (e,d) => {
						if(null === e){
							if(null !== d){
								taxonomyAgentPaymentType[d.text] = d['_id']+'';
								wait4TxnmAgentPaymentTypeComplete(db);
							}else{
								insertTaxonomyAgentPaymentType(item, () => {
									collection.findOne(queryParam,options, (e,d) =>{
										if(null === e){
											taxonomyAgentPaymentType[d.text] = d['_id']+'';
											wait4TxnmAgentPaymentTypeComplete(db);
										} else {
											console.log('taxonomy AgentPaymentType after-inserted find error!');
										}
									});
								});
							}
						}else{
							console.log('Find taxonomy AgentPaymentType error!');
						}
					});
				});

				var insertTaxonomyAgentPaymentType = (agentPaymentType,cb) => {
					debugDev('AgentPaymentType: ' + agentPaymentType + ' NOT found!! and enter insert process.');
					var data = {};
					data.text = agentPaymentType;
					data.version = 1;
					data.vocabularyId = taxonomyVocabularyId.agentPaymentType;
					data.orderValue = 100;
					data.expandable = false;
					data.nativeLanguage = "en";
					data.i18n = {};
						data.i18n.en = {};
							data.i18n.en.text = agentPaymentType;
							data.i18n.en.locale = "en";
					data.parentId = "root";
					data.lastUpdateUser = crudUser;
					data.createUser = crudUser;
					data.createTime = parseInt((Date.now()/1000).toFixed(0));
					data.lastUpdateTime = data.createTime;
					collection.insertOne(data, {forceServerObjectId:true})
						.then((r) => {
							cb();
						})
						.catch((e) => {
							console.log('taxonomy agentPaymentType insert error: '+e+'; '+JSON.stringify(data));
						});

				};

			});

			var wait4TxnmAgentPaymentTypeComplete = (db) => {
				agentPaymentTypeCount--;
				if(0 === agentPaymentTypeCount){
					checkTaxonomyAgentPaymentTypeComplete = true;
					db.close();
					genTourProductRecords();
				}
			};

    	}

    	function setProductTaxonomy(supplierId,supplierAlias,productType,agentPaymentType,productCode){
    		//tour product's region_city_id & country code should be selected manually
			var taxonomy = {};

			//navigation
			taxonomy.navigation = taxonomyNavigation;

			//Product Type
			var source = productType;
			var target = '';
			if(source)	target = mapping.getTargetTourType(source);
			if(target){
				taxonomy[taxonomyVocabularyId.productType] = taxonomyProductType[target];
			}

			//Supplier ID
			taxonomy[taxonomyVocabularyId.supplierId] = taxonomySupplierId[supplierId];

			//Supplier Alias
			taxonomy[taxonomyVocabularyId.supplierAlias] = taxonomySupplierAlias[supplierAlias];
			
			//Agent Payment Type
			taxonomy[taxonomyVocabularyId.agentPaymentType] = taxonomyAgentPaymentType[agentPaymentType];

			//Product Code
			taxonomy[taxonomyVocabularyId.productCode] = taxonomyProductCode[productCode];

			return taxonomy;
    	}

	}



	// starting point
	handleSupplierRecords();
	handleProductRecords();

}

//Part 1-2 - gettting MDB's current record sets

let getExistingDataFromMDB = () => {

	console.log('		--- getExistingDataFromMDB starts to get existing data from DB!');
	//function-wide variables
	
	
	//function definition
	
	var getExistingSuppliers = (collection,callback) => {
		var queryParam = { "typeId" : contentTypeId.supplier };
		var projectParam = {
			"_id":0,
			"online":1,
			"version":1,
			// "workspace": 1,
			"workspace.status":1,
			"workspace.taxonomy":1,
			"workspace.fields.id":1,
			"createTime":1,
			"lastUpdateTime":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				//debugDev(' d existing suppliers = ' + JSON.stringify(d));
				var s =[];
				d.forEach( (item, index) => {
					var i = {};
					i.id = item.workspace.fields.id;
					i.online = item.online;
					i.version = item.version;
					i.status = item.workspace.status;
					i.taxonomy = item.workspace.taxonomy;
					i.createTime = item.createTime;
					i.lastUpdateTime = item.lastUpdateTime;
					s.push(i);
				});
				//debugDev(' s existing suppliers = ' + JSON.stringify(s));
				callback(s);
			})
			.catch( (e) => {
				console.log('error = ' + e);
			});
	};

	// RTours
	var getExistingProducts = (collection, callback) => {
		var queryParam = { "typeId" : contentTypeId.product };
		var projectParam = {
			"_id":0,
			"text":1,
			"online":1,
			"version":1,
			"workspace.fields.productCode":1,
			"workspace.status":1,
			"workspace.taxonomy":1,
			"workspace.fields.id":1,
			"workspace.fields.calendarWidgetUrl":1,
			"workspace.fields.productPageUrl":1,
			"workspace.fields.badgeImage":1,
			"workspace.fields.source":1,
			"workspace.fields.badgeTargetUrl":1,
			"createTime":1,
			"lastUpdateTime":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				var p = [];
				d.forEach( (item,index) => {
					if(item.workspace.fields.source !== 'Marketplace'){
						return
					}

					var i = {};
					i.text = item.text;
					i.id = item.workspace.fields.id;
					i.productCode = item.workspace.fields.productCode;
					i.calendarWidgetUrl = item.workspace.fields.calendarWidgetUrl;
					i.productPageUrl = item.workspace.fields.productPageUrl;
					i.badgeImage = item.workspace.fields.badgeImage;
					i.source = item.workspace.fields.source;
					i.badgeTargetUrl = item.workspace.fields.badgeTargetUrl;
					i.online = item.online;
					i.version = item.version;
					i.status = item.workspace.status;
					i.taxonomy = item.workspace.taxonomy;
					i.createTime = item.createTime;
					i.lastUpdateTime = item.lastUpdateTime;
					p.push(i);
				});
				callback(p);
			})
			.catch( (e) => {
				console.log('error = ' + e);
			});
	};

	// Tours
	var getExistingToursProducts = (collection, callback) => {
		var queryParam = { "typeId" : contentTypeId.tours };
		var projectParam = {
			"_id":0,
			"text":1,
			"online":1,
			"version":1,
			"workspace.fields.productCode":1,
			"workspace.fields.calendarWidgetUrl":1,
			"workspace.fields.productPageUrl":1,
			"workspace.fields.marketplace":1,
			"workspace.fields.photoPath":1,
			"workspace.fields.promotionCode":1,
			"workspace.fields.discount":1,
			"workspace.fields.travelBefore":1,
			"workspace.fields.badgeImage":1,
			"workspace.fields.badgeTargetUrl":1,
			"workspace.status":1,
			"workspace.taxonomy":1,
			"createTime":1,
			"lastUpdateTime":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				var p = [];
				d.forEach( (item,index) => {
					//added testing TourCMS tour
					if(item.workspace.fields.marketplace === 'Rezdy' || (item.workspace.fields.marketplace === 'TourCMS' && item.workspace.fields.photoPath.split('.')[1] === 'rezdy')){
						var i = {};
						i.text = item.text;
						i.productCode = item.workspace.fields.productCode;
						i.online = item.online;
						i.version = item.version;
						i.status = item.workspace.status;
						i.taxonomy = item.workspace.taxonomy;
						i.createTime = item.createTime;
						i.lastUpdateTime = item.lastUpdateTime;
						i.calendarWidgetUrl = item.workspace.fields.calendarWidgetUrl;
						i.productPageUrl = item.workspace.fields.productPageUrl;
						i.marketplace = item.workspace.fields.marketplace;
						i.promotionCode = item.workspace.fields.promotionCode;
						i.discount = item.workspace.fields.discount;
						i.travelBefore = item.workspace.fields.travelBefore;
						i.badgeImage = item.workspace.fields.badgeImage;
						i.badgeTargetUrl = item.workspace.fields.badgeTargetUrl;
						p.push(i);
					}
				});
				callback(p);
			})
			.catch( (e) => {
				console.log('error = ' + e);
			});
	};


	MongoClient.connect(mdbUrl, (err, db) => {
		var getSuppliersComplete = false;
		var getProductsComplete = false;
		var getToursProductsComplete = false;

		if(null === err)
			console.log("getExistingDataFromMDB Connected successfully to server");

		var collection = db.collection('Contents');

		getExistingSuppliers(collection, (s) => {
			existingSuppliers = s;
			//debugDev('existingSuppliers = ' + JSON.stringify(existingSuppliers));
			debugDev('Existing Suppliers - ' + existingSuppliers.length);
			getSuppliersComplete = true;
			closeDB();
		});

		getExistingProducts(collection, (p) => {
			existingProducts = p;
			//debugDev('existingProducts = ' + JSON.stringify(existingProducts));
			debugDev('Existing RTours - ' + existingProducts.length);
			getProductsComplete = true;
			closeDB();
		});

		getExistingToursProducts(collection, (t) => {
			existingToursProducts = t;
			//debugDev('existingToursProducts = ' + JSON.stringify(existingToursProducts));
			debugDev('Existing Tours - ' + existingToursProducts.length);
			getToursProductsComplete = true;
			closeDB();
		});

		var closeDB = () => {
			if(getSuppliersComplete && getProductsComplete && getToursProductsComplete){
				db.close();
				getExistingComplete = true;

				debugDev('getExistingDataFromMDB END!');
				stage2Save2MDB();
			}
		};

	});
};

//Part 2 - using data generated from Part 1 to deal with MDB stuff

let stage2Save2MDB = () => {
	console.log('Enter stage2Save2MDB process!');
	if(getExistingComplete && apiCallComplete){
		if(operateDB){
			console.log('*** Starting to operate DB! ***');
			saveSuppliers2MDB();
		} else {
			console.log('*** Completed! DB remains unchanged!!');
		}
	}
};

//Part 2-1 - deal with tour suppliers
let saveSuppliers2MDB = () => {

	console.log('saveSuppliers2MDB starts to persist tour suppliers to DB!');
	var queryParam = { "typeId" : contentTypeId.supplier };
	var updateCount = 0;
	var insertCount = 0;
	var putOfflineCount = 0;
	var sInsertRecords = [];
	var sUpdateRecords = [];
	var sPutOfflineRecords = [];
	var updateComplete = false;
	var insertComplete = false;
	var putOfflineComplete = true; //temporarily suspended

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("		--- saveSuppliers2MDB Connected successfully to server");

		var collection = db.collection('Contents');

		var wait4IUBothComplete = () => {
			if(updateComplete && insertComplete && putOfflineComplete){				
				db.close();
				debugDev('saveSuppliers2MDB End!');
				saveProducts2MDB();
			}
		};

		var updateSupplier = (rzdItem, rzdIndex, existingItem) => {
			var filter = {"typeId" : contentTypeId.supplier, "workspace.fields.alias" : rzdItem.workspace.fields.alias};
			var options = {};

			var wait4UpdateSupplierComplete = () => {
				updateCount--;
				debugDev('updateCount = ' + updateCount);
				if(0 === updateCount){
					updateComplete = true;
					wait4IUBothComplete();
				}
			};

			rzdItem.online = existingItem.online;
			rzdItem.version = existingItem.version;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;
			rzdItem.createTime = existingItem.createTime;
			rzdItem.lastUpdateTime = existingItem.lastUpdateTime;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateSupplierComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});
		};

		var insertSupplier = (rzdItem, rzdIndex) => {
			var options = {forceServerObjectId:true};

		    var wait4InsertSuppliersComplete = () =>{
		    	insertCount--;
				debugDev('wait4InsertSuppliersComplete insertCount = ' + insertCount);
		    	if(0 === insertCount){
		    		insertComplete = true;
		    		wait4IUBothComplete();
		    	}
		    };

	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertSuppliersComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});
		};

		//put Supplier documents offline for deleted tours in 'ALL' category in Rezdy
		/*
		var putOfflineSupplier = (existingItem, existingIndex) => {
			var filter = {"typeId" : contentTypeId.supplier, "workspace.fields.id" : existingItem.id};
			var options = {};
			var updates = {$set:{online:false}};

			collection.updateOne(filter, updates, options)
				.then( (r) => {
					debugDev('putOfflineSupplier r = ' + JSON.stringify(r));
					debugDev('putOfflineSupplier count = ' + r.matchedCount);
					wait4PutOfflineSupplierComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4PutOfflineSupplierComplete = () => {
				putOfflineCount--;
				debugDev('putOfflineCount = ' + putOfflineCount);
				if(0 === putOfflineCount){
					putOfflineComplete = true;
					wait4IUBothComplete();
				}
			};
		};
		*/

		//seperate new and update documents
		arrayJsonSuppliers.forEach( (rzdItem,rzdIndex) => {
			var existing = false;
			if(0 !== existingSuppliers.length)
				existingSuppliers.forEach( (existingItem,existingIndex) => {
					if(rzdItem.workspace.fields.id === existingItem.id ){
						existing = true;
						sUpdateRecords.push(rzdItem);
					}
				});
			if(!existing)
				sInsertRecords.push(rzdItem);
		});

		//find out deleted records for putting them offline
		existingSuppliers.forEach( (existingItem, existingIndex) => {
			var putOnline = false;
			arrayJsonSuppliers.forEach( (rzdItem,rzdIndex) => {
				if(rzdItem.workspace.fields.id === existingItem.id){
					putOnline = true;
				}				
			});
			if(!putOnline){
				sPutOfflineRecords.push(existingItem);
			}			
		});

		fs.writeFileSync('./logs/suppliersToBePutOffline-'+targetEnv+'.json', JSON.stringify(sPutOfflineRecords));

		//update documents to db
		let updateCount = sUpdateRecords.length;
		if(0 !== updateCount){
			sUpdateRecords.forEach( (suItem,suIndex) => {
				existingSuppliers.forEach( (existingItem,existingIndex) => {
					if(suItem.workspace.fields.id === existingItem.id ){
						updateSupplier(suItem, suIndex, existingItem);
					}
				});
			});
		} else {
			updateComplete = true;
			wait4IUBothComplete();
		}

		//insert documents to db
		let insertCount = sInsertRecords.length;
		debugDev('init insertCount = ' + insertCount);
		if(0 !== insertCount){
			sInsertRecords.forEach( (siItem,siIndex) => {
				insertSupplier(siItem, siIndex);
			});
		} else {
			insertComplete = true;
			wait4IUBothComplete();
		}

		//put deleted Suppliers offline
		/*
		let putOfflineCount = sPutOfflineRecords.length;
		debugDev('init Supplier putOfflineCount = ' + putOfflineCount);
		if(0 !== putOfflineCount){
			sPutOfflineRecords.forEach( (sdItem,sdIndex) => {
				putOfflineSupplier(sdItem, sdIndex);
			});
		} else {
			putOfflineComplete = true;
			wait4IUBothComplete();
		}
		*/
	});
};

//Part 2-2 - deal with content type RTours
let saveProducts2MDB = () => {

	console.log('Enter saveProducts2MDB() to persist RTours to DB!');
	let updateCount = 0;
	let insertCount = 0;
	let putOfflineCount = 0;
	let pInsertRecords = [];
	let pUpdateRecords = [];
	let pPutOfflineRecords = []; //not existed item
	let updateComplete = false;
	let insertComplete = false;
	let putOfflineComplete = false;
	let payAttentionRToursLog = '*** Pay More Attentions on Following RTours ***' + '\n';

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("		--- saveProducts2MDB Connected successfully to server");

		let collection = db.collection('Contents');

		//update RTours documents to db
		let updateProduct = (rzdItem, rzdIndex, existingItem) => {
			let filter = {"typeId" : contentTypeId.product, "workspace.fields.productCode" : rzdItem.workspace.fields.productCode};
			let options = {};

			rzdItem.online = existingItem.online;
			// rzdItem.online = true;
			rzdItem.version = existingItem.version;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;
			//rzdItem.workspace.status = "published";
			//rzdItem.live.status = 'published';
			rzdItem.createTime = existingItem.createTime;
			rzdItem.lastUpdateTime = existingItem.lastUpdateTime;

			rzdItem.workspace.fields.calendarWidgetUrl = existingItem.calendarWidgetUrl;
			rzdItem.live.fields.calendarWidgetUrl = existingItem.calendarWidgetUrl;
			rzdItem.workspace.fields.productPageUrl = existingItem.productPageUrl;
			rzdItem.live.fields.productPageUrl = existingItem.productPageUrl;
			rzdItem.workspace.fields.badgeImage = existingItem.badgeImage;
			rzdItem.live.fields.badgeImage = existingItem.badgeImage;
			rzdItem.workspace.fields.badgeTargetUrl = existingItem.badgeTargetUrl;
			rzdItem.live.fields.badgeTargetUrl = existingItem.badgeTargetUrl;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			let wait4UpdateProductComplete = () => {
				updateCount--;
				debugDev('updateCount = ' + updateCount);
				if(0 === updateCount){
					updateComplete = true;
					wait4IUDComplete();
				}
			};
		};

		//insert RTours documents to db
		let insertProduct = (rzdItem, rzdIndex) => {
			if(rzdItem.workspace.fields.productCode === 'P785EE'){
				console.log('### Debug break poit 6 ###');
			}
			let options = {forceServerObjectId:true};
		    
	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertProductComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});

		    let wait4InsertProductComplete = () =>{
		    	insertCount--;
				debugDev('wait4InsertProductComplete insertCount = ' + insertCount);
		    	if(0 === insertCount){
		    		insertComplete = true;
		    		wait4IUDComplete();
		    	}
		    };
		};

		//put RTours documents offline for deleted tours in 'ALL' category in Rezdy
		let putOfflineProduct = (existingItem, existingIndex) => {
			let filter = {"typeId" : contentTypeId.product, "workspace.fields.productCode" : existingItem.productCode};
			let options = {};
			let updates = {$set:{online:false}};

			collection.updateOne(filter, updates, options)
				.then( (r) => {
					debugDev('putOfflineProduct r = ' + JSON.stringify(r));
					debugDev('putOfflineProduct count = ' + r.matchedCount);
					wait4PutOfflineProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			let wait4PutOfflineProductComplete = () => {
				putOfflineCount--;
				debugDev('putOfflineCount = ' + putOfflineCount);
				if(0 === putOfflineCount){
					putOfflineComplete = true;
					wait4IUDComplete();
				}
			};
		};

		let wait4IUDComplete = () => {
			if(updateComplete && insertComplete && putOfflineComplete){				
				db.close();
				fs.writeFileSync('./logs/payAttentionsOnRTours-'+targetEnv+'.log', payAttentionRToursLog);
				debugDev('End saveProducts2MDB() !');
				saveToursProducts2MDB();
			}
		};

		//seperate insert & update
		arrayJsonProducts.forEach( (rzdItem,rzdIndex) => {
			let existing = false;
			existingProducts.forEach( (existingItem,existingIndex) => {
				if(rzdItem.workspace.fields.productCode === existingItem.productCode ){
					existing = true;
					pUpdateRecords.push(rzdItem);
				}
			});
			if(!existing)
				pInsertRecords.push(rzdItem);
		});

		//find out deleted records for putting them offline
		existingProducts.forEach( (existingItem, existingIndex) => {
			if(existingItem.source !== 'Marketplace'){
				return
			}
			let putOnline = false;
			arrayJsonProducts.forEach( (rzdItem,rzdIndex) => {
				if(existingItem.productCode === rzdItem.workspace.fields.productCode){
					putOnline = true;
				}				
			});
			if(!putOnline){
				if(existingItem.productPageUrl){
					let ppu = existingItem.productPageUrl.split('.');
					if(ppu[1] === 'rezdy'){ //add this if statement because if this Rezdy tour is selling on TourCMS, then we don't need to put it off-line
						if(ppu[0] !== 'https://bookur'){ //added this because of full payment to supplier tour. Record it down.
							payAttentionRToursLog += 'Not to Put Off-line because productPageUrl does not equal to "bookur.rezdy.com", RTour - ' + existingItem.text + ' - Product Code = ' + existingItem.productCode + '\n';
						} else {
							pPutOfflineRecords.push(existingItem);						
						}
					} else {
						payAttentionRToursLog += 'This RTour is not going to be put off-line because its booking engine has been changed, RTour - ' + existingItem.text + ' - Product Code = ' + existingItem.productCode + '\n';
					}
				} else {
						pPutOfflineRecords.push(existingItem);						
				}
			}			
		});

		//update RTours documents to db
		let updateCount = pUpdateRecords.length;
		debugDev('init updateCount = ' + updateCount);
		if(0 !== updateCount){
			pUpdateRecords.forEach( (puItem, puIndex) => {
				existingProducts.forEach( (existingItem,existingIndex) => {
					if(puItem.workspace.fields.productCode === existingItem.productCode ){
						updateProduct(puItem, puIndex, existingItem);
					}
				});
			});
		} else {
			updateComplete = true;
			wait4IUDComplete();
		}

		//insert RTours documents to db
		let insertCount = pInsertRecords.length;
		debugDev('init insertCount = ' + insertCount);
		if(0 !== insertCount){
			pInsertRecords.forEach( (piItem,piIndex) => {
				if(piItem.workspace.fields.productCode === 'P785EE'){
					console.log('### Debug break poit 5 ###');
				}
				insertProduct(piItem, piIndex);
			});
		} else {
			insertComplete = true;
			wait4IUDComplete();
		}

		//put deleted tours offline
		let putOfflineCount = pPutOfflineRecords.length;
		fs.writeFileSync('./logs/rToursToBePutOffline-'+targetEnv+'.json', JSON.stringify(pPutOfflineRecords));
		debugDev('init putOfflineCount = ' + putOfflineCount);
		if(0 !== putOfflineCount){
			pPutOfflineRecords.forEach( (pdItem,pdIndex) => {
				putOfflineProduct(pdItem, pdIndex);
			});
		} else {
			putOfflineComplete = true;
			wait4IUDComplete();
		}

	});
};

//deal with content type Tours documents
let saveToursProducts2MDB = () => {

	console.log('Enter saveToursProducts2MDB to persiste Tours to DB!');
	let updateCount = 0;
	let insertCount = 0;
	let putOfflineCount = 0;
	let pInsertRecords = [];
	let pUpdateRecords = [];
	let pPutOfflineRecords = [];
	let updateComplete = false;
	let insertComplete = false;
	let putOfflineComplete = false;
	let payAttentionToursLog = '*** Pay More Attentions on Following Tours ***' + '\n';

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("		--- saveProducts2MDB Connected successfully to server");

		let collection = db.collection('Contents');

		let wait4IUDComplete = () => {
			if(updateComplete && insertComplete && putOfflineComplete){				
				db.close();
				fs.writeFileSync('./logs/payAttentionOnTours-'+targetEnv+'.log', payAttentionToursLog);
				putToursOfflineBasedOnCat(pPutOfflineRecords)
				// console.log('*** Suppliers and Products upsert completed including taxonomies ***');

				// let getGeoInfoFromGMap = require('./getGeoInfoFromGMap.js');
				// getGeoInfoFromGMap.run(targetEnv, dbOPSwitch);
			}
		};

		let wait4UpdateProductComplete = () => {
			updateCount--;
			debugDev('updateCount = ' + updateCount);
			if(0 === updateCount){
				updateComplete = true;
				wait4IUDComplete();
			}
		};

	    let wait4InsertProductComplete = () =>{
	    	insertCount--;
			debugDev('wait4InsertProductComplete insertCount = ' + insertCount);
	    	if(0 === insertCount){
	    		insertComplete = true;
	    		wait4IUDComplete();
	    	}
	    };

		let wait4PutOfflineProductComplete = () => {
			putOfflineCount--;
			debugDev('Tours putOfflineCount = ' + putOfflineCount);
			if(0 === putOfflineCount){
				putOfflineComplete = true;
				wait4IUDComplete();
			}
		};
			
		let updateProduct = (rzdItem, rzdIndex, existingItem) => {
			let filter = {"typeId" : contentTypeId.tours, "workspace.fields.productCode" : rzdItem.workspace.fields.productCode};
			let options = {};

			rzdItem.online = existingItem.online;
			// rzdItem.online = true;
			rzdItem.version = existingItem.version;
			rzdItem.createTime = existingItem.createTime;
			rzdItem.lastUpdateTime = existingItem.lastUpdateTime;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;
			rzdItem.workspace.fields.marketplace = existingItem.marketplace;
			rzdItem.live.fields.marketplace = existingItem.marketplace;
			rzdItem.workspace.fields.promotionCode = existingItem.promotionCode;
			rzdItem.live.fields.promotionCode = existingItem.promotionCode;
			rzdItem.workspace.fields.discount = existingItem.discount;
			rzdItem.live.fields.discount = existingItem.discount;
			rzdItem.workspace.fields.travelBefore = existingItem.travelBefore;
			rzdItem.live.fields.travelBefore = existingItem.travelBefore;
			rzdItem.workspace.fields.calendarWidgetUrl = existingItem.calendarWidgetUrl;
			rzdItem.live.fields.calendarWidgetUrl = existingItem.calendarWidgetUrl;
			rzdItem.workspace.fields.productPageUrl = existingItem.productPageUrl;
			rzdItem.live.fields.productPageUrl = existingItem.productPageUrl;
			rzdItem.workspace.fields.badgeImage = existingItem.badgeImage;
			rzdItem.live.fields.badgeImage = existingItem.badgeImage;
			rzdItem.workspace.fields.badgeTargetUrl = existingItem.badgeTargetUrl;
			rzdItem.live.fields.badgeTargetUrl = existingItem.badgeTargetUrl;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});
		};

		let insertProduct = (rzdItem, rzdIndex) => {
			if(rzdItem.workspace.fields.productCode === 'P785EE'){
				console.log('### Debug break poit 7 ###');
			}
			let options = {forceServerObjectId:true};
		    
	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertProductComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});
		};

		let putOfflineProduct = (existingItem, existingIndex) => {
			let filter = {"typeId" : contentTypeId.tours, "workspace.fields.productCode" : existingItem.productCode};
			let options = {};
			let updates = {$set:{online:false}};

			collection.updateOne(filter, updates, options)
				.then( (r) => {
					// debugDev('Tours putOfflineProduct r = ' + JSON.stringify(r));
					// debugDev('Tours putOfflineProduct count = ' + r.matchedCount);
					wait4PutOfflineProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});
		};

		//seperate insert & update
		arrayJsonToursProducts.forEach( (rzdItem,rzdIndex) => {
			let existing = false;
			existingToursProducts.forEach( (existingItem,existingIndex) => {
				if(rzdItem.workspace.fields.productCode === existingItem.productCode ){
					existing = true;
					pUpdateRecords.push(rzdItem);
				}
			});
			if(!existing)
				pInsertRecords.push(rzdItem);
		});

		//find out put-offline records
		existingToursProducts.forEach( (existingItem, existingIndex) => {
			if(existingItem.marketplace !== 'Rezdy' && existingItem.marketplace !== 'TourCMS'){
				return
			}

			let putOnline = false;
			arrayJsonToursProducts.forEach( (rzdItem,rzdIndex) => {
				if(existingItem.productCode === rzdItem.workspace.fields.productCode){
					putOnline = true;
				}				
			});
			if(!putOnline){
				if(existingItem.marketplace === 'Rezdy'){
					if(existingItem.productPageUrl){
						if(existingItem.productPageUrl.split('.')[0] !== 'https://bookur'){ //added because full payment to supplier tour has been dropped. they need to be recorded down.
							payAttentionToursLog += 'Not to Put Off-line because productPageUrl does not equal to "bookur.rezdy.com", Tour - ' + existingItem.text + ' - Marketplace = ' + existingItem.marketplace + ' - Product Code = ' + existingItem.productCode + '\n';
						} else {
							pPutOfflineRecords.push(existingItem);
						}
					} else {
						pPutOfflineRecords.push(existingItem);
					}
				} else /*if(existingItem.marketplace === 'TourCMS')*/{ //added for Rezdy tours selling on TourCMS. Don't put them off-line. They need to be handled manually.
					payAttentionToursLog += 'This tour is not going to be put off-line because its booking engine has been changed, Tour - ' + existingItem.text + ' - Marketplace = ' + existingItem.marketplace + ' - Product Code = ' + existingItem.productCode + '\n';
				}
			}			
		});

		updateCount = pUpdateRecords.length;
		debugDev('init updateCount = ' + updateCount);
		if(0 !== updateCount){
			pUpdateRecords.forEach( (puItem, puIndex) => {
				existingToursProducts.forEach( (existingItem,existingIndex) => {
					if(puItem.workspace.fields.productCode === existingItem.productCode ){
						updateProduct(puItem, puIndex, existingItem);
					}
				});
			});
		} else {
			updateComplete = true;
			wait4IUDComplete();
		}

		insertCount = pInsertRecords.length;
		debugDev('init insertCount = ' + insertCount);
		if(0 !== insertCount){
			pInsertRecords.forEach( (piItem,piIndex) => {
				insertProduct(piItem, piIndex);
			});
		} else {
			insertComplete = true;
			wait4IUDComplete();
		}

		putOfflineCount = pPutOfflineRecords.length;
		fs.writeFileSync('./logs/toursToBePutOffline-'+targetEnv+'.json', JSON.stringify(pPutOfflineRecords));
		debugDev('init Tours putOfflineCount = ' + putOfflineCount);
		if(0 !== putOfflineCount){
			pPutOfflineRecords.forEach( (pdItem,pdIndex) => {
				putOfflineProduct(pdItem, pdIndex);
			});
		} else {
			putOfflineComplete = true;
			wait4IUDComplete();
		}

	});
};

//Part 3 - to deal with those which has been put into the Category "Off-line temporarily"

let putToursOfflineBasedOnCat = (alreadyPutOff) => {
	let total = 0;
	let toursInPutOfflineCatPAST = []
	let toursInPutOfflineCatCURR = []
	let putOffLog = '*** Put Off-line Tours ***\n'
	let putOnLog = '*** Put On-line Tours ***\n'

	if(fs.existsSync('./mapping/toursInPutOfflineCatPAST-'+ targetEnv +'.json')){
		toursInPutOfflineCatPAST = require('./mapping/toursInPutOfflineCatPAST-'+ targetEnv +'.json')
	}

	let step1 = () => {
		let xmlProductGetByCategoryUrl = 'https://bookur.rezdy.com/catalog/' + catOfflineTemp.id + '/' + catOfflineTemp.name.toLowerCase() + '?format=xml';
		//debugDev('xmlProductGetByCategoryUrl = ' + xmlProductGetByCategoryUrl);

		https.get(xmlProductGetByCategoryUrl, (res) => {
		  const statusCode = res.statusCode;
		  const contentType = res.headers['content-type'];

		  let error;
		  if (statusCode !== 200) {
		    error = new Error(`XML Request Failed.\n` +
		                      `Status Code: ${statusCode}`);
		  } else if (!/^text\/xml/.test(contentType)) {
		    error = new Error(`Invalid content-type.\n` +
		                      `Expected text/xml but received ${contentType}`);
		  }
		  if (error) {
		    console.log(error.message);
		    // consume response data to free up memory
		    res.resume();
		    return;
		  }

		  res.setEncoding('utf8');
		  let rawData = '';
		  //let tmpJsonProductsFromXml;

		  res.on('data', (chunk) => rawData += chunk);
		  res.on('end', () => {
		    try {
				parseString(rawData, {explicitArray:false}, function (err, result) {
					console.log('Cat - %s : Count = %s', catOfflineTemp.name, result.products.product.length);
					total = result.products.product.length;
				});
				step2();
		    } catch (e) {
		      console.log(e.message);
		    }
		  });
		}).on('error', (e) => {
		  console.log(`Got error during getting XML RTours from my categories: ${e.message}`);
		});		
	}

	let step2 = () => {
		let count = Math.ceil(total/100);
		let wait4GetEnd = () => {
			count--
			if(!count){
				step3()
			}
		}

		let optionsProductsByCategory = {	
		    host : conf.host,
		    port : conf.port,
		    method : 'GET',
		    headers: conf.headers
		}

		let continueFlag = true
		let offset = 0
		let queryPath = conf.path + '/products/marketplace?apiKey=' + conf.apiKey + '&category=' + catOfflineTemp.id

		while(continueFlag){
			optionsProductsByCategory.path = queryPath + '&offset=' + offset;
			offset += 100;
			if(total-offset <= 0){
				continueFlag = false;
			}

			let getProductsByCategory = https.request(optionsProductsByCategory, function(res) {

				let tmpRawProducts = ''
				let tmpJsonProducts = {}

			    res.on('data', (d) => {
			        tmpRawProducts += d
			    });

			    res.on('end', () => {
			    	if(tmpRawProducts){
				    	tmpJsonProducts = JSON.parse(tmpRawProducts);
				    	debugDev('request status success = ' + tmpJsonProducts.requestStatus.success);

				    	if (tmpJsonProducts.requestStatus.success === true) {	    		
				    		debugDev('Products Count = ' + tmpJsonProducts.products.length);
				    		tmpJsonProducts.products.forEach( (item) => {
						    	toursInPutOfflineCatCURR.push({text:item.name, productCode:item.productCode});
				    		});
				    	}
			    	}
			    	wait4GetEnd()
			    });

			});

			getProductsByCategory.end();
			getProductsByCategory.on('error', (e) => {
			    console.error('putToursOfflineBasedOnCat Get Tours Error - '+e);
			});
		}
	}

	let step3 = () => {
		MongoClient.connect(mdbUrl, (err, db) => {
			if(null === err){
				console.log("Part 3: putToursOfflineBasedOnCat Connected successfully to server")
			}else{
				console.log('Connect to db error - ' + err)
				return
			}

			let collection = db.collection('Contents')
			let toursInPutOfflineCatPASTCount = toursInPutOfflineCatPAST.length
			let toursInPutOfflineCatCURRCount = toursInPutOfflineCatCURR.length

			let wait4AllPutEnd = () => {
				if(!toursInPutOfflineCatCURRCount && !toursInPutOfflineCatPASTCount){
					db.close()
					fs.writeFileSync('./logs/putToursOfflineBasedOnCat-Put Off'+targetEnv+'.log', putOffLog)
					fs.writeFileSync('./logs/putToursOfflineBasedOnCat-Put On'+targetEnv+'.log', putOnLog)
					fs.writeFileSync('./mapping/toursInPutOfflineCatPAST-'+ targetEnv +'.json', JSON.stringify(toursInPutOfflineCatCURR))
					console.log('*** Suppliers and Products upsert completed including taxonomies ***')

					runExternalScripts()
				}
			}

			let wait4PutOff = () => {
				toursInPutOfflineCatCURRCount--
				if(!toursInPutOfflineCatCURRCount){
					wait4AllPutEnd()
				}
			}

			let wait4PutOn = () => {
				toursInPutOfflineCatPASTCount--
				if(!toursInPutOfflineCatPASTCount){
					wait4AllPutEnd()
				}
			}

			toursInPutOfflineCatCURR.forEach( curr => {
				let putOff = true;
				toursInPutOfflineCatPAST.forEach( past => {
					if(curr.productCode === past.productCode)	putOff = false
				})

				if(putOff){
					let filter = {"typeId" : contentTypeId.tours, "workspace.fields.productCode" : curr.productCode};
					let options = {};
					let updates = {$set:{online:false}};

					collection.updateOne(filter, updates, options)
						.then( (r) => {
							putOffLog += 'Tours - ' + curr.text + ', Product Code - ' + curr.productCode + ', has been put off-line.\n'
							wait4PutOff()
							// debugDev('Tours putOfflineProduct r = ' + JSON.stringify(r));
							// debugDev('Tours putOfflineProduct count = ' + r.matchedCount);
						})
						.catch( (e) => {
							console.log("putToursOfflineBasedOnCat put off-line action Error = " + e);
						});
				}else{
					wait4PutOff()
				}
			})

			toursInPutOfflineCatPAST.forEach( past => {
				let putOn = true;
				toursInPutOfflineCatCURR.forEach( curr => {
					if(past.productCode === curr.productCode)	putOn = false
				})

				if(putOn){
					alreadyPutOff.forEach( aPutOff => {
						if(past.productCode === aPutOff.productCode) putOn = false
					})
				}

				if(putOn){
					let filter = {"typeId" : contentTypeId.tours, "workspace.fields.productCode" : past.productCode};
					let options = {};
					let updates = {$set:{online:true}};

					collection.updateOne(filter, updates, options)
						.then( (r) => {
							putOnLog += 'Tours - ' + past.text + ', Product Code - ' + past.productCode + ', has been put off-line.\n'
							wait4PutOn()
							// debugDev('Tours putOfflineProduct r = ' + JSON.stringify(r));
							// debugDev('Tours putOfflineProduct count = ' + r.matchedCount);
						})
						.catch( (e) => {
							console.log("putToursOfflineBasedOnCat put off-line action Error = " + e);
						});
				}else{
					wait4PutOn()
				}
			})
		})
	}

	step1()
}

//Part 4 - execute getGeoInfoFromGMap.js and updateTourTXByGeoInfo.js

let runExternalScripts = () => {
	console.log('runExternalScripts Starting.....')
	let args = []
	let options = {}

	options.execArgv = execArgv.slice()
	args.push(targetEnv)
	args.push(dbOPSwitch)

	buUtil.runScript('./getGeoInfoFromGMap.js', args, options, err => {
		if(err)	
			throw err
		else {
			console.log('******** All External Scripts have been executed! *******')
		}
	})
}

//Start

step1GetCategories();
getExistingDataFromMDB();
