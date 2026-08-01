#!/usr/bin/env python3
"""make-icons — 由母版參數產出整套 icon（SVG / PNG / .ico / manifest）。

icon 的概念：**八格色票**——ENMY 的官方分類就是 8 個色系（Black & White／Red & Pink／
Orange & Yellow／Green／Blue & Teal／Purple & Violet／Brown & Earth Tones／Gray & Neutral），
本 app 的 chips 也正是這 8 顆。與家族其他色彩 app 清楚區隔
（copic-color＝三乘三矩陣、faber-castell-color＝橫向色帶、caran-dache-color＝色卡扇）。
**刻意不用 ENMY 的品牌 logo**——避免冒用商標，標記只描述資料的形狀。

**八格全部是真實 ENMY 色，且由 `data/enmy-colors.js` 現查**（不寫死 hex）：
資料換了 icon 就跟著換，也讓「這八格是真的」變成可驗證的，而不是註解裡的宣稱。
色號找不到會直接拋錯——**寧可產不出來，不要默默配一個假顏色**。

⚠️ PyMuPDF 的兩個限制（copic-color / faber-castell-color 也踩過）：
  ① **不渲染 linearGradient**，會整片退成黑色 → 母版一律純色底。
  ② **以 SVG 宣告的 width/height 為渲染基準、不是 viewBox** → 倍率要用
     「目標 ÷ 實際 page 寬」反推，寫死 size/100 會得到完全錯誤的尺寸。

用法：python3 scripts/make-icons.py
"""
import json
import os
import re
import fitz
from PIL import Image

APP = os.path.join(os.path.dirname(__file__), '..', 'public', 'apps', 'enmy-color')
OUT = os.path.join(APP, 'icons')
DATA = os.path.join(APP, 'data', 'enmy-colors.js')

# 4 欄 × 2 列 ＝ 官方的 8 個色系，各取該系一支代表色（依 chips 的順序讀）。
CODES = [['0',  'R1',  'RY1', 'G1'],
         ['B1', 'V1',  'BR1', 'GY2']]

DARK_TILE = '#151a24'
DARK_EDGE = '#10131a'
LIGHT_TILE = '#f6f8fa'
LIGHT_EDGE = '#ffffff'


def hexes():
    """由 data/enmy-colors.js 取八格的 hex；缺任何一個就拋錯。"""
    src = open(DATA, encoding='utf-8').read()
    out = []
    for row in CODES:
        r = []
        for code in row:
            m = re.search(r'\{"code":"%s",[^}]*?"hex":"(#[0-9a-fA-F]{6})"' % re.escape(code), src)
            if not m:
                raise SystemExit(f'資料裡找不到色號 {code} —— icon 不產出（不編造顏色）')
            r.append(m.group(1))
        out.append(r)
    return out


def grid(xs, ys, w, h, rx, stroke, sw, fills):
    """八格色票；列優先排列，與 CODES 的讀法一致。"""
    cells = ''.join(
        f'<rect x="{xs[c]}" y="{ys[r]}" width="{w}" height="{h}" rx="{rx}" fill="{fills[r][c]}"/>'
        for r in range(len(ys)) for c in range(len(xs)))
    return f'<g stroke="{stroke}" stroke-width="{sw}">{cells}</g>'


def tile(size, inner, bg, hairline=False):
    # 淺色 tile 加一圈髮絲邊，否則在白底頁籤上整塊消失
    hl = ('<rect x="0.6" y="0.6" width="98.8" height="98.8" rx="22" fill="none" '
          'stroke="#d4dae2" stroke-width="1.2"/>') if hairline else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
            f'width="{size}" height="{size}">'
            f'<rect width="100" height="100" rx="22.5" fill="{bg}"/>{hl}{inner}</svg>')


def build_svgs(fills):
    m_d = grid((15, 36, 57, 78), (28, 56), 19, 22, 4, DARK_EDGE, 1.4, fills)
    m_l = grid((15, 36, 57, 78), (28, 56), 19, 22, 4, LIGHT_EDGE, 1.4, fills)
    # favicon：格子刻意放大，否則 16px 糊成一塊
    f_d = grid((8, 32, 56, 80), (18, 54), 21, 28, 5, DARK_EDGE, 2, fills)
    f_l = grid((8, 32, 56, 80), (18, 54), 21, 28, 5, LIGHT_EDGE, 2, fills)
    files = {
        'enmy-color-icon.svg':       tile(512, m_d, DARK_TILE),
        'enmy-color-icon-light.svg': tile(512, m_l, LIGHT_TILE, True),
        'favicon.svg':               tile(64, f_d, DARK_TILE),
        'favicon-light.svg':         tile(64, f_l, LIGHT_TILE, True),
    }
    for name, svg in files.items():
        open(os.path.join(OUT, name), 'w').write(svg)
    return list(files)


def build_pngs():
    src = {16: 'favicon.svg', 32: 'favicon.svg', 48: 'favicon.svg'}
    for s in (64, 128, 180, 192, 256, 512):
        src[s] = 'enmy-color-icon.svg'
    for size, f in sorted(src.items()):
        page = fitz.open(os.path.join(OUT, f))[0]
        z = size / page.rect.width          # ⚠️ 由實際 page 寬反推，不可寫死 size/100
        pm = page.get_pixmap(alpha=True, matrix=fitz.Matrix(z, z))
        assert pm.width == size == pm.height, f'{size} → {pm.width}x{pm.height}'
        pm.save(os.path.join(OUT, f'icon-{size}.png'))
    Image.open(os.path.join(OUT, 'icon-48.png')).convert('RGBA').save(
        os.path.join(OUT, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])


def build_manifest():
    m = {
        "name": "enmy-color",
        "short_name": "ENMY colour",
        "description": "ENMY colour code → CSS reference. The brand publishes no colour names; "
                       "colours are identified by code alone.",
        "start_url": "/apps/enmy-color/",
        "scope": "/apps/enmy-color/",
        "display": "standalone",
        "background_color": "#0f1115",
        "theme_color": "#0f1115",
        "icons": [
            {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    open(os.path.join(OUT, 'manifest.json'), 'w').write(
        json.dumps(m, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    fills = hexes()
    for row, f in zip(CODES, fills):
        print('  ', '  '.join(f'{c} {h}' for c, h in zip(row, f)))
    print('SVG 母版 :', ', '.join(build_svgs(fills)))
    build_pngs()
    build_manifest()
    print('產出       :', len(os.listdir(OUT)), '個檔於 icons/')
