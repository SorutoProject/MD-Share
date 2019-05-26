# MD Share API(For Developers)

2019年05月26日(日本時間)より、(Glitch)[https://glitch.com]でのMD Share APIの提供を開始しました。  
本ページでは利用方法について紹介します。

**※注意※**

現在、Google FirebaseによるMD Share Short URL（例:`https://mdshare.page.link/WvYKgSgbFXWQ1nH78`）はMD Share APIからは**利用できません。**

### Share API

MarkdownからMD Share 生URLを生成します

URL:

```
GET https://mdshr.glitch.io/api/share?q={encodeURIComponent(MarkDown)}
```

**URLパラメータの説明**

* q
  * マークダウンをJavaScriptにおける**encodeURIComponent()関数**、もしくはJavaScript以外の言語で、それに準ずる関数等で生成した、URLエンコード済みマークダウン

返り値

```
{
	"status":"success",
	"shareUrl":"https://mdshare.cf/?q=..."
}
```

**注意事項**

* https://mdshare.cf 上のエディタでの共有時と同じく、返り値の`shareUrl`が5000字以上になると、以下のようなエラーが返されます。

  ```
  {
  	"status":"error",
  	"message":"Requested Markdwon is too large to use in MD Share."
  }
  ```

* 現在、特にアクセス制限はかけておりませんが、多重リクエストなどの、**他のユーザーに迷惑となるような行為**は<u>ご遠慮</u>ください。(Glitchでは、転送量は **10GB/月** に設定されています)
* Glitchの仕様により、一定時間アクセスがないとサーバーがスリープ状態に入ります。そのため、アクセスするタイミングにより、応答が遅い場合があります。