# CLAUDE.md — enmy-color

> 版本 v1.0｜最後更新 2026-08-01

ENMY（恩米）壓克力麥克筆色號 → CSS 的唯讀參考 WebApp。家族第五支色彩 registry。

## 先讀家族規範

- [DESIGN_GUIDELINES.md](https://github.com/scottgfhong310/nodeapp-webapp-family/blob/main/DESIGN_GUIDELINES.md)
  — 結構 / 後端 / 前端 / 視覺 / i18n / 安全。**§11.1 色票明細卡**是本 app 的形制依據，
  **§6.2 資料的多語名稱**是「色名怎麼顯示」的依據。
- [WORKFLOW.md](https://github.com/scottgfhong310/nodeapp-webapp-family/blob/main/WORKFLOW.md)
  ／[PLAYBOOK.md](https://github.com/scottgfhong310/nodeapp-webapp-family/blob/main/PLAYBOOK.md)
  — 本 app 走 Path A。

## 結構與執行

```bash
npm install && npm start        # http://localhost:3000/apps/enmy-color/
PORT=3005 npm start             # 同時跑多支時錯開
```

前端四件式在 `public/apps/enmy-color/`：`index.html`（純結構）／`enmy-color.css`
／`enmy-color.js`（控制器）／`enmy-color-lib.js`（純核心 → `window.EnmyColorLib`，**不碰 DOM**）。
另有兩支「碰 DOM 但獨立成模組」的：`colour-detail.js`（明細 Modal）與 `nearest-panel.js`
（最接近色側欄）——形制與另外四支色彩 registry 逐條對齊。

**後端無 API**：資料是靜態 registry，`app.js` 只做靜態檔、`/` → 302、JSON 404。
**本 app 不連任何資料庫。**

## 這支 app 的三條特有紀律

1. **色號是唯一的識別，不可用譯名取代。** ENMY 不發佈色名；只有 4 個膚色在隨盒色卡上
   有中文標示。把那 4 個升格成「名字」會讓其餘 76 色無名可用、也讓 app 對賣家不可驗證。
   §6.2 的「官方名恆為主名」在這裡的樣子就是「主名只有色碼」。
2. **色碼字首不可命名。** `R`／`VR`／`RY`／`BR`／`DE`／`GY` 共 14 個字首，
   品牌從未公布它們各代表什麼。列首只印字首本身。有官方名稱的是另一個軸——
   官方店的 8 個行銷色系，那才是 chips。**兩個軸不可混。**
3. **「未知」與「不收錄」不可混。** 24／36／48 三組套裝的收錄清單找不到任何來源，
   資料檔以 `known:false` 標記；UI 一律說「未知」，比對器一律忽略該過濾條件
   （用空清單去篩會回零結果，而使用者會讀成「沒有接近的色」）。

## 資料：建置產物，不手改

`data/enmy-colors.js`（80 色）與 `data/enmy-sets.js`（5 套組）由家族美術色材領域庫
`db_artcolor` 匯出，那裡才是 System of Record。要改資料就去改 DB 再重跑匯出器：

```bash
cd "My Projects/Art Colour/export"
node a3-export.js --check     # 看哪些過期
node a3-export.js --write     # 補出產物（repo ＋ InProgress 鏡像各一份）
node a3-export.js --check     # 必須「全部逐位元組相同」
```

⚠️ `--write` 帶出的是 DB 裡**所有**品牌的變更，不只 ENMY——之後逐 repo 看 `git status`，
不屬於本次工作的變更分開提交（治理文件「匯出器的三個模式」§第四步）。

**icon 也是產物**：`python3 scripts/make-icons.py` 由 `data/enmy-colors.js` **現查** 8 個
代表色重畫；色號找不到會直接拋錯，不編造顏色。

## 複製件登記（共用件改版時靠這份清單找同步點）

| 檔案 | 權威版 |
|---|---|
| `materialize-dark.css` | 家族 repo 根 |
| `side-tool.css` / `side-tool.js` | 家族 repo 根 |
| `i18n.js` | 家族 repo 根 |
| `filter-clear.css` / `filter-clear.js` | 家族 repo（§5.12） |

**本 app 是別人的上游**：`color-palette` 與 `thangka-trace` 借走 `enmy-color-lib.js`
＋ `data/enmy-colors.js` 做 `nearestENMY`（2026-08-01 接上）。**改了 lib 或資料就要跑**
`bash scripts/sync-copies.sh`——它同步 InProgress 鏡像與兩支消費端（含各自的鏡像），
並以 md5 驗六份複製件是不是單一 hash。
**權威版改了、複製點沒跟上，沒有任何東西會報錯**——這支腳本就是把那件事變成看得見的。

## 為什麼長這樣

設計取捨見 [DESIGN.md](DESIGN.md)。
