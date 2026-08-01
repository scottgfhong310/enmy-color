/**
 * colour-detail — 色票明細 Modal
 *
 * **碰 DOM，所以不進 lib**（DESIGN_GUIDELINES §4.1）。本 app 目前只有一頁，
 * 但仍照家族的第三種模組寫（獨立檔＋callback），因為 §11.1 要求四支色彩 registry
 * 打開明細看到的是**同一張卡**：同一組 class（`.detail-head` 色帶頭 → `.d-name`／
 * `.d-note` → `.copy-row` → 若干 `.d-section`）、同一份 CSS 數值。
 * 只有 `.d-section` 的段落內容不同：FC 是耐光度＋套組、CDA 是事實表＋跨系列色帶、
 * COPIC 是色號分解＋產品線＋套組、**本支是色號分解＋套組收錄＋這批資料沒有什麼**。
 *
 * 這支最大的不同：**ENMY 沒有官方色名**。
 * §6.2 那條「官方英文名恆為主名」在這裡的樣子就是「主名只有色碼」——
 * 不可以把 4 個膚色的中文標示升格成主名，那會讓 app 對其餘 76 色不可驗證。
 *
 * 用法：EnmyDetail.open(color, { sets, onFamilyClick })
 */
(function (global) {
  'use strict';

  var L = global.EnmyColorLib;
  var ID = 'en-detail-modal';
  var COPY_FORMATS = ['var', 'hex', 'rgb', 'class'];   // 順序同 FC／CDA／COPIC
  var inst = null, current = null, currentOpts = null;

  function t(key, fallback) {
    if (!global.I18n || !global.I18n.t) return fallback;
    var v = global.I18n.t(key);
    return (v && v !== key) ? v : fallback;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MARKUP =
    '<div class="modal-content">' +
      '<div id="d-head" class="detail-head">' +
        '<span id="d-code" class="d-code"></span>' +
        '<span id="d-tag" class="d-tag"></span>' +
      '</div>' +
      '<div class="detail-body">' +
        '<div id="d-name" class="d-name"></div>' +
        '<div id="d-note" class="d-note"></div>' +
        '<div id="d-copy" class="copy-row"></div>' +
        '<div class="d-section">' +
          '<h6 data-i18n="detail.parse">色號分解</h6>' +
          '<div id="d-parse"></div>' +
        '</div>' +
        '<div class="d-section">' +
          '<h6 data-i18n="detail.sets">收錄於套組</h6>' +
          '<div id="d-sets"></div>' +
        '</div>' +
        '<div class="d-section">' +
          '<h6 data-i18n="detail.absent">這個品牌沒有發佈的</h6>' +
          '<div id="d-absent"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
      '<a href="#!" class="modal-close waves-effect btn-flat" data-i18n="detail.close">關閉</a>' +
    '</div>';

  function ensure() {
    if (document.getElementById(ID)) return;
    var el = document.createElement('div');
    el.id = ID;
    el.className = 'modal detail-modal';
    el.innerHTML = MARKUP;
    document.body.appendChild(el);
    inst = M.Modal.init(el, { preventScrolling: false });
    // 委派綁在模組注入的容器上，**只綁一次**——呼叫端不要再對同一個選擇器綁第二個
    // handler（faber-castell-color 就因為兩處各綁一次，點一下同時開新分頁又把本頁導走）。
    el.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.fact-link[data-family]');
      if (!b) return;
      var fam = b.getAttribute('data-family');
      inst.close();
      if (currentOpts && currentOpts.onFamilyClick) currentOpts.onFamilyClick(fam);
    });
    if (global.I18n && global.I18n.apply) global.I18n.apply(el);
  }

  // 非 HTTPS/localhost 沒有 navigator.clipboard，退回 execCommand（同家族其他三支）
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy'); document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand'));
      } catch (e) { reject(e); }
    });
  }

  function copyBtn(color, fmt) {
    var v = L.copyValue(color, fmt);
    var b = document.createElement('button');
    b.className = 'copy-btn';
    b.type = 'button';
    b.innerHTML = '<i class="material-icons">content_copy</i>' + esc(v);
    b.addEventListener('click', function () {
      copyText(v).then(function () {
        b.classList.add('copied');
        setTimeout(function () { b.classList.remove('copied'); }, 1200);
        M.toast({ html: t('toast.copied', '已複製') + '：' + esc(v), displayLength: 1400 });
      }).catch(function () {
        M.toast({ html: t('toast.copyFail', '複製失敗（需 localhost 或 HTTPS）'), classes: 'red' });
      });
    });
    return b;
  }

  function factRow(k, v) {
    return '<tr><td class="fk">' + esc(k) + '</td><td class="fv">' + esc(v) + '</td></tr>';
  }

  /**
   * 值本身可點的事實列。用途：從明細直接跳到「同一個官方色系的其他色」。
   * 差異行為交給呼叫端的 callback（§4.1 的第三種模組）；
   * **沒有 callback 就退回純文字**，不留一顆按了不動的死鍵（§5.13）。
   */
  function factRowLink(k, v, data, hint) {
    if (!currentOpts || !currentOpts.onFamilyClick) return factRow(k, v);
    return '<tr><td class="fk">' + esc(k) + '</td><td class="fv">'
      + '<button type="button" class="fact-link" data-family="' + esc(data) + '"'
      + ' title="' + esc(hint) + '">' + esc(v) + '</button></td></tr>';
  }

  function open(color, opts) {
    opts = opts || {};
    ensure();
    current = color; currentOpts = opts;
    // 標題（h6／關閉）帶 data-i18n，切語言時要重跑
    if (global.I18n && global.I18n.apply) global.I18n.apply(document.getElementById(ID));

    // 色帶頭：整條就是這個顏色（同 FC／CDA／COPIC），字色由對比算出
    var head = document.getElementById('d-head');
    head.style.background = color.hex;
    head.style.color = L.pickTextColor(color);
    document.getElementById('d-code').textContent = color.code;

    var fam = (global.ENMY_FAMILIES || []).filter(function (f) { return f.code === color.family; })[0];
    document.getElementById('d-tag').textContent = fam ? fam.name : '';

    // 主名：ENMY 沒有官方色名，多數色這一格是空的。
    // §11.1「沒有這項資料要寫出來，不要留白」——留白會被讀成抽取漏了。
    var nameEl = document.getElementById('d-name');
    if (color.nameZh) {
      nameEl.className = 'd-name';
      nameEl.textContent = color.nameZh;
      nameEl.title = t('detail.nameCard', '隨盒色卡上的中文標示（僅膚色系有）');
    } else {
      nameEl.className = 'd-name d-name-missing';
      nameEl.textContent = t('detail.noName', '原廠不發佈色名，此色以色號識別');
      nameEl.title = '';
    }

    // 精度聲明：**逐色不同**（60 色有兩份官方色表互證、20 色只有一份），所以不能寫死一句
    document.getElementById('d-note').textContent = color.verify === 'cross-validated'
      ? t('note.cross', 'hex 取自官方色表的平色填色，並經第二份官方色表逐位元互證；色表為行銷素材，非墨水實色規格')
      : t('note.approx', 'hex 取自官方色表的平色填色，僅此一份來源、未經第二份互證；色表為行銷素材，非墨水實色規格');

    var cp = document.getElementById('d-copy');
    cp.innerHTML = '';
    COPY_FORMATS.forEach(function (fmt) { cp.appendChild(copyBtn(color, fmt)); });

    // 色號分解：R1 ＝ 字首 R ＋ 號碼 1。
    // ⚠️ 字首那一列**只印字首本身**——品牌從未公布 R／VR／DE… 各代表什麼，
    // 補一個我們自己編的名字會讓使用者以為那是官方說法。
    var parse = document.getElementById('d-parse');
    var parts = L.codeParts(color.code);
    var rows = '';
    if (parts.prefix) {
      rows += factRow(t('detail.prefix', '色碼字首'), parts.prefix);
      rows += factRow(t('detail.num', '號碼'), parts.num);
    }
    rows += factRowLink(t('detail.family', '官方色系'), fam ? fam.name : color.family,
      color.family, t('detail.familyJump', '只看這個官方色系'));
    rows += factRow(t('detail.verify', '來源'), color.verify === 'cross-validated'
      ? t('verify.cross', '兩份官方色表互證') : t('verify.approx', '單一官方色表'));
    parse.innerHTML = '<table class="facts-table"><tbody>' + rows + '</tbody></table>' +
      (parts.prefix
        ? '<div class="d-empty">' + esc(t('detail.prefixNote',
            '字首是色碼自身的結構，品牌未公布其名稱——本頁不替它命名。')) + '</div>'
        : '<div class="d-empty">' + esc(t('detail.noPrefix',
            '黑與白沒有字首，色號就是 0 與 1。')) + '</div>');

    // 套組收錄。**「不在這組」與「這組收錄不明」必須分開講**：
    // 24／36／48 三組至今找不到任何寫出收錄清單的來源，把它們畫成「不收錄」是造假。
    var box = document.getElementById('d-sets');
    box.innerHTML = '';
    var all = opts.sets || global.ENMY_SETS || [];
    var mine = L.setsOfColor(all, color.code);
    var row = document.createElement('div');
    row.className = 'set-line';
    L.knownSets(all).forEach(function (s, i) {
      if (i) row.appendChild(document.createTextNode(' · '));
      var on = mine.indexOf(s) >= 0;
      var b = document.createElement('span');
      b.className = 'line-badge' + (on ? ' on' : '');
      b.textContent = s.size + (on ? ' ✓' : ' —');
      b.title = s.name;
      row.appendChild(b);
    });
    box.appendChild(row);
    var unknown = L.unknownSets(all);
    if (unknown.length) {
      var u = document.createElement('div');
      u.className = 'd-empty';
      u.textContent = t('detail.setsUnknown',
        '另有 24／36／48 三組，但沒有任何來源寫出它們收錄哪些色——不是「不收錄」，是未知。');
      box.appendChild(u);
    }

    // 「這個品牌沒有發佈的」：耐光度、顏料、英日文色名。
    // 這一段是刻意存在的——家族另外三支有的欄位，這裡不是漏抽而是原廠不公布。
    document.getElementById('d-absent').innerHTML =
      '<table class="facts-table"><tbody>' +
      factRow(t('detail.lightfast', '耐光度'), t('detail.notPublished', '原廠未公布（水性壓克力）')) +
      factRow(t('detail.pigment', '顏料'), t('detail.notPublished', '原廠未公布（水性壓克力）')) +
      factRow(t('detail.nameEn', '英文／日文色名'), t('detail.noNameAtAll', '不存在——原廠只以色號識別')) +
      '</tbody></table>';

    inst.open();
  }

  // 切語言時若明細開著就重繪（同 FCDetail.refresh 的做法）
  function refresh() {
    if (current && inst && inst.isOpen) open(current, currentOpts);
  }

  global.EnmyDetail = { open: open, refresh: refresh };
})(window);
