/*jshint esversion: 6 */
// original way - products categorized by categories

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;


//base configuration

var conf = {
    host : 'api.rezdy.com',
    port : 443,
    path : '/latest',
    apiKey : '3c03bef5c6bf4288a7d1052e03883323',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
    }
};

var debugDev = debug('dev');
var arrayJsonCategories = [];
var arrayJsonProducts = [];
var arrayJsonSuppliers = [];


// get category
/**
 * [Step1GetCategories description]
 */
function step1GetCategories(){

	debugDev('step1GetCategories Starts!');

	var queryParam = 'limit=100';
	var optionsCategories = {
	    host : conf.host,
	    port : conf.port,
	    path : conf.path + '/categories' + '?apiKey=' + conf.apiKey + '&' + queryParam,
	    method : 'GET',
	    headers: conf.headers
	};

	debugDev(optionsCategories);

	var getCatgories = https.request(optionsCategories, function(res) {

		var rawCategories = '';

	    res.on('data', (d) => {
	        rawCategories += d;
	    });

	    res.on('end', () => {
	    	var tempJsonCategories = JSON.parse(rawCategories);
	    	debugDev('request status success = ' + tempJsonCategories.requestStatus.success);
	    	if (tempJsonCategories.requestStatus.success === true) {
	    		debugDev('Categories Count = ' + tempJsonCategories.categories.length);
		    	delete tempJsonCategories.requestStatus;
		    	rawCategories = JSON.stringify(tempJsonCategories);
		    	fs.writeFileSync('./datafiles/categories.json', rawCategories);
		        arrayJsonCategories = tempJsonCategories.categories;
		        debugDev('step1GetCategories Ended!');
		        step2GetProducts();
	    	}
	    });

	});

	getCatgories.end();
	getCatgories.on('error', (e) => {
	    console.error(e);
	});
}

// get Products by category 

