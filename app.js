/**
 * enmy-color — 獨立執行的 Express 伺服器
 *
 * 唯讀參考工具：ENMY 色號 → CSS（hex / var / rgb / utility class）對照。
 * 80 色與 5 組套組是靜態 registry（public/apps/enmy-color/data/enmy-*.js，
 * 由家族美術色材領域庫 db_artcolor 匯出），不需上傳/編輯，故**後端無 API**——
 * 只負責靜態檔、根路徑轉址、JSON 404。app 本身不連任何資料庫。
 *
 * 啟動： npm install && npm start
 *        預設 http://localhost:3000/apps/enmy-color/
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// 根路徑導向應用頁
app.get('/', (req, res) => res.redirect('/apps/enmy-color/'));

// 404（API 回 JSON，其餘回純文字）
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'Not found' });
  res.status(404).type('text/plain').send('Not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`enmy-color →  http://localhost:${PORT}/apps/enmy-color/`);
});
