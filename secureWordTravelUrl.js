//mongo shell jsvascript 
//mongo  127.0.0.1/tourbooks delViatorTours.js
//Purpose: remove Viator tours records

var collection = db.getCollection('Contents');
var cursor = collection.find({},{_id:1,text:1,workspace:1});
var countUPD = 0;
var searchTerm = 'http://www.wordtravels.com';
var replaceTerm = 'https://www.wordtravels.com';
print('total count = ' + cursor.count());
while(cursor.hasNext()){
    var data = cursor.next();
    if(data.workspace.fields.PhotoPath){
	    var pp = data.workspace.fields.PhotoPath;
	    var regex = new RegExp(searchTerm, 'g')
	    if(regex.test(pp)){
	    	var afterPP = pp.replace('http://', 'https://')
		    print('_id = ' + data._id + ', name = ' + data.text + ', before = ' + pp + ', after = ' + afterPP)
		    countUPD++;
		    // collection.deleteOne({_id:data._id});
		    // 
			var filter = { _id: data._id};
			var updateField = {};

			data.workspace.fields.PhotoPath = afterPP;
			updateField.workspace = data.workspace;
			updateField.live = data.workspace;
			var update = { $set: updateField };
		    
		    try{
		    	collection.updateOne(filter,update);
			    print('_id = ' + data._id + ', updating completed!');
		    } catch(e){
		    	print('_id = ' + data._id + ', updating error! - ' + e);
		    }
	    }
    }
}
print('countUPD = ' + countUPD);