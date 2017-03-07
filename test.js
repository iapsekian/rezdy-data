var duration = new Date(5100*60*1000);
console.log('duration.getTime() = ' + duration.getTime());
console.log('duration.getTime()/86400000 = ' +duration.getTime()/86400000);
console.log('Math.floor(duration.getTime()/86400000) = ' + Math.floor(duration.getTime()/86400000));
var days = Math.floor(duration.getTime()/86400000);
console.log(Math.floor(duration.getTime()/86400000) + ' Days ' + Math.floor( (duration.getTime()-86400000*days)/3600000 ) + ' Hours ' +duration.getUTCMinutes() + ' Minutes ' + duration.getUTCSeconds() + ' Seconds.');