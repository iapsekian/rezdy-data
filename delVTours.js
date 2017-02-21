//mongo shell jsvascript 
//mongo  127.0.0.1/tourbooks delVTours.js
//Purpose: remove Viator tours records excluding the lastUpdate is 20170214 and 20160212

var collection = db.getCollection('Contents');
var cursor = collection.find({"typeId":"57eb982d6d0e81af767b23cd"});
var count20170214 = 0, count20161202 = 0, countDEL = 0;
while(cursor.hasNext()){
    var vTour = cursor.next();
    var date = new Date(vTour.lastUpdateTime*1000);
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    if(2017 == year){
        if(2 == month){
            if(14 == day){
                count20170214++;
            } else {
                collection.remove({_id:vTour._id});
                countDEL++;                
            }
        } else {
            collection.remove({_id:vTour._id});
            countDEL++;
        }
    } else if (2016 == year){
        if(12 == month){
            if(2 == day){
                count20161202++;
            } else {
                collection.remove({_id:vTour._id});
                countDEL++;                                
            }
        } else {
            collection.remove({_id:vTour._id});
            countDEL++;            
        }
    } else {
        collection.remove({_id:vTour._id});
        countDEL++;        
    }
}
print('count20170214 = ' + count20170214 + ', count20161202 = ' + count20161202 + ', countDEL = ' + countDEL);