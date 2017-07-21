/*jshint esversion: 6 */

const csv = require('csvtojson')
const csvFilePath = './mapping/rezdytours.csv'

csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    // combine csv header row and csv line to a json object 
    // jsonObj.a ==> 1 or 4 
    console.log(JSON.stringify(jsonObj));
})
.on('done',(error)=>{
    console.log('end')
})