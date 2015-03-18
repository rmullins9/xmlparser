
// *******************  INITIALIZE VARIABLES ******************** \\
//http://oac1blogging.prod.ohioauto.com/newscenter/?feed=rss2

var newscenterRSSURL = "proxy/Proxy.aspx?u=http%3a%2f%2foac1blogging.prod.ohioauto.com/newscenter/%3ffeed%3drss2";

var eventFeedRSSURL = "proxy/Proxy.aspx?u=http%3a%2f%2foac1blogging.prod.ohioauto.com/newscenter/%3ffeed%3drss2";

var prBlogURL = "proxy/Proxy.aspx?u=http%3a%2f%2fconversations.ohio.aaa.com/feed/";



var headlineWriter = "WriteHeadlineNews";
var editorialWriter = "WriteEditorialNews";
var eventFeedWriter = "WriteEventFeed";


var xhr = new Array();
var c=0; //xhr counter

var catTitle = new Array();
var catDesc = new Array();

var cNf;

// *******************  DEFINE PROTOTYPES ******************** \\
function  Article() {
	this.title;
	this.excerpt;
	this.cat_name;
	this.pub_date;
	this.post_link;
	this.img_HTML;
	this.comments;
}

function Event() {
	this.title;
	this.event_link;
	this.pub_date;
	this.color;
	this.category;
}

// ******************* SUPPORT FUNCTIONS ******************** \\


var offset = new Date().getTimezoneOffset(); 

var monthName = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];


function localizeDateTime(t) {
//Accepts DateTime and returns new DateTime with timezone offset
	var dt = new Date(t);
	var localDT = dt - offset; //adjusts the Datetime according to the global offset variable
	var nDT = new Date((localDT+6000));
	//alert (nDT.getHours());
	return nDT;
}

function twelveHourTime(hh,mm) {
// Accepts Hours and Minutes and returns timestamp like, "1:30pm"
	if (hh >= 12) { 
		hh = hh - 12;
		var ampm = "pm";
	} else {
		var ampm = "am";
	}
	//add extra 0 to minute if one digit
	if (mm < 1) {
		mm = mm+"0";
	}
	//if hour is 00, change to 12
	if (hh < 1) { 
		hh = 12;
	}
	var nT = hh+":"+mm+ampm;
	return nT;
}

function publishedToday (t) {
	// accepts date string like
	// checks if the date is the same as today and returs true or false
		var dt = new Date(t);
		var today = new Date();
		
		if (dt.toDateString() == today.toDateString()) {
			return true;
		} else {
			return false;
		}	
}

function publishedYesterday (t) {
	// accepts date string like
	// checks if the date is the same as today and returs true or false
		var dt = new Date(t);
		var today = new Date();
		var yesterday = new Date();
		yesterday.setDate(today.getDate()-1);
		
		if (dt.toDateString() == yesterday.toDateString()) {
			return true;
		} else {
			return false;
		}	
}
	
function getHoursDiff (t) {
	// accepts date string and returns the number of hours between it and right now
		var dt = new Date(t);
		var today = new Date();
	
		var hoursDiff = today.getHours() - dt.getHours();
		
		if (hoursDiff == 1) {
			var hoursDiffText = hoursDiff +" hour ago";
		} else if (hoursDiff == 0) {
			var hoursDiffText = "Just posted";
		} else {
			var hoursDiffText = hoursDiff +" hours ago";
		}
		
		return hoursDiffText;
}

function DTgetShortMonth(t) {
// Accepts a datetime string like "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns the month abbreviation "Feb"
	var dt = new Date(t);
	var nDT = monthName[dt.getMonth()];
	return nDT;
}
function DTgetDate(t) {
// Accepts a datetime string like "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns the date as a number "20"
	dt = new Date(t);
	nDT = dt.getDate();
	return nDT;
}
function DTgetTime(t) {
// Used for Event Listing
// Accepts string "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns "9:05pm"
	var dt = new Date(t);
	dt = localizeDateTime(dt);
	var nT = twelveHourTime(dt.getHours(), dt.getMinutes()); // creates new Timestamp in 12 hour format "nT"
	return nT;
}

