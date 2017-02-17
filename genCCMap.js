/*jshint esversion: 6 */
var fs = require('fs');
var countryContinentMap = require('./docs/countryContinentMapping.json');
var ccMap = {};
countryContinentMap.forEach((item) => {
	var value = {};
	value.countryName = item.countryName;
	value.continentName = item.continentName;
	ccMap[item.countryCode] = value;
});
fs.writeFileSync('./ccMap.json', JSON.stringify(ccMap));