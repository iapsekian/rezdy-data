/*jshint esversion: 6 */


var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;

console.log('process.argv = ' + process.argv);
var operateDB = process.argv.slice(2)[0] === 'OPDB' ? true : false;
console.log('operateDB = ' + operateDB);

var apiCallComplete = false;
var getExistingComplete = false;

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
var arrayJsonCategories = {};
var arrayJsonProducts = [];
var arrayJsonToursProducts = [];
var arrayJsonSuppliers = [];
var existingSuppliers = [];
var existingProducts = [];
var existingToursProducts = [];


//DB definition/value

var mdbUrl = 'mongodb://tst.tourbooks.cc:27017/tourbooks1207';


var rTypeId = {
	//"category" : "585a29dea0af88396cc24f38",
	"supplier" : "585a3111a0af88917cc24f3a",
	"product" : "5859ee1fa0af88c339c24f4e",
	"tours" : "5763a39b6d0e81055c8b456f"
};

var crudUser = {
	"id": "55a4ab8b86c747a0758b4567",
	"login": "admin",
	"fullName": "Web Admin" 		
};

var taxonomyVocabularyId = {
	"countryCode" : "57b18d746d0e81e174c66322",
	//"categoryId" : "585a28dfa0af88046dc24f36",
	"regionCityId" : "57b18d746d0e81e174c66328",
	"supplierId" : "585a1984a0af882f3dc24f3d",
	"supplierAlias" : "585a19e0a0af885009c24f42",
	"productType" : "585a164ca0af88c91bc24f3a",
	"agentPaymentType" : "585a2041a0af88145dc24f36",
	"productCode" : "586df55fa0af88a741bcb6b5"
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
var taxonomyNavigation = [
	"57e227bb6d0e81ad168b4768",
	"580726bd6d0e810b3d7b23c6",
	"582bf94c6d0e81d65f7b293b" 
];

var taxonomyRegionCityId = {
	"Sydney" : "57b18d776d0e81e174c66564",
	"Bali" : "57b18d976d0e81e174c6745a",
	"Denpasar" : "57b18d976d0e81e174c6745a",
	"Melbourne": "57b18d776d0e81e174c6655c",
	"Thailand" : "57b18dd46d0e81e174c68816",
	"For Taiwan Market" : "57b18dd36d0e81e174c687a8",
	"New York City" : "57b18ddc6d0e81e174c68b56",
	"Langkawi-Malaysia" : "57b18da76d0e81e174c679a4",
	"Sabah-Malaysia" : "57b18da76d0e81e174c679a6",
	"Malaysia" : "57b18da76d0e81e174c679a0",
	"Kuala Lumpur" : "57b18da76d0e81e174c679a0",
	"San Francisco" : "57b18ddc6d0e81e174c68b74",
	"Arcadia" : "57b18ddc6d0e81e174c68b76",
	"Los Angeles" : "57b18ddc6d0e81e174c68b76",
	"Alice Springs" : "57b18d776d0e81e174c66556",
	"Tours" : "57b18dd36d0e81e174c687a8"		
};

var taxonomySupplierId = {
	"41958" : "585a19c8a0af88394dc24f37",
	"1974" : "586c5196b012049bc98f1a95",
	"27965" : "586c5196b012049bc98f1a9a",
	"37143" : "586c7744b012049bc98f1d9a",
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
	"5820" : "58628ad2a0af887a153e6567",
	"27332" : "58628adca0af8886063e656f",
	"34171" : "58628ae7a0af88927c3e656f",
	"34941" : "58628af0a0af8865103e656b",
	"43920" : "58628afaa0af887f063e6573",
	"43745" : "58628b04a0af880d163e656d",
	"5544" : "58628b0da0af880e163e6569",
	"8331" : "58628b17a0af88dc2e3e656b",
	"57846" : "58628b1fa0af8847153e6569",
	"5935" : "586378cfa0af887e433e655d",
	"27474" : "586691c2a0af887c4d3e6579"
};

var taxonomySupplierAlias = {
	"barefootdownunder" : "585a19ffa0af886847c24f36",
	"grandcanyondestinations" : "586c5196b012049bc98f1a96",
	"perthscuba" : "586c5196b012049bc98f1a97",
	"tassietours" : "586c5196b012049bc98f1a98",
	"fjtours" : "586c7744b012049bc98f1d9b",
	"sydneyskydivers" : "5862851fa0af880d163e655f",
	"driftschoolaustralia" : "5862852ba0af880e163e655d",
	"melbourneboathire" : "58628534a0af88dc2e3e655d",
	"fleurage" : "5862853ea0af8847153e655d",
	"rememberforever" : "58628547a0af887a153e655d",
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
	"luxcarsydney" : "58628657a0af880e163e6563",
	"pleasuredivers" : "586378b4a0af8868173e656d",
	"golocaltours" : "586691aca0af88b3303e6564"
};

var taxonomyProductType = {
	"DAYTOUR" : "585a1681a0af88ec47c24f36",
	"ACTIVITY" : "585a168ea0af88c51bc24f3b",
	"EVENT" : "585a169fa0af882f3dc24f39",
	"CUSTOM" : "586377baa0af8836343e6561",
	"MULTIDAYTOUR" : "586377fea0af8836343e6563",
	"PRIVATE_TOUR" : "58637831a0af8836343e6565"
};

var taxonomyAgentPaymentType = { 
	"PAYOUTS" : "585a2062a0af88fd5bc24f36" 
};

var taxonomyProductCode = {
	"P7K001" : "586df63ea0af88eb48bcb6b5",
	"PTDKRX" : "586df79ea0af88974abcb6b8",
	"PKFA8G" : "586dfc42a0af88e850bcb6b9",
	"PSUPSJ" : "586dfc4ea0af882e51bcb6c3",
	"P02W2E" : "586dfc57a0af88e850bcb6bb",
	"PBS9JP" : "586dfc68a0af889d56bcb6b5",
	"P2CBLX" : "586dfc70a0af889e56bcb6b5",
	"PLI83T" : "586dfc78a0af88414dbcb6c7",
	"P4BJ0R" : "586dfc80a0af88b751bcb6b6",
	"PUN7MK" : "586e00bea0af887e5bbcb6c4",
	"PF6VN7" : "586e00c8a0af88ad5fbcb6b7",
	"PT2F00" : "586e00d7a0af882e51bcb6e5",
	"PKGLKW" : "586e00e0a0af887e5bbcb6c6",
	"PLULQB" : "586e00eba0af883960bcb6b5",
	"P0UGHN" : "586e00f5a0af883a60bcb6b5",
	"PQ9LYE" : "586e0101a0af88265fbcb6b7",
	"PGX1QA" : "586e0109a0af883f60bcb6b5",
	"PHE1LG" : "586e0119a0af88025cbcb6b9",
	"P7L23T" : "586e0121a0af883960bcb6b7",
	"P0V4CN" : "586e0129a0af88265fbcb6b9",
	"P7956E" : "586e0133a0af883f60bcb6b7",
	"PWM9JN" : "586e0143a0af88ad5fbcb6b9",
	"PKF9LU" : "586e014ca0af88025cbcb6bb",
	"PEZ8UW" : "586e0154a0af883b60bcb6b5",
	"P0AQYO" : "586e015ea0af887e5bbcb6c8"
};

//var taxonomyCategoryID = {
//	"Sydney" : "585a2931a0af88396cc24f36",
//	"Bali" : "585a2928a0af88175dc24f3a",
//	"Melbourne": "586217a5a0af88c23f3e655d",
//	"Thailand" : "585a2939a0af88f95bc24f4c",
//	"For Taiwan Market" : "585a2943a0af88465cc24f3c",
//	"New York City" : "585a294fa0af88176ec24f38",
//	"Langkawi-Malaysia" : "585a295aa0af88586ec24f37",
//	"Sabah-Malaysia" : "585a296fa0af88596ec24f38",
//	"Tours" : "585a291aa0af88066dc24f48"		
//};



// get category
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

		    	//Only "ALL" category
		    	tempJsonCategories.categories.forEach( (item,index) => {
		    		if("ALL" === item.name){
		    			arrayJsonCategories.id = item.id;
		    			arrayJsonCategories.name = item.name;
		    			arrayJsonCategories.visible = item.visible;
		    		}
		    	});
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

// get Products by category "ALL" only
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
	var queryParam =  '/products/marketplace';
	var tmpArrayCategoriesCount = 1;
	var tmpArrayCategoriesCount4Xml = 1;

	optionsProductsByCategory.path = conf.path + queryParam + '?apiKey=' + conf.apiKey + '&category=' + arrayJsonCategories.id;
	debugDev('optionsProductsByCategory.path = ' + optionsProductsByCategory.path);

	var getProductsByCategory = https.request(optionsProductsByCategory, function(res) {

		var tmpRawProducts = '';
		var tmpJsonProducts;

	    res.on('data', (d) => {
	        tmpRawProducts += d;
	    });

	    res.on('end', () => {
	    	tmpJsonProducts = JSON.parse(tmpRawProducts);
	    	debugDev('request status success = ' + tmpJsonProducts.requestStatus.success);

	    	if (tmpJsonProducts.requestStatus.success === true) {	    		
	    		debugDev('Products Count = ' + tmpJsonProducts.products.length);

		    	delete tmpJsonProducts.requestStatus;

		    	jsonProducts.products = tmpJsonProducts.products;
	    	}
	    	wait4ApiCallComplete();
	    });

	});

	getProductsByCategory.end();
	getProductsByCategory.on('error', (e) => {
	    console.error(e);
	});

	let xmlProductGetByCategoryUrl = 'https://bookur.rezdy.com/catalog/' + arrayJsonCategories.id + '/' + arrayJsonCategories.name.toLowerCase() + '?format=xml';
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
			parseString(rawData, {explicitArray:false}, function (err, result) {
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
    	fs.writeFileSync('./jsonProducts.json', JSON.stringify(jsonProducts.products));		
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
        step3GetSuppliersByProducts(supplierAliasFromProducts);

	}
}

function step3GetSuppliersByProducts(supplierAliasFromProducts){

	debugDev('Step3GetSuppliersByProducts starts!');
	debugDev('supplierAliasFromProducts = ' + JSON.stringify(supplierAliasFromProducts));

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

		addSupplierCategory2ProductTourCategory();

    	fs.writeFileSync('./datafiles/arrayJsonSuppliers.json', JSON.stringify(arrayJsonSuppliers));
    	fs.writeFileSync('./datafiles/arrayJsonProducts.json', JSON.stringify(arrayJsonProducts));
    	fs.writeFileSync('./datafiles/arrayJsonCategories.json', JSON.stringify(arrayJsonCategories));
    	
    	step4GenerateMDBRecords();
	}
}

