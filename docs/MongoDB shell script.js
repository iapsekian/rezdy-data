MongoDB shell script

//Add "Rezdy" to the fields - marketplace
var clt = db.getCollection('Contents');
var cur = clt.find({"typeId":"58785c576d0e815f4014b288"});
while(cur.hasNext()){
    var data = cur.next();
    
    data.detailsTypeId = "587866b06d0e810d4114b288";
    data.workspace.fields.marketplace = "Rezdy";
    data.live.fields.marketplace = "Rezdy";
    try{
        var result = clt.updateOne(
        {"_id": data._id},
        {$set: data}
        );
        print('Tour - ' + data.text +' UPDATED! - modifiedCount = ' + result.modifiedCount);
    } catch(e){
        print('Exception Happened during updating!! - ' + e);
    }
}

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

 // MongoDB備份資料庫

mongodump -h 127.0.0.1 -d tourbooks -o /root/backup/mongodb-dump/$file

// # MongoDB中為所有document增加欄位及值的方式
db.Contents.update({"typeId": "55a7860886c74797668b4568"},{$set:{
                                                                   "workspace.fields.icon_poi_intro_48": "565e51d66d0e81bc12c8871b",
                                                                   "workspace.fields.icon_tel_48": "565e51d66d0e81bc12c88725",
                                                                       "workspace.fields.icon_addr": "565e51d66d0e81bc12c88720",
                                                                       "workspace.fields.icon_url": "565e51d76d0e81bc12c8872f",
                                                                    "workspace.fields.icon_biz_hour": "565e51d76d0e81bc12c8872a",
                                                                       "workspace.fields.icon_transportation": "565e51d56d0e81bc12c88711",
                                                                       "workspace.fields.icon_expense": "565e51d66d0e81bc12c88716",
                                                                     "live.fields.icon_poi_intro_48": "565e51d66d0e81bc12c8871b",
                                                                       "live.fields.icon_tel_48": "565e51d66d0e81bc12c88725",
                                                                       "live.fields.icon_addr": "565e51d66d0e81bc12c88720",
                                                                       "live.fields.icon_url": "565e51d76d0e81bc12c8872f",
                                                                       "live.fields.icon_biz_hour": "565e51d76d0e81bc12c8872a",
                                                                       "live.fields.icon_transportation": "565e51d56d0e81bc12c88711",
                                                                       "live.fields.icon_expense": "565e51d66d0e81bc12c88716"}},{multi:true})


#查詢某個content type的某個欄位是否有值
db.Contents.find({"typeId":"5672639c6d0e810d0a8b4574","workspace.i18n.en.fields.state": {$ne:  ""} })

#查詢某個content type的某個taxonomy是否不存在
db.Contents.find(
                    {    "typeId":"56610ec06d0e814236cdc87d",
                        "workspace.taxonomy.55a4d43686c7478d768b4584": {$exists: false} 
                    }
                )

#對某個typeID不存在的taxonomy設定值

db.Contents.update(    {    "typeId":"56610ec06d0e814236cdc87d",
                        "workspace.taxonomy.55a4d43686c7478d768b4584": {$exists: false} 
                    },
                     {$set:    {
                                 "workspace.taxonomy.55a4d43686c7478d768b4584": ["55a4d4b286c7478b768b457c"],
                                 "live.taxonomy.55a4d43686c7478d768b4584": ["55a4d4b286c7478b768b457c"]
                               }
                       },
                       {
                           multi:true
                       }
                    )

db.Contents.update(    {    "typeId":"55f2a6e686c747ed418b4568"
                    },
                     {$set:    {
                                 "workspace.taxonomy.55a4d43686c7478d768b4584": ["567a305b6d0e81de368b4567","567a32a76d0e8155378b4567"],
                                 "live.taxonomy.55a4d43686c7478d768b4584": ["567a305b6d0e81de368b4567","567a32a76d0e8155378b4567"]
                               }
                       },
                       {
                           multi:true
                       }
                    ) 

#陣列的操作                    
#替一個已存在的array增加一個值
db.Contents.update(    {    "typeId":"55f2a6e686c747ed418b4568",
                        "workspace.taxonomy.55a4d43686c7478d768b4584": {$exists: true} 
                    },
                     {    $push:    {
                                 "workspace.taxonomy.55a4d43686c7478d768b4584": "567a305b6d0e81de368b4567",
                                 "live.taxonomy.55a4d43686c7478d768b4584": "567a305b6d0e81de368b4567"
                               }
                       },
                       {    multi:true
                       }
                    )


db.Contents.update(    {    "typeId":"55a4ab5e86c7479f758b45a2",
                    },
                     {$push:    {
                                 "workspace.taxonomy.55a4d43686c7478d768b4584": {$each:["567a305b6d0e81de368b4567","55a4d4c686c747af768b4585"]},
                                 "live.taxonomy.55a4d43686c7478d768b4584": {$each:["567a305b6d0e81de368b4567","55a4d4c686c747af768b4585"]}
                               }
                       },
                       {
                           multi:true
                       }
                    ) 

db.Contents.update(    {    "typeId":"55a4ab5e86c7479f758b459e",
                    },
                     {$push:    {
                                 "workspace.taxonomy.55a4d43686c7478d768b4584": {$each:["567a31196d0e811b378b4567"]},
                                 "live.taxonomy.55a4d43686c7478d768b4584": {$each:["567a31196d0e811b378b4567"]}
                               }
                       },
                       {
                           multi:true
                       }
                    )

#為資料新增語系資料前，需要直接操作DB，預先新增語系記錄，然後使用標準import功能中的update，將新語系資料匯入（以下操作是進入工具程式以交談方式執行）
var coll = db.getCollection("Contents");
var cur = coll.find({"typeId":"5672639c6d0e810d0a8b4574"});
while(cur.hasNext()){
    var data = cur.next();
    var id = data._id;
    var fields = data.workspace.i18n.en.fields;
    coll.update(
        {_id:id},
        {$set:{"workspace.i18n.zh-TW.fields":fields,
               "workspace.i18n.zh-TW.locale":"zh-TW"}}
    );
}                    


