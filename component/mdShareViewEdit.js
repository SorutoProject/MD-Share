/*

 MD Share
 (c)2019 Soruto Project.
*/

version = "2019.11.03";

/*

 MIT Licensed.

 Required:

 	lz-string(https://github.com/pieroxy/lz-string/)(MIT Licensed)
	marked.js(https://github.com/markedjs/marked)(MIT Licensed)(Load From CDN)
	highlight.js(https://github.com/highlightjs/highlight.js)(3-Clause BSD Licensed)
    js-yaml(https://github.com/nodeca/js-yaml)(MIT Licensed)
    screenfull.js(https://github.com/sindresorhus/screenfull.js/)(MIT Licensed)
    MathJax(https://mathjax.org)(MIT Licensed)

*/
//marked.js config

//sanitazer(http://note.crohaco.net/2018/markdown-xss/)

const deniedTagCondition = /^<\/?(script|style|link|iframe|embed|object|html|head|meta|body|form|input|button)/i
const deniedAttrCondition = /^(on.+|style|href|action|id|class|data-.*)/i


function escape(txt) {
    //reveal.jsのやつ
    if(txt == "----"){
      return "<hr>";
    }
    //特定のサイトの埋め込みを許可する
    if(txt.indexOf('<iframe') === 0){
        var outer = document.createElement("div");
        outer.innerHTML = txt;
        var iframeEl = outer.querySelector("iframe");
        if(iframeEl !== null){
            var src = iframeEl.src;
            var srcHost = src.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
            var whiteList = ["www.google.com", "www.youtube.com"];
            if(whiteList.indexOf(srcHost) !== -1) return txt;
            else return '';
        }
    }
    if (txt.indexOf('</') === 0) {
        return txt
    }

    if (txt.match(deniedTagCondition) || txt.indexOf('<!') === 0 || txt.indexOf('<?') === 0 || txt.indexOf('<\\') === 0) {
        return ''
    }
    //letにすると、古いブラウザでバグるのでvarにした。
    var outer = document.createElement('div')
    outer.innerHTML = txt
    var el = outer.querySelector('*')
    if (!el) {
        return ''
    }
    //getAttroniteNamesに非対応のブラウザが多いので一旦保留
    /*
    let attrs = []
    el.getAttributeNames().map(attr => {
        if (attr.match(deniedAttrCondition)) {
            el.removeAttribute(attr)
            return
        }
        attrs.push(`${attr}="${el.getAttribute(attr)}"`)
    })
    return `<${el.tagName} ${attrs.join(' ')}>`
    */

    return txt;
}

(function () {
    var renderer = new marked.Renderer()
    renderer.code = function (code, language) {
        return '<pre><code class="hljs">' + hljs.highlightAuto(code).value + '</code></pre>';
    };

    renderer.link = function (href, title, text) {
        //console.log("href:" + href + "\ntitle:" + title + "\ntext:" + text);
        if (href.slice(0, 1) === "#") {
            return '<a href="' + href + '">' + text + "</a>";
        } else {
            return '<a href="' + href + '" target="_blank">' + text + "</a>";
        }
    };

    renderer.text = function (text) {
        //console.log(text);
        if (text == "(toc)") {
            return "<md-toc></md-toc>";
        } else {
            return text;
        }
    }

    renderer.heading = function (text, level) {
        var escapedText = text.toLowerCase();

        return '<h' + level + '><a class="anchor" name="' + text + '"><span class="header-link"></span></a>' +
            text + '</h' + level + '>';
    }

    marked.setOptions({
        renderer: renderer,
        gfm: true,
        sanitize: true,
        sanitizer: escape,
        breaks: true
    });
})();
//flags
var flags = {};
flags.edited = false;
flags.presentation = {};
flags.mathjaxLoaded = false;
flags.presenImage = {
    "length": null,
    "nowLength": 0,
    "reset": function () {
        flags.presenImage.length = null;
        flags.presenImage.nowLength = 0
    }
}

var $$ = function (e) {
    var el = document.querySelectorAll(e);
    if (el.length == 1) {
        return el[0];
    } else {
        return el;
    }
}

var showLinkConfirmTimeout = null;

//クリックイベント
var clickEv = "click";

//URLハッシュ変更時にリロードする
window.onhashchange = function () {
    location.reload();
}

