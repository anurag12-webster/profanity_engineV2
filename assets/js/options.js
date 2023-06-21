var currentDate = new Date();
var dd = currentDate.getDate();
var mm = currentDate.getMonth()+1;
var yy = currentDate.getFullYear();

var eventCensorChar,eventWordRankSelect,eventMatchMethod,eventFilterMethod,eventMultipleMeanMethod,htmlSite,htmlCount,htmldomain,htmlWord,htmlSubstitute;

function retrieveSettings(){
	chrome.storage.local.get(['filterMethod','matchMethod','censorCharacter','multipleMeaning','filterToggle'], function(settings){
		console.log(settings);
		var filterSelectCmb = document.getElementById('filterMethodSelect');
		var filterMethodStorage = settings.filterMethod;
		// console.log(filterMethodStorage);
		switch(filterMethodStorage){
			case "0":
				filterSelectCmb.value = filterMethodStorage;
			case "1":
				filterSelectCmb.value = filterMethodStorage;
			case "2":
				filterSelectCmb.value = filterMethodStorage;
		}
		var matchMethodCmb = document.getElementById('matchMethodSelect');
		var matchMethodStorage = settings.matchMethod;
		switch(matchMethodStorage){
			case "0":
				matchMethodCmb.value = matchMethodStorage;
			case "1":
				matchMethodCmb.value = matchMethodStorage;
		}
		var censorCharacterSelectCmb = document.getElementById('censorCharacterSelect');
		var censorCharacterSelectStorage = settings.censorCharacter;
		switch(censorCharacterSelectStorage){
			case "****":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "&&&&":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "$$$$":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "####":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "@@@@":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "^^^^":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "----":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "____":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
			case "mixed":
				censorCharacterSelectCmb.value = censorCharacterSelectStorage;
		}

		var multipleMeaningSelectCmb = document.getElementById('multipleMean');
		var multipleMeaningSelectStorage = settings.multipleMeaning;
		console.log(multipleMeaningSelectStorage);
		switch(multipleMeaningSelectStorage){
			case "0":
				multipleMeaningSelectCmb.value = multipleMeaningSelectStorage;
				console.log(multipleMeaningSelectCmb.value);
			case "1":
				multipleMeaningSelectCmb.value = multipleMeaningSelectStorage;
				console.log(multipleMeaningSelectCmb.value);
		}	
	});
	
	
}

function sortSites(){
	chrome.storage.local.get(['websites'],function(result){
		chrome.storage.local.get(['substituteWords'],function(sub){
			chrome.storage.local.get(['defaultWords'],function(words){
				chrome.storage.local.get(['wordDates'],function(date){
					var sort_by = function(field, reverse, primer){
					var key = primer ? 
				       function(x) {return primer(x[field])} : 
				       function(x) {return x[field]};
						reverse = !reverse ? 1 : -1;
						return function (a, b) {
					       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
					     } 
					}

					// Sort website rank
					var unsorted = result.websites;
					for(var i = 0; i < result.websites.length; i++){
						if(result.websites[i].count === "0"){
							delete result.websites[i];
							unsorted = result.websites;
							unsorted = unsorted.filter(function(x){
		  					return (x !== (undefined || null || ''));
		  					});
		  					console.log("Site deleted");
						}
					}
					var websites = unsorted.sort(sort_by('count', true, parseInt));
					
					//Sort word rank
					var unsorted_words = words.defaultWords;
					var defaultWords = unsorted_words.sort(sort_by('count',true, parseInt));

					//Word List A-Z
					var substituteWords = sub.substituteWords;
					substituteWords = substituteWords.sort(function(a, b){
						if(a.word > b.word) return 1;
						if(a.word < b.word) return -1;
						return 0;
					});

					for(var i = 0; i < date.wordDates.length;i++){
						var unsorted_date = date.wordDates[i].wordHist;
						var wordDates = unsorted_date.sort(sort_by('count',true,parseInt));
					}
					wordDates = date.wordDates;


					chrome.storage.local.set({defaultWords,substituteWords,websites,wordDates},function(){
						console.log("Words sorted");});
				});
			});
		});
	});
	populateDates()
	populateWebsiteTable();
	populateWordRankTable();
	populateWordTable();
	populateTextHistory();
	populateWarningDomains();
}

