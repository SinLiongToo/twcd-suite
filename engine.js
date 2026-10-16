/**
 * TWCD Core Engine (Next-Generation JavaScript Implementation)
 * Reverse-engineered and modernized from original TWCD Java/PHP source code.
 */

(function (global) {
  'use strict';

  // Sound and Tone Constants for Taiwanese / Hakka CTS
  const CTS_MAPS = (global.TWCD_DATA && global.TWCD_DATA.cts) || {};
  const MAP_TAILO = CTS_MAPS.tailo || {};
  const MAP_UTF8 = CTS_MAPS.utf8 || {};
  const MAP_TP = CTS_MAPS.tp || {};
  const MAP_HOTSYS = CTS_MAPS.hotsys || {};

  // Build reverse maps: symbol -> [Letter, Tone]
  function buildReverseMap(map) {
    const rev = {};
    for (const [key, val] of Object.entries(map)) {
      if (!val) continue;
      rev[val] = key;
    }
    return rev;
  }

  const REV_TAILO = buildReverseMap(MAP_TAILO);
  const REV_UTF8 = buildReverseMap(MAP_UTF8);
  const REV_TP = buildReverseMap(MAP_TP);
  const REV_HOTSYS = buildReverseMap(MAP_HOTSYS);

  // Vowel sonority weights for placing tone marks:
  // a (10) > ou/oo (8) > e (6) > o (4) > i / u
  const TAI_LO_WEIGHT = {
    a: 10, A: 10,
    oo: 8, Oo: 8, OO: 8,
    ou: 8, Ou: 8, OU: 8,
    e: 6, E: 6,
    o: 4, O: 4,
    i: 3, I: 3,
    u: 2, U: 2
  };

  const POJ_WEIGHT = {
    a: 10, A: 10,
    ou: 8, Ou: 8, OU: 8,
    e: 6, E: 6,
    o: 4, O: 4,
    u: 3, U: 3,
    i: 2, I: 2
  };

  // Tone diacritic marks in Unicode
  const TONE_MARKS_TAILO = {
    '2': '\u0301', // Acute: á
    '3': '\u0300', // Grave: à
    '5': '\u0302', // Circumflex: â
    '7': '\u0304', // Macron: ā
    '8': '\u030d', // Vertical line: a̍
    '9': '\u030c'  // Caron: ǎ
  };

  const Engine = {
    // ----------------------------------------------------
    // 1. Data Store, Caching & Custom Dictionary
    // ----------------------------------------------------
    data: null,
    custom: {
      hg_tg: [],     // [{m: '華語', t: '台語'}]
      notran: [],    // ['詞彙']
      cl_hl: [],     // [{c: '全羅', h: '漢羅'}]
      hl_cl: [],     // [{h: '漢羅', c: '全羅'}]
      ruby: []       // [{k: '漢羅', r: 'ruby html'}]
    },

    _tries: {
      hg_notran: null,
      hg_raw: null,
      hl_cl: null,
      cl_hl_case_insensitive: null,
      cl_hl_case_sensitive: null,
      cl_ch_case_insensitive: null,
      cl_ch_case_sensitive: null,
      ch_hl_tailo: null,
      ch_hl_poj: null,
      ruby: null
    },
    _charFallback: null,

    init: function () {
      if (global.TWCD_DATA) {
        this.data = global.TWCD_DATA;
      }
      if (global.MOEDICT_DATA) {
        this.moedict = global.MOEDICT_DATA;
      }
      if (global.USER_DICTS) {
        this.userDicts = global.USER_DICTS;
      }
      this.loadCustomFromStorage();
      this.buildCharFallback();
    },

    getUserDicts: function () {
      if (this.userDicts && (Object.keys(this.userDicts.chhitjia || {}).length > 0 || (this.userDicts.laigoakho || []).length > 0 || Object.keys(this.userDicts.hokkok || {}).length > 0)) {
        return this.userDicts;
      }
      if (typeof window !== 'undefined' && window.USER_DICTS) {
        this.userDicts = window.USER_DICTS;
        return this.userDicts;
      }
      if (typeof global !== 'undefined' && global.USER_DICTS) {
        this.userDicts = global.USER_DICTS;
        return this.userDicts;
      }
      return { chhitjia: {}, laigoakho: [], hokkok: {} };
    },

    queryUserDicts: function (keyword, maxCount = 15) {
      if (!keyword) return { chhitjia: [], laigoakho: [], hokkok: [] };
      const q = keyword.trim().toLowerCase();
      if (!q) return { chhitjia: [], laigoakho: [], hokkok: [] };
      const qAlt = q.includes('台') ? q.replace(/台/g, '臺') : (q.includes('臺') ? q.replace(/臺/g, '台') : null);
      const uDicts = this.getUserDicts();

      // 1. Chhitjia (杜信龍《七字孽》)
      const chhitjiaMatches = [];
      for (const [word, info] of Object.entries(uDicts.chhitjia || {})) {
        const wLower = word.toLowerCase();
        const rLower = (info.r || '').toLowerCase();
        const matchW = wLower === q || wLower.startsWith(q) || wLower.includes(q) || (qAlt && (wLower.includes(qAlt) || wLower === qAlt));
        const matchR = rLower.includes(q);
        if (matchW || matchR) {
          chhitjiaMatches.push({ word, ...info });
          if (chhitjiaMatches.length >= maxCount) break;
        }
      }

      // 2. Laigoakho (鄭仁壽《內外科看護學》)
      const laigoakhoMatches = [];
      const list = uDicts.laigoakho || [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const hMatch = item.h && (item.h.toLowerCase().includes(q) || (qAlt && item.h.toLowerCase().includes(qAlt)));
        const pMatch = item.p && item.p.toLowerCase().includes(q);
        const eMatch = item.e && item.e.toLowerCase().includes(q);
        if (hMatch || pMatch || eMatch) {
          laigoakhoMatches.push(item);
          if (laigoakhoMatches.length >= maxCount) break;
        }
      }

      // 3. Hokkok (杜信龍《護國 評論集》)
      // 僅對應詞目 (word) 與標音 (r)，避免例句/文章標題中偶現字詞造成詞目不對應的錯誤命中
      const hokkokExact = [];
      const hokkokStarts = [];
      const hokkokContains = [];
      const hokkokSound = [];

      for (const [word, info] of Object.entries(uDicts.hokkok || {})) {
        const wLower = word.toLowerCase();
        const rLower = (info.r || '').toLowerCase();
        if (wLower === q || (qAlt && wLower === qAlt)) {
          hokkokExact.push({ word, ...info });
        } else if (wLower.startsWith(q) || (qAlt && wLower.startsWith(qAlt))) {
          hokkokStarts.push({ word, ...info });
        } else if (wLower.includes(q) || (qAlt && wLower.includes(qAlt))) {
          hokkokContains.push({ word, ...info });
        } else if (rLower.includes(q)) {
          hokkokSound.push({ word, ...info });
        }
      }
      const hokkokMatches = hokkokExact.concat(hokkokStarts, hokkokContains, hokkokSound).slice(0, maxCount);

      return { chhitjia: chhitjiaMatches, laigoakho: laigoakhoMatches, hokkok: hokkokMatches };
    },

    getMoedictData: function () {
      if (this.moedict && Object.keys(this.moedict).length > 0) return this.moedict;
      if (typeof window !== 'undefined' && window.MOEDICT_DATA) {
        this.moedict = window.MOEDICT_DATA;
        return this.moedict;
      }
      if (typeof global !== 'undefined' && global.MOEDICT_DATA) {
        this.moedict = global.MOEDICT_DATA;
        return this.moedict;
      }
      return {};
    },

    queryMoedict: function (keyword, maxCount = 20) {
      if (!keyword) return [];
      const q = keyword.trim().toLowerCase();
      if (!q) return [];
      const dict = this.getMoedictData();
      const exact = [];
      const starts = [];
      const contains = [];
      const soundMatches = [];
      const defMatches = [];

      for (const [word, info] of Object.entries(dict)) {
        const wLower = word.toLowerCase();
        const tLower = (info.t || '').toLowerCase();
        if (wLower === q) {
          exact.push({ word, ...info });
        } else if (wLower.startsWith(q)) {
          starts.push({ word, ...info });
        } else if (wLower.includes(q)) {
          contains.push({ word, ...info });
        } else if (tLower.includes(q)) {
          soundMatches.push({ word, ...info });
        } else if (info.d && info.d.some(x => (x.d && x.d.toLowerCase().includes(q)) || (x.e && x.e.some(ex => (ex.m && ex.m.toLowerCase().includes(q)))))) {
          defMatches.push({ word, ...info });
        }
      }

      const combined = exact.concat(starts, contains, soundMatches, defMatches);
      return combined.slice(0, maxCount);
    },

    clearTrieCache: function () {
      this._tries = {
        hg_notran: null,
        hg_raw: null,
        hl_cl: null,
        cl_hl_case_insensitive: null,
        cl_hl_case_sensitive: null,
        cl_ch_case_insensitive: null,
        cl_ch_case_sensitive: null,
        ch_hl_tailo: null,
        ch_hl_poj: null,
        ruby: null
      };
      this._hyphenMap = null;
      this._charFallback = null;
    },

    // 台語高頻核心字詞／虛詞標準推薦漢字優先表 (用於「漢羅/全羅 ➔ 全漢」消除同音字歧義)
    CORE_ROM2HAN: {
      // 結構助詞、連接詞、介詞、語氣詞
      'ê': '的', 'e5': '的',
      'mā': '嘛', 'ma7': '嘛',
      'koh': '閣', 'koh4': '閣',
      'm̄': '毋', 'm7': '毋',
      'm̄-koh': '毋閣', 'm̄koh': '毋閣',
      'm̄-thang': '毋通', 'm̄thang': '毋通',
      'm̄-nā': '毋但', 'm̄nā': '毋但',
      'm̄-kú': '毋久', 'm̄kú': '毋久',
      'm̄-sī': '毋是', 'm̄sī': '毋是',
      'm̄-tio̍h': '毋著', 'm̄tio̍h': '毋著',
      'm̄-bat': '毋捌', 'm̄bat': '毋捌',
      'm̄-chai': '毋知', 'm̄-tsai': '毋知', 'm̄chai': '毋知', 'm̄tsai': '毋知',
      'beh': '欲', 'beh4': '欲',
      'lóng': '攏', 'long2': '攏',
      'ài': '愛', 'ai3': '愛',
      'leh': '咧', 'teh': '咧',
      'tī': '佇', 'ti7': '佇',
      'tō': '就', 'to̍h': '就', 'tioh8': '著',
      'tio̍h': '著', 'tio̍h-ài': '著愛', 'tio̍h-sī': '著是',
      'che': '這', 'tse': '這',
      'chit': '這', 'tsit': '這',
      'chit-ê': '這个', 'tsit-ê': '這个',
      'chit-má': '這馬', 'tsit-má': '這馬',
      'chiah-ê': '遮的', 'tsia-ê': '遮的', 'tsiah-ê': '遮的',
      'hia-ê': '遐的', 'hiah-ê': '遐的',
      'hit': '彼', 'hit-ê': '彼个',
      'chia': '遮', 'tsia': '遮',
      'hia': '遐', 'hiah': '遐',
      'hiah-nī': '遐爾', 'hiahnī': '遐爾',
      'kám': '敢', 'kam2': '敢',
      'kā': '共', 'ka7': '共',
      'hō͘': '予', 'hōo': '予', 'ho7': '予', 'hoo7': '予',
      'hông': '予人',
      'ē': '會', 'e7': '會',
      'ē-tàng': '會當', 'ētàng': '會當',
      'ē-sái': '會使', 'ēsái': '會使',
      'ē-hiáu': '會曉', 'ēhiáu': '會曉',
      'bē': '袂', 'bōe': '袂',
      'bē-tàng': '袂當', 'bōe-tàng': '袂當',
      'bē-sái': '袂使', 'bōe-sái': '袂使',
      'bē-hiáu': '袂曉', 'bōe-hiáu': '袂曉',
      'á': '仔', 'a2': '仔',
      'á-sī': '抑是', 'ia̍h-sī': '抑是', 'iah-sī': '抑是',
      'khah': '較', 'koh-khah': '閣較', 'kohkhah': '閣較',
      'ah': '啊', 'à': '啊', 'lah': '啦', 'neh': '呢', 'hannh': '乎', 'haⁿh': '乎',
      'chiah': '才', 'tsiah': '才',
      'ka-tī': '家己', 'ka-kī': '家己', 'katī': '家己', 'kakī': '家己',
      'niâ': '爾', 'niā': '爾', 'niā-niā': '爾爾', 'niā-tiāⁿ': '爾定',
      'án-ne': '按呢', 'ánne': '按呢',
      'án-chóaⁿ': '按怎', 'án-tsuánn': '按怎', 'ánchóaⁿ': '按怎', 'ántsuánn': '按怎',
      'soah': '煞', 'suah': '煞',
      'thang': '通', 'thang-hó': '通好',
      'siōng': '上', 'siāng': '上', 'siōng-hó': '上好',
      'sak': '捒', 'chhui-sak': '推捒', 'tshui-sak': '推捒',
      'kan-taⁿ': '干焦', 'kan-tann': '干焦', 'kan-na': '干焦', 'kantaⁿ': '干焦', 'kantann': '干焦',
      'nā': '若', 'nā-sī': '若是',
      'chiâⁿ': '成', 'tsiânn': '成',
      'kap': '佮', 'kah': '佮', 'hām': '和', 'chham': '參', 'tsham': '參',
      'jú': '愈', 'lú': '愈',
      'siáⁿ': '啥', 'siánn': '啥', 'sím': '甚',
      'siáⁿ-mi̍h': '啥物', 'siáⁿ-mih': '啥物', 'siánn-mih': '啥物', 'siánn-mi̍h': '啥物', 'sím-mi̍h': '甚物',
      'siáng': '誰', 'siáⁿ-lâng': '啥人', 'siánn-lâng': '啥人',
      'mài': '莫',
      'gōa': '外', 'guā': '外', 'gōa-chē': '外濟', 'guā-tsē': '外濟',
      'sī': '是', 'bô': '無', 'ū': '有',
      'chūn': '陣', 'tsūn': '陣', 'chit-chūn': '這陣', 'tsit-tsūn': '這陣',
      'chi̍t': '一', 'tsi̍t': '一', 'chi̍t-ê': '一个', 'tsi̍t-ê': '一个', 'chi̍t-寡': '一寡', 'chi̍t-kóa': '一寡', 'tsi̍t-kuá': '一寡',
      'kàu': '到', 'kàu-tè': '到底', 'kàu-taⁿ': '到今', 'kàu-tann': '到今',
      'lia̍h': '掠', 'lia̍h-chò': '掠做', 'lia̍h-tsò': '掠做',
      'chē': '濟', 'tsē': '濟', 'chōe': '濟', 'chē-chē': '濟濟', 'tsē-tsē': '濟濟',
      'ǹg': '向', 'ǹg-bāng': '向望', 'ǹgbāng': '向望',
      'phah': '拍', 'phah-piàⁿ': '拍拚', 'phah-piànn': '拍拚', 'phah-sǹg': '拍算',
      'hoah': '喝', 'huah': '喝',
      // 人稱代名詞
      'góa': '我', 'guá': '我',
      'lí': '你', 'i': '伊', 'in': '怹',
      'lán': '咱', 'gún': '阮', 'goán': '阮', 'guán': '阮', 'lín': '恁',
      'ta̍k-ke': '逐家', 'ta̍kke': '逐家', 'tāi-ke': '大家',
      // 常用核心動詞與形容詞
      'tiāⁿ-tio̍h': '定著', 'tiānn-tio̍h': '定著',
      'bat': '捌', 'ùi': '對', 'uì': '對',
      'kái': '改', 'ná': '那',
      'tāi-chì': '代誌', 'tāi-tsì': '代誌', 'tāichì': '代誌', 'tāitsì': '代誌',
      'khiā': '徛', 'khiā-khí': '徛起', 'khiākhí': '徛起',
      'sioⁿ': '傷', 'siunn': '傷',
      'lâng': '人', 'hó-lâng': '好人', 'pháiⁿ-lâng': '歹人', 'pháinn-lâng': '歹人', 'pháiⁿlâng': '歹人', 'pháinnlâng': '歹人',
      'chhan-chhiūⁿ': '親像', 'tshan-tshiūnn': '親像', 'chhanchhiūⁿ': '親像', 'tshantshiūnn': '親像',
      'the̍h': '提', 'khioh': '抾', 'khǹg': '囥',
      'iû-goân': '猶原', 'iû-guân': '猶原', 'iûgoân': '猶原', 'iûguân': '猶原',
      'chhùi': '喙', 'tshuì': '喙',
      'kha': '跤',
      'chhōe': '揣', 'tshuē': '揣', 'chhē': '揣', 'tshē': '揣',
      'koân': '懸', 'kuân': '懸',
      'mih': '物', 'mi̍h': '物', 'mi̍h-kiāⁿ': '物件', 'mi̍h-kiānn': '物件',
      'iā': '也', 'pái': '擺',
      'gín-á': '囡仔', 'gíná': '囡仔',
      'kiáⁿ': '囝', 'kiánn': '囝', 'kiáⁿ-jî': '囝兒', 'kiánn-jî': '囝兒',
      'pháiⁿ': '歹', 'pháinn': '歹', 'pháiⁿ-khòaⁿ': '歹看', 'pháiⁿ-thiaⁿ': '歹聽', 'pháiⁿ-sè': '歹勢', 'pháinn-sè': '歹勢',
      'hó': '好', 'chin': '真', 'tsin': '真', 'chiok': '足', 'tsiok': '足',
      'chhut': '出', 'tshut': '出', 'chhut-lâi': '出來', 'tshut-lâi': '出來', 'chhutlâi': '出來', 'tshutlâi': '出來',
      'lâi': '來', 'khì': '去',
      'chiò': '照', 'tsiò': '照',
      'kóng': '講', 'thiaⁿ': '聽', 'thiann': '聽', 'khòaⁿ': '看', 'khuànn': '看',
      'khòaⁿ-tio̍h': '看著', 'khuànn-tio̍h': '看著', 'thiaⁿ-tio̍h': '聽著', 'thiann-tio̍h': '聽著',
      'chia̍h': '食', 'tsia̍h': '食', 'pá': '飽', 'chia̍h-pá': '食飽', 'tsia̍h-pá': '食飽',
      'tāi-seng': '代先', 'tāi-sing': '代先', 'tāiseng': '代先', 'tāising': '代先',
      'o-ló': '呵咾', 'o-ló͘': '呵咾', 'oló': '呵咾',
      'tńg': '轉', 'tńg-lâi': '轉來', 'tńg-khì': '轉去',
      'chhù': '厝', 'tshù': '厝', 'chhù-piⁿ': '厝邊', 'tshù-pinn': '厝邊', 'chhù-ni̍h': '厝裡', 'chhùni̍h': '厝裡',
      'sè-chiūⁿ': '世上', 'sè-tsiūnn': '世上', 'sèchiūⁿ': '世上', 'chiūⁿ': '上', 'tsiūnn': '上',
      'chheⁿ-mê': '青盲', 'tshenn-mê': '青盲', 'chheⁿmê': '青盲', 'tshenn-mî': '青盲',
      'kòe': '過', 'kuè': '過', 'kòe-lâi': '過來', 'kuè-lâi': '過來', 'kòelâi': '過來', 'kuèlâi': '過來',
      'kòe-khì': '過去', 'kuè-khì': '過去', 'kòekhì': '過去', 'kuèkhì': '過去',
      'tshit-thô': '𨑨迌', 'chhit-thô': '𨑨迌', 'thit-thô': '𨑨迌', 'tshitthô': '𨑨迌', 'chhitthô': '𨑨迌',
      'tshuā': '𤆬', 'chhōa': '𤆬',
      'kāng': '仝', 'kāng-khoán': '仝款', 'kāng-khuán': '仝款',
      'kin-á-ji̍t': '今仔日', 'kináji̍t': '今仔日', 'ji̍t-thâu': '日頭', 'ji̍tthâu': '日頭',
      'taⁿ': '今', 'tann': '今', 'tiàm': '踮', 'tiàm-tī': '踮佇',
      'súi': '媠', 'suí': '媠', 'bái': '䆀',
      'tàu-tah': '鬥搭', 'tàutah': '鬥搭', 'tàu-tīn': '鬥陣', 'tàutīn': '鬥陣',
      'poaⁿ': '搬', 'puann': '搬', 'pôaⁿ': '盤', 'puânn': '盤', 'poann5': '盤'
    },

    // 台語「全漢 ➔ 漢羅」核心漢羅化詞表 (依據杜信龍《護國 評論集》高頻漢羅用詞與傳統白話字漢羅習慣)
    CORE_HAN2HL: {
      // 多字高頻虛詞、連詞、代詞與台語特徵詞 (優先長詞匹配)
      '毋閣': 'm̄-koh',
      '毋通': 'm̄-thang',
      '毋但': 'm̄-nā',
      '毋是': 'm̄-sī',
      '毋捌': 'm̄-bat',
      '毋知': 'm̄-tsai',
      '閣較': 'koh-khah',
      '按呢': 'án-ne',
      '按怎': 'án-tsuánn',
      '家己': 'ka-tī',
      '干焦': 'kan-taⁿ',
      '會當': 'ē-tàng',
      '會使': 'ē-sái',
      '袂當': 'bē-tàng',
      '袂使': 'bē-sái',
      '遮的': 'tsia-ê',
      '遐的': 'hia-ê',
      '遐爾': 'hiah-nī',
      '啥物': 'siánn-mih',
      '甚物': 'sím-mi̍h',
      '啥人': 'siánn-lâng',
      '親像': 'tshan-tshiūnn',
      '爾爾': 'niā-niā',
      '抑是': 'ia̍h-sī',
      '定著': 'tiānn-tio̍h',
      '向望': 'ǹg-bāng',
      '逐家': 'ta̍k-ke',
      '這馬': 'tsit-má',
      '這陣': 'tsit-tsūn',
      '這个': 'tsit-ê',
      '彼个': 'hit-ê',
      '一个': 'tsi̍t-ê',
      '一寡': 'tsi̍t-kuá',
      '予人': 'hông',
      '𨑨迌': 'tshit-thô',
      '囡仔': 'gín-á',
      '呵咾': 'o-ló',
      '青盲': 'tshenn-mê',
      '鬥搭': 'tàu-tah',
      '推捒': 'tshui-sak',
      '拍過來': 'phah過來',
      '拍過去': 'phah過去',
      '歹人': 'pháinn人',
      '歹勢': 'pháinn-sè',
      '歹看': 'pháinn看',
      '歹聽': 'pháinn聽',
      '看著': '看tio̍h',
      '聽著': '聽tio̍h',
      '佇遮': 'tī tsia',
      '佇遐': 'tī hia',
      // 單字高頻語法虛詞與特徵字 (長詞複合詞已由 Moedict 詞庫保護，不會誤轉複合詞內部字)
      '的': 'ê',
      '嘛': 'mā',
      '閣': 'koh',
      '毋': 'm̄',
      '欲': 'beh',
      '攏': 'lóng',
      '咧': 'leh',
      '佇': 'tī',
      '敢': 'kám',
      '共': 'kā',
      '予': 'hōo',
      '較': 'khah',
      '佮': 'kap',
      '煞': 'soah',
      '袂': 'bē',
      '莫': 'mài',
      '捌': 'bat',
      '徛': 'khiā',
      '揣': 'tshuē',
      '捒': 'sak',
      '抾': 'khioh',
      '囥': 'khǹg',
      '𤆬': 'tshuā',
      '歹': 'pháinn',
      '囝': 'kiánn',
      '媠': 'suí',
      '䆀': 'bái'
    },

    buildCharFallback: function () {
      if (this._charFallback) return this._charFallback;
      const map = {};

      // Standard Essential Taiwanese Characters
      const moeEssentials = {
        '𨑨': 'tshit', '迌': 'thô', '𤆬': 'tshuā', '仝': 'kāng', '𫝛': 'kāng',
        '濟': 'chē', '袂': 'bē', '佮': 'kap', '予': 'hō͘', '抾': 'khioh',
        '伙': 'hé', '夥': 'hé', '今': 'kin', '仔': 'á', '日': 'ji̍t', '這': 'chit',
        '彼': 'he', '阮': 'gún', '咱': 'lán', '恁': 'lín', '伊': 'i', '講': 'kóng',
        '看': 'khòaⁿ', '聽': 'thiaⁿ', '食': 'chia̍h', '飲': 'lim', '行': 'kiâⁿ',
        '走': 'cháu', '來': 'lâi', '去': 'khì', '好': 'hó', '歹': 'pháiⁿ',
        '大': 'tōa', '細': 'sè', '少': 'chió', '真': 'chin'
      };
      Object.assign(map, moeEssentials);

      // Extract single characters from hl_cl (over 2,400 characters)
      const hl_cl = (this.data && this.data.hl_cl) || [];
      for (let i = 0; i < hl_cl.length; i++) {
        const { h, c } = hl_cl[i];
        if (!h || !c) continue;
        if (Array.from(h).length === 1 && !map[h]) {
          map[h] = c;
        }
      }
      this._charFallback = map;
      return map;
    },

    buildHyphenMap: function () {
      if (this._hyphenMap) return this._hyphenMap;
      const map = new Map();

      // 0. From Moedict (20,600+ words with official MOE hyphens)
      const moedict = this.getMoedictData();
      for (const [w, info] of Object.entries(moedict)) {
        if (!info.t || !info.t.includes('-')) continue;
        const readings = info.t.split('/');
        for (let r = 0; r < readings.length; r++) {
          const cleanR = readings[r].trim();
          if (cleanR.includes('-') && !cleanR.startsWith('-') && !cleanR.endsWith('-')) {
            const convPoj = this.ctsConvert(cleanR, 'tailo_unicode', 'poj_unicode');
            const unhypPoj = convPoj.replace(/[\s-]/g, '').toLowerCase();
            if (!map.has(unhypPoj) && unhypPoj.length >= 3) {
              map.set(unhypPoj, convPoj);
            }
            const unhypTl = cleanR.replace(/[\s-]/g, '').toLowerCase();
            if (!map.has(unhypTl) && unhypTl.length >= 3) {
              map.set(unhypTl, cleanR);
            }
          }
        }
      }

      // 0b. From User Dicts (杜信龍《七字孽》、鄭仁壽《內外科看護學》與 杜信龍《護國 評論集》)
      const uDicts = this.getUserDicts();
      for (const [w, info] of Object.entries(uDicts.chhitjia || {})) {
        if (!info.r || !info.r.includes('-')) continue;
        const cleanR = info.r.trim();
        const unhyp = cleanR.replace(/[\s-]/g, '').toLowerCase();
        if (!map.has(unhyp) && unhyp.length >= 3) {
          map.set(unhyp, cleanR);
        }
      }
      for (const [w, info] of Object.entries(uDicts.hokkok || {})) {
        if (!info.r || !info.r.includes('-')) continue;
        const cleanR = info.r.trim();
        const unhyp = cleanR.replace(/[\s-]/g, '').toLowerCase();
        if (!map.has(unhyp) && unhyp.length >= 3) {
          map.set(unhyp, cleanR);
        }
      }
      const mList = uDicts.laigoakho || [];
      for (let i = 0; i < mList.length; i++) {
        const item = mList[i];
        if (!item.p || !item.p.includes('-')) continue;
        const cleanP = item.p.trim();
        const unhyp = cleanP.replace(/[\s-]/g, '').toLowerCase();
        if (!map.has(unhyp) && unhyp.length >= 3) {
          map.set(unhyp, cleanP);
        }
      }

      // 1. From CL_HL (26,580 entries with hyphens)
      const clList = (this.custom.cl_hl || []).concat((this.data && this.data.cl_hl) || []);
      for (let i = 0; i < clList.length; i++) {
        const entry = clList[i];
        if (entry.c && entry.c.includes('-') && !entry.c.startsWith('-') && !entry.c.endsWith('-')) {
          const unhyphenated = entry.c.replace(/[\s-]/g, '').toLowerCase();
          if (!map.has(unhyphenated) && unhyphenated.length >= 3) {
            map.set(unhyphenated, entry.c);
          }
        }
      }

      // 2. From Ruby (10,197 entries with hyphens)
      const rubyList = (this.custom.ruby || []).concat((this.data && this.data.ruby) || []);
      for (let i = 0; i < rubyList.length; i++) {
        const entry = rubyList[i];
        if (!entry.r) continue;
        const match = entry.r.match(/<rt>([^<]+)<\/rt>/);
        if (match && match[1].includes('-') && !match[1].startsWith('-') && !match[1].endsWith('-')) {
          const conv = this.ctsConvert(match[1], 'tailo_num', 'poj_unicode');
          const unhyphenated = conv.replace(/[\s-]/g, '').toLowerCase();
          if (!map.has(unhyphenated) && unhyphenated.length >= 3) {
            map.set(unhyphenated, conv);
          }
        }
      }

      this._hyphenMap = map;
      return map;
    },

    restoreHyphens: function (text) {
      if (!text) return '';
      const map = this.buildHyphenMap();
      return text.replace(/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036Fⁿ]+/g, (w) => {
        const key = w.toLowerCase();
        if (map.has(key)) {
          const hyp = map.get(key);
          if (w[0] === w[0].toUpperCase()) {
            return hyp[0].toUpperCase() + hyp.slice(1);
          }
          return hyp;
        }
        return w;
      });
    },

    _createTrieNode: function () {
      return { next: new Map(), val: null, src: null, isNoTran: false };
    },

    getHgTrie: function (useNoTran) {
      const cacheKey = useNoTran ? 'hg_notran' : 'hg_raw';
      if (this._tries[cacheKey]) return this._tries[cacheKey];

      const root = this._createTrieNode();

      // 1. Insert No-Tran words if enabled
      if (useNoTran) {
        const noTranList = (this.custom.notran || []).concat((this.data && this.data.hg_notran) || []);
        for (let i = 0; i < noTranList.length; i++) {
          const item = noTranList[i];
          if (!item) continue;
          let curr = root;
          for (const ch of item) {
            if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
            curr = curr.next.get(ch);
          }
          curr.isNoTran = true;
          curr.val = item;
          curr.src = item;
        }
      }

      // 2. Insert Custom & System hg_tg
      const dictList = (this.custom.hg_tg || []).concat((this.data && this.data.hg_tg) || []);
      for (let i = 0; i < dictList.length; i++) {
        const entry = dictList[i];
        const m = entry.m;
        const t = entry.t;
        if (!m || !t) continue;
        let curr = root;
        for (const ch of m) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.isNoTran && !curr.val) {
          curr.val = t;
          curr.src = m;
        }
      }

      this._tries[cacheKey] = root;
      return root;
    },

    getHlClTrie: function () {
      if (this._tries.hl_cl) return this._tries.hl_cl;
      const root = this._createTrieNode();

      // Priority 1: 教育部 / 萌典標準詞庫 (MOE / Moedict First: Standard Hyphens & Recommended Characters)
      const moedict = this.getMoedictData();
      for (const [word, info] of Object.entries(moedict)) {
        if (!info.t) continue;
        const rawTrs = info.t.split('/')[0].trim();
        if (!rawTrs) continue;
        const pojVal = this.ctsConvert(rawTrs, 'tailo_unicode', 'poj_unicode');
        let curr = root;
        for (const ch of word) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        curr.val = pojVal;
        curr.src = word;
      }

      // Priority 1.5: 杜信龍《七字孽》、鄭仁壽《內外科看護學》與 杜信龍《護國 評論集》特藏詞庫
      const uDicts = this.getUserDicts();
      for (const [word, info] of Object.entries(uDicts.chhitjia || {})) {
        if (!info.r) continue;
        const pojVal = this.ctsConvert(info.r, 'tailo_unicode', 'poj_unicode');
        let curr = root;
        for (const ch of word) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = pojVal;
          curr.src = word;
        }
      }

      for (const [word, info] of Object.entries(uDicts.hokkok || {})) {
        if (!info.r || !/[\u4e00-\u9fa5]/.test(word)) continue;
        const pojVal = this.ctsConvert(info.r, 'tailo_unicode', 'poj_unicode');
        let curr = root;
        for (const ch of word) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = pojVal;
          curr.src = word;
        }
      }

      const mList = uDicts.laigoakho || [];
      for (let i = 0; i < mList.length; i++) {
        const item = mList[i];
        if (!item.h || !item.p) continue;
        let curr = root;
        for (const ch of item.h) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = item.p;
          curr.src = item.h;
        }
      }

      // Priority 2: TWCD 經典庫補充 (TWCD Fallback: Fills entries not present in Moedict)
      const dictList = (this.data && this.data.hl_cl) || [];
      for (let i = 0; i < dictList.length; i++) {
        const entry = dictList[i];
        const h = entry.h;
        const c = entry.c;
        if (!h || !c) continue;
        let curr = root;
        for (const ch of h) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = c;
          curr.src = h;
        }
      }

      // Priority 0: 使用者自訂規則 (Custom rules always override both)
      const customList = this.custom.hl_cl || [];
      for (let i = 0; i < customList.length; i++) {
        const entry = customList[i];
        const h = entry.h;
        const c = entry.c;
        if (!h || !c) continue;
        let curr = root;
        for (const ch of h) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        curr.val = c;
        curr.src = h;
      }

      this._tries.hl_cl = root;
      return root;
    },

    getClHlTrie: function (caseInsensitive = true) {
      const cacheKey = caseInsensitive ? 'cl_hl_case_insensitive' : 'cl_hl_case_sensitive';
      if (this._tries[cacheKey]) return this._tries[cacheKey];

      const root = this._createTrieNode();
      const dictList = (this.custom.cl_hl || []).concat((this.data && this.data.cl_hl) || []);
      for (let i = 0; i < dictList.length; i++) {
        const entry = dictList[i];
        const c = entry.c;
        const h = entry.h;
        if (!c || !h) continue;
        const key = caseInsensitive ? c.toLowerCase() : c;
        let curr = root;
        for (const ch of key) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = h;
          curr.src = c;
        }
      }
      this._tries[cacheKey] = root;
      return root;
    },

    getClChTrie: function (caseInsensitive = true) {
      const cacheKey = caseInsensitive ? 'cl_ch_case_insensitive' : 'cl_ch_case_sensitive';
      if (this._tries[cacheKey]) return this._tries[cacheKey];

      const root = this._createTrieNode();
      const hasLatinRegex = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/;

      const insertRawKey = (rawKey, hanVal, override) => {
        const key = caseInsensitive ? rawKey.toLowerCase() : rawKey;
        let curr = root;
        for (let i = 0; i < key.length; i++) {
          const ch = key[i];
          let nextNode = curr.next.get(ch);
          if (!nextNode) {
            nextNode = this._createTrieNode();
            curr.next.set(ch, nextNode);
          }
          curr = nextNode;
        }
        if (override || !curr.val) {
          curr.val = hanVal;
          curr.src = rawKey;
        }
      };

      const insertEntry = (romKey, hanVal, override = false) => {
        if (!romKey || !hanVal) return;
        const cleanRom = romKey.trim();
        if (!cleanRom) return;
        // Normalize key to POJ so we only store 1 canonical orthography in the Trie (10x faster build)
        const pojForm = this.tl2cl(cleanRom);
        insertRawKey(pojForm, hanVal, override);
        // For short 2-3 syllable words with hyphens (e.g. ji̍t-thâu), also index the unhyphenated form
        if (pojForm.length <= 18 && pojForm.includes('-') && !pojForm.startsWith('-') && !pojForm.endsWith('-')) {
          insertRawKey(pojForm.replace(/-/g, ''), hanVal, override);
        }
      };

      // Priority 1: 台語核心高頻字詞／虛詞推薦漢字表 (最高優先，消除單音節同音字歧義)
      for (const [rom, han] of Object.entries(this.CORE_ROM2HAN)) {
        insertEntry(rom, han, true);
      }

      // Priority 2: TWCD cl_hl 經典片語庫 (28,347 筆純漢字詞條直接收錄)
      const clHlList = (this.data && this.data.cl_hl) || [];
      for (let i = 0; i < clHlList.length; i++) {
        const { c, h } = clHlList[i];
        if (!c || !h || hasLatinRegex.test(h)) continue;
        insertEntry(c, h, false);
      }

      // Priority 3: 教育部 / 萌典標準詞庫 (20,604 筆官方推薦純漢字詞條)
      const moedict = this.getMoedictData();
      for (const [word, info] of Object.entries(moedict)) {
        if (!info.t || hasLatinRegex.test(word)) continue;
        const readings = info.t.split('/');
        for (let r = 0; r < readings.length; r++) {
          const cleanR = readings[r].trim();
          if (cleanR) insertEntry(cleanR, word, false);
        }
      }

      // Priority 4: 使用者特藏詞庫 (杜信龍《七字孽》、鄭仁壽《內外科看護學》、杜信龍《護國》純漢詞目)
      const uDicts = this.getUserDicts();
      for (const [word, info] of Object.entries(uDicts.chhitjia || {})) {
        if (info.r && !hasLatinRegex.test(word)) {
          insertEntry(info.r, word, false);
        }
      }
      for (const [word, info] of Object.entries(uDicts.hokkok || {})) {
        if (info.r && !hasLatinRegex.test(word)) {
          insertEntry(info.r, word, false);
        }
      }
      const mList = uDicts.laigoakho || [];
      for (let i = 0; i < mList.length; i++) {
        const item = mList[i];
        if (item.p && item.h && !hasLatinRegex.test(item.h)) {
          insertEntry(item.p, item.h, false);
        }
      }

      // Priority 0: 使用者自訂規則 (Custom rules override all)
      const customList = this.custom.cl_hl || [];
      for (let i = 0; i < customList.length; i++) {
        const { c, h } = customList[i];
        if (c && h && !hasLatinRegex.test(h)) {
          insertEntry(c, h, true);
        }
      }

      this._tries[cacheKey] = root;
      return root;
    },

    getChHlTrie: function (outputStyle = 'tailo') {
      const cacheKey = outputStyle === 'poj' ? 'ch_hl_poj' : 'ch_hl_tailo';
      if (this._tries[cacheKey]) return this._tries[cacheKey];

      const root = this._createTrieNode();
      const hasLatinRegex = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/;

      const formatRoman = (str) => {
        if (!str) return '';
        return outputStyle === 'poj' ? this.tl2cl(str) : this.cl2tl(str);
      };

      // Step 1: Insert multi-character pure-Hanzi compound words from Moedict & Chhitjia as protected compounds
      // (Prevents false-positive conversion of single-char particles like 的/共/著/會/才 inside compound words like 目的/共同/教會/著作)
      const moedict = this.getMoedictData();
      for (const word of Object.keys(moedict)) {
        if (Array.from(word).length >= 2 && !hasLatinRegex.test(word)) {
          let curr = root;
          for (const ch of word) {
            if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
            curr = curr.next.get(ch);
          }
          curr.val = word;
          curr.src = word;
          curr.isNoTran = true;
        }
      }

      const uDicts = this.getUserDicts();
      for (const word of Object.keys(uDicts.chhitjia || {})) {
        if (Array.from(word).length >= 2 && !hasLatinRegex.test(word)) {
          let curr = root;
          for (const ch of word) {
            if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
            curr = curr.next.get(ch);
          }
          if (!curr.val) {
            curr.val = word;
            curr.src = word;
            curr.isNoTran = true;
          }
        }
      }

      // Step 2: Insert CORE_HAN2HL (Overrides protected compounds for genuine Hàn-lô target expressions like 毋閣, 按呢, 家己, 𨑨迌, 囡仔)
      for (const [han, hl] of Object.entries(this.CORE_HAN2HL)) {
        let curr = root;
        for (const ch of han) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        curr.val = formatRoman(hl);
        curr.src = han;
        curr.isNoTran = false;
      }

      // Step 3: Supplement from Hokkok (杜信龍《護國 評論集》) multi-syllable Romanized expressions mapped via Moedict
      const hokkok = uDicts.hokkok || {};
      for (const [word, info] of Object.entries(moedict)) {
        if (!info.t || Array.from(word).length < 2) continue;
        const firstReading = info.t.split('/')[0].trim();
        const pojReading = this.tl2cl(firstReading);
        if ((hokkok[firstReading] && hokkok[firstReading].c >= 5) || (hokkok[pojReading] && hokkok[pojReading].c >= 5)) {
          let curr = root;
          for (const ch of word) {
            if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
            curr = curr.next.get(ch);
          }
          curr.val = formatRoman(firstReading);
          curr.src = word;
          curr.isNoTran = false;
        }
      }

      this._tries[cacheKey] = root;
      return root;
    },

    getRubyTrie: function () {
      if (this._tries.ruby) return this._tries.ruby;
      const root = this._createTrieNode();
      const dictList = (this.custom.ruby || []).concat((this.data && this.data.ruby) || []);
      for (let i = 0; i < dictList.length; i++) {
        const entry = dictList[i];
        const k = entry.k;
        const r = entry.r;
        if (!k || !r) continue;
        let curr = root;
        for (const ch of k) {
          if (!curr.next.has(ch)) curr.next.set(ch, this._createTrieNode());
          curr = curr.next.get(ch);
        }
        if (!curr.val) {
          curr.val = r;
          curr.src = k;
        }
      }
      this._tries.ruby = root;
      return root;
    },

    loadCustomFromStorage: function () {
      if (typeof localStorage === 'undefined') return;
      try {
        const saved = localStorage.getItem('TWCD_CUSTOM_DICT');
        if (saved) {
          this.custom = Object.assign(this.custom, JSON.parse(saved));
          this.clearTrieCache();
        }
      } catch (e) {
        console.warn('Could not load custom dictionary from localStorage:', e);
      }
    },

    saveCustomToStorage: function () {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem('TWCD_CUSTOM_DICT', JSON.stringify(this.custom));
        this.clearTrieCache();
      } catch (e) {
        console.warn('Could not save custom dictionary to localStorage:', e);
      }
    },

    // ----------------------------------------------------
    // 2. 華語轉台語 (Huá-gí -> Tâi-gí) [Trie O(M) 加速]
    // ----------------------------------------------------
    hg2tg: function (text, options) {
      if (!text) return { result: '', highlights: [], stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        style: 'hanlo',       // 'hanlo', 'chuanhan', 'tailo', 'poj'
        useNoTran: true,
        diffHighlight: false
      }, options);

      const trie = this.getHgTrie(options.useNoTran);
      const chars = Array.from(text);
      let out = '';
      const highlights = [];
      let matchCount = 0;
      let i = 0;

      while (i < chars.length) {
        let curr = trie;
        let longestMatch = null;
        let longestMatchLen = 0;

        for (let j = i; j < chars.length; j++) {
          const ch = chars[j];
          if (!curr.next.has(ch)) break;
          curr = curr.next.get(ch);
          if (curr.val !== null) {
            longestMatch = curr;
            longestMatchLen = j - i + 1;
          }
        }

        if (longestMatch !== null) {
          if (longestMatch.isNoTran) {
            out += chars.slice(i, i + longestMatchLen).join('');
          } else {
            let t = longestMatch.val;
            if (options.diffHighlight) {
              out += `<mark class="twcd-match" data-src="${longestMatch.src}" title="華語：${longestMatch.src}">${t}</mark>`;
            } else {
              out += t;
            }
            matchCount++;
            highlights.push({ src: longestMatch.src, target: t });
          }
          i += longestMatchLen;
        } else {
          out += chars[i];
          i++;
        }
      }

      // If style is tailo or poj (全羅), convert the resulting Taiwanese text to full Romanization & English punctuation!
      if (options.style === 'tailo' || options.style === 'poj') {
        const clRes = this.hl2cl(out, {
          outputStyle: options.style,
          useFallback: true,
          englishPunctuation: true
        });
        out = clRes.result;
      } else if (options.style === 'chuanhan') {
        const chRes = this.hl2ch(out, {
          caseInsensitive: true,
          chinesePunctuation: false
        });
        out = chRes.result;
      }

      const elapsed = performance.now() - startTime;
      return {
        result: out,
        highlights: highlights,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // 3. 全羅轉漢羅 (Chôan-lô -> Hàn-lô) [大小寫容錯 + Trie 加速]
    // ----------------------------------------------------
    cl2hl: function (text, options) {
      if (!text) return { result: '', stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        isTaiLoInput: false,
        caseInsensitive: true
      }, options);

      let processed = text;
      if (options.isTaiLoInput) {
        processed = this.tl2cl(processed);
      }

      const trie = this.getClHlTrie(options.caseInsensitive);
      const chars = Array.from(processed);
      let out = '';
      let matchCount = 0;
      let i = 0;

      while (i < chars.length) {
        let curr = trie;
        let longestMatch = null;
        let longestMatchLen = 0;

        for (let j = i; j < chars.length; j++) {
          const ch = options.caseInsensitive ? chars[j].toLowerCase() : chars[j];
          if (!curr.next.has(ch)) break;
          curr = curr.next.get(ch);
          if (curr.val !== null) {
            longestMatch = curr.val;
            longestMatchLen = j - i + 1;
          }
        }

        if (longestMatch !== null) {
          out += longestMatch;
          matchCount++;
          i += longestMatchLen;
        } else {
          out += chars[i];
          i++;
        }
      }

      // Cleanup consecutive spaces
      out = out.replace(/[ \t]{2,}/g, ' ');

      const elapsed = performance.now() - startTime;
      return {
        result: out,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // 3b. 漢羅/全羅轉全漢 (Hàn-lô / Chôan-lô -> Chôan-hàn) [純漢字輸出]
    // ----------------------------------------------------
    hl2ch: function (text, options) {
      if (!text) return { result: '', stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        caseInsensitive: true,
        chinesePunctuation: true
      }, options);

      // Convert any numbered tone syllables (e.g. tioh8, poann5) to Unicode tone marks, then normalize Tâi-lô to POJ
      let processed = text.replace(/\b([a-zA-Z]+(?:nn|ⁿ)?[1-9])\b/g, (m) => {
        return this.ctsConvert(m, 'tailo_num', 'poj_unicode');
      });
      processed = this.tl2cl(processed);

      const trie = this.getClChTrie(options.caseInsensitive);
      const chars = Array.from(processed);
      const isLatinChar = (c) => c && /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036Fⁿ\u0358]/.test(c);

      // Helper to segment glued 2-syllable Romanized words (e.g. limtio̍h -> lim + tio̍h -> 飲著)
      const trySegmentCompound = (wordStr) => {
        if (wordStr.length < 4 || wordStr.length > 16) return null;
        const w = options.caseInsensitive ? wordStr.toLowerCase() : wordStr;
        const lookupSingle = (sub) => {
          let node = trie;
          for (let k = 0; k < sub.length; k++) {
            if (!node.next.has(sub[k])) return null;
            node = node.next.get(sub[k]);
          }
          return node.val;
        };
        for (let split = 2; split <= w.length - 2; split++) {
          const leftVal = lookupSingle(w.slice(0, split));
          if (leftVal) {
            const rightVal = lookupSingle(w.slice(split));
            if (rightVal) return leftVal + rightVal;
          }
        }
        return null;
      };

      let out = '';
      let matchCount = 0;
      let i = 0;

      while (i < chars.length) {
        // Preserve HTML tags if present (e.g., <mark> from hg2tg)
        if (chars[i] === '<') {
          const rest = chars.slice(i).join('');
          const tagMatch = rest.match(/^<[^>]+>/);
          if (tagMatch) {
            out += tagMatch[0];
            i += Array.from(tagMatch[0]).length;
            continue;
          }
        }

        // Only start Romanization Trie matching at a non-mid-word boundary
        const atWordStart = (i === 0 || !isLatinChar(chars[i - 1]));
        if (atWordStart && isLatinChar(chars[i])) {
          let curr = trie;
          let longestMatch = null;
          let longestMatchLen = 0;

          for (let j = i; j < chars.length; j++) {
            const ch = options.caseInsensitive ? chars[j].toLowerCase() : chars[j];
            if (!curr.next.has(ch)) break;
            curr = curr.next.get(ch);
            if (curr.val !== null) {
              const nextCh = chars[j + 1];
              // Valid end boundary: end of string, non-Latin character (space, hyphen, punctuation, Hanzi)
              if (!isLatinChar(nextCh)) {
                longestMatch = curr.val;
                longestMatchLen = j - i + 1;
              }
            }
          }

          if (longestMatch !== null) {
            out += longestMatch;
            matchCount++;
            i += longestMatchLen;
            // If immediately followed by a hyphen connecting another syllable (e.g. X-Y), skip the hyphen
            if (chars[i] === '-' && isLatinChar(chars[i + 1])) {
              i++;
            }
            continue;
          } else {
            // Collect whole Latin word and check if it is a glued 2-syllable Taiwanese compound (e.g. limtio̍h)
            let wordEnd = i;
            while (wordEnd < chars.length && isLatinChar(chars[wordEnd])) {
              wordEnd++;
            }
            const wordToken = chars.slice(i, wordEnd).join('');
            const segmented = trySegmentCompound(wordToken);
            if (segmented) {
              out += segmented;
              matchCount++;
            } else {
              out += wordToken;
            }
            i = wordEnd;
            continue;
          }
        }

        out += chars[i];
        i++;
      }

      // Remove spaces between Chinese characters in 全漢 output
      const hanRegex = /([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}]|<\/mark>)[ \t]+(?=[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}]|<mark)/gu;
      out = out.replace(hanRegex, '$1');
      out = out.replace(hanRegex, '$1');

      // Convert half-width punctuation next to Chinese characters to full-width Chinese punctuation if requested
      if (options.chinesePunctuation) {
        out = out
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*,[ \t]*/gu, '$1，')
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*\.[ \t]*/gu, '$1。')
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*![ \t]*/gu, '$1！')
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*\?[ \t]*/gu, '$1？')
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*:[ \t]*/gu, '$1：')
          .replace(/([\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}])[ \t]*;[ \t]*/gu, '$1；');
      }

      const elapsed = performance.now() - startTime;
      return {
        result: out,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // 3c. 全漢轉漢羅 (Chôan-hàn -> Hàn-lô) [自然台語漢羅混寫]
    // ----------------------------------------------------
    ch2hl: function (text, options) {
      if (!text) return { result: '', stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        outputStyle: 'tailo' // 'tailo' or 'poj'
      }, options);

      const trie = this.getChHlTrie(options.outputStyle);
      const chars = Array.from(text);
      const isLatinEnd = (s) => s && /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036Fⁿ\u0358]$/.test(s);
      const isLatinStart = (s) => s && /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036Fⁿ\u0358]/.test(s);

      let out = '';
      let matchCount = 0;
      let i = 0;

      while (i < chars.length) {
        let curr = trie;
        let longestNode = null;
        let longestMatchLen = 0;

        for (let j = i; j < chars.length; j++) {
          const ch = chars[j];
          if (!curr.next.has(ch)) break;
          curr = curr.next.get(ch);
          if (curr.val !== null) {
            longestNode = curr;
            longestMatchLen = j - i + 1;
          }
        }

        if (longestNode !== null) {
          const replacement = longestNode.val;
          if (!longestNode.isNoTran) {
            // Insert space if previous output ended with a Latin character and replacement starts with a Latin character
            if (isLatinEnd(out) && isLatinStart(replacement)) {
              out += ' ';
            }
            out += replacement;
            matchCount++;
          } else {
            out += replacement;
          }
          i += longestMatchLen;
        } else {
          // If existing text has Latin characters (e.g. already partially Hàn-lô), convert style if needed
          const ch = chars[i];
          if (isLatinEnd(out) && isLatinStart(ch)) {
            out += ch;
          } else {
            out += ch;
          }
          i++;
        }
      }

      const elapsed = performance.now() - startTime;
      return {
        result: out,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // 4. 漢羅轉全羅 (Hàn-lô -> Chôan-lô) [單字音標後備 + Trie 加速]
    // ----------------------------------------------------
    hl2cl: function (text, options) {
      if (!text) return { result: '', stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        outputStyle: 'tailo',  // 'tailo' or 'poj'
        useFallback: true,
        englishPunctuation: true,
        useHyphens: true
      }, options);

      const trie = this.getHlClTrie();
      const fallback = options.useFallback ? this.buildCharFallback() : {};
      const chars = Array.from(text);
      let out = '';
      let matchCount = 0;
      let i = 0;
      const hanCharRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}]/u;

      while (i < chars.length) {
        // Skip and preserve HTML tags if present (e.g. diffHighlight marks)
        if (chars[i] === '<') {
          const rest = chars.slice(i).join('');
          const tagMatch = rest.match(/^<[^>]+>/);
          if (tagMatch) {
            out += tagMatch[0];
            i += Array.from(tagMatch[0]).length;
            continue;
          }
        }

        let curr = trie;
        let longestMatch = null;
        let longestMatchLen = 0;

        for (let j = i; j < chars.length; j++) {
          const ch = chars[j];
          if (!curr.next.has(ch)) break;
          curr = curr.next.get(ch);
          if (curr.val !== null) {
            longestMatch = curr.val;
            longestMatchLen = j - i + 1;
          }
        }

        if (longestMatch !== null) {
          out += longestMatch + ' ';
          matchCount++;
          i += longestMatchLen;
        } else {
          const ch = chars[i];
          if (options.useFallback && hanCharRegex.test(ch) && fallback[ch]) {
            out += fallback[ch] + ' ';
            matchCount++;
          } else {
            out += ch;
          }
          i++;
        }
      }

      // Step 1: Restore syllable hyphens (e.g. ji̍tthâu -> ji̍t-thâu) if enabled
      if (options.useHyphens !== false) {
        out = this.restoreHyphens(out);
      }

      // Step 2: Convert to Tai-lo if requested
      if (options.outputStyle === 'tailo') {
        out = this.cl2tl(out);
      }

      // Step 3: English half-width punctuation, capitalization, and clean spacing
      if (options.englishPunctuation !== false) {
        out = this.toEnglishPunctuation(out);
      } else {
        out = out.replace(/\s+([，。！？,.!?:;])/g, '$1');
      }
      out = this.capitalizeSentences(out);
      out = out.replace(/[ \t]{2,}/g, ' ').trim();

      const elapsed = performance.now() - startTime;
      return {
        result: out,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // 5. 台語 Ruby 標音 (Taigi Ruby Annotator) [單字音標後備 + Trie 加速]
    // ----------------------------------------------------
    annotateRuby: function (text, options) {
      if (!text) return { html: '', stats: { matched: 0, timeMs: 0 } };
      const startTime = performance.now();
      options = Object.assign({
        toneFormat: 'tailo_unicode', // 'tailo_unicode', 'tailo_num', 'poj_unicode', 'poj_num'
        color: '#2563eb',
        fontSize: '0.65em',
        useFallback: true
      }, options);

      const trie = this.getRubyTrie();
      const fallback = options.useFallback ? this.buildCharFallback() : {};
      const chars = Array.from(text);
      let out = '';
      let matchCount = 0;
      let i = 0;
      const hanCharRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2ebe0}]/u;

      while (i < chars.length) {
        let curr = trie;
        let longestMatch = null;
        let longestMatchLen = 0;

        for (let j = i; j < chars.length; j++) {
          const ch = chars[j];
          if (!curr.next.has(ch)) break;
          curr = curr.next.get(ch);
          if (curr.val !== null) {
            longestMatch = curr.val;
            longestMatchLen = j - i + 1;
          }
        }

        if (longestMatch !== null) {
          let rubyTag = longestMatch;
          if (options.toneFormat !== 'tailo_num') {
            rubyTag = rubyTag.replace(/<rt>([^<]+)<\/rt>/g, (m, rtContent) => {
              const converted = this.convertRubyRt(rtContent, options.toneFormat);
              return `<rt>${converted}</rt>`;
            });
          }
          out += rubyTag;
          matchCount++;
          i += longestMatchLen;
        } else {
          const ch = chars[i];
          if (options.useFallback && hanCharRegex.test(ch) && fallback[ch]) {
            const rawPron = fallback[ch];
            const pron = this.ctsConvert(rawPron, 'poj_unicode', options.toneFormat);
            out += `<ruby><rb>${ch}</rb><rp>(</rp><rt>${pron}</rt><rp>)</rp></ruby>`;
            matchCount++;
          } else {
            out += ch;
          }
          i++;
        }
      }

      const elapsed = performance.now() - startTime;
      return {
        html: out,
        stats: { matched: matchCount, timeMs: Math.round(elapsed * 10) / 10 }
      };
    },

    // ----------------------------------------------------
    // Async Wrappers (Promise-based to avoid UI freezing)
    // ----------------------------------------------------
    hg2tgAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.hg2tg(text, options)), 0);
      });
    },

    cl2hlAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.cl2hl(text, options)), 0);
      });
    },

    hl2chAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.hl2ch(text, options)), 0);
      });
    },

    ch2hlAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.ch2hl(text, options)), 0);
      });
    },

    hl2clAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.hl2cl(text, options)), 0);
      });
    },

    annotateRubyAsync: function (text, options) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.annotateRuby(text, options)), 0);
      });
    },

    // Helper for ruby rt content conversion
    convertRubyRt: function (rtText, targetFormat) {
      const syllables = rtText.split(/([ \-%])/);
      const convertedSyllables = syllables.map(syl => {
        if (!syl || syl === ' ' || syl === '-' || syl === '%') return syl;
        return this.ctsConvert(syl, 'tailo_num', targetFormat);
      });
      return convertedSyllables.join('');
    },

    // ----------------------------------------------------
    // 6. 音標編碼轉換器 (CTS: Taiwanese / Hakka Converter)
    // ----------------------------------------------------
    ctsConvert: function (text, fromType, toType) {
      if (!text) return '';
      if (fromType === toType) return text;

      // Step 1: Normalize input to numbered format
      let numText = this.toNumbered(text, fromType);

      // Step 2: Convert numbered format to target format
      return this.fromNumbered(numText, toType);
    },

    toNumbered: function (text, fromType) {
      if (fromType === 'tailo_num' || fromType === 'poj_num') {
        return text;
      }

      let res = text;

      if (fromType === 'tailo_unicode') {
        for (const [mark, numKey] of Object.entries(REV_TAILO)) {
          if (res.includes(mark)) {
            const letter = numKey.slice(0, -1);
            const tone = numKey.slice(-1);
            res = res.split(mark).join(letter + (tone === '1' ? '' : tone));
          }
        }
      } else if (fromType === 'poj_unicode') {
        for (const [mark, numKey] of Object.entries(REV_UTF8)) {
          if (res.includes(mark)) {
            const letter = numKey.slice(0, -1);
            const tone = numKey.slice(-1);
            res = res.split(mark).join(letter + (tone === '1' ? '' : tone));
          }
        }
      } else if (fromType === 'tp') {
        for (const [mark, numKey] of Object.entries(REV_TP)) {
          if (res.includes(mark)) {
            const letter = numKey.slice(0, -1);
            const tone = numKey.slice(-1);
            res = res.split(mark).join(letter + (tone === '1' ? '' : tone));
          }
        }
      } else if (fromType === 'hotsys') {
        for (const [mark, numKey] of Object.entries(REV_HOTSYS)) {
          if (res.includes(mark)) {
            const letter = numKey.slice(0, -1);
            const tone = numKey.slice(-1);
            res = res.split(mark).join(letter + (tone === '1' ? '' : tone));
          }
        }
      }

      return res;
    },

    fromNumbered: function (text, toType) {
      if (toType === 'tailo_num') {
        return this.cl2tl(text);
      }
      if (toType === 'poj_num') {
        return this.tl2cl(text);
      }

      const syllableRegex = /([a-zA-Z\u00C0-\u024F\u0300-\u036F]+)([1-9]?)/g;

      return text.replace(syllableRegex, (match, body, tone) => {
        if (!tone || tone === '1' || tone === '4') {
          if (toType === 'tailo_unicode') return this.cl2tl(body);
          if (toType === 'poj_unicode') return this.tl2cl(body);
          return body;
        }

        const isTaiLo = (toType === 'tailo_unicode');
        let normBody = isTaiLo ? this.cl2tl(body) : this.tl2cl(body);

        const vowelIdx = this.findToneVowelIndex(normBody, isTaiLo);
        if (vowelIdx === -1) {
          return normBody + tone;
        }

        const char = normBody[vowelIdx];
        const nextChar = normBody[vowelIdx + 1] || '';

        const doubleKey = (char + nextChar).toLowerCase();
        const map = isTaiLo ? MAP_TAILO : MAP_UTF8;

        if (doubleKey === 'oo' && isTaiLo) {
          const mapKey = (char === 'O' ? 'OO' : 'oo') + tone;
          if (map[mapKey]) {
            return normBody.slice(0, vowelIdx) + map[mapKey] + normBody.slice(vowelIdx + 2);
          }
        }

        const mapKey = char + tone;
        if (map[mapKey]) {
          return normBody.slice(0, vowelIdx) + map[mapKey] + normBody.slice(vowelIdx + 1);
        }

        const mark = TONE_MARKS_TAILO[tone] || '';
        return normBody.slice(0, vowelIdx + 1) + mark + normBody.slice(vowelIdx + 1);
      });
    },

    findToneVowelIndex: function (syllable, isTaiLo) {
      const weights = isTaiLo ? TAI_LO_WEIGHT : POJ_WEIGHT;
      let highestWeight = -1;
      let targetIdx = -1;

      for (let i = 0; i < syllable.length; i++) {
        const ch = syllable[i];
        const w = weights[ch] || -1;
        if (w > highestWeight) {
          highestWeight = w;
          targetIdx = i;
        }
      }
      return targetIdx;
    },

    // ----------------------------------------------------
    // 7. 文本輔助工具 (Text Utilities)
    // ----------------------------------------------------
    dedupeLines: function (text, options) {
      options = Object.assign({
        trimWhitespace: true,
        removeEmpty: true,
        caseSensitive: true
      }, options);

      const rawLines = text.split(/\r?\n/);
      const totalCount = rawLines.length;
      const seen = new Set();
      const uniqueLines = [];

      for (let line of rawLines) {
        if (options.trimWhitespace) line = line.trim();
        if (options.removeEmpty && line.length === 0) continue;

        const compareKey = options.caseSensitive ? line : line.toLowerCase();
        if (!seen.has(compareKey)) {
          seen.add(compareKey);
          uniqueLines.push(line);
        }
      }

      const uniqueCount = uniqueLines.length;
      const removedCount = totalCount - uniqueCount;
      const dedupeRate = totalCount > 0 ? ((removedCount / totalCount) * 100).toFixed(1) : '0.0';

      return {
        result: uniqueLines.join('\n'),
        stats: { total: totalCount, unique: uniqueCount, removed: removedCount, rate: dedupeRate }
      };
    },

    sortLines: function (text, mode) {
      const lines = text.split(/\r?\n/);
      if (mode === 'asc') {
        lines.sort((a, b) => a.localeCompare(b, 'zh-Hant'));
      } else if (mode === 'desc') {
        lines.sort((a, b) => b.localeCompare(a, 'zh-Hant'));
      } else if (mode === 'length_asc') {
        lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
      } else if (mode === 'length_desc') {
        lines.sort((a, b) => b.length - a.length || a.localeCompare(b));
      }
      return lines.join('\n');
    },

    getWordFrequency: function (text) {
      if (!text) return [];
      const lines = text.split(/\r?\n/);
      const freqMap = {};
      for (const line of lines) {
        const item = line.trim();
        if (!item) continue;
        freqMap[item] = (freqMap[item] || 0) + 1;
      }
      const list = Object.entries(freqMap).map(([w, c]) => ({ word: w, count: c }));
      list.sort((a, b) => b.count - a.count);
      return list;
    },

    // ----------------------------------------------------
    // 8. 拼音替換工具函式
    // ----------------------------------------------------
    cl2tl: function (str) {
      if (!str) return '';
      return str
        .replace(/chh/g, 'tsh').replace(/Chh/g, 'Tsh').replace(/CHH/g, 'TSH')
        .replace(/ch/g, 'ts').replace(/Ch/g, 'Ts').replace(/CH/g, 'TS')
        .replace(/ou/g, 'oo').replace(/Ou/g, 'Oo').replace(/OU/g, 'OO')
        .replace(/oa/g, 'ua').replace(/Oa/g, 'Ua').replace(/OA/g, 'UA')
        .replace(/oe/g, 'ue').replace(/Oe/g, 'Ue').replace(/OE/g, 'UE')
        .replace(/eng/g, 'ing').replace(/Eng/g, 'Ing').replace(/ENG/g, 'ING')
        .replace(/ek/g, 'ik').replace(/Ek/g, 'Ik').replace(/EK/g, 'IK')
        .replace(/o͘/g, 'oo').replace(/O͘/g, 'Oo')
        .replace(/ⁿ/g, 'nn').replace(/N(?=[^a-zA-Z]|$)/g, 'nn');
    },

    tl2cl: function (str) {
      if (!str) return '';
      return str
        .replace(/tsh/g, 'chh').replace(/Tsh/g, 'Chh').replace(/TSH/g, 'CHH')
        .replace(/ts/g, 'ch').replace(/Ts/g, 'Ch').replace(/TS/g, 'CH')
        .replace(/oo/g, 'ou').replace(/Oo/g, 'Ou').replace(/OO/g, 'OU')
        .replace(/ua/g, 'oa').replace(/Ua/g, 'Oa').replace(/UA/g, 'OA')
        .replace(/ue/g, 'oe').replace(/Ue/g, 'Oe').replace(/UE/g, 'OE')
        .replace(/ing/g, 'eng').replace(/Ing/g, 'Eng').replace(/ING/g, 'ENG')
        .replace(/ik/g, 'ek').replace(/Ik/g, 'Ek').replace(/IK/g, 'EK')
        .replace(/nn(?=[^a-zA-Z]|$)/g, 'ⁿ');
    },

    toEnglishPunctuation: function (str) {
      if (!str) return '';
      let s = str;

      // Protect HTML tags (e.g. <mark ...>...</mark>)
      const tags = [];
      s = s.replace(/<[^>]+>/g, (tag) => {
        tags.push(tag);
        return `\uE000${tags.length - 1}\uE000`;
      });

      // 1. Dash & Ellipsis
      s = s.replace(/——/g, ' -- ').replace(/—/g, ' -- ');
      s = s.replace(/……/g, '... ').replace(/…/g, '... ');

      // 2. Standard sentence marks (Full-width to English half-width)
      s = s.replace(/，/g, ', ');
      s = s.replace(/、/g, ', ');
      s = s.replace(/。/g, '. ');
      s = s.replace(/！/g, '! ');
      s = s.replace(/？/g, '? ');
      s = s.replace(/：/g, ': ');
      s = s.replace(/；/g, '; ');
      s = s.replace(/～/g, '~');

      // 3. Opening / Closing Quotes & Brackets with placeholders
      const OQ = '\uE001';  // Open double quote
      const CQ = '\uE002';  // Close double quote
      const OSQ = '\uE003'; // Open single quote
      const CSQ = '\uE004'; // Close single quote

      s = s.replace(/[「“《〈]/g, OQ);
      s = s.replace(/[」”》〉]/g, CQ);
      s = s.replace(/[『‘]/g, OSQ);
      s = s.replace(/[』’]/g, CSQ);

      s = s.replace(/[（]/g, ' (');
      s = s.replace(/[）]/g, ') ');
      s = s.replace(/[【［]/g, ' [');
      s = s.replace(/[】］]/g, '] ');

      // 4. Spacing rules for Western typography:
      // Remove space BEFORE closing punctuation: , . ! ? : ; ) ]
      s = s.replace(/\s+([,.\!?:;\]\)])/g, '$1');
      // Remove space BEFORE closing quote
      s = s.replace(/\s+([\uE002\uE004])/g, '$1');

      // Remove space AFTER opening brackets / quotes
      s = s.replace(/([(\[\uE001\uE003])\s+/g, '$1');

      // Ensure space BEFORE opening quote / bracket if preceded by letter/digit/punctuation
      s = s.replace(/([a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF,.\!?:;])([\uE001\uE003(\[])/g, '$1 $2');

      // Ensure space AFTER closing quote / bracket if followed by letter/digit
      s = s.replace(/([\uE002\uE004)\]])(?=[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF])/g, '$1 ');

      // Ensure space AFTER standard punctuation if followed by letter/digit
      s = s.replace(/([,.\!?:;])(?=[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF])/g, '$1 ');

      // Replace placeholders with ASCII half-width English quotes
      s = s.replace(new RegExp(OQ, 'g'), '"');
      s = s.replace(new RegExp(CQ, 'g'), '"');
      s = s.replace(new RegExp(OSQ, 'g'), "'");
      s = s.replace(new RegExp(CSQ, 'g'), "'");

      // Restore protected HTML tags
      s = s.replace(/\uE000(\d+)\uE000/g, (m, idx) => tags[parseInt(idx, 10)]);

      // Collapse multiple spaces
      s = s.replace(/[ \t]{2,}/g, ' ').trim();
      return s;
    },

    capitalizeSentences: function (str) {
      if (!str) return '';
      return str.replace(/(^|[.!?]\s+)(["'(\[]?)(<[^>]+>)?([a-z])/g, (m, punct, quote, tag, char) => {
        return punct + quote + (tag || '') + char.toUpperCase();
      });
    },

    escapeRegex: function (str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  };

  if (typeof window !== 'undefined') {
    window.TWCD_Engine = Engine;
    Engine.init();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  }
})(typeof window !== 'undefined' ? window : global);