//ページの読み込み完了時
window.onload = function () {
    //Block access with Internet Explorer.
    if (getBrowserName() == "IE") {
        /*
        $$("#doc").innerHTML = '<h1>本サイトは、Internet Explorerには非対応です。</h1><p>Internet Explorerでは、本サイトで利用している最新のJavaScript文法に対応していないため、本サイトを利用することができません。</p><p>最新の文法をサポートしている、Google ChromeやMozilla Firefox、Microsoft Edgeなどの他のブラウザからご利用いただけます。</p>';
        $$("#docTitle").textContent = "It's like garbages...";
        $$("#author").textContent = "From All Web Enginners";
        $$("#tools").style.display = "none";
        $$("#menuButton").style.display = "none";
        return false;*/
        //新規作成などのボタンを消す
        $$("#newButton").style.display = "none";
        $$("#editButton").style.display = "none";
        $$("#downloadHTMLButton").style.display = "none";
        $$("#presenButton").style.display = "none";
        $$(".printButton")[0].style.display = "none";
        sysMessage('<u>Internet Explorerでは、ドキュメントの閲覧のみ可能です。</u><br><span style="font-size:11pt">すべての機能を使用したい場合は、<br>ChromeやFirefoxなどの他のブラウザからアクセスしてください。</a></span>', 10000);
    }
    //Get Url Parameters
    var arg = new Object;
    var pair = location.search.substring(1).split('&');
    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        arg[kv[0]] = kv[1];
    }

    //get Hash Params
    var hashParams = new Object;
    var pair = location.hash.substring(1).split("&");
    for (var i = 0; pair[i]; i++) {
        var hashKv = pair[i].split("=");
        hashParams[hashKv[0]] = hashKv[1];
    }

    if (typeof arg["article"] !== "undefined" && arg["article"] !== "") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "./articles/" + arg["article"] + "." + "md", true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                loadMd(xhr.responseText);
            }
            if (xhr.readyState === 4 && xhr.status === 0) {
                loadMd(xhr.responseText);
            }
            if (xhr.readyState === 4 && xhr.status === 404) {
                loadMd("---\ntitle: ファイルが見つかりません\nauthor: Soruto Project\n---\n# 404 Not Found\n### ファイルが見つかりませんでした\n* URLが間違っていないか確認してください。");
            }
        }

        xhr.send(null);

    } else if (arg["q"]) {
        try {
            var md = LZString.decompressFromEncodedURIComponent(arg["q"]);
            loadMd(md);
        } catch (e) {
            var md = '---\ntitle: 内部エラー\nauthor: SorutoProject\n---\n# 内部エラー\nURLパラメータからMDをデコードするときにエラーが発生しました。\n* URLパラメータに不正な値が含まれている可能性があります。';
            loadMd(md);
        }
    } else if (hashParams["q"]) {
        try {
            var md = LZString.decompressFromEncodedURIComponent(hashParams["q"]);
            loadMd(md);
        } catch (e) {
            var md = '---\ntitle: 内部エラー\nauthor: SorutoProject\n---\n# 内部エラー\nURLハッシュからMDをデコードするときにエラーが発生しました。\n* URLパラメータに不正な値が含まれている可能性があります。';
            loadMd(md);
        }
    } else {
        //ホームページ
        var pageData = "LQhQBcEtwGwUwFwAICyARJBlAFgQwE5yAeDIBEMgYgyDKDILoMouAruNgPb7KYsNNIAK+TAVnADG4UCGCgAxKgw4CcUAB4AtgBNgANzj4AzpCYA7AHyKA9Gs3a9ho0p3LcMGEcDxDIGkGQFEMgEIZAmgyB5BkBRg0BGDUAkhkBceUAJBnJAIAYze0dnUFAAKlSk5KRABtNAdQZAEQZAPYZAH4ZAeoZAAYZAMoZAZ4ZASYZAWoZAU4ZAQ4ZKwAmGEMAdeUAEIx9AaIZAawZAewZAQAZQJDGkDO4AYUA7BkAWDUAIFWHAGAZFSCQhGFwdHQBeACIAMwIkY+AABxg6HWAdAEc6eX2TU0gjQFgGEOLAK4ZAYYZi7KAPwYfNFRuMMoBOhnygG2GeZLIardabbZ7I7bU64YAAIwIOmeZje70ASYSIjZbHYHY74DEXK43e6PQj415GLKAeMj3jNAGAZfR+-yBIJSSEAjoqASHNAKoMgBiGQD6DIA5hkKLUAMgyACwjAFyeUsAVgy5RbDACqACUADKARYZAJcMjUKgH6GRWAY2tsn5ALRRgCztKWAMwZcj03IAuj0AsVHZV1+QAGDOLcqCMoAacwA6nAsYAihkA6wzfGaAf3lABSugE7TQCrNkNTYAShkA3QyVCHBDWASwYBmCxpNZjqEWsySjKeizg84DooIZgEJIPhNnBmYSvn8Aa7fYBzBkAsgzA0HjCZIKGw2uk5EUtE6Gk43QDj4k+sr1HHdctuhtjsGLs9vvbpCADYZANcM8c5PL5I-HU5BoJSaSFUZjCe+AwoAAkgAKkghqQEIcAGDocAzIA0HJ9IANoqANGpbq5NOYygMBYEQVBMFwYAQZaAIGRAyAKdy8EzIAFgyAFIMHhjoKrIAIwAHRIBQMyAL0MgCrDC05SAOUMsYhIADVFjoAQQyAISOgD4imOEmAGxKgAKaX0gCORoAxgyuoA9kGhlhrLSoG2RDIA6iHtIAlFZqjRJCAM4M4aAIxRgB-UWqIQ8XxgkzD4gCeDK6MyAOCRgC-EYC0oDIAs4nERqgAXCYAYEp9IAGFGAJDx2QaoAigySoADgwaoAkQxaqCrIAExse0gCgAQFAzGSZBXDM5Amxn0gBFqf6ihYiYdBGBqgDJDOlgA1MYA33IhIABTEuFlZjNWYjWgLYrKAKj6qaAMKKgBY-zh4GQdBsFIMASCRpAADWkDnHAqiQLgP7RnGiYhGmvQUFRfQkB4QwLXhy1wYAoYqAJ3afSADAqgDwhlK0pidRgD+DBqUqYUgSQABRTAAlDlAAMTEAJxYBw4BcLwAjCOAYP3UtBGqCxkNAA";
        //グローバル変数
        var md = LZString.decompressFromEncodedURIComponent(pageData);
        loadMd(md);
        //バージョンを表示する
        if (document.querySelector("#doc md-version") !== null) {
            document.querySelector("#doc md-version").innerHTML = "<small>Ver." + version + "</small>";
        }
    }


    //addEventListener
    $$("#newButton").addEventListener(clickEv, function () {
        newDoc();
    });

    $$("#editButton").addEventListener(clickEv, function () {
        editDoc();
    })

    $$("#newWindowClose").addEventListener(clickEv, function () {
        if (flags.edited === true) {
            var conf = confirm("編集内容が破棄されます。\n続行しますか？");
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

    $$("#previewCheck").addEventListener("click", function (e) {
        if (e.target.checked === true) {
            preview();
        } else {
            $$("#preview").style.display = "none";
            $$("#edit").style.display = "block";
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

    $$("#gen").addEventListener(clickEv, function () {
        //Change to yaml
        try {
            var mayYaml = $$("#editor").value.split("---")[1].split("---")[0].trim();
            var mdInfoJson = jsyaml.load(mayYaml);
            if (typeof mdInfoJson !== "object") {
                //console.log("input user info");

                try {
                    var elem = document.createElement("div");
                    elem.innerHTML = marked($$("#editor").value);
                    var firstElem = elem.querySelector("*");
                    var preTitle = firstElem.textContent;
                } catch (e) {
                    var preTitle = "";
                }
                try {
                    if (localStorage.getItem("authorName") !== null) var authorSuggest = localStorage.authorName;
                    else var authorSuggest = "";
                } catch (e) {
                    var authorSuggest = "";
                }
                Swal.mixin({
                    input: 'text',
                    confirmButtonText: "次へ",
                    showCancelButton: true,
                    cancelButtonText: "キャンセル",
                    progressSteps: ["1", "2"]
                }).queue([
                    {
                        title: "ドキュメントのタイトル",
                        text: "このドキュメントのタイトルを入力してください",
                        inputValue: preTitle
                },
                    {
                        title: "ドキュメントの作者名",
                        text: "このドキュメントの作者名を入力してください",
                        inputValue: authorSuggest
                }
            ]).then(function (result) {
                    if (result.value) {
                        var title = result.value[0];
                        if (title === "") var title = "無題";
                        var author = result.value[1];
                        if (author === "") var author = "名無し";
                        else {
                            try {
                                localStorage.authorName = author;
                            } catch (e) {}
                        }
                        var updateMd = '---\ntitle: ' + title + '\nauthor: ' + author + '\n---\n\n' + $$("#editor").value;
                        $$("#editor").value = updateMd;
                        var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
                        var genURL = location.protocol + "//" + location.host + location.pathname + "#q=" + userMd;
                        var genQueryURL = location.protocol + "//" + location.host + location.pathname + "?q=" + userMd;
                        /*if (genURL.length > 5000) {
                            Swal.fire({
                                title: "Oops...",
                                html: "マークダウンに記述された文字数が多すぎるため、URLの生成をキャンセルしました。\nマークダウンの文字数を減らしたり、内容を2つのマークダウンに記述したりしてください。"
                            });
                        } else {
                            share(genURL);
                            //console.log(userMd);
                        }*/
                        share(genURL, genQueryURL, title, author);
                    }
                });
            } else {
                var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
                var genURL = location.protocol + "//" + location.host + location.pathname + "#q=" + userMd;
                var genQueryURL = location.protocol + "//" + location.host + location.pathname + "?q=" + userMd;
                if (mdInfoJson.title) var title = mdInfoJson.title;
                else var title = "";
                if (mdInfoJson.author) var author = mdInfoJson.author;
                else var author = "";

                /*if (genURL.length > 5000) {
                    Swal.fire({
                        title: "Oops...",
                        html: "マークダウンに記述された文字数が多すぎるため、URLの生成をキャンセルしました。\nマークダウンの文字数を減らしたり、内容を2つのマークダウンに記述したりしてください。"
                    });
                } else {
                    share(genURL);
                    //console.log(userMd);
                }*/
                share(genURL, genQueryURL, title, author);
            }
        } catch (e) {
            try {
                var elem = document.createElement("div");
                elem.innerHTML = marked($$("#editor").value);
                var firstElem = elem.querySelector("*");
                var preTitle = firstElem.textContent;
            } catch (e) {
                var preTitle = "";
            }
            try {
                if (localStorage.getItem("authorName") !== null) var authorSuggest = localStorage.authorName;
                else var authorSuggest = "";
            } catch (e) {
                var authorSuggest = "";
            }
            Swal.mixin({
                input: 'text',
                confirmButtonText: "次へ",
                showCancelButton: true,
                cancelButtonText: "キャンセル",
                progressSteps: ["1", "2"]
            }).queue([
                {
                    title: "ドキュメントのタイトル",
                    text: "このドキュメントのタイトルを入力してください",
                    inputValue: preTitle
                },
                {
                    title: "ドキュメントの作者名",
                    text: "このドキュメントの作者名を入力してください",
                    inputValue: authorSuggest
                }
            ]).then(function (result) {
                if (result.value) {
                    var title = result.value[0];
                    if (title === "") var title = "無題";
                    var author = result.value[1];
                    if (author === "") var author = "名無し";
                    else {
                        try {
                            localStorage.authorName = author;
                        } catch (e) {}
                    }
                    var updateMd = '---\ntitle: ' + title + '\nauthor: ' + author + '\n---\n\n' + $$("#editor").value;
                    $$("#editor").value = updateMd;
                    var userMd = LZString.compressToEncodedURIComponent($$("#editor").value);
                    var genURL = location.protocol + "//" + location.host + location.pathname + "#q=" + userMd;
                    var genQueryURL = location.protocol + "//" + location.host + location.pathname + "?q=" + userMd;
                    /*if (genURL.length > 5000) {
                        Swal.fire({
                            title: "Oops...",
                            html: "マークダウンに記述された文字数が多すぎるため、URLの生成をキャンセルしました。\nマークダウンの文字数を減らしたり、内容を2つのマークダウンに記述したりしてください。"
                        });
                    } else {
                        share(genURL);
                        //console.log(userMd);
                    }*/
                    share(genURL, genQueryURL, title, author);
                }
            });
        }
    });

    $$("#menuButton").addEventListener(clickEv, function () {
        var now = $$("#tools").className;
        if (now === "close") {
            $$("#tools").className = "";
            $$("#menuButton").innerHTML = '<i class="fas fa-times md-menu"></i>';
        } else {
            $$("#tools").className = "close";
            $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
        }
    });

    $$("#infoButton").addEventListener(clickEv, function () {
        window.open("?article=helpTop");
    });

    $$("#fileOpenButton").addEventListener(clickEv, function () {
        $$("#fileOpenDialog").className = "show";
        $$("#tools").className = "close";
        $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
        $$("#mdFileReader").value = "";
    });

    $$("#fileOpenDialogClose").addEventListener(clickEv, function () {
        $$("#fileOpenDialog").className = "";
    });

    $$("#mdFileReader").addEventListener("change", function (e) {
        var file = e.target.files;
        //FileReader
        var reader = new FileReader();
        //Load as text
        reader.readAsText(file[0]);
        //onload Event
        reader.onload = function () {
            loadMd(reader.result);
            //console.log(reader);
            $$("#fileOpenDialog").className = "";
            sysMessage(file[0].name + " を読み込みました");
        }
    });

    $$("#dlButton").addEventListener(clickEv, function () {
        var text = $$("#editor").value;
        textDownload(text, "text/markdown", "md");
    });

    $$("#downloadHTMLEditing").addEventListener(clickEv, function () {
        exportHTML($$("#editor").value);
    });



    /*$$("#temButton").addEventListener(clickEv, function () {
        window.open("./template/index.html");
    });*/

    $$("#presenButton").addEventListener(clickEv, function () {
        window.open("./presentation/index.html#q=" + LZString.compressToEncodedURIComponent(generatePresenMd(mdWithInfo)));
    });

    $$("#presenPreview").addEventListener(clickEv, function () {
        //presentation.start($$("#editor").value);
        window.open("./presentation/index.html#q=" + LZString.compressToEncodedURIComponent(generatePresenMd($$("#editor").value)));

    });
    $$("#presentationBack").addEventListener(clickEv, function () {
        presentation.back();
    });
    $$("#presentationForward").addEventListener(clickEv, function () {
        presentation.forward();
    });
    $$("#presentationEnd").addEventListener(clickEv, function () {
        presentation.end();
    });

    $$("#downloadHTMLButton").addEventListener(clickEv, function () {
        exportHTML(mdWithInfo);
    });

    //#doc 一番上に戻るボタンを表示・非表示
    /*window.addEventListener("scroll", function (e) {
        var scrollTop = document.documentElement.scrollTop;
        if (scrollTop < 200) {
            $$("#scrollToTop").style.display = "none";
        } else {
            $$("#scrollToTop").style.display = "block";
        }
    });*/

    //上のコードだとスマホで重くなるので変更
    setInterval(function(){
      var scrollTop = document.documentElement.scrollTop;
      if (scrollTop < 200) {
          $$("#scrollToTop").style.display = "none";
      } else {
          $$("#scrollToTop").style.display = "block";
      }
    },500);

    $$("#scrollToTop").addEventListener(clickEv, function () {
        document.documentElement.scrollTop = 0;
    })

    //エディタのMDでよく使う文字ボタン
    var editSymbolButtons = $$("#mdSymbols button");
    for (var i = 0; i < editSymbolButtons.length; i++) {
        editSymbolButtons[i].addEventListener(clickEv, function (e) {
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
        printButton[i].addEventListener(clickEv, function () {
            if (getBrowserName() === "Edge") {
                if (confirm("このブラウザ(Microsoft Edge)で印刷すると、レイアウトが崩れる可能性がありますが続行しますか？") == false) return false;
            }
            window.print();
        })
    }

    //URLパラメーターによる動作
    if (arg.e === "t") {
        $$("#windowBack").className = "show";
        $$("#windowBack").textContent = "お待ち下さい...";
        setTimeout(function () {
            editDoc();
            $$("#windowBack").textContent = "";
        }, 1000)

    } else if (arg.new === "t") {
        newDoc();
    }

    //for glottologist
    /* const glot = new Glottologist();
     glot.import("component/lang.json").then(function () {
         glot.render();
     });*/
}

// プリントするとき
window.onbeforeprint = function () {
    //新規作成・編集ウィンドウ表示時にプリントが開始されたら、プレビューを表示する
    preview();
    $$("#preview").style.display = "block";
    $$("#edit").style.display = "none";
    $$("#preview").className = "show";
}
//for safari
var mediaQueryList = window.matchMedia('print');
mediaQueryList.addListener(function (mql) {
    if (mql.matches) {
        //ここに書く
        //新規作成・編集ウィンドウ表示時にプリントが開始されたら、プレビューを表示する
        preview();
        $$("#preview").style.display = "block";
        $$("#edit").style.display = "none";
        $$("#preview").className = "show";
    }
});

//ブラウザ名の取得

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
    $$("#edit").style.display = "block";
    $$("#preview").className = "";
    $$("#new").className = $$("#windowBack").className = "show";
    document.body.style.overflow = "hidden";
    $$("#tools").className = "close";
    $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
    $$("#saveLink").value = "";
}

function editDoc() {
    if (mdWithInfo !== undefined) {
        $$("#previewCheck").checked = false;
        $$("#preview").style.display = "none";
        $$("#edit").style.display = "block";
        $$("#preview").className = "";
        $$("#editor").value = mdWithInfo;
        $$("#new").className = $$("#windowBack").className = "show";
        $$("#saveLink").value = "";
        document.body.style.overflow = "hidden";
        $$("#tools").className = "close";
        $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
    } else {
        alert("編集画面を表示するのに必要な変数が見つかりません。");
    }
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
        $$("#tools").className = "close";
        $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
        //初期化
        flags.presentation = {};
        //改ページ記号(---)ごとに区切る
        flags.presentation.slides = md.split("\n---\n");
        try {
            //yamlでの仕様
            if (flags.presentation.slides[0].slice(0, 3) == "---" && typeof jsyaml.load(flags.presentation.slides[0].slice(3)) === "object") {
                flags.presentation.slides.shift();
                flags.presentation.nowPage = 0;
                var html = marked(flags.presentation.slides[0]);
                $$("#presentationView").innerHTML = html
                $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
                screenfull.request($$("#presentation"));
                $$("#presentation").className = "show";
            } else {
                flags.presentation.nowPage = 0;
                var html = marked(flags.presentation.slides[0]);
                $$("#presentationView").innerHTML = html;
                $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
                screenfull.request($$("#presentation"));
                $$("#presentation").className = "show";
            }
        } catch (e) {
            flags.presentation.nowPage = 0;
            var html = marked(flags.presentation.slides[0]);
            $$("#presentationView").innerHTML = html;
            $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
            $$("#presentation").className = "show";
            //screenfull.request($$("#presentation"));
            sysMessage("全画面表示でスライドを表示するにはF11キーを押してください");
        }
        if (html.indexOf("$") !== -1) {
            if (flags.mathjaxLoaded === false) {
                flags.mathjaxLoaded = true;
                var script = document.createElement('script');

                script.type = 'text/javascript';
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML";

                var firstScript = document.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(script, firstScript);
                script.onload = script.onreadystatechange = function () {
                    //mathJax config
                    MathJax.Hub.Config({
                        tex2jax: {
                            inlineMath: [['$', '$'], ["\\(", "\\)"]],
                            displayMath: [['$$', '$$'], ["\\[", "\\]"]]
                        }
                    });
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
                }

            } else {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
            }
        }

    },
    //戻る
    back: function () {
        if (flags.presentation.nowPage > 0) {
            var html = marked(flags.presentation.slides[flags.presentation.nowPage - 1]);
            $$("#presentationView").innerHTML = html;
            flags.presentation.nowPage = flags.presentation.nowPage - 1;
            if (html.indexOf("$") !== -1) {
                if (flags.mathjaxLoaded === false) {
                    flags.mathjaxLoaded = true;
                    var script = document.createElement('script');

                    script.type = 'text/javascript';
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML";

                    var firstScript = document.getElementsByTagName('script')[0];
                    firstScript.parentNode.insertBefore(script, firstScript);
                    script.onload = script.onreadystatechange = function () {
                        //mathJax config
                        MathJax.Hub.Config({
                            tex2jax: {
                                inlineMath: [['$', '$'], ["\\(", "\\)"]],
                                displayMath: [['$$', '$$'], ["\\[", "\\]"]]
                            }
                        });
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
                    }

                } else {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
                }
            }
        } else {
            sysMessage("表示中のスライドが最初のスライドです");
        }
    },
    //進む
    forward: function () {
        if (flags.presentation.nowPage + 1 < flags.presentation.slides.length) {
            var html = marked(flags.presentation.slides[flags.presentation.nowPage + 1]);
            $$("#presentationView").innerHTML = html
            flags.presentation.nowPage = flags.presentation.nowPage + 1;
            if (html.indexOf("$") !== -1) {
                if (flags.mathjaxLoaded === false) {
                    flags.mathjaxLoaded = true;
                    var script = document.createElement('script');

                    script.type = 'text/javascript';
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML";

                    var firstScript = document.getElementsByTagName('script')[0];
                    firstScript.parentNode.insertBefore(script, firstScript);
                    script.onload = script.onreadystatechange = function () {
                        //mathJax config
                        MathJax.Hub.Config({
                            tex2jax: {
                                inlineMath: [['$', '$'], ["\\(", "\\)"]],
                                displayMath: [['$$', '$$'], ["\\[", "\\]"]]
                            }
                        });
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
                    }

                } else {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "presentationView"]);
                }
            }
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
        $$("#presentation").className = "";
    }
}

//共有
function share(url, queryUrl, title, author) {
    var introText = "[MD Share]\n" + author + "さんが、MD Shareで「" + title + "」というドキュメントを共有しています。\nドキュメントを開くには、下のURLをタップしてください。";
    var encodedIntroText = encodeURIComponent(introText);

    if (url.length > 10000) {
        Swal.fire({
            title: "Oops...",
            html: 'マークダウンの記述内容が多く、共有URLが10000字を超えたため、処理をキャンセルしました。<br>「<i class="far fa-file-code"></i>」からHTMLをダウンロードする方法を推奨します。<br>または、ブラウザの印刷機能からPDFを作成できるかもしれません。'
        });
        return false;
    } else if (queryUrl.length > 5000 && location.hostname == "mdshare.cf") alert("マークダウンの記述内容が多いため、短縮URLは生成できません。\nご了承ください。");
    //セキュリティ制約により、forkした環境での短縮URLの生成を禁止する
    if (location.hostname == "mdshare.cf" && queryUrl.length <= 5000) {
        /*var confShortLink = confirm("短縮URLを生成しますか？\n※「OK」を押して続行した場合は、Google Firebase Dynamic Linksにあなたのドキュメントの情報が保存されることに同意したものとみなされます。");
        if (confShortLink === false) sysMessage("短縮URLの作成をキャンセルしました");
        */
        Swal.fire({
            title: "短縮URLの生成",
            html: "短縮URLを生成しますか？<br>「はい」を押して続行して場合は、Google Firebase Dynamic Linksにあなたのドキュメントの情報が保存されることに同意したものとみなされます。",
            confirmButtonText: "はい",
            showCancelButton: true,
            cancelButtonText: "いいえ"
        }).then(function (result) {
            if (result.value) {
                sysMessage("短縮URLの生成をリクエストしています<br>少々お待ち下さい...");
                var data = {
                    url: queryUrl
                }; // POSTメソッドで送信するデータ
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.onreadystatechange = function () {
                    var READYSTATE_COMPLETED = 4;
                    var HTTP_STATUS_OK = 200;

                    if (this.readyState == READYSTATE_COMPLETED &&
                        this.status == HTTP_STATUS_OK) {
                        // レスポンスの表示
                        var shortLink = this.responseText;

                        $$("#shareWindow").className = "show";
                        var urlEncoded = encodeURIComponent(shortLink);
                        $$("#copyRawButton").addEventListener(clickEv, function (e) {
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
                            sysMessage("生URLをクリップボードにコピーしました");
                        });
                        $$("#copyShortButton").style.display = "block";
                        $$("#copyShortButton").addEventListener(clickEv, function (e) {
                            e.preventDefault();
                            // 空div 生成
                            var tmp = document.createElement("div");
                            // 選択用のタグ生成
                            var pre = document.createElement('pre');

                            // 親要素のCSSで user-select: none だとコピーできないので書き換える
                            pre.style.webkitUserSelect = 'auto';
                            pre.style.userSelect = 'auto';

                            tmp.appendChild(pre).textContent = shortLink;

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
                            sysMessage("短縮URLをクリップボードにコピーしました");
                        });

                        $$("#twitterButton").href = "https://twitter.com/intent/tweet?url=" + urlEncoded;
                        $$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded + "&text=" + encodedIntroText;

                        $$("#shareCancel").addEventListener(clickEv, function (e) {
                            e.preventDefault();
                            $$("#shareWindow").className = "";
                        });
                    } else if (this.readyState == READYSTATE_COMPLETED &&
                        this.status == 404) {
                        sysMessage("短縮URLの生成に失敗しました");
                    }
                }

                xmlHttpRequest.open('POST', 'https://mdshr.glitch.me/make');

                // サーバに対して解析方法を指定する
                xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                // データをリクエスト ボディに含めて送信する
                xmlHttpRequest.send(EncodeHTMLForm(data));
            } else {
                $$("#shareWindow").className = "show";
                var urlEncoded = encodeURIComponent(url);
                $$("#copyRawButton").addEventListener(clickEv, function (e) {
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
                    sysMessage("生URLをクリップボードにコピーしました");
                });

                $$("#copyShortButton").style.display = "none";
                $$("#twitterButton").href = "https://twitter.com/intent/tweet?url=" + urlEncoded;
                $$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded + "&text=" + encodedIntroText;

                $$("#shareCancel").addEventListener(clickEv, function (e) {
                    e.preventDefault();
                    $$("#shareWindow").className = "";
                });
            }
        });
    } else {
        $$("#shareWindow").className = "show";
        var urlEncoded = encodeURIComponent(url);
        $$("#copyRawButton").addEventListener(clickEv, function (e) {
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
            sysMessage("生URLをクリップボードにコピーしました");
        });

        $$("#copyShortButton").style.display = "none";

        $$("#twitterButton").href = "https://twitter.com/intent/tweet?url=" + urlEncoded;
        $$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded + "&text=" + encodedIntroText;
        $$("#shareCancel").addEventListener(clickEv, function (e) {
            e.preventDefault();
            $$("#shareWindow").className = "";
        });
    }
}

//システムメッセージの表示関数
function sysMessage(s, time) {
    var messageElem = $$("#message");
    messageElem.innerHTML = s;
    messageElem.className = "show";
    if (messageElem.dataset.showing === "true") {
        clearTimeout(messageShower);
    }

    if (!time) var time = 5000;
    messageShower = setTimeout(function () {
        $$("#message").className = "";
        $$("#message").dataset.showing = "false";
    }, time);
}

function EncodeHTMLForm(data) {
    var params = [];

    for (var name in data) {
        var value = data[name];
        var param = encodeURIComponent(name) + '=' + encodeURIComponent(value);

        params.push(param);
    }

    return params.join('&').replace(/%20/g, '+');
}

function loadMd(mdData) {
    var mdWithInfo = mdData;
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
            $$("#docInfo").style.display = "block";
        }
        if (mdInfoJson.author) {
            $$("#author").textContent = "by " + mdInfoJson.author;
            $$("#docInfo").style.display = "block";
        }
        $$("#editButton").style.display = "inline";
        var deleteData = false;
    }
    //normal md or with yaml
    else {
        try {
            var mayYaml = mdWithInfo.split("---")[1].split("---")[0].trim();

            //console.log(mayYaml);
            var mdInfoJson = jsyaml.load(mayYaml);
            if (typeof mdInfoJson === "object") {
                //YAMLの内容を適用していく
                //title
                if (mdInfoJson.title) {
                    $$("#docTitle").textContent = mdInfoJson.title;
                    document.title = mdInfoJson.title + " - MD Share";
                    $$("#docInfo").style.display = "block";
                }
                //author
                if (mdInfoJson.author) {
                    $$("#author").textContent = "by " + mdInfoJson.author;
                    $$("#docInfo").style.display = "block";
                }
                //editable
                if (mdInfoJson.editable === false) {
                    $$("#editButton").style.display = "none";
                    var deleteData = true;
                } else {
                    if (getBrowserName() !== "IE") $$("#editButton").style.display = "inline";
                    var deleteData = false;
                }
                //showScrollToTop
                if (mdInfoJson.showScrollToTop === false) {
                    $$("#scrollToTop").className = "neverShow";
                } else {
                    $$("#scrollToTop").className = "";
                }
                if (mdInfoJson.style) {
                    $$("#doc").className = mdInfoJson.style;
                } else {
                    $$("#doc").className = "";
                }
                var md = "";
                var preMd = mdWithInfo.split("---");
                //console.log(preMd.length);
                for (var i = 2; i < preMd.length; i++) {
                    md += preMd[i] + "---";
                }
                var md = md.slice(0, -3);
                var mdInfo = "";
            } else {
                //console.log(mdInfoJson);
                var mdInfo = "";
                var md = mdWithInfo;
                $$("#docInfo").style.display = "none";
                if (getBrowserName() !== "IE") $$("#editButton").style.display = "inline";
                var deleteData = false;
            }
        } catch (e) {
            var mdInfo = "";
            var md = mdWithInfo;
            $$("#docInfo").style.display = "none";
            if (getBrowserName() !== "IE") $$("#editButton").style.display = "inline";
            var deleteData = false;
        }
    }
    //最終処理
    //目次記号[toc]を置き換え
    var html = marked(md).split("<md-toc></md-toc>").join(generateHeadingList(md, "doc"));
    //マークダウンのデータをグローバル変数に保存
    exportMdWithInfo(mdWithInfo);

    //追加設定
    //var html = html.replace(/\[x\]/g, '<input type="checkbox" checked="checked">');
    //var html = html.replace(/\[ \]/g, '<input type="checkbox">');
    $$("#doc").innerHTML = html;
    addLinkEvent("doc");
    addHeadingListEvent("doc");
    document.documentElement.scrollTop = 0; //一番上までスクロール
    //for MathJax
    if (html.indexOf("$") !== -1) {
        if (flags.mathjaxLoaded === false) {
            flags.mathjaxLoaded = true;
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML";

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
            script.onload = script.onreadystatechange = function () {
                //mathJax config
                MathJax.Hub.Config({
                    tex2jax: {
                        inlineMath: [['$', '$'], ["\\(", "\\)"]],
                        displayMath: [['$$', '$$'], ["\\[", "\\]"]]
                    }
                });
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "doc"]);
            }

        } else {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "doc"]);
        }
    }
}

