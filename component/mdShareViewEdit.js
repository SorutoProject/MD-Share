/*

 MD Share
 (c)2019 Soruto Project.
 
 MIT Licensed.
 
 Required:
 
 	lz-string(https://github.com/pieroxy/lz-string/)(MIT Licensed)
	marked.js(https://github.com/markedjs/marked)(MIT Licensed)
 
*/

var $$ = function (e) {
	var el = document.querySelectorAll(e);
	if (el.length == 1) {
		return el[0];
	} else {
		return el;
	}
}

window.onload = function () {
	//IEを弾く
	if(getBrowserName() == "IE"){
		alert("本Webアプリは、Internet Explorerではご利用いただけません。");
		return false;
	}
	//Get Url Parameters
	var arg = new Object;
	var pair = location.search.substring(1).split('&');
	for (var i = 0; pair[i]; i++) {
		var kv = pair[i].split('=');
		arg[kv[0]] = kv[1];
	}
	if (arg["q"] === undefined || arg["q"] == "") {
		var pageData = "DwQgtGBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoB4MgEQyBiDIMoMgugwIA08ClArknIB7argSkRAocQAK1IQCtMAYyQJIAX0gQAfJADExImSq1GrNpABUxQA2mgdQZAIgyA9hkA-DIHqGQAMMgMoZAzwyBJhkBahkBThkBDhl9ACYZAJIZAHXlABCNATQZAaIZAawZAewZAQAZAGAZAaH-AWAZAHYZAfoZfKPdAK4ZAYYZ3e0AzBkB5BkADBkBVBkdAIAZrYkBHRUBIc2bAGIZAfQZAOYZXCMAZBkALCMAuTwHAKwZHQBYNQAgVTIBVACUAGUBFhkBLhlDXIvHAY2t7esBaKMAs7QHaxyTAaQZALo9AWKi6pta2oA";
		//グローバル変数
		mdWithInfo = LZString.decompressFromEncodedURIComponent(pageData);
	}else{
		mdWithInfo = LZString.decompressFromEncodedURIComponent(arg["q"]);
		console.log(mdWithInfo);
	}
	//md with document info
	if (mdWithInfo.indexOf("<!--") !== -1) {
		var mdInfo = mdWithInfo.split("<!--")[1].split("-->")[0];
		var md = mdWithInfo.split("-->")[1];
		var mdInfoJson = JSON.parse(mdInfo);
		if (mdInfoJson.title) {
			$$("#docTitle").textContent = mdInfoJson.title;
			document.title = mdInfoJson.title + " - MD Share";
		}
		if (mdInfoJson.author) $$("#author").textContent = "by " + mdInfoJson.author;
	}
	//normal md
	else {
		var mdInfo = "";
		var md = mdWithInfo;
		$$("#docInfo").style.display = "none";
	}
	$$("#doc").innerHTML = marked(md);


	//addEventListener
	$$("#newButton").addEventListener("click", function () {
		$$("#new").className = $$("#windowBack").className = "show";
		document.body.style.overflow = "hidden";
	});
	
	$$("#editButton").addEventListener("click",function(){
		$$("#editor").value = mdWithInfo;
		$$("#preview").innerHTML = marked(mdWithInfo);
		$$("#new").className = $$("#windowBack").className = "show";
		document.body.style.overflow = "hidden";
	})

	$$("#newWindowClose").addEventListener("click", function () {
		var conf = confirm("編集内容が破棄されます。続行しますか？");
		if (conf === true) {
			$$("#new").className = $$("#windowBack").className = "";
			$$("#editor").value = "";
			$$("#preview").innerHTML = "";
			document.body.style.overflow = "";

			window.onbeforeunload = function (e) {};
		}
	});

	document.getElementById("editor").addEventListener("keyup", function () {
		$$("#preview").innerHTML = marked($$("#editor").value);
		window.onbeforeunload = function (e) {
			return "編集内容が破棄されます。続行しますか？";
		};
	});
	document.getElementById('editor').addEventListener('keydown', function (e) {
		var elem, end, start, value;
		if (e.keyCode === 9) {
			if (e.preventDefault) {
				e.preventDefault();
			}
			elem = e.target;
			start = elem.selectionStart;
			end = elem.selectionEnd;
			value = elem.value;
			elem.value = "" + (value.substring(0, start)) + "\t" + (value.substring(end));
			elem.selectionStart = elem.selectionEnd = start + 1;
			return false;
		}
	});

	$$("#gen").addEventListener("click", function () {
		if($$("#editor").value.indexOf("<!--") === -1 || $$("#editor").value.indexOf("-->") === -1){
			console.log("input user info");
			var title = prompt("このドキュメントのタイトルを入力してください");
			var author = prompt("このドキュメントの作者名を入力してください");
			$$("#editor").value = '<!--\n{\n\t"title":"' + title + '",\n\t"author":"' + author + '"\n}\n-->\n' + $$("#editor").value;
		}
		var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
		$$("#saveLink").value = location.protocol + "//" + location.hostname + location.pathname + "?q=" + userMd;
		console.log(userMd);
	});

	$$("#infoButton").addEventListener("click", function () {
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=DwQgtGBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoNYMgJgyAiDIGYMCANPApQK5LkB7argSkhfAcQAK1AQCtMAYyQJIAX0gQAfJADExImSq1ijVpD37AlEqAKV0CdpoFWbS-sD2DIA0GQIEMdSIBpzQL0MgKsMgBMMgGUMgOUMgEUMgHYMgDAMgA2mgPGRgDrygAhGgLAMgPpWgL8BgCEMgIAMMYAXvoBjaZlZgEkMgP7ygGIMgNlpLnmAewyAPwyA9QyAAwwhgM8MgBhRDmYsUYCn7oAa0YAyDICj+oCBkXSAVgyAUQyAfgyAmgyAQAzExJCA6gyA0gxbeYBeNlssgMdpW0yAQQxRgOYMLoBCDEuA2gyAyQyrFgDiAgIA5ljXBQBtFodbp9AC6AApyEgkAAHADOOAA9EiAO7ogB03y+v0wGMUAgAtkj4ZgaIpyAB+RToFCYAB2SAAvAAzFC0FkCAAeYAARmAACYAMgAjkyAKQAUQAzOKAByygCckqlsoV4oAQgBhVXygBM4oAggAxXXquUABjNBsNADYzbKNbLJXKja7Fa7JfaneLFQBWACUaXKgBxLQBEvsdAP4Miy2gHCGapvZzERKpPIlSAARgxxBigGh-tKAHYZAP0MXTyi0A+gwuIqlYtdcqtQBXDIBhhlaxyabU6ddTJS2KzeWeI3eKY0AMdqAMLktuXAJEMBRTKUA3wwlNIhQDFDF1AJMMISigDPdQDQcnQ7oBohgKgF35QAa2oAwf8AjoqASHMbABVABKABlyoB8V3S9ebrb7mezgGUGf9rnXQBahkAU4ZAEOGLogiiItABKGIJAGuGPIkkAUADAFgVcpAGgdQBbBkPVcNxCMZAAsIwAuT0AVQZABiGctABYNQAIFQaMiqPLQBQxUATu06EAZP1AGMGFhAFmTJJjkAeQZAAMGcimH7bMP2Yp9X0AZoZABWGZo20AMYYQMAToYggCQBChjgxC6HPSd5jyUgADlSGuW8jN7NY-2IQBdBiiWTykAaNShMACwYUJSZjQMg6CSIoyjfyTfxgnCaJZKiQBVuUAEV9I18QJQkia5pMow9ZIaQBo+UACQZAAcGSAAAMisgaE4WRJFCQFeFjDxRQWSRSkxUIVEAEVviQd4NRawhMAAawAKUNLUAElDR4DVn0G3lDVhb5vgADUNb54W+EbDUledNsACH-AEB3QBTV0ASH-CuKqJAAiGao5iWZYxjyf8nJfWJGqZNJAFO5QBZNKiQBw00AdW0xmWQBPBhYVJmOBTsokAcYZmiLMZAHJ1QA6P2Yq5Lr7DZIEc8sPDyQBWhmaQAFhmaOhQe6SHofPKjD3-dzZiEvJnKGKdZkARQZKNyom60AIeVAHNHZYKfcsZrkAWQZZiYDG8kAFetAGB4wAQt0ASO1AAtFQmO26cpb0F4LdH0O7EvCqJAFGDQBGDUgAAqI3DAoGhMBN1HgHhQlKHQdAtAhLUAz1C0M0VMhxCQSQZHkJQkGIKEYQRcrvjQcgeF5fEiSRMRqAkP2FGUANgBJO2HZ0SApEwahCRQeF4RQAR6WIAviHIXPMF5ABPYhvmoShGUwAV2GIFlaEwYgBBZYgKRob5MDbn3iCbuvYVz+ES+73kkEoFB6QX75R77gRYRryAe+Ifhy6nlkkFRC3R-pAVR8LgRFBQSgkBb4gBQvnhCQZOfUGntksHhIP+C70Qe4Pi2EABmHpIAUZJ0CQAXtvSuXt96HxMKiCOAg+DEFoPCJA1AUDKGLvSNuC8aQ8AFEvYgCD+BIMDrSfOL9sFQK7hg740J4SQBHjwUkbcCTrzboSAQhCWQ104bnQebdYRR1pNVNuhC0EYN5HwIexB4QiMwQyVhx8BRIiEHIzADtIDsLpJ-Le38YH-1oG3Jup8R4TzzmgYgFip70k-iPVEghCQ0MMXAruBdIAsh4NQRe1Vb4j3vnIgQbd5G8mToHEeBjOQOwEAg+ky8CQnzQNgxEFgAAq0DKC8gEAANy7uwmudDoTEHpAIVAigu6mKgeXCx+dC7UNKeUru1V7boGILydx9J8GgNPpA1p2i166O7tQORUc0FN1QPbaxQhX52O7r3AxYhYEWwxOkgAEpKMgAB5Y0aSADqhpHybOGqQaQj4tkADVhqEElCQBAhpTknI4MQPZw00lrK2feNJLzDmPkNKZNJABNYgOziD-OBQAaWGqZQgbdJTzSkEc0gpytmPkgMNfAUhnzDVuW3aFWpnz3kINC94xANRfOIKZLZ3zsX4Debc4gaStmMo2T8x8fyAU4pRcaAwkpHxajWf8tJhoNTDWxUCzgxo3mmUlMi4gxpUVgukIctJw0tT3mfIc6QT4pBbNIJs-5JAqWmWhcaR8JLJT4ElAC7M0LKXMslBc613zSCCufM+FlkpICGi+R8x8KLHzEC1FsqQgLzXvDWd8j5z4bn+rJZs7FIrnybIVYG8FQbNUYrboQQ0+BDTvFlSCwN1KNlosTaK8VgK257I2e8vlxA7X-LBVqVVWzTIgp5cGgFfyW1tyZY+b5iqS18tefqtuhyTkkvlec-AnBPmDp5Yqu1XaZUtuGm2l5by1meu2bsg5Ryi07vvPqw9w7A03MNNi0y7xHntrrZAUgOz9mHMlKsywxBABVDM0QA6wxdD8M0dSgBLhjgoAboYujqSTHbagvUW4YjkIw5w+h8A0BgwKCwWo16FJQPQwOEJFABmIG7DMGYwBEblG3LU5AMFoLXpXEZ-VMAsg7pgOuwc4SIhROHfgUcY7EgpHIOQSIAwWBzpY+p09y50ernXBuEyW5t2Y13Le-dqCCO3pIMe1jJ7TwELPeei94krwKZvBZ5Bd5-zcSos+U9L7X1vvfRQj9n7X2oe-TAn8IQGN-ss2ggDgF3zARA0uiyLNHxIYIZBqD0GYNmbgrp6ACFEPC2Q4gFC0AuengYopSBGHMOUQUzh3CUC8P4ap2RwjeSiPIOIgu0XpE3xCQoipdjZGmLUSM0kWidHufmS4pZRjWsn3U1pyxgcbEl3sZIRxRI+uhZMB4rxPiC6VzMSAyQU9GthIDsNqJAgYlxISSXQhszUmQAyZU7JeTV7r2yyUspiirM70-rUguRdp6NIey0h27TOndNvgvSArTrtDPUaE8ZjIr5tNhDMlJvWQs+bxOszZj690vobacxFlzrkMvuY80gzzXnvPnWyjlQKO1gtMpC6FsLiDwsRbKgN6LMXYtxQ20yBKiVTvJd8qlNKMX0pIEynd+7SdcvJ1a-lgqAUirFW8qtkApVpJlXK1NSqpAqrVRqrVUgdV6oNTC+1JrTJmotVam1bP7W06dQCsgbqPX3p9UTuNirg2hvDZG4g0bY2nI1Am0aE0U2KvTQSw0WbiA5rzQWgNIK61lv97LiVLza2lot02oarb22gq7WkntaS+2osHcW2Po7JTjvNaQKdZqtmzsgMT0FS720rslGujdhPt11t3c+g9iqO-Hs2UO2P4fJSXpJbes7rKUdd9fRYDWGsDAofvqiek6HMO3YAJWEYtBaAALG3fqAhyCl3eAnDpIySoh3KgKGgS82S0F5K0jE9JMBICRJsQ033suf1QbnPJAo32PhblqykT4GoSqRYU6SCW8QqSs15AXhoDrk5DznhDbnC2GWIUQWQS4R4UwQyxwVHhMBexhFvlhFkByRQB6SgWvhcWiXQFiSIUSWO1hyPifiQBwAsCNmIAAIkTqxAIm16ynigPyW4S7kJBYUDloDnkgQMSyVySEJu2w2KQ+wqWHjM0-lEUDmUyO2ST4KqV232yIQkRpHnifmoFWQ4K4KAJQHq1h0gVgPpHgPbiEGcVELQRQUwBIO4R4GgOkMuzkKwxwzuyaRUPLnUN6wYO0LmV0OgRoLoMM0MPQGMNzjLmC2gQcyc0ZFwJUXa27m-hGTthvgwXtme1IPINvlQIMW4OANmTMMpUwAjiSIMXsKfmIEABwCZDaDRfekQAXAI7sRlGjKAn49Fe40BP5EkeCfZqBP47Y64OliBwDVtiAGR75JilMRkPCuEb5rFZABQvCcsAsMFf925ZBnEnsgkEd0DSFkF4QJ5L42RFAtji4RlUQMEiDS4XtxN6Q30MlzNziakSiKDa4XEClbtBB0BQFJirMxiqihBP4WjKBP4C4eiqlNNMAuQSD3M9ERkUBCRYRaQyiaBG4Id3M4tukl4256tAjUtsS0B-FgkXFsTcS6RT44FCTUAest4TD+4MjYDaQkA64qk2QkAn9C5HCRlKBrEaBykeAEi1jvFodSR8Cu54jEi-8G1S5SlFi8lGQ5EqBvsDFgSFCNCl8kj1EoSrCJAITZjaQsksBRTj465CFaBlA4tHSA4STSiMj0AQkbjIc25UTMAcSZS+E0DElSQRQeBn5Ic74BjKBB4PM8EEtCF4lyTkFGkqTKFaShFZBHNaAn5tSt4wdUAkAZF64vgqo0DSRqAyCKl4QABuVLAQEUrecA8Ra+SgNudRDwwUustA6RIuYUhE5uagBOWEWZAjQQVETAPJEZRQXgUkU+KpaeTTb+IQOuLea0nktAYMxxZ-OjZI1eRkRuZ0uRaLZQKkrJFAXk4M9RCY3DBMxLQzJ-X4bDBkaA9RMpOjBBUkAja-fs5ePpekOuQ+Nc5BfRaBcAuHVQs4gbP0rUsuXuSgAUMg+cyCrueUouTcvk-grw8gaMu2QeN9WfVLAALzAEkSXhX3kICLwwIyI2lGsTpFkC5A3mzlzjqTe1LkkyrkBNk2blbiOMwCU17hUzUxHk03G1Ll00kIM2XnFOMzAp+IGys3hJsyvhvlPjSLzKoTfkvJ6082gW8wGz82G1AXtiC1m3OOS0i3c1PNi2SNJMMysvIWpO0pSNoUNNy0kBbOu2DKwOK18oEXKwUTETvksPq1kVCVpGa2UTa1B00XAW6yGIspgse0kEIJG1sUm2IScWSsswW28V8RWxMvWzpNCXCR22iL21oIOwPMYImzYLO0yV8J8tuyUMqSG1OPeI4sCM+11LaVmPvIoL6S60GXZI6zGTnghymWh2oBO1QtcRWSR0733WOQx3OSuRuTuQeXRwJy3WJxFyFWBVBXTShRhThQRSRUZwxSxRxRp3xUJWJWvTJQpV52IFpQF0ZWZQ7wOs5ULVBQlwFSFRl0rUlWlQZ3lSD2VQHU101UDR10fF1RPUNUN1NXNWvUtWdVtXbSpSt2dVt0vXtw2W9V9VRWj1dzDWGgjSjS2RjT5R9z9yTUDzTUpwzVD1nXD1zXzT+qL1LUgHLQTyrST0lEH0bXbXT3XUz07TbRz3T3zwHVPWLxOVLzBXL0rxnTnQpXr0DWXTbVXQz03XeR3UnxWsPV7xPQHxTwvSvRvQt3vWNpfQxCAA");
	});
}

function getBrowserName() {
	var userAgent = window.navigator.userAgent.toLowerCase();

	if (userAgent.indexOf('msie') != -1 ||
		userAgent.indexOf('trident') != -1) {
		return "IE";
	} else if (userAgent.indexOf('edge') != -1) {
		return "Edge";
	} else if (userAgent.indexOf('chrome') != -1) {
		return "Chrome";
	} else if (userAgent.indexOf('safari') != -1) {
		return "Safari";
	} else if (userAgent.indexOf('firefox') != -1) {
		return "Firefox";
	} else if (userAgent.indexOf('opera') != -1) {
		return "Opera";
	} else {
		return "Unknown";
	}
}