function step2GetProducts(){

	debugDev('Step2GetProducts starts!');

	var optionsProductsByCategory = {	
	    host : conf.host,
	    port : conf.port,
	    method : 'GET',
	    headers: conf.headers
	};

	var jsonProducts = { "products":[] };
	var jsonProductsFromXml = { "products":[] };
	var queryParam = '';
	var tmpArrayCategories = [];
	arrayJsonCategories.forEach( (item, index) => {
		var cat = {};
		cat.catId = item.id;
		cat.catName = item.name;
		cat.queryParam = '/categories/' + item.id + '/products';
		tmpArrayCategories.push(cat);
	});
	debugDev('tmpArrayCategories = ' + JSON.stringify(tmpArrayCategories));

	var tmpArrayCategoriesCount = tmpArrayCategories.length;
	var tmpArrayCategoriesCount4Xml = tmpArrayCategories.length;

	tmpArrayCategories.forEach( (item, index) => {

		var catId = item.catId;
		optionsProductsByCategory.path = conf.path + item.queryParam + '?apiKey=' + conf.apiKey;
		debugDev('optionsProductsByCategory.path = ' + optionsProductsByCategory.path);

		var getProductsByCategory = https.request(optionsProductsByCategory, function(res) {

			var tmpRawProducts = '';
			var tmpJsonProducts;

		    res.on('data', (d) => {
		        tmpRawProducts += d;
		    });

		    res.on('end', () => {
		    	//debugDev('tmpRawProducts = ' + tmpRawProducts);
		    	tmpJsonProducts = JSON.parse(tmpRawProducts);
		    	debugDev('request status success = ' + tmpJsonProducts.requestStatus.success);

		    	if (tmpJsonProducts.requestStatus.success === true) {	    		
		    		debugDev('Products Count = ' + tmpJsonProducts.products.length);

			    	delete tmpJsonProducts.requestStatus;
			    	tmpJsonProducts.products.forEach( (item,index) => {
			    		item.categoryId = [];
			    		item.categoryId.push(catId);// add an additional attribute value - categoryId
			    		jsonProducts.products.push(item);
			    	});
		    	}
		    	wait4ApiCallComplete();
		    });

		});

		getProductsByCategory.end();
		getProductsByCategory.on('error', (e) => {
		    console.error(e);
		});

		let xmlProductGetByCategoryUrl = 'https://bookur.rezdy.com/catalog/' + item.catId + '/' + convertStr4CatUrl(item.catName) + '?format=xml';
		debugDev('xmlProductGetByCategoryUrl = ' + xmlProductGetByCategoryUrl);

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
				//fs.writeFileSync('./cat-product.xml', rawData);
				parseString(rawData, {explicitArray:false}, function (err, result) {
				    //console.log(util.inspect(result, false, null));
				    //fs.writeFileSync('./cat-product.json', JSON.stringify(result));
				    //result.products.product is an array
				    if(Array.isArray(result.products.product)){			    	
				    	result.products.product.forEach( (item,index) => {
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
		  });
		}).on('error', (e) => {
		  console.log(`Got error: ${e.message}`);
		});


	});

	function convertStr4CatUrl(catName){
		return catName.toLowerCase().replace(/\s/g,'-');
	}

	function wait4XmlProductsGetComplete(){
		debugDev('Enter Step2 wait4XmlProductsGetComplete');
		tmpArrayCategoriesCount4Xml--;
		debugDev('incompleted category/products xml count = ' + tmpArrayCategoriesCount4Xml);
		if (tmpArrayCategoriesCount4Xml === 0) {
			wait4BothComplete();
		}
	}

	function wait4ApiCallComplete(){
		debugDev('Enter Step2 wait4ApiCallComplete');
		tmpArrayCategoriesCount--;
		debugDev('incompleted category/products count = ' + tmpArrayCategoriesCount);
		if (tmpArrayCategoriesCount === 0) {
			wait4BothComplete();
		}
	}

	function wait4BothComplete(){
		if(tmpArrayCategoriesCount4Xml === 0 && tmpArrayCategoriesCount === 0){
			handleProductsResult();
		}
	}

	function handleProductsResult(){
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
    	fs.writeFileSync('./datafiles/products.json', rawProducts);
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
        		supplierInfo.supplierId = item1.supplierId.toString();
        		supplierInfo.supplierAlias = item1.supplierAlias;
	        	supplierAliasFromProducts.push(supplierInfo);
        	}
        });
        debugDev('step2GetProducts Ended!');
        Step3GetSuppliersByProducts(supplierAliasFromProducts);

	}

	/*
	for (var i = 0; i < arrayJsonCategories.length; i++) {
		queryParam += 'category=' + arrayJsonCategories[i].id;
		if(i < arrayJsonCategories.length-1){
			queryParam += '&';
		}
	}
	optionsProductsByCategory.path = conf.path + '/products/marketplace' + '?apiKey=' + conf.apiKey + '&' + queryParam;

	var getProductsByCategory = https.request(optionsProductsByCategory, function(res) {

		var rawProducts = '';
		var tempJsonProducts;

	    res.on('data', (d) => {
	        rawProducts += d;
	    });

	    res.on('end', () => {
	    	tempJsonProducts = JSON.parse(rawProducts);
	    	debugDev('request status success = ' + tempJsonProducts.requestStatus.success);
	    	if (tempJsonProducts.requestStatus.success === true) {	    		
	    		debugDev('Products Count = ' + tempJsonProducts.products.length);
		    	delete tempJsonProducts.requestStatus;
		    	rawProducts = JSON.stringify(tempJsonProducts);
		    	fs.writeFileSync('./datafiles/products.json', rawProducts);
		        arrayJsonProducts = tempJsonProducts.products;

		        var supplierAliasFromProducts = [];
		        for (var i = 0; i < arrayJsonProducts.length; i++) {
		        	if (supplierAliasFromProducts.indexOf(arrayJsonProducts[i].supplierAlias) == -1) {
			        	supplierAliasFromProducts.push(arrayJsonProducts[i].supplierAlias);
		        	}
		        }
		        debugDev('step2GetProducts Ended!');
		        Step3GetSuppliersByProducts(supplierAliasFromProducts);
	    	}
	    });

	});

	getProductsByCategory.end();
	getProductsByCategory.on('error', (e) => {
	    console.error(e);
	});
	*/
}

