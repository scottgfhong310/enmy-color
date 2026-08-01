# enmy-color

> 版本 v1.0｜最後更新 2026-08-01

[English](README.md) ｜ [繁體中文](README.zh-Hant.md) ｜ [日本語](README.ja.md)

**ENMY（恩米）** 壓克力麥克筆色號 → CSS 的唯讀參考工具。80 色，可依原廠的 8 個色系
與色碼字首瀏覽，附最接近色比對（CIEDE2000）、一鍵複製、`.css` 匯出、light/dark 與三語。

**這個品牌不發佈色名。** ENMY 只以色號識別（`R1`、`BG6`、`DE2`）；只有 4 個膚色在
隨盒色卡上另印中文標示，其餘 76 色什麼都沒有。所以本 app 一律以**色號**為主識別，
不把譯名或標示升格成名字——那會讓 app 對其餘 76 色不可驗證。

## 功能

- **80 色一頁看完。** 一列一個色碼字首、橫向依號碼——那是 ENMY 自己的編碼
  （`R1` ＝ 字首 `R` ＋ 號碼 `1`），不是我們發明的版面。
  字首**沒有官方名稱**，所以本頁不替它命名。
- **兩個軸分開。** 有官方英文名的 8 個色系（`Red & Pink`、`Blue & Teal`…）是 chips；
  14 個色碼字首是列。
- **逐色標示來源等級。** 80 色中有 60 色同時出現在兩份獨立的官方色表、且兩份逐位元相同；
  另外 20 色只有一份來源。明細卡逐色說明是哪一種。
- **最接近的 ENMY 色**（ΔE00），可限定 60 色套組——手上沒有的筆別推薦。
- **套組收錄講實話。** 24／36／48 三盒確實存在，但**沒有任何來源寫出它們收錄哪些色**，
  一律標為「未知」，絕不畫成「不收錄」。
- 複製 `var()` / hex / `rgb()` / utility class；整份匯出 `.css`。
- 零後端、零資料庫——`npm install && npm start` 就能跑。

## 準確度

hex 取自品牌自營店兩份官方色表的**平色數位填色**，所以是品牌自己的數值而非印刷取樣。
**但那是行銷素材**：ENMY 未聲明它等於墨水實色，也不公布耐光度與顏料索引
（水性壓克力）。請當作螢幕參考值，不是色彩規格。

## 安裝與執行

```bash
npm install
npm start          # http://localhost:3000/apps/enmy-color/
PORT=3005 npm start
```

不相容 GitHub Pages——前端以絕對路徑自站台根取資產，需由本專案的 Node 伺服器提供。

## 目錄結構

```
enmy-color/
├─ app.js                       # Express：靜態檔 + / → 302 /apps/enmy-color/ + JSON 404
└─ public/apps/enmy-color/
   ├─ index.html                # 純結構
   ├─ enmy-color.css            # 主題 token + 本頁樣式
   ├─ enmy-color.js             # 控制器（碰 DOM）
   ├─ enmy-color-lib.js         # 純核心 → window.EnmyColorLib
   ├─ colour-detail.js          # 色票明細 Modal
   ├─ nearest-panel.js          # 最接近色側欄
   ├─ data/enmy-colors.js       # 80 色  ┐ 建置產物，由 db_artcolor 匯出
   ├─ data/enmy-sets.js         # 5 套組 ┘ **不手改**
   ├─ i18n.js + locales/        # zh-Hant / en / ja
   └─ icons/
```

## 資料結構

```jsonc
// window.ENMY_COLORS[]
{
  "code":   "R1",              // 唯一的官方識別
  "prefix": "R",               // 色碼自身的結構；品牌未替字首命名
  "nameZh": "淺膚2",           // 只有 4 個膚色有，其餘缺席
  "hex":    "#d6473f",
  "r": 214, "g": 71, "b": 63,
  "cssVar": "--enmy-r1",
  "family": "red-pink",        // 官方 8 個色系之一
  "verify": "cross-validated"  // 或 "approximate"（單一來源）
}

// window.ENMY_SETS[]
{
  "code": "direct-liquid-24", "name": "24 Colors Set", "size": 24,
  "known": false,              // false ＝ **沒有任何來源**寫出收錄清單
  "colors": []                 // 空是因為未知，不是因為它真的沒有色
}
```

## 核心 library

```js
EnmyColorLib.nearestENMY({ r: 127, g: 179, b: 213 }, { n: 5, set: 'direct-liquid-60' })
// → [{ code, hex, cssVar, nameZh, family, verify, deltaE, band }, …]

EnmyColorLib.codeParts('BG6')     // → { prefix: 'BG', num: 6 }
EnmyColorLib.prefixRows(colors)   // → [{ prefix, colors[] }, …]
EnmyColorLib.buildCss(colors)     // → 整份 .css 字串
```

套組收錄不明時，`nearestENMY` 會**忽略** `opts.set` 而不是回空陣列——空結果會被讀成
「沒有接近的色」，那是錯的答案，不是空的答案。

## 資料從哪裡來

`data/*.js` 是由家族美術色材領域庫 `db_artcolor`（System of Record）匯出的建置產物，
**不手改**；要改就去改資料庫再重新匯出。上游來源是品牌自營店
（`products.json` ＋ 兩份色表圖），以及 4 個膚色中文標示所依據的、經銷商拍攝的
官方隨盒色卡。

---

[MIT](LICENSE) © 2026 [Scott G.F. Hong](https://github.com/scottgfhong310)
