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
		var mdWithInfo = LZString.decompressFromEncodedURIComponent(pageData);
	}else{
		var mdWithInfo = LZString.decompressFromEncodedURIComponent(arg["q"]);
		console.log(mdWithInfo);
	}
	//md with document info
	if (mdWithInfo.indexOf("<!--") !== -1) {
		var mdInfo = mdWithInfo.split("<!--")[1].split("-->")[0];
		var md = mdWithInfo.split("-->")[1];
		var mdInfoJson = JSON.parse(mdInfo);
		if (mdInfoJson.title) {
			$$("#docTitle").textContent = mdInfoJson.title;
			document.title = mdInfoJson.title + " - MD Note";
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
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=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-YBCoK3TOAiZd4NU9wZ5Ie-lSag-ITTaypUDwET5GDbHhJjoUP86ASp-iXIe-XssrGuJQI4Fqkfjp1AlxYOO-Pjr9LcObXB7js0hUvAAXmAatQ5laJsHZrbWusADM-54zKBU6CaYwDmHHgjhsfjMdQcnHw5gRONw7imieEpvMWdo250BOFguMuKTQk44p1EVdDg11xId1eywaUtySDqdusCu5pxZGyGNv8FHDzI5GhM5Op6SpM-PGvW3NRN3XmuA0RpgyUP3taUbpbT7+ldO6YVFW76fnPgLJ+ADX6RkwNGT+7nJcwP-nmoBOZQHgdzUWEs0C-4ImrAghsyDS9oLsx2Ls2CuR2odXnbNxDSGyr7ZQpNbDtzTvY8xlhJJ3-njy1eNBoznwiSM+Evtdl+D8OIn+FIjIivgfoolBMCszATDhHhDJJoqRORJRAwHojdNjJcgElxLxPxBYqJOJGUjYtFHYspGpBpBQdpLpPpDTCZGZJ4sQNZD4vZI5MokQclEdPxJVKEgFBEldOFJFNQbFL0olADKkulINBktlLlPlGJLkiVGVDTBVM1DVMjKUuUlxJUlTNUnBN1L1P1A0iNGNPQBNFNAhDND5B0hwVMitFIetBxLxP0oMsMgdAIbsmdJABdJEmFLRHMg9MjIsi9PcsEl9OspEVsgDGTHsrhAcgJEcicjDHDGZPxNcijBxHchjA8tjLjCCqge8s5J8okfMpTNTLTI9AzCUazO0EAA");
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
