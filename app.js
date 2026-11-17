/* ==========================================================================
   POSITION RECEIPT — CORE JAVASCRIPT APPLICATION LOGIC
   Handles Screen 1 & 2, Memory Settings Manager, Interactive Comboboxes for
   Accounts, Challenges, Symbols, Direction Selector (LONG / SHORT), Dual Space 
   Execution Times (Hour : Minute with colon in middle), 6-Tip Checklist with 
   Grey Selection Backdrops, 11 R-Multiple Outcome Pills, Edit History Position,
   and Strict 2-Page A5 PDF Export & Google Drive Sync
   ========================================================================== */

(function () {
  'use strict';

  // --- LOCAL STORAGE KEYS ---
  const STORAGE_KEY_ACCOUNTS = 'trade_log_accounts';
  const STORAGE_KEY_CHALLENGES = 'trade_log_challenges';
  const STORAGE_KEY_SYMBOLS = 'trade_log_symbols';
  const STORAGE_KEY_POSITIONS = 'trade_log_positions';
  const STORAGE_KEY_HISTORY = 'trade_log_history';

  // DEFAULT TOP SYMBOLS LIST
  const DEFAULT_SYMBOLS = ['XAUUSD', 'US30', 'EURUSD', 'NAS100', 'GBPUSD', 'BTCUSD', 'USDJPY', 'AUDUSD'];

  // No preloaded history: the app starts empty, all receipts are created by the user.
  const DEFAULT_HISTORY = [];

  // --- APPLICATION STATE ---
  const state = {
    accounts: [],
    challenges: [],
    symbols: [],
    positions: {},
    history: [],
    editingId: null,
    currentSetup: {
      account: '',
      challenge: '',
      orderNum: ''
    },
    currentTrade: {
      selectedR: 'FREE',
      imageDataUrl: null
    },
    generatedPdfBlob: null,
    generatedPdfFilename: ''
  };

  // --- DOM ELEMENT REFERENCES ---
  const elements = {
    // Screens & Navigation
    screen1: document.getElementById('screen-1'),
    screen2: document.getElementById('screen-2'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnOpenHistory: document.getElementById('btn-open-history'),
    btnNewTrade: document.getElementById('btn-new-trade'),
    historyBadge: document.getElementById('history-badge'),

    // Screen 1 Setup Controls
    setupAccount: document.getElementById('setup-account'),
    setupChallenge: document.getElementById('setup-challenge'),
    setupOrderNum: document.getElementById('setup-order-num'),
    setupExcelNum: document.getElementById('setup-excel-num'),
    accountDropdown: document.getElementById('account-dropdown'),
    challengeDropdown: document.getElementById('challenge-dropdown'),
    seqSuggestionBadge: document.getElementById('seq-suggestion-badge'),
    suggestedNumText: document.getElementById('suggested-num-text'),
    btnAcceptSuggestion: document.getElementById('btn-accept-suggestion'),
    btnScreen1Continue: document.getElementById('btn-screen1-continue'),

    // Screen 2 Form Controls
    summaryAccount: document.getElementById('summary-account'),
    summaryChallenge: document.getElementById('summary-challenge'),
    summaryOrderNum: document.getElementById('summary-order-num'),
    btnEditSetup: document.getElementById('btn-edit-setup'),

    tradeSymbol: document.getElementById('trade-symbol'),
    symbolDropdown: document.getElementById('symbol-dropdown'),
    tradeSession: document.getElementById('trade-session'),
    tradeDirection: document.getElementById('trade-direction'),
    tradeOrderNumEdit: document.getElementById('trade-order-num-edit'),
    tradeExcelNum: document.getElementById('trade-excel-num'),
    tradeDate: document.getElementById('trade-date'),

    tradeSize: document.getElementById('trade-size'),
    tradeEntry: document.getElementById('trade-entry'),
    tradeExit: document.getElementById('trade-exit'),
    tradeStop: document.getElementById('trade-stop'),
    tradeTp: document.getElementById('trade-tp'),

    // Dual Space Execution Time Input Pairs (HH : MM)
    timeEntryBrokerHH: document.getElementById('time-entry-broker-hh'),
    timeEntryBrokerMM: document.getElementById('time-entry-broker-mm'),
    timeExitBrokerHH: document.getElementById('time-exit-broker-hh'),
    timeExitBrokerMM: document.getElementById('time-exit-broker-mm'),

    timeEntryTehranHH: document.getElementById('time-entry-tehran-hh'),
    timeEntryTehranMM: document.getElementById('time-entry-tehran-mm'),
    timeExitTehranHH: document.getElementById('time-exit-tehran-hh'),
    timeExitTehranMM: document.getElementById('time-exit-tehran-mm'),

    // 6-Tip Checklist
    checklistScore: document.getElementById('checklist-score'),
    checklistWarningBanner: document.getElementById('checklist-warning-banner'),
    checklistCheckboxes: [
      document.getElementById('tip-1'),
      document.getElementById('tip-2'),
      document.getElementById('tip-3'),
      document.getElementById('tip-4'),
      document.getElementById('tip-5'),
      document.getElementById('tip-6')
    ],

    // R-Multiple Pills
    rMultipleSelector: document.getElementById('r-multiple-selector'),

    // Notes, Image & Status Toggles
    notesTechnical: document.getElementById('notes-technical'),
    notesSentimental: document.getElementById('notes-sentimental'),
    micTechnical: document.getElementById('mic-technical'),
    micSentimental: document.getElementById('mic-sentimental'),
    imageDropzone: document.getElementById('image-upload-dropzone'),
    imageInput: document.getElementById('trade-image-input'),
    uploadPlaceholder: document.getElementById('upload-placeholder'),
    uploadPreviewWrapper: document.getElementById('upload-preview-wrapper'),
    uploadPreviewImg: document.getElementById('upload-preview-img'),
    btnRemoveImage: document.getElementById('btn-remove-image'),
    tradeZoomAdded: document.getElementById('trade-zoom-added'),
    tradeExcelAdded: document.getElementById('trade-excel-added'),

    btnGeneratePdf: document.getElementById('btn-generate-pdf'),

    // Settings Modal Elements
    modalAppSettings: document.getElementById('modal-app-settings'),
    btnCloseSettingsModal: document.getElementById('btn-close-settings-modal'),
    newAccountInput: document.getElementById('new-account-input'),
    btnAddAccount: document.getElementById('btn-add-account'),
    accountsList: document.getElementById('accounts-list'),
    newChallengeInput: document.getElementById('new-challenge-input'),
    btnAddChallenge: document.getElementById('btn-add-challenge'),
    challengesList: document.getElementById('challenges-list'),
    newSymbolInput: document.getElementById('new-symbol-input'),
    btnAddSymbol: document.getElementById('btn-add-symbol'),
    symbolsList: document.getElementById('symbols-list'),

    // Modals
    modalPdfPreview: document.getElementById('modal-pdf-preview'),
    pdfPreviewContainer: document.getElementById('pdf-preview-container'),
    driveNoticeBanner: document.getElementById('drive-notice-banner'),
    driveNoticeText: document.getElementById('drive-notice-text'),
    btnDownloadPdf: document.getElementById('btn-download-pdf'),
    btnPrintPdf: document.getElementById('btn-print-pdf'),
    btnDrivePdf: document.getElementById('btn-drive-pdf'),
    btnSharePdf: document.getElementById('btn-share-pdf'),
    btnClosePdfModal: document.getElementById('btn-close-pdf-modal'),

    modalTradeHistory: document.getElementById('modal-trade-history'),
    historyListContainer: document.getElementById('history-list-container'),
    historySearch: document.getElementById('history-search'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    btnCloseHistoryModal: document.getElementById('btn-close-history-modal'),

    pdfRenderTemplateWrapper: document.getElementById('pdf-render-template-wrapper')
  };

  // ==========================================================================
  // PERSIAN TYPOGRAPHY UTILITIES (ZWNJ / نیم‌فاصله, ی/ک NORMALIZATION, DIGITS)
  // ==========================================================================

  const FA_RANGE = '\\u0621-\\u065F\\u066E-\\u06D3\\u06FA-\\u06FF';
  const HAS_FA_RE = /[\u0600-\u06FF]/;

  // Convert Persian (۰-۹) and Arabic (٠-٩) digits to ASCII digits
  function toEnglishDigits(str) {
    return String(str || '')
      .replace(/[\u06F0-\u06F9]/g, ch => String(ch.charCodeAt(0) - 0x06F0))
      .replace(/[\u0660-\u0669]/g, ch => String(ch.charCodeAt(0) - 0x0660));
  }

  // Normalize Arabic Yeh/Kaf variants to Persian ی / ک so glyphs shape correctly
  function faCharNormalize(str) {
    return String(str || '')
      .replace(/[\u0649\u064A]/g, '\u06CC')
      .replace(/\u0643/g, '\u06A9');
  }

  // Insert ZWNJ (\u200C) for Persian prefix verbs & common suffixes:
  //   "می کنم"  → "می‌کنم"   |  "نمی رود"  → "نمی‌رود"
  //   "کتاب ها" → "کتاب‌ها"   |  "بزرگ ترین" → "بزرگ‌ترین"
  function fixPersianZWNJ(str) {
    let s = faCharNormalize(str);
    if (!HAS_FA_RE.test(s)) return s;

    const prefixRe = new RegExp(
      '(^|[^' + FA_RANGE + 'A-Za-z])(ن?می)[ \\u00A0]+(?=[' + FA_RANGE + '])', 'g'
    );
    s = s.replace(prefixRe, '$1$2\u200C');

    const suffixRe = new RegExp(
      '([' + FA_RANGE + 'A-Za-z])[ \\u00A0]+((هایی|ها\u06CC|ها|ترین|تر|ام|ات|اش))(?=$|[^' + FA_RANGE + 'A-Za-z])', 'g'
    );
    s = s.replace(suffixRe, '$1\u200C$2');

    return s;
  }

  // --- SMART POSITION-CODE ENGINE (COMPACT SCHEME: YYYYMMDD{suffix}, e.g. 202607211) ---

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatCompactDate(dt) {
    return `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}`;
  }

  // Default first-ever suggestion for a fresh Account/Challenge pair, e.g. "202608241"
  function todayDateCode() {
    return `${formatCompactDate(new Date())}1`;
  }

  // Parses a position code into {y, mo, d, suffix}. Handles:
  //   A) delimited:   2026/07/21 · 2026-7-21 · 2026.07.21 (+ optional digit suffix)
  //   B1) compact:    202607211 (YYYYMMDD + suffix)
  //   B2) short:      2026721 (best-effort unpadded date, prefers 2-digit month)
  function parsePositionDateCode(value) {
    const s = toEnglishDigits(value).trim();

    const sane = (moStr, dStr) => {
      const mo = Number(moStr), d = Number(dStr);
      return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? { mo, d } : null;
    };

    // A) Delimited form — separators disambiguate month/day
    let m = s.match(/^(\d{4})[\/\-. ](\d{1,2})[\/\-. ](\d{1,2})(\d*)$/);
    if (m) {
      const sd = sane(m[2], m[3]);
      if (sd) return { y: Number(m[1]), mo: sd.mo, d: sd.d, suffix: m[4] };
    }

    // B) Compact digits only
    const c = s.replace(/[\/\-. ]/g, '');
    if (!/^\d+$/.test(c)) return null;

    // B1) Zero-padded YYYYMMDD{suffix}
    m = c.match(/^(\d{4})(\d{2})(\d{2})(\d*)$/);
    if (m) {
      const sd = sane(m[2], m[3]);
      if (sd) return { y: Number(m[1]), mo: sd.mo, d: sd.d, suffix: m[4] };
    }

    // B2) Short unpadded date-only (e.g. "2026721"): prefer 2-digit month read
    m = c.match(/^(\d{4})(\d{2,3})$/);
    if (m) {
      const tail = m[2];
      const attempts = tail.length === 3
        ? [[tail.slice(0, 2), tail.slice(2)], [tail.slice(0, 1), tail.slice(1)]]
        : [[tail.slice(0, 1), tail.slice(1)]];
      for (const [moStr, dStr] of attempts) {
        const sd = sane(moStr, dStr);
        if (sd) return { y: Number(m[1]), mo: sd.mo, d: sd.d, suffix: '' };
      }
    }

    return null;
  }

  // --- INDEXED-DB PERSISTENCE LAYER (No 5MB quota limit for chart screenshots) ---
  const IDB_NAME = 'TradeLogReceiptsDB';
  const IDB_VERSION = 1;
  const IDB_STORE = 'receipts';

  function openIndexedDB() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
      try {
        const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('IndexedDB unavailable, using localStorage fallback');
          resolve(null);
        };
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function saveHistoryToIndexedDB(historyArray) {
    try {
      const db = await openIndexedDB();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      await new Promise((resolve) => {
        const clearReq = store.clear();
        clearReq.onsuccess = resolve;
        clearReq.onerror = resolve;
      });
      if (Array.isArray(historyArray)) {
        historyArray.forEach(item => {
          if (item && item.id) {
            try { store.put(item); } catch (_) {}
          }
        });
      }
    } catch (err) {
      console.warn('Failed to save to IndexedDB:', err);
    }
  }

  async function loadHistoryFromIndexedDB() {
    try {
      const db = await openIndexedDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          resolve(Array.isArray(req.result) ? req.result : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  }

  async function clearIndexedDB() {
    try {
      const db = await openIndexedDB();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
    } catch (_) {}
  }

  // Smart sequential code calculation:
  // - Detects today's date prefix (e.g. "20260909")
  // - Finds trades logged today for this Account/Challenge
  // - Automatically increments the trade sequence for today: 202609091 -> 202609092 -> 202609093
  // - If it is a new day, starts at 202609091
  // - For plain numeric codes (e.g. 67), advances to 68
  function getSmartNextPositionCode(lastCode, matchingTrades = []) {
    const now = new Date();
    const todayPrefix = formatCompactDate(now);

    // If lastCode is a pure sequential integer (e.g. "67", "1", "42") and NOT a date code:
    if (lastCode) {
      const cleanNum = toEnglishDigits(String(lastCode)).trim().replace(/[\s\/\-.]/g, '');
      const parsedDate = parsePositionDateCode(lastCode);
      if (!parsedDate && /^\d+$/.test(cleanNum)) {
        return String(parseInt(cleanNum, 10) + 1);
      }
    }

    // Find all trades matching today's date prefix in matchingTrades or lastCode
    const todayCodes = [];
    if (Array.isArray(matchingTrades)) {
      matchingTrades.forEach(h => {
        const code = toEnglishDigits(String(h.orderNum || '')).trim().replace(/[\s\/\-.]/g, '');
        if (code.startsWith(todayPrefix)) {
          todayCodes.push(code);
        }
      });
    }

    if (lastCode) {
      const lastClean = toEnglishDigits(String(lastCode)).trim().replace(/[\s\/\-.]/g, '');
      if (lastClean.startsWith(todayPrefix) && !todayCodes.includes(lastClean)) {
        todayCodes.push(lastClean);
      }
    }

    if (todayCodes.length > 0) {
      let maxSuffix = 0;
      todayCodes.forEach(code => {
        const suffixStr = code.slice(todayPrefix.length);
        const sNum = parseInt(suffixStr, 10);
        if (!isNaN(sNum) && sNum > maxSuffix) {
          maxSuffix = sNum;
        }
      });
      return `${todayPrefix}${maxSuffix + 1}`;
    }

    return `${todayPrefix}1`;
  }

  // Backwards-compatible getNextPositionCode helper
  function getNextPositionCode(lastCode, matchingTrades = []) {
    return getSmartNextPositionCode(lastCode, matchingTrades);
  }

  // Universal descending sort: newest position receipt always at the very top
  function sortPositionsDescending(a, b) {
    if (!a || !b) return 0;
    // 1. Newest timestamp first
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    if (timeA && timeB && timeA !== timeB) {
      return timeB - timeA;
    }

    // 2. Newest date first (YYYY-MM-DD)
    if (a.date && b.date && a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }

    // 3. Highest orderNum (e.g. 202609081 > 202609021)
    const ordA = toEnglishDigits(String(a.orderNum || '')).trim().replace(/[\s\/\-.]/g, '');
    const ordB = toEnglishDigits(String(b.orderNum || '')).trim().replace(/[\s\/\-.]/g, '');
    if (/^\d+$/.test(ordA) && /^\d+$/.test(ordB)) {
      const numA = Number(ordA);
      const numB = Number(ordB);
      if (numA !== numB) return numB - numA;
    }

    // 4. Highest Excel number
    const excA = parseInt(toEnglishDigits(String(a.excelNum || '')), 10);
    const excB = parseInt(toEnglishDigits(String(b.excelNum || '')), 10);
    if (!isNaN(excA) && !isNaN(excB) && excA !== excB) {
      return excB - excA;
    }

    return 0;
  }

  // Canonicalize a typed code into the compact scheme:
  //   "2026/7/21" → "20260721" · "2026-07-21" → "20260721"
  //   "20260721 5" spacing artifacts → "202607215"
  // Non-numeric custom codes pass through untouched.
  function canonicalizeDateCodeInput(value) {
    const raw = toEnglishDigits(value).trim();
    const p = parsePositionDateCode(raw);
    if (p) {
      const dt = new Date(p.y, p.mo - 1, p.d);
      return `${formatCompactDate(dt)}${p.suffix}`;
    }
    const compact = raw.replace(/[\s\/\-.]/g, '');
    return /^\d+$/.test(compact) ? compact : raw;
  }

  // --- TOAST NOTIFICATIONS (replaces blocking alert dialogs) ---
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 450);
    }, 3400);
  }

  // Inline invalid-state marker with shake animation
  function flagInvalid(el) {
    if (!el) return;
    el.classList.remove('invalid');
    void el.offsetWidth; // restart CSS animation
    el.classList.add('invalid');
    setTimeout(() => el.classList.remove('invalid'), 1600);
  }

  // ==========================================================================
  // PERSIAN SPEECH-TO-TEXT DICTATION (WEB SPEECH API · STRICT fa-IR)
  // Toggle mic on Technical & Sentimental note fields; live interim results
  // are appended into the textarea, final chunks get ZWNJ-normalized.
  // ==========================================================================

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  let activeDictationStop = null; // only one field may listen at a time

  function setupSpeechDictation(textareaEl, btnEl) {
    if (!textareaEl || !btnEl) return;

    const wrapper = textareaEl.closest('.textarea-wrapper');

    // Graceful fallback when the browser lacks the Web Speech API
    if (!SpeechRecognitionAPI) {
      btnEl.classList.add('unsupported');
      btnEl.title = 'Voice-to-text is not supported in this browser (try Chrome or Edge)';
      btnEl.setAttribute('aria-disabled', 'true');
      btnEl.addEventListener('click', () => {
        showToast('Voice-to-text is not supported in this browser. Please use Chrome or Edge.', 'error');
      });
      return;
    }

    let recognition = null;
    let listening = false;
    let baseText = '';    // field content captured at dictation start
    let finalText = '';   // confirmed transcript chunks
    let interimText = ''; // live in-progress transcript

    const composeOutput = () => {
      const dictated = fixPersianZWNJ(finalText + interimText).replace(/\s+/g, ' ').trim();
      if (!baseText.trim()) return dictated;
      if (!dictated) return baseText;
      return baseText.replace(/\s+$/, '') + ' ' + dictated;
    };

    const paint = () => {
      textareaEl.value = composeOutput();
      textareaEl.scrollTop = textareaEl.scrollHeight;
    };

    function hardStop() {
      listening = false;
      interimText = '';
      paint(); // flush remaining text with ZWNJ normalization applied
      if (activeDictationStop === hardStop) activeDictationStop = null;
      if (recognition) {
        const rec = recognition;
        recognition = null;
        rec.onend = null; // prevent auto-restart during teardown
        try { rec.stop(); } catch (e) { /* already stopped */ }
      }
      setUI(false);
    }

    const buildRecognition = () => {
      const rec = new SpeechRecognitionAPI();

      rec.lang = 'fa-IR';            // CRITICAL: strict Persian (Iran)
      rec.continuous = true;         // keep listening across pauses
      rec.interimResults = true;     // live transcription while speaking
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript || '';
          if (event.results[i].isFinal) {
            finalText += chunk;
            if (!/\s$/.test(finalText)) finalText += ' ';
          } else {
            interimText += chunk;
          }
        }
        paint();
      };

      rec.onerror = (event) => {
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            showToast('Microphone permission denied — allow mic access and try again.', 'error');
            hardStop();
            break;
          case 'audio-capture':
            showToast('No microphone found on this device.', 'error');
            hardStop();
            break;
          case 'network':
            showToast('Speech service network error — check your connection.', 'error');
            hardStop();
            break;
          case 'no-speech':
            // Silence timeout: onend auto-restart resumes listening gracefully.
            break;
          case 'aborted':
          default:
            break;
        }
      };

      rec.onend = () => {
        if (!listening) return;
        // Browser ended the session (silence timeout / segment limit):
        // restart shortly so dictation stays continuous until toggled off.
        setTimeout(() => {
          if (listening && recognition) {
            try { recognition.start(); } catch (e) { /* start race guard */ }
          }
        }, 250);
      };

      return rec;
    };

    const setUI = (on) => {
      btnEl.classList.toggle('recording', on);
      btnEl.setAttribute('aria-pressed', on ? 'true' : 'false');
      btnEl.title = on ? 'Recording… click to stop' : 'Voice-to-text — click to dictate in Persian (فارسی)';
      if (wrapper) wrapper.classList.toggle('listening', on);
    };

    btnEl.addEventListener('click', () => {
      if (listening) {
        hardStop();
        return;
      }

      // Single active stream: silently stop any other field's session first
      if (activeDictationStop && activeDictationStop !== hardStop) {
        activeDictationStop();
      }

      recognition = buildRecognition();
      baseText = textareaEl.value;
      finalText = '';
      interimText = '';
      listening = true;
      activeDictationStop = hardStop;
      setUI(true);

      try {
        recognition.start();
        showToast('Listening… speak in Persian (fa-IR). Click the mic again to stop.', 'info');
      } catch (e) {
        listening = false;
        setUI(false);
        showToast('Could not start voice recognition: ' + e.message, 'error');
      }
    });
  }

  // --- INPUT ENHANCERS (Persian cleanup, digit unification, time clamping) ---
  function setupInputEnhancers() {
    // Persian-aware text fields: normalize ی/ك + auto ZWNJ join on blur
    [elements.setupAccount, elements.setupChallenge,
     elements.notesTechnical, elements.notesSentimental].forEach(el => {
      if (!el) return;
      el.addEventListener('blur', () => {
        const fixed = fixPersianZWNJ(el.value);
        if (fixed !== el.value) {
          el.value = fixed;
          el.classList.add('zwnj-flash');
          setTimeout(() => el.classList.remove('zwnj-flash'), 900);
        }
      });
    });

    // Numeric/code fields: unify Persian digits → ASCII; canonicalize date codes
    [elements.setupOrderNum, elements.setupExcelNum,
     elements.tradeOrderNumEdit, elements.tradeExcelNum,
     elements.tradeSize, elements.tradeEntry, elements.tradeExit,
     elements.tradeStop, elements.tradeTp].forEach(el => {
      if (!el) return;
      el.addEventListener('blur', () => {
        const v = toEnglishDigits(el.value).trim();
        if (v !== el.value) el.value = v;
        if (el === elements.setupOrderNum || el === elements.tradeOrderNumEdit) {
          const canon = canonicalizeDateCodeInput(el.value);
          if (canon !== el.value) el.value = canon;
        }
      });
    });

    // Dual execution-time boxes: digits only, clamp HH ≤ 23 / MM ≤ 59
    const timePairs = [
      [elements.timeEntryBrokerHH, elements.timeEntryBrokerMM],
      [elements.timeExitBrokerHH, elements.timeExitBrokerMM],
      [elements.timeEntryTehranHH, elements.timeEntryTehranMM],
      [elements.timeExitTehranHH, elements.timeExitTehranMM]
    ];
    timePairs.forEach(([hh, mm]) => {
      [[hh, 23], [mm, 59]].forEach(([el, max]) => {
        if (!el) return;
        el.addEventListener('input', () => {
          const digits = toEnglishDigits(el.value).replace(/\D/g, '').slice(0, 2);
          if (digits !== el.value) el.value = digits;
        });
        el.addEventListener('blur', () => {
          if (!el.value) return;
          let n = parseInt(el.value, 10) || 0;
          if (n > max) n = max;
          el.value = pad2(n);
        });
      });
    });

    // Enter key submits Screen 1 setup
    [elements.setupAccount, elements.setupChallenge,
     elements.setupOrderNum, elements.setupExcelNum].forEach(el => {
      if (!el) return;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleScreen1Continue();
      });
    });
  }

  // --- INITIALIZATION ---
  function init() {
    loadStateFromStorage();
    setDefaultDate();
    setupInputEnhancers();
    setupEventListeners();
    setupSpeechDictation(elements.notesTechnical, elements.micTechnical);
    setupSpeechDictation(elements.notesSentimental, elements.micSentimental);
    updateHistoryBadge();
    checkSequentialSuggestion();
  }

  // --- DUAL TIME BOX HELPERS ---
  function getTimeVal(hhEl, mmEl) {
    if (!hhEl || !mmEl) return '--:--';
    const hh = hhEl.value.trim();
    const mm = mmEl.value.trim();
    if (!hh && !mm) return '--:--';
    const hhFormatted = hh ? hh.padStart(2, '0') : '00';
    const mmFormatted = mm ? mm.padStart(2, '0') : '00';
    return `${hhFormatted}:${mmFormatted}`;
  }

  function setTimeVal(hhEl, mmEl, valStr) {
    if (!hhEl || !mmEl) return;
    if (!valStr || valStr === '--:--') {
      hhEl.value = '';
      mmEl.value = '';
      return;
    }
    const parts = valStr.split(':');
    hhEl.value = parts[0] || '';
    mmEl.value = parts[1] || '';
  }

  // --- STORAGE DATA LOAD/SAVE (DUAL LOCALSTORAGE + INDEXEDDB LAYER) ---
  async function loadStateFromStorage() {
    try {
      const storedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      state.accounts = storedAccounts ? JSON.parse(storedAccounts) : ['Demo-25K', 'Prop-Main'];

      const storedChallenges = localStorage.getItem(STORAGE_KEY_CHALLENGES);
      state.challenges = storedChallenges ? JSON.parse(storedChallenges) : ['Challenge 1', 'Challenge 2', 'Phase 1', 'Funded'];
      if (!state.challenges.includes('Challenge 2')) state.challenges.push('Challenge 2');
      
      const loadedSymbols = JSON.parse(localStorage.getItem(STORAGE_KEY_SYMBOLS));
      if (loadedSymbols && Array.isArray(loadedSymbols) && loadedSymbols.length > 0) {
        state.symbols = loadedSymbols;
        DEFAULT_SYMBOLS.forEach(sym => {
          if (!state.symbols.includes(sym)) state.symbols.push(sym);
        });
      } else {
        state.symbols = [...DEFAULT_SYMBOLS];
      }

      state.positions = JSON.parse(localStorage.getItem(STORAGE_KEY_POSITIONS)) || {};

      const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (rawHistory === null) {
        // Initial first visit: start with an empty history
        state.history = [...DEFAULT_HISTORY];
        saveStateToStorage();
      } else {
        state.history = JSON.parse(rawHistory) || [];
      }

      // Check IndexedDB in background to see if higher fidelity (with images) or additional saved records exist
      const idbHistory = await loadHistoryFromIndexedDB();
      if (idbHistory && Array.isArray(idbHistory) && idbHistory.length > 0) {
        if (idbHistory.length >= state.history.length) {
          state.history = idbHistory;
        } else {
          // If in-memory/localStorage has more, sync them into IndexedDB
          saveHistoryToIndexedDB(state.history);
        }
      } else if (state.history.length > 0) {
        saveHistoryToIndexedDB(state.history);
      }

    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      state.symbols = [...DEFAULT_SYMBOLS];
      if (!state.history || state.history.length === 0) {
        state.history = [...DEFAULT_HISTORY];
      }
    }
    if (Array.isArray(state.history)) {
      state.history.sort(sortPositionsDescending);
    }
    updateHistoryBadge();
    checkSequentialSuggestion();
  }

  function saveStateToStorage() {
    try {
      if (Array.isArray(state.history)) {
        state.history.sort(sortPositionsDescending);
      }
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(state.accounts));
      localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(state.challenges));
      localStorage.setItem(STORAGE_KEY_SYMBOLS, JSON.stringify(state.symbols));
      localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(state.positions));

      // Attempt to save state.history to localStorage with intelligent quota-overflow fallback
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
      } catch (quotaError) {
        console.warn('LocalStorage quota limit reached. Saving lightweight records to localStorage...', quotaError);
        // Fallback: strip heavy imageDataUrl on older records in localStorage while keeping full data in memory & IndexedDB
        const lightHistory = state.history.map((item, idx) => {
          if (idx > 1 && item.imageDataUrl) {
            return { ...item, imageDataUrl: '' };
          }
          return item;
        });
        try {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(lightHistory));
        } catch (secondErr) {
          // Keep all trade metadata, strip all base64 images from localStorage copy
          const minimalHistory = state.history.map(item => ({ ...item, imageDataUrl: '' }));
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(minimalHistory));
        }
      }

      updateHistoryBadge();
      // Always save full data (including screenshots) to IndexedDB
      saveHistoryToIndexedDB(state.history);
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
      showToast('Storage warning: could not save to localStorage.', 'error');
    }
  }

  function updateHistoryBadge() {
    if (elements.historyBadge) {
      elements.historyBadge.textContent = state.history.length;
    }
  }

  function setDefaultDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    if (elements.tradeDate) {
      elements.tradeDate.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  // --- EVENT LISTENERS SETUP ---
  function setupEventListeners() {
    // Navigation & Screen switching
    elements.btnNewTrade.addEventListener('click', resetToScreen1);
    elements.btnEditSetup.addEventListener('click', () => {
      checkSequentialSuggestion();
      switchScreen(1);
    });
    elements.btnScreen1Continue.addEventListener('click', handleScreen1Continue);

    // Screen 1 Comboboxes
    elements.setupAccount.addEventListener('input', () => {
      renderDropdown(elements.accountDropdown, state.accounts, elements.setupAccount, val => {
        elements.setupAccount.value = val;
        checkSequentialSuggestion();
      });
      checkSequentialSuggestion();
    });
    elements.setupAccount.addEventListener('focus', () => {
      renderDropdown(elements.accountDropdown, state.accounts, elements.setupAccount, val => {
        elements.setupAccount.value = val;
        checkSequentialSuggestion();
      });
    });

    elements.setupChallenge.addEventListener('input', () => {
      renderDropdown(elements.challengeDropdown, state.challenges, elements.setupChallenge, val => {
        elements.setupChallenge.value = val;
        checkSequentialSuggestion();
      });
      checkSequentialSuggestion();
    });
    elements.setupChallenge.addEventListener('focus', () => {
      renderDropdown(elements.challengeDropdown, state.challenges, elements.setupChallenge, val => {
        elements.setupChallenge.value = val;
        checkSequentialSuggestion();
      });
    });

    // Screen 2 Interactive Symbol Select / Combobox
    elements.tradeSymbol.addEventListener('input', () => {
      renderDropdown(elements.symbolDropdown, state.symbols, elements.tradeSymbol, val => {
        elements.tradeSymbol.value = val;
      });
    });
    elements.tradeSymbol.addEventListener('focus', () => {
      renderDropdown(elements.symbolDropdown, state.symbols, elements.tradeSymbol, val => {
        elements.tradeSymbol.value = val;
      });
    });

    document.addEventListener('click', (e) => {
      if (!elements.setupAccount.contains(e.target) && !elements.accountDropdown.contains(e.target)) {
        elements.accountDropdown.classList.add('hidden');
      }
      if (!elements.setupChallenge.contains(e.target) && !elements.challengeDropdown.contains(e.target)) {
        elements.challengeDropdown.classList.add('hidden');
      }
      if (!elements.tradeSymbol.contains(e.target) && !elements.symbolDropdown.contains(e.target)) {
        elements.symbolDropdown.classList.add('hidden');
      }
    });

    elements.btnAcceptSuggestion.addEventListener('click', () => {
      const suggested = elements.suggestedNumText.textContent;
      if (suggested) {
        elements.setupOrderNum.value = suggested;
        elements.setupOrderNum.focus();
        checkSequentialSuggestion();
      }
    });

    // Settings Modal Events
    elements.btnOpenSettings.addEventListener('click', openSettingsModal);
    elements.btnCloseSettingsModal.addEventListener('click', () => closeModal(elements.modalAppSettings));
    elements.btnAddAccount.addEventListener('click', handleAddAccount);
    elements.btnAddChallenge.addEventListener('click', handleAddChallenge);
    elements.btnAddSymbol.addEventListener('click', handleAddSymbol);

    // 6-Tip Checklist Listener (with Grey Background Toggle)
    elements.checklistCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateChecklistCounter();
        const parent = cb.closest('.checklist-item');
        if (parent) {
          if (cb.checked) {
            parent.classList.add('checked');
          } else {
            parent.classList.remove('checked');
          }
        }
      });
    });

    // R-Multiple Pills Selector
    elements.rMultipleSelector.querySelectorAll('.r-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        elements.rMultipleSelector.querySelectorAll('.r-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.currentTrade.selectedR = pill.getAttribute('data-val');
      });
    });

    // Image Upload Handlers
    elements.imageDropzone.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', handleImageFileSelect);
    elements.btnRemoveImage.addEventListener('click', (e) => {
      e.stopPropagation();
      removeUploadedImage();
    });
    elements.imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.imageDropzone.classList.add('hover');
    });
    elements.imageDropzone.addEventListener('dragleave', () => elements.imageDropzone.classList.remove('hover'));
    elements.imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.imageDropzone.classList.remove('hover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });

    // Generate PDF Button
    elements.btnGeneratePdf.addEventListener('click', handleGeneratePdf);

    // Modal Action Buttons
    elements.btnClosePdfModal.addEventListener('click', () => {
      closeModal(elements.modalPdfPreview);
      if (elements.driveNoticeBanner) elements.driveNoticeBanner.classList.add('hidden');
    });
    elements.btnDownloadPdf.addEventListener('click', downloadGeneratedPdf);
    elements.btnPrintPdf.addEventListener('click', printPdf);
    elements.btnDrivePdf.addEventListener('click', saveToGoogleDrive);
    elements.btnSharePdf.addEventListener('click', sharePdf);

    elements.btnOpenHistory.addEventListener('click', openHistoryModal);
    elements.btnCloseHistoryModal.addEventListener('click', () => closeModal(elements.modalTradeHistory));
    elements.historySearch.addEventListener('input', renderHistoryList);
    elements.btnClearHistory.addEventListener('click', handleClearHistory);
  }

  // --- SETTINGS MODAL LOGIC ---
  function openSettingsModal() {
    renderSettingsLists();
    openModal(elements.modalAppSettings);
  }

  function renderSettingsLists() {
    // Accounts List
    elements.accountsList.innerHTML = '';
    state.accounts.forEach((acc, idx) => {
      const row = document.createElement('div');
      row.className = 'settings-item-row';
      row.innerHTML = `
        <span>${escapeHtml(acc)}</span>
        <button class="btn btn-danger btn-xs">&times;</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        state.accounts.splice(idx, 1);
        saveStateToStorage();
        renderSettingsLists();
      });
      elements.accountsList.appendChild(row);
    });

    // Challenges List
    elements.challengesList.innerHTML = '';
    state.challenges.forEach((cha, idx) => {
      const row = document.createElement('div');
      row.className = 'settings-item-row';
      row.innerHTML = `
        <span>${escapeHtml(cha)}</span>
        <button class="btn btn-danger btn-xs">&times;</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        state.challenges.splice(idx, 1);
        saveStateToStorage();
        renderSettingsLists();
      });
      elements.challengesList.appendChild(row);
    });

    // Symbols List
    elements.symbolsList.innerHTML = '';
    state.symbols.forEach((sym, idx) => {
      const row = document.createElement('div');
      row.className = 'settings-item-row';
      row.innerHTML = `
        <span>${escapeHtml(sym)}</span>
        <button class="btn btn-danger btn-xs">&times;</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        state.symbols.splice(idx, 1);
        saveStateToStorage();
        renderSettingsLists();
      });
      elements.symbolsList.appendChild(row);
    });
  }

  function handleAddAccount() {
    const name = elements.newAccountInput.value.trim();
    if (!name) return;
    if (!state.accounts.includes(name)) {
      state.accounts.push(name);
      saveStateToStorage();
    }
    elements.newAccountInput.value = '';
    renderSettingsLists();
  }

  function handleAddChallenge() {
    const name = elements.newChallengeInput.value.trim();
    if (!name) return;
    if (!state.challenges.includes(name)) {
      state.challenges.push(name);
      saveStateToStorage();
    }
    elements.newChallengeInput.value = '';
    renderSettingsLists();
  }

  function handleAddSymbol() {
    const name = elements.newSymbolInput.value.trim().toUpperCase();
    if (!name) return;
    if (!state.symbols.includes(name)) {
      state.symbols.push(name);
      saveStateToStorage();
    }
    elements.newSymbolInput.value = '';
    renderSettingsLists();
  }

  // --- SCREEN 1 & SMART POSITION-CODE SUGGESTION (DATE-BASED) ---
  function checkSequentialSuggestion() {
    const acc = elements.setupAccount.value.trim();
    const cha = elements.setupChallenge.value.trim();

    if (!acc || !cha) {
      elements.seqSuggestionBadge.classList.add('hidden');
      return;
    }

    const normAcc = fixPersianZWNJ(acc).toLowerCase();
    const normCha = fixPersianZWNJ(cha).toLowerCase();

    // Matching trades in history for this Account/Challenge
    const matchingTrades = (state.history || []).filter(h =>
      String(h.account || '').trim().toLowerCase() === normAcc &&
      String(h.challenge || '').trim().toLowerCase() === normCha
    );

    const posKey = `${acc}|${cha}`;
    const altPosKey = `${fixPersianZWNJ(acc)}|${fixPersianZWNJ(cha)}`;
    let lastCode = null;
    if (matchingTrades.length > 0 && matchingTrades[0].orderNum) {
      lastCode = matchingTrades[0].orderNum;
    } else if (state.positions[posKey]) {
      lastCode = state.positions[posKey];
    } else if (state.positions[altPosKey]) {
      lastCode = state.positions[altPosKey];
    }

    const suggestion = getSmartNextPositionCode(lastCode, matchingTrades);

    if (!suggestion) {
      elements.seqSuggestionBadge.classList.add('hidden');
      return;
    }

    elements.suggestedNumText.textContent = suggestion;
    elements.seqSuggestionBadge.classList.remove('hidden');

    // Auto pre-fill the field while it is still untouched (user edits always win)
    if (!elements.setupOrderNum.value.trim()) {
      elements.setupOrderNum.value = suggestion;
    }

    // Auto-suggest Excel number if empty
    if (elements.setupExcelNum && !elements.setupExcelNum.value.trim()) {
      let maxExcel = 0;
      matchingTrades.forEach(h => {
        const en = toEnglishDigits(String(h.excelNum || '')).trim();
        if (/^\d+$/.test(en)) {
          const num = parseInt(en, 10);
          if (num > maxExcel) maxExcel = num;
        }
      });
      if (maxExcel > 0) {
        elements.setupExcelNum.value = String(maxExcel + 1);
      }
    }
  }

  function renderDropdown(dropdownEl, items, inputEl, onSelect) {
    const filterText = inputEl.value.trim().toLowerCase();
    const filtered = items.filter(item => item.toLowerCase().includes(filterText));

    dropdownEl.innerHTML = '';

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'combobox-item empty';
      emptyDiv.textContent = `New entry: "${inputEl.value.trim()}"`;
      dropdownEl.appendChild(emptyDiv);
    } else {
      filtered.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'combobox-item';
        itemDiv.textContent = item;
        itemDiv.addEventListener('click', () => {
          onSelect(item);
          dropdownEl.classList.add('hidden');
        });
        dropdownEl.appendChild(itemDiv);
      });
    }

    dropdownEl.classList.remove('hidden');
  }

  function handleScreen1Continue() {
    const account = fixPersianZWNJ(elements.setupAccount.value).trim();
    const challenge = fixPersianZWNJ(elements.setupChallenge.value).trim();
    const orderNum = canonicalizeDateCodeInput(toEnglishDigits(elements.setupOrderNum.value).trim());
    const excelNum = elements.setupExcelNum ? toEnglishDigits(elements.setupExcelNum.value).trim() : '';

    const missingFields = [];
    if (!account) { missingFields.push('Account'); flagInvalid(elements.setupAccount); }
    if (!challenge) { missingFields.push('Challenge'); flagInvalid(elements.setupChallenge); }
    if (!orderNum) { missingFields.push('Position Code'); flagInvalid(elements.setupOrderNum); }

    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    elements.setupAccount.value = account;
    elements.setupChallenge.value = challenge;
    elements.setupOrderNum.value = orderNum;

    if (!state.accounts.includes(account)) state.accounts.push(account);
    if (!state.challenges.includes(challenge)) state.challenges.push(challenge);
    saveStateToStorage();

    state.currentSetup = { account, challenge, orderNum, excelNum };

    elements.summaryAccount.textContent = account;
    elements.summaryChallenge.textContent = challenge;
    elements.summaryOrderNum.textContent = orderNum;
    elements.tradeOrderNumEdit.value = orderNum;
    if (elements.tradeExcelNum) elements.tradeExcelNum.value = excelNum;

    switchScreen(2);
  }

  function switchScreen(screenNum) {
    if (screenNum === 1) {
      elements.screen1.classList.add('active');
      elements.screen2.classList.remove('active');
    } else {
      elements.screen1.classList.remove('active');
      elements.screen2.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function resetToScreen1() {
    state.editingId = null;
    elements.setupAccount.value = '';
    elements.setupChallenge.value = '';
    elements.setupOrderNum.value = '';
    if (elements.setupExcelNum) elements.setupExcelNum.value = '';
    if (elements.tradeExcelNum) elements.tradeExcelNum.value = '';
    elements.seqSuggestionBadge.classList.add('hidden');
    
    elements.tradeSymbol.value = '';
    elements.tradeSession.value = 'London';
    elements.tradeDirection.value = 'LONG';
    elements.tradeSize.value = '';
    elements.tradeEntry.value = '';
    elements.tradeExit.value = '';
    elements.tradeStop.value = '';
    elements.tradeTp.value = '';

    setTimeVal(elements.timeEntryBrokerHH, elements.timeEntryBrokerMM, '');
    setTimeVal(elements.timeExitBrokerHH, elements.timeExitBrokerMM, '');
    setTimeVal(elements.timeEntryTehranHH, elements.timeEntryTehranMM, '');
    setTimeVal(elements.timeExitTehranHH, elements.timeExitTehranMM, '');

    elements.notesTechnical.value = '';
    elements.notesSentimental.value = '';
    removeUploadedImage();
    elements.checklistCheckboxes.forEach(cb => {
      cb.checked = false;
      const parent = cb.closest('.checklist-item');
      if (parent) parent.classList.remove('checked');
    });
    updateChecklistCounter();
    elements.tradeZoomAdded.checked = false;
    elements.tradeExcelAdded.checked = false;
    
    elements.rMultipleSelector.querySelectorAll('.r-pill').forEach(p => p.classList.remove('active'));
    const freePill = elements.rMultipleSelector.querySelector('.r-pill[data-val="FREE"]');
    if (freePill) freePill.classList.add('active');
    state.currentTrade.selectedR = 'FREE';

    if (elements.driveNoticeBanner) elements.driveNoticeBanner.classList.add('hidden');

    setDefaultDate();
    checkSequentialSuggestion();
    switchScreen(1);
  }

  // --- 6-TIP CHECKLIST LOGIC ---
  function updateChecklistCounter() {
    const checkedCount = elements.checklistCheckboxes.filter(cb => cb.checked).length;
    elements.checklistScore.textContent = checkedCount;

    if (elements.checklistScore.parentElement) {
      elements.checklistScore.parentElement.classList.toggle('all-done', checkedCount === 6);
    }

    if (checkedCount < 6) {
      elements.checklistWarningBanner.classList.remove('hidden');
    } else {
      elements.checklistWarningBanner.classList.add('hidden');
    }
  }

  // --- IMAGE UPLOAD LOGIC WITH AUTO-COMPRESSION ---
  function handleImageFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  }

  function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          state.currentTrade.imageDataUrl = compressed;
          elements.uploadPreviewImg.src = compressed;
        } catch (canvasErr) {
          state.currentTrade.imageDataUrl = rawDataUrl;
          elements.uploadPreviewImg.src = rawDataUrl;
        }
        elements.uploadPlaceholder.classList.add('hidden');
        elements.uploadPreviewWrapper.classList.remove('hidden');
      };
      img.onerror = () => {
        state.currentTrade.imageDataUrl = rawDataUrl;
        elements.uploadPreviewImg.src = rawDataUrl;
        elements.uploadPlaceholder.classList.add('hidden');
        elements.uploadPreviewWrapper.classList.remove('hidden');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  }

  function removeUploadedImage() {
    state.currentTrade.imageDataUrl = null;
    elements.uploadPreviewImg.src = '';
    elements.imageInput.value = '';
    elements.uploadPreviewWrapper.classList.add('hidden');
    elements.uploadPlaceholder.classList.remove('hidden');
  }

  // --- GENERATE PDF & SAVE/UPDATE HISTORY POSITION ---
  function handleGeneratePdf() {
    const symbol = elements.tradeSymbol.value.trim().toUpperCase();
    const session = elements.tradeSession.value;
    const direction = elements.tradeDirection.value || 'LONG';
    const orderNum = canonicalizeDateCodeInput(toEnglishDigits(elements.tradeOrderNumEdit.value).trim());
    const excelNum = elements.tradeExcelNum ? toEnglishDigits(elements.tradeExcelNum.value).trim() : (state.currentSetup.excelNum || '');
    const date = elements.tradeDate.value.trim();
    const size = toEnglishDigits(elements.tradeSize.value).trim();
    const entry = toEnglishDigits(elements.tradeEntry.value).trim();
    const exit = toEnglishDigits(elements.tradeExit.value).trim();
    const stop = toEnglishDigits(elements.tradeStop.value).trim();
    const tp = toEnglishDigits(elements.tradeTp.value).trim();

    const requiredFields = [
      [symbol, elements.tradeSymbol, 'Symbol'],
      [orderNum, elements.tradeOrderNumEdit, 'Order Number'],
      [date, elements.tradeDate, 'Date'],
      [size, elements.tradeSize, 'Position Size'],
      [entry, elements.tradeEntry, 'Entry Price'],
      [exit, elements.tradeExit, 'Exit Price'],
      [stop, elements.tradeStop, 'Stop Loss'],
      [tp, elements.tradeTp, 'Take Profit']
    ];
    const missingFields = requiredFields
      .filter(([val]) => !val)
      .map(([, , name]) => name);
    if (missingFields.length > 0) {
      requiredFields.forEach(([val, el]) => { if (!val) flagInvalid(el); });
      showToast(`Missing position details: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (!state.symbols.includes(symbol)) {
      state.symbols.push(symbol);
    }

    const account = fixPersianZWNJ(state.currentSetup.account || elements.summaryAccount.textContent || '');
    const challenge = fixPersianZWNJ(state.currentSetup.challenge || elements.summaryChallenge.textContent || '');

    const tradeData = {
      id: state.editingId ? state.editingId : `trade_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      account,
      challenge,
      orderNum,
      excelNum,
      date,
      symbol,
      session,
      direction,
      size,
      entry,
      exit,
      stop,
      tp,
      entryTimeBroker: getTimeVal(elements.timeEntryBrokerHH, elements.timeEntryBrokerMM),
      exitTimeBroker: getTimeVal(elements.timeExitBrokerHH, elements.timeExitBrokerMM),
      entryTimeTehran: getTimeVal(elements.timeEntryTehranHH, elements.timeEntryTehranMM),
      exitTimeTehran: getTimeVal(elements.timeExitTehranHH, elements.timeExitTehranMM),
      checklist: elements.checklistCheckboxes.map(cb => cb.checked),
      checklistScore: elements.checklistCheckboxes.filter(cb => cb.checked).length,
      resultR: state.currentTrade.selectedR,
      notesTechnical: fixPersianZWNJ(elements.notesTechnical.value.trim()),
      notesSentimental: fixPersianZWNJ(elements.notesSentimental.value.trim()),
      imageDataUrl: state.currentTrade.imageDataUrl || '',
      tradeZoomAdded: elements.tradeZoomAdded.checked,
      excelAdded: elements.tradeExcelAdded.checked
    };

    const posKey = `${account}|${challenge}`;
    state.positions[posKey] = orderNum;

    if (state.editingId) {
      const idx = state.history.findIndex(h => h.id === state.editingId);
      if (idx !== -1) {
        state.history[idx] = tradeData;
      } else {
        state.history.unshift(tradeData);
      }
      showToast(`Position #${orderNum} updated.`, 'success');
    } else {
      const existingIdx = state.history.findIndex(h =>
        String(h.account || '').trim().toLowerCase() === account.trim().toLowerCase() &&
        String(h.challenge || '').trim().toLowerCase() === challenge.trim().toLowerCase() &&
        String(h.orderNum || '').trim().toLowerCase() === String(orderNum).trim().toLowerCase()
      );
      if (existingIdx !== -1) {
        state.history[existingIdx] = tradeData;
        showToast(`Existing Position #${orderNum} updated in history.`, 'info');
      } else {
        state.history.unshift(tradeData);
        showToast(`Position #${orderNum} saved to history!`, 'success');
      }
    }
    state.editingId = null;

    saveStateToStorage();
    renderPdfTemplate(tradeData);

    if (elements.driveNoticeBanner) elements.driveNoticeBanner.classList.add('hidden');
    openModal(elements.modalPdfPreview);
    compilePdfBlob(tradeData);
  }

  // --- EDIT POSITION FROM HISTORY FEATURE ---
  function editPositionFromHistory(item) {
    state.editingId = item.id;
    state.currentSetup = {
      account: item.account,
      challenge: item.challenge,
      orderNum: item.orderNum,
      excelNum: item.excelNum || ''
    };

    elements.setupAccount.value = item.account;
    elements.setupChallenge.value = item.challenge;
    elements.setupOrderNum.value = item.orderNum;
    if (elements.setupExcelNum) elements.setupExcelNum.value = item.excelNum || '';
    if (elements.tradeExcelNum) elements.tradeExcelNum.value = item.excelNum || '';

    elements.summaryAccount.textContent = item.account;
    elements.summaryChallenge.textContent = item.challenge;
    elements.summaryOrderNum.textContent = item.orderNum;
    elements.tradeOrderNumEdit.value = item.orderNum;

    elements.tradeSymbol.value = item.symbol || '';
    elements.tradeSession.value = item.session || 'London';
    elements.tradeDirection.value = item.direction || 'LONG';
    elements.tradeDate.value = item.date || new Date().toISOString().split('T')[0];
    elements.tradeSize.value = item.size || '';
    elements.tradeEntry.value = item.entry || '';
    elements.tradeExit.value = item.exit || '';
    elements.tradeStop.value = item.stop || '';
    elements.tradeTp.value = item.tp || '';

    setTimeVal(elements.timeEntryBrokerHH, elements.timeEntryBrokerMM, item.entryTimeBroker);
    setTimeVal(elements.timeExitBrokerHH, elements.timeExitBrokerMM, item.exitTimeBroker);
    setTimeVal(elements.timeEntryTehranHH, elements.timeEntryTehranMM, item.entryTimeTehran);
    setTimeVal(elements.timeExitTehranHH, elements.timeExitTehranMM, item.exitTimeTehran);

    elements.notesTechnical.value = item.notesTechnical || '';
    elements.notesSentimental.value = item.notesSentimental || '';

    if (item.checklist && Array.isArray(item.checklist)) {
      elements.checklistCheckboxes.forEach((cb, idx) => {
        cb.checked = !!item.checklist[idx];
        const parent = cb.closest('.checklist-item');
        if (parent) {
          if (cb.checked) {
            parent.classList.add('checked');
          } else {
            parent.classList.remove('checked');
          }
        }
      });
      updateChecklistCounter();
    }

    if (item.resultR) {
      const rVal = item.resultR === 'NEUTRAL' ? 'FREE' : item.resultR;
      state.currentTrade.selectedR = rVal;
      elements.rMultipleSelector.querySelectorAll('.r-pill').forEach(p => {
        if (p.getAttribute('data-val') === rVal) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }

    if (item.imageDataUrl) {
      state.currentTrade.imageDataUrl = item.imageDataUrl;
      elements.uploadPreviewImg.src = item.imageDataUrl;
      elements.uploadPlaceholder.classList.add('hidden');
      elements.uploadPreviewWrapper.classList.remove('hidden');
    } else {
      removeUploadedImage();
    }

    elements.tradeZoomAdded.checked = !!item.tradeZoomAdded;
    elements.tradeExcelAdded.checked = !!item.excelAdded;

    closeModal(elements.modalTradeHistory);
    switchScreen(2);
  }

  // --- RENDER 2-PAGE A5 GRAYSCALE HTML TEMPLATE ---
  function renderPdfTemplate(data) {
    const cleanOrderNum = sanitizeName(data.orderNum) || 'Position_Receipt';
    const filename = `${cleanOrderNum}.pdf`;
    state.generatedPdfFilename = filename;

    // BUILD PAGE 1 (POSITION RECEIPT COVER PAGE)
    const page1Html = `
      <div class="pdf-page-container" id="pdf-page-1">
        <svg class="cover-bg-svg" viewBox="0 0 800 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cover-dot-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#71717a" opacity="0.32" />
            </pattern>
          </defs>

          <!-- NATIVE SVG DOT GRID PATTERN (GUARANTEED 100% HTML2CANVAS & PDF RENDER) -->
          <rect width="800" height="500" fill="url(#cover-dot-pattern)" />

          <!-- BACKGROUND DOTTED & DASHED TREND LINES -->
          <path d="M 0,220 L 100,180 L 180,210 L 260,150 L 360,170 L 460,110 L 560,130 L 660,70 L 760,90 L 800,40" fill="none" stroke="rgba(113, 113, 122, 0.35)" stroke-width="1.3" stroke-dasharray="4,4"/>
          <path d="M 0,380 L 120,340 L 200,360 L 300,300 L 400,320 L 520,240 L 620,270 L 720,180 L 800,130" fill="none" stroke="rgba(161, 161, 170, 0.35)" stroke-width="1.3" stroke-dasharray="4,4"/>

          <rect x="620" y="110" width="12" height="35" fill="rgba(212, 212, 216, 0.2)" />
          <line x1="626" y1="95" x2="626" y2="160" stroke="rgba(161, 161, 170, 0.35)" stroke-width="1" stroke-dasharray="2,2"/>

          <rect x="680" y="80" width="12" height="40" fill="rgba(212, 212, 216, 0.2)" />
          <line x1="686" y1="65" x2="686" y2="135" stroke="rgba(161, 161, 170, 0.35)" stroke-width="1" stroke-dasharray="2,2"/>

          <rect x="740" y="45" width="12" height="45" fill="rgba(212, 212, 216, 0.2)" />
          <line x1="746" y1="30" x2="746" y2="100" stroke="rgba(161, 161, 170, 0.35)" stroke-width="1" stroke-dasharray="2,2"/>

          <path d="M 0,260 L 50,265 L 100,240 L 165,245 L 230,190 L 300,205 L 350,180 L 420,185 L 485,145 L 550,155 L 620,105 L 685,120 L 740,65 L 800,20" fill="none" stroke="rgba(113, 113, 122, 0.28)" stroke-width="1.3"/>
          <path d="M 0,335 L 50,330 L 100,310 L 165,315 L 230,260 L 300,275 L 350,240 L 420,245 L 485,205 L 550,215 L 620,165 L 685,180 L 740,125 L 800,80" fill="none" stroke="rgba(113, 113, 122, 0.28)" stroke-width="1.3"/>

          <line x1="20" y1="290" x2="20" y2="330" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="16" y="300" width="8" height="20" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="35" y1="285" x2="35" y2="325" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="31" y="292" width="8" height="22" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="50" y1="280" x2="50" y2="320" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="46" y="288" width="8" height="18" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="65" y1="275" x2="65" y2="315" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="61" y="280" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="80" y1="270" x2="80" y2="310" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="76" y="278" width="8" height="20" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="95" y1="260" x2="95" y2="305" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="91" y="268" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="110" y1="255" x2="110" y2="295" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="106" y="262" width="8" height="22" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="125" y1="250" x2="125" y2="290" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="121" y="258" width="8" height="24" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="140" y1="245" x2="140" y2="285" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="136" y="252" width="8" height="22" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="155" y1="240" x2="155" y2="280" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="151" y="246" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="170" y1="230" x2="170" y2="270" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="166" y="238" width="8" height="22" fill="#ffffff" stroke="rgba(161, 161, 170, 0.3)" stroke-width="1"/>

          <line x1="185" y1="225" x2="185" y2="265" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="181" y="232" width="8" height="24" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="200" y1="220" x2="200" y2="260" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="196" y="226" width="8" height="25" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="215" y1="210" x2="215" y2="250" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="211" y="218" width="8" height="24" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="230" y1="205" x2="230" y2="245" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="226" y="212" width="8" height="22" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="245" y1="200" x2="245" y2="240" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="241" y="206" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="260" y1="195" x2="260" y2="235" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="256" y="202" width="8" height="22" fill="#ffffff" stroke="rgba(161, 161, 170, 0.3)" stroke-width="1"/>

          <line x1="275" y1="190" x2="275" y2="230" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="271" y="196" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="290" y1="185" x2="290" y2="225" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="286" y="192" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="305" y1="180" x2="305" y2="220" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="301" y="186" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="320" y1="175" x2="320" y2="215" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="316" y="181" width="8" height="23" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="335" y1="170" x2="335" y2="210" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="331" y="176" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="350" y1="165" x2="350" y2="205" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="346" y="170" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="365" y1="160" x2="365" y2="200" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="361" y="165" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="380" y1="155" x2="380" y2="195" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="376" y="160" width="8" height="23" fill="#ffffff" stroke="rgba(161, 161, 170, 0.3)" stroke-width="1"/>

          <line x1="395" y1="150" x2="395" y2="190" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="391" y="155" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="410" y1="145" x2="410" y2="185" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="406" y="150" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="425" y1="140" x2="425" y2="180" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="421" y="145" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="440" y1="130" x2="440" y2="170" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="436" y="136" width="8" height="23" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="455" y1="125" x2="455" y2="165" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="451" y="130" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="470" y1="120" x2="470" y2="160" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="466" y="125" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="485" y1="110" x2="485" y2="155" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="481" y="116" width="8" height="28" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="500" y1="105" x2="500" y2="145" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="496" y="110" width="8" height="23" fill="#ffffff" stroke="rgba(161, 161, 170, 0.3)" stroke-width="1"/>

          <line x1="515" y1="100" x2="515" y2="140" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="511" y="105" width="8" height="25" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="530" y1="95" x2="530" y2="135" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="526" y="100" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="545" y1="90" x2="545" y2="130" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="541" y="95" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="560" y1="80" x2="560" y2="120" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="556" y="86" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="575" y1="75" x2="575" y2="115" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="571" y="80" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="590" y1="70" x2="590" y2="110" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="586" y="75" width="8" height="24" fill="#ffffff" stroke="rgba(161, 161, 170, 0.3)" stroke-width="1"/>

          <line x1="605" y1="60" x2="605" y2="105" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="601" y="66" width="8" height="28" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="620" y1="55" x2="620" y2="95" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="616" y="60" width="8" height="24" fill="rgba(161, 161, 170, 0.25)"/>

          <line x1="635" y1="50" x2="635" y2="90" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="631" y="55" width="8" height="26" fill="rgba(113, 113, 122, 0.25)"/>

          <line x1="650" y1="40" x2="650" y2="85" stroke="rgba(161, 161, 170, 0.3)" stroke-width="0.8"/>
          <rect x="646" y="46" width="8" height="28" fill="rgba(113, 113, 122, 0.25)"/>
        </svg>

        <div class="cover-page-inner">
          <div class="cover-account-block">
            <div class="cover-account-name" dir="auto">${escapeHtml(data.account)}</div>
            <div class="cover-challenge-name" dir="auto">${escapeHtml(data.challenge)}</div>
          </div>

          <div class="cover-order-block">
            <div class="cover-order-number">${escapeHtml(data.orderNum)}</div>
            ${data.excelNum ? `<div class="cover-excel-number">${escapeHtml(data.excelNum)}</div>` : ''}
          </div>

          <div style="height: 15px;"></div>
        </div>
      </div>
    `;

    const activeR = data.resultR === 'NEUTRAL' ? 'FREE' : data.resultR;

    // BUILD PAGE 2 (COMPLETE SINGLE-PAGE TRADE DETAILS)
    const page2Html = `
      <div class="pdf-page-container" id="pdf-page-2">
        <div class="pdf2-header">
          <div>
            <div class="pdf2-brand-title">Position Receipt</div>
            <div class="pdf2-meta-subtitle" dir="auto">
              Account: <strong>${escapeHtml(data.account)}</strong> &nbsp;|&nbsp; 
              Challenge: <strong>${escapeHtml(data.challenge)}</strong>
            </div>
          </div>
          <div class="pdf2-order-box">
            <div class="pdf2-order-label">Order Number</div>
            <div class="pdf2-order-value">${escapeHtml(data.orderNum)}</div>
          </div>
        </div>

        <div class="pdf2-strip">
          <div class="pdf2-strip-item"><label>Symbol:</label> <strong>${escapeHtml(data.symbol)}</strong></div>
          <div class="pdf2-strip-item"><label>Session:</label> <strong>${escapeHtml(data.session)}</strong></div>
          <div class="pdf2-strip-item"><label>Direction:</label> <strong>${escapeHtml(data.direction)}</strong></div>
          <div class="pdf2-strip-item"><label>Date:</label> <strong>${escapeHtml(data.date)}</strong></div>
        </div>

        <div class="pdf2-section">
          <div class="pdf2-section-header">Price Execution & Dual Timing Grid</div>
          <table class="pdf2-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Stop Loss</th>
                <th>TP Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${escapeHtml(data.size)}</strong></td>
                <td><strong>${escapeHtml(data.entry)}</strong></td>
                <td><strong>${escapeHtml(data.exit)}</strong></td>
                <td><strong>${escapeHtml(data.stop)}</strong></td>
                <td><strong>${escapeHtml(data.tp)}</strong></td>
              </tr>
            </tbody>
          </table>
          <table class="pdf2-table" style="border-top: none;">
            <thead>
              <tr>
                <th>Entry Time (Broker)</th>
                <th>Exit Time (Broker)</th>
                <th>Entry Time (Tehran)</th>
                <th>Exit Time (Tehran)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${escapeHtml(data.entryTimeBroker)}</td>
                <td>${escapeHtml(data.exitTimeBroker)}</td>
                <td>${escapeHtml(data.entryTimeTehran)}</td>
                <td>${escapeHtml(data.exitTimeTehran)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pdf2-section">
          <div class="pdf2-section-header" style="display: flex; justify-content: space-between;">
            <span>6-Tip Pre-Trade Discipline Checklist</span>
            <span>Score: ${data.checklistScore} / 6</span>
          </div>
          <div class="pdf2-checklist-grid">
            ${renderPdf2ChecklistItem('Candle Structure', data.checklist[0])}
            ${renderPdf2ChecklistItem('HH/HL – LH/LL', data.checklist[1])}
            ${renderPdf2ChecklistItem('Trend Line Alignment', data.checklist[2])}
            ${renderPdf2ChecklistItem('Stop Loss Placement', data.checklist[3])}
            ${renderPdf2ChecklistItem('Signal Bar & Key Bar Confirm', data.checklist[4])}
            ${renderPdf2ChecklistItem('Time Filter (< 5:30/6:30)', data.checklist[5])}
          </div>
        </div>

        <div class="pdf2-section">
          <div class="pdf2-section-header">Result / R-Multiple Outcome</div>
          <div class="pdf2-r-row">
            ${renderPdf2RPill('-2', activeR)}
            ${renderPdf2RPill('-1', activeR)}
            ${renderPdf2RPill('-0.5', activeR)}
            ${renderPdf2RPill('-0.25', activeR)}
            ${renderPdf2RPill('-0.125', activeR)}
            ${renderPdf2RPill('FREE', activeR)}
            ${renderPdf2RPill('0.125', activeR)}
            ${renderPdf2RPill('0.25', activeR)}
            ${renderPdf2RPill('0.5', activeR)}
            ${renderPdf2RPill('1', activeR)}
            ${renderPdf2RPill('2', activeR)}
          </div>
        </div>

        <div class="pdf2-bottom-grid">
          <div class="pdf2-notes-col">
            <div class="pdf2-section" style="margin-bottom: 3pt; flex: 1;">
              <div class="pdf2-section-header">Technical Analysis Notes</div>
              <div class="pdf2-notes-box" dir="auto">${escapeHtml(data.notesTechnical || '')}</div>
            </div>
            <div class="pdf2-section" style="margin-bottom: 0; flex: 1;">
              <div class="pdf2-section-header">Sentimental Notes</div>
              <div class="pdf2-notes-box" dir="auto">${escapeHtml(data.notesSentimental || '')}</div>
            </div>
          </div>

          <div class="pdf2-right-col">
            <div class="pdf2-section" style="margin-bottom: 2.5pt; flex: 1;">
              <div class="pdf2-section-header">Screenshot</div>
              <div class="pdf2-chart-container">
                ${data.imageDataUrl 
                  ? `<img src="${data.imageDataUrl}" class="pdf2-chart-img" alt="Screenshot">`
                  : `<div class="pdf2-no-chart">[ No Screenshot Attached ]</div>`}
              </div>
            </div>
            
            <div class="pdf2-section" style="margin-bottom: 2.5pt;">
              <div class="pdf2-section-header">Trade Zoom Status</div>
              <div class="pdf2-status-box-content">
                <span class="pdf2-zoom-badge ${data.tradeZoomAdded ? 'added' : 'not-added'}">
                  ${data.tradeZoomAdded ? '✓ ADDED TO TRADE ZOOM' : '[  ] NOT ADDED'}
                </span>
              </div>
            </div>

            <div class="pdf2-section" style="margin-bottom: 0;">
              <div class="pdf2-section-header">Excel Journal Status</div>
              <div class="pdf2-status-box-content">
                <span class="pdf2-excel-badge ${data.excelAdded ? 'added' : 'not-added'}">
                  ${data.excelAdded ? '✓ ADDED TO EXCEL JOURNAL' : '[  ] NOT ADDED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    elements.pdfRenderTemplateWrapper.innerHTML = page1Html + page2Html;
    elements.pdfPreviewContainer.innerHTML = page1Html + page2Html;
  }

  function renderPdf2ChecklistItem(label, isChecked) {
    return `
      <div class="pdf2-check-box ${isChecked ? 'checked' : ''}">
        <div class="pdf2-check-icon">${isChecked ? '✓' : ''}</div>
        <span class="pdf2-check-label">${escapeHtml(label)}</span>
      </div>
    `;
  }

  function renderPdf2RPill(val, selectedVal) {
    const isSelected = val === selectedVal;
    return `
      <div class="pdf2-r-pill ${isSelected ? 'selected' : ''}">
        ${val}
      </div>
    `;
  }

  // ==========================================================================
  // PERSIAN-SAFE HIGH-FIDELITY PDF EXPORT ENGINE (NATIVE BROWSER RENDERER)
  // Ensures 100% pixel-perfect Persian typography with correct HarfBuzz shaping,
  // ZWNJ (نیم‌فاصله), cursive letter joining, BiDi direction, and exact layout.
  // ==========================================================================

  const RECEIPT_EXPORT_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&family=Outfit:wght@600;700;800;900&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');
    
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    :root {
      --font-sans: 'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Geeza Pro', Tahoma, sans-serif;
      --font-mono: 'JetBrains Mono', 'Vazirmatn', 'Courier New', monospace;
      --font-heading: 'Outfit', 'Inter', 'Vazirmatn', sans-serif;
    }

    .pdf-page-container {
      width: 210mm;
      height: 148mm;
      background: #ffffff;
      color: #000000;
      font-family: var(--font-sans);
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    #pdf-page-1 {
      background-color: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10mm 12mm;
    }

    .cover-bg-svg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    .cover-page-inner {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .cover-account-block {
      text-align: left;
      margin-top: 12mm;
    }

    .cover-account-name {
      font-family: var(--font-heading);
      font-size: 26pt;
      font-weight: 900;
      color: #09090b;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .cover-challenge-name {
      font-size: 14pt;
      font-weight: 600;
      color: #52525b;
      margin-top: 4pt;
    }

    .cover-order-block {
      text-align: center;
      align-self: flex-end;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: none;
      padding: 0;
      margin: 0;
    }

    .cover-order-number {
      font-family: var(--font-mono);
      font-size: 76pt;
      font-weight: 800;
      color: #09090b;
      line-height: 0.85;
      letter-spacing: -0.04em;
      text-align: center;
    }

    .cover-excel-number {
      font-family: var(--font-mono);
      font-size: 26pt;
      font-weight: 700;
      color: #09090b;
      line-height: 1;
      letter-spacing: -0.02em;
      margin-top: 38pt;
      text-align: center;
    }

    #pdf-page-2 {
      display: flex;
      flex-direction: column;
      gap: 2.5pt;
      padding: 5mm 6mm 5mm 10mm;
    }

    .pdf2-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1.5pt solid #000;
      padding-bottom: 2pt;
    }

    .pdf2-brand-title {
      font-family: var(--font-heading);
      font-size: 13pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #000;
    }

    .pdf2-meta-subtitle {
      font-size: 8.5pt;
      color: #27272a;
    }

    .pdf2-order-box {
      text-align: right;
    }
    .pdf2-order-label { font-size: 6.5pt; text-transform: uppercase; color: #52525b; font-weight: 700; }
    .pdf2-order-value { font-family: var(--font-mono); font-size: 15pt; font-weight: 800; color: #000; line-height: 1; }

    .pdf2-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f4f4f5;
      border: 1pt solid #18181b;
      padding: 2.5pt 6pt;
      border-radius: 2pt;
      font-size: 8pt;
    }

    .pdf2-section {
      border: 1pt solid #18181b;
      border-radius: 2pt;
      padding: 2pt 4pt;
    }

    .pdf2-section-header {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: #e4e4e7;
      color: #000;
      padding: 1.5pt 4pt;
      margin: -2pt -4pt 2pt -4pt;
      border-bottom: 1pt solid #18181b;
    }

    .pdf2-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
    }

    .pdf2-table th, .pdf2-table td {
      border: 0.75pt solid #27272a;
      padding: 1.5pt 4pt;
      text-align: center;
    }

    .pdf2-table th {
      background: #f4f4f5;
      font-weight: 700;
      font-size: 6.5pt;
      text-transform: uppercase;
    }

    .pdf2-checklist-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2pt 4pt;
    }

    .pdf2-check-box {
      display: flex;
      align-items: center;
      gap: 3pt;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 1.5pt 3pt;
      border-radius: 1.5pt;
      border: 0.75pt solid transparent;
    }

    .pdf2-check-box.checked {
      background: #d4d4d8 !important;
      border-color: #18181b !important;
      color: #000000;
      font-weight: 700;
    }

    .pdf2-check-icon {
      width: 10pt; height: 10pt;
      border: 1pt solid #000;
      display: flex; align-items: center; justify-content: center;
      font-size: 7.5pt; font-weight: 900;
      background: #ffffff;
    }

    .pdf2-check-box.checked .pdf2-check-icon {
      background: #000000;
      color: #ffffff;
    }

    .pdf2-r-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2pt;
    }

    .pdf2-r-pill {
      flex: 1;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 7pt;
      font-weight: 700;
      border: 1pt solid #18181b;
      padding: 1.5pt 0;
      background: #ffffff;
      color: #000000;
    }

    .pdf2-r-pill.selected {
      background: #000000 !important;
      color: #ffffff !important;
      font-weight: 900;
    }

    .pdf2-bottom-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 4pt;
      height: 41mm;
    }

    .pdf2-notes-col {
      display: flex;
      flex-direction: column;
      gap: 2.5pt;
    }

    .pdf2-notes-box {
      font-family: 'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Geeza Pro', Tahoma, sans-serif;
      font-size: 7.2pt;
      line-height: 1.35;
      color: #000000;
      min-height: 10mm;
      max-height: 14mm;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      unicode-bidi: plaintext;
      text-align: start;
    }

    .pdf2-right-col {
      display: flex;
      flex-direction: column;
      gap: 2.5pt;
    }

    .pdf2-chart-container {
      height: 20mm;
      border: 0.75pt dashed #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #fafafa;
    }

    .pdf2-chart-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: grayscale(100%) contrast(1.1);
      -webkit-filter: grayscale(100%) contrast(1.1);
    }

    .pdf2-no-chart {
      font-size: 6.5pt;
      color: #71717a;
      font-style: italic;
    }

    .pdf2-status-box-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1pt 0;
    }

    .pdf2-zoom-badge, .pdf2-excel-badge {
      font-size: 6.8pt;
      font-weight: 800;
      padding: 1pt 5pt;
      border-radius: 1pt;
      border: 1pt solid #000;
    }

    .pdf2-zoom-badge.added, .pdf2-excel-badge.added {
      background: #000;
      color: #fff;
    }

    .pdf2-zoom-badge.not-added, .pdf2-excel-badge.not-added {
      background: #fff;
      color: #52525b;
      border-style: dashed;
    }
  `;

  // Wait for document fonts to finish decoding
  function ensureFontsReady() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready.catch(() => {});
    }
    return Promise.resolve();
  }

  // Pre-render Persian text into Canvas element inside notes box for 100% crisp, shaped typography in html2canvas
  function prepareNotesForHtml2Canvas(containerEl) {
    const notesBoxes = containerEl.querySelectorAll('.pdf2-notes-box');
    const restorations = [];

    notesBoxes.forEach(box => {
      const text = (box.textContent || '').trim();
      if (!text) return;

      const rect = box.getBoundingClientRect();
      const width = box.clientWidth || (rect.width > 0 ? rect.width : 280);
      const height = box.clientHeight || (rect.height > 0 ? rect.height : 50);
      const dpr = 3;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const fontSize = 9.5;
      const lineHeight = 13.5;
      ctx.font = `400 ${fontSize}px 'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Geeza Pro', Tahoma, sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'top';

      const isRtl = /[\u0600-\u06FF]/.test(text);
      ctx.direction = isRtl ? 'rtl' : 'ltr';
      ctx.textAlign = isRtl ? 'right' : 'left';

      const startX = isRtl ? (width - 4) : 4;
      let currentY = 2;

      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        if (currentY + lineHeight > height + 2) break;
        if (!para.trim()) {
          currentY += lineHeight;
          continue;
        }

        const words = para.split(' ');
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine ? (currentLine + ' ' + words[n]) : words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - 8 && n > 0) {
            ctx.fillText(currentLine, startX, currentY);
            currentLine = words[n];
            currentY += lineHeight;
            if (currentY + lineHeight > height + 2) break;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine && currentY + lineHeight <= height + 4) {
          ctx.fillText(currentLine, startX, currentY);
          currentY += lineHeight;
        }
      }

      const origHtml = box.innerHTML;
      box.innerHTML = '';
      box.appendChild(canvas);
      restorations.push(() => {
        box.innerHTML = origHtml;
      });
    });

    return () => {
      restorations.forEach(r => r());
    };
  }

  // Rasterizes a page element into a high-DPI canvas using native browser SVG foreignObject engine
  function rasterizeReceiptPageToCanvas(pageEl, scale = 2.5) {
    return new Promise((resolve, reject) => {
      try {
        if (!pageEl) return reject(new Error('Page element not found'));

        // Standard A5 landscape dimensions in pixels at 96 DPI:
        // 210mm = 793.7008px, 148mm = 559.3701px
        const width = 793.7008;
        const height = 559.3701;

        const cloned = pageEl.cloneNode(true);
        cloned.style.boxShadow = 'none';
        cloned.style.margin = '0';

        const xhtmlWrapper = `
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 210mm; height: 148mm; margin: 0; padding: 0; background: #ffffff; overflow: hidden; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;">
            <style>/* <![CDATA[ */
${RECEIPT_EXPORT_CSS}
/* ]]> */</style>
            ${cloned.outerHTML}
          </div>
        `;

        const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject width="100%" height="100%">
    ${xhtmlWrapper}
  </foreignObject>
</svg>`;

        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
        const image = new Image();
        image.crossOrigin = 'anonymous';

        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            image.onload = null;
            image.onerror = null;
            reject(new Error('Rasterization timed out'));
          }
        }, 10000);

        image.onload = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            const ctx = canvas.getContext('2d', { alpha: false });
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
          } catch (err) {
            reject(err);
          }
        };

        image.onerror = (e) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(new Error('SVG image render error'));
        };

        image.src = svgDataUrl;
      } catch (err) {
        reject(err);
      }
    });
  }

  // --- CORE STRICT 2-PAGE A5 PDF RENDERER (EXACT ORIGINAL LAYOUT WITH PERFECT PERSIAN TYPOGRAPHY) ---
  async function generateStrict2PagePdf(onComplete, onError) {
    try {
      await ensureFontsReady();

      const html2canvasFn = window.html2canvas;
      const wrapper = elements.pdfRenderTemplateWrapper;
      const origLeft = wrapper.style.left;
      const origTop = wrapper.style.top;
      const origZIndex = wrapper.style.zIndex;

      wrapper.style.left = '0px';
      wrapper.style.top = '0px';
      wrapper.style.zIndex = '-9999';

      const page1El = wrapper.querySelector('#pdf-page-1');
      const page2El = wrapper.querySelector('#pdf-page-2');

      if (!page1El || !page2El) {
        wrapper.style.left = origLeft;
        wrapper.style.top = origTop;
        wrapper.style.zIndex = origZIndex;
        throw new Error('Template elements not found');
      }

      if (html2canvasFn) {
        const canvasOptions = {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        };

        // Page 1: exact original html2canvas render (preserves dot pattern, SVG candles, and all styles)
        const canvas1 = await html2canvasFn(page1El, canvasOptions);
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);

        // Page 2: prepare Persian notes onto high-res shaped Canvas before html2canvas capture
        const restoreNotes = prepareNotesForHtml2Canvas(page2El);
        let canvas2;
        try {
          canvas2 = await html2canvasFn(page2El, canvasOptions);
        } finally {
          restoreNotes();
          wrapper.style.left = origLeft;
          wrapper.style.top = origTop;
          wrapper.style.zIndex = origZIndex;
        }
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        const pdf = new jsPDFClass({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5',
          compress: true
        });

        // Page 1: Cover Sheet
        pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');

        // Page 2: Complete Trade Details
        pdf.addPage('a5', 'landscape');
        pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');

        if (onComplete) onComplete(pdf);
        return;
      }

      // Fallback if html2canvas not loaded
      wrapper.style.left = origLeft;
      wrapper.style.top = origTop;
      wrapper.style.zIndex = origZIndex;

      const canvas1 = await rasterizeReceiptPageToCanvas(page1El, 2.5);
      const canvas2 = await rasterizeReceiptPageToCanvas(page2El, 2.5);

      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);

      const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      const pdf = new jsPDFClass({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
        compress: true
      });

      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');
      pdf.addPage('a5', 'landscape');
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');

      if (onComplete) onComplete(pdf);
    } catch (err) {
      console.warn('[PositionReceipt] PDF export error:', err);
      if (onError) onError(err);
    }
  }

  // --- COMPILE PDF BLOB ---
  function compilePdfBlob(data) {
    generateStrict2PagePdf((pdf) => {
      state.generatedPdfBlob = pdf.output('blob');
    }, (err) => {
      console.error('Error generating PDF blob:', err);
    });
  }

  // --- DOWNLOAD GENERATED PDF (STRICT 2-PAGE GUARANTEE) ---
  function downloadGeneratedPdf() {
    const filename = state.generatedPdfFilename || 'Position_Receipt.pdf';
    generateStrict2PagePdf((pdf) => {
      pdf.save(filename);
    }, (err) => {
      console.error('Error downloading PDF:', err);
      window.print();
    });
  }

  // --- SAVE TO GOOGLE DRIVE FEATURE ---
  function saveToGoogleDrive() {
    downloadGeneratedPdf();

    const driveUrl = 'https://drive.google.com/drive/my-drive';
    window.open(driveUrl, '_blank');

    if (elements.driveNoticeBanner) {
      if (elements.driveNoticeText) {
        elements.driveNoticeText.textContent = `✓ Position Receipt PDF downloaded (${state.generatedPdfFilename})! Google Drive is open — drag and drop your receipt into Google Drive.`;
      }
      elements.driveNoticeBanner.classList.remove('hidden');
    }

    if (navigator.share && state.generatedPdfBlob) {
      try {
        const file = new File([state.generatedPdfBlob], state.generatedPdfFilename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'Position Receipt PDF',
            text: `Position Receipt: ${state.generatedPdfFilename}`
          }).catch(err => console.log('Google Drive Native Share closed:', err));
        }
      } catch (e) {
        console.log('Native Share API check:', e);
      }
    }
  }

  function printPdf() {
    window.print();
  }

  function sharePdf() {
    if (navigator.share && state.generatedPdfBlob) {
      try {
        const file = new File([state.generatedPdfBlob], state.generatedPdfFilename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'Position Receipt PDF',
            text: `Position Receipt PDF for ${state.currentSetup.account} Order #${state.currentSetup.orderNum}`
          }).catch(err => console.log('Share canceled:', err));
          return;
        }
      } catch (e) {
        console.log('Share check:', e);
      }
    }
    downloadGeneratedPdf();
  }

  // --- HISTORY MODAL LOGIC WITH EDIT POSITION ACTION ---
  function openHistoryModal() {
    renderHistoryList();
    openModal(elements.modalTradeHistory);
  }

  function renderHistoryList() {
    const filterText = elements.historySearch.value.trim().toLowerCase();
    const container = elements.historyListContainer;
    container.innerHTML = '';

    const filtered = (state.history || []).filter(item => {
      if (!item) return false;
      const acc = String(item.account || '').toLowerCase();
      const cha = String(item.challenge || '').toLowerCase();
      const sym = String(item.symbol || '').toLowerCase();
      const ord = String(item.orderNum || '').toLowerCase();
      const exc = String(item.excelNum || '').toLowerCase();
      const dat = String(item.date || '').toLowerCase();
      return (
        acc.includes(filterText) ||
        cha.includes(filterText) ||
        sym.includes(filterText) ||
        ord.includes(filterText) ||
        exc.includes(filterText) ||
        dat.includes(filterText)
      );
    });

    // Always sort descending: newest/latest position at the very top
    filtered.sort(sortPositionsDescending);

    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-dim); padding: 2rem;">No position receipts found in history.</div>';
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const displayR = item.resultR === 'NEUTRAL' ? 'FREE' : item.resultR;

      card.innerHTML = `
        <div class="history-info">
          <div class="history-title">
            <span>${escapeHtml(item.symbol)} (${escapeHtml(item.direction)})</span>
            <span class="badge" style="background: var(--border-strong);">${item.excelAdded ? '✓ Excel' : 'Log'} [${escapeHtml(displayR)} R]</span>
          </div>
          <div class="history-meta">
            <span>Account: <strong>${escapeHtml(item.account)}</strong></span> • 
            <span>${escapeHtml(item.challenge)}</span> • 
            <span>Order #: <strong>${escapeHtml(item.orderNum)}</strong></span>
            ${item.excelNum ? ` • <span>Excel #: <strong>${escapeHtml(item.excelNum)}</strong></span>` : ''} • 
            <span>Date: ${escapeHtml(item.date)}</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary btn-xs btn-edit-pos" title="Edit Position Details">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
          <button class="btn btn-secondary btn-xs btn-view-pdf" title="View & Download PDF">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>PDF</span>
          </button>
          <button class="btn btn-danger btn-xs btn-delete-item" title="Delete record">&times;</button>
        </div>
      `;

      card.querySelector('.btn-edit-pos').addEventListener('click', () => {
        editPositionFromHistory(item);
      });

      card.querySelector('.btn-view-pdf').addEventListener('click', () => {
        closeModal(elements.modalTradeHistory);
        renderPdfTemplate(item);
        if (elements.driveNoticeBanner) elements.driveNoticeBanner.classList.add('hidden');
        openModal(elements.modalPdfPreview);
        compilePdfBlob(item);
      });

      card.querySelector('.btn-delete-item').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete position receipt #${item.orderNum} (${item.symbol})?`)) {
          state.history = state.history.filter(h => h.id !== item.id);
          saveStateToStorage();
          renderHistoryList();
          showToast(`Position #${item.orderNum} deleted.`, 'info');
        }
      });

      container.appendChild(card);
    });
  }

  function handleClearHistory() {
    if (confirm('Are you sure you want to clear ALL position receipt history? This action cannot be undone.')) {
      state.history = [];
      state.positions = {};
      clearIndexedDB();
      saveStateToStorage();
      renderHistoryList();
      showToast('All history cleared.', 'info');
    }
  }

  // --- MODAL HELPERS ---
  function openModal(modalEl) {
    modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    modalEl.classList.add('hidden');
  }

  function sanitizeName(str) {
    return (str || '').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // DOM Content Loaded Execution
  document.addEventListener('DOMContentLoaded', init);

})();
