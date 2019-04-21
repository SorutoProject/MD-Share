/*

 MD Share
 (c)2019 Soruto Project.
 
 Ver.2019.04.16
 
 MIT Licensed.
 
 Required:
 
 	lz-string(https://github.com/pieroxy/lz-string/)(MIT Licensed)
	marked.js(https://github.com/markedjs/marked)(MIT Licensed)
	highlight.js(https://github.com/highlightjs/highlight.js)(3-Clause BSD Licensed)
 
*/
//marked.js config
;
(function () {
	var renderer = new marked.Renderer()
	renderer.code = function (code, language) {
		return '<pre><code class="hljs">' + hljs.highlightAuto(code).value + '</code></pre>';
	};

	marked.setOptions({
		renderer: renderer,
	});
})();
//flags
var flags = {};
flags.edited = false;
flags.presentation = {};

var $$ = function (e) {
	var el = document.querySelectorAll(e);
	if (el.length == 1) {
		return el[0];
	} else {
		return el;
	}
}

//ページの読み込み完了時
window.onload = function () {
	//IEを弾く
	if (getBrowserName() == "IE") {
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
		var pageData = "DwQgtBBQDekJACIAuBLJAbApggXAgsgCIAEAygBYCGATpoB4MgEQyBiDIMoMgugwIA08ClArknIB7argSkRAocQAK1IQCtMAYyQJIAX0gQwAPkgBiA8SJkqtSMADOAW0rp0uwPEMgaQZAUQyAQhkCaDIHkGQKMGgIwagEkMgLjygBIMzIBADMAA9Lb2jpCQAFSpScnEgA2mgOoMgCIMgHsMgD8MgPUMgAMMgGUMgM8MgJMMgLUMgKcMgIcMlYATDEGAOvKACEZegNEMgNYMgPYMgIAMkMRjxBkyAMKAdgyALBqAECrDgDAMmYDxkYCwDEHFgFcMgMMMxdmAfgxekaPjGYCdDPmA2wzzS0PLjYDTDPWFG4BJhKubM4BgGX27A7HU4pYiAR0VAJDmgFUGQAxDIB9BkAcwyFFqAGQZABYRgC5PWGAKwZcothgBVABKABlAIsMgEuGRqFQD9DCjAMbW2R8gFoowBZ2rDAGYMuR6LkAXR6AWKjshyfIADBihuTOGUANOYAdUwACNAEUMgHWGHYzQD+8oAKV0AnaaAVZshhTACUMgG6GSqXQLYwCWDANzmNJrN8Y9AltAYcOQLAOYMgFkGE5ncYTYjXO6Op6vd5fZ1-AH7N2en2nM4pNKg2UKlU7Ab4ACSABViCSUMpMAA7KyYGaAaDk+oAbRUA0amc3K+saQbN5gtF0vlwBBloBAyIGgFO5CszQAWDIApBjcHpBumIAEYAHTEFgzQC9DIBVhha5UA5QyKoKABqiPYAghkAhI6AfEUPUfAGxKgAU0vqARyNAMYMHMA9kES5vTuEi7JDQDqIe1AJRWmKjgwgDODFKgCMUYAf1GYkEa4btuMxeIAngwcjMgDgkYAvxFHHCAyALOJPbYoAFwmAGBKfSABhRgCQ8dk2KAIoMMKAA4M2KAJEMuJnNOABMC7tIAoAFYQMv5-lxwywVuip9IARalCsA8q6MAfC6NigDJDIxgA1MYA33JBIABTFOCxsRybE0mQPo06AKj6mqAMKKgBY-8AlDEOQtAAGYALwIOQSBIAADlYOAxDECiUHOADuKAANYoO5mAACYoP5IgAOYxEFoUxK2AD67YlmWCDEEgNCxZgSDOSl8roJQxbBQguitvmhYZZgxBgMQMohWFkXRbElD6NKcpKqqQRar0LDDn0DBuEMVXpZ2MyAKGKgCd2n0gAwKoA8IawnCB4joA-gzYrCTbEJYNl2ZgTkIHOMTkJg6DuTE6A1Z2c6uTY6BZTl1B5QVCBFSVZUVUaprmgEMyAM5RgAMvgMLCAIYMjEuIxgAqDIA5ZGiuK0QxB1QA";
		//グローバル変数
		mdWithInfo = LZString.decompressFromEncodedURIComponent(pageData);
	} else {
		mdWithInfo = LZString.decompressFromEncodedURIComponent(arg["q"]);
		console.log(mdWithInfo);
	}
	//There is not md data
	if (mdWithInfo == "" || mdWithInfo == undefined) {
		var NMDPageData = "DwQgtBBQDekJACIAuBLJAbApggXAgogE6ED2hABGOQLIAi5AygBYCGh2ANPAiwK5JMyuBAwCeAZySYAtgkgBfSBDAA+SAGJyRUoQ2btZcgGMSAE0w5yAFSaZ25FOPIA7EknKmSR3tMzP3pixILAB0kICncoDQcoB2DIAiDIBaDIAxDIDSDNGA+cqAB2qA1gyAEQyAUQyAgAyAWwyAPwyAHQyASQyAFhGAXJ6A5gyAsgyAfgyA2gyAyQyAQAyQkABU5ACqAEoAMoCLDICXDICHDCWA-QzR5AgAjgjkE9MzWYCEjoCdSoBWDIAkCoAyDIDgxoBZ2oCqDImAZgyxgNEMXX2AYwyAtQyAnQyAEwyAowaAjBqHAAyABYZACUM72igEmGZ6AU4ZJoBnhnedUAQgz3XrkQDKDNFAGsM40AZQyANoZDgUhmMprN5ksVmtSfsKoAzxUAYC6NXaxDpAA";
		mdWithInfo = LZString.decompressFromEncodedURIComponent(NMDPageData);
		$$("#editButton").style.display = "none";
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
		newDoc();
	});

	$$("#editButton").addEventListener("click", function () {
		editDoc();
	})

	$$("#newWindowClose").addEventListener("click", function () {
		if (flags.edited === true) {
			var conf = confirm("編集内容が破棄されます。\n生成されたURLも削除されます。\n生成されたURLをメモした上で続行してください。\n続行しますか？");
		} else {
			var conf = true;
		}
		if (conf === true) {
			//現在フォーカスがあたっている要素を探して、フォーカスを解除
			document.activeElement.blur();
			//テキストの選択を解除(スマホでのバグ対策)
			deSelect();

			$$("#new").className = $$("#windowBack").className = "";
			$$("#editor").value = "";
			$$("#saveLink").value = "";
			$$("#preview").innerHTML = "";
			document.body.style.overflow = "";

			window.onbeforeunload = function (e) {};
			flags.edited = false;
		}
	});

	$$("#previewCheck").addEventListener("change", function (e) {
		if (e.target.checked === true) {
			$$("#preview").style.display = "block";
			$$("#editor").style.display = "none";
			$$("#preview").className = "show";
			$$("#preview").innerHTML = marked($$("#editor").value);

		} else {
			$$("#preview").style.display = "none";
			$$("#editor").style.display = "block";
			$$("#preview").className = "";
		}
	});

	$$("#editor").addEventListener("change", function () {
		window.onbeforeunload = function (e) {
			return "編集内容が破棄されます。続行しますか？";
		};
		flags.edited = true;
	});
	$$('#editor').addEventListener('keydown', function (e) {
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
		if ($$("#editor").value.indexOf("<!---") === -1 || $$("#editor").value.indexOf("--->") === -1) {
			console.log("input user info");
			var title = prompt("このドキュメントのタイトルを入力してください");
			var author = prompt("このドキュメントの作者名を入力してください");
			var updateMd = '<!---\n{\n\t"title":"' + title + '",\n\t"author":"' + author + '"\n}\n--->\n' + $$("#editor").value;
			$$("#editor").value = updateMd;
			var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
			var genURL = location.protocol + "//" + location.hostname + location.pathname + "?q=" + userMd;
			if (genURL.length > 5000) {
				alert("マークダウンに記述された文字数が多すぎるため、URLの生成をキャンセルしました。\nマークダウンの文字数を減らしたり、内容を2つのマークダウンに記述したりしてください。");
			} else {
				share(genURL);
				console.log(userMd);
			}
		} else {
			var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
			var genURL = location.protocol + "//" + location.hostname + location.pathname + "?q=" + userMd;
			if (genURL.length > 5000) {
				alert("マークダウンに記述された文字数が多すぎるため、URLの生成をキャンセルしました。\nマークダウンの文字数を減らしたり、内容を2つのマークダウンに記述したりしてください。");
			} else {
				share(genURL);
				console.log(userMd);
			}
		}
	});

	$$("#presenPreview").addEventListener("click", function () {
		presentation.start($$("#editor").value);
	});

	$$("#menuButton").addEventListener("click", function () {
		var now = $$("#tools").className;
		if (now === "close") {
			$$("#tools").className = "";
		} else {
			$$("#tools").className = "close";
		}
	});

	$$("#infoButton").addEventListener("click", function () {
		window.open("./help/index.html");
	});

	$$("#temButton").addEventListener("click", function () {
		window.open("./template/index.html");
	});

	$$("#presenButton").addEventListener("click", function () {
		presentation.start(mdWithInfo);
	});

	$$("#presentationBack").addEventListener("click", function () {
		presentation.back();
	});
	$$("#presentationForward").addEventListener("click", function () {
		presentation.forward();
	});
	$$("#presentationEnd").addEventListener("click", function () {
		presentation.end();
	});

	//エディタのMDでよく使う文字ボタン
	var editSymbolButtons = $$("#mdSymbols button");
	for (var i = 0; i < editSymbolButtons.length; i++) {
		editSymbolButtons[i].addEventListener("click", function (e) {
			if (e.target.dataset.text) {
				addTextToEditor(e.target.dataset.text, e.target.dataset.fs);
			} else {
				addTextToEditor(e.target.textContent, e.target.dataset.fs);
			}
		});
	}

	//印刷ボタン
	var printButton = $$(".printButton");
	for (var i = 0; i < printButton.length; i++) {
		printButton[i].addEventListener("click", function () {
			window.print();
		})
	}

	if (arg.e === "t") {
		$$("#windowBack").className = "show";
		$$("#windowBack").textContent = "お待ち下さい...";
		setTimeout(function () {
			editDoc();
			$$("#windowBack").textContent = "";
		}, 1000)

	}
}

