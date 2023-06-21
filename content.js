var settings = {
	"filterMethod": 1,
	"censorCharacter": "*",
	"filterToggle": true,
	"matchMethod": 0,
	"password": "null",
};
var currentDate = new Date();
var dd = currentDate.getDate();
var mm = currentDate.getMonth()+1;
var yy = currentDate.getFullYear();
var matchMethod = 0;
var profanityCount = 0;
var filterMethod,censorCharacter,filterToggle,matchMethod;
var wordRegex,stringifyObject,retrieveCount,regexpSite,node,wordRegex,websites,multMethod;
var xpathDocText = '//*[not(self::script or self::style)]/text()[normalize-space(.) != ""]';
var xpathNodeText = './/*[not(self::script or self::style)]/text()[normalize-space(.) != ""]';
var defaultWords = [];
var substituteWords = [];
var textHistory = [];
var wordDates = [];
var origin_site;

var innerBody = document.querySelectorAll('*');

console.log("UnseeIt V1.0 Ready");

// wordDates = [{date: "09/30/2018", wordHist:[{count: 1, word: "fuck"}]}];
// chrome.storage.local.set({wordDates},function(){});


function retrieveSettings(xpathDocText,node){
	chrome.storage.local.get(settings,function(settings){
		chrome.storage.local.get(['defaultWords'],function(result){
			chrome.storage.local.get(['substituteWords'],function(sub){
				chrome.storage.local.get(['websites'],function(site){
					chrome.storage.local.get(['multipleMeaning'],function(mult){
						chrome.storage.local.get(['textHistory'],function(hist){
							chrome.storage.local.get(['wordDates'],function(date){
								wordDates = date.wordDates;
								textHistory = hist.textHistory;
								defaultWords = result.defaultWords;
								substituteWords = sub.substituteWords;
								websites = site.websites;
								filterMethod = settings.filterMethod;
								censorCharacter = settings.censorCharacter;
								filterToggle = settings.filterToggle;
								matchMethod = settings.matchMethod;
								profanityCount = 0;
								origin_site = document.location.origin;
								multMethod = mult.multipleMeaning;
								if(dd<10) {dd = '0'+dd} 
								if(mm<10) {mm = '0'+mm}
								currentDate = (mm)+ "/"+ dd + "/" + yy;
								filterWords(xpathDocText,node);
							});
						});
					});
				});
			});
		});
	});
}


function loadSettings(){
	chrome.storage.local.get(settings,function(settings){
		chrome.storage.local.get(['defaultWords'],function(result){
			chrome.storage.local.get(['substituteWords'],function(sub){
				chrome.storage.local.get(['websites'],function(site){
					chrome.storage.local.get(['multipleMeaning'],function(mult){
						chrome.storage.local.get(['textHistory'],function(hist){
							chrome.storage.local.get(['wordDates'],function(date){
								wordDates = date.wordDates;
								textHistory = hist.textHistory;
								defaultWords = result.defaultWords;
								substituteWords = sub.substituteWords;
								websites = site.websites;
								filterMethod = settings.filterMethod;
								censorCharacter = settings.censorCharacter;
								filterToggle = settings.filterToggle;
								matchMethod = settings.matchMethod;
								profanityCount = 0;
								origin_site = document.location.origin;
								multMethod = mult.multipleMeaning;
								// console.log(defaultWords.length);
								// console.log(substituteWords.length);
								if(dd<10) {dd = '0'+dd} 
								if(mm<10) {mm = '0'+mm}
								currentDate = mm+ "/"+ dd + "/" + yy;
								// console.log(currentDate);  
								toggleFilter();
							});
						});
					});
				});
			});
		});
	});
}

function mutationObserver(){
	var observerConfig = {
    childList: true,
    subtree: true
  };

  // When DOM is modified, remove profanity from inserted node
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      checkNodeForProfanity(mutation);
    });
    // profanityCount++;
    // console.log(profanityCount);
  });
 // Remove profanity from new objects
  observer.observe(document, observerConfig);
}

function checkNodeForProfanity(mutation) {
  mutation.addedNodes.forEach(function(node) {
    // console.log(isForbiddenNode(node));
    if (!isForbiddenNode(node)) {
      // filterWords(xpathNodeText, node);
      retrieveSettings(xpathNodeText, node);
    }
  });
}

