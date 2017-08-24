#!/usr/bin/env node --max_old_space_size=4096
/*jshint esversion: 6 */

//usage: 

const https = require('https');
const fs = require('fs');
const util = require('util');
const buUtil = require('./lib/bookurUtil.js')
const schedule = require('node-schedule')
const debug = require('debug');
const debugDev = debug('dev');


let execArgv = process.execArgv
let targetEnv = process.argv[2]
let dbOPSwitch = process.argv[3]
let operateDB = false;
let mdbUrl = '';
buUtil.getMongoDBUrl(targetEnv, dbOPSwitch, (env, op, mUrl) => {
	targetEnv = env;
	operateDB = op;
	mdbUrl = mUrl;
})

let runExternalScripts = () => {
	console.log('Running External Scripts - importAsAgent.js Starting.....')
	let args = []
	let options = {}

	options.execArgv = execArgv.slice()
	args.push(targetEnv)
	args.push(dbOPSwitch)

	buUtil.runScript('./importAsAgent.js', args, options, err => {
		if(err){
			job.cancel()
			throw err
		} else{
			console.log('******** importAsAgent.js completed *******')
		}
	})
}

let rule = new schedule.RecurrenceRule()
rule.dayOfWeek = new schedule.Range(1, 5)
rule.hour = 8
rule.minute = 0

console.log('### Scheduled jobs starting..... ###')
let job = schedule.scheduleJob(rule,runExternalScripts)
console.log('### Scheduled jobs started....., Now waiting ###')
