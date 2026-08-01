/* 繁體中文（zh-Hant） */
/* 共用 key（tool.mode／tool.lang／toast.*）的文案照 DESIGN_GUIDELINES §6 的〔正統〕表格逐字抄。 */
I18n.register('zh-Hant', {
  'title.page': 'ENMY 色號 → CSS',
  'app.title': 'ENMY 色號 → CSS',
  'app.sub': '{total} 色；原廠只以色號識別、不發佈色名。其中 {cross} 色的 hex 經兩份官方色表互證',

  'search.placeholder': '色號或 hex…',
  'search.empty': '找不到符合的顏色',

  'family.all': '全部',

  'tool.layout': '切換版面：色碼列 / 全部色票',
  'tool.nearest': '找最接近的 ENMY 色',
  'tool.css': '檢視 / 複製整份 CSS',
  'tool.download': '下載 enmy_colors.css',
  'tool.mode': '切換 light / dark',
  'tool.lang': '語言',

  'rows.explain': '一列一個色碼字首，橫向依號碼；字首無官方名稱',

  'css.title': 'CSS 變數 + utility classes',
  'css.sub': '色，含 <code>:root</code> 變數與 utility classes',
  'css.copy': '複製全部',
  'css.download': '下載 .css',

  'nearest.title': '找最接近的 ENMY 色',
  'nearest.hint': '以 CIEDE2000（ΔE00）比對。限定套組後，只會推薦那組真的有收的色——手上沒有的筆別推薦。24／36／48 三組收錄不明，故不列在此。',
  'nearest.allColors': '全部 {n} 色',
  'nearest.setOption': '{n} 色組',
  'nearest.placeholder': '#RRGGBB',
  'nearest.paste': '從剪貼簿貼上',

  'band.very': '極接近',
  'band.close': '接近',
  'band.noticeable': '可辨差異',
  'band.far': '差異大',

  'detail.close': '關閉',
  'detail.parse': '色號分解',
  'detail.sets': '收錄於套組',
  'detail.absent': '這個品牌沒有發佈的',
  'detail.prefix': '色碼字首',
  'detail.num': '號碼',
  'detail.family': '官方色系',
  'detail.verify': '來源',
  'detail.prefixNote': '字首是色碼自身的結構，品牌未公布其名稱——本頁不替它命名。',
  'detail.noPrefix': '黑與白沒有字首，色號就是 0 與 1。',
  'detail.noName': '原廠不發佈色名，此色以色號識別',
  'detail.nameCard': '隨盒色卡上的中文標示（僅膚色系有）',
  'detail.setsUnknown': '另有 24／36／48 三組，但沒有任何來源寫出它們收錄哪些色——不是「不收錄」，是未知。',
  'detail.lightfast': '耐光度',
  'detail.pigment': '顏料',
  'detail.nameEn': '英文／日文色名',
  'detail.notPublished': '原廠未公布（水性壓克力）',
  'detail.noNameAtAll': '不存在——原廠只以色號識別',

  'verify.cross': '兩份官方色表互證',
  'verify.approx': '單一官方色表',
  'note.cross': 'hex 取自官方色表的平色填色，並經第二份官方色表逐位元互證；色表為行銷素材，非墨水實色規格',
  'note.approx': 'hex 取自官方色表的平色填色，僅此一份來源、未經第二份互證；色表為行銷素材，非墨水實色規格',

  'toast.copied': '已複製',
  'toast.copyFail': '複製失敗（需 localhost 或 HTTPS）',
  'toast.pasted': '已貼上：{v}',
  'toast.pasteFail': '無法讀取剪貼簿（瀏覽器未授權）——可直接在欄位按 ⌘V 貼上',
  'toast.pasteNoColor': '剪貼簿裡沒有可辨識的顏色',
  'toast.lang': '已切換為 {name}',
  'toast.downloaded': '已下載：{n}'
}, '繁體中文');
