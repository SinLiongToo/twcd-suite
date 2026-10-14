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

  // Modal Sub-tabs (Sources, Tech, Tribute, Changelog)
  const modalTabSources = document.getElementById('modal-tab-sources');
  const modalTabTech = document.getElementById('modal-tab-tech');
  const modalTabTribute = document.getElementById('modal-tab-tribute');
  const modalTabChangelog = document.getElementById('modal-tab-changelog');

  const modalContentSources = document.getElementById('modal-content-sources');
  const modalContentTech = document.getElementById('modal-content-tech');
  const modalContentTribute = document.getElementById('modal-content-tribute');
  const modalContentChangelog = document.getElementById('modal-content-changelog');

  const modalTabs = [
    { btn: modalTabSources, content: modalContentSources },
    { btn: modalTabTech, content: modalContentTech },
    { btn: modalTabTribute, content: modalContentTribute },
    { btn: modalTabChangelog, content: modalContentChangelog },
  ];

  modalTabs.forEach(item => {
    if (item.btn && item.content) {
      item.btn.addEventListener('click', () => {
        modalTabs.forEach(t => {
          if (t.btn && t.content) {
            if (t.btn === item.btn) {
              t.btn.className = 'py-2.5 px-3 sm:px-4 border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold whitespace-nowrap';
              t.content.classList.remove('hidden');
            } else {
              t.btn.className = 'py-2.5 px-3 sm:px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 whitespace-nowrap';
              t.content.classList.add('hidden');
            }
          }
        });
      });
    }
  });

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
    toggleSpeech(text, hgSpeakBtn);
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
  const hlclPunctCheck = document.getElementById('hlcl-punct-check');
  const hlclHyphenCheck = document.getElementById('hlcl-hyphen-check');
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
    const englishPunctuation = hlclPunctCheck ? hlclPunctCheck.checked : true;
    const useHyphens = hlclHyphenCheck ? hlclHyphenCheck.checked : true;

    hlclStatus.innerHTML = '<span class="text-indigo-500 animate-pulse font-medium">⚡ 運算中...</span>';

    if (mode === 'hl2cl') {
      const res = await Engine.hl2clAsync(text, { outputStyle: style, useFallback, englishPunctuation, useHyphens });
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
  if (hlclPunctCheck) hlclPunctCheck.addEventListener('change', doHlclConvert);
  if (hlclHyphenCheck) hlclHyphenCheck.addEventListener('change', doHlclConvert);
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
    const text = hlclOutput.value || hlclInput.value;
    toggleSpeech(text, hlclSpeakBtn);
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

  const rubySpeakBtn = document.getElementById('ruby-speak-btn');
  if (rubySpeakBtn) {
    rubySpeakBtn.addEventListener('click', () => {
      const text = rubyInput.value;
      toggleSpeech(text, rubySpeakBtn);
    });
  }

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
    const audioCnt = (Engine.data && Engine.data.audio ? Object.keys(Engine.data.audio).length : 0);
    const moedictCnt = Object.keys(Engine.getMoedictData()).length;
    const uDicts = Engine.getUserDicts();
    const chhitjiaCnt = Object.keys(uDicts.chhitjia || {}).length;
    const laigoakhoCnt = (uDicts.laigoakho || []).length;
    const hokkokCnt = Object.keys(uDicts.hokkok || {}).length;

    const el = document.getElementById('dict-stats-summary');
    if (el) {
      el.innerHTML = `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">🏛️ 教育部/萌典：${moedictCnt || 20604} 詞</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">📜 杜信龍《七字孽》：${chhitjiaCnt || 8139} 詞</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">🛡️ 杜信龍《護國》：${hokkokCnt || 1836} 詞</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">🩺 鄭仁壽《內外科看護學》：${laigoakhoCnt || 1019} 詞</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">🎙️ 教育部真人音檔：${audioCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">華台片語：${hgCnt}</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">漢羅轉全羅：${hlclCnt}</span>
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

    const audioMap = (Engine.data && Engine.data.audio) || {};

    // 1. Priority 1: 教育部 / 萌典辭典 (MOE / Moedict)
    const moeResults = Engine.queryMoedict(q, 15);

    // 1.5. Priority 1.5: 使用者特藏專屬詞庫 (杜信龍《七字孽》、杜信龍《護國》& 鄭仁壽《內外科看護學》)
    const userDictResults = Engine.queryUserDicts(q, 15);

    // 2. Priority 2: TWCD 經典庫 (TWCD Classical Corpus)
    const twcdResults = [];
    const hgList = (Engine.data && Engine.data.hg_tg) || [];
    for (let i = 0; i < hgList.length; i++) {
      if (hgList[i].m.includes(q) || hgList[i].t.includes(q)) {
        twcdResults.push({ type: '華台片語', src: hgList[i].m, dst: hgList[i].t });
        if (twcdResults.length >= 30) break;
      }
    }
    const hlList = (Engine.data && Engine.data.hl_cl) || [];
    for (let i = 0; i < hlList.length && twcdResults.length < 50; i++) {
      if (hlList[i].h.includes(q) || hlList[i].c.toLowerCase().includes(q)) {
        twcdResults.push({ type: '漢羅/全羅', src: hlList[i].h, dst: hlList[i].c });
      }
    }

    const hasAnyResults = moeResults.length > 0 || 
      userDictResults.chhitjia.length > 0 || 
      userDictResults.hokkok.length > 0 || 
      userDictResults.laigoakho.length > 0 || 
      twcdResults.length > 0;

    if (!hasAnyResults) {
      dictSearchResult.innerHTML = `<div class="text-sm text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">找不到包含「${q}」的詞條</div>`;
      return;
    }

    let html = '';

    // Render Moedict Results First (Priority 1)
    if (moeResults.length > 0) {
      html += `
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-indigo-200 dark:border-indigo-900/50">
            <h4 class="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🏛️ 教育部臺灣台語常用詞辭典 / 萌典（官方標準優先）</span>
              <span class="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 rounded-full font-sans">${moeResults.length} 筆</span>
            </h4>
          </div>
          <div class="space-y-3">
            ${moeResults.map(item => {
              const audioId = item.a || audioMap[item.word];
              const audioBtn = audioId ? `
                <button class="play-word-btn px-2.5 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-sans flex items-center space-x-1 shadow-xs transition" data-id="${audioId}" data-word="${item.word}" title="聆聽教育部母語播音員真人發音">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                  <span>真人發音</span>
                </button>
              ` : '';

              const defsHtml = (item.d || []).map((def) => {
                const typeBadge = def.t ? `<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mr-1.5">${def.t}</span>` : '';
                const examplesHtml = (def.e || []).map(ex => `
                  <div class="mt-1 pl-2.5 border-l-2 border-indigo-200 dark:border-indigo-800 text-xs space-y-0.5">
                    <div class="font-medium text-slate-800 dark:text-slate-200">${ex.h || ''}</div>
                    ${ex.r ? `<div class="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">${ex.r}</div>` : ''}
                    ${ex.m ? `<div class="text-slate-500 dark:text-slate-400 text-[11px]">華語：${ex.m}</div>` : ''}
                  </div>
                `).join('');

                return `
                  <div class="text-xs">
                    <div class="text-slate-700 dark:text-slate-300 leading-relaxed">${typeBadge}${def.d || ''}</div>
                    ${examplesHtml}
                  </div>
                `;
              }).join('<div class="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>');

              return `
                <div class="p-3.5 bg-indigo-50/40 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
                  <div class="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-indigo-100/60 dark:border-indigo-900/30">
                    <div>
                      <div class="flex items-baseline space-x-2">
                        <span class="text-lg font-bold font-serif text-slate-900 dark:text-white">${item.word}</span>
                        <span class="text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400">${item.t || ''}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 shrink-0">
                      ${audioBtn}
                      <a href="https://www.moedict.tw/'${encodeURIComponent(item.word)}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition" title="前往萌典官方網頁查看">
                        萌典 ↗
                      </a>
                    </div>
                  </div>
                  <div class="space-y-2">
                    ${defsHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Render Chhitjia Results (杜信龍《七字孽》)
    if (userDictResults.chhitjia.length > 0) {
      html += `
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-emerald-200 dark:border-emerald-900/50">
            <h4 class="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📜 杜信龍《七字孽 chhit-jī-gia̍t》詞典（七字仔語境詩歌）</span>
              <span class="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 rounded-full font-sans">${userDictResults.chhitjia.length} 筆</span>
            </h4>
          </div>
          <div class="space-y-3">
            ${userDictResults.chhitjia.map(item => {
              const examplesHtml = (item.e || []).map(ex => `
                <div class="mt-1 pl-2.5 border-l-2 border-emerald-200 dark:border-emerald-800 text-xs space-y-0.5">
                  <div class="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <span class="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">【${ex.t || '七字孽'}】</span>
                    <span>${ex.h || ''}</span>
                  </div>
                  ${ex.r ? `<div class="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">${ex.r}</div>` : ''}
                </div>
              `).join('');

              return `
                <div class="p-3.5 bg-emerald-50/40 dark:bg-slate-800/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <div class="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-emerald-100/60 dark:border-emerald-900/30">
                    <div>
                      <div class="flex items-baseline space-x-2">
                        <span class="text-lg font-bold font-serif text-slate-900 dark:text-white">${item.word}</span>
                        <span class="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">${item.r || ''}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 shrink-0">
                      <a href="https://sinliongtoo.github.io/CHHITJIA_JITIAN/" target="_blank" rel="noopener noreferrer" class="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition" title="前往《七字孽》專屬線上辭典">
                        七字孽辭典 ↗
                      </a>
                      <a href="https://readmoo.com/book/210456880000101" target="_blank" rel="noopener noreferrer" class="px-2 py-1 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium transition" title="前往 Readmoo 讀墨購買電子書">
                        讀墨 ↗
                      </a>
                    </div>
                  </div>
                  <div class="space-y-1">
                    ${examplesHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Render Hokkok Results (杜信龍《護國 評論集》)
    if (userDictResults.hokkok && userDictResults.hokkok.length > 0) {
      html += `
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-sky-200 dark:border-sky-900/50">
            <h4 class="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🛡️ 杜信龍《護國 評論集》台語詞典（政經國安與母語時論語境）</span>
              <span class="px-2 py-0.5 text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 rounded-full font-sans">${userDictResults.hokkok.length} 筆</span>
            </h4>
          </div>
          <div class="space-y-3">
            ${userDictResults.hokkok.map(item => {
              const examplesHtml = (item.e || []).map(ex => `
                <div class="mt-1 pl-2.5 border-l-2 border-sky-200 dark:border-sky-800 text-xs space-y-0.5">
                  <div class="font-medium text-slate-800 dark:text-slate-200 flex items-start space-x-1.5">
                    <span class="text-[10px] font-bold px-1.5 py-0.2 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded shrink-0">${ex.t || '護國'}</span>
                    <span class="leading-relaxed">${ex.h || ''}</span>
                  </div>
                  ${ex.r ? `<div class="font-mono text-sky-600 dark:text-sky-400 text-[11px]">${ex.r}</div>` : ''}
                </div>
              `).join('');

              const countBadge = item.c ? `<span class="text-[11px] text-slate-400 font-sans ml-1.5">(${item.c}次)</span>` : '';
              const phraseBadge = item.p ? `<span class="px-1.5 py-0.2 text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-800 ml-1.5">片語</span>` : '';

              return `
                <div class="p-3.5 bg-sky-50/40 dark:bg-slate-800/80 rounded-xl border border-sky-100 dark:border-sky-900/40 shadow-xs">
                  <div class="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-sky-100/60 dark:border-sky-900/30">
                    <div>
                      <div class="flex items-baseline space-x-2">
                        <span class="text-lg font-bold font-serif text-slate-900 dark:text-white">${item.word}</span>
                        <span class="text-sm font-mono font-medium text-sky-600 dark:text-sky-400">${item.r || ''}</span>
                        ${countBadge}
                        ${phraseBadge}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 shrink-0">
                      <a href="https://sinliongtoo.github.io/hok_kok_ebook/#dict" target="_blank" rel="noopener noreferrer" class="px-2 py-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition" title="前往《護國 評論集》線上詞典">
                        護國詞典 ↗
                      </a>
                      <a href="https://sinliongtoo.github.io/hok_kok_ebook/" target="_blank" rel="noopener noreferrer" class="px-2 py-1 text-xs text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300 font-medium transition" title="閱讀《護國 評論集》全文">
                        電子書 ↗
                      </a>
                    </div>
                  </div>
                  <div class="space-y-1">
                    ${examplesHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Render Laigoakho Results (鄭仁壽《內外科看護學》1917)
    if (userDictResults.laigoakho.length > 0) {
      html += `
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-amber-200 dark:border-amber-900/50">
            <h4 class="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🩺 鄭仁壽《內外科看護學》醫學語彙庫（1917 台英漢三語辭彙）</span>
              <span class="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 rounded-full font-sans">${userDictResults.laigoakho.length} 筆</span>
            </h4>
          </div>
          <div class="space-y-2">
            ${userDictResults.laigoakho.map(item => `
              <div class="p-3 bg-amber-50/40 dark:bg-slate-800/80 rounded-xl border border-amber-100 dark:border-amber-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-baseline space-x-2">
                    <span class="text-base font-bold font-serif text-slate-900 dark:text-white">${item.h || ''}</span>
                    <span class="text-sm font-mono font-medium text-amber-600 dark:text-amber-400">${item.p || ''}</span>
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2">
                    <span class="font-medium text-slate-700 dark:text-slate-300">英文：${item.e || ''}</span>
                    ${item.n ? `<span class="italic text-slate-400">(${item.n})</span>` : ''}
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <a href="https://sinliongtoo.github.io/laigoakho_Tejinsiu_ebook/#/05_glossary/medical_glossary" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 text-xs rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium transition">
                    查閱原書 ↗
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Render TWCD Classical Results (Priority 2)
    if (twcdResults.length > 0) {
      html += `
        <div>
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🏛️ TWCD 經典對照片語庫（民間文獻與語料補充）</span>
              <span class="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-sans">${twcdResults.length} 筆</span>
            </h4>
          </div>
          <div class="space-y-1.5">
            ${twcdResults.map(r => {
              const audioId = audioMap[r.src] || audioMap[r.dst];
              const audioBtn = audioId ? `
                <button class="play-word-btn ml-2 px-2 py-0.5 text-xs rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-sans flex items-center space-x-1" data-id="${audioId}" data-word="${r.dst || r.src}" title="聆聽教育部真人發音">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                  <span>真人發音</span>
                </button>
              ` : '';
              return `
                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60 text-sm">
                  <span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${r.type}</span>
                  <span class="font-medium text-slate-900 dark:text-slate-100 flex-1 ml-3">${r.src}</span>
                  <div class="flex items-center">
                    <span class="text-indigo-600 dark:text-indigo-400 font-serif font-bold">${r.dst}</span>
                    ${audioBtn}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    dictSearchResult.innerHTML = html;
  }

  if (dictSearchResult) {
    dictSearchResult.addEventListener('click', (e) => {
      const btn = e.target.closest('.play-word-btn');
      if (btn) {
        const id = btn.getAttribute('data-id');
        const word = btn.getAttribute('data-word');
        TWCD_Audio.playSingle(id, word);
      }
    });
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
  // Audio Engine: 教育部 / ChhoeTaigi 真人音檔與雙模語音引擎
  // ---------------------------------------------------------------------
  const TWCD_Audio = {
    currentAudio: null,
    isPlaying: false,
    activeBtn: null,
    queue: [],
    queueIndex: 0,

    // Audio CDN URL generators (Primary: ChhoeTaigi Mirror, Fallback: MOE Sutian)
    getUrls(audioId) {
      return [
        `https://chhoetaigi.github.io/KipSutianDataMirror/public/20260503-2330/imtong/sutiau/${audioId}.mp3`,
        `https://sutian.moe.edu.tw/media/senn/sutiau/${audioId}.mp3`
      ];
    },

    stop() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.isPlaying = false;
      this.queue = [];
      this.queueIndex = 0;
      if (this.activeBtn) {
        if (this.activeBtn.dataset.origHtml) {
          this.activeBtn.innerHTML = this.activeBtn.dataset.origHtml;
          delete this.activeBtn.dataset.origHtml;
        }
        this.activeBtn = null;
      }
    },

    setBtnPlaying(btn) {
      if (!btn) return;
      if (!btn.dataset.origHtml) {
        btn.dataset.origHtml = btn.innerHTML;
      }
      btn.innerHTML = `
        <svg class="w-4 h-4 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        <span class="text-rose-600 dark:text-rose-400 font-semibold">停止</span>
      `;
      this.activeBtn = btn;
    },

    restoreBtn() {
      if (this.activeBtn) {
        if (this.activeBtn.dataset.origHtml) {
          this.activeBtn.innerHTML = this.activeBtn.dataset.origHtml;
          delete this.activeBtn.dataset.origHtml;
        }
        this.activeBtn = null;
      }
      this.isPlaying = false;
    },

    playSingle(audioId, word) {
      this.stop();
      if (!audioId) {
        showToast('無對應之真人音檔編號');
        return;
      }
      showToast(`正在播放真人發音：${word || ''}...`);
      const urls = this.getUrls(audioId);
      const audio = new Audio();
      this.currentAudio = audio;
      this.isPlaying = true;

      let triedFallback = false;
      audio.src = urls[0];
      audio.onended = () => {
        this.stop();
      };
      audio.onerror = () => {
        if (!triedFallback) {
          triedFallback = true;
          audio.src = urls[1];
          audio.play().catch(e => {
            this.stop();
            showToast('音檔載入失敗');
          });
        } else {
          this.stop();
          showToast('音檔載入失敗');
        }
      };
      audio.play().catch(err => {
        console.warn('Audio play error:', err);
      });
    },

    // Tokenize text into indexed audio clips (greedy longest match from 6 down to 1)
    findClips(text) {
      const audioMap = (Engine.data && Engine.data.audio) || {};
      if (!text || Object.keys(audioMap).length === 0) return [];
      const clean = text.replace(/<[^>]+>/g, '').trim();
      const clips = [];
      let i = 0;
      const maxLen = 6;
      while (i < clean.length) {
        const curSub = clean.substring(i);
        // Skip spaces, punctuation and newlines
        const skipMatch = curSub.match(/^[\s，。！？、；：「」『』（）\(\)\.,!\?_—\-\n\r\t]+/);
        if (skipMatch) {
          i += skipMatch[0].length;
          continue;
        }
        let matched = false;
        for (let l = Math.min(maxLen, clean.length - i); l >= 1; l--) {
          const seg = clean.substring(i, i + l);
          if (audioMap[seg]) {
            clips.push({ word: seg, id: audioMap[seg] });
            i += l;
            matched = true;
            break;
          }
        }
        if (!matched) {
          i++;
        }
      }
      return clips;
    },

    // Dual-mode playback: tries native clips first; if none match, falls back to Web Speech
    playSentence(text, btn) {
      if (this.isPlaying) {
        this.stop();
        return;
      }
      if (!text || !text.trim()) {
        showToast('請先輸入或生成要發音的內容');
        return;
      }

      const clips = this.findClips(text);
      if (clips.length > 0) {
        this.isPlaying = true;
        this.setBtnPlaying(btn);
        this.queue = clips;
        this.queueIndex = 0;
        showToast(`🎙️ 正在播放教育部真人音檔 (${clips.length} 處詞條)...`);
        this.playNextClip();
      } else {
        // Fallback to Web Speech API
        this.speakWithSpeechSynthesis(text, btn);
      }
    },

    playNextClip() {
      if (!this.isPlaying) return;
      if (this.queueIndex >= this.queue.length) {
        this.stop();
        showToast('播放完成');
        return;
      }
      const item = this.queue[this.queueIndex];
      const urls = this.getUrls(item.id);
      const audio = new Audio();
      this.currentAudio = audio;

      let triedFallback = false;
      audio.src = urls[0];

      audio.onended = () => {
        this.queueIndex++;
        // Small 80ms acoustic pause between words
        setTimeout(() => this.playNextClip(), 80);
      };

      audio.onerror = () => {
        if (!triedFallback) {
          triedFallback = true;
          audio.src = urls[1];
          audio.play().catch(e => {
            this.queueIndex++;
            this.playNextClip();
          });
        } else {
          this.queueIndex++;
          this.playNextClip();
        }
      };

      audio.play().catch(err => {
        console.warn('Playback interrupted or failed:', err);
        this.queueIndex++;
        this.playNextClip();
      });
    },

    speakWithSpeechSynthesis(text, btn) {
      if (!('speechSynthesis' in window)) {
        showToast('您的瀏覽器不支援語音合成');
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]+>/g, '').replace(/[%\-_]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const twVoice = voices.find(v => v.lang.includes('nan') || v.lang.includes('min') || v.name.includes('Taiwan') || v.lang === 'zh-TW');
      if (twVoice) utterance.voice = twVoice;

      this.isPlaying = true;
      this.setBtnPlaying(btn);

      utterance.onend = () => {
        this.restoreBtn();
      };
      utterance.onerror = () => {
        this.restoreBtn();
      };

      window.speechSynthesis.speak(utterance);
      showToast('以系統語音合成朗讀中...');
    },

    toggle(text, btn) {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.playSentence(text, btn);
      }
    }
  };

  function toggleSpeech(text, btn) {
    TWCD_Audio.toggle(text, btn);
  }

  // Expose to window for external/inline access
  window.TWCD_Audio = TWCD_Audio;
  window.toggleSpeech = toggleSpeech;

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
