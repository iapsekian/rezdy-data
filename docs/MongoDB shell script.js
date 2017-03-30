MongoDB shell script

//add attraction id to Tours

step 1 - db.getCollection('TaxonomyTerms').find({"vocabularyId" : "57b18d746d0e81e174c6632e","text" : "35"})
Step 2 - db.getCollection('Contents').find({"text" : "Edge of the Earth Quad Adventure","typeId" : "58785c576d0e815f4014b288",})
Step 3 - edit this record

//Rezdy tour Product Code/ObjectId mapping

var cur = db.getCollection('TaxonomyTerms').find({"vocabularyId":"586df55fa0af88a741bcb6b5"});
var p = {};
while(cur.hasNext()){
    var data = cur.next();
    p[data.text]=data._id.str;
}
printjson(p);

//WordsTravel city and taxonomy region city id mapping

var locale = 'en';
var cur = db.getCollection('Contents').find({"typeId":"57ed26a06d0e810b357b23c7"}); //content type = "City"
var vocabularyId = "57b18d746d0e81e174c66328"; //region city id taxonomy vocabularyId
var result = '';
while(cur.hasNext()){
	var city = cur.next();
	var cityName = city.workspace.i18n[locale].fields.text;
	var termId = city.workspace.taxonomy[vocabularyId];
    if(termId === undefined){
        result += attractionName + ' ---> ' + 'undefined' + '\n';
    }else{
		var cur1 = db.getCollection('TaxonomyTerms').find({"_id":ObjectId(termId)});
		while(cur1.hasNext()){
			var term = cur1.next();
			result += cityName + ' ---> ' + term.text + '\n';
		}
	}
}
print(result);

//WordsTravel Attraction and taxonomy attraction id mapping

var locale = 'en';
var cur = db.getCollection('Contents').find({"typeId":"57ea19736d0e81454c7b23d2"}); //content type = "City"
var vocabularyId = "57b18d746d0e81e174c6632e"; //region city id taxonomy vocabularyId
var result = '';
var mapping = {};
while(cur.hasNext()){
    var attraction = cur.next();
    var attractionName = attraction.workspace.i18n[locale].fields.text;
        print(attractionName);
    var termId = attraction.workspace.taxonomy[vocabularyId];
        if(termId === undefined){
            result += attractionName + ' ---> ' + 'undefined' + '\n';
        }else if(!termId){
            result += attractionName + ' ---> ' + 'null or empty' + '\n';
        }else{
            if(Array.isArray(termId)){
                termId.forEach(function(item,idx){
                    var cur1 = db.getCollection('TaxonomyTerms').find({"_id":ObjectId(item)});
                    while(cur1.hasNext()){
                        var term = cur1.next();
                        mapping[term.text] = attractionName;
                    }
                });
            } else if (typeof termId === 'string'){
                if(termId){
                    var cur1 = db.getCollection('TaxonomyTerms').find({"_id":ObjectId(termId)});
                    while(cur1.hasNext()){
                        var term = cur1.next();
                        mapping[term.text] = attractionName;
                    }
                }
            }
    }
}
print(result);
print(mapping);

//WordsTravel Country and taxonomy country code mapping

var locale = 'en';
var cur = db.getCollection('Contents').find({"typeId":"57e9e2556d0e819c44dc0fc0"}); //content type = "Country"
var vocabularyId = "57b18d746d0e81e174c66322"; //country code taxonomy vocabularyId
var result = '';
while(cur.hasNext()){
	var country = cur.next();
	var countryName = country.workspace.i18n[locale].fields.text;
	var termId = country.workspace.taxonomy[vocabularyId];
    if(termId === undefined){
        result += attractionName + ' ---> ' + 'undefined' + '\n';
    }else{
        var cur1 = db.getCollection('TaxonomyTerms').find({"_id":ObjectId(termId)});
        while(cur1.hasNext()){
                var term = cur1.next();
                result += countryName + ' ---> ' + term.text + '\n';
        }
    }
}
print(result);


//Content Type - Tours, Attraction based on tours' taxonomy - attraction id  and taxonomy - Themes Mapping

