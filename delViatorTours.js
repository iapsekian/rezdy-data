//mongo shell jsvascript 
//mongo  127.0.0.1/tourbooks delViatorTours.js
//Purpose: remove Viator tours records

var collection = db.getCollection('Contents');
var cursor = collection.find({"typeId":"58785c576d0e815f4014b288","workspace.fields.marketplace":"Viator"});
var countDEL = 0;
print('total count = ' + cursor.count());
while(cursor.hasNext()){
    var vTour = cursor.next();
    collection.deleteOne({_id:vTour._id});
    print('_id = ' + vTour._id + ', name = ' + vTour.text + ', marketplace = ' + vTour.workspace.fields.marketplace)
    countDEL++;
}
print('countDEL = ' + countDEL);