// プリントするとき
window.onbeforeprint = function () {
	//新規作成・編集ウィンドウ表示時にプリントが開始されたら、プレビューを表示する
	$$("#previewCheck").checked = true;
	$$("#preview").style.display = "block";
	$$("#editor").style.display = "none";
	$$("#preview").className = "show";
}
//for safari
var mediaQueryList = window.matchMedia('print');
mediaQueryList.addListener(function (mql) {
	if (mql.matches) {
		//ここに書く
		//新規作成・編集ウィンドウ表示時にプリントが開始されたら、プレビューを表示する
		$$("#previewCheck").checked = true;
		$$("#preview").style.display = "block";
		$$("#editor").style.display = "none";
		$$("#preview").className = "show";
	}
});

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

function newDoc() {
	$$("#previewCheck").checked = false;
	$$("#preview").style.display = "none";
	$$("#editor").style.display = "block";
	$$("#new").className = $$("#windowBack").className = "show";
	document.body.style.overflow = "hidden";
	$$("#tools").className = "close";
	$$("#saveLink").value = "";
}

function editDoc() {
	$$("#previewCheck").checked = false;
	$$("#preview").style.display = "none";
	$$("#editor").style.display = "block";
	$$("#editor").value = mdWithInfo;
	$$("#preview").innerHTML = marked(mdWithInfo);
	$$("#new").className = $$("#windowBack").className = "show";
	$$("#saveLink").value = "";
	document.body.style.overflow = "hidden";
	$$("#tools").className = "close";
}
//COPIED FROM http://unimakura.jp/javascript/javascript-1.html
//テキストの選択解除
function deSelect() {
	if (window.getSelection) {
		var selection = window.getSelection();
		selection.collapse(document.body, 0);
	} else {
		var selection = document.selection.createRange();
		selection.setEndPoint("EndToStart", selection);
		selection.select();
	}
}

