/*

 MD Share
 (c)2019 Soruto Project.
 
 MIT Licensed.
 
 Required:
 
 	lz-string(https://github.com/pieroxy/lz-string/)(MIT Licensed)
	marked.js(https://github.com/markedjs/marked)(MIT Licensed)
 
*/
//marked.js config
;(function() {
  var renderer = new marked.Renderer()
  renderer.code = function(code, language) {
    return '<pre><code class="hljs">' + hljs.highlightAuto(code).value + '</code></pre>';
  };
  
  marked.setOptions({
    renderer: renderer,
  });
})();
//flags
var flags = {};
flags.edited = false;

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
		var pageData = "DwQgtBBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoB4MgEQyBiDIMoMgugwIA08ClArknIB7argSkRAocQAK1IQCtMAYyQJIAX0gQwAPkgBiYkTJVajVm0gAqYoAbTQOoMgEQZAewyAfhkD1DIAGGQGUMgZ4ZASYZAWoZAU4ZAQ4Y-QAmGQCSGQB15QAQjQE0GQGiGQGsGQHsGQEAGeFsZAGFAOwZAFg1ACBUswBgGO0B4yMBYBmiPQCuGQGGGDwdAPwZEwCAGHOJAToYXQG2GYrLM8rDAaYYQtxrAJMJK2oLAMAzUxpb2rptiQEdFQEhzQFUGQBiGQH0GQDmGN0jAGQZACwjALk9DwCsGJ1KsgFUAJQAZQEWGQEuGMLdAP0MF0AxtYOQDyDIBaKMAWdqHQBmDE5koBpBkAXR6AWKiHLCwYADBj2Tk6QA";
		//グローバル変数
		mdWithInfo = LZString.decompressFromEncodedURIComponent(pageData);
	}else{
		mdWithInfo = LZString.decompressFromEncodedURIComponent(arg["q"]);
		console.log(mdWithInfo);
	}
	//md with document info
	if (mdWithInfo.indexOf("<!---") !== -1) {
		var mdInfo = mdWithInfo.split("<!---")[1].split("--->")[0];
		var md = mdWithInfo.split("--->")[1];
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
		$$("#tools").className = "close";
	});
	
	$$("#editButton").addEventListener("click",function(){
		$$("#editor").value = mdWithInfo;
		$$("#preview").innerHTML = marked(mdWithInfo);
		$$("#new").className = $$("#windowBack").className = "show";
		document.body.style.overflow = "hidden";
		$$("#tools").className = "close";
	})

	$$("#newWindowClose").addEventListener("click", function () {
		if(flags.edited === true){
			var conf = confirm("編集内容が破棄されます。\n生成されたURLも削除されます。\n生成されたURLをメモした上で続行してください。\n続行しますか？");
		}else{
			var conf = true;
		}
		if (conf === true) {
			$$("#new").className = $$("#windowBack").className = "";
			$$("#editor").value = "";
			$$("#saveLink").value = "";
			$$("#preview").innerHTML = "";
			document.body.style.overflow = "";

			window.onbeforeunload = function (e) {};
			flags.edited = false;
		}
	});
	
	$$("#previewCheck").addEventListener("click", function(e){
		if(e.target.checked === true){
			$$("#preview").style.display = "block";
			$$("#editor").style.display = "none";
		}else{
			$$("#preview").style.display = "none";
			$$("#editor").style.display = "block";
		}
	})

	document.getElementById("editor").addEventListener("keyup", function () {
		$$("#preview").innerHTML = marked($$("#editor").value);
		window.onbeforeunload = function (e) {
			return "編集内容が破棄されます。続行しますか？";
		};
		flags.edited = true;
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
		if($$("#editor").value.indexOf("<!---") === -1 || $$("#editor").value.indexOf("--->") === -1){
			console.log("input user info");
			var title = prompt("このドキュメントのタイトルを入力してください");
			var author = prompt("このドキュメントの作者名を入力してください");
			$$("#editor").value = '<!---\n{\n\t"title":"' + title + '",\n\t"author":"' + author + '"\n}\n--->\n' + $$("#editor").value;
		}
		var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
		$$("#saveLink").value = location.protocol + "//" + location.hostname + location.pathname + "?q=" + userMd;
		console.log(userMd);
	});
	
	$$("#menuButton").addEventListener("click",function(){
		var now = $$("#tools").className;
		if(now === "close"){
			$$("#tools").className = "";
		}else{
			$$("#tools").className = "close";
		}
	});

	$$("#infoButton").addEventListener("click", function () {
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=DwQgtBBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpsYBsMg1wyDrDAgDTwKUCuS5A9tVwJSg3v2IAFavwBWmAMZIEkAL6QIYAHyQAxMSJkqtBiz37AoBmA7t0BJDIA8EwMkMgcwZA8gyADBkCqDIBEGSJABUxADagP7ygBSugJ2mgKs2gN8MgEGWgIGRALoAFAD8AI4AvIQA7gCKAOZIAELFeYSYANYAUgCCAMIAkrXcxQAydQBGtQAOBQUAGrUFAM4FTbUAorUAngXFAJr1AOK1ACo9-AASC-gFYABuANK1AKoy1QBMALYF6QBelIQAZoSNk8sA6v0AWpPNAAYABzFap5ercUgKApbJDpVpHUjoFDVAAetVq1FOdSOAJyxVkdUq82epGKhAxAGpSLVltUUPcACZIVEAdmubQKmByP1pBRmxVq5EqhE+hGq0wBAFZ+AAxABsyzyRxGe3qC15+H4vIU2tqjX4C3leWKBSVtU6azyW1kjXxAEYpXlanlZHlZWbrQDqO7KbV8Ss8tNlgp8LU2gBmAG1VFIaprU45eqkZbFSoxtPFEZISRIfA5QiXJXFSlKrbpc3LVb4YoAO2FtXwRzaPwGJvwxY+5Q7AHlKsU1gBOaMAOUoYZ+mYASmAp1K2-URkr6iglYQgUrJgDl7SFtdqo1raclctKstCAp7uHUSMRwcRgSkI1Ltz6is+8V7nWkPq8gtZTkyzbnkywpj8CjkI0PbpJ0nyyNwrKUvcNa1kcjQRrUkiNPgABqpxTJIfprNq6T8MUfCyPw8wLCOzrKgcPw5GRhANniMxnAALD8lD8JUKAHDhtSyqGZpVpg6RbG0lC1KQjS8tUhBgBx+H8Dk0lTgU9qTPwtSVDktb1KylyUG0xEFLUSHgjMhD1Kikw9IyDT8Gq8qSOCqKnOUGK7AUsrHls-AHD29wfI08ZtFKNK1BptSMvgU61COOSTGax49igZy1FeWyMtwg4oPhyyyrUiz4BxjTkOg0YjDMlAedJxT2goUqVEg5XUOg5YLK8IyyLKkwHCOmHOfUkgzPuqKUs+pCooosKoukjI4aQU6UI0qJTvhYB5DMHEFtQhDkRGawKIQlAcQMjKTBGPystCpwjAMKD1NaUrnD0zzoFOOkLKy+ELAMYX8NcPSQQonQAmUhCyjZ9q1NU+BhmZhCSIy5R5Ao6QcZ0ZH8OQ1xzLKEZOrUlCXDpOTPECtSUekMlbPg1wlYJxQnGmKBkUCOEzKQlydIOmDPHCSA4VVnS+RWOHLI06A9JSPbkFOOS1OghBbFKiWhtcOEoL5GJJjkRyVIJQ3yr5S6dAc9o9A+pzSfUOSyEJMzciMjZ5Pc3DcJM6TXGAkiDhG+GnLhUysiL6LLEOJqyAS8oKPahAoH5pwDLWcYKHk1S1pgjnLJQ5o4ZV6R5FK+DpvgGpIPaxSSJT0x5Nqsj3JIOGosUORrJ8Pz4OgzS1G95BtLWWxwbOnzPCOKDTG2Rr+vwPS0rIpwFJMhCnAcmCHtUEaSKdAJgFsg7PPc9z1DhBxbECCx2gUOTcOQQmfCTU4DNGzw8pIspAlneSVNwI4XiXFZDZdI6ZKCSHQBiM8zothpnMrUUU9xGhbDCrpDExRUTK2KPKbmQk3bFDDCGdIsoyI4SGo2Jq8w-TFC2CVTAhRahbAUFMfCDN0y1EzvqNYKAcjkDDKTZWRw6JrDhqCSQRwpyyl5oyIEOlGj3BmD0GY2lSDmRHBI+yQJyBHBQNQOYxQpwsR7K0E0sVoynCaitEY3AZjymmE0H4FBrjFB+LKdAUdqj2k+KcIEjRGgjBQKiOosoexOlcSONo-ATQ5ABNGRknw4ZbDyOgU4bj0xrByAsSk5BJiVBWDhSgCsmFVk+Pwfg9piwzEZPhHssgf6NG4AoaS9xPhkntHkbg6R8BgNqDhbUlB0yLG4pUSkHFBzLEuNwSgCwzgqOqPKdMOMfh5DyFaWo9oGykA4rM9MI5tSDHSD2G0qJ6i1GpuDSY6A2gVy5og2oAwA4-GqOM+0tZJgzE6PKMASAFCTHlJ8HOAJJz3DAJ0EWeQRyTAZrIPaCwUCfGuCaWUxR0BgHqPcdIlBhFCjepwgEjJZSVB+JpKc-9Rag3lKcWs5chKYB-KmPaLokDRlID2OGtQkCyiONcU8PxGg9CwegS4ajagAEp-BBEAHsMgAfhkAPUMgABhkAGUMgBnhkAHYMgAPs0ALIM4QUgZGyPkIopRyhVDqBMVoHQLS9H6EMHI3J2JgDeJIEO5kcgClVthIEexGT8lqM8H4-A2jYQKLWGZgIgRnPIAUI4UpmifFqIOcYjIFBnPwD0eomAwAYmdLKPIH9iiIsbPyvJ4ZjSNFmVsGYzpUTcuqJURa1QehryOIQEcpxiidDePhRkbwGZKkkD5Z0Cw1iymWBTVStQwCojdCqS4q9Kh7EIDhDScDbg9mcjCDiexqgbumOXaoZyMI0llI8c5jRKDVFOOgHF+yWj8HlOsS4dMf7sXwDtWoJL2KNF9QCd9HFKDSXlEgHo3ACiSFDQUEcstIO7HuPyDS+y9jl3wD-H4ywYQ-FuB6LxkhPh5EaPKS4ya-6ECnNQB9AJng4tJtQHCshLhIAKOW-A9wDjLH0ayIgpwdKfEmAsYoChaz-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-pUPqWAH0Q5J8PKLIPaBGNQM8AMNUEgLIB-CpQsJQACJcFOCMPcGsMsFcc0m0DSIQHvqQeZM+BGG+BNfhJOp8EgDsNwG2UupgJ8ByZgT0CcA+aKBZR3rttcEgLyPStQJ0OkBGPaOkD0HkCDAsAUKyEcJ0UgD6JUKTugJBCgMcjkPXSMOQMUFRK3v-RxJgPaGAMUFpRiBKgEIEIAJcMgAJQyADdDCqoAJ0MeqWQuQhQJQUMpqE+LQ7QXQ1qgw-o6AbqKsbwI4AIewrBMw9QPawwhAmSBOqw1AxIiwhY6w1A-QWojIPYbsZymISA8auI+IhIukJIZIFIFkNI0shi+AfWpw3Qcw7ErIaY9Qg4bwsoIm7YSGeoTo7EKAUaPYhiBQAIGhywi86JnIQa0UsUlwPwKpvKHEZyNxGIZUnKsu96WoQkiCZyYI6wWT+oystYjRQIskjQKAHEEOzQI8+Aw25ktxkwU1kgpAcMPYAaV4ysGkXV9aOQU4SAnQ9woZjQpwpAAIlQtYnKPws2IwPwL0eQaVIwkwFA5ACwvtbsOwb4OQbQ+AIwUoaA8M6TFQqIAIuIKAsyFm+E8wTMJK9Q1AwkbetYXZhAPwKAAwh2PBdZ7Re9BwgOPQUEBQcolABQ5AH0CyIwGNrINIkgLoIwhAhZMazQ0Bth3AmWPYb8nw1AeSLaC8lwqIPw9wqIFIKALiCsPYqWMw3ARwDskezY0BCLtJ60b4uOmZPweIAIK8-AjQU4iSMwRwkgCUQYRyNA6oww6opAeQnjeQ3VbJNcMz5QhAPYHEX8-86A6FeQQIlw4eJU8x16pMQ1begDNkrIMw-CzjT5e48I3ABKx9s5AIMEoiCwnwCwVUTUR51APx+po0IwOEsoI4GAMwsYeQU16AeYK8Awpw6QRwkwBY+xm95U-AqI+AMRlw+AlIBw6W0kkwU4zwIVPItY9oc2tQus1A3AfMPwCw-Anw+S3AasCwjBg4UoQzEYXeYAAI3AHEqBKV+1qII4OE9ouwOECw9kvGRw8olISZ9oRNQilQU7qm8atQNeHEPQEYYhQIAI6AsolAAbyY-2bbrjjQObc2K8uO4yu8AIH+pAhW8o6Qg4virIkwK4-dKxaVkgD4+Alh6ACwb0ywBUIwlBI49QSA6BmAbQI4nwgbawxQNwQw8MXOWwys3WU+kjsUdEzo8YhQoIEuj8jQg4ZyS6KAKGMMBwLokg9QMwqlZspQOQHEKA6AVaRHQkV6I7OQz0bQOQ5kUo1QLCW4xQDsBQeQQ8KUxQH1scKG2yMliCw2jQ8EbwRHGhoWsgD9IxNbKA8ozjPYw2sg3osgkghAWj6IzolZW8kwayAII4HEq1EY79d59Ql0o0tEBwz07wHEawbwAIZ8tCCgsob46lB6Oijy9QnQteq1U4O6XnmbVyeJ7wXnIRk1U4hOAw8KkwtT4F9QPYkwbQz08bPajbjcYFkwCgOQpAZcPHeiYIAIbQ-50kpcCB+iIc-Aqs5A1QVTRwg4iVFrLqVH9FtnKAql36QYtYjceQzNlAMwMwlQNn9wKAg4+yKAoubQhQMwCw1AAI6hPS1wHONs+1awNyQIRnnRbq9wG8PsPNtEPrSAqAIVU4zjWw68jQHE3ZlwazPMBw1AfC-HBweQ5G1Q1Q1wHEZIbQlIMwZ1-iEYsg+ASA-mRwlwjQ6QEP9QqlDwAI5Sg4akywHEEkowT+ejTiBwrIKAjQjU9Gwia++APYOQ6KeD9r1w3ASPvse91wapfi+Yh3RwG3rIEYYw4st4OQnHIceQEYJoF+eoJYxYmyfc605Azw3ByoGZZl-AtYsynpzUlh6z0oCwBKqIYAKdRzjQNNkw1QAZ+2PJ9wpBPQpAlQNQZPWwpAbw+ATsZMGIUonI0Jvkaw6AlAkwjGwwvQH+1AK2cHg4sg9LPQ6QY9U4PQ1wsg7+IG6AtmHEZLkwZSlQy9BQEYPh1wCO6A8whACwkg2R-qLE5yHvNF3AUoHEnwgslNnwrIbQHERclIkgU1Y77wayNDjI-LEYtcP7FxbT60+A94xEAw382IbQMLpwC6i7pwI4omlAAwHelQis8zYYXdNypQZ16AAZfjqerI3A9Qpwnw9Q6A9krYX0pt1QgbCwHS9obQlirIAMOEKuyo0FpAsoe8q3aw8ocWEYJALIyE6Ep7QeOW-iDk+CDhb869QcEzl8IRhZuawGigUFkAZpFwjID6qSwZrN48q3PMAAiTlxNgj6SwRRL4R4SfBDm6QYwoo3YyyNa6HzRQnixzC0YRgL-WUPcXDCFhCE6dM0LcQLwxtqcUoKJjwkf49gEwlQWUCeh6I8JuAawf5OORyCSBLgBwLkI0AmoLAewrIWsAUGeS112cCccgNtT4ylgFE84BUhGGeDY1Tgr7QTEL0kBrA94DQAeExlma94CgKaVkLUEuAARsWVEU5E90HCWx5izcUgCDFlAzBL030avsUBQAjpuAZNNYAsHIBktlgBwNFLogGA+Zio8oKClKALybQQY+2eoAoEZBtAqUewO-JUXQBQ0FEIwP3LsXuAz1qg3AT4ECGqBvRrgQbaogWiqaJ5423GVNrIOJbygSh7eOrmENfyUAfEj8IanMFNolwCg4NdALfhWGEAOSOEdoPaDtjCV+OtGJ9D2CDCygwB6QA4MZUIBPtlg5Ae4M8DKQAh7OWIGYLIBHC3V086AfgPUALRgN8AQ3dACODxZ65qASAPao1HmK19m8Ezb7I-w5xZC8ol9SkCMC2DbZ1K1AkcPKGVLSAUSlQA4G6CRQThLSaYJpMsGuDNYFgANbFtDDfAdg26ywKcAJCELjhJgR-RoK1HSryhuA+AbEBGCOCUgsYlQLoSgG4ARZHQ6ANYLZBCK1cdo4gqCvUDWD4AzCIwAEJ5ylCYBFMO1H4F5xDikBWk73UgKIHIDxpaweVEgWsD8QjEMaSAEkapQxBtJ3iZjJyqKGqA-A0czffUDvCOB+RJg3TfXiFllhTB+kkwVEHOjxbJQCgZSFAAoCBBHAZg7fHaD4hGA5AWQ3JSuLM3VK09PG1zCoG0GmAFBLQP+OtpcEmBAhHYnwXWLWGO6qgFAZXTjgMGWD7F+Af0eUIODvySBUQeQS+jK2-hKZp0o6GpvwAGA-BdE-1eoAUHXAyFZR+zOBD2COChgb8KAEYI0An5epTgsadMOkw+jPNlY5AMxnWEODR8BMikfGDAXwBJYOIlnToKQB9LoA-StdSgFKBHCx1gMlAboFOEHDqsigPIcodpHICFEIw9wGoXvRyR2wkAZIWQDhDfAjhYKm3ZJtXFFTFAWqxQUgPlkyqUB5QHEOBJQByBbZVYp+YYJ0DG74AtgI4fbNZgOBKMLmYCUgJsSQDLAcgiSHINUDCxPonO6+axAsEZDLAIwlIMLJSAjDyh0A1wIxi4UbSUgwcAIHoNUHJBNJZk1QLYNmUqBgBB6qefgCgBQAtoUw1AXqOkFrCWFL4+7QQuDiIAjgtgBwfbEqVjRCcSoSYNoG0iQAzBzg0wTkP7xr5YIcYunJysuWjC9wDqfsRoF4NpF4FLg9QKaPaGAwqIMmyYF3gJn1DUBFoM4h6FRHuDkBYpzoGYN1lTz2gBgE-XLsdjXh1pZIPYRkKQG8yGgC2sKbMpgFRBShZkfkZULWEHCfBVQJ2cqP0X4ATV9cOiCNFsBGAKAIwkwarJMEqnoShc1AEAlWLYygRlgTPCMOkABCyBxQKlRkAQx+DkAcgK9bogIjLwRh9CYAIxk0BvIq4-UQIUrrNnlDK50JAIe0C8O2QNBVQqsOGCZBGCUgpwkyA4ONWJgvsF4d6LYMiVR7PTGQiIXFlpAKDPBkh1ASgMzVRQLARgttKYKMPQDlj8AtdAoOhXRTQV+6pwJTEgH8Ir0tg9oa4CJTyAIjKQlwX0gcCnAckwEscdUPUAfryEvM5AP4HcXwCO5MAKFNoLz1RD2EKCYAXQcsClCvs8SU0toB+k+BO0X2cMW7HkEwBAgkAZwoTpDBm7oUkIpAX6uBGD40pQQ9KcCJVXPACJSuqYPEsgUkADBCAjkY2i71XCHYxkace4KQFkAHBYeT0qLpi1nLTAEWjQPjuQAOCccAQ4LOoIaCThLhCUUoQcLFJy4LReok2DEB22AzUBKQ5YEcJcB8IppG+9wWbMUFlCVSAQiyJpuVzumsxSh+wfPCgDyCnBLRvRFKBGCMiYAAEPwDttTEXEhECg6rEYJgEmBoMlA-hIWJ8Bg58SBwlVfgJ5X4SXBmxgoVkAMEd6pxqgkgD+ssBHAtpBwIwbMXJAX5CyfyxdTsvwjV6sxPgO7HYjGw4g+FKQCgHtvejfCUh0A+ANdgtHQmEZJgzY9uPEW9l4tMAySMqGpEoCL8PRjQe0PKD8QHBZZUoagAMDK4klPI0PIEMEiUDmQBgTMbCOVAlFBEgiTPWUCMBeJl18A0eWQHtUaA4QxmCiWUFcDaAxNA86IvgMsEwDzcFAAwcSjSiEgAh25l0BEUCEeSBpMqaXbSI0E5oC5LYo07gG3UZCSAmcpJYbFsCDLO5cgrMVGFOEzhrBSA9+NZM6m4BAg5EFpSjKcGFbVZGQsKQ2qAveqxt8gBwNzpIDHomRwy+dcMjhDFyrJUQ1ATkOgTijoj7Q1AY7nmkdhbAH0lcZJOdzaAiELIYyVtLtllHSAx0OIkYAsAOC0IOQU4WsA+xHwT9M5YoFkgUGuB9TEeahP-HqyLB-wvuPgxuOSEKDUA8GTOO+HpHzpIzrgnHf4nviwlAhcgsgT4NwFrDXBOgbQLpJLQiJR9QYMsWUE+HSAjhawrXWPpo2Bi3gpoFoSkKik2D9gzMCtFxL-NCxsYGx-QKJZcWKV3FJAoTMUS9Pzw9Adg1AKcCK3WjLB7QZUBbvgDWBqsSRu7OkKCGb61hJJPmf+v-SvkDRqA8bXQZMGeSTBrgk4JZlDR+Al9OKTGeoALLX5ShKciwTYO6B5KggPRFOBPD3m6yVAfGeQaQJyPSCnBrgU4U0vWCgwKQ20R5INj9PSB9EcIt-SQAjABC1hBIIhEKGph3Y7sfGNK70PaGwiQ1EY6QR+LWGWDOMhoCgK+YNHijcLYeCsazEVACQjAPcNidAEY34DA1Ae2YeoUQ0MY04gQtYRyKhEEw04FAoTdKNwC0jVA5CBwQcBIXwCJ5LaadIjhNS4hqx5iQIXAiOCBASTysgC6Pu30wAzzBx5-QBE7DViyBJgnIuDsYTWCqV4UbJH4dQFPpMddQyELAlbz1VpoFgtoToN1PBrdk01lbTRdQB7DUBGgnQDzI730I9BwuZ4DhMsHuBKhOgh+CyH6hBJdV6gyLSFUcC+I4FqAoMUiOkAYmOwzCpJBYP51rBWF0msgYBUi124xNiImKcmEYkbIAl+inQMuPDFRDcByiPQTAPwGaL99KQVEDiNQFyrcr+ASLZKYyHSADBqA+AAUhWAFLBI8WpvL8A0EIAK15Q33SoFKAQZ5B8yFAYGKQm0RjRZYrJRkMAruhtBb87QlxSMEqAKBrgFqmrCiAMqslgM9wGHrWEaBHAzxYc+0KiEKLrCz4PEQVYKoDSXBh0PQagOqFrBuwYygxCllEkFCxTwYsU4XJUEd5vNJiUG2sLbmlyfkp0WwHoPgFrCpV3qGEc9WeNdCUB0AEYHSFODaCohO0PYI0YQFHWEBUQcSsAOFVZCC0jEOc+UM0C+Tr4qISzVcPCUoATd5QCmqPrKLyCdBlgrZbjl-N55bB-iX8CQl-GbankfgXEQ2N8sKCzNiNLCWTMKDABYqfgarHBK8HOIjg0mizG0Hb1yIKAFgLVK8EPOvgYQOILQiYp0DS0jhKgvy-bKGlqielPkoTI4DzVqBYpA0WrPPhxAsIczR41QFRKBUmZHBJkU4UuSPnWZ-Z6gZKKcAvMDXETjCEMvkhiFOWwlIWIxDWJGUW4oU6gszLPFcj2oLB255AOprKDtLpswo-UP9j8GeQKBsx5AOGPWgFncAwkHQ-Ko0UgkDAEoqEbGHKo4j+cXkD2WFMrjOA7VZyvcPjDGyFiTYYskCCUAoBwiW1deOdWoEaJ+BJQtwWlF5KeBOyJVq4RKEOBzkGnPBnWgsQaYoCi6YB6UPmA4Fs16geUcwP4ojoD1kVTh8254M3q4lBAPdoSA6WFCv347g6woK4EYAvAhjt4RskgYFg9wUxyjDogkfUD0AUBDgiarIbOHe2YTLr0QUJCIm0jDE+DxBQIPDG2AGD8BSApstKfWUs4AyfgchATHkEuAnQwV0mgoECG+hITiIxEKiUwjwVBgEwWcVPFOCNCMgtgX0MoGcnKS1gpwnnEnAMAsxrA0psoOUhxHlDHFD6fVYoGKVpw4RnpCgFLuSC+DKFw2r4nDgejdDLQDgtYGYB-n4DbQRwMMfbGsEoBwIpwV0VbaZMBjPArNKUZDdyhwhUqnQ1QHkcsCWgCoDg1QHxDqWk28YbeeGKON1lRB-YiYBbBnDMDMEDBPgQ4IiQME84FxqAxerYGOnSCshTatvLOJ8hqH-4+lRM1cuvBOzdxGgnwRoPzTADc8cIW8GVpdTzzaxRdUCuhkAA");
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