function textDownload(text, mimeType, extension) {

    //var name = prompt("ダウンロードするファイルのファイル名(拡張子なし)を入力してください。");
    Swal.fire({
        title: "ファイルダウンロード",
        html: "<small>ダウンロードするファイルの名前(拡張子なし)を入力してください</small>",
        input: "text",
        confirmButtonText: "ダウンロードする",
        showCancelButton: true,
        cancelButtonText: "キャンセル"
    }).then(function (result) {
        if (result.value) {
            // ダウンロードしたいコンテンツ、MIMEType、ファイル名
            var content = text;
            var name = result.value;
            if (name == "") var name = "無題";
            var name = name + "." + extension;

            // BOMは文字化け対策
            var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            var blob = new Blob([bom, content], {
                type: mimeType
            });

            var a = document.createElement('a');
            a.download = name;
            a.target = '_blank';

            if (window.navigator.msSaveBlob) {
                // for IE
                window.navigator.msSaveBlob(blob, name)
            } else if (window.URL && window.URL.createObjectURL) {
                // for Firefox
                a.href = window.URL.createObjectURL(blob);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else if (window.webkitURL && window.webkitURL.createObject) {
                // for Chrome
                a.href = window.webkitURL.createObjectURL(blob);
                a.click();
            } else {
                // for Safari
                window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
            }
        }
    });
}


function exportMdWithInfo(mdwithinfo) {
    mdWithInfo = mdwithinfo;
}

//マークダウンをHTMLでダウンロード
function exportHTML(mdData) {
    //md with document info
    if (mdData.indexOf("<!---") !== -1) {
        var md = mdData.split("--->")[1];
        var mdInfo = mdData.split("<!---")[1].split("--->")[0];
        var mdInfoJson = JSON.parse(mdInfo);
        if (mdInfoJson.title) var title = mdInfoJson.title;
        else var title = prompt("ダウンロードするドキュメントのタイトルを入力してください。");
    }
    //normal md or with yaml
    else {
        try {
            var mayYaml = mdData.split("---")[1].split("---")[0].trim();

            //console.log(mayYaml);
            var mdInfoJson = jsyaml.load(mayYaml);
            if (typeof mdInfoJson === "object") {
                if (mdInfoJson.title) var title = mdInfoJson.title;
                else var title = prompt("ダウンロードするドキュメントのタイトルを入力してください。");
                var md = "";
                var preMd = mdData.split("---");
                //console.log(preMd.length);
                for (var i = 2; i < preMd.length; i++) {
                    md += preMd[i] + "---";
                }
                var md = md.slice(0, -3);
                var mdInfo = "";
            } else {
                //console.log(mdInfoJson);
                var mdInfo = "";
                var md = mdData;
                var title = prompt("ダウンロードするドキュメントのタイトルを入力してください。");
            }
        } catch (e) {
            var mdInfo = "";
            var md = mdData;
            var title = prompt("ダウンロードするドキュメントのタイトルを入力してください。");
        }
    }
    var mdHTML = marked(md).split("<md-toc></md-toc>").join(generateHeadingList(md, "doc"));
    var html = '<html><head><title>' + title + '</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#eee;color:#000;font-family:meiryo}::selection{background:#009e8f;color:#fff}::-moz-selection{background:#009e8f;color:#fff}#presenSave{width:1920px;height:1080px}#header{position:fixed;background:#ddd;width:100%;bottom:0;left:0;height:60px;z-index:1}#menuButton{position:absolute;top:0;right:5px;height:50px}#doc{position:absolute;top:10px;left:0;right:0;margin:auto;padding-left:5px;padding-right:5px;padding-bottom:80px;width:calc(100% - 10px);max-width:750px;overflow:auto;background:#fff}#scrollToTop{position:fixed;bottom:80px;right:20px;width:40px;height:40px;font-size:30px;background:rgba(0,0,0,.5);color:#fff;border-radius:5px;text-align:center;display:none}#scrollToTop.neverShow{display:none!important}#new{position:fixed;top:0;left:0;width:100%;height:100%;background:#eee;display:none}#new.show{display:block;z-index:3;animation:zoomIn .2s ease 0s 1 alternate none running}#new.show+#doc{overflow:hidden}#windowBack{position:fixed;background:rgba(0,0,0,.8);top:0;left:0;width:100%;height:100%;z-index:2;display:none;color:#fff}#windowBack.show{display:block}#edit{position:absolute;top:2em;left:0;width:100%;height:calc(100% - 3em - 40px);border:none}#editor{position:absolute;top:0;left:0;width:calc(100% - 10px - 70px);height:calc(100% - 10px);resize:none}#mdSymbols{position:absolute;top:0;right:0;width:70px;height:100%;overflow:auto}#mdSymbols button{width:100%;height:40px;background:#ddd;border:none;border-bottom:1px solid #aaa;font-size:9pt}#preview{position:absolute;top:2em;left:0;right:0;margin:auto;width:100%;max-width:750px;height:calc(100% - 3em - 40px);padding-left:5px;padding-right:5px;background:#fff;border:none;overflow:auto;display:none}#save{position:absolute;bottom:0;left:0;background:#ddd;width:100%;height:40px;text-align:center}#saveLink{position:absolute;top:0;left:14em;width:calc(100% - 15em);height:30px;background:#ddd;border:3px solid #aaa}#save button{width:calc(100% / 5);max-width:150px;height:37px;border:none;border-left:1px solid #bbb;border-right:1px solid #bbb;background:#ddd;font-size:14pt}#newWindowClose{position:absolute;top:0;right:0;width:7em;height:2em;background:#a00;border:3px solid red;color:#fff}#docTitle{font-size:14pt;font-weight:700}#author{font-size:10pt;color:#4c4c4c}#message{position:absolute;bottom:20px;left:0;right:0;margin:auto;width:calc(100% - 10px);min-height:2em;max-width:500px;padding:5px;background:rgba(0,0,0,.8);z-index:5;border-radius:10px;transition-duration:.2s;color:#fff;opacity:0;pointer-events:none;text-align:center}#message.show{opacity:1}#presentation{position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:3;display:none}#presentation.show{display:block}#presentation #presentationControl{position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,.6);padding:5px;opacity:.2;z-index:2}#presentation #presentationControl:hover{opacity:1}#presentation #presentationControl button{background:#3c3c3c;color:#fff;border:#8c8c8c 1px solid;height:35px;width:5em}#presentationView{position:absolute;top:0;left:0;width:100%;height:100%;overflow:auto;z-index:1;background:#fff}#presenScreenShot{position:absolute;top:0;left:0;z-index:0;background:#fff}#shareWindow{position:fixed;top:0;left:0;color:#fff;background:rgba(0,0,0,.8);z-index:4;text-align:center;width:100%;height:100%;overflow:auto;display:none}#shareWindow.show{display:block}#shareWindow a{display:block;width:calc(100% - 10px);max-width:500px;padding:5px;padding-top:10px;padding-bottom:10px;color:#fff;text-decoration:none;font-weight:700;cursor:pointer;margin:auto;border-radius:50px}#copyRawButton,#copyShortButton,#shareCancel{background:rgba(100,100,100,.8);border-top:1px solid rgba(0,0,0,.1)}#twitterButton{background:rgba(100,200,255,.8);border-top:1px solid #3af}#lineButton{background:rgba(0,200,0,.8);border-top:1px solid #0d0}#fileOpenDialog{position:absolute;top:0;left:0;margin:auto;width:100%;height:100%;background:rgba(20,20,20,.9);color:#fff;text-align:center;display:none;z-index:4}#fileOpenDialog.show{display:block}#fileOpenDialogClose{width:100%;max-width:500px;height:50px;background:#a00;color:#fff;margin-top:50px;border:none}#tools #editButton{display:none}@media (max-width:600px){#tools{position:fixed;top:0;right:0;height:calc(100% - 60px);width:100%;background:rgba(200,200,200,.8);z-index:2;transition-duration:.2s;overflow:auto}#tools.close{opacity:0;pointer-events:none}#tools button{color:#000;height:50px;width:100%;background:#ddd;border:none;border-top:1px solid #bbb;border-bottom:1px solid #bbb}.md-tools{font-size:1.3em}#tools button:active{box-shadow:0 0 10px rgba(0,0,0,.6) inset}#menuButton{background:0 0;border:none}.md-menu{font-size:2em}}@media (min-width:601px){#tools{position:fixed;bottom:0;right:0;z-index:2}#tools button{height:60px;width:auto;background:0 0;border:none;border-left:1px solid #bbb;border-right:1px solid #bbb}#menuButton{display:none}.md-tools{font-size:1.8em}.md-tools-text{display:none}}@media (max-height:160px){#save{display:none}#edit,#preview{height:calc(100% - 3em)}}#header,#new label,#tools{-ms-user-select:none;-moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;user-select:none}#doc td,#doc th,#preview td,#preview th{border:solid 1px;padding:10px}table tr:nth-child(even){background:#ddd}table{border-collapse:collapse}#doc h1,#preview h1{border-bottom:1px solid #aaa;padding-left:5px}#doc h2,#preview h2{border-bottom:1px solid #aaa;padding-left:5px}#doc h3,#preview h3{border-left:8px solid #aaa;border-bottom:1px solid #aaa;padding-left:5px}#doc code,#preview code{border-radius:3px}#doc code:not(.hljs),#preview code:not(.hljs){background:#f8f8f8;padding-left:10px;padding-right:10px}#doc div.docIndex,#preview div.docIndex{background:#eee;border-radius:4px;margin:10px}#doc div.docIndex b,#preview div.docIndex b{font-size:16pt}#doc div.docIndex span,#preview div.docIndex span{display:block;background:#ddd;border-top:1px solid #aaa;text-decoration:none;color:#000;padding:10px;font-size:12pt;cursor:pointer}#doc div.docIndex span.h1,#preview div.docIndex span.h1{padding-left:10px;font-weight:700;background:#fafafa}#doc div.docIndex span.h2,#preview div.docIndex span.h2{padding-left:20px;background:#eaeaea}#doc div.docIndex span.h3,#preview div.docIndex span.h3{padding-left:30px;background:#dadada}#doc div.docIndex span.h4,#preview div.docIndex span.h4{padding-left:40px;background:#cacaca}#doc div.docIndex span.h5,#preview div.docIndex span.h5{padding-left:50px;background:#bababa}#doc div.docIndex span.h6,#preview div.docIndex span.h6{padding-left:60px;background:#aaa}#doc blockquote,#preview blockquote{border-left:7px solid #ccc;padding-left:10px;margin-left:0;color:#7c7c7c}#doc hr,#preview hr{height:1px;background-color:#6c6c6c;border:none}#doc span.showOnOther,#presentationView span.showOnOther,#preview span.showOnOther{display:none}#presentationView td,#presentationView th{border:solid 1px;padding:10px}#presentationView table tr:nth-child(even){background:#ddd}#presentationView table{border-collapse:collapse}#presentationView *{font-size:16pt}#presentationView h1{border-bottom:1px solid #aaa;padding-left:5px;font-size:32pt}#presentationView h2{border-bottom:1px solid #aaa;padding-left:5px;font-size:24pt}#presentationView h3{border-left:8px solid #aaa;border-bottom:1px solid #aaa;padding-left:5px;font-size:20pt}#presentationView h4{font-size:18pt}#presentation h5{font-size:14pt}#presentationView h6{font-size:12pt}#presentationView blockquote{border-left:7px solid #ccc;padding-left:10px;color:#7c7c7c}#presentationView .mjx-chtml span{font-size:24pt}#presenScreenShot{width:1920px;height:1080px}#presenScreenShot td,#presenScreenShot th{border:solid 1px;padding:10px}#presenScreenShot table tr:nth-child(even){background:#ddd}#presenScreenShot table{border-collapse:collapse}#presenScreenShot *{font-size:30pt}#presenScreenShot h1{border-bottom:1px solid #aaa;padding-left:5px;font-size:60pt}#presenScreenShot h2{background:#3c3c3c;padding:5px;color:#fff;font-size:54pt}#presenScreenShot h3{border-left:8px solid #aaa;border-bottom:1px solid #aaa;padding-left:5px;font-size:48pt}#presenScreenShot h4{font-size:40pt}#presenScreenShot h5{font-size:36pt}#presenScreenShot h6{font-size:30pt}#presenScreenShot blockquote{border-left:7px solid #ccc;padding-left:10px;color:#7c7c7c}@media print{#header,#mdSymbol,#newWindowClose,#save,#tools,.printDelete{display:none}#doc{position:absolute;width:calc(100% - 5px);max-width:100%;height:calc(100% - 65px);top:0;left:0;overflow:visible;box-shadow:none;padding:0;margin:0}#preview.show{position:absolute;top:0;left:0;width:100%;min-height:100%;z-index:3;border:none}}@keyframes zoomIn{0%{display:block;-webkit-transform:scale(.8);-moz-transform:scale(.8);-o-transform:scale(.8);-ms-transform:scale(.8);transform:scale(.8);opacity:0}100%{-webkit-transform:scale(1);-moz-transform:scale(1);-o-transform:scale(1);-ms-transform:scale(1);transform:scale(1);opacity:1}}</style><script>function addHeadingListEvent(e){var n=document.querySelectorAll("span.docIndexContent");console.log(n);for(var o=0;o<n.length;o++)n[o].addEventListener("click",function(e){goToAnchor(e)})}function goToAnchor(e){var n=e.target.dataset.href,o=e.target.dataset.docorpreview,t=document.querySelector("#"+o+\' a[name="\'+n+\'"]\');if(null!==t){var d=t.getBoundingClientRect().top+window.pageYOffset;document.body.scrollTop=d}}window.onload=function(){addHeadingListEvent()};</script></head><body><div id="doc" style="">' + mdHTML + "</div></body></html>"
    textDownload(html, "text/html", "html");
}

function generateHeadingList(md, docOrPreview) {
    var div = document.createElement("div");
    div.innerHTML = marked(md);
    var headings = div.querySelectorAll("h1,h2,h3,h4,h5,h6");
    var returnHTML = '<div class="docIndex"><b>もくじ</b><br><small>項目をクリックorタップで移動</small><br>';
    for (var i = 0; i < headings.length; i++) {
        var returnHTML = returnHTML + '<span data-href="' + headings[i].querySelector("a.anchor").name + '" data-docorpreview="' + docOrPreview + '" class="docIndexContent ' + headings[i].tagName.toLowerCase() + '">' + headings[i].textContent + '</span>';
    }
    if (headings.length === 0) {
        var returnHTML = returnHTML + "ドキュメントに項目がありません。"
    }
    var returnHTML = returnHTML + "</div>";
    return returnHTML;
}

function addHeadingListEvent(docOrPreview) {
    var elems = document.querySelectorAll("span.docIndexContent");
    console.log(elems);
    for (var i = 0; i < elems.length; i++) {
        elems[i].addEventListener("click", function (e) {
            goToAnchor(e);
        });
    }
}

function goToAnchor(e) {
    var anchorName = e.target.dataset.href;
    var docOrPreview = e.target.dataset.docorpreview;
    var elem = document.querySelector("#" + docOrPreview + ' a[name="' + anchorName + '"]');
    if (elem !== null) {
        var rect = elem.getBoundingClientRect().top + window.pageYOffset;
        console.log(rect);
        document.documentElement.scrollTop = rect;
    }
}

function preview() {
    try {
        var checkElem = document.createElement("div");
        checkElem.innerHTML = marked($$("#editor").value);
        var firstElem = elem.querySelector("*");
        var docTitle = firstElem.textContent;
    } catch (e) {
        var docTitle = "";
    }
    $$("#previewCheck").checked = true;
    $$("#preview").style.display = "block";
    $$("#edit").style.display = "none";
    $$("#preview").className = "show";
    var previewMdWithInfo = $$("#editor").value;
    //console.log(previewMdWithInfo.slice(0, 3));
    if (previewMdWithInfo.indexOf("<!---") !== -1) {
        var previewMd = previewMdWithInfo;
    } else if (previewMdWithInfo.slice(0, 3) == "---") {
        try {
            var mayYaml = previewMdWithInfo.split("---")[1].split("---")[0].trim();

            //console.log(mayYaml);
            var previewMdInfoJson = jsyaml.load(mayYaml);
            if (typeof previewMdInfoJson === "object") {
                if (previewMdInfoJson.title) {
                    var docTitle = previewMdInfoJson.title;
                }
                //styleオプションを適用
                if (previewMdInfoJson.style) {
                    $$("#preview").className = previewMdInfoJson.style;
                } else {
                    $$("#preview").className = "";
                }
                var preMd = previewMdWithInfo.split("---");
                //console.log(preMd);
                var previewMd = "";
                for (var i = 2; i < preMd.length; i++) {
                    previewMd += preMd[i] + "---";
                }
                var previewMd = previewMd.slice(0, -3);
                //console.log(previewMd);
            } else {
                var previewMd = previewMdWithInfo;
            }
        } catch (e) {
            var previewMd = previewMdWithInfo;
        }
    } else {
        var previewMd = previewMdWithInfo;
    }
    var previewHtml = marked(previewMd).split("<md-toc></md-toc>").join(generateHeadingList(previewMd, "preview"));
    //追加設定
    //var previewHtml = previewHtml.replace(/\[x\]/g, '<input type="checkbox" checked="checked">');
    //var previewHtml = previewHtml.replace(/\[ \]/g, '<input type="checkbox">');
    $$("#preview").innerHTML = previewHtml;
    //addHeadingListEvent("preview");
    addLinkEvent("preview");
    //for MathJax
    if (previewHtml.indexOf("$") !== -1) {
        if (flags.mathjaxLoaded === false) {
            flags.mathjaxLoaded = true;
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML";

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
            script.onload = script.onreadystatechange = function () {
                //mathJax config
                MathJax.Hub.Config({
                    tex2jax: {
                        inlineMath: [['$', '$'], ["\\(", "\\)"]],
                        displayMath: [['$$', '$$'], ["\\[", "\\]"]]
                    }
                });
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "preview"]);
            }

        } else {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "preview"]);
        }
    }

    return docTitle;
}

