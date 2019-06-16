/*

 MD Share
 (c)2019 Soruto Project.
 
 Ver.2019.05.25.2
 
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
    if (txt.match(deniedTagCondition) || txt.indexOf('<!') === 0 || txt.indexOf('<?') === 0 || txt.indexOf('<\\') === 0) {
        return ''
    }
    if (txt.indexOf('</') === 0) {
        return txt
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
    
    renderer.link = function(href, title, text){
      return '<a href="' + href + '" target="_blank">' + text + "</a>";  
    };

    /*renderer.heading = function (text, level) {
            var escapedText = text.toLowerCase();

            return '<h' + level + '><a name="' +
                escapedText +
                '" class="anchor" href="#' +
                escapedText +
                '"><span class="header-link"></span></a>' +
                text + '</h' + level + '>';
        },*/

    marked.setOptions({
        renderer: renderer,
        gfm: true,
        sanitize: true,
        sanitizer: escape
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

//ページの読み込み完了時
window.onload = function () {
    //Block access with Internet Explorer.
    if (getBrowserName() == "IE") {
        alert("本Webアプリは、Internet Explorerではご利用いただけません。\n他のブラウザをご利用ください。");
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
        //ホームページ
        var pageData = "LQhQBcEtwGwUwFwAICyARJBlAFgQwE5yAeDIBEMgYgyDKDILoMouAruNgPb7KYsNNIAK+TAVnADG4UCGCgAxKgw4CcUAB4AzgFtcMGAD5A8QyBpBkBRDIBCGQJoMgeQZAowaBGDUBJDIFx5QBIM5QEAMigPRqN20KABU-n18kQAbTQHUGQBEGQD2GQB+GQHqGQAGGQDKGQGeGQEmGQFqGQFOGQEOGZMAJhhtAHXlABCMTQGiGQGsGQHsGQEAGUCQGpCDuAGFAOwZAFg1ACBVawBgGYMB4yMBYBhtYwCuGQGGGWNDAPwYTZ3rGoMBOhkjAbYZOnpre7MBphkzoocAkwn7htsAwDIrxqdn5vyRAR0VASHNAVQZAGIZAfQZAOYZovMAZBkAFhGALk93oArBnC3VqAFUAEoAGUAiwyAS4ZstFAP0Mf0AxtahMyAWijAFna70AZgzhMp6QBdHoBYqNCRLMgAMGF7hBZBQA05gB1OAAI0ARQyAdYYxm1AP7ygApXQCdpoBVmxqSMAJQyAboZkstrKDAJYMVUWDWa7Uh22sI2u0yJVMA5gyAWQY5gtGk0kKsNtqdvtDiddRcrpMDcazfMFn4Avd2Vy+WMqigAJIAFSQcMgQjgADtlHA2oBoOQqgBtFQDRqcTwuaGqBQxGozH44nAEGWgEDIqqAU7kk21ABYMgCkGAxGu5aJAARgAdEgKG1AL0MgFWGPKJQDlDNybIAGqKNgCCGQCEjoB8RSNM8AbEqABTSKoBHI0AxgxEwD2QUzc62PnTQjVAOohhUAlFbA+skQDODCzAIxRgD+o4E2AdD0dtEyATwYiW1AOCRgC-ETMHxVIAs4llqCgAXCYAYEoVIAGFGAJDxoSgoAigxvIADgygoAkQzggsrYAExdoUgCgASBVTnheJG1O+I7chUgBFqTSiicloih0FooKAMkM2GADUxgDfcjYgAFMToeHuBx7isaAWjSUggCo+sKgDCioAWP-5pG0ZxgmSDAEgbKQAA1pAAAOcAACaQLgfocjy-I2CK5QULWFQkAYNRqYWmmJoAoYqAJ3aFSADAqgDwhu8HxTnWgD+DKC7w5kgPgABQtAAlARAAMbYAJxYBw4BcLwAjCOAcXuRpxamR2iVAA";
        //グローバル変数
        var md = LZString.decompressFromEncodedURIComponent(pageData);
        loadMd(md);
    } else {
        var md = LZString.decompressFromEncodedURIComponent(arg["q"]);
        loadMd(md);
    }



    //addEventListener
    $$("#newButton").addEventListener("click", function () {
        newDoc();
    });

    $$("#editButton").addEventListener("click", function () {
        editDoc();
    })

    $$("#newWindowClose").addEventListener("click", function () {
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

    $$("#previewCheck").addEventListener("change", function (e) {
        if (e.target.checked === true) {
            $$("#preview").style.display = "block";
            $$("#editor").style.display = "none";
            $$("#preview").className = "show";
            var previewMdWithInfo = $$("#editor").value;
            console.log(previewMdWithInfo.slice(0, 3));
            if (previewMdWithInfo.indexOf("<!---") !== -1) {
                var previewMd = previewMdWithInfo;
            } else if (previewMdWithInfo.slice(0, 3) == "---") {
                try {
                    var mayYaml = previewMdWithInfo.split("---")[1].split("---")[0].trim();

                    console.log(mayYaml);
                    var previewMdInfoJson = jsyaml.load(mayYaml);
                    if (typeof previewMdInfoJson === "object") {
                        var preMd = previewMdWithInfo.split("---");
                        console.log(preMd);
                        var previewMd = "";
                        for (var i = 2; i < preMd.length; i++) {
                            previewMd += preMd[i] + "---";
                        }
                        var previewMd = previewMd.slice(0, -3);
                        console.log(previewMd);
                    } else {
                        var previewMd = previewMdWithInfo;
                    }
                } catch (e) {
                    var previewMd = previewMdWithInfo;
                }
            } else {
                var previewMd = previewMdWithInfo;
            }
            var previewHtml = marked(previewMd);
            //追加設定
            //var previewHtml = previewHtml.replace(/\[x\]/g, '<input type="checkbox" checked="checked">');
            //var previewHtml = previewHtml.replace(/\[ \]/g, '<input type="checkbox">');
            $$("#preview").innerHTML = previewHtml;
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
        //Change to yaml
        if ($$("#editor").value.slice(0, 3) !== "---") {
            console.log("input user info");
            var title = prompt("このドキュメントのタイトルを入力してください");
            if (title === null) return false;
            var author = prompt("このドキュメントの作者名を入力してください");
            if (author === null) return false;
            var updateMd = '---\ntitle: ' + title + '\nauthor: ' + author + '\n---\n\n' + $$("#editor").value;
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

    $$("#menuButton").addEventListener("click", function () {
        var now = $$("#tools").className;
        if (now === "close") {
            $$("#tools").className = "";
            $$("#menuButton").innerHTML = '<i class="fas fa-times md-menu"></i>';
        } else {
            $$("#tools").className = "close";
            $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
        }
    });

    $$("#infoButton").addEventListener("click", function () {
        window.open("./help/index.html");
    });

    $$("#fileOpenButton").addEventListener("click", function () {
        $$("#fileOpenDialog").className = "show";
        $$("#tools").className = "close";
        $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
        $$("#mdFileReader").value = "";
    });

    $$("#fileOpenDialogClose").addEventListener("click", function () {
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
            console.log(reader);
            $$("#fileOpenDialog").className = "";
            sysMessage(file[0].name + " を読み込みました");
        }
    });

    $$("#dlButton").addEventListener("click", function () {
        var text = $$("#editor").value;
        textDownload(text);
    });

    /*$$("#temButton").addEventListener("click", function () {
        window.open("./template/index.html");
    });*/

    $$("#presenButton").addEventListener("click", function () {
        presentation.start(mdWithInfo);
    });

    $$("#presenPreview").addEventListener("click", function () {
        presentation.start($$("#editor").value);
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
    $$("#presentationDl").addEventListener("click", function (){
       presentation.printScreen(); 
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
    $$("#editor").style.display = "block";
    $$("#new").className = $$("#windowBack").className = "show";
    document.body.style.overflow = "hidden";
    $$("#tools").className = "close";
    $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
    $$("#saveLink").value = "";
}

function editDoc() {
    $$("#previewCheck").checked = false;
    $$("#preview").style.display = "none";
    $$("#editor").style.display = "block";
    $$("#editor").value = mdWithInfo;
    $$("#new").className = $$("#windowBack").className = "show";
    $$("#saveLink").value = "";
    document.body.style.overflow = "hidden";
    $$("#tools").className = "close";
    $$("#menuButton").innerHTML = '<i class="fa fa-bars md-menu"></i>';
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
                $$("#presentationView").innerHTML = marked(flags.presentation.slides[0]);
                $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
                screenfull.request($$("#presentation"));
                $$("#presentation").className = "show";
            } else {
                flags.presentation.nowPage = 0;
                $$("#presentationView").innerHTML = marked(flags.presentation.slides[0]);
                $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
                screenfull.request($$("#presentation"));
                $$("#presentation").className = "show";
            }
        } catch (e) {
            flags.presentation.nowPage = 0;
            $$("#presentationView").innerHTML = marked(flags.presentation.slides[0]);
            $$("#presentationBack").style.display = $$("#presentationForward").style.display = "inline";
            $$("#presentation").className = "show";
            //screenfull.request($$("#presentation"));
            sysMessage("全画面表示でスライドを表示するにはF11キーを押してください");
        }


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
        $$("#presentation").className = "";
    },
    //スライドのスクショを撮る
    printScreen: function () {
        document.getElementById("presenScreenShot").innerHTML = $$("#presentationView").innerHTML;
        html2canvas($$("#presenScreenShot")).then(function (canvas) {
            var data = canvas.toDataURL();
            var fname = "slide_" + parseInt(flags.presentation.nowPage + 1);
            var encdata = atob(data.replace(/^.*,/, ''));
            var outdata = new Uint8Array(encdata.length);
            for (var i = 0; i < encdata.length; i++) {
                outdata[i] = encdata.charCodeAt(i);
            }
            var blob = new Blob([outdata], ["image/png"]);

            if (window.navigator.msSaveBlob) {
                //IE用
                window.navigator.msSaveOrOpenBlob(blob, fname);
            } else {
                //それ以外？
                document.getElementById("getImage").href = data; //base64そのまま設定
                document.getElementById("getImage").download = fname; //ダウンロードファイル名設定
                document.getElementById("getImage").click(); //自動クリック
            }
        });
    }
}

//共有
function share(url) {
    //セキュリティ制約により、forkした環境での短縮URLの生成を禁止する
    if (location.hostname == "mdshare.cf") {
        var confShortLink = confirm("短縮URLを生成しますか？\n※「OK」を押して続行した場合は、Google Firebase Dynamic Linksにあなたのドキュメントの情報が保存されることに同意したものとみなされます。");
        if (confShortLink === false) sysMessage("短縮URLの作成をキャンセルしました");
    } else {
        var confShortLink = false;
    }
    if (confShortLink === true) {
        var data = {
            url: url
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
                $$("#copyRawButton").addEventListener("click", function (e) {
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
                $$("#copyShortButton").addEventListener("click", function (e) {
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
                $$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded;

                $$("#shareCancel").addEventListener("click", function (e) {
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
        $$("#copyRawButton").addEventListener("click", function (e) {
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
        $$("#lineButton").href = "https://social-plugins.line.me/lineit/share?url=" + urlEncoded;

        $$("#shareCancel").addEventListener("click", function (e) {
            e.preventDefault();
            $$("#shareWindow").className = "";
        });
    }
}

//システムメッセージの表示関数
function sysMessage(s) {
    var messageElem = $$("#message");
    messageElem.textContent = s;
    messageElem.className = "show";
    if (messageElem.dataset.showing === "true") {
        clearTimeout(messageShower);
    }

    messageShower = setTimeout(function () {
        $$("#message").className = "";
        $$("#message").dataset.showing = "false";
    }, 5000);
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
    mdWithInfo = mdData;
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
        if (mdInfoJson.author){
            $$("#author").textContent = "by " + mdInfoJson.author;
            $$("#docInfo").style.display = "block";
        }
    }
    //normal md or with yaml
    else {
        try {
            var mayYaml = mdWithInfo.split("---")[1].split("---")[0].trim();

            console.log(mayYaml);
            var mdInfoJson = jsyaml.load(mayYaml);
            if (typeof mdInfoJson === "object") {
                if (mdInfoJson.title) {
                    $$("#docTitle").textContent = mdInfoJson.title;
                    document.title = mdInfoJson.title + " - MD Share";
                    $$("#docInfo").style.display = "block";
                }
                if (mdInfoJson.author){
                    $$("#author").textContent = "by " + mdInfoJson.author;
                    $$("#docInfo").style.display = "block";
                }
                var md = "";
                var preMd = mdWithInfo.split("---");
                console.log(preMd.length);
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
            }
        } catch (e) {
            var mdInfo = "";
            var md = mdWithInfo;
            $$("#docInfo").style.display = "none";
        }
    }
    //最終処理
    var html = marked(md);
    //追加設定
    //var html = html.replace(/\[x\]/g, '<input type="checkbox" checked="checked">');
    //var html = html.replace(/\[ \]/g, '<input type="checkbox">');
    $$("#doc").innerHTML = html;
    $$("#doc").scrollTop = 0; //一番上までスクロール
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

function textDownload(text) {
    // ダウンロードしたいコンテンツ、MIMEType、ファイル名
    var content = text;
    var mimeType = 'text/markdown';
    var name = prompt("ダウンロードするファイルのタイトルを指定してください。");
    if (name === null) return false;
    else if (name == "") var name = "無題";
    var name = name + ".md";

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
