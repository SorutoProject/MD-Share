/*

 MD Share Lite
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
flags.mathjaxLoaded = false;

var $$ = function (e) {
    var el = document.querySelectorAll(e);
    if (el.length == 1) {
        return el[0];
    } else {
        return el;
    }
}

//クリックイベント
var clickEv = "click";

//URLハッシュ変更時にリロードする
window.onhashchange = function () {
    location.reload();
}

//ページの読み込み完了時
window.onload = function () {
    var urlQuery = location.search;
    if (urlQuery !== "") var urlQuery = location.search + "&fd=t"
    else var urlQuery = "?fd=t";
    document.getElementById("linkToDefault").setAttribute("href", "../" + urlQuery + location.hash);
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

    if (arg["q"]) {
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
        var pageData = "---\ntitle: エラー\nauthor: SorutoProject\n---\n# パラメータが指定されていません\n* URLクエリまたはURLハッシュに適切な値が見つかりませんでした。\n[通常版サイトに移動](../)";
        loadMd(pageData);
    }
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
    });
}

function loadMd(mdData) {
    var mdWithInfo = mdData;
    //There is not md data
    if (mdWithInfo == "" || mdWithInfo == undefined) {
        var NMDPageData = "DwQgtBBQDekJACIAuBLJAbApggXAgogE6ED2hABGOQLIAi5AygBYCGh2ANPAiwK5JMyuBAwCeAZySYAtgkgBfSBDAA+SAGJyRUoQ2btZcgGMSAE0w5yAFSaZ25FOPIA7EknKmSR3tMzP3pixILAB0kICncoDQcoB2DIAiDIBaDIAxDIDSDNGA+cqAB2qA1gyAEQyAUQyAgAyAWwyAPwyAHQyASQyAFhGAXJ6A5gyAsgyAfgyA2gyAyQyAQAyQkABU5ACqAEoAMoCLDICXDICHDCWA-QzR5AgAjgjkE9MzWYCEjoCdSoBWDIAkCoAyDIDgxoBZ2oCqDImAZgyxgNEMXX2AYwyAtQyAnQyAEwyAowaAjBqHAAyABYZACUM72igEmGZ6AU4ZJoBnhnedUAQgz3XrkQDKDNFAGsM40AZQyANoZDgUhmMprN5ksVmtSfsKoAzxUAYC6NXaxDpAA";
        mdWithInfo = LZString.decompressFromEncodedURIComponent(NMDPageData);
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
        var deleteData = false;
    }
    //normal md or with yaml
    else {
        try {
            var mayYaml = mdWithInfo.split("---")[1].split("---")[0].trim();

            //console.log(mayYaml);
            var mdInfoJson = jsyaml.load(mayYaml);
            if (typeof mdInfoJson == "object") {
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
                //showScrollToTop
                if (mdInfoJson.showScrollToTop === false) {
                    $$("#scrollToTop").className = "neverShow";
                } else {
                    $$("#scrollToTop").className = "";
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
                var deleteData = false;
            }
        } catch (e) {
            console.log("Load Error.");
            var mdInfo = "";
            var md = mdWithInfo;
            $$("#docInfo").style.display = "none";
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

function exportMdWithInfo(mdwithinfo) {
    mdWithInfo = null;
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
    $$("#linkConfirmURL").innerHTML = '<a href="' + url + '" target="_blank">' + url + '</a>'
    setTimeout(function(){
        $$("#linkConfirm").className = "";
        $$("#linkConfirmURL").innerHTML = "";
    },8000);
}
