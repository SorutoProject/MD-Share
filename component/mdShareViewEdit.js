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
		window.open(location.protocol + "//" + location.hostname + location.pathname + "?q=DwQgtGBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoNYMgJgyAiDIGYMCANPApQK5LkB7argSkhfAcQAK1AQCtMAYyQJIAX0gQAfJADExImSq1ijVpD37AlEqAKV0CdpoFWbS-sD2DIA0GQIEMdSIBpzQL0MgKsMgBMMgGUMgOUMgEUMgHYMgDAMgA2mgPGRgDrygAhGgLAMgPpWgL8BgCEMgIAMMYAXvoBjaZlZgEkMgP7ygGIMgNlpLnmAewyAPwyA9QyAAwwhgM8MgBhRDmYsUYCn7oAa0YAyDICj+oCBkXSAVgyAUQyAfgyAmgyAQAzExJCA6gyA0gxbeYBeNlssgMdpW0yAQQxRgOYMLoBCDEuA2gyAyQyrFgDiAgIA5ljXBQBtFodbp9AC6AApyEgkAAHADOOAA9EiAO7ogB03y+v0wGMUAgAtkj4ZgaIpyAB+RToFCYAB2SAAvAAzFC0FkCAAeYAARmAACYAMgAjkyAKQAUQAzOKAByygCckqlsoV4oAQgBhVXygBM4oAggAxXXquUABjNBsNADYzbKNbLJXKja7Fa7JfaneLFQBWACUaXKgBxLQBEvsdAP4Miy2gHCGapvZzERKpPIlSAARgxxBigGh-tKAHYZAP0MXTyi0A+gwuIqlYtdcqtQBXDIBhhlaxyabU6ddTJS2KzeWeI3eKY0AMdqAMLktuXAJEMBRTKUA3wwlNIhQDFDF1AJMMISigDPdQDQcnQ7oBohgKgF35QAa2oAwf8AjoqASHMbABVABKABlyoB8V3S9ebrb7mezgGUGf9rnXQBahkAU4ZAEOGLogiiItABKGIJAGuGPIkkAUADAFgVcpAGgdQBbBkPVcNxCMZAAsIwAuT0AVQZABiGctABYNQAIFQaMiqPLQBQxUATu06EAZP1AGMGFhAFmTJJjkAeQZAAMGcimH7bMP2Yp9X0AZoZABWGZo20AMYYQMAToYggCQBChjgxC6HPSd5jyUgADlSGuW8jN7NY-2IQBdBiiWTykAaNShMACwYUJSZjQMg6CSIoyjfyTfxgnCaJZKiQBVuUAEV9I18QJQkia5pMow9ZIaQBo+UACQZAAcGSAAAMisgaE4WRJFCQFeFjDxRQWSRSkxUIVEAEVviQd4NRawhMAAawAKUNLUAElDR4DVn0G3lDVhb5vgADUNb54W+EbDUledNsACH-AEB3QBTV0ASH-CuKqJAAiGao5iWZYxjyf8nJfWJGqZNJAFO5QBZNKiQBw00AdW1AHQlMZlkATwYWC85jgU7KJAHGGZoizGQBydUAOj9mKuS6+w2SA7uhosGkAVoZmkABYZmhxuD11uWYhLyCJWkAboZ1MnQA1hkAS4YQkANoYttaRm4IiaDifXA7rkAM8VADAXKjgsc8sPDyPHCbocHuixsZzyow9-3c8m8mcoYp1mQBFBko3K5brQAh5UAc0dlhV9yxmuQBZBlmJgJbyQAV60AYHjABC3QBI7UAC0VZY7bpylvG3gt0fQ7sS8KokAUYNAEYNSAACpY8MCgaEweP0eAeFCUodB0C0CEtQDPULQzRUyHEJBJBkeQlCQYgoRhBFyu+NByB4Xl8SJJExGoCRK4UZQA2AElM+znRICkTBqEJFB4XhFABHpYhp+IcgJ8wXkAE9iG+ahKEZTABXYYgWVoTBiAEFliApGhvkwQ-y+IXfN9hCf4Xns-eSQSgUHpb-vgfy+BCwnXpAc+xB+BL1fiyJAqJk4P3pAKB+M8BCKBQJQJA+9iACmQTwQkDJP6oDfmyLA8Ja78FPqIc+0Dk4IADHfSQAoyToEgN-MBK9S5QJgSYVEzcBB8GILQeESBqAoGUHPekh9v40h4AKX+xBuH8F4TXWkU98FiNYafYR3xoTwkgPfHgpJD4EiAYfQkAgZEsnXiYieN9D6wlbrSaqh8ZGCOEbyPgt9iDwnsSIhkBi4ECiREITxmBs6QCMXSEhoCyHsKobQQ+u8EH32fpPNAxBkmv3pCQ++qJBCEnUTEzhp9p6QBZDwagP9qoYPvlgzxAhD5eN5H3Gu99omcmzgIbh9I-4EngWgMRiILAABU2GUF5AIAAbqfIx69NHQmIPSAQqBFCnwSawpeySp4zzUQspZp9qpZ3QMQXkRT6RSIYQglhBywmAIiWfagnjW6CN3qgLOaShAEMyWfC+0SxAcOThiIZAAJSUZAADyxpBkAHVDSPhBcNUg0hHygoAGrDUIJKEgCBDQIvhRwYgkLhqDMBaC+8gz8UwsfIaUygyACaxBwXECpXSgA0sNUyhBD6SnmlIWFpAEWgsfJAYa+ApDPmGhiw+bKtTPnvIQNl7xiAalJcQUyoKyVivwISjFxBBmgp1cC8lj5KXUvFfy40BhJSPi1ICqlgzDQamGmK2lnBjSEtMpKPlxBjQCsZdIGFgzhpanvM+GF0gnxSFBaQEFVKSCqtMmy40j55WSnwJKal2Y2Uqr1ZKZFaayWkBtc+Z8+rJSQENKS4lj5+WPmIFqUFUgaVJveICslxLnzoqrYqkFYr7XPhBd6mtTLa0huFYfQghp8CGneB6+lNa1XAsFT2h1TqaWH0hcCollriCZqpYyrUAbQWmXpeaut1LKX7sPrqx8ZKfXzstQSqNh8YXwvlV6pF+BOAkpvean1mbT3uv3cNQ9+LCWApLWCiF0LYWzvA-eKNMG701vRYaMVpl3g4qPZuyApBwVQphZKAFlhiCACqGZogB1hi6H4Zo6lObUy6OpJMmdqC9X3hiOQOjnD6HwDQFjAoLBakATMlAWia4QkUAGYghcMwZjAFJuUh8tTkGEYIwBK97n9UwCyY+mBN51zhIiFETd+Ct3bsSCkcg5BIgDBYceKStlvyXmptem9t7PP3ofbTp9QFX2oDYsBkhH5pJfm-AQH8v4-y6f-aZIDvnkAgZQwp-jEGvxQWgjBWDFA4LwWgtRRDMAkIhNEihfzaA0LoZgxhzCF4-IS7A+Rgg+ECKESIj5EjTnoGkbI+rijiDKLQDlt+0TZlIB0Xovx0yTFmJQBYqxvmPF2N5A48gTjp7Nbceg+p3jlmZI8QkwJ9zSShPCflr5+TfmxN2-A-zQWUk13SfPLJkgclEjO7VkwxTSnlOnivRJ9DJCv02406u13WkCHaZ07p88ZEfIGZAYZKyxmTIAUA4b8zFk+KS+AkhGzp6zzfjsjH+zs5HJOWcjB39IAHOR7coJDSnmMlQYc2E7z+mnZqyVvEQKQU4cg-h7dCKeUorRdqrFOLSB4oJUSr9hrjW0uPYy0yLK2UcuIFynlHrq1CpFWKiV27TLStla+pVZLVXquFVqkgurwNQdl6a+XqarU2upfax1hLV2QFdYM91nqB2+qkP6wNwbQ1SHDZG6N7Ks3xtMom5Nqb0166zar3N1KyCFuLVh8tUvO0+rrQ2ptLbiBto7QijU3bRoTX7T6od0rDSjuIOOyd07q30s3Yu8vrvnX4o3QuhPu6hoHqPQy09gzz2DMvQKm9c7W8PslE+pNpBX2JtBR+yA0uGW-qPf+yUgHgOS7A5uiDeHoM+oP3BkFt7W-18lCh+VGG4cGp50fgjFhg7BwMDxrBqJ6T8cE6jgAlZJhaBaAACyHz9QCDkALzvDdzHL3IlT1zlQCg0C-xsi0C8gHIYj0iYBIBIibCGjE7DYkICITyTICiEaPj7yrauJ8BqKrL6InK1JlLLJJa8jfw0CbyciTzwiHz1Z3JyI8J8KmLmIiIDbiIPwmA44wgYKwiyDjIoDnKsJoL5JtLoAdKyI9LQ6s6wK4JIA4AWCxzEAUHOJrY0EPanavxMFTJmKnyEj6I1y0CfwsLRKjITJWEo7CZzIE7LJ3xxYkIOI1zeZQ59JmGrKg7g6yLOI0hfy4LUAAoGFGFUEoDras4sKsH0jsFHxCB5K2GCL8KYAyFmI8DMHOGI5uFCYiZo67I+FLz+GnYaHBGfKhFsIqFqGRaRHoDRETyLzVZsIZZZaMiiH+L7ZnxkL3KZzoLCJZzY6yHyEYK8HRLGHUEfJxEqqYDNxdHRLpG4LECAA4BNxsxp-vSIALgEaO9ymxlAuCkSF8aAJCPSJh5c1AJCmcm8xyxA9Bv2xADIWCjxXm9yBRpi6CaSsgAoRRI2FWwipBR8sgeSWOtSHO-BCifC8Iz8KCbIigQJc89yqIwiUhC8OO9m9IhGwy8W8J6yMxChG8+S0yqOgg6ADCjxSWdxSxQgJCOxlAJC08JxqygWmAXIMh+WkS9yKAhIsItIcxNAO8DO+WbWZyv8h862lRvWwpaAVSdS+SwpopdICCnCkpqAJ2oCMRV8AxrBtISAm8qybISAWBM8mR9ylAaSNASyPAHRfxZSzOpI4hp87RnRZB26C8CynxkyjIniVAxO0S1JHhARX+XRQSTJSREgDJrxtIoyWAtpcCm8MitAygbWmZ1cMpsxAx6A9SKJjOh8vJmAIpLplifBPSpIIoPAeCjOmCFxlAN8BWkiHWMiXS8pfCOySpKiqptisgmWtAuCwZoCdOqASA7iW8XwVUfBpI1Achyy8IAA3L1gIDaaAvQU4mgpQIfEEgUZaWuXwW4rPNaRyXvNQN3LCB8hJoIKiJgJMvcooLwKSAgqsm-IFmQkIJvKAsmSaWgNWTktgWpt0QAoyDvNmZ4s1soEqaMigKadWUEg8aJh2Z1pFlgb8MJgyMwUEosmptwqSBJsgeeX-JcvSJvDAn+XwlEmwvQWzr4XCRdmWUGYvBfJQAKHIe+YxafO6bPIBWaeYUUeQM2ZnDfIRq-r1gAF5gAuK-w-7uEVFiYSZSbShpJ0iyBcjAJjwTybJ44LyOaryUmuZ7wHxQmYBeYXw+Z+b3yBb3YLyhaOERZ-z2nRZ0UkkXZJbskpaoLoIIJ9FjmqKEKIUnaFZsLFYXZlbXYMJZxVavbwndaNb5awWtbdGymRZJVKLKnBU9EaKRmjaSA7nI7VlCHTalXWLzbeKOKYKJHrYeINK0jbZ+J7a04hJMLHZXEJUsWY6SCSE3YZKPZyK5LdWJYfZlIVI-YxX-ZqkNJNIg7NFg6qEQ4QWaEPZ6Fw4jKlElWo5eErJXawn4kGWVGE6hmHKvHoUKGXJHY3L6kHaPKfwM6vLM7UAw68UFL-Jc6H5QZwoC5IqoroqYrYr84S6gbS4262p0oMpDqsrsqcrcq8qa7Cqirioq5SoypypoaKrKqm7EAaoW46p6oH4Q0mozoMoO7Wq2ou4roupuoa5epV5+rXqB4ho1oh6PgRrwYxqR4JpJpoYpp5oZpHqqpJ55qp4obp7AploVoCrN656NrDTNqtqgrtqWol5l69qV6DqK7Dq14fr14TpTpk1T4LqQBLod6rpd6SiX47pHr95AaD4nqHoj797j7XoIbT7wqz6Mrz6L7vqfrKrr41p-qHoAYD4gZErgaP4-Uwan7wYX497IaoboYJ5YbR34YYhAA");
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
