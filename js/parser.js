var greatNounList;
var conceptList;
var tmpCache = [];
var sendCuestoConceptTagging = function(text){
	//console.log(text);
	$.ajax({
		type: 'post',
		url: 'php/parser.php',
		// The first parser's name: AYLIEN
		//The second parser's name: AlchemyApi
		data: {'name':'Concepts','text':text, 'API':'AlchemyApi'},
		dataType: 'json',
		success: function(response) {
			conceptList = response.concepts;
			//Below is for AYLIEN
			// for(var i = 0; i < conceptList.length; i++){
			// 	document.getElementById("keyconcepts").innerHTML += ('<a target=\"_blank\" href=' + conceptList[i].url +'>'+ conceptList[i].concept.string +'</a>');
			// }
			//----------------------------------------------------------------------
			//Below is for AlchemyApi
			for(var i = 0; i < conceptList.length; i++){
				document.getElementById("keyconcepts").innerHTML += ('<a target=\"_blank\" href=' + conceptList[i].dbpedia +'>'+ conceptList[i].text +'</a>');
			}
			console.log(response);
		},
		error:function(error){
			console.log(error);
		}
	});
};
var passDragTextToNode = function (text) {
	var localJson = [];
	var myTrack = document.getElementsByTagName("track")[0].track; // get text track from track element
    var myCues = myTrack.cues;   // get list of cues 
    var videoTime = [];
    for(var i = 0; i < myCues.length; i++){
    	if(myCues[i].getCueAsHTML().textContent.search(new RegExp(text, "i")) != -1){
    		videoTime.push({"startTime": myCues[i].startTime,"endTime":myCues[i].endTime});
    	}
    }
	localJson.push({"word": text, "frequency": videoTime.length, "video":videoTime, "isSubtitle": true});
	console.log(localJson);
	AddConcept(JSON.stringify(localJson));

};
var localTextParsing = function(subtitle, startTime, endTime){
	var punctuationless = (subtitle.trim()).replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '');
	var cleanString = punctuationless.replace(/\s{2,}/g, " ");
	var words = cleanString.split(" ");
	var localJson = [];
	words.forEach(function (wordValue, wordIndex) {
		var isExisted = false;
		var tmp = wordValue.trim();
		tmp = tmp.toLowerCase();
		localJson.forEach(function (JsonValue, JsonIndex) {
			//Check this word has already been stored into localJson
		    if (JsonValue.word.toLowerCase() == tmp) {
		        isExisted = true;
				return; //Return out of the loop when this tmp has appeared before.
		    }
		});

		if (!isExisted) {
			//Check if this word has appeared in the tmp Cache: either is noun or not.
			//The tmp cache is to speed up the look-up process.
		    var isNoun = false;
		    for (var i = 0; i < tmpCache.length; i++) {
		        if (tmp == tmpCache[i].word){
		            isNoun = tmpCache[i].isNoun;
		            break;
		        }
		    }
		    if (isNoun) {
		        localJson.push({ "word": tmp, "frequency": 1, "isSubtitle": true, "video": [{"startTime": startTime,"endTime":endTime}]});
		    }
		    else {
		        var isNewNoun = false;
		        for (var i = 0; i < greatNounList.length; i++) {
		        	if(greatNounList[i].length >= 2 && greatNounList[i].substring(0,2) == "//") continue;
		        	//This is the one word per line checking:
		            // if (greatNounList[i].toLowerCase() == tmp.toLowerCase()) {
		            //     localJson.push({ "word": tmp, "frequency": 1, "video": [{"startTime": startTime,"endTime":endTime}]});
		            //     tmpCache.push({ "word": tmp, "isNoun": true });
		            //     isNewNoun = true;
		            //     break;
		            // }

		            //********************************
		            //This is the multiple words per line checking:
		            var multiTerms = greatNounList[i].split(" ");
		            multiTerms.forEach(function(multiTermsItem){
						if(multiTermsItem.toLowerCase() == tmp)
						{
							isNewNoun = true;
						}
		            });
		            if(isNewNoun){
		      		    localJson.push({ "word": multiTerms[0], "frequency": 1, "isSubtitle": true, "video": [{"startTime": startTime,"endTime":endTime}]});
		                tmpCache.push({ "word": multiTerms[0].toLowerCase(), "isNoun": true });
		                break;
		            }
		        }
		        if (!isNewNoun) {
		            tmpCache.push({ "word": tmp, "isNoun": false });
		        }
		    }
		}
	});
    AddConcept(JSON.stringify(localJson));
};