function DTFormat1(t) {
// Used for Headline News and Editorial News
// Accepts string "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns Feb 20, 2014
	var dt = new Date(t);
	var nDT = monthName[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
	return nDT;
}

function DTFormat2(t) {
// Used for Event Listing
// Accepts string "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns "Feb 20, 2014 - 9:05pm"
	var dt = new Date(t);
	dt = localizeDateTime(dt);
	var nT = twelveHourTime(dt.getHours(), dt.getMinutes()); // creates new Timestamp in 12 hour format "nT"
	var nD = monthName[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear(); // build new Date string "nD"
	var nDT = nD + " - " + nT
	return nDT;
}

function DTFormat3(t) {
// Used for Alerts
// Accepts string "Thu, 20 Feb 2014 21:05:28 +0000"
// Returns "9:05pm"
	var dt = new Date(t);
	dt = localizeDateTime(dt);
	var nT = twelveHourTime(dt.getHours(), dt.getMinutes()); // creates new Timestamp in 12 hour format "nT"
	return nT;
}






// *******************  GET RSS FEED ******************** \\
//c: unique instance of the xhr so that requests don't get mixed up
//url: the rss url to call
//writer: is the function to call AFTER the parseRSS function. the writer function is responsible for writing the data to the screen

/*

getRSS(3, 'news', newscenterRSSURL + '%26cat=3', editorialWriter, 'y');activeClass('cat3');

c = 3 (unique request)
type = news
url = newscenterRSSURL?cat=3 (builds the URL)
writer = editorialWriter (which screen writer function to use)
cNf = y (Flag: Did the user specifically ask for a category? If yes, then get and display the category description, and force cat name)


*/
function getRSS(c, type, url, writer, cNf) 
{
	if (window.XMLHttpRequest) {
		xhr[c] = new XMLHttpRequest();
		xhr[c].onreadystatechange = parseRSS(c, type, writer, cNf);
		xhr[c].open("GET", url, true);
		xhr[c].send(null);		
	}
	else
	 if (window.ActiveXObject)  {
		xhr[c] = new ActiveXObject("Microsoft.XMLHTTP");
			if (xhr[c])
			{
				xhr[c].onreadystatechange = parseRSS(c, type, writer, cNf);
				xhr[c].open("GET", url, true);
				xhr[c].send();
			}
	  }
}


// *******************  PARSE RSS ******************** \\
function parseRSS(d, type, writer, cNf)
{
	return function() {
	if (xhr[d].readyState == 4) {
	  if (xhr[d].status == 200) {
		var rssItems = xhr[d].responseXML.getElementsByTagName('item');
		
		//if this is an event, process and break;
		switch (type) {
		
			case "news":
				//If we asked for a category name, map it. For editorial news.
				if (cNf == 'y') {
					//alert(cNf);
					catTitle[d] = xhr[d].responseXML.getElementsByTagName('title')[0].firstChild.nodeValue;
					try {
						catDesc[d] = xhr[d].responseXML.getElementsByTagName('category_desc')[0].firstChild.nodeValue;
					} catch (err) {
						catDesc[d] = "";
					}
				}
				
				article = new Array();
			
				for (x=0; x<=rssItems.length-1; x++) {
					article[x] = new Article();
					
					article[x].title = rssItems[x].getElementsByTagName('title')[0].firstChild.nodeValue;
					
					article[x].cat_name = rssItems[x].getElementsByTagName('category')[0].firstChild.nodeValue;
					article[x].excerpt = rssItems[x].getElementsByTagName('description')[0].firstChild.nodeValue;
					article[x].pub_date = rssItems[x].getElementsByTagName('pubDate')[0].firstChild.nodeValue;
					
					if (jQuery.browser.msie) {
						article[x].comments = rssItems[x].getElementsByTagName('slash:comments')[0].firstChild.nodeValue;
					} else {					
						article[x].comments = rssItems[x].getElementsByTagNameNS("http://purl.org/rss/1.0/modules/slash/", "comments")[0].firstChild.nodeValue; 
					}
					
					if (article[x].comments == 1) {
						article[x].comments = "<span class='comments'>"+ article[x].comments+"</span> Comment";
					} else {
						article[x].comments = "<span class='comments'>"+ article[x].comments+"</span> Comments";
					}
					
					
					// if a bypass link was configured for the post, use that.
					var tmp_link="";
					try {
						article[x].post_link = rssItems[x].getElementsByTagName('NewsCenterBypassLink')[0].firstChild.nodeValue;
					} catch (err) {
						article[x].post_link = rssItems[x].getElementsByTagName('link')[0].firstChild.nodeValue;
					}
					
					
					//if there is no image set, it throws errors
					try {
						article[x].img_HTML = rssItems[x].getElementsByTagName('image')[0].firstChild.nodeValue;
					} catch (err) {
						article[x].img_HTML = 'false';
					}
					
					//Format the Date
					//article[x].pub_date = formatDate(article[x].pub_date); 
				}  

			break;

			case "events":
			
				evt = new Array();
				
				for (x=0; x<=rssItems.length-1; x++) {
					evt[x] = new Event();
					evt[x].title = rssItems[x].getElementsByTagName('title')[0].firstChild.nodeValue;
					evt[x].event_link = rssItems[x].getElementsByTagName('link')[0].firstChild.nodeValue;
					evt[x].pub_date = rssItems[x].getElementsByTagName('pubDate')[0].firstChild.nodeValue;
					
					try {
						evt[x].category = rssItems[x].getElementsByTagName('categoryname')[0].firstChild.nodeValue + " Event";
						evt[x].color = rssItems[x].getElementsByTagName('color')[0].firstChild.nodeValue;
					} catch (e) {
					 //do something default when no category names
						evt[x].category = "Uncategorized Event";
						evt[x].color = "#666666";
					}
					//Format the Date
					//evt[x].pub_date = formatDateTime1(evt[x].pub_date);
				}
			
			
			break;
			default:
				alert("No writer specified");
		}
		
		//Send the Article object to the specified screen writing function
		switch (writer){
		case "WriteHeadlineNews": 
			WriteHeadlineNews(article);
			//WriteEditorialNews(article);
			break;
		case "WriteEditorialNews": 
			WriteEditorialNews(article, catTitle[d], catDesc[d], d);
			break;
		case "WriteEventFeed":
			WriteEventFeed(evt);
			break;
		case "WriteActiveAlerts":
			WriteActiveAlerts(article);
			break;
		case "WritePRNews":
			WritePRNews(article);
			break;
		default:
			alert("No writer specified");
		}
		
		//delete rssItems;

		

	  } else {
		  var alertmessage = "<div id='alertbox' style='100%; height:220px; background:#FFF;'><div style='padding:30px;'><table><tr><td valign='top'  width='20%'><img src='img/alert.png' /></td><td width='80%'><div class='alert-bold'>The data is taking longer than usual to retrieve, please check back later.</div></td></tr></table></div></div>"
		  document.getElementById('loading').innerHTML = alertmessage;
      }
	}
}
}
	  
	  
	  
	  
	  
// *******************  FUNCTIONS TO WRITE TO SCREEN ******************** \\







function WriteActiveAlerts(a) {

	var alertDiv = document.getElementById('alerts');
	
	// if we have alerts, create the h2 header, if not, clear the innerHTML
	if (typeof a[0] === 'undefined') {
		alertDiv.innerHTML = "";
	} else {
		alertDiv.innerHTML = "<h2>New Alerts</h2>";
	}
	
	for (x=0; x<2; x++){ 
		if (a[x]) {
			var alert = sn_activeAlerts(a[x]);
			alertDiv.innerHTML += alert;
		}
	}
}


function WriteEventFeed (evt) {

	var evtFeedDiv = document.getElementById('event-feed');
	evtFeedDiv.innerHTML = "";
	
	for (x=0; x<10; x++){ 
		if (evt[x]) {
			var event = sn_eventFeed(evt[x]);
			evtFeedDiv.innerHTML += event;
		}
	}
}




//function to write headline news to screen
function WriteHeadlineNews(article) {
	var thumbDiv = document.getElementById('headline-thumbs');
	var headlineDiv = document.getElementById('headline-post');
	thumbDiv.innerHTML = "";
	headlineDiv.innerHTML= "";
	//only grab first 4 articles
	for (x=0; x<=3; x++){
		//alert("headline: Iteration("+x+")  "+article[x].title);
		if (article[x].img_HTML != 'false'){ // only display article if it has an image
			var thumb = sn_headlineNewsThumb(article[x], x+1);
			thumbDiv.innerHTML += thumb;
			var headline = sn_headlineNewsBanner(article[x], x+1);
			headlineDiv.innerHTML += headline;	
		}
	}
	rotateHeadlineNews(); // initialize jquery news rotator
}

function WritePRNews(a) {
	var editorialDiv = document.getElementById('editorial-articles');
		editorialDiv.innerHTML = "";

	var prCatName = "OAC PR Newsroom"
		for (x=0; x<6; x++){ 
			if (a[x]) {
			
				var ts = a[x].excerpt;
				a[x].excerpt = ts.substring(0,140);
				//a.excerpt = a.excerpt.substring(0,140);

				var editorial = sn_editorialNews(a[x], prCatName); //pass catName to force all articles to have that category

				editorialDiv.innerHTML += editorial;
					
			}
		}
}




function WriteEditorialNews(article, c, desc, cId) {
//article = array of article objects
//c = category title
//desc = category description
//cId = the wp category ID - used for creating the category page link 
	var categoryDiv = document.getElementById('category-heading');
	var editorialDiv = document.getElementById('editorial-articles');
	editorialDiv.innerHTML = "";
	categoryDiv.innerHTML = "";
	
	//Write Read More link at bottom
	// change "OAC News Center » Alerts" to "Alerts"
	if (typeof c === 'undefined') {
		//if no category was specified, default to archive page
		catName = "OAC News"
		desc = "";
		cId = "?page_id=1452";
		categoryDiv.innerHTML += sn_editorialCategory(catName, desc, cId);		
	} else {
		tempC = c.indexOf("»")+1;
		catName = c.substring(tempC, c.length); //
		categoryDiv.innerHTML += sn_editorialCategory(catName, desc, ("?cat="+cId));
	}
	
	
	var listLen = 15; //how many articles to show
	for (x=0; x<listLen; x++){ 
		if (article[x]) { 
			if ( (article[x].cat_name == "Alerts") || (article[x].cat_name == "New Alerts") ){
				if (cId == '22') {
				//if we specifically requested to look at the Alerts category only
					if (typeof catName === 'undefined') { // if we did not ask for a specific category (on the main feed)
						var editorial = sn_editorialNews(article[x]);
						
					} else {
						var editorial = sn_editorialNews(article[x], catName); //pass catName to force all articles to have that category
					}
					editorialDiv.innerHTML += editorial ;
					
				}
				listLen++; //have to show more articles when not showing alerts
				} else {
				
					if (typeof catName === 'undefined') { // if we did not ask for a specific category (we're on the main feed)
						var editorial = sn_editorialNews(article[x]);
					} else {
						var editorial = sn_editorialNews(article[x], catName); //pass catName to force all articles to have that category
					}
					editorialDiv.innerHTML += editorial;
				} 
		}
	}
	
	

	

}
	  

//Call function to retrieve RSS XML
//Parameter 1: Number, this is the unique id of the xhr call (Keeps calls from getting mixed up)
//Parameter 2: The rss feed URL to call (add the category if needed)
//Parameter 3: The processor function to pass the XML into

getRSS(1, "news", newscenterRSSURL + "%26cat=2%26start=0%26items=4", headlineWriter);
getRSS(2, "news", newscenterRSSURL, editorialWriter);
getRSS(101, "events", eventFeedRSSURL + "%26post_type=event", eventFeedWriter);
getRSS(102, "news", newscenterRSSURL + "%26cat=21", "WriteActiveAlerts");


timeout = setInterval('getRSS(102, "news", newscenterRSSURL + "%26cat=21", "WriteActiveAlerts")', 600000); //10 minutes


