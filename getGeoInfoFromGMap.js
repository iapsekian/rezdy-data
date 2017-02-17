/*jshint esversion: 6 */

var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;
var MongoClient = require('mongodb').MongoClient;
var GoogleMapsAPI = require('googlemaps');
var ccMap = require('./ccMap.json');

//console.log('process.argv = ' + process.argv);
//var operateDB = process.argv.slice(2)[0] === 'OPDB' ? true : false;
//console.log('operateDB = ' + operateDB);
//
var productionEnv = false;
var testEnv = false;
var operateDB = false;

var targetEnv = process.argv.slice(2)[0];
var dbOPSwitch = process.argv.slice(3)[0];

if('PRODUCTION' === targetEnv){
	console.log('*** CAUTION!!! NOW this program will operate the PRODUCTION ENV.!!! ***');
	productionEnv = true;
	if('OPDB' === dbOPSwitch){
		console.log('*** & Database will be CHANGED!!! ***');
		operateDB = true;
	} else {
		console.log('*** BUT Database will remain unchanged.  ***');
	}
} else if('TEST' === targetEnv){
	console.log('*** Operate TEST ENV. ***');
	testEnv = true;
	if('OPDB' === dbOPSwitch){
		console.log('*** & Database will be CHANGED!!! ***');
		operateDB = true;
	} else {
		console.log('*** BUT Database will remain unchanged.  ***');
	}
} else if('OPDB' === targetEnv){
	console.log('*** Operate TEST ENV. ***');
	console.log('*** & Database will be CHANGED!!! ***');
	targetEnv = 'TEST';
	testEnv = true;
	operateDB = true;
} else {
	console.log('*** Operate TEST ENV. ***');
	console.log('*** BUT Database will remain unchanged.  ***');
	targetEnv = 'TEST';
	testEnv = true;	

	console.log('Arguments Example - ');
	console.log('	node xxx.js PRODUCTION');
	console.log('	node xxx.js PRODUCTION OPDB');
	console.log('	node xxx.js TEST === node xxx.js');
	console.log('	node xxx.js TEST OPDB === node xxx.js OPDB');
}

//DB definition/value

if(productionEnv){
	var mdbUrl = 'mongodb://52.39.111.227:27017/tourbooks';

	var contentTypeId = {
		"tours" : "58785c576d0e815f4014b288"
	};

} else if (testEnv){
	var mdbUrl = 'mongodb://tst.tourbooks.cc:27017/tourbooks';

	var contentTypeId = {
		"tours" : "58785c576d0e815f4014b288"
	};
}

//google maps api
var gmAPIConf = {
  key: 'AIzaSyBrZTmy5AzHgXFV9JNUpZKcc1faRaqJA4U',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true // use https
};
var gmAPI = new GoogleMapsAPI(gmAPIConf);

//base configuration

var debugDev = debug('dev');
var tours = [], toursWithCoordinate = [], toursWithCityCountryCode = [];
var toursCount = 0, toursWithCoordinateCount = 0, toursWithCityCountryCodeCount = 0;
var toursUpdateLog = '';
var toursUpdateLogCount = 0;
var locLog = '', errLog = '';

var getContinentName = (countryCode) => {
	return ccMap[countryCode].continentName;
};
var getCountryName = (countryCode) => {
	return ccMap[countryCode].countryName;
};


