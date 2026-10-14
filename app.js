/**
 * TWCD Web Application Controller
 * Handles UI events, tab switching, themes, copy, export, and sound synthesis.
 */

document.addEventListener('DOMContentLoaded', function () {
  const Engine = window.TWCD_Engine;
  if (!Engine) {
    console.error('Engine not loaded!');
    return;
  }

  // State
  let activeTab = 'hg_tg';
  let isDarkMode = localStorage.getItem('TWCD_THEME') === 'dark' || 
    (!localStorage.getItem('TWCD_THEME') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Cache DOM elements
  const htmlRoot = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const toastEl = document.getElementById('toast');

  // Initialize Theme
  applyTheme(isDarkMode);

  themeToggleBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    localStorage.setItem('TWCD_THEME', isDarkMode ? 'dark' : 'light');
  });

  function applyTheme(dark) {
    if (dark) {
      htmlRoot.classList.add('dark');
      themeIcon.innerHTML = `
        <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
        </svg>`;
    } else {
      htmlRoot.classList.remove('dark');
      themeIcon.innerHTML = `
        <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>`;
    }
  }

  // Toast Notification
  function showToast(msg, duration = 2500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
    toastEl.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
      toastEl.classList.remove('opacity-100', 'translate-y-0');
      toastEl.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    }, duration);
  }

  window.showToast = showToast;

  // Credits Modal
  const creditsModal = document.getElementById('credits-modal');
  const infoBtn = document.getElementById('info-btn');
  const footerCreditsLink = document.getElementById('footer-credits-link');
  const closeCreditsBtn = document.getElementById('close-credits-btn');
  const confirmCreditsBtn = document.getElementById('confirm-credits-btn');

  function openCreditsModal() {
    if (!creditsModal) return;
    creditsModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      creditsModal.classList.remove('opacity-0');
      creditsModal.classList.add('opacity-100');
    });
  }

  function closeCreditsModal() {
    if (!creditsModal) return;
    creditsModal.classList.remove('opacity-100');
    creditsModal.classList.add('opacity-0');
    setTimeout(() => {
      creditsModal.classList.add('hidden');
    }, 200);
  }

  if (infoBtn) infoBtn.addEventListener('click', openCreditsModal);
  if (footerCreditsLink) footerCreditsLink.addEventListener('click', openCreditsModal);
  if (closeCreditsBtn) closeCreditsBtn.addEventListener('click', closeCreditsModal);
  if (confirmCreditsBtn) confirmCreditsBtn.addEventListener('click', closeCreditsModal);
  if (creditsModal) {
    creditsModal.addEventListener('click', (e) => {
      if (e.target === creditsModal) closeCreditsModal();
    });
  }

  // Modal Sub-tabs (Sources vs Changelog)
  const modalTabSources = document.getElementById('modal-tab-sources');
  const modalTabChangelog = document.getElementById('modal-tab-changelog');
  const modalContentSources = document.getElementById('modal-content-sources');
  const modalContentChangelog = document.getElementById('modal-content-changelog');

  if (modalTabSources && modalTabChangelog) {
    modalTabSources.addEventListener('click', () => {
      modalTabSources.className = 'py-2 px-4 border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold';
      modalTabChangelog.className = 'py-2 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400';
      modalContentSources.classList.remove('hidden');
      modalContentChangelog.classList.add('hidden');
    });

    modalTabChangelog.addEventListener('click', () => {
      modalTabChangelog.className = 'py-2 px-4 border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold';
      modalTabSources.className = 'py-2 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400';
      modalContentChangelog.classList.remove('hidden');
      modalContentSources.classList.add('hidden');
    });
  }

  // Tab Switching
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });

  function switchTab(tabId) {
    activeTab = tabId;
    navTabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabId) {
        t.classList.add('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');
        t.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400');
      } else {
        t.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');
        t.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `pane-${tabId}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    if (tabId === 'dict') {
      renderDictStats();
      renderCustomDictTable();
    }
  }

  // -----------------  // Debounce utility to optimize typing responsiveness and prevent UI blocking
  function debounce(fn, wait = 180) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------------------------------------------------------------------
  // TAB 1: 華語轉台語 (HG -> TG)
  // ---------------------------------------------------------------------
  const hgInput = document.getElementById('hg-input');
  const hgOutput = document.getElementById('hg-output');
  const hgStyle = document.getElementById('hg-style');
  const hgNotranCheck = document.getElementById('hg-notran-check');
  const hgHighlightCheck = document.getElementById('hg-highlight-check');
  const hgCharCount = document.getElementById('hg-char-count');
  const hgStatus = document.getElementById('hg-status');
  const hgExampleBtn = document.getElementById('hg-example-btn');
  const hgClearBtn = document.getElementById('hg-clear-btn');
  const hgCopyBtn = document.getElementById('hg-copy-btn');
  const hgSpeakBtn = document.getElementById('hg-speak-btn');

  async function doHgConvert() {
    const text = hgInput.value;
    hgCharCount.textContent = `${text.length} 字`;
    if (!text.trim()) {
      hgOutput.innerHTML = '';
      hgStatus.textContent = '等待輸入...';
      return;
    }
    hgStatus.innerHTML = '<span class="text-indigo-500 animate-pulse font-medium">⚡ 運算中...</span>';
    const res = await Engine.hg2tgAsync(text, {
      style: hgStyle.value,
      useNoTran: hgNotranCheck.checked,
      diffHighlight: hgHighlightCheck.checked
    });
    if (hgHighlightCheck.checked) {
      hgOutput.innerHTML = res.result.replace(/\n/g, '<br>');
    } else {
      hgOutput.textContent = res.result;
    }
    hgStatus.textContent = `完成：耗時 ${res.stats.timeMs}ms | 匹配 ${res.stats.matched} 處詞彙`;
  }

  hgInput.addEventListener('input', debounce(doHgConvert, 180));
  hgStyle.addEventListener('change', doHgConvert);
  hgNotranCheck.addEventListener('change', doHgConvert);
  hgHighlightCheck.addEventListener('change', doHgConvert);

  hgExampleBtn.addEventListener('click', () => {
    hgInput.value = '任教於大學之中，他總是小心翼翼地對人客大聲吆喝著，避之唯恐不及。吃這裏的東西尿濕了褲襠，統統不許動！';
    doHgConvert();
  });

  hgClearBtn.addEventListener('click', () => {
    hgInput.value = '';
    doHgConvert();
    hgInput.focus();
  });

  hgCopyBtn.addEventListener('click', () => {
    const text = hgOutput.innerText || hgOutput.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast('已複製台語轉換結果！'));
  });

  hgSpeakBtn.addEventListener('click', () => {
    const text = hgOutput.innerText || hgOutput.textContent;
    speakText(text);
  });

  // ---------------------------------------------------------------------
  // TAB 2: 漢羅 ⇄ 全羅 (HL <-> CL)
  // ---------------------------------------------------------------------
  const hlclInput = document.getElementById('hlcl-input');
  const hlclOutput = document.getElementById('hlcl-output');
  const hlclMode = document.getElementById('hlcl-mode'); // 'hl2cl' or 'cl2hl'
  const hlclRomanStyle = document.getElementById('hlcl-roman-style'); // 'tailo' or 'poj'
  const hlclCaseCheck = document.getElementById('hlcl-case-check');
  const hlclFallbackCheck = document.getElementById('hlcl-fallback-check');
  const hlclCharCount = document.getElementById('hlcl-char-count');
  const hlclStatus = document.getElementById('hlcl-status');
  const hlclSwapBtn = document.getElementById('hlcl-swap-btn');
  const hlclExampleBtn = document.getElementById('hlcl-example-btn');
  const hlclClearBtn = document.getElementById('hlcl-clear-btn');
  const hlclCopyBtn = document.getElementById('hlcl-copy-btn');
  const hlclSpeakBtn = document.getElementById('hlcl-speak-btn');

  async function doHlclConvert() {
    const text = hlclInput.value;
    hlclCharCount.textContent = `${text.length} 字`;
    if (!text.trim()) {
      hlclOutput.value = '';
      hlclStatus.textContent = '等待輸入...';
      return;
    }
    const mode = hlclMode.value;
    const style = hlclRomanStyle.value;
    const caseInsensitive = hlclCaseCheck ? hlclCaseCheck.checked : true;
    const useFallback = hlclFallbackCheck ? hlclFallbackCheck.checked : true;

    hlclStatus.innerHTML = '<span class="text-indigo-500 animate-pulse font-medium">⚡ 運算中...</span>';

    if (mode === 'hl2cl') {
      const res = await Engine.hl2clAsync(text, { outputStyle: style, useFallback });
      hlclOutput.value = res.result;
      hlclStatus.textContent = `漢羅轉全羅完成：耗時 ${res.stats.timeMs}ms | 匹配 ${res.stats.matched} 處詞彙`;
    } else {
      const res = await Engine.cl2hlAsync(text, { isTaiLoInput: (style === 'tailo'), caseInsensitive });
      hlclOutput.value = res.result;
      hlclStatus.textContent = `全羅轉漢羅完成：耗時 ${res.stats.timeMs}ms | 匹配 ${res.stats.matched} 處詞彙`;
    }
  }

  hlclInput.addEventListener('input', debounce(doHlclConvert, 180));
  if (hlclCaseCheck) hlclCaseCheck.addEventListener('change', doHlclConvert);
  if (hlclFallbackCheck) hlclFallbackCheck.addEventListener('change', doHlclConvert);
  hlclMode.addEventListener('change', () => {
    updateHlclPlaceholders();
    doHlclConvert();
  });
  hlclRomanStyle.addEventListener('change', doHlclConvert);

  function updateHlclPlaceholders() {
    if (hlclMode.value === 'hl2cl') {
      hlclInput.placeholder = '請輸入台語漢羅文章（例如：日頭出來照好人，mā照pháiⁿ人...）';
    } else {
      hlclInput.placeholder = '請輸入白話字或台羅全羅文章（例如：Ji̍tthâu chhut lâi chiò hó lâng...）';
    }
  }

  hlclSwapBtn.addEventListener('click', () => {
    const tempIn = hlclInput.value;
    const tempOut = hlclOutput.value;
    hlclMode.value = (hlclMode.value === 'hl2cl') ? 'cl2hl' : 'hl2cl';
    updateHlclPlaceholders();
    hlclInput.value = tempOut || tempIn;
    doHlclConvert();
  });

  hlclExampleBtn.addEventListener('click', () => {
    if (hlclMode.value === 'hl2cl') {
      hlclInput.value = '日頭出來照好人，mā照pháiⁿ人。教會三十三週年記念，phah過來phah過去，真無同感！';
    } else {
      hlclInput.value = 'Iâ-so͘ kā i kóng: tio̍h hō͘ gín-á tāi-seng chia̍h pá. Ji̍tthâu chhut lâi chiò hó lâng!';
    }
    doHlclConvert();
  });

  hlclClearBtn.addEventListener('click', () => {
    hlclInput.value = '';
    doHlclConvert();
    hlclInput.focus();
  });

  hlclCopyBtn.addEventListener('click', () => {
    if (!hlclOutput.value) return;
    navigator.clipboard.writeText(hlclOutput.value).then(() => showToast('已複製全羅/漢羅結果！'));
  });

  hlclSpeakBtn.addEventListener('click', () => {
    speakText(hlclOutput.value);
  });

  // ---------------------------------------------------------------------
  // TAB 3: 台語 Ruby 標音 (Taigi Ruby Annotator)
  // ---------------------------------------------------------------------
  const rubyInput = document.getElementById('ruby-input');
  const rubyPreview = document.getElementById('ruby-preview');
  const rubyToneFormat = document.getElementById('ruby-tone-format');
  const rubyColor = document.getElementById('ruby-color');
  const rubyFontSize = document.getElementById('ruby-font-size');
  const rubyFallbackCheck = document.getElementById('ruby-fallback-check');
  const rubyStatus = document.getElementById('ruby-status');
  const rubyExampleBtn = document.getElementById('ruby-example-btn');
  const rubyClearBtn = document.getElementById('ruby-clear-btn');
  const rubyCopyRichBtn = document.getElementById('ruby-copy-rich-btn');
  const rubyCopyHtmlBtn = document.getElementById('ruby-copy-html-btn');
  const rubyExportHtmlBtn = document.getElementById('ruby-export-html-btn');

  async function doRubyConvert() {
    const text = rubyInput.value;
    if (!text.trim()) {
      rubyPreview.innerHTML = '<span class="text-slate-400 dark:text-slate-500 italic">標音即時預覽區...</span>';
      rubyStatus.textContent = '等待輸入...';
      return;
    }
    const useFallback = rubyFallbackCheck ? rubyFallbackCheck.checked : true;
    rubyStatus.innerHTML = '<span class="text-indigo-500 animate-pulse font-medium">⚡ 標音中...</span>';
    const res = await Engine.annotateRubyAsync(text, {
      toneFormat: rubyToneFormat.value,
      color: rubyColor.value,
      fontSize: rubyFontSize.value + 'em',
      useFallback: useFallback
    });

    // Format newlines
    let html = res.html.replace(/\n/g, '<br>');
    rubyPreview.innerHTML = html;
    applyRubyStyles();
    rubyStatus.textContent = `標音完成：耗時 ${res.stats.timeMs}ms | 匹配 ${res.stats.matched} 處標音`;
  }

  function applyRubyStyles() {
    const color = rubyColor.value;
    const size = rubyFontSize.value;
    const rts = rubyPreview.querySelectorAll('rt');
    rts.forEach(rt => {
      rt.style.color = color;
      rt.style.fontSize = `${size}em`;
      rt.style.userSelect = 'none';
    });
  }

  rubyInput.addEventListener('input', debounce(doRubyConvert, 180));
  rubyToneFormat.addEventListener('change', doRubyConvert);
  if (rubyFallbackCheck) rubyFallbackCheck.addEventListener('change', doRubyConvert);
  rubyColor.addEventListener('input', applyRubyStyles);
  rubyFontSize.addEventListener('input', applyRubyStyles);

  rubyExampleBtn.addEventListener('click', () => {
    rubyInput.value = '台灣羅馬拼音方案、盲朋友聯誼會、資訊文化藝術、台灣教會公報社。有人為tioh8 poann5過節，非常小心！';
    doRubyConvert();
  });

  rubyClearBtn.addEventListener('click', () => {
    rubyInput.value = '';
    doRubyConvert();
    rubyInput.focus();
  });

  rubyCopyHtmlBtn.addEventListener('click', () => {
    const html = rubyPreview.innerHTML;
    if (!html || html.includes('標音即時預覽區')) return;
    navigator.clipboard.writeText(html).then(() => showToast('已複製 HTML 程式碼！'));
  });

  rubyCopyRichBtn.addEventListener('click', () => {
    const range = document.createRange();
    range.selectNodeContents(rubyPreview);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand('copy');
      sel.removeAllRanges();
      showToast('已複製富文本！可直接貼上至 Word 或 Google 文件！');
    } catch (e) {
      showToast('富文本複製失敗，請使用 HTML 複製');
    }
  });

  rubyExportHtmlBtn.addEventListener('click', () => {
    const html = rubyPreview.innerHTML;
    if (!html || html.includes('標音即時預覽區')) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>台語漢羅 Ruby 標音閱讀本</title>
  <style>
    body { font-family: 'Iansui', 'Noto Serif TC', serif; padding: 40px; line-height: 2.8; font-size: 24px; background: #faf9f6; color: #1e293b; max-width: 800px; margin: 0 auto; }
    ruby { ruby-position: over; ruby-align: center; }
    rt { font-family: 'Charis SIL', 'Noto Sans', sans-serif; font-size: ${rubyFontSize.value}em; color: ${rubyColor.value}; font-weight: normal; }
  </style>
</head>
<body>
  <h2>台語漢羅標音閱讀文件</h2>
  <hr style="margin-bottom: 24px;">
  <div>${html}</div>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Taigi_Ruby_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已匯出 HTML 閱讀本！');
  });

  // ---------------------------------------------------------------------
  // TAB 4: 音標編碼工坊 (CTS Converter)
  // ---------------------------------------------------------------------
  const ctsFields = {
    tailo_unicode: document.getElementById('cts-tailo-unicode'),
    tailo_num: document.getElementById('cts-tailo-num'),
    poj_unicode: document.getElementById('cts-poj-unicode'),
    poj_num: document.getElementById('cts-poj-num'),
    tp: document.getElementById('cts-tp'),
    hotsys: document.getElementById('cts-hotsys')
  };

  let isCtsUpdating = false;

  Object.entries(ctsFields).forEach(([type, el]) => {
    if (!el) return;
    el.addEventListener('input', debounce(() => {
      if (isCtsUpdating) return;
      isCtsUpdating = true;
      const text = el.value;

      Object.entries(ctsFields).forEach(([targetType, targetEl]) => {
        if (targetType !== type && targetEl) {
          targetEl.value = Engine.ctsConvert(text, type, targetType);
        }
      });
      isCtsUpdating = false;
    }, 100));
  });

  const ctsExampleBtn = document.getElementById('cts-example-btn');
  const ctsClearBtn = document.getElementById('cts-clear-btn');

  if (ctsExampleBtn) {
    ctsExampleBtn.addEventListener('click', () => {
      ctsFields.tailo_unicode.value = 'tâi-uân kok-ka tē-lí phing-im';
      ctsFields.tailo_unicode.dispatchEvent(new Event('input'));
    });
  }

  if (ctsClearBtn) {
    ctsClearBtn.addEventListener('click', () => {
      Object.values(ctsFields).forEach(el => { if (el) el.value = ''; });
    });
  }

  // ---------------------------------------------------------------------
  // TAB 5: 文本除重與排序 (Dedupe & Sort)
  // ---------------------------------------------------------------------
  const textInput = document.getElementById('text-input');
  const textOutput = document.getElementById('text-output');
  const textDedupeBtn = document.getElementById('text-dedupe-btn');
  const textSortAscBtn = document.getElementById('text-sort-asc-btn');
  const textSortDescBtn = document.getElementById('text-sort-desc-btn');
  const textSortLenBtn = document.getElementById('text-sort-len-btn');
  const textFreqBtn = document.getElementById('text-freq-btn');
  const textClearBtn = document.getElementById('text-clear-btn');
  const textCopyBtn = document.getElementById('text-copy-btn');
  const textStatsEl = document.getElementById('text-stats');

  if (textDedupeBtn) {
    textDedupeBtn.addEventListener('click', () => {
      const res = Engine.dedupeLines(textInput.value);
      textOutput.value = res.result;
      textStatsEl.textContent = `除重完成：原始 ${res.stats.total} 行 | 唯一 ${res.stats.unique} 行 | 消除 ${res.stats.removed} 行 (${res.stats.rate}%)`;
      showToast(`已消除 ${res.stats.removed} 個重複行！`);
    });
  }

  if (textSortAscBtn) {
    textSortAscBtn.addEventListener('click', () => {
      textOutput.value = Engine.sortLines(textInput.value, 'asc');
      textStatsEl.textContent = '正序排序 (A-Z / 拼音升序) 完成';
    });
  }

  if (textSortDescBtn) {
    textSortDescBtn.addEventListener('click', () => {
      textOutput.value = Engine.sortLines(textInput.value, 'desc');
      textStatsEl.textContent = '反序排序 (Z-A / 拼音降序) 完成';
    });
  }

  if (textSortLenBtn) {
    textSortLenBtn.addEventListener('click', () => {
      textOutput.value = Engine.sortLines(textInput.value, 'length_desc');
      textStatsEl.textContent = '依字串長度 (長詞優先) 排序完成';
    });
  }

  if (textFreqBtn) {
    textFreqBtn.addEventListener('click', () => {
      const freq = Engine.getWordFrequency(textInput.value);
      const lines = freq.slice(0, 100).map((item, idx) => `${idx + 1}. ${item.word} : ${item.count} 次`);
      textOutput.value = `【詞頻統計前 100 名】\n` + lines.join('\n');
      textStatsEl.textContent = `統計完成：共有 ${freq.length} 個不同詞項`;
    });
  }

  if (textClearBtn) {
    textClearBtn.addEventListener('click', () => {
      textInput.value = '';
      textOutput.value = '';
      textStatsEl.textContent = '';
      textInput.focus();
    });
  }

  if (textCopyBtn) {
    textCopyBtn.addEventListener('click', () => {
      if (!textOutput.value) return;
      navigator.clipboard.writeText(textOutput.value).then(() => showToast('已複製處理結果！'));
    });
  }

  // ---------------------------------------------------------------------
  // TAB 6: 詞典檢索與自訂規則 (Dictionary & Custom Rules)
  // ---------------------------------------------------------------------
  const dictSearchInput = document.getElementById('dict-search-input');
  const dictSearchResult = document.getElementById('dict-search-result');
  const customDictTable = document.getElementById('custom-dict-table');
  const addHgCustomBtn = document.getElementById('add-hg-custom-btn');
  const addNotranCustomBtn = document.getElementById('add-notran-custom-btn');
  const exportCustomBtn = document.getElementById('export-custom-btn');
  const importCustomInput = document.getElementById('import-custom-input');

  function renderDictStats() {
    const hgCnt = (Engine.data && Engine.data.hg_tg ? Engine.data.hg_tg.length : 0);
    const clhlCnt = (Engine.data && Engine.data.cl_hl ? Engine.data.cl_hl.length : 0);
    const hlclCnt = (Engine.data && Engine.data.hl_cl ? Engine.data.hl_cl.length : 0);
    const rubyCnt = (Engine.data && Engine.data.ruby ? Engine.data.ruby.length : 0);
    const notranCnt = (Engine.data && Engine.data.hg_notran ? Engine.data.hg_notran.length : 0);
    const total = hgCnt + clhlCnt + hlclCnt + rubyCnt;

    const el = document.getElementById('dict-stats-summary');
    if (el) {
      el.innerHTML = `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">華台詞條：${hgCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">全羅轉漢羅：${clhlCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">漢羅轉全羅：${hlclCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Ruby標音：${rubyCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">不轉詞彙：${notranCnt}</span>
      `;
    }
  }

  function doDictSearch() {
    const q = (dictSearchInput.value || '').trim().toLowerCase();
    if (!q || q.length < 1) {
      dictSearchResult.innerHTML = '<div class="text-sm text-slate-400 p-4 text-center">請在上方輸入關鍵字查詢辭典庫...</div>';
      return;
    }
    const results = [];
    const hgList = (Engine.data && Engine.data.hg_tg) || [];
    for (let i = 0; i < hgList.length; i++) {
      if (hgList[i].m.includes(q) || hgList[i].t.includes(q)) {
        results.push({ type: '華台', src: hgList[i].m, dst: hgList[i].t });
        if (results.length >= 50) break;
      }
    }
    const hlList = (Engine.data && Engine.data.hl_cl) || [];
    for (let i = 0; i < hlList.length && results.length < 50; i++) {
      if (hlList[i].h.includes(q) || hlList[i].c.toLowerCase().includes(q)) {
        results.push({ type: '漢羅/全羅', src: hlList[i].h, dst: hlList[i].c });
      }
    }

    if (results.length === 0) {
      dictSearchResult.innerHTML = `<div class="text-sm text-slate-400 p-4 text-center">找不到包含「${q}」的詞條</div>`;
      return;
    }

    dictSearchResult.innerHTML = results.map(r => `
      <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60 text-sm">
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${r.type}</span>
        <span class="font-medium text-slate-900 dark:text-slate-100 flex-1 ml-3">${r.src}</span>
        <span class="text-indigo-600 dark:text-indigo-400 font-serif font-bold">${r.dst}</span>
      </div>
    `).join('');
  }

  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', debounce(doDictSearch, 250));
  }

  function renderCustomDictTable() {
    if (!customDictTable) return;
    const items = [];
    (Engine.custom.hg_tg || []).forEach((item, idx) => {
      items.push({ type: '華台片語', src: item.m, dst: item.t, cat: 'hg_tg', idx });
    });
    (Engine.custom.notran || []).forEach((w, idx) => {
      items.push({ type: '強迫不轉', src: w, dst: '（保持原樣）', cat: 'notran', idx });
    });

    if (items.length === 0) {
      customDictTable.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-sm text-slate-400">目前尚無自訂片語，請在上方新增！</td></tr>`;
      return;
    }

    customDictTable.innerHTML = items.map(item => `
      <tr class="border-b border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40">
        <td class="p-2 text-xs font-medium text-slate-500 dark:text-slate-400">${item.type}</td>
        <td class="p-2 text-sm font-medium text-slate-800 dark:text-slate-200">${item.src}</td>
        <td class="p-2 text-sm text-indigo-600 dark:text-indigo-400">${item.dst}</td>
        <td class="p-2 text-right">
          <button class="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded" onclick="deleteCustomEntry('${item.cat}', ${item.idx})">刪除</button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteCustomEntry = function (category, idx) {
    if (category === 'hg_tg') {
      Engine.custom.hg_tg.splice(idx, 1);
    } else if (category === 'notran') {
      Engine.custom.notran.splice(idx, 1);
    }
    Engine.saveCustomToStorage();
    renderCustomDictTable();
    showToast('已刪除自訂片語');
  };

  if (addHgCustomBtn) {
    addHgCustomBtn.addEventListener('click', () => {
      const m = document.getElementById('custom-m-input').value.trim();
      const t = document.getElementById('custom-t-input').value.trim();
      if (!m || !t) {
        showToast('請完整輸入華語詞與台語詞！');
        return;
      }
      Engine.custom.hg_tg.unshift({ m, t });
      Engine.saveCustomToStorage();
      document.getElementById('custom-m-input').value = '';
      document.getElementById('custom-t-input').value = '';
      renderCustomDictTable();
      showToast('成功新增華台片語！');
    });
  }

  if (addNotranCustomBtn) {
    addNotranCustomBtn.addEventListener('click', () => {
      const w = document.getElementById('custom-notran-input').value.trim();
      if (!w) {
        showToast('請輸入不轉詞彙！');
        return;
      }
      if (!Engine.custom.notran.includes(w)) {
        Engine.custom.notran.unshift(w);
        Engine.saveCustomToStorage();
      }
      document.getElementById('custom-notran-input').value = '';
      renderCustomDictTable();
      showToast('成功加入強迫不轉名單！');
    });
  }

  if (exportCustomBtn) {
    exportCustomBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Engine.custom, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `TWCD_CustomDict_${Date.now()}.json`;
      a.click();
      showToast('已匯出自訂詞庫備份檔！');
    });
  }

  if (importCustomInput) {
    importCustomInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          Engine.custom = Object.assign(Engine.custom, parsed);
          Engine.saveCustomToStorage();
          renderCustomDictTable();
          showToast('成功匯入自訂詞庫！');
        } catch (err) {
          showToast('匯入失敗：JSON 格式不正確');
        }
      };
      reader.readAsText(file);
    });
  }

  // ---------------------------------------------------------------------
  // Web Speech API
  // ---------------------------------------------------------------------
  function speakText(text) {
    if (!text || !('speechSynthesis' in window)) {
      showToast('您的瀏覽器不支援語音合成或無內容可播放');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]+>/g, '').replace(/[%\-_]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;

    // Pick Hokkien/Taiwanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const twVoice = voices.find(v => v.lang.includes('nan') || v.lang.includes('min') || v.name.includes('Taiwan') || v.lang === 'zh-TW');
    if (twVoice) utterance.voice = twVoice;

    window.speechSynthesis.speak(utterance);
    showToast('正在朗讀...');
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Initialize dict stats
  renderDictStats();
});