var locale = 'en';
var cur = db.getCollection('Contents').find({"typeId":"58785c576d0e815f4014b288"}).toArray(); //content type = "Tours"
var vocabularyId = "57b18d746d0e81e174c6632e"; //attraction id taxonomy vocabularyId
var result = '', resultNoAttId = '';
cur.forEach(function(tour){
//while(cur.hasNext()){
    //var tour = cur.next();
    var tourName = tour.workspace.i18n[locale].fields.text;
    var termId = tour.workspace.taxonomy[vocabularyId];
    if(termId === undefined || termId === null || termId.length === 0){
        resultNoAttId += tourName + ' ---> ' + 'no taxonomy attration id' + '\n';
    }else{
        result += tourName + ' - ' + termId +'\n';
        termId.forEach(function(attIdTerm){
            var queryParam = {"typeId":"57ea19736d0e81454c7b23d2", "workspace.taxonomy.57b18d746d0e81e174c6632e" : attIdTerm}; // contentType Attraction
            var cur1 = db.getCollection('Contents').find(queryParam);
            //if(cur1.length !== 0){
                //cur1.forEach(function(attraction){
                while(cur1.hasNext()){
                    var attraction = cur1.next();
                    result += '       --- '+attIdTerm+' - '+attraction.text+'\n';
                    var themes = attraction.workspace.taxonomy['57ea19736d0e81454c7b23d0'];
                    if(themes !== undefined && themes !== null && themes.length !== 0){
                        themes.forEach(function(themesTermId){
                            var qP1 = {"_id":ObjectId(themesTermId)};
                            var cur2 = db.getCollection('TaxonomyTerms').find(qP1);
                            while(cur2.hasNext()){
                                var themesTerm = cur2.next();
                                result += '            --- '+themesTermId+' - '+themesTerm.text+'\n';
                            }
                        });
                    }
                }
                //});
            //}
        });
    }
//}
});
print(result);
print(resultNoAttId);

// list attraction with taxonomy Themes but no image

var arr = db.getCollection('Contents').find({"typeId":"57ea19736d0e81454c7b23d2"},{"text":1,"workspace.fields.image":1,"workspace.taxonomy":1}).toArray();
var vocabularyId = "57ea19736d0e81454c7b23d0"; //txnmy Themes
var termsId = [
    "57ea19746d0e81454c7b29f8",
    "57fa52016d0e817b2a5680a2",
    "588884d46d0e81b553e367bf"
];
var result = '', resultNoThemes = '';
arr.forEach(function(attraction){
    var attractionName = attraction.text;
    var attractionImage = attraction.workspace.fields.image;
    var themesExisting = false;
    var txnmyThemes = attraction.workspace.taxonomy[vocabularyId];
    if(txnmyThemes === undefined || txnmyThemes === null || txnmyThemes.length === 0){
        resultNoThemes += attractionName + ' ---> ' + 'no taxonomy Themes' + '\n';
    }else{
        txnmyThemes.forEach(function(txnmyThemesTerm){
            if(-1 !== termsId.indexOf(txnmyThemesTerm)){
                themesExisting = true;
            }
        });
        if(themesExisting){
            if(attractionImage === undefined || attractionImage === null || attractionImage.length === 0){
                result += attractionName + ' - ' + txnmyThemes +'\n';
            }
        }
    }
});
print(result);


var noImageLog = '*** Attractions without image ***\n';
var cur = db.getCollection('Contents').find({"typeId":"57ea19736d0e81454c7b23d2"});
while(cur.hasNext()){
    var data = cur.next();
    if(typeof data.workspace.fields.image === 'unfedined'){
        noImageLog += data.text + ' - ' + data.workspace.fields.CountryName + ' - ' + data.workspace.fields.CityName + ' - ' + data._id.str + '\n';
    } else if(0 === data.workspace.fields.image.length){
        noImageLog += data.text + ' - ' + data.workspace.fields.CountryName + ' - ' + data.workspace.fields.CityName + ' - ' + data._id.str + '\n';
    }
}
print(noImageLog);
