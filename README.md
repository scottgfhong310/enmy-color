# enmy-color

> 版本 v1.0｜最後更新 2026-08-01

[English](README.md) ｜ [繁體中文](README.zh-Hant.md) ｜ [日本語](README.ja.md)

A read-only reference for **ENMY** acrylic paint marker colour codes → CSS. 80 colours,
browsable by the brand's own 8 colour groups and by code prefix, with a nearest-colour
matcher (CIEDE2000), one-click copy, `.css` export, light/dark and three UI languages.

**The brand publishes no colour names.** ENMY identifies its markers by code alone
(`R1`, `BG6`, `DE2`). Four skin tones carry a Chinese label on the colour card that ships
in the box; the other 76 have nothing. This app therefore shows the **code** as the
primary identity everywhere — it never promotes a translation to a name, because that
would make the app unverifiable against a seller.

## Features

- **80 colours in one page.** One row per code prefix, ordered by number — that is
  ENMY's own encoding (`R1` = prefix `R` + number `1`), not a layout we invented.
  The prefixes have **no official names**, so the app does not give them any.
- **Two axes, kept apart.** The 8 groups with official English names (`Red & Pink`,
  `Blue & Teal`, …) are the chips; the 14 code prefixes are the rows.
- **Per-colour source grade.** 60 of the 80 hex values appear on two independent
  official charts and are byte-identical between them; the other 20 have a single
  source. The detail card says which, per colour.
- **Nearest ENMY colour** (ΔE00), optionally limited to the 60-colour set — never
  recommend a pen you do not own.
- **Set membership is honest.** The 24 / 36 / 48 boxes exist, but **no source states
  what they contain**. They are shown as *unknown*, never as *excluded*.
- Copy `var()` / hex / `rgb()` / utility class; export the whole thing as `.css`.
- Zero backend, zero database — `npm install && npm start` and it runs.

## Accuracy

The hex values are read from the flat digital fills of two official charts published on
the brand's own store, so they are the brand's own numbers rather than sampled print.
**But those charts are marketing assets**: ENMY makes no claim that they match the ink,
and publishes no lightfastness ratings and no pigment index (it is a water-based acrylic).
Treat the values as a screen reference, not a specification.

## Install & run

```bash
npm install
npm start          # http://localhost:3000/apps/enmy-color/
PORT=3005 npm start
```

Not compatible with GitHub Pages — the front end loads its assets from the site root
via absolute paths, so it needs this Node server.

## Layout

```
enmy-color/
├─ app.js                       # Express: static + / → 302 /apps/enmy-color/ + JSON 404
└─ public/apps/enmy-color/
   ├─ index.html                # structure only
   ├─ enmy-color.css            # theme tokens + page styles
   ├─ enmy-color.js             # controller (DOM)
   ├─ enmy-color-lib.js         # pure core → window.EnmyColorLib
   ├─ colour-detail.js          # swatch detail modal
   ├─ nearest-panel.js          # nearest-colour sidebar
   ├─ data/enmy-colors.js       # 80 colours   ┐ build artefacts, exported from
   ├─ data/enmy-sets.js         # 5 sets       ┘ db_artcolor — do not hand-edit
   ├─ i18n.js + locales/        # zh-Hant / en / ja
   └─ icons/
```

## Data shape

```jsonc
// window.ENMY_COLORS[]
{
  "code":   "R1",              // the only official identity
  "prefix": "R",               // structure of the code; the brand names no prefixes
  "nameZh": "淺膚2",           // only 4 skin tones have this; absent otherwise
  "hex":    "#d6473f",
  "r": 214, "g": 71, "b": 63,
  "cssVar": "--enmy-r1",
  "family": "red-pink",        // one of the 8 official groups
  "verify": "cross-validated"  // or "approximate" (single source)
}

// window.ENMY_SETS[]
{
  "code": "direct-liquid-24", "name": "24 Colors Set", "size": 24,
  "known": false,              // false = NO SOURCE states the contents
  "colors": []                 // empty because unknown, not because it is empty
}
```

## Core library

```js
EnmyColorLib.nearestENMY({ r: 127, g: 179, b: 213 }, { n: 5, set: 'direct-liquid-60' })
// → [{ code, hex, cssVar, nameZh, family, verify, deltaE, band }, …]

EnmyColorLib.codeParts('BG6')     // → { prefix: 'BG', num: 6 }
EnmyColorLib.prefixRows(colors)   // → [{ prefix, colors[] }, …]
EnmyColorLib.buildCss(colors)     // → the whole .css as a string
```

`nearestENMY` ignores `opts.set` when that set's contents are unknown, rather than
returning nothing — an empty result would read as "no close colour", which is a wrong
answer, not an empty one.

## Where the data comes from

`data/*.js` are build artefacts exported from the family colour database
`db_artcolor`, which is the System of Record. Do not hand-edit them; change the
database and re-export. The upstream sources are the brand's own store
(`products.json` + two chart images) and, for the four Chinese skin-tone labels, a
retailer's photograph of the official in-box colour card.

---

[MIT](LICENSE) © 2026 [Scott G.F. Hong](https://github.com/scottgfhong310)