function addLinkEvent(elemId){
    var pageLinks = document.querySelectorAll("#" + elemId + " a");
    for(var i = 0; i < pageLinks.length; i++){
        pageLinks[i].addEventListener("click", function(e){
            //urlのドメイン名を取得
            var domain = e.target.href.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
            //他サイトへのリンクだったとき
            if(domain !== location.host){
                e.preventDefault();
                showLinkConfirm(e.target.href);
            }
        });
    }
}

function showLinkConfirm(url){
    $$("#linkConfirm").className = "show";
    $$("#linkConfirmURL").innerHTML = '<a href="' + url + '" target="_blank">' + url + '</a>';
    if(showLinkConfirmTimeout !== null){
        clearTimeout(showLinkConfirmTimeout);
    }
    showLinkConfirmTimeout = setTimeout(function(){
        $$("#linkConfirm").className = "";
        $$("#linkConfirmURL").innerHTML = "";
        showLinkConfirmTimeout = null;
    },8000);
}

function generatePresenMd(mdWithInfo){
  if (mdWithInfo == "" || mdWithInfo == undefined) {
      var returnVal = "";
  }
  //md with document info
  if (mdWithInfo.indexOf("<!---") !== -1) {
      var returnVal = mdWithInfo.split("--->")[1];

  }
  //normal md or with yaml
  else {
      try {
          var mayYaml = mdWithInfo.split("---")[1].split("---")[0].trim();

          //console.log(mayYaml);
          var mdInfoJson = jsyaml.load(mayYaml);
          if (typeof mdInfoJson === "object"){
              var md = "";
              var preMd = mdWithInfo.split("---");
              //console.log(preMd.length);
              for (var i = 2; i < preMd.length; i++) {
                  md += preMd[i] + "---";
              }
              var returnVal = md.slice(0, -3);
          } else {
              //console.log(mdInfoJson);
              var mdInfo = "";
              var returnVal = mdWithInfo;
          }
      } catch (e) {
          var returnVal = mdWithInfo;
      }
  }
  //最終処理
  return returnVal;
}
