#!/bin/bash
# sync-copies.sh — 把本 repo 的前端同步到所有登記的複製點，並逐檔驗證。
#
# 權威版＝ GitHub/enmy-color。複製點有兩類：
#   ① InProgress 鏡像（整包前端）
#   ② color-palette / thangka-trace / color-mixer 三支消費端（只借 lib ＋ data），各自也有 InProgress 鏡像
#
# **回灌不是一次性的**（WORKFLOW.md Path A 的 A4）：GitHub 版是權威，
# 之後每次改前端都要再跑一次，否則 3001 上跑的是舊版。
# 這支腳本存在的理由就是「別靠記性」——faber-castell-color 曾因為同步腳本
# 放在暫存區、暫存區被清掉而漏同步過一次；同一次事故也暴露了它的 lib 複製件
# **早就與權威版不一致而沒有任何東西會報錯**。
#
# ⚠️ `data/enmy-*.js` 是 db_artcolor 的匯出產物，**本腳本只負責散佈、不產生**。
# 資料要更新請先跑 `My Projects/Art Colour/export/a3-export.js --write`，再跑本腳本。
#
# 用法：bash scripts/sync-copies.sh
set -u
G=/Users/Shared/nodeapp/GitHub
I=/Users/Shared/nodeapp/InProgress
SRC=$G/enmy-color/public/apps/enmy-color
DST=$I/public/apps/enmy-color
FAIL=0

echo "=== 1) 整包前端 → InProgress 鏡像（只同步程式碼）==="
mkdir -p "$DST"
cp -R "$SRC/." "$DST/"
if diff -rq "$SRC" "$DST" > /dev/null; then
  echo "  OK  與獨立版逐檔相同（$(find "$SRC" -type f | wc -l | tr -d ' ') 個檔）"
else
  echo "  MISMATCH  以下有差異："
  diff -rq "$SRC" "$DST"
  FAIL=1
fi

echo
echo "=== 2) lib + 資料 → color-palette / thangka-trace / color-mixer（含各自的 InProgress 鏡像）==="
# 三支消費端呼叫 nearestENMY 做「最接近的筆」。它們**不連任何 DB**，
# 靠的就是這裡複製過去的 lib 與資料——所以每次改本 repo 的 lib／資料都要再跑一次。
for app in color-palette thangka-trace color-mixer; do
  for dst in "$G/$app/public/apps/$app" "$I/public/apps/$app"; do
    [ -d "$dst" ] || { echo "  MISSING $dst"; FAIL=1; continue; }
    cp "$SRC/enmy-color-lib.js"   "$dst/enmy-color-lib.js"
    cp "$SRC/data/enmy-colors.js" "$dst/data/enmy-colors.js"
    echo "  → $dst"
  done
done

verify() {   # $1=標籤，其餘=所有複製點；全部同一個 md5 才算過
  local label=$1; shift
  local n
  n=$(md5 -r "$@" | awk '{print $1}' | sort -u | wc -l | tr -d ' ')
  if [ "$n" = "1" ]; then echo "  OK        $label — $# 份單一 hash"
  else echo "  MISMATCH  $label — $n 種 hash"; md5 -r "$@"; FAIL=1; fi
}

echo
echo "=== 3) md5 驗證（消費端複製件）==="
verify "enmy-color-lib.js" \
  "$SRC/enmy-color-lib.js" \
  "$G/color-palette/public/apps/color-palette/enmy-color-lib.js" \
  "$G/thangka-trace/public/apps/thangka-trace/enmy-color-lib.js" \
  "$I/public/apps/enmy-color/enmy-color-lib.js" \
  "$I/public/apps/color-palette/enmy-color-lib.js" \
  "$I/public/apps/thangka-trace/enmy-color-lib.js" \
  "$G/color-mixer/public/apps/color-mixer/enmy-color-lib.js" \
  "$I/public/apps/color-mixer/enmy-color-lib.js"

verify "data/enmy-colors.js" \
  "$SRC/data/enmy-colors.js" \
  "$G/color-palette/public/apps/color-palette/data/enmy-colors.js" \
  "$G/thangka-trace/public/apps/thangka-trace/data/enmy-colors.js" \
  "$I/public/apps/enmy-color/data/enmy-colors.js" \
  "$I/public/apps/color-palette/data/enmy-colors.js" \
  "$I/public/apps/thangka-trace/data/enmy-colors.js" \
  "$G/color-mixer/public/apps/color-mixer/data/enmy-colors.js" \
  "$I/public/apps/color-mixer/data/enmy-colors.js"

echo
echo "=== 4) 共用件 hash（應與家族其餘複製點一致）==="
for f in materialize-dark.css side-tool.css side-tool.js filter-clear.css filter-clear.js i18n.js; do
  printf "  %-22s %s\n" "$f" "$(md5 -q "$SRC/$f")"
done

echo
if [ "$FAIL" -eq 0 ]; then echo "全部通過。"; else echo "有項目不一致（見上）。"; fi
exit "$FAIL"
