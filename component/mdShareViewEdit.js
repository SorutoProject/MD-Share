/*

 Online MD Document Share
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
		var pageData = "DwQgtGBQDekJACIAuBLJAbApggXAgsgCIAEAcgPZKaAeDIBEMgYgyDKDILoMCANPAgIYCuSAFuQBOuBAGVhfcsQAKQ8gCtMAYyQJIAX0gQAfJADExImUo0GLSACpigBtNA6gyARBkB7DIB+GQPUMgAYZAZQyBnhkCTDIC1DICnDICHDD6AEwyASQyAOvKACEaAmgyA0QyA1gyA9gyAgAyAMAyA0P+AsAyAOwyA-Qw+kW6AVwyAwwxudoBmDIDyDIAGDICqDA6AQAxWxICOioCQ5k2AMQyA+gyAcwwu4YAyDIAWEYBcnv2AVgwOgCwagBAqGQCqAEoAMoCLDICXDCEuhWOAxtZ2dYC0UYBZ2v01DomA0gyAXR6AsVG1jS2tQA";
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
		var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
		$$("#saveLink").value = location.protocol + "//" + location.hostname + location.pathname + "?q=" + userMd;
		console.log(userMd);
	});

	$$("#infoButton").addEventListener("click", function () {
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=DwQgtGBQDekJACIAuBLJAbApggXAgsgCIAEAcgPZKbECSAdgGbkBOAtgIarl0IA08CdgFckACxa4EAZRYjyxAArNyAK0wBjJAkgBfSBAB8kAMTEiZStXpM2nFNxOmAwuQAOAT2YoA5qKSQAKgDzCiog4mJIYABnDnR0AwAKJwBKACYABgBGAE5iGWY5RWU1TWJEvyRXaJwAelrvNFEhACMAOnVyVlqCuSVVDSQU4FrY9nijSAVMNhRo6Ps6YjniURnMFvdib2Z2OioAE15iBmZManIGYnVRdmZvTGOkeT2t1xno7mJyFqR2FDoAO8xHY1zc7kgl2IYhWnwYSAA7ndqHsDiD5uR1ChOJg0QdMUJWJh9nYvgwUFhouUxNRpJdEciECknvIDphxpAAdC1vl6UizsQEU1yCJiGdokgvJpFscAep0EIDkDBcLRegUKw0KSljSxT4-NFIM9iEJoo8wR5jqxyEqGO4rTMHsdXK11dFRMclRKvC0ROboq6UOpiWbjqjaixiGb4pBOq4UJgqVDdTJ4fzzajofJ3rMkMQc586FTjQjxKxudRUwyBXNIAwhMxAe7cVniPio+RjgGWqU88bdUx4uQhXRgZ06EquEWcJBIAAVHnsFrkABu1Djnn1ebolCDKIn3JWOc180WxB3qGDUdu8WILWocoVbLRXPG6FjbgTSeYUdaEr2qDjPmLBTkmVwpnyyJtLOc4ABIAKL5AA8gAYnOADqACCABKiE0FIijYUhABqNCEPBJAIJhBH4XwxDoTQcFIQAqnO9E4dhmGkHOACaxCocQXF8QA0jQpCEMc8EABoKLhUgEUh2GQDQ+AKAAMjQFHHGJThqcxhBiQA4sQABCrFkEhbEafgjEUcQc5IfZCHsdhnHcZpCkoWY8HYU4sFcXOmEmTQGm8fwKGMaQ8HycQKGKYJig4XONBOMxak4YozHYQoSFSIhXEkKQSGkGJKHYUZ8H4PB3FtLQpAWcQ8HEdVbFSP5alqU58GQJhrGwYpCnYcQThIQoPHlYZsFsf1ankdhBEmYhGlBWpiFxUNQnDelKnHIQmH4JhhnRfxQ2WQhSnLcFoU8cc6EIXBPl1YJ9WYU4yXFfxXkjdxnFvccDnYWx8VnT5DF5ccOH4UZsVEfg-AsUDXnxWJw3FVFb00B9DFwV1yFoVhuEnbjzF5UTINDeRmEaaQhk0fVD2QFIqEYTh8HQY4-HvEsMgNleal7kWmCOKYHDMAA1ribQqIawumPgdwSwcs4uB4Xi+HmiTqCkxCZFkWRgLrAAcxxOKIXgSm4aw-gAUpgDCnJgWwVEgVQ1PUjRiK0HRdLUNwqCotQpLO0yzKeXwrFbGxbDsAG4scDsXFcNx3E6ravPmHxfD8fwAsqoIbpC4GiLCkECpm7AYliOJ4gSRIklOJwUom1I8nSaaMsyrZshyXIQe3ApCmIIp5uKkpBlOsp0PKirKoP4hqhqWoN7qasGka8imuaG5WjaKB2g69zmi6LRuh6bZzGPvpUF2gbBoLYYThGP7Ru+cZft8ReVqXGYHsax5oBnZghZizyFLF0CsvJ+4PkNPWRscw1homNO2T4N8eyDFbAOcgQ4Rxjm4JORYNQYKLmXGuC0m51bnl3FeTMMIqT-zDksC8e5rxvjvA+KeT4WwAkgKwt+zdIzdn-PsbE6BgLMFAh-CBVZ0zswenjFmhN8KERImROyVEaJSDotjfq5kCZuV4p9Z6IkxISUajJOSg1lKqQ0lpOqul9LQzMmxIqVkVK2RIA5XGeiAoeUMVVXy-luJBRCoxG6kAIpziijFdaCUFBJRSmlDKCgso5VJgVCyJVSBlQqlVGqT0iqNWatxfI7VOoM16kxeaRMRpjQmlNYgM05oLSWjQFaa14qbV0phHaxA9oHSOoNfiD0LqtKuqE2691zpPS4oJDGH0BLfTnL9Oc-1FJA1OsMsG8EIblSkNDMqSE4aQARoY5G9Vvro3evVbRuMmb41ZkTORJNELA2Gb0+CVMjJ03nM5O5Ci2azmMECuWCt8QIjoMrcEq88wAEqdYZAyAAFmONbcgogliGUKPeH8kBKiuDqLUA4dwgTkjOC0N8bQ6CYCQLUSImFbzQqpOKGYa4Djs2wriC+PoRBnkzJvZYSxPi833GiFoAI7hbBsKwaIxw57fB-HPYexBrS2iDNqMMAp-4uxbK4ZQK4UDPm5JwCBg50DDmVOOfB3AqTImVdSmcgRiAcq9JfHl1rJFCuYFeTobJlWmhHtS-4OpiGrnXFCrclDLzmlocQN0eYoSWrQAQkEv8eSmvNaOc+0R5T-CJMwaCAQnWcu9CgK+yauRiroBKk4LByysH9WKTAuqbRCCvLqJcoayHQsjXuJ4xcqRxskYmiRNC01YLNTgrNOaNQzAFRA-E6hCTEj+A3cMkZKBW2VTiLw4w6F6oNS2OVuoXXcqnAWsgmAmizt1FWokxBAA4BPLcWYK6CAFwCShP4b3sCJGBZYSAqTjldc8IBW6tj3hNGaRB8hiT4iARcH8zbrRUHzMoA4rb-1thmCgVlJxlDlhjXCas1BFWimiO8LE5J1AofsAqrw2qlj0IWNwWR-aOxQOWHu1cB7RVbF1Bubt4h0BshA5mQDp6WBUnvRXDj77y50C2JgAAHrqxM35lisFcOqQ9dxdjCMTJPaeSpRzHCvpG2Ni9DhZj7Q+DTWm0T8l06gfhVw83JxJGK9USAtiZnJEgKl8wa0-lBK4O4l4hDoDuPmBsrhyBmhBAKL006iRstoIw6Da59gsNvHx8NFDhxUp-JGMTpa5AgfA+qJcWBAspq2EqM4mhJ51cGAZg9JJ0BdnIyI44SnMC2YlccIr1rMAAEchDLpEW2b97AHhUkSI+Gexm7yigvOZzUlnnjOmUIus4dd41XEEagJAfptjkBtGps0zB9XBmiAAbljbF39m9PScHYANhDyhfO3flUthY-mqQAioMwQorgpza3EAiTAa4fzqGEJBlNaIvjpxpCwLYUIKsebQPaQUawaQ-i5GJ9gDWoxjzKOjikmO3tZnEeUebRngRUu8OqB4U94PfFx0KM02tiW-eBK+eTgp2Co9FMmHk-KRclygd1jLywrjsAOPquHIvqAxdPBjrzHrW2iEmxwB47NgWxoAF5gBLaOSFqsI2a21rrAAzPmBMyhFMQimDME8TGlgR3WJsbYjm464fOEO24h8WQ1cAYWb4vwg15zIYXQ8VJCPpnh+iT4VdLMLqXfXM85JKQt1pNIjuwfu7vl7jyPPA9VQBpLdKbgBmnyz3L6tpeZ4V5bkNMaJ7ZCd62ix3m1Ox9T6ei5SV6+v4T4C1DPDp+UZMAxj4b+vuRGH5QcAWt0P7qSxlikd-DjdYGxNgQV3eQKCR+9gwWO7BFq8FJutQ6hcKISFhvNxQph1DU1Hhd3MN3ParzulYeB2nXClg3wPx4x+Fn4-w-hhEgIYtxFk0ldIEiNZFflmYCY8ICJZIVFyJKJqJaBNFbpGIdE2JvFuI+IBJNpRJxJJJzFopLEVJ1JNJTEdI9IDIaZTJzIXFiBrJ3F7JHI5EiDkpjoBJ-E-IApglrpwpIpqDYoOlEpAYEl0ohpklspcp8pxIMlSpyoaZKoWpaoUYCkmoWoSkqYykEIeo+oBpqlRpxoaBJppokJZofJmkODRlVopCNpSA+Iukek+lDoBCNlzpIBLoQkwp6JJlHoUYZlXorlDFFlllVlAYyZNl8JtlBJdl9lYZ4ZzIBIzlUZSBLlMZrl8DblkCHl4onlSZXkplKZqZaYnoGY-kUC2ggA");
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