function step4GenerateMDBRecords(){

	// functions
	function handleSupplierRecords(){

		var allSupplierId = [];
		var allSupplierAlias = [];
		var allSupplierDestinationName = [];

		arrayJsonSuppliers.forEach( (item,index) => {

			allSupplierId.push(item.id);
			allSupplierAlias.push(item.alias);
			if(allSupplierDestinationName.indexOf(item.destinationName) === -1){
				allSupplierDestinationName.push(item.destinationName);
			}

			item.text = item.companyName;
			item.typeId = rTypeId.supplier;
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

    	fs.writeFileSync('./datafiles/arrayJsonSuppliers4db.json', JSON.stringify(arrayJsonSuppliers));

    	checkTaxonomySupplierId();
    	checkTaxonomySupplierAlias();
    	checkTaxonomyRegionCityId();

    	//function definition within handleSupplierRecords
    	//
    	function checkTaxonomySupplierId(){
    		var supplierIdCheckList = [];
    		allSupplierId.forEach( (item,index) => {
    			if(undefined === taxonomySupplierId[item]){
    				supplierIdCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-supplierId.json', JSON.stringify(supplierIdCheckList));
    	}

    	function checkTaxonomySupplierAlias(){
    		var supplierAliasCheckList = [];
    		allSupplierAlias.forEach( (item,index) => {
    			if(undefined === taxonomySupplierAlias[item]){
    				supplierAliasCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-supplierAlias.json', JSON.stringify(supplierAliasCheckList));
    	}

    	function checkTaxonomyRegionCityId(){
    		var regionCityIdCheckList = [];
    		allSupplierDestinationName.forEach( (item,index) => {
    			if(undefined === taxonomyRegionCityId[item]){
    				regionCityIdCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-regionCityId.json', JSON.stringify(regionCityIdCheckList));
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

		var allProductType = [];
		var allAgentPaymentType = [];
		var allProductCode = [];

		arrayJsonProducts.forEach( (item,index) => {

			if( -1 === allProductType.indexOf(item.productType)){
				allProductType.push(item.productType);
			}

			if( -1 === allAgentPaymentType.indexOf(item.agentPaymentType)){
				allAgentPaymentType.push(item.agentPaymentType);
			}

			if( -1 === allProductCode.indexOf(item.productCode)){
				allProductCode.push(item.productCode);
			}

			item.text = item.name;
			item.typeId = rTypeId.product;
			item.version = 1;
			item.online = false;
			item.lastUpdateTime = parseInt((Date.now()/1000).toFixed(0));
			item.createTime = item.lastUpdateTime;
			item.isProduct = false;
			item.productProperties = "";
			item.workspace = {};
				item.workspace.fields = {};
				item.workspace.fields.productType = item.productType;
				//item.workspace.fields.name = item.name;
				//item.workspace.fields.shortDescription = item.shortDescription;
				//item.workspace.fields.description = item.description;
				item.workspace.fields.productCode = item.productCode;
				item.workspace.fields.internalCode = item.internalCode;
				item.workspace.fields.supplierId = item.supplierId.toString();
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
				item.workspace.fields.locationAddress = item.locationAddress;
				item.workspace.fields.position = {};
					item.workspace.fields.position.address = item.locationAddress.addressLine + ' ' + item.locationAddress.city + ' ' + item.locationAddress.state + ' ' + item.locationAddress.countryCode + ' ' + item.locationAddress.postCode;
					item.workspace.fields.position.location = {};
						item.workspace.fields.position.location.type = 'Point';
						item.workspace.fields.position.location.coordinates = [];
						item.workspace.fields.position.location.coordinates.push(item.locationAddress.longitude);
						item.workspace.fields.position.location.coordinates.push(item.locationAddress.latitude);
					item.workspace.fields.position.lat = item.locationAddress.latitude;
					item.workspace.fields.position.lon = item.locationAddress.longitude;
				item.workspace.fields.additionalInformation = item.additionalInformation;
				item.workspace.fields.languages = item.languages;
				item.workspace.fields.rzdId = item.rzdId;
				item.workspace.fields.calendarWidgetUrl = item.calendarWidgetUrl;
				item.workspace.fields.productPageUrl = item.productPageUrl;
				item.workspace.fields.tourCategory = item.tourCategory;
				item.workspace.fields.photoPath = item.images[0].itemUrl;

				item.workspace.status = "draft";
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


		});
    	fs.writeFileSync('./datafiles/arrayJsonProducts4db.json', JSON.stringify(arrayJsonProducts));

    	arrayJsonProducts.forEach( (item,index) => {
    		var tours={};

			tours.text = item.text;
			tours.typeId = rTypeId.tours;
			tours.version = item.version;
			tours.online = item.online;
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
				tours.workspace.status = item.workspace.status;
				tours.workspace.taxonomy = item.workspace.taxonomy;
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

			tours.live = tours.workspace;

			tours.lastUpdateUser = crudUser;
			tours.createUser = crudUser;

			arrayJsonToursProducts.push(tours);

    	});
    	fs.writeFileSync('./datafiles/arrayJsonToursProducts4db.json', JSON.stringify(arrayJsonToursProducts));


    	checkTaxonomyProductType();
    	checkTaxonomyAgentPaymentType();
    	checkTaxonomyProductCode();

    	function checkTaxonomyProductCode(){
    		var productCodeCheckList = [];
    		allProductCode.forEach( (item,index) => {
    			if(undefined === taxonomyProductCode[item]){
    				productCodeCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-productCode.json', JSON.stringify(productCodeCheckList));
    	}

    	function checkTaxonomyProductType(){
    		var productTypeCheckList = [];
    		allProductType.forEach( (item,index) => {
    			if(undefined === taxonomyProductType[item]){
    				productTypeCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-productType.json', JSON.stringify(productTypeCheckList));
    	}

    	function checkTaxonomyAgentPaymentType(){
    		var agentPaymentTypeCheckList = [];
    		allAgentPaymentType.forEach( (item,index) => {
    			if(undefined === taxonomyAgentPaymentType[item]){
    				agentPaymentTypeCheckList.push(item);
    			}
    		});
	    	fs.writeFileSync('./datafiles/CheckList-agentPaymentType.json', JSON.stringify(agentPaymentTypeCheckList));
    	}

    	function setProductTaxonomy(supplierId,supplierAlias,productType,agentPaymentType,productCode){
    		//tour product's region_city_id & country code should be selected manually
			var taxonomy = {};

			//navigation
			taxonomy.navigation = taxonomyNavigation;

			//Product Type
			taxonomy[taxonomyVocabularyId.productType] = taxonomyProductType[productType];

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



	// processes

	handleSupplierRecords();
	handleProductRecords();
	apiCallComplete = true;

	stage2Save2MDB();


}

var getExistingDataFromMDB = () => {

	//function-wide variables
	
	
	//function definition
	
	var getExistingSuppliers = (collection,callback) => {
		var queryParam = { "typeId" : rTypeId.supplier };
		var projectParam = {
			"_id":0,
			"online":1,
			"version":1,
			"workspace.status":1,
			"workspace.taxonomy":1,
			"workspace.fields.id":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				debugDev(' d existing suppliers = ' + JSON.stringify(d));
				var s =[];
				d.forEach( (item, index) => {
					var i = {};
					i.id = item.workspace.fields.id;
					i.online = item.online;
					i.version = item.version;
					i.status = item.workspace.status;
					i.taxonomy = item.workspace.taxonomy;
					s.push(i);
				});
				debugDev(' s existing suppliers = ' + JSON.stringify(s));
				callback(s);
			})
			.catch( (e) => {
				console.log('error = ' + e);
			});
	};

	var getExistingProducts = (collection, callback) => {
		var queryParam = { "typeId" : rTypeId.product };
		var projectParam = {
			"_id":0,
			"online":1,
			"version":1,
			"workspace.fields.productCode":1,
			"workspace.status":1,
			"workspace.taxonomy":1,
			"workspace.fields.id":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				var p = [];
				d.forEach( (item,index) => {
					var i = {};
					i.id = item.workspace.fields.id;
					i.productCode = item.workspace.fields.productCode;
					i.online = item.online;
					i.version = item.version;
					i.status = item.workspace.status;
					i.taxonomy = item.workspace.taxonomy;
					p.push(i);
				});
				callback(p);
			})
			.catch( (e) => {
				console.log('error = ' + e);
			});
	};

	var getExistingToursProducts = (collection, callback) => {
		var queryParam = { "typeId" : rTypeId.tours };
		var projectParam = {
			"_id":0,
			"online":1,
			"version":1,
			"workspace.fields.productCode":1,
			"workspace.status":1,
			"workspace.taxonomy":1
		};

		collection.find(queryParam).project(projectParam).toArray()
			.then( (d) => {
				var p = [];
				d.forEach( (item,index) => {
					var i = {};
					i.productCode = item.workspace.fields.productCode;
					i.online = item.online;
					i.version = item.version;
					i.status = item.workspace.status;
					i.taxonomy = item.workspace.taxonomy;
					p.push(i);
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
			console.log("Connected successfully to server");

		var collection = db.collection('Contents');

		getExistingSuppliers(collection, (s) => {
			existingSuppliers = s;
			//debugDev('existingSuppliers = ' + JSON.stringify(existingSuppliers));
			getSuppliersComplete = true;
			closeDB();
		});

		getExistingProducts(collection, (p) => {
			existingProducts = p;
			debugDev('existingProducts = ' + JSON.stringify(existingProducts));
			getProductsComplete = true;
			closeDB();
		});

		getExistingToursProducts(collection, (t) => {
			existingToursProducts = t;
			debugDev('existingToursProducts = ' + JSON.stringify(existingToursProducts));
			getToursProductsComplete = true;
			closeDB();
		});

		var closeDB = () => {
			if(getSuppliersComplete && getProductsComplete && getToursProductsComplete){
				db.close();
				getExistingComplete = true;

				stage2Save2MDB();
			}
		};

	});
};

var stage2Save2MDB = () => {
	if(getExistingComplete && apiCallComplete)
		if(operateDB)
			saveSuppliers2MDB();
};


var saveSuppliers2MDB = () => {

	var queryParam = { "typeId" : rTypeId.supplier };
	var updateCount = existingSuppliers.length;
	var insertCount = 0;
	debugDev('init updateCount = ' + updateCount);
	var sInsertRecords = [];
	var sUpdateRecords = [];
	var updateComplete = false;
	var insertComplete = false;

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("saveSuppliers2MDB Connected successfully to server");

		var collection = db.collection('Contents');

		var updateSupplier = (rzdItem, rzdIndex, existingItem) => {
			var filter = {"typeId" : rTypeId.supplier, "workspace.fields.alias" : rzdItem.workspace.fields.alias};
			var options = {};

			rzdItem.online = existingItem.online;
			rzdItem.version = existingItem.version;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateSupplierComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4UpdateSupplierComplete = () => {
				updateCount--;
				debugDev('updateCount = ' + updateCount);
				if(0 === updateCount){
					updateComplete = true;
					wait4IUBothComplete();
				}
			};
		};

		var insertSupplier = (rzdItem, rzdIndex) => {
			var options = {forceServerObjectId:true};
		    
	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertSuppliersComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});

		    var wait4InsertSuppliersComplete = () =>{
		    	insertCount--;
				debugDev('wait4InsertSuppliersComplete insertCount = ' + insertCount);
		    	if(0 === insertCount){
		    		insertComplete = true;
		    		wait4IUBothComplete();
		    	}
		    };
		};

		var wait4IUBothComplete = () => {
			if(updateComplete && insertComplete){				
				db.close();
				saveProducts2MDB();
			}
		};

		arrayJsonSuppliers.forEach( (rzdItem,rzdIndex) => {
			var existing = false;
			existingSuppliers.forEach( (existingItem,existingIndex) => {
				if(rzdItem.workspace.fields.id === existingItem.id ){
					existing = true;
					sUpdateRecords.push(rzdItem);
				}
			});
			if(!existing)
				sInsertRecords.push(rzdItem);
		});

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

		insertCount = sInsertRecords.length;
		debugDev('init insertCount = ' + insertCount);
		if(0 !== insertCount){
			sInsertRecords.forEach( (siItem,siIndex) => {
				insertSupplier(siItem, siIndex);
			});
		} else {
			insertComplete = true;
			wait4IUBothComplete();
		}

	});
};

var saveProducts2MDB = () => {

	debugDev('Enter saveProducts2MDB() !');
	var updateCount = 0;
	var insertCount = 0;
	var putOfflineCount = 0;
	var pInsertRecords = [];
	var pUpdateRecords = [];
	var pPutOfflineRecords = [];
	var updateComplete = false;
	var insertComplete = false;
	var putOfflineComplete = false;

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("saveProducts2MDB Connected successfully to server");

		var collection = db.collection('Contents');

		var updateProduct = (rzdItem, rzdIndex, existingItem) => {
			var filter = {"typeId" : rTypeId.product, "workspace.fields.productCode" : rzdItem.workspace.fields.productCode};
			var options = {};

			rzdItem.online = existingItem.online;
			rzdItem.version = existingItem.version;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4UpdateProductComplete = () => {
				updateCount--;
				debugDev('updateCount = ' + updateCount);
				if(0 === updateCount){
					updateComplete = true;
					wait4IUDComplete();
				}
			};
		};

		var insertProduct = (rzdItem, rzdIndex) => {
			var options = {forceServerObjectId:true};
		    
	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertProductComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});

		    var wait4InsertProductComplete = () =>{
		    	insertCount--;
				debugDev('wait4InsertProductComplete insertCount = ' + insertCount);
		    	if(0 === insertCount){
		    		insertComplete = true;
		    		wait4IUDComplete();
		    	}
		    };
		};

		var putOfflineProduct = (existingItem, existingIndex) => {
			var filter = {"typeId" : rTypeId.product, "workspace.fields.productCode" : existingItem.productCode};
			var options = {};
			var updates = {$set:{online:false}};

			collection.updateOne(filter, updates, options)
				.then( (r) => {
					debugDev('putOfflineProduct r = ' + JSON.stringify(r));
					debugDev('putOfflineProduct count = ' + r.matchedCount);
					wait4PutOfflineProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4PutOfflineProductComplete = () => {
				putOfflineCount--;
				debugDev('putOfflineCount = ' + putOfflineCount);
				if(0 === putOfflineCount){
					putOfflineComplete = true;
					wait4IUDComplete();
				}
			};
		};

		var wait4IUDComplete = () => {
			if(updateComplete && insertComplete && putOfflineComplete){				
				db.close();
				saveToursProducts2MDB();
			}
		};

		//seperate insert & update
		arrayJsonProducts.forEach( (rzdItem,rzdIndex) => {
			var existing = false;
			existingProducts.forEach( (existingItem,existingIndex) => {
				if(rzdItem.workspace.fields.productCode === existingItem.productCode ){
					existing = true;
					pUpdateRecords.push(rzdItem);
				}
			});
			if(!existing)
				pInsertRecords.push(rzdItem);
		});

		//find out put-offline records
		existingProducts.forEach( (existingItem, existingIndex) => {
			var putOnline = false;
			arrayJsonProducts.forEach( (rzdItem,rzdIndex) => {
				if(existingItem.productCode === rzdItem.workspace.fields.productCode){
					putOnline = true;
				}				
			});
			if(!putOnline){
				pPutOfflineRecords.push(existingItem);
			}			
		});

		var updateCount = pUpdateRecords.length;
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

var saveToursProducts2MDB = () => {

	debugDev('Enter saveToursProducts2MDB !');
	var updateCount = 0;
	var insertCount = 0;
	var putOfflineCount = 0;
	var pInsertRecords = [];
	var pUpdateRecords = [];
	var pPutOfflineRecords = [];
	var updateComplete = false;
	var insertComplete = false;
	var putOfflineComplete = false;

	MongoClient.connect(mdbUrl, (err, db) => {

		if(null === err) console.log("saveProducts2MDB Connected successfully to server");

		var collection = db.collection('Contents');

		var updateProduct = (rzdItem, rzdIndex, existingItem) => {
			var filter = {"typeId" : rTypeId.tours, "workspace.fields.productCode" : rzdItem.workspace.fields.productCode};
			var options = {};

			rzdItem.online = existingItem.online;
			rzdItem.version = existingItem.version;
			rzdItem.workspace.taxonomy = existingItem.taxonomy;
			rzdItem.live.taxonomy = existingItem.taxonomy;
			rzdItem.workspace.status = existingItem.status;
			rzdItem.live.status = existingItem.status;

			collection.updateOne(filter, rzdItem, options)
				.then( (r) => {
					debugDev('updateOne r = ' + JSON.stringify(r));
					debugDev('update count = ' + r.matchedCount);
					wait4UpdateProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4UpdateProductComplete = () => {
				updateCount--;
				debugDev('updateCount = ' + updateCount);
				if(0 === updateCount){
					updateComplete = true;
					wait4IUDComplete();
				}
			};
		};

		var insertProduct = (rzdItem, rzdIndex) => {
			var options = {forceServerObjectId:true};
		    
	    	collection.insertOne(rzdItem,options)
	    		.then( (r) => {
	    			debugDev('index = ' + rzdIndex + '; insertOne r = ' + JSON.stringify(r));
	    			wait4InsertProductComplete();
	    		})
	    		.catch( (e) => {
	    			console.log('Error = ' + e);
	    		});

		    var wait4InsertProductComplete = () =>{
		    	insertCount--;
				debugDev('wait4InsertProductComplete insertCount = ' + insertCount);
		    	if(0 === insertCount){
		    		insertComplete = true;
		    		wait4IUDComplete();
		    	}
		    };
		};

		var putOfflineProduct = (existingItem, existingIndex) => {
			var filter = {"typeId" : rTypeId.product, "workspace.fields.productCode" : existingItem.productCode};
			var options = {};
			var updates = {$set:{online:false}};

			collection.updateOne(filter, updates, options)
				.then( (r) => {
					debugDev('putOfflineProduct r = ' + JSON.stringify(r));
					debugDev('putOfflineProduct count = ' + r.matchedCount);
					wait4PutOfflineProductComplete();
				})
				.catch( (e) => {
					console.log("Error = " + e);
				});

			var wait4PutOfflineProductComplete = () => {
				putOfflineCount--;
				debugDev('putOfflineCount = ' + putOfflineCount);
				if(0 === putOfflineCount){
					putOfflineComplete = true;
					wait4IUDComplete();
				}
			};
		};

		var wait4IUDComplete = () => {
			if(updateComplete && insertComplete && putOfflineComplete){				
				db.close();
				console.log('*** Suppliers and Products upsert completed ***');
			}
		};

		//seperate insert & update
		arrayJsonToursProducts.forEach( (rzdItem,rzdIndex) => {
			var existing = false;
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
			var putOnline = false;
			arrayJsonToursProducts.forEach( (rzdItem,rzdIndex) => {
				if(existingItem.productCode === rzdItem.workspace.fields.productCode){
					putOnline = true;
				}				
			});
			if(!putOnline){
				pPutOfflineRecords.push(existingItem);
			}			
		});

		var updateCount = pUpdateRecords.length;
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

//Start

step1GetCategories();
getExistingDataFromMDB();
//if(stage1Complete && operateDB) stage2Save2MDB();