MongoClient.connect(mdbUrl, (err, db) => {
	if(null === err) console.log("Connected successfully to server - " + mdbUrl);

	var collection = db.collection('Contents');
	var collection1 = db.collection('TaxonomyTerms');

	var preparingData = () => {

		var qualifyTours = () => {
			//Log string variables
			var totalToursCount = toursCount;
			var normalLog = 'Normal tours as below - \n',
				emptyLog = 'Tours without Location Address as below - \n',
				noCityStateCountryLog = 'Tours without city or countryCode as below - \n',
				noCityStateCountryButCoordinateLog = 'Tours without city or countryCode but full coordinate as below - \n',
				coordinateOnlyLog = 'Tours with coordinate ONLY as below - \n'; 
			var normalLogCount = 0,
				emptyLogCount = 0,
				noCityStateCountryLogCount = 0,
				noCityStateCountryButCoordinateLogCount = 0,
				coordinateOnlyLogCount = 0; 
			
			var wait4AllToursComplete = () => {
				toursCount--;
				//debugDev('toursCount = ' + toursCount);
				if(0 === toursCount){
					normalLog += '*** Normal record count = ' + normalLogCount + ' ***\n\n\n';
					noCityStateCountryLog += '*** Tours without City, State or Country count = ' + noCityStateCountryLogCount + ' ***\n\n\n';
					noCityStateCountryButCoordinateLog += '*** Tours without City or Country But Full Coordinate count = ' + noCityStateCountryButCoordinateLogCount + ' ***\n\n\n';
					emptyLog += '*** Tour with No Location Address data count = ' + emptyLogCount + ' ***\n\n\n';
					//coordinateOnlyLog += '*** Tours with coordinates ONLY count = ' + coordinateOnlyLogCount + ' ***\n\n\n';

					var countResults = '*** Normal record count = ' + normalLogCount + ' ***\n'
										//+ '*** Tours with coordinates ONLY count = ' + coordinateOnlyLogCount + ' ***\n'
										+ '*** Tours without City, State or Country But Full Coordinate count = ' + noCityStateCountryButCoordinateLogCount + ' ***\n'
										+ '*** Tours without City or Country count = ' + noCityStateCountryLogCount + ' ***\n'
										+ '*** Tour with No Location Address data count = ' + emptyLogCount + ' ***\n';
					var allLog = 'Total Tours Count = ' + totalToursCount + '\n\n' +  countResults + '\n\n' + normalLog + noCityStateCountryButCoordinateLog + coordinateOnlyLog + noCityStateCountryLog + emptyLog ;

				    fs.writeFileSync('./logs/getGeoInfoFromGMap-source-'+ targetEnv +'.log', allLog);

				    toursWithCoordinateCount = toursWithCoordinate.length;
				    toursWithCityCountryCodeCount = toursWithCityCountryCode.length;

					processingTours();
				}
			};

			tours.forEach((tour, idxTour)=>{
				var noLocationAddress = false; cityFlag = true, stateFlag = true, countryCodeFlag = true, latitudeFlag = true, longitudeFlag = true;
				if(util.isNullOrUndefined(tour.workspace.fields.locationAddress)){
					noLocationAddress = true;
				} else {
					if( util.isNullOrUndefined(tour.workspace.fields.locationAddress.city) ){
						cityFlag = false;
					} else if(tour.workspace.fields.locationAddress.city.length === 0){
						cityFlag = false;
					}

					if(util.isNullOrUndefined(tour.workspace.fields.locationAddress.state)){
						stateFlag = false;
					} else if(tour.workspace.fields.locationAddress.state.length === 0){
						stateFlag = false;
					}

					if(util.isNullOrUndefined(tour.workspace.fields.locationAddress.countryCode)){
						countryCodeFlag = false;
					} else if(tour.workspace.fields.locationAddress.countryCode.length === 0){
						countryCodeFlag = false;				
					}

					if(util.isNullOrUndefined(tour.workspace.fields.locationAddress.latitude)){
						latitudeFlag = false;
					} else if(tour.workspace.fields.locationAddress.latitude === 0){
						latitudeFlag = false;				
					}

					if(util.isNullOrUndefined(tour.workspace.fields.locationAddress.longitude)){
						longitudeFlag = false;
					} else if(tour.workspace.fields.locationAddress.longitude === 0){
						longitudeFlag = false;				
					}				
				}

				if(noLocationAddress){
					emptyLog += '	--- ' + tour.text + '\n';
					emptyLogCount++;
					wait4AllToursComplete();
				} else {
					if(latitudeFlag && longitudeFlag){
						toursWithCoordinate.push(tour);
						normalLog += '	--- ' + tour.text + '\n';
						normalLogCount++;
						wait4AllToursComplete();
					} else if(cityFlag && countryCodeFlag){
						toursWithCityCountryCode.push(tour);
						noCityStateCountryButCoordinateLog += '	--- ' + tour.text + '\n';
						noCityStateCountryButCoordinateLogCount++;
						wait4AllToursComplete();
					} else if(!cityFlag || !countryCodeFlag){
						noCityStateCountryLog += '	--- ' + tour.text + '\n';
						noCityStateCountryLogCount++;
						wait4AllToursComplete();
					} else {
						emptyLog += '	--- ' + tour.text + '\n';
						emptyLogCount++;
						wait4AllToursComplete();
					}
				}
			});
		};

		var dataReadyCountDown = 1;
		var wait4DataPreparationReady = () => {
			dataReadyCountDown--;
			if(dataReadyCountDown === 0){
				qualifyTours();
			}
		};

		var queryParam4Tours = { "typeId" : contentTypeId.tours };
		var projectParam4Tours = {
			'_id': 1,
			'text': 1,
			'workspace': 1,
			'live': 1
		};
		collection.find(queryParam4Tours).project(projectParam4Tours).toArray()
			.then( (d) => {
				toursCount = d.length;
				tours = d;
				wait4DataPreparationReady();
			})
			.catch( (e) => {
				console.log('Export all tours to an array Exception - ' + e);
			});
	};

	var processingTours = () => {

		var wait4toursWithCoordinateComplete = () => {
			toursWithCoordinateCount--;
			if(toursWithCoordinateCount === 0){
				fs.writeFileSync('./datafiles/toursWithCoordinate-'+ targetEnv +'.json', JSON.stringify(toursWithCoordinate));
				processingToursWithoutCoordinate();
			}
		};

		if(0 !== toursWithCoordinateCount){
			toursWithCoordinate.forEach((tour)=>{
				var loc = {
					'continent': '',
					'country': '',
					'countryCode':'',
					'state': '',
					'city': '',
					'locality': '',
					'colloquial_area': '',
					'neighborhood': ''
				};

				//toursWithCoordinate.forEach starting point
				var reverseGeocodeParams = {
				  "latlng": tour.workspace.fields.locationAddress.latitude+','+tour.workspace.fields.locationAddress.longitude,
				  //"result_type": "administrative_area_level_4",
				  "language": "en"//,
				  //"location_type": "APPROXIMATE"
				};

				setTimeout(function(){
					gmAPI.reverseGeocode(reverseGeocodeParams, (err,r)=>{
						var go = false;

						if(null === err){
							switch(r.status){
								case 'OK':
									go = true;
									debugDev('gmAPI Status Code = OK!');
									break;
								case 'ZERO_RESULTS':
									debugDev('gmAPI Status Code = ZERO_RESULTS!');
									break;
								case 'OVER_QUERY_LIMIT':
									debugDev('gmAPI Status Code = OVER_QUERY_LIMIT!');
									break;
								case 'REQUEST_DENIED':
									debugDev('gmAPI Status Code = REQUEST_DENIED!');
									break;
								case 'INVALID_REQUEST':
									debugDev('gmAPI Status Code = INVALID_REQUEST!');
									break;
								default:
									debugDev('gmAPI Status Code = UNKNOWN_ERROR!');
							}

							if(go){				
								var data = r.results;
								data.forEach((item) => {
									if(loc.country.length === 0 || loc.state.length === 0 || loc.city.length === 0 || loc.locality.length === 0 || loc.neighborhood.length === 0 || loc.colloquial_area.length === 0){
										var address_components = item.address_components;
										address_components.forEach((address_component)=>{
											var addrTypes = address_component.types;
											var stopFlag = false;
											var stopCat = '';
											addrTypes.forEach((addrType)=>{
												if(!stopFlag){
													switch(addrType){
														case 'country':
															stopFlag = true;
															stopCat = 'country';
															break;
														case 'locality':
															stopFlag = true;
															stopCat = 'locality';
															break;
														case 'administrative_area_level_1':
															stopFlag = true;
															stopCat = 'state';
															break;
														case 'administrative_area_level_2':
															stopFlag = true;
															stopCat = 'city';
															break;
														case 'neighborhood':
															stopFlag = true;
															stopCat = 'neighborhood';
															break;
														case 'colloquial_area':
															stopFlag = true;
															stopCat = 'colloquial_area';
															break;
														default:
													}											
												}
											});

											if(stopFlag){
												switch(stopCat){
													case 'country':
														loc.country = address_component.long_name;
														loc.countryCode = address_component.short_name;
														break;
													case 'locality':
														loc.locality = address_component.long_name;
														break;
													case 'state':
														loc.state = address_component.long_name;
														break;
													case 'city':
														loc.city = address_component.long_name;
														break;
													case 'neighborhood':
														loc.neighborhood = address_component.long_name;
														break;
													case 'colloquial_area':
														loc.colloquial_area = address_component.long_name;
														break;
													default:
												}
											}

										});
									}
								});
								loc.continent = getContinentName(loc.countryCode);

								locLog += 'Tour - ' + tour.text + ' - loc information - ' + JSON.stringify(loc) + '\n';
								tour.loc = loc;
								wait4toursWithCoordinateComplete();										
							} else {
								debugDev('Tour - ' + tour.text +' - Google Maps API - reverse Geocoding - Call Status - ' + r.status);
								errLog += 'Tour - ' + tour.text +' - Google Maps API - reverse Geocoding - Call Status - ' + r.status +'\n';
								tour.loc = loc;
								wait4toursWithCoordinateComplete();
							}

						} else {
							debugDev('Tour - ' + tour.text +' - Google Maps API - reverse Geocoding - ERR Exception Happened! - ' + err);
							errLog += 'Tour - ' + tour.text +' - Google Maps API - reverse Geocoding - ERR Exception Happened! - ' + err +'\n';
							tour.loc = loc;
							wait4toursWithCoordinateComplete();
						}
							
					});
				},100); //wait for 100 ms in order to avoid error - over query limit
			});
		}
	};

	var processingToursWithoutCoordinate = () => {

		var wait4ToursWithoutCoordinateComplete = () =>{
			toursWithCityCountryCodeCount--;
			if(0 === toursWithCityCountryCodeCount){
				db.close(); 
				fs.writeFileSync('./datafiles/toursWithCityCountryCode-'+ targetEnv +'.json', JSON.stringify(toursWithCityCountryCode));
				fs.writeFileSync('./logs/getGeoInfoFromGMap-locLog-'+ targetEnv +'.log', locLog);
				fs.writeFileSync('./logs/getGeoInfoFromGMap-errLog-'+ targetEnv +'.log', errLog);
				console.log(' *** DONE ***');				
			}
		};

		locLog += '\n\n' + 'Tours without coordinate -- \n';

		if(0 !== toursWithCityCountryCodeCount){
			toursWithCityCountryCode.forEach((tour)=>{
				var loc = {
					'continent': '',
					'country': '',
					'countryCode':'',
					'state': '',
					'city': '',
					'locality': '',
					'neighborhood': ''
				};

				if(!util.isNullOrUndefined(tour.workspace.fields.locationAddress.city)){
					if(0 !== tour.workspace.fields.locationAddress.city.length){
						loc.city = tour.workspace.fields.locationAddress.city;
					}
				}
				if(!util.isNullOrUndefined(tour.workspace.fields.locationAddress.countryCode)){
					if(0 !== tour.workspace.fields.locationAddress.countryCode.length){
						loc.countryCode = tour.workspace.fields.locationAddress.countryCode.toUpperCase();
						loc.continent = getContinentName(loc.countryCode);
						loc.country = getCountryName(loc.countryCode);
					}
				}

				locLog += 'Tour - ' + tour.text + ' - loc information - ' + JSON.stringify(loc) + '\n';

				tour.loc = loc;

				wait4ToursWithoutCoordinateComplete();
			});
		} else {
			toursWithCityCountryCodeCount = 1;
			wait4ToursWithoutCoordinateComplete();
		}
	};
	//Starting point
	preparingData();
});

