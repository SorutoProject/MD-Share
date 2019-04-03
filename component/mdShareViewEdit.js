/*

 MD Share
 (c)2019 Soruto Project.
 
 MIT Licensed.
 
 Required:
 
 	lz-string(https://github.com/pieroxy/lz-string/)(MIT Licensed)
	marked.js(https://github.com/markedjs/marked)(MIT Licensed)
 
*/

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
		var pageData = "DwQgtBBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoB4MgEQyBiDIMoMgugwIA08ClArknIB7argSkRAocQAK1IQCtMAYyQJIAX0gQwAPkgBiYkTJVajVm0gAqYoAbTQOoMgEQZAewyAfhkD1DIAGGQGUMgZ4ZASYZAWoZAU4ZAQ4Y-QAmGQCSGQB15QAQjQE0GQGiGQGsGQHsGQEAGQBgGO0B4yMBYBkAdhkB+hj9oj0ArhkBhhg8HQDMGQHkGQAMGQFUGJ0AgBhtiQEdFQEhzVsAYhkB9BkA5hjdIwBkGQAsIwC5PIcArBidAFg1ACBUsgFUAJQAZQEWGQEuGMLcSycBjawdGwFoowCztIfqnZMBpBkAuj0BYqIaW9o6gA";
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
	});
	
	$$("#editButton").addEventListener("click",function(){
		$$("#editor").value = mdWithInfo;
		$$("#preview").innerHTML = marked(mdWithInfo);
		$$("#new").className = $$("#windowBack").className = "show";
		document.body.style.overflow = "hidden";
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

	$$("#infoButton").addEventListener("click", function () {
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=DwQgtBBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoNYMgJgyAiDIGYMCANPApQK5LkB7argSkhfAcQAK1AQCtMAYyQJIAX0gQwAPkgBiYkTJVaxRq0j6DgSiVAFK6BO00CrNlYOB7BkAaDIECGOpEA05oF6GQFWGQAmGQDKGQHKGQCKGQDsGQBgGQAbTQHjIwB15QAQjQFgGQH0rQF+AwBCGQEAGWMAL30AxtKzswCSGQH95QDEGQGy013zAPYZAH4ZAeoZAAYZQwGeGQAwox3MWaMBT90ANaMAZBkBR-UBAyLpAKwZAKIZAPwZATQZAIAZiYkhAdQZAaQZt-MAvG22WQGO07aZAIIZowHMGV0AhBmXAbQZAZIY1ywBxAQEAcywbwoAbVanR6-QAugAKchIJAABwAzjgAPTIgDuGIAdD9vn9MJjFAIALbIhGYGiKcgAfkU6BQmAAdkgALwAMxQtFZAgAHmAAEZgAAmADIAI7MgCkAFEAMwSgAccoAnFLpXLFRKAEIAYTVCoATBKAIIAMT1GvlAAZzYajQA2c1yzVyqXy41upVuqUO50SpUAVgAlOkKoAcS0ARL4nQD+DEttoBwhhq7xcxCSaXypUgAEZMcQEol0oAdhkA-QzdfJLQD6DK5imVi90Km1AFcMgGGGNonZrtLp1tOlbard7Z4jdkrjQAx2oAwuW25cAkQyFVOpQDfDKV0qFAMUM3UAkwyhaKAM91ANBydHugGiGQqAXflABragDB-wCOioBIc1sAFUAEoAGQqgHxXDL15utvtZnOAZQZ-xuddAFqGQBThkAQ4ZumCaIi0AEoZgkAa4Z8mSQBQAMAWBUKkAaB1AFsGQ9Vw3UJxkACwjAC5PQBVBkAGIZy0AFg1AAgVRoyKo8tAFDFQBO7ToQBk-UAYwYWEAWZNkhOQB5BkAAwZyKYfscw-Zin1fQBmhkAFYYWjbQAxhhAwBOhmCQJAEKGODELoc9JwWfJSAAOVIG5byM3t1j-YhAF0GaJZIqQBo1KEwALBhQ1JmNAyDoJIijKN-ZMAhCCIYlk6JAFW5QARXyjPwgjCKIbmkyjD1kxpAGj5QAJBkABwZIAAAyKyAYXhFFkSJQUERMfFFFZZEqXFQg0QARR+JAPk1FrCEwABrAApI1tQASSNHhNWfQa+SNOEfh+AANI0fgRH4RqNKV502wAIf8AQHdAFNXQBIf8K4rokACIYanmZYVnGfJ-ycl84ka5l0kAU7lAFk06JAHDTQB1bUAdCVxhWQBPBhYLzmJBTtokAcYYWiLcZAHJ1QA6P2Y65Lr7TZIDu6Gi0aQBWhhaQAFhhaHG4PXO45iE-JIjaQBuhnUydADWGQBLhlCQA2hi2tpGbgyJoOJ9cDpuQAzxUAMBcqOCxzy08fI8cJuhwZ6LHxnPKjD3-dzyfyZzhinOZAEUGSjcrlutACHlQBzRxWFX3PGG5AFkGOYmAl-JABXrQBgeMAELdAEjtQALRVljsegqW8beCvQDDuxLwuiQBRg0ARg1IAAKljowKBoTB4-R4AESJSh0HQbRIW1QN9UtTMlTIcQkEkGR5CUJBiGhWFEXKn40HIHg+QJYlkTEagJErhRlEDYBSUz7PdEgKRMGoIkUARBEUAEBliGn4hyAnzA+QAT2IH5qEoJlMEFdhiFZWhMGIARWWISkaB+TBD-L4hd83uEJ4Reez75JBKBQBlv5+B-L4EHCdekBz7EH4EvV+rIkBomTg-BkgoH4zwEIoFAlAkD72IIKZBPAiSMk-qgN+7IsAIlrvwU+ohz7QOTggQMd9JCCnJOgSA38wEr1LlAmBpg0TNwEHwYgtAERIGoCgZQc8GSH2-rSHggpf7EG4fwXhNc6RT3wWI1hp9hE-BhAiSA98eBkkPoSIBh8iQCBkaydeJiJ430PnCVudJqqHxkYI4RfI+C32IAiexIjGQGLgYKZEQhPGYGzpAIx9ISGgLIewqhtBD67wQffZ+k80DEGSa-BkJD75okEESdRMTOGn2npAVkPBqA-2qhg++WDPECEPl4vkfca732iVybOAhuEMj-oSeBaAxFIksAAFTYZQPkAgABup8jHr00TCYgDIBCoEUKfBJrCl7JKnjPNRCylmn2qlndAxA+RFIZFIhhCCWEHLCYAiJZ9qCeNboI3eqAs5pKEAQzJZ8L7RLEBw5OmIhkAAkpRkAAPImkGQAdSNI+EFw1SDSEfKCgAasNQgUoSAICNAi+FHBiCQuGoMwFoL7yDPxTCx8RpTKDIAJrEHBcQKldKADSw1TKEEPlKeaUhYWkARaCx8kBhr4CkM+YaGLD5su1M+e8hA2UfGIJqUlxBTKgrJWK-AhKMXEEGaCnVwLyWPkpdS8V-KTSGClI+bUgKqWDKNJqYaYraWcBNIS0yUo+XEBNAKxl0gYWDOGtqe8z4YXSCfFIUFpAQVUpIKq0ybKTSPnlVKfAUpqU5jZSqvVUpkVprJaQG1z5nz6qlJAI0pLiWPn5Y+Yg2pQVSBpUmj4gKyXEufOiqtiqQVivtc+EF3qa1MtrSG4Vh9CBGnwEaD4Hr6U1rVcCwVPaHVOppYfSFwKiWWuIJmqljLtQBtBaZel5q63Uspfuw+urHxkp9fOy1BKo2HxhfC+VXqkX4E4CSm95qfWZtPe6-dw1D34sJYCktYKIXQthbO8D94o0wbvTW9FRoxWmQ+Dio9m7ICkHBVCmFUoAVWGIIAKoYWiAHWGbo-gWjqU5tTbo6lkyZ2oL1femI5A6JcAYfANAWOCksNqQBMyUBaJrpCRQgZiCF0zJmMAUn5SH21OQYRgjAEr3uf1TArJj6YE3nXeESJURN34K3duJJKRyDkMiQMlhx4pK2W-Jeam16b23s8-eh9tOn1AVfagNiwGSEfmkl+b8BAfy-j-Lp-9pkgO+eQCBlDCn+MQa-FBaCMFYMUDgvBaC1FEMwCQyE0SKF-NoDQuhmDGHMIXj8hLsD5GCD4QIoRIiPkSNOegaRsj6uKOIMotAOW37RNmUgHRei-HTJMWYlAFirG+Y8XYvkDjyBOOns1tx6D6neOWZkjxCTAn3LJKE8J+Wvn5N+bE3b8D-NBZSTXdJ88smSBycSM7tXTDFNKeU6eK9En0MkK-TbjTq7XdaQIdpnTunzxkR8gZkBhkrLGZMgBQDhvzMWT4pL4CSEbOnrPN+OyMf7Ozkck5ZyMHf0gAc5HtygkNKeUyVBhy4TvP6admrJX8RApBThyD+Ht0Ip5SitF2qsU4tIHiglRKv2GuNbS49jLTIsrZRy4gXKeUeurUKkVYqJXbtMtK2Vr6lVktVeq4VWqSC6vA1B2Xpr5epqtTa6l9rHWEtXZAV1gz3WeoHb6qQ-rA3BtDVIcNkbo3sqzfG0yibk2pvTXrrNqvc3UrIIW4tWHy1S87T6utDam0tuIG2jtCLNTdtGhNftPqh3SqNKO4g47J3TurfSzdi7y+u+dfijdC6E+7qGgeo9DLT2DPPYMy9Aqb1ztbw+qUT6k2kFfYm0FH7IDS4Zb+o9-6pSAeA5LsDm6IN4egz6g-cGQW3tb-XqUKH5UYbhwannR+COWGDsHQwPGsFogZPxwTqOACVkmloloAALIfP1AIOQAvB8N3McvciVPXOVIKDQL-OyLQHyAcpiAyJgEgMiFsEaMTsNiQgIhPJMoKIRo+PvKtq4nwGoqsvoicrUmUssklnyN-DQJvFyJPAiIfPVncnIjwnwqYuYiIgNuIg-KYDjrCBgnCLIOMigOcqwmgvkm0ugB0rIj0tDqzrArgkgDgJYLHMQBQc4mtjQQ9qdq-EwVMmYqfESPojXLQJ-CwtEqMhMlYSjsJnMgTssnfHFiQg4jXN5lDn0mYasqDuDrIs4rSF-LgtQACgYUYVQSgOtqziwqwQyOwUfEIHkrYYIvwpgDIWYjwMwc4Yjm4UJiJmjrsj4UvP4adhocEZ8qEWwioWoZFpEegNERPIvNVmwhlllkyKIf4vtmfGQvcpnOgsIlnNjrIfIRgrwdEsYdQR8nESqpgM3F0dEukbgsQIADgE3GzGn+DIgAuARo73KbGUC4KRIXxoAkI9ImHlzUAkKZybzHLED0G-bECMhYKPFeb3IFGmLoJpKyCChFEjYVbCKkFHyyB5JY61Ic78EKJ8IIjPwoLsiKBAlzz3JojCJSELw472YMiEbDLxbwnrIzEKEbz5LTKo6CDoAMKPFJZ3FLFCAkI7GUAkLTwnGrKBaYDcgyH5aRL3IoBEhwh0hzE0A7wM75ZtZnK-yHzraVG9bCloBVJ1L5LCmin0gIKcKSmoAnagIxFXwDGsF0hICbyrLshIBYEzyZH3KUBpI0BLI8AdF-FlLM5kjiGnztGdFkHboLwLKfGTJMieJUDE7RLUkeEBFf5dFBJMlJESAMmvF0ijJYC2lwKbwyK0DKBtaZnVwymzEDHoD1IomM6Hy8mYAikumWJ8E9Jkiig8B4KM6YIXGUA3wFaSIdYyJdLyl8I7JKkqKqm2KyCZa0C4LBmgJ06oBIDuJbzfBVR8FkjUByHLIIgADcvWAgNpoC9BTiaClAh8QSBRlpa5fBbis81pHJe81A3ccIHyEmggaImAky9yigvAZICCqyb8gWZCQgm8oCyZJpaA1ZOS2Bam3RACTIO82ZnizWygSpoyKApp1ZQSDxomHZnWkWWBfwwmjIzBQSiyam3CZIEmyB55f8lyDIm8MCf5fCUSbC9BbOvhcJF2ZZQZi8F8lAgoch75jFp87ps8gFZp5hRR5AzZmcN8hGr+vWAAXmAC4r-D-u4RUWJhJlJjKGkvSLINyMAmPBPJsnjgvI5qvJSa5nvAfFCZgF5hfD5n5vfIFvdgvKFo4RFn-PadFnRSSRdkluySlqgugggn0WOaooQohSdoVmwsVhdmVtdgwlnFVq9vCd1o1vlrBa1t0bKZFklUosqcFT0RopGaNpIDucjtWUIdNqVdYvNt4o4pgoketh4g0nSNtn4ntrTiEkwsdlcQlSxZjpIJITdhko9nIrkt1Ylh9mUhUj9jFf9mqQ0k0iDs0WDqoRDhBZoQ9noXDiMqUSVajl4SsldrCfiQZZUYTqGYcq8ehQoZckdjcvqQdo8p-Azq8sztQDDrxQUv8lzoflBnCgLkiqiuipitivzhLqBtLjbranSgykOqyuypytyryprsKqKuKirlKjKnKmhoqsqqbsQBqhbjqnqgfhDSajOgyg7tarai7iui6m6hrl6lXn6teoHiGjWiHo+BGvBjGpHgmkmmhimnmhmkeqqknnmqnihunsCmWhWgKs3rno2sNM2q2qCu2paiXmXr2pXoOorsOrXh+vXhOlOmTVPgupAEuh3qul3lKJfjukev3kBoPieoeiPv3uPteghtPvCrPoyvPovu+p+squvjWn+oegBgPiBkSuBo-j9TBqfvBhfj3shqhuhgnlhtHfhpiEAA");
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
