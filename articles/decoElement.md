---
title: Deco Element について
author: Soruto Project
editable: false
---
<span class="showOnOther">* This markdown is optimized for viewing on MD Share.<br>Some elements in this document does not work well on other sites.</span>

# MD Share Deco Element について
Ver.2019.07.27より、MD Share 独自仕様の装飾用要素(MD Share Deco Element)が使用できるようになりました。

(toc)

## 使い方
**記述例**
```
<ms-deco design info>**情 報**
このサイトはMD Shareです</ms-deco>
```
↑をドキュメントに書くと...

**表示例**
<ms-deco design info>情 報
このサイトはMD Shareです</ms-deco>

と、こんな感じに表示されます。

* `<ms-deco>`タグを使って書きます。
* HTMLタグの記述方法を使用します。
* 蛍光ペンなど、便利な機能を使えるようになります。
* 今後、機能を追加していく予定です。

## サンプル集

### design系
**記述例**
```
<ms-deco design info>**情 報**
このサイトはMD Shareです。</ms-deco>

<ms-deco design warning>**警 告**
この操作は、自己責任でお願いします。</ms-deco>

<ms-deco design alert>**禁 止**
著作権侵害となるような行為を禁止します。</ms-deco>
```
**表示例**
<ms-deco design info>**情 報**
このサイトはMD Shareです。</ms-deco>

<ms-deco design warning>**警 告**
この操作は、自己責任でお願いします。</ms-deco>

<ms-deco design alert>**禁 止**
著作権侵害となるような行為を禁止します。</ms-deco>

### marker系
**記述例**
```
<ms-deco marker yellow>ココ大事！</ms-deco>
<ms-deco marker lime>ココ大事！</ms-deco>
<ms-deco marker water>ココ大事！</ms-deco>
<ms-deco marker pink>ココ大事！</ms-deco>
```
**表示例**
<ms-deco marker yellow>ココ大事！</ms-deco>
<ms-deco marker lime>ココ大事！</ms-deco>
<ms-deco marker water>ココ大事！</ms-deco>
<ms-deco marker pink>ココ大事！</ms-deco>

### border系
**記述例**
```
<ms-deco border black>お知らせ</ms-deco>
この度、MD Shareに独自タグを追加しました！！
```
**表示例**
<ms-deco border black>お知らせ</ms-deco>
この度、MD Shareに独自タグを追加しました！！

### 組み合わせ例
**記述例**
```
<ms-deco style info><ms-deco border black>お知らせ</ms-deco>
この度、MD Shareに独自タグを追加しました！！
<ms-deco style warning>使い方は、公式ページをご覧ください</ms-deco>
</ms-deco>
```
**表示例**
<ms-deco style info><ms-deco border black>お知らせ</ms-deco>
この度、MD Shareに独自タグを追加しました！！
<ms-deco style warning>使い方は、公式ページをご覧ください</ms-deco>
</ms-deco>