//COPIED FROM https://qiita.com/noraworld/items/d6334a4f9b07792200a5
//エディターのカーソル位置に文字を追加
function addTextToEditor(t, firstSelection) {
	var textarea = $$("#editor");

	if (!firstSelection) {
		var firstSelection = 0;
	}

	var sentence = textarea.value;
	var len = sentence.length;
	var pos = textarea.selectionStart;
	var end = textarea.selectionEnd;

	var before = sentence.substr(0, pos);
	var word = t;
	var after = sentence.substr(pos, len);

	sentence = before + word + after;

	textarea.value = sentence;
	textarea.selectionEnd = end + word.length + parseInt(firstSelection, 10); //十進法で処理
	textarea.focus();

	//編集済みフラグをtrueにする
	flags.edited = true;
	window.onbeforeunload = function (e) {
		return "編集内容が破棄されます。続行しますか？";
	};
}

//プレゼン機能の関数群
var presentation = {
	//プレゼンの開始
	start: function (md) {
		//初期化
		flags.presentation = {};
		//改ページ記号(---)ごとに区切る
		flags.presentation.slides = md.split("\n---\n");
		flags.presentation.nowPage = 0;
		$$("#presentationView").innerHTML = marked(flags.presentation.slides[0]);
		$$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
		screenfull.request($$("#presentation"));

	},
	//戻る
	back: function () {
		if (flags.presentation.nowPage > 0) {
			$$("#presentationView").innerHTML = marked(flags.presentation.slides[flags.presentation.nowPage - 1]);
			flags.presentation.nowPage = flags.presentation.nowPage - 1;
		}
	},
	//進む
	forward: function () {
		if (flags.presentation.nowPage + 1 < flags.presentation.slides.length) {
			$$("#presentationView").innerHTML = marked(flags.presentation.slides[flags.presentation.nowPage + 1]);
			flags.presentation.nowPage = flags.presentation.nowPage + 1;
		} else {
			$$("#presentationView").textContent = "最後のスライドまで表示しました";
			$$("#presentationBack").style.display = $$("#presentationForward").style.display = "none";
			/*console.log("flags.presentation.nowPage + 1 = " +
				parseInt(flags.presentation.nowPage + 1));
			console.log("flags.presentation.slides.length = " + flags.presentation.slides.length);*/
		}
	},
	//プレゼンの終了
	end: function () {
		screenfull.exit();
	}
}

//共有
function share(url) {
	$$("#shareWindow").className = "show";
	var urlEncoded = encodeURIComponent(url);
	$$("#copyButton").addEventListener("click", function (e) {
		e.preventDefault();
		// 空div 生成
		var tmp = document.createElement("div");
		// 選択用のタグ生成
		var pre = document.createElement('pre');

		// 親要素のCSSで user-select: none だとコピーできないので書き換える
		pre.style.webkitUserSelect = 'auto';
		pre.style.userSelect = 'auto';

		tmp.appendChild(pre).textContent = url;

		// 要素を画面外へ
		var s = tmp.style;
		s.position = 'fixed';
		s.right = '200%';

		// body に追加
		document.body.appendChild(tmp);
		// 要素を選択
		document.getSelection().selectAllChildren(tmp);

		// クリップボードにコピー
		var result = document.execCommand("copy");

		// 要素削除
		document.body.removeChild(tmp);

		$$("#shareWindow").className = "";
	});

	$$("#twitterButton").href = "https://twitter.com/intent/tweet?url=" + urlEncoded;
	$$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded;

	$$("#shareCancel").addEventListener("click", function (e) {
		e.preventDefault();
		$$("#shareWindow").className = "";
	});
}
