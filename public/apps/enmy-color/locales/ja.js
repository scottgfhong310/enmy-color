/* 日本語（ja） */
/* 共通キー（tool.mode / tool.lang / toast.*）は DESIGN_GUIDELINES §6 の正統表から逐語コピー。 */
I18n.register('ja', {
  'title.page': 'ENMY カラー → CSS',
  'app.title': 'ENMY 色番号 → CSS',
  'app.sub': '{total} 色。メーカーは色番号のみで識別し、色名を公表していません。うち {cross} 色の hex は 2 枚目の公式チャートでも一致',

  'search.placeholder': '色番号または hex…',
  'search.empty': '該当する色がありません',

  'family.all': 'すべて',

  'tool.layout': 'レイアウト切替：色番号行 / 全色見本',
  'tool.nearest': '最も近い ENMY 色を探す',
  'tool.css': 'CSS 全体を表示 / コピー',
  'tool.download': 'enmy_colors.css をダウンロード',
  'tool.clearFilter': 'クリア',
  'tool.mode': 'ライト / ダーク切替',
  'tool.lang': '言語',
  'tool.more': 'その他のツール',

  'rows.explain': '1 行に 1 つの接頭辞、横は番号順。接頭辞に公式名称はありません',

  'css.title': 'CSS 変数 + ユーティリティクラス',
  'css.sub': '色。<code>:root</code> 変数とユーティリティクラスを含む',
  'css.copy': 'すべてコピー',
  'css.download': '.css をダウンロード',

  'nearest.title': '最も近い ENMY 色を探す',
  'nearest.hint': 'CIEDE2000（ΔE00）で比較します。セットを指定すると、そのセットに実際に入っている色だけを提案します——手元にないペンは勧めません。24／36／48 の 3 セットは収録内容が不明のため一覧に含めていません。',
  'nearest.allColors': '全 {n} 色',
  'nearest.setOption': '{n} 色セット',
  'nearest.placeholder': '#RRGGBB',
  'nearest.paste': 'クリップボードから貼り付け',

  'band.very': 'ごく近い',
  'band.close': '近い',
  'band.noticeable': '差が分かる',
  'band.far': '遠い',

  'detail.close': '閉じる',
  'detail.parse': '色番号の分解',
  'detail.sets': '収録セット',
  'detail.absent': 'このメーカーが公表していないもの',
  'detail.prefix': '色番号の接頭辞',
  'detail.num': '番号',
  'detail.family': '公式カラーグループ',
  'detail.familyJump': 'この公式カラーグループだけを表示',
  'detail.verify': '出典',
  'detail.prefixNote': '接頭辞は色番号自体の構造です。メーカーは名称を公表していないため、本ページでは名前を付けません。',
  'detail.noPrefix': '黒と白に接頭辞はなく、色番号はそのまま 0 と 1 です。',
  'detail.noName': 'メーカーは色名を公表していません。この色は色番号で識別します',
  'detail.nameCard': '同梱カラーカードに印刷された中国語表記（肌色系のみ）',
  'detail.setsUnknown': '24／36／48 の 3 セットもありますが、収録色を記した資料が見つかっていません——「非収録」ではなく「不明」です。',
  'detail.lightfast': '耐光性',
  'detail.pigment': '顔料',
  'detail.nameEn': '英語／日本語の色名',
  'detail.notPublished': '未公表（水性アクリル）',
  'detail.noNameAtAll': '存在しません——メーカーは色番号のみで識別します',

  'verify.cross': '2 枚の公式チャートで一致',
  'verify.approx': '公式チャート 1 枚のみ',
  'note.cross': 'hex は公式チャートのフラットな塗りから取得し、2 枚目の公式チャートとバイト単位で一致。チャートは販促素材であり、インクの色指定ではありません。',
  'note.approx': 'hex は公式チャートのフラットな塗りから取得。出典は 1 枚のみで、照合はされていません。チャートは販促素材であり、インクの色指定ではありません。',

  'toast.copied': 'コピーしました',
  'toast.copyFail': 'コピーに失敗（localhost または HTTPS が必要）',
  'toast.pasted': '貼り付けました：{v}',
  'toast.pasteFail': 'クリップボードを読み取れません（許可されていません）——フィールドに ⌘V で直接貼り付けてください',
  'toast.pasteNoColor': 'クリップボードに色が見つかりません',
  'toast.lang': '{name} に切り替えました',
  'toast.downloaded': 'ダウンロード：{n}'
}, '日本語');