function isForbiddenNode(node) {
  return node.isContentEditable || // DraftJS and many others
  (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
  (node.tagName && (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
                    node.tagName.toLowerCase() == "input" ||
                    node.tagName.toLowerCase() == "script" ||
                    node.tagName.toLowerCase() == "style")
  );
}

function filterWords(xpathExpression, node){
	node = (typeof node !== 'undefined') ?  node : document;
  var evalResult = document.evaluate(
    xpathExpression,
    node,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (var i = 0; i < evalResult.snapshotLength; i++) {
    var textNode = evalResult.snapshotItem(i);
    textNode.data = replaceText(textNode.data);
  }

}

function replaceText(text){
	switch(filterMethod){
		case "0"://Censor Method
			for(var i = 0; i < defaultWords.length; i++){
				var wordRegex = globalMatchMethods(matchMethod,defaultWords[i].word);
				if(wordRegex.test(text) === true){
					text = text.replace(/<[^>]*>/g, '');
					textHistory.push({text: currentDate+" - "+text});
					if(defaultWords[i].double === true){ // if word is a double meaning
						console.log("true");
						if(multMethod === "0"){ // if multiple meaning is selected to CENSOR, automatically sensors multiple meaning word regardless of contenx
							text = text.replace(wordRegex, censorCharacter);
							profanityCount++;
							let temp = defaultWords.find(e => e.word === defaultWords[i].word);
							temp.count+=1;
							let tempDate = wordDates.find(e => e.date === currentDate);
							console.log(tempDate.date);
							if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === defaultWords[i].word); // if current date exists 
								if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: defaultWords[i].word});
									// console.log(tempWord);
								}
								else{tempWord.count+=1;
									// console.log(tempWord);
								}
							}
							else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: defaultWords[i].word}]}) // Adds new date and new set of records
								// console.log(wordDates);
							}
						}
					}
					else{
						text = text.replace(wordRegex, censorCharacter);
						profanityCount++;
						let temp = defaultWords.find(e => e.word === defaultWords[i].word);
						temp.count+=1;
						let tempDate = wordDates.find(e => e.date === currentDate);
						// console.log(tempDate);
						if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === defaultWords[i].word);
							if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: defaultWords[i].word});
								// console.log(tempWord);
							}
							else{tempWord.count+=1;
								// console.log(tempWord);
							}
						}
						else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: defaultWords[i].word}]})
							// console.log(wordDates);
						}
					}
				chrome.storage.local.set({defaultWords,wordDates,textHistory},function(){});
				}
			}
			

			break;
		case "1": //Substitute Method
			for(var i = 0; i < substituteWords.length; i++){
				var wordRegex = globalMatchMethods(matchMethod,substituteWords[i].word);
				if(wordRegex.test(text) === true){
					text = text.replace(/<[^>]*>/g, '');
					textHistory.push({text: currentDate+" - "+text});	
					if(substituteWords[i].double === true){
						if(multMethod === "0"){
							text = text.replace(wordRegex, substituteWords[i].substitute);
							profanityCount++;
							let temp = defaultWords.find(e => e.word === substituteWords[i].word);
							temp.count+=1;		
							let tempDate = wordDates.find(e => e.date === currentDate);
							// console.log(tempDate);
							if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === substituteWords[i].word);
								if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: substituteWords[i].word});
									// console.log(tempWord);
								}
								else{tempWord.count+=1;
									// console.log(tempWord);
								}
							}
							else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: substituteWords[i].word}]})
								// console.log(wordDates);
							}				
						}
					}	
					else{
						text = text.replace(wordRegex, substituteWords[i].substitute);
						profanityCount++;
						let temp = defaultWords.find(e => e.word === substituteWords[i].word);
						temp.count+=1;
						let tempDate = wordDates.find(e => e.date === currentDate);
							// console.log(tempDate);
							if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === substituteWords[i].word);
								if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: substituteWords[i].word});
									// console.log(tempWord);
								}
								else{tempWord.count+=1;
									// console.log(tempWord);
								}
							}
							else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: substituteWords[i].word}]})
								// console.log(wordDates);
							}
					}	
					chrome.storage.local.set({defaultWords,wordDates,textHistory},function(){});
				}
			}
			
			break;
		case "2": //Remove Method
			for(var i = 0; i < defaultWords.length; i++){
				var wordRegex = globalMatchMethods(matchMethod,defaultWords[i].word);
				if(wordRegex.test(text) === true){
					text = text.replace(/<[^>]*>/g, '');
					textHistory.push({text: currentDate+" - "+text});	
					if(defaultWords[i].double === true){
						if(multMethod === "0"){
							text = text.replace(wordRegex, "-");
							profanityCount++;
							let temp = defaultWords.find(e => e.word === defaultWords[i].word);
							temp.count+=1;
							let tempDate = wordDates.find(e => e.date === currentDate);
							// console.log(tempDate);
							if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === defaultWords[i].word);
								if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: defaultWords[i].word});
									// console.log(tempWord);
								}
								else{tempWord.count+=1;
									// console.log(tempWord);
								}
							}
							else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: defaultWords[i].word}]})
								// console.log(wordDates);
							}
						}
					}

					else{
						text = text.replace(wordRegex, "");
						profanityCount++;
						let temp = defaultWords.find(e => e.word === defaultWords[i].word);
						temp.count+=1;
						let tempDate = wordDates.find(e => e.date === currentDate);
						// console.log(tempDate);
						if(tempDate != undefined || tempDate.date === currentDate){let tempWord = tempDate.wordHist.find(e => e.word === defaultWords[i].word);
							if(tempWord === undefined){tempDate.wordHist.push({count: 1, word: defaultWords[i].word});
								// console.log(tempWord);
							}
							else{tempWord.count+=1;
								// console.log(tempWord);
							}
						}
						else{wordDates.push({date: currentDate, wordHist:[{count: 1, word: defaultWords[i].word}]})
							// console.log(wordDates);
						}
					}
				}
			}
			chrome.storage.local.set({defaultWords,wordDates,textHistory},function(){});

			break;
	}
	
	return text;
}

