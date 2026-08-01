# enmy-color

> バージョン v1.0｜最終更新 2026-08-01

[English](README.md) ｜ [繁體中文](README.zh-Hant.md) ｜ [日本語](README.ja.md)

**ENMY（恩米）** アクリルマーカーの色番号 → CSS 参照ツール（読み取り専用）。80 色を
メーカー公式の 8 カラーグループと色番号の接頭辞で閲覧でき、最も近い色の比較
（CIEDE2000）、ワンクリックコピー、`.css` 書き出し、ライト/ダーク、3 言語に対応します。

**このメーカーは色名を公表していません。** ENMY は色番号のみで識別します
（`R1`、`BG6`、`DE2`）。同梱カラーカードに中国語表記があるのは肌色系 4 色だけで、
残り 76 色には何もありません。そのため本アプリは常に**色番号**を主識別子として表示し、
訳語を名前に昇格させることはしません——そうすると販売店に対して検証できなくなるからです。

## 特長

- **80 色を 1 ページで。** 1 行に 1 つの接頭辞、横は番号順——これは ENMY 自身の
  符号化（`R1` ＝ 接頭辞 `R` ＋ 番号 `1`）であり、こちらで考案したレイアウトではありません。
  接頭辞に**公式名称はない**ため、本アプリは名前を付けません。
- **2 つの軸を混ぜない。** 公式英語名を持つ 8 グループ（`Red & Pink`、`Blue & Teal` …）が
  チップ、14 の接頭辞が行です。
- **色ごとの出典グレード。** 80 色のうち 60 色は独立した 2 枚の公式チャートに現れ、
  両者はバイト単位で一致します。残り 20 色は出典 1 枚のみ。詳細カードに色ごとに明記します。
- **最も近い ENMY 色**（ΔE00）。60 色セットに限定可能——手元にないペンは勧めません。
- **セット収録は正直に。** 24／36／48 の箱は実在しますが、**収録色を記した資料が
  見つかっていません**。「非収録」ではなく「不明」として表示します。
- `var()` / hex / `rgb()` / ユーティリティクラスをコピー、全体を `.css` として書き出し。
- バックエンドもデータベースも不要——`npm install && npm start` で動きます。

## 精度について

hex はメーカー自社ストアで公開されている 2 枚の公式チャートの**フラットなデジタル塗り**
から読み取った値で、印刷物のサンプリングではなくメーカー自身の数値です。
**ただしそれらは販促素材です**：ENMY はインクと一致するとは述べておらず、耐光性や
顔料インデックスも公表していません（水性アクリル）。仕様ではなく画面上の参考値として
お使いください。

## インストールと実行

```bash
npm install
npm start          # http://localhost:3000/apps/enmy-color/
PORT=3005 npm start
```

GitHub Pages とは非互換です（フロントエンドがサイトルートから絶対パスで資産を読むため、
本プロジェクトの Node サーバーが必要）。

## ディレクトリ構成

```
enmy-color/
├─ app.js                       # Express：静的配信 + / → 302 /apps/enmy-color/ + JSON 404
└─ public/apps/enmy-color/
   ├─ index.html                # 構造のみ
   ├─ enmy-color.css            # テーマトークン + ページスタイル
   ├─ enmy-color.js             # コントローラ（DOM 担当）
   ├─ enmy-color-lib.js         # 純粋コア → window.EnmyColorLib
   ├─ colour-detail.js          # 色見本の詳細モーダル
   ├─ nearest-panel.js          # 最も近い色のサイドバー
   ├─ data/enmy-colors.js       # 80 色    ┐ ビルド成果物。db_artcolor から
   ├─ data/enmy-sets.js         # 5 セット ┘ 書き出し。**手で編集しない**
   ├─ i18n.js + locales/        # zh-Hant / en / ja
   └─ icons/
```

## データ構造

```jsonc
// window.ENMY_COLORS[]
{
  "code":   "R1",              // 唯一の公式な識別子
  "prefix": "R",               // 色番号自体の構造。メーカーは接頭辞を命名していない
  "nameZh": "淺膚2",           // 肌色 4 色のみ。それ以外は存在しない
  "hex":    "#d6473f",
  "r": 214, "g": 71, "b": 63,
  "cssVar": "--enmy-r1",
  "family": "red-pink",        // 公式 8 グループのいずれか
  "verify": "cross-validated"  // または "approximate"（出典 1 枚のみ）
}

// window.ENMY_SETS[]
{
  "code": "direct-liquid-24", "name": "24 Colors Set", "size": 24,
  "known": false,              // false ＝ 収録内容を記した資料が**存在しない**
  "colors": []                 // 空なのは不明だから。中身が無いからではない
}
```

## コアライブラリ

```js
EnmyColorLib.nearestENMY({ r: 127, g: 179, b: 213 }, { n: 5, set: 'direct-liquid-60' })
// → [{ code, hex, cssVar, nameZh, family, verify, deltaE, band }, …]

EnmyColorLib.codeParts('BG6')     // → { prefix: 'BG', num: 6 }
EnmyColorLib.prefixRows(colors)   // → [{ prefix, colors[] }, …]
EnmyColorLib.buildCss(colors)     // → .css 全体の文字列
```

収録内容が不明なセットを指定した場合、`nearestENMY` は空を返さず `opts.set` を**無視**します。
空の結果は「近い色がない」と読まれてしまい、それは空の答えではなく誤った答えだからです。

## データの出どころ

`data/*.js` はファミリーの美術画材カラーデータベース `db_artcolor`（System of Record）
から書き出したビルド成果物です。**手で編集せず**、データベースを直して再書き出ししてください。
上流の出典はメーカー自社ストア（`products.json` ＋ チャート画像 2 枚）と、
肌色 4 色の中国語表記については販売店が撮影した公式同梱カラーカードです。

---

[MIT](LICENSE) © 2026 [Scott G.F. Hong](https://github.com/scottgfhong310)
