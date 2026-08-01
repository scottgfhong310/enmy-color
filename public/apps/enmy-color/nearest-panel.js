/**
 * nearest-panel — 最接近色側欄
 *
 * **碰 DOM，所以不進 lib**；形制與 faber-castell-color／caran-dache-color／copic-color
 * 逐條對齊（側欄常駐、明細 Modal 疊在它上面開，關掉明細回到同一份清單並保留高亮）。
 *
 * 與 copic-color 的差別有兩處，都是資料決定的：
 *   ① **結果只有色碼，沒有色名**——ENMY 不發佈色名，硬要擠一行只會擠出空字串。
 *   ② 下拉選單限定的是**套組**而不是產品線（ENMY 只有一條產品線）。
 *      這是同一條原則的另一個樣子：**手上沒有的筆別推薦**。
 *      ⚠️ 收錄不明的三組（24／36／48）**不列進選單**——用空清單去篩會回零結果，
 *      而使用者會把它讀成「沒有接近的色」。那是錯的答案，不是空的答案。
 *
 * 用法：EnmyNearest.init({ onPick: function (color) { … } });
 */
(function (global) {
  'use strict';

  var L = global.EnmyColorLib;
  var ID = 'nearest-panel';
  var NEAR_N = 12;
  // ΔE 級距的說法與家族另外三支的 band.* 逐字相同——同一把尺、同一組級距，讀法也該一樣
  var BAND_FB = { very: '極接近', close: '接近', noticeable: '可辨差異', far: '差異大' };

  var inst = null, opts = {};

  function t(key, fb) {
    if (!global.I18n || !global.I18n.t) return fb;
    var v = global.I18n.t(key);
    return (v && v !== key) ? v : fb;
  }
  function tp(key, params, fb) {
    if (global.I18n && global.I18n.t) {
      var v = global.I18n.t(key, params);
      if (v && v !== key) return v;
    }
    return fb;
  }

  function colors() { return global.ENMY_COLORS || []; }
  function sets() { return global.ENMY_SETS || []; }

  // 從一段文字裡認出顏色。認得本 app 自己複製出去的四種格式
  // （`var(--enmy-r1)` / `#d6473f` / `rgb(214, 71, 63)` / `enmy-bg-r1`）與夾在 CSS 行裡的 hex。
  // 認不出來就回 null，由呼叫端說明，**不猜、也不默默套一個顏色**。
  function parseColorText(text) {
    var s = String(text || '').trim();
    if (!s) return null;
    var m = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(s);
    if (m) {
      var v = [+m[1], +m[2], +m[3]];
      if (v.every(function (n) { return n <= 255; })) {
        return '#' + v.map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join('');
      }
    }
    m = /(?:^|[^0-9a-z])#?([0-9a-f]{6})(?![0-9a-z])/i.exec(s);
    if (m) return '#' + m[1].toLowerCase();
    m = /(?:^|[^0-9a-z])#([0-9a-f]{3})(?![0-9a-z])/i.exec(s);   // 三碼一律要 #，否則 60／80 這種數字也會中
    if (m) return '#' + m[1].toLowerCase().split('').map(function (c) { return c + c; }).join('');
    return null;
  }

  function pasteFromClipboard() {
    var fail = function () {
      M.toast({ html: t('toast.pasteFail', '無法讀取剪貼簿（瀏覽器未授權）'), classes: 'red' });
    };
    if (!navigator.clipboard || !navigator.clipboard.readText) return fail();
    navigator.clipboard.readText().then(function (txt) {
      var hex = parseColorText(txt);
      if (!hex) {
        M.toast({ html: t('toast.pasteNoColor', '剪貼簿裡沒有可辨識的顏色'), classes: 'orange' });
        return;
      }
      document.getElementById('nearest-hex').value = hex;
      document.getElementById('nearest-input').value = hex;
      render();
      M.toast({ html: tp('toast.pasted', { v: hex }, '已貼上：' + hex), displayLength: 1400 });
    }).catch(fail);
  }

  var MARKUP =
    '<li><a class="subheader"><i class="material-icons">colorize</i>' +
      '<span data-i18n="nearest.title">找最接近的 ENMY 色</span></a></li>' +
    '<li><div class="divider"></div></li>' +
    '<li>' +
      '<div class="nearest-form">' +
        '<input id="nearest-input" type="color" value="#3d9ad5" />' +
        '<input id="nearest-hex" type="text" value="#3d9ad5" spellcheck="false" autocomplete="off" ' +
               'data-i18n-placeholder="nearest.placeholder" placeholder="#RRGGBB" />' +
        '<button id="nearest-paste" class="nearest-paste" type="button" ' +
                'data-i18n-title="nearest.paste" title="從剪貼簿貼上">' +
          '<i class="material-icons">content_paste</i></button>' +
        '<select id="nearest-set" class="browser-default"></select>' +
      '</div>' +
      '<div class="nearest-hint" data-i18n="nearest.hint"></div>' +
    '</li>' +
    '<li><div class="divider"></div></li>' +
    '<div id="nearest-result" class="nearest-result"></div>';

  function fillSets() {
    var $set = document.getElementById('nearest-set');
    if (!$set) return;
    var keep = $set.value;
    $set.innerHTML = '';
    var all = document.createElement('option');
    all.value = '';
    all.textContent = tp('nearest.allColors', { n: colors().length }, '全部 ' + colors().length + ' 色');
    $set.appendChild(all);
    // 只列收錄已知的套組；80 組＝全色，與「全部」重複，故略過
    L.knownSets(sets()).forEach(function (s) {
      if (s.colors.length >= colors().length) return;
      var o = document.createElement('option');
      o.value = s.code;
      o.textContent = tp('nearest.setOption', { n: s.size }, s.size + ' 色組');
      $set.appendChild(o);
    });
    $set.value = keep;                                   // 換語言重建選項時保住當下選擇
  }

  function itemNode(m, c) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'near-item';
    el.innerHTML =
      '<span class="near-sw"></span>' +
      '<span class="near-meta">' +
        '<span class="near-name"></span>' +
        '<span class="near-sub"><span class="near-hex"></span>' +
        '<span class="near-de band-' + m.band + '"></span></span>' +
      '</span>';
    // 色塊字色由對比算出、寫在色塊自己身上（文字直接放在它裡面，不再包一層 span，
    // 免得 Materialize 的 span 色規則把它蓋掉——.en-cell 同一顆坑）
    var sw = el.querySelector('.near-sw');
    sw.style.background = m.hex;
    sw.style.color = L.pickTextColor(c);
    sw.textContent = m.code;
    // 沒有色名可放。這一行改放「隨盒色卡的中文標示（只有 4 色有）」或官方色系名，
    // **不留空**——空白會被讀成資料掉了。
    var fam = (global.ENMY_FAMILIES || []).filter(function (f) { return f.code === m.family; })[0];
    el.querySelector('.near-name').textContent = m.nameZh || (fam ? fam.name : '');
    el.querySelector('.near-hex').textContent = m.hex;
    el.querySelector('.near-de').textContent =
      'ΔE ' + m.deltaE.toFixed(2) + ' · ' + t('band.' + m.band, BAND_FB[m.band]);
    el.addEventListener('click', function () {
      // 側欄不關：明細看完退回來還在同一份結果上
      var $out = document.getElementById('nearest-result');
      var prev = $out.querySelector('.near-item.active');
      if (prev) prev.classList.remove('active');
      el.classList.add('active');
      if (opts.onPick) opts.onPick(c);
    });
    return el;
  }

  function render() {
    var $out = document.getElementById('nearest-result');
    if (!$out) return;
    var rgb = L.hexToRgb(document.getElementById('nearest-hex').value);
    if (isNaN(rgb.r)) return;
    var set = document.getElementById('nearest-set').value;
    var res = L.nearestENMY(rgb, { n: NEAR_N, set: set || undefined, colors: colors(), sets: sets() });
    $out.innerHTML = '';
    res.forEach(function (m) {
      var c = colors().filter(function (x) { return x.code === m.code; })[0];
      $out.appendChild(itemNode(m, c));
    });
  }

  function ensure() {
    if (document.getElementById(ID)) return;
    var el = document.createElement('ul');
    el.id = ID;
    el.className = 'sidenav nearest-panel';
    el.style.width = '360px';
    el.innerHTML = MARKUP;
    document.body.appendChild(el);

    inst = M.Sidenav.init(el, {
      edge: 'right',
      // 側欄開啟時把整排側鍵淡出（共用 side-tool.css 的 body.sidenav-open）
      onOpenStart: function () { document.body.classList.add('sidenav-open'); },
      onCloseEnd: function () { document.body.classList.remove('sidenav-open'); }
    });

    var $pick = document.getElementById('nearest-input');
    var $hex = document.getElementById('nearest-hex');
    $pick.addEventListener('input', function () { $hex.value = $pick.value; render(); });
    $hex.addEventListener('input', function () {
      if (/^#[0-9a-fA-F]{6}$/.test($hex.value)) { $pick.value = $hex.value.toLowerCase(); render(); }
    });
    document.getElementById('nearest-set').addEventListener('change', render);
    document.getElementById('nearest-paste').addEventListener('click', pasteFromClipboard);

    if (global.I18n && global.I18n.apply) global.I18n.apply(el);
  }

  function init(o) {
    opts = o || {};
    ensure();
    fillSets();
    render();
  }

  function open() {
    ensure();
    render();
    inst.open();
  }

  // 切語言時重建（套組選項、提示、分級標示）；側欄常駐，可能正開著
  function refresh() {
    var el = document.getElementById(ID);
    if (!el) return;
    if (global.I18n && global.I18n.apply) global.I18n.apply(el);
    fillSets();
    render();
  }

  global.EnmyNearest = { init: init, open: open, refresh: refresh };
})(window);
