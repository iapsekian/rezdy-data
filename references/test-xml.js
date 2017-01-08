/*jshint esversion: 6 */
var https = require('https');
var fs = require('fs');
var debug = require('debug');
const util = require('util');
var parseString = require('xml2js').parseString;

var url = 'https://bookur.rezdy.com/catalog/124509/sydney?format=xml';

https.get(url, (res) => {
  const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n` +
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
  res.on('data', (chunk) => rawData += chunk);
  res.on('end', () => {
    try {
	  fs.writeFileSync('./cat-product.xml', rawData);
		parseString(rawData, {explicitArray:false}, function (err, result) {
		    //console.log(util.inspect(result, false, null));
		    fs.writeFileSync('./cat-product.json', JSON.stringify(result));
		});
    } catch (e) {
      console.log(e.message);
    }
  });
}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
});