// get supplier info by product
/**
 * [Step3GetSuppliersByProducts description]
 * @param {[type]} supplierAliasFromProducts [description]
 */
function Step3GetSuppliersByProducts(supplierAliasFromProducts){

	debugDev('Step3GetSuppliersByProducts starts!');
	debugDev('supplierAliasFromProducts = ' + supplierAliasFromProducts);

	var jsonSuppliers = { "companies":[] };
	var supplierCount = supplierAliasFromProducts.length;
	debugDev('Supplier Count = ' + supplierCount);

	var optionsSuppliersByProduct = {	
	    host : conf.host,
	    port : conf.port,
	    method : 'GET',
	    headers: conf.headers
	};

	supplierAliasFromProducts.forEach( (item,index) => {
		var supplierId = item.supplierId;
		var queryParam = '/' + item.supplierAlias;
		optionsSuppliersByProduct.path = conf.path + '/companies' + queryParam + '?apiKey=' + conf.apiKey;
		var getSupplierByProduct = https.request(optionsSuppliersByProduct, function(res) {

			var tempRawSuppliers = '';
			var tempJsonSuppliers = {};

		    res.on('data', (d) => {
		        tempRawSuppliers += d;
		    });

		    res.on('end', () => {
		    	tempJsonSuppliers = JSON.parse(tempRawSuppliers);
		    	debugDev('request status success = ' + tempJsonSuppliers.requestStatus.success);
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
		    console.error(e);
		});
	});

	function wait4ApiCallComplete(){
		debugDev('Enter wait4ApiCallComplete');
		supplierCount--;
		debugDev('incompleted supplier count = ' + supplierCount);
		if (supplierCount === 0) {
			handleSupplierResult();
		}
	}
	function handleSupplierResult(){		
		debugDev('Enter handleSupplierResult');
		debugDev('jsonSupplier count = ' + jsonSuppliers.companies.length);
    	fs.writeFileSync('./datafiles/suppliers.json', JSON.stringify(jsonSuppliers));
		arrayJsonSuppliers = jsonSuppliers.companies;
    	fs.writeFileSync('./arrayJsonSuppliers.json', JSON.stringify(arrayJsonSuppliers));
    	fs.writeFileSync('./arrayJsonProducts.json', JSON.stringify(arrayJsonProducts));
    	fs.writeFileSync('./arrayJsonCategories.json', JSON.stringify(arrayJsonCategories));
    	
    	step4GenerateMDBRecords();
	}
}

function step4GenerateMDBRecords(){
	//DB definition/value
	
	var rTypeId = {
		"category" : "585a29dea0af88396cc24f38",
		"supplier" : "585a3111a0af88917cc24f3a"
	};

	var crudUser = {
		"id": "55a4ab8b86c747a0758b4567",
		"login": "admin",
		"fullName": "Web Admin" 		
	};

	var taxonomyVocabularyId = {
		"countryCode" : "57b18d746d0e81e174c66322",
		"categoryId" : "585a28dfa0af88046dc24f36",
		"regionCityId" : "57b18d746d0e81e174c66328",
		"supplierId" : "585a1984a0af882f3dc24f3d",
		"supplierAlias" : "585a19e0a0af885009c24f42"
	};

	var taxonomyCountryCode = {
		"Sydney" : "57b18d776d0e81e174c66540",
		"Bali" : "57b18d976d0e81e174c67452",
		"Melbourne": "57b18d776d0e81e174c66540",
		"Thailand" : "57b18dd46d0e81e174c68814",
		"For Taiwan Market" : "57b18dd36d0e81e174c687a6",
		"New York City" : "57b18ddb6d0e81e174c68ad2",
		"Langkawi-Malaysia" : "57b18da76d0e81e174c6799e",
		"Sabah-Malaysia" : "57b18da76d0e81e174c6799e",
		"Tours" : "57b18dd36d0e81e174c687a6"		
	};

	var taxonomyCategoryID = {
		"Sydney" : "585a2931a0af88396cc24f36",
		"Bali" : "585a2928a0af88175dc24f3a",
		"Melbourne": "586217a5a0af88c23f3e655d",
		"Thailand" : "585a2939a0af88f95bc24f4c",
		"For Taiwan Market" : "585a2943a0af88465cc24f3c",
		"New York City" : "585a294fa0af88176ec24f38",
		"Langkawi-Malaysia" : "585a295aa0af88586ec24f37",
		"Sabah-Malaysia" : "585a296fa0af88596ec24f38",
		"Tours" : "585a291aa0af88066dc24f48"		
	};

	var taxonomyNavigation = [
		"57e227bb6d0e81ad168b4768",
		"580726bd6d0e810b3d7b23c6",
		"582bf94c6d0e81d65f7b293b" 
	];

	var taxonomyRegionCityId = {
		"Sydney" : "57b18d776d0e81e174c66564",
		"Bali" : "57b18d976d0e81e174c6745a",
		"Melbourne": "57b18d776d0e81e174c6655c",
		"Thailand" : "57b18dd46d0e81e174c68816",
		"For Taiwan Market" : "57b18dd36d0e81e174c687a8",
		"New York City" : "57b18ddc6d0e81e174c68b56",
		"Langkawi-Malaysia" : "57b18da76d0e81e174c679a4",
		"Sabah-Malaysia" : "57b18da76d0e81e174c679a6",
		"Tours" : "57b18dd36d0e81e174c687a8"		
	};

	var taxonomySupplierId = {
		"41958" : "585a19c8a0af88394dc24f37",
		"7005" : "586289f9a0af88dc2e3e6565",
		"24827" : "58628a01a0af8847153e6563",
		"25768" : "58628a0aa0af8864103e6565",
		"62622" : "58628a13a0af887a153e6563",
		"25404" : "58628a1da0af8886063e656b",
		"8371" : "58628a25a0af88927c3e656b",
		"24466" : "58628a2da0af8865103e6567",
		"33790" : "58628a36a0af887f063e656f",
		"27860" : "58628a3ea0af880d163e6569",
		"9912" : "58628a47a0af880e163e6565",
		"50353" : "58628a4fa0af88dc2e3e6567",
		"30638" : "58628a59a0af8847153e6565",
		"5528" : "58628a62a0af8864103e6567",
		"5757" : "58628a6aa0af887a153e6565",
		"54276" : "58628a72a0af8886063e656d",
		"50234" : "58628a7da0af88927c3e656d",
		"1706" : "58628a93a0af8865103e6569",
		"12709" : "58628a9ca0af887f063e6571",
		"18214" : "58628aa4a0af880d163e656b",
		"53581" : "58628aaea0af880e163e6567",
		"6208" : "58628ab8a0af88dc2e3e6569",
		"8902" : "58628ac1a0af8847153e6567",
		"42349" : "58628acaa0af8864103e6569",
		"5820" : "58628ad2a0af887a153e6567",
		"27332" : "58628adca0af8886063e656f",
		"34171" : "58628ae7a0af88927c3e656f",
		"34941" : "58628af0a0af8865103e656b",
		"43920" : "58628afaa0af887f063e6573",
		"43745" : "58628b04a0af880d163e656d",
		"5544" : "58628b0da0af880e163e6569",
		"8331" : "58628b17a0af88dc2e3e656b",
		"57846" : "58628b1fa0af8847153e6569"
	};


	var taxonomySupplierAlias = {
		"barefootdownunder" : "585a19ffa0af886847c24f36",
		"sydneyskydivers" : "5862851fa0af880d163e655f",
		"driftschoolaustralia" : "5862852ba0af880e163e655d",
		"melbourneboathire" : "58628534a0af88dc2e3e655d",
		"fleurage" : "5862853ea0af8847153e655d",
		"rememberforever" : "58628547a0af887a153e655d",
		"fjtours" : "58628552a0af8864103e655f",
		"moments2memories" : "5862855ba0af8886063e6565",
		"melbournesailingadventures" : "5862856ba0af88927c3e6565",
		"melbourneurbanadventures" : "58628577a0af8865103e6561",
		"thelittlepenguinbus" : "58628586a0af887f063e6567",
		"shetravels" : "5862858fa0af880d163e6561",
		"operaaustralia" : "58628597a0af880e163e655f",
		"harbourjet" : "586285a0a0af88dc2e3e655f",
		"melbournebybike" : "586285aba0af8847153e655f",
		"sydneydivesafari" : "586285b4a0af887a153e655f",
		"newyorkphotosafari" : "586285bba0af8864103e6561",
		"balidiving" : "586285c5a0af8886063e6567",
		"malaysiaholidays" : "586285cfa0af88927c3e6567",
		"electrictourcompany" : "586285dca0af8865103e6563",
		"baliexperiencecompany" : "586285e5a0af887f063e6569",
		"photographytravel" : "586285eea0af880d163e6563",
		"balifoodsafari" : "586285f7a0af880e163e6561",
		"swanningaround" : "58628600a0af88dc2e3e6561",
		"anttouring" : "58628608a0af8847153e6561",
		"gabbycabby" : "58628614a0af887a153e6561",
		"sydneyphotographicworkshops" : "5862861da0af8864103e6563",
		"secretwalks" : "58628626a0af8886063e6569",
		"theadventuremerchants" : "5862862fa0af88927c3e6569",
		"soulfulconcepts" : "58628637a0af8865103e6565",
		"heliexperiences" : "58628642a0af887f063e656b",
		"ozwhalewatching" : "5862864da0af880d163e6565",
		"luxcarsydney" : "58628657a0af880e163e6563"
	};

	// functions
	function handleCategoryRecords(){

		var allCategoryId = [];

		arrayJsonCategories.forEach( (item,index) => {
			item.text = item.name;
			item.typeId = rTypeId.category;
			item.version = 1;
			item.online = true;
			item.online = true;
			item.lastUpdateTime = Date.now();
			item.createTime = item.lastUpdateTime;
			item.isProduct = false;
			item.productProperties = "";

			item.workspace = {};
				item.workspace.fields = {};
				item.workspace.fields.id = item.id.toString();
				item.workspace.fields.visible = false;
			item.workspace.status = 'published';
			item.workspace.taxonomy = setCategoryTaxonomy(item.name);
			item.workspace.startPublicationDate = null;
			item.workspace.endPublicationDate = null;
			item.workspace.target = [];
			item.workspace.target.push('global');
			item.workspace.writeWorkspace = 'global';
			item.workspace.pageId = '';
			item.workspace.maskId = '';
			item.workspace.blockId = '';
			item.workspace.i18n = {};
				item.workspace.i18n.en = {};
				item.workspace.i18n.en.fields = {};
				item.workspace.i18n.en.fields.text = item.text;
				item.workspace.i18n.en.fields.urlSegment = '';
				item.workspace.i18n.en.fields.summary = item.text;
				item.workspace.i18n.en.locale = 'en';
			item.workspace.nativeLanguage = 'en';
			item.workspace.clickStreamEvent = '';

			item.live = item.workspace;

			item.lastUpdateUser = crudUser;
			item.createUser = crudUser;

			delete item.id;
			delete item.name;
			delete item.visible;
		});

    	fs.writeFileSync('./arrayJsonCategories4db.json', JSON.stringify(arrayJsonCategories));

    	checkTaxonomyCategoryId();

    	//function definition within handleSupplierRecords
    	//
    	function checkTaxonomyCategoryId(){
    		var categoryIdCheckList = [];
    		allCategoryId.forEach( (item,index) => {
    			if(undefined === taxonomyCategoryID[item]){
    				categoryIdCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./categoryIdCheckList.json', JSON.stringify(categoryIdCheckList));
    	}

		function setCategoryTaxonomy(city){
			var taxonomy = {};
			//country code
			taxonomy[taxonomyVocabularyId.countryCode] = [];
			taxonomy[taxonomyVocabularyId.countryCode].push(taxonomyCountryCode[city]);

			//Category ID
			taxonomy[taxonomyVocabularyId.categoryId] = [];
			taxonomy[taxonomyVocabularyId.categoryId].push(taxonomyCategoryID[city]);

			//navigation
			taxonomy.navigation = taxonomyNavigation;

			//region city id
			taxonomy[taxonomyVocabularyId.regionCityId] = [];
			taxonomy[taxonomyVocabularyId.regionCityId].push(taxonomyRegionCityId[city]);

			return taxonomy;
		}
	}

	function handleSupplierRecords(){

		var allSupplierId = [];
		var allSupplierAlias = [];

		arrayJsonSuppliers.forEach( (item,index) => {

			allSupplierId.push(item.id);
			allSupplierAlias.push(item.alias);

			item.text = item.companyName;
			item.typeId = rTypeId.supplier;
			item.version = 1;
			item.online = true;
			item.lastUpdateTime = Date.now();
			item.createTime = item.lastUpdateTime;
			item.isProduct = false;
			item.productProperties = "";
			item.workspace = {};
				item.workspace.fields = {};
					item.workspace.fields.alias = item.alias;
					item.workspace.fields.firstName = item.firstName;
					item.workspace.fields.lastName = item.lastName
					item.workspace.fields.address = item.address;
					item.workspace.fields.position = {};
						item.workspace.fields.position.address = item.address.addressLine + ' ' + item.address.city + ' ' + item.address.state + ' ' + item.address.countryCode.toUpperCase();
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

    	fs.writeFileSync('./arrayJsonSuppliers4db.json', JSON.stringify(arrayJsonSuppliers));

    	checkTaxonomySupplierId();
    	checkTaxonomySupplierAlias();

    	//function definition within handleSupplierRecords
    	//
    	function checkTaxonomySupplierId(){
    		var supplierIdCheckList = [];
    		allSupplierId.forEach( (item,index) => {
    			if(undefined === taxonomySupplierId[item]){
    				supplierIdCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./supplierIdCheckList.json', JSON.stringify(supplierIdCheckList));
    	}

    	function checkTaxonomySupplierAlias(){
    		var supplierAliasCheckList = [];
    		allSupplierAlias.forEach( (item,index) => {
    			if(undefined === taxonomySupplierAlias[item]){
    				supplierAliasCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./supplierAliasCheckList.json', JSON.stringify(supplierAliasCheckList));
    	}

		
		function setSupplierTaxonomy(supplierId,supplierAlias,city){
			var taxonomy = {};

			//navigation
			taxonomy.navigation = taxonomyNavigation;

			//Supplier ID
			taxonomy[taxonomyVocabularyId.supplierId] = taxonomySupplierId[supplierId];

			//Supplier Alias
			taxonomy[taxonomyVocabularyId.supplierAlias] = taxonomySupplierAlias[supplierAlias];
			
			//region city id
			taxonomy[taxonomyVocabularyId.regionCityId] = [];
			taxonomy[taxonomyVocabularyId.regionCityId].push(taxonomyRegionCityId[city]);

			//country code
			taxonomy[taxonomyVocabularyId.countryCode] = [];
			taxonomy[taxonomyVocabularyId.countryCode].push(taxonomyCountryCode[city]);

			return taxonomy;
		}
	}

	function handleProductRecords(){

		arrayJsonProducts.forEach( (item,index) => {

		});
	}

	// processes

	handleCategoryRecords();
	handleSupplierRecords();
	//handleProductRecords();

}

//Start

step1GetCategories();
