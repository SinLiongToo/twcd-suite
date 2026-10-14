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
      this.loadCustomFromStorage();
      this.buildCharFallback();
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
        ruby: null
      };
      this._hyphenMap = null;
      this._charFallback = null;
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
        style: 'hanlo',       // 'hanlo', 'tailo', 'poj'
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