function populateWordRankTable(){
	chrome.storage.local.get(['defaultWords'],function(result){
		var table = document.getElementById('wordCounts');

		for(var i = 0 ; i < result.defaultWords.length ; i++){
			var defaultWords = result.defaultWords[i];
			var row = document.createElement('tr');
			var properties = ['word','count'];

			for(var k = 0; k < properties.length ; k++){
				var cell = document.createElement('td');
				cell.innerHTML = defaultWords[properties[k]];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
	});
}

function populateWordTable(){
	chrome.storage.local.get(['substituteWords'],function(sub){
		var table = document.getElementById('wordAndSubstitute');

		for(var i = 0; i < sub.substituteWords.length ; i++){
			var substitute = sub.substituteWords[i];
			var row = document.createElement('tr');
			var properties = ['word','substitute'];

			for(var k = 0; k < properties.length ; k++){
				var cell = document.createElement('td');
				cell.innerHTML = substitute[properties[k]];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
	});
	
}

function populateWebsiteTable(){
	chrome.storage.local.get(['websites'],function(result){
		var table = document.getElementById('siteAndCount');
		
		for(var i = 0; i < result.websites.length ; i++){
			var websites = result.websites[i];
			var row = document.createElement('tr');
			var properties = ['site','count'];

			for(var k = 0; k < properties.length; k++){
				var cell = document.createElement('td');
				cell.innerHTML = websites[properties[k]];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}	
	}); 
}

function populateDates(){
	var select = document.getElementById('dateSelect');
	var option = document.createElement('option');
	var options = [];
	chrome.storage.local.get(['wordDates'],function(date){
		for(var i = 0; i < date.wordDates.length; i++){
			console.log(date.wordDates[i].date);
			option.text = option.value = date.wordDates[i].date;
			options.push(option.outerHTML);
		}
		select.insertAdjacentHTML('beforeEnd', options.join('\n'));
	});
}

function populateDailyWords(event){
	var tb = document.getElementById('loggedWords');
	console.log(tb);
	while(tb.rows.length > 1) {tb.deleteRow(1);
	  console.log("row deleted");
	}
	chrome.storage.local.get(['wordDates'],function(words){
		var table = document.getElementById('loggedWords');
		var date = event.target.value;
		var wordDates = words.wordDates;
		var index = wordDates.findIndex(x => x.date === date);

		for(var i = 0 ; i < wordDates[index].wordHist.length; i++){
			var words = wordDates[index].wordHist[i];
			var row = document.createElement('tr');
			var properties = ['word','count'];
			for(var k = 0; k < properties.length; k++){
				var cell = document.createElement('td');
				cell.innerHTML = words[properties[k]];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
	});
}

function populateWarningDomains(){
	var select = document.getElementById('domainSelect');
	var option = document.createElement('option');
	var options = [];
	chrome.storage.local.get(['warningDomains'],function(domain){
		for(var i = 0 ; i < domain.warningDomains.length ; i++){
			console.log(domain.warningDomains[i]);
			option.text = option.value = domain.warningDomains[i];
			options.push(option.outerHTML);
		}
		select.insertAdjacentHTML('beforeEnd', options.join('\n'));
	});
}

function populateTextHistory(){
	var table = document.getElementById('history');
	chrome.storage.local.get(['textHistory'],function(hist){
		for(var i = 0; i < hist.textHistory.length ; i++){
			var history = hist.textHistory[i];
			var row = document.createElement('tr');
			var properties = ['text'];

			for(var k = 0; k < properties.length; k++){
				var cell = document.createElement('td');
				cell.innerHTML = history[properties[k]];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}	
	});
}

function wordRankSelect(event){
	eventWordRankSelect = event.target.value; 
	if(eventWordRankSelect === "0"){
		document.getElementById('totalWords').style.display = "block";
		document.getElementById('dailyWords').style.display = "none";
	}
	else if(eventWordRankSelect === "1"){
		document.getElementById('totalWords').style.display = "none";
		document.getElementById('dailyWords').style.display = "block";
	}

}

function multipleMeaningSelect(event){
	eventMultipleMeanMethod = event.target.value;
}

function filterMethodSelect(event){
   eventFilterMethod = event.target.value;
}

function filterMethod(){
  chrome.storage.local.get(['filterMethod'], function(word){
      console.log(word.filterMethod);
  });
}

function censorCharacterSelect(event){
	eventCensorChar = event.target.value;
}

function matchMethodSelect(event){
	eventMatchMethod = event.target.value
}

function saveSettings(event){
	var saveSettings = {
		"censorCharacter": eventCensorChar,
		"filterMethod": eventFilterMethod,
		"matchMethod": eventMatchMethod,
		"multipleMeaning": eventMultipleMeanMethod
	}

	chrome.storage.local.set(saveSettings,function(){
		var htmlSave = "Settings saved";
		document.getElementById('saveNotif').innerHTML = htmlSave;
		// chrome.tabs.reload();
		chrome.tabs.query({windowType:'normal'}, function(tabs) {
		    for(var i = 0; i < tabs.length; i++) {
		        chrome.tabs.update(tabs[i].id, {url: tabs[i].url});
		    }
		}); 
	});
	
}

function addDomain(event){
	var domain = document.getElementById('domainText').value;
	var regexpDomain = new RegExp(domain,'gi'); 
	var warningDomains;
	var stringifyDomains;
	var htmlNotif;
	chrome.storage.local.get(['warningDomains'],function(domains){
		warningDomains = domains.warningDomains;
		stringifyDomains = JSON.stringify(warningDomains);
		if(regexpDomain.test(stringifyDomains) === true){
			htmlNotif ='Site already a warning domain';
			console.log(htmlNotif);   
			document.getElementById('addNotif').innerHTML = htmlNotif;
		}

		else{
			warningDomains.push(domain);
			chrome.storage.local.set({warningDomains},function(result){
				htmlNotif ='Warning domain added';
				document.getElementById('addNotif').innerHTML = htmlNotif;
			});
			sortSites();
			chrome.tabs.reload();
		}
	});
}
     
function removeDomain(event){
	var selectDomain = document.getElementById('domainSelect').value;
	var warningDomains;
	var htmlNotif;
	chrome.storage.local.get(['warningDomains'],function(domain){
		for(var i = 0;i < domain.warningDomains.length;i++){
			if(selectDomain === domain.warningDomains[i]){
				delete domain.warningDomains[i];
				warningDomains = domain.warningDomains;
				warningDomains = warningDomains.filter(function(x){
  					return (x !== (undefined || null || ''));
  				});
				console.log(JSON.stringify(warningDomains));
				chrome.storage.local.set({warningDomains},function(){
					htmlNotif = "Warning domain removed";
					document.getElementById('notifRemove').innerHTML = htmlNotif;
					chrome.tabs.reload();
				}); 
			}

			else{
				htmlNotif = "Warning domain non existent";
				document.getElementById('notifRemove').innerHTML = htmlNotif;
			}
		}
	});
}

function addWord(event){
	var word = document.getElementById('addWords').value;
	var substitute = document.getElementById('substitute').value;
	var double = document.getElementById('doubleWord').value;
	var regExpWord = new RegExp("\\b"+word+"\\b",'i');
	var stringifyWord;
	var defaultWords;
	var substituteWords;
	var htmlNotif;
	chrome.storage.local.get(['defaultWords'],function(result){
		chrome.storage.local.get(['substituteWords'],function(sub){
			defaultWords = result.defaultWords;
			substituteWords = sub.substituteWords;

			stringifyWord = JSON.stringify(defaultWords);

			if(word === "" || substitute === "" || double === "--Multiple Meaning--"){
				htmlNotif = "Specify word and its substitute word and identify if it has multiple meanings";
				document.getElementById('addNotif').innerHTML = htmlNotif;
			}

			else if(regExpWord.test(stringifyWord) === true){
				htmlNotif = "Word already added";
				document.getElementById('addNotif').innerHTML = htmlNotif;
			}

			else{
				defaultWords.push({"count": 0, "word": word, "double":double});
				substituteWords.push({"substitute": "["+substitute+"]","word": word, "double": double});
				console.log(substituteWords);
				chrome.storage.local.set({defaultWords,substituteWords},function(){
					htmlNotif = "Word added";
					document.getElementById('addNotif').innerHTML = htmlNotif;
				});

				sortSites();
				chrome.tabs.reload();

			}
		});
		
	});
}

function removeWord(event){
	var selectWord = document.getElementById('removeWord').value;
	var defaultWords;
	var substituteWords;
	var htmlNotif;
	chrome.storage.local.get(['defaultWords'],function(result){
		chrome.storage.local.get(['substituteWords'],function(sub){
			for(var i = 0; i < result.defaultWords.length; i++){
				if(selectWord === ""){
					htmlNotif = "Type a word from the dictionary to remove!";
					document.getElementById('removeNotif').innerHTML = htmlNotif;
				}

				else if(selectWord === result.defaultWords[i].word){
					delete result.defaultWords[i];
					defaultWords = result.defaultWords;
					defaultWords = defaultWords.filter(function(x){
  					return (x !== (undefined || null || ''));
  					});
  					
  					for(var j = 0; j < sub.substituteWords.length; j++){
  						if(selectWord === sub.substituteWords[j].word){
  							delete sub.substituteWords[j];
  							substituteWords = sub.substituteWords;
  							substituteWords = substituteWords.filter(function(x){
							return (x !== (undefined || null || ''));
							});

							chrome.storage.local.set({defaultWords},function(){
								chrome.storage.local.set({substituteWords},function(){
									htmlNotif = "Word removed";
									document.getElementById('removeNotif').innerHTML = htmlNotif;
									sortSites();
									chrome.tabs.reload();
								});
							});
  						}
  					}
				}

				else{
					htmlNotif = "Word does not exist";
					document.getElementById('removeNotif').innerHTML = htmlNotif;
				}
  			}	
  		});
	});
}

function clearHistory(event){
	var textHistory = [];
	chrome.storage.local.set({textHistory},function(){
		var html = "History Cleared"
		document.getElementById('notifHistory').innerHTML = html;
	});
	chrome.tabs.reload();
}

function openTab(event) {
  if ( event.currentTarget.className.indexOf('active') >= 0) {
    return false;
  }

  var oldTab = document.getElementsByClassName("tablinks active")[0];
  deactivate(oldTab);
  activate(event.currentTarget);

  oldTabContent = document.getElementsByClassName("tabcontent visible")[0];
  hide(oldTabContent);
  newTabName = event.currentTarget.innerText;
  show(document.getElementById(newTabName));
}

function show(element) {
  element.classList.remove('hidden');
  element.classList.add('visible');
}

function hide(element){
	element.classList.remove('visible');
	element.classList.add('hidden');
}

function activate(element){
	element.classList.add('active');
}

function deactivate(element){
	element.classList.remove('active');
}

var tabs = document.getElementsByClassName('tablinks');
for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', function(e) { openTab(e); });
}

sortSites();
retrieveSettings();

//Listeners 
document.getElementById('dateSelect').addEventListener('change',populateDailyWords);
document.getElementById('wordRankSelect').addEventListener('change',wordRankSelect);
document.getElementById('clearHistory').addEventListener('click',clearHistory); 
document.getElementById('multipleMean').addEventListener('change',multipleMeaningSelect);
document.getElementById('btnRemove').addEventListener('click',removeWord);
document.getElementById('btnAdd').addEventListener('click',addWord);
document.getElementById('domainRemove').addEventListener('click',removeDomain);
document.getElementById('domainAdd').addEventListener('click',addDomain);
document.getElementById('btnSave').addEventListener('click',saveSettings);
document.getElementById('matchMethodSelect').addEventListener('change',matchMethodSelect);
document.getElementById('censorCharacterSelect').addEventListener('change',censorCharacterSelect);
document.getElementById('filterMethodSelect').addEventListener('change', filterMethodSelect);