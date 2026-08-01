/**
 * enmy-color — 主頁控制器（碰 DOM 的那一半；純邏輯在 enmy-color-lib.js）
 *
 * 版面的依據：ENMY 的色號＝**字首＋號碼**（R1、BG6、DE2），所以「一列一個字首、
 * 橫向依號碼」不是我們發明的排法，是把它原本的編碼畫出來
 * （同 copic-color 用矩陣畫 Copic Color System）。
 *
 * ⚠️ 但**字首沒有官方名稱**——品牌從未公布 R／VR／RY／BR／DE／GY 各代表什麼。
 * 所以列首只印字首本身；有官方名稱的是另一個軸：官方店的 8 個行銷色系，那才是 chips。
 * 兩個軸不可混為一談，也不可替字首補一個我們自己編的名字。
 *
 * 60 色套組的收錄畫在色塊上（`·` ＝ 在 60 組內），因為那是本品牌唯一真正可用的
 * 「這支筆我手上有沒有」的線索——24／36／48 三組收錄不明，全 app 一律標為未知。
 */
(function () {
  'use strict';

  var L = window.EnmyColorLib;
  var COLORS = window.ENMY_COLORS || [];
  var FAMS = window.ENMY_FAMILIES || [];
  var SETS = window.ENMY_SETS || [];
  var META = window.ENMY_META || {};
  var KEY_THEME = 'enmy-color-theme';
  var KEY_FAM = 'enmy-color-family';
  var KEY_LAYOUT = 'enmy-color-layout';

  var SET60 = (L.knownSets(SETS).filter(function (s) { return s.size === 60; })[0] || { colors: [] }).colors;

  var state = {
    family: localStorage.getItem(KEY_FAM) || 'red-pink',
    layout: localStorage.getItem(KEY_LAYOUT) || 'rows',   // 'rows' | 'flat'
    q: ''
  };

  var $fams = document.getElementById('families');
  var $axis = document.getElementById('axis');
  var $flat = document.getElementById('flat');
  var $none = document.getElementById('no-result');
  var $count = document.getElementById('count');

  // i18n.t 找不到鍵時回傳鍵名本身，故以「回傳值 === 鍵名」判定缺字典、才用 fallback
  function t(key, fb) {
    if (!window.I18n || !I18n.t) return fb;
    var v = I18n.t(key);
    return (v && v !== key) ? v : fb;
  }
  function tp(key, params, fb) {
    if (window.I18n && I18n.t) {
      var v = I18n.t(key, params);
      if (v && v !== key) return v;
    }
    return fb;
  }

  // ---- 色系 chips ---------------------------------------------------------

  function chipNode(code, label, n, active, onClick) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'fam-chip' + (active ? ' active' : '');
    el.title = label;
    el.innerHTML = '<span class="fam-code"></span><span class="fam-n"></span>';
    el.querySelector('.fam-code').textContent = code;
    el.querySelector('.fam-n').textContent = n;
    el.addEventListener('click', onClick);
    return el;
  }

  function sepNode() {
    var sep = document.createElement('span');
    sep.className = 'fam-sep';
    return sep;
  }

  function renderFamilies() {
    $fams.innerHTML = '';

    // 「全部」＝取消色系選擇的那顆。分組 chips 恆有一個 active、無法取消，
    // 所以「看全部」必須自己是一顆 chip（§5.13：分組 chips 不可變成死鍵）。
    $fams.appendChild(chipNode(
      t('family.all', '全部'), t('family.all', '全部'), COLORS.length,
      state.layout === 'flat',
      function () {
        state.layout = 'flat';
        localStorage.setItem(KEY_LAYOUT, state.layout);
        render();
      }
    ));
    $fams.appendChild(sepNode());

    var prevChromatic = null;
    FAMS.forEach(function (f) {
      if (prevChromatic !== null && f.chromatic !== prevChromatic) $fams.appendChild(sepNode());
      prevChromatic = f.chromatic;
      var n = COLORS.filter(function (c) { return c.family === f.code; }).length;
      $fams.appendChild(chipNode(
        f.name, f.name, n,
        state.layout !== 'flat' && f.code === state.family,
        function () {
          state.family = f.code;
          state.layout = 'rows';
          localStorage.setItem(KEY_FAM, f.code);
          localStorage.setItem(KEY_LAYOUT, state.layout);
          render();
        }
      ));
    });
  }

  // ---- 色碼列（一列一個字首） ---------------------------------------------

  function cellNode(c) {
    var d = document.createElement('div');
    d.className = 'en-cell';
    d.style.background = c.hex;
    d.style.color = L.pickTextColor(c);
    d.title = c.code + (c.nameZh ? ' ' + c.nameZh : '') + ' · ' + c.hex;
    d.innerHTML = '<span class="c-code"></span><span class="c-set"></span>';
    d.querySelector('.c-code').textContent = c.code;
    // `60` ＝ 這支筆在 60 色套組裡。**只標已知的那一組**——24／36／48 收錄不明，
    // 若在這裡留白會被讀成「不在那些組裡」，而我們並不知道。
    d.querySelector('.c-set').textContent = SET60.indexOf(c.code) >= 0 ? '60' : '';
    d.addEventListener('click', function () { openDetail(c); });
    return d;
  }

  function renderRows() {
    var fam = FAMS.filter(function (f) { return f.code === state.family; })[0] || FAMS[0];
    var rows = L.prefixRows(COLORS, fam.code);
    var total = rows.reduce(function (n, r) { return n + r.colors.length; }, 0);

    $axis.innerHTML = '';
    var title = document.createElement('p');
    title.className = 'axis-title';
    title.innerHTML = '<strong></strong> <span></span>';
    title.querySelector('strong').textContent = fam.name;
    title.querySelector('span').textContent =
      '— ' + t('rows.explain', '一列一個色碼字首，橫向依號碼；字首無官方名稱')
      + '（' + total + '）';
    $axis.appendChild(title);

    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'prefix-row';
      var head = document.createElement('div');
      head.className = 'prefix-head';
      // 黑白沒有字首（色號就是 0 與 1）——用破折號而不是空白，空白看起來像沒渲染出來
      head.textContent = r.prefix || '—';
      row.appendChild(head);
      var cells = document.createElement('div');
      cells.className = 'prefix-cells';
      r.colors.forEach(function (c) { cells.appendChild(cellNode(c)); });
      row.appendChild(cells);
      $axis.appendChild(row);
    });

    $axis.style.display = 'block';
    $flat.style.display = 'none';
    $none.style.display = 'none';
    $count.textContent = total + ' / ' + COLORS.length;
  }

  // ---- 一維色票列（全部 / 搜尋結果） --------------------------------------

  function cardNode(c) {
    var el = document.createElement('div');
    el.className = 'en-card';
    el.innerHTML =
      '<div class="en-swatch"></div>' +
      '<div class="en-meta"><div class="en-name"></div><div class="en-hex"></div></div>';
    var sw = el.querySelector('.en-swatch');
    sw.style.background = c.hex;
    sw.style.color = L.pickTextColor(c);
    sw.textContent = c.code;
    // 沒有色名可放。改放中文標示（僅 4 個膚色有）或官方色系名，**不留空**——
    // 空白會被讀成資料掉了，而這裡的事實是「原廠不發佈色名」。
    // 規則寫在 lib 的 displayName()，因為 lib 會被複製進 color-palette／thangka-trace，
    // 三份複製件必須給出同一個答案。
    el.querySelector('.en-name').textContent = L.displayName(c, window.I18n && I18n.lang);
    el.querySelector('.en-hex').textContent = c.hex;
    el.addEventListener('click', function () { openDetail(c); });
    return el;
  }

  function renderFlat() {
    var list = L.sortColors(L.filter(COLORS, state.q), 'code', FAMS);
    $axis.style.display = 'none';
    $flat.style.display = list.length ? 'grid' : 'none';
    $none.style.display = list.length ? 'none' : 'block';
    $flat.innerHTML = '';
    list.forEach(function (c) { $flat.appendChild(cardNode(c)); });
    $count.textContent = list.length + ' / ' + COLORS.length;
  }

  // 副標的數字由資料算、不寫死——資料換了文案不會跟著騙人。
  // ⚠️ 它帶參數（{total}／{cross}），所以**不能只掛 data-i18n 讓引擎自己換**：
  // 引擎會把字面的 {total} 印出來。故由控制器在每次 render 時重填（§4：動態節點控制器負責重繪）。
  function renderSub() {
    var sub = document.getElementById('app-sub');
    if (!sub) return;
    sub.textContent = tp('app.sub',
      { total: META.total || COLORS.length, cross: META.crossValidated || 0 },
      (META.total || COLORS.length) + ' 色；原廠只以色號識別、不發佈色名');
  }

  function render() {
    renderSub();
    // 搜尋中整條 chip bar 收起（§5.13）：搜尋結果跨色系，留著一顆亮起的 chip
    // 只會讓人以為看到的是那個色系的色。
    $fams.style.display = state.q ? 'none' : '';
    if (!state.q) renderFamilies();
    if (state.q || state.layout === 'flat') renderFlat();
    else renderRows();
  }

  function openDetail(c) {
    window.EnmyDetail.open(c, { sets: SETS });
  }

  // ---- 側鍵 ---------------------------------------------------------------

  function applyTheme(mode) {
    var r = document.documentElement;
    r.dataset.theme = mode;
    r.classList.toggle('dark-mode', mode === 'dark');
    r.classList.toggle('light-mode', mode === 'light');
    localStorage.setItem(KEY_THEME, mode);
  }

  function initTools() {
    document.getElementById('setting-layout').addEventListener('click', function () {
      state.layout = state.layout === 'rows' ? 'flat' : 'rows';
      localStorage.setItem(KEY_LAYOUT, state.layout);
      render();
    });

    document.getElementById('setting-mode').addEventListener('click', function () {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('setting-lang').addEventListener('click', function () {
      var next = I18n.cycle();
      M.toast({ html: I18n.t('toast.lang', { name: I18n.name(next) }), displayLength: 1400 });
    });
    // i18n 引擎切語言後自己 apply DOM，但動態產生的節點要重畫（§4：控制器負責重繪）
    document.addEventListener('i18n:changed', function () {
      render(); EnmyDetail.refresh(); EnmyNearest.refresh();   // 側欄常駐、可能正開著
    });

    var cssModal = M.Modal.init(document.getElementById('css-modal'), { preventScrolling: false });
    document.getElementById('setting-css').addEventListener('click', function () {
      var css = L.buildCss(COLORS, META);
      document.getElementById('css-pre').textContent = css;
      document.getElementById('css-sub').innerHTML =
        COLORS.length + ' ' + t('css.sub', '色，含 <code>:root</code> 變數與 utility classes');
      cssModal.open();
    });
    document.getElementById('css-copy').addEventListener('click', function () {
      navigator.clipboard.writeText(L.buildCss(COLORS, META)).then(function () {
        M.toast({ html: t('toast.copied', '已複製'), displayLength: 1400 });
      });
    });
    function download() {
      var blob = new Blob([L.buildCss(COLORS, META)], { type: 'text/css' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = L.cssFilename();
      a.click();
      URL.revokeObjectURL(a.href);
      M.toast({ html: I18n.t('toast.downloaded', { n: L.cssFilename() }), classes: 'green' });
    }
    document.getElementById('css-download').addEventListener('click', download);
    document.getElementById('setting-download').addEventListener('click', download);

    // 最接近色側欄（點結果開本頁的明細 Modal）
    EnmyNearest.init({ onPick: openDetail });
    document.getElementById('setting-nearest').addEventListener('click', function () {
      EnmyNearest.open();
    });
  }

  // ---- 起手 ---------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', function () {
    if (window.I18n) I18n.apply(document);
    document.getElementById('search').addEventListener('input', function (e) {
      state.q = e.target.value;
      render();
    });
    initTools();
    render();
  });
})();
