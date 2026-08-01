/* English (en) */
/* Shared keys (tool.mode / tool.lang / toast.*) are copied verbatim from the canonical
   table in DESIGN_GUIDELINES §6 — do not reword them here. */
I18n.register('en', {
  'title.page': 'ENMY Colour → CSS',
  'app.title': 'ENMY colour code → CSS',
  'app.sub': '{total} colours. The brand identifies them by code only and publishes no colour names. {cross} of the hex values are corroborated by a second official chart',

  'search.placeholder': 'code or hex…',
  'search.empty': 'No matching colour',

  'family.all': 'All',

  'tool.layout': 'Switch layout: code rows / all swatches',
  'tool.nearest': 'Find the nearest ENMY colour',
  'tool.css': 'View / copy the whole CSS',
  'tool.download': 'Download enmy_colors.css',
  'tool.mode': 'Toggle light / dark',
  'tool.lang': 'Language',

  'rows.explain': 'one row per code prefix, ordered by number; the prefixes have no official names',

  'css.title': 'CSS variables + utility classes',
  'css.sub': 'colours, with <code>:root</code> variables and utility classes',
  'css.copy': 'Copy all',
  'css.download': 'Download .css',

  'nearest.title': 'Find the nearest ENMY colour',
  'nearest.hint': 'Matched with CIEDE2000 (ΔE00). Limit it to a set and only colours that set really contains are suggested — never recommend a pen you do not own. The 24 / 36 / 48 boxes are not listed: no source states what they contain.',
  'nearest.allColors': 'All {n} colours',
  'nearest.setOption': '{n}-colour set',
  'nearest.placeholder': '#RRGGBB',
  'nearest.paste': 'Paste from clipboard',

  'band.very': 'excellent match',
  'band.close': 'close',
  'band.noticeable': 'noticeable',
  'band.far': 'far',

  'detail.close': 'Close',
  'detail.parse': 'Code breakdown',
  'detail.sets': 'Included in sets',
  'detail.absent': 'What this brand does not publish',
  'detail.prefix': 'Code prefix',
  'detail.num': 'Number',
  'detail.family': 'Official family',
  'detail.familyJump': 'Show only this family',
  'detail.verify': 'Source',
  'detail.prefixNote': 'The prefix is part of the code’s own structure; the brand has never published names for the prefixes, so this page does not invent any.',
  'detail.noPrefix': 'Black and white have no prefix — the codes are simply 0 and 1.',
  'detail.noName': 'The brand publishes no colour name; this colour is identified by its code',
  'detail.nameCard': 'Chinese label printed on the colour card in the box (skin tones only)',
  'detail.setsUnknown': 'There are also 24 / 36 / 48 boxes, but no source states which colours they contain — that is unknown, not “excluded”.',
  'detail.lightfast': 'Lightfastness',
  'detail.pigment': 'Pigment',
  'detail.nameEn': 'English / Japanese name',
  'detail.notPublished': 'Not published (water-based acrylic)',
  'detail.noNameAtAll': 'Does not exist — the brand identifies colours by code only',

  'verify.cross': 'corroborated by two official charts',
  'verify.approx': 'single official chart',
  'note.cross': 'Hex read from the flat fill of an official chart and byte-identical on a second official chart. The charts are marketing assets, not an ink specification.',
  'note.approx': 'Hex read from the flat fill of an official chart; only one source, not corroborated. The charts are marketing assets, not an ink specification.',

  'toast.copied': 'Copied',
  'toast.copyFail': 'Copy failed (requires localhost or HTTPS)',
  'toast.pasted': 'Pasted: {v}',
  'toast.pasteFail': 'Can\'t read the clipboard (permission denied) — paste into the field with ⌘V instead',
  'toast.pasteNoColor': 'No colour found in the clipboard',
  'toast.lang': 'Switched to {name}',
  'toast.downloaded': 'Downloaded: {n}'
}, 'English');
