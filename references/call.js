var https = require('https');

/**
 * HOW TO Make an HTTP Call - GET
 */
// options for GET
// 
/**
var optionsget = {
    host : 'api.rezdy.com', // here only the domain name
    // (no http/https !)
    port : 443,
    path : '/latest/products/marketplace?apiKey=3c03bef5c6bf4288a7d1052e03883323&automatedPayment=true&category=124509&language=en_us&offset=0', // the rest of the url with parameters if needed
    method : 'GET', // do GET
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
    }
};
 
console.info('Options prepared:');
console.info(optionsget);
console.info('Do the GET call');

var rawData = '';
 
// do the GET request
var reqGet = https.request(optionsget, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
    console.log("headers: ", res.headers);
 
     
    res.on('data', function(d) {
        console.info('GET result:\n');
        rawData += d;
    });
    res.on('end', function() {
        console.info('response end !!\n');
        process.stdout.write(JSON.parse(rawData).requestStatus.version);
    });

});
 
reqGet.end();
reqGet.on('error', function(e) {
    console.error(e);
});
*/

var optionsResourceGet = {
    host : 'api.rezdy.com', // here only the domain name
    // (no http/https !)
    port : 443,
    path : '/latest/resources?apiKey=3c03bef5c6bf4288a7d1052e03883323', // the rest of the url with parameters if needed
    method : 'GET', // do GET
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
    }
};
 
console.info('Resources Options prepared:');
console.info(optionsResourceGet);
console.info('Do the resources GET call');

var suppliersRawData = '';
 
// do the GET request
var suppliersReqGet = https.request(optionsResourceGet, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
    console.log("headers: ", res.headers);
 
     
    res.on('data', function(d) {
        console.info('GET result:\n');
        suppliersRawData += d;
    });
    res.on('end', function() {
        //event.preventDefault();
        /* Act on the event */
        console.info('response end !!\n');
        process.stdout.write(suppliersRawData);
    });

});
 
suppliersReqGet.end();
suppliersReqGet.on('error', function(e) {
    console.error(e);
});

 
/**
 * HOW TO Make an HTTP Call - POST
 */
// do a POST request
// create the JSON object

/*
jsonObject = JSON.stringify({
    "message" : "The web of things is approaching, let do some tests to be ready!",
    "name" : "Test message posted with node.js",
    "caption" : "Some tests with node.js",
    "link" : "http://www.youscada.com",
    "description" : "this is a description",
    "picture" : "http://youscada.com/wp-content/uploads/2012/05/logo2.png",
    "actions" : [ {
        "name" : "youSCADA",
        "link" : "http://www.youscada.com"
    } ]
});
 
// prepare the header
var postheaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};
 
// the post options
var optionspost = {
    host : 'graph.facebook.com',
    port : 443,
    path : '/youscada/feed?access_token=your_api_key',
    method : 'POST',
    headers : postheaders
};
 
console.info('Options prepared:');
console.info(optionspost);
console.info('Do the POST call');
 
// do the POST call
var reqPost = https.request(optionspost, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
//  console.log("headers: ", res.headers);
 
    res.on('data', function(d) {
        console.info('POST result:\n');
        process.stdout.write(d);
        console.info('\n\nPOST completed');
    });
});
 
// write the json data
reqPost.write(jsonObject);
reqPost.end();
reqPost.on('error', function(e) {
    console.error(e);
});

*/
 
/**
 * Get Message - GET
 */
// options for GET

/*
var optionsgetmsg = {
    host : 'graph.facebook.com', // here only the domain name
    // (no http/https !)
    port : 443,
    path : '/youscada/feed?access_token=you_api_key', // the rest of the url with parameters if needed
    method : 'GET' // do GET
};
 
console.info('Options prepared:');
console.info(optionsgetmsg);
console.info('Do the GET call');
 
// do the GET request
var reqGet = https.request(optionsgetmsg, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
//  console.log("headers: ", res.headers);
 
 
    res.on('data', function(d) {
        console.info('GET result after POST:\n');
        process.stdout.write(d);
        console.info('\n\nCall completed');
    });
 
});
 
reqGet.end();
reqGet.on('error', function(e) {
    console.error(e);
});
*/