function checkWebsite(){
	console.log("checking"); 	 	
	stringifyObject = JSON.stringify(websites);
	regexpSite = new RegExp(origin_site);
	for(var i = 0;i < websites.length; i++){
		regexpSite = new RegExp(origin_site);

		//Check if site is existing 
		if(origin_site === websites[i].site){
			stringifyObject = JSON.stringify(websites);
			var replaceObject = stringifyObject.replace(websites[i].count,function(){
					retrieveCount = parseInt(websites[i].count);
					retrieveCount+=profanityCount;
					return retrieveCount.toString();
			});
			websites = JSON.parse(replaceObject);
			// console.log(websites);
			chrome.storage.local.set({websites},function(){
				websites.push(JSON.parse(replaceObject));
			});
		}
	}

	//Check if site is non-existing
	if(regexpSite.test(JSON.stringify(websites))!= true){
			addWebStatistics(origin_site,profanityCount);
	}
}

function addWebStatistics(site, profanityCount){
	var websites = [];
	chrome.storage.local.get(['websites'],function(result){
		//Pushes entire object array to a new variable array
		for(var i = 0 ; i < result.websites.length ; i++){
				websites.push(result.websites[i]);
		}
		websites.push({"site":site, "count":profanityCount.toString()}); // Push new object to array
		chrome.storage.local.set({websites},function(){  
			websites.push({"site":site, "count":profanityCount.toString()});
		});
	});
}

function checkWarningDomain(){
	var origin_site = document.location.origin;
	var wordRegex;
	chrome.storage.local.get(['warningDomains'],function(result){
		for(var i = 0; i < result.warningDomains.length; i++){
			if(origin_site === result.warningDomains[i]){ // Check if site is a Warning domain
				alert("Warning: This website contains a lot of profanity");
			}

		}
	});
}

function globalMatchMethods(matchMethod,defaultWords){
	var wordRegexMethod;
	switch(matchMethod){
		case "0"://Match Word
			wordRegexMethod = new RegExp("\\b"+defaultWords+"\\b",'gi');
			break;
		case "1"://Per Word
			wordRegexMethod = new RegExp('(' + defaultWords + ')','gi');
			break;
	}
	return wordRegexMethod;
}

function switchFilterMethods(filterMethod,text,element,wordRegex,node,word,defaultWords){
	switch(filterMethod){		
		case "0"://Censor
			censorWord(text,element,wordRegex,node,word,defaultWords);
			break;
		case "2"://Remove 
			removeWord(text,element,wordRegex,node,word,defaultWords);
			break;
	}
}

function toggleFilter(){
	if(filterToggle === true){
		filterWords(xpathDocText);
		checkWebsite();
		checkWarningDomain();
	}
	mutationObserver();
}

loadSettings();
