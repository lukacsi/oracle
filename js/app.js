// A Magyar Jósda — Hungarian proverb oracle
// Celestial revamp: particle sky, phased orb, rovás transliteration,
// reading history, clipboard sharing.

(() => {
  'use strict';

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const proverbs = [];
  let lastIdx = -1;
  let currentEntry = null;
  let currentIntro = '';
  let busy = false;

  const $ = (id) => document.getElementById(id);

  const els = {
    body: document.body,
    sky: $('sky'),
    orb: $('orb'),
    orbStatus: $('orbStatus'),
    askForm: $('askForm'),
    askBtn: $('askBtn'),
    question: $('question'),
    answerPanel: $('answerPanel'),
    answerCard: $('answerCard'),
    answerIntro: $('answerIntro'),
    answerText: $('answerText'),
    answerMeaning: $('answerMeaning'),
    againBtn: $('againBtn'),
    redrawBtn: $('redrawBtn'),
    copyBtn: $('copyBtn'),
    history: $('history'),
    historyList: $('historyList'),
    rovasToggle: $('rovasToggle'),
    footer: $('footer')
  };

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----------------------------------------------------------
  // Copy
  // ----------------------------------------------------------

  const introsWithQ = [
    'A jósda így válaszol:',
    'Így szól a jóslat:',
    'A bölcsesség szava:',
    'A sors könyve ezt mondja:',
    'Az ősök szelleme üzeni:'
  ];

  const introsNoQ = [
    'A jósda szól:',
    'Így szól a mondás:',
    'A bölcsesség:',
    'A sors:',
    'Ezt tartja a nép:'
  ];

  const divinationLines = [
    'A jósda a régi szavak közt kutat…',
    'A gömb ködében alakok kavarognak…',
    'Az ősök szelleme közeleg…',
    'A csillagok rendeződnek…',
    'A sors könyve lapozódik…'
  ];

  const placeholders = [
    'Mi gyötör téged, vándor?',
    'Szerelmi bánat emészt?',
    'Merre visz az utad?',
    'Mit hoz a holnap?',
    'Kire hallgassak?',
    'Mitévő legyek?',
    'Mi nyomja a szívedet?'
  ];

  // ----------------------------------------------------------
  // Particle sky: twinkling stars + rising golden embers
  // ----------------------------------------------------------

  const sky = (() => {
    const canvas = els.sky;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let embers = [];
    let raf = null;
    let energy = 1; // 1 = idle, 2.5 = divining
    let w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (prefersReducedMotion) drawStatic();
    }

    function seed() {
      const starCount = Math.round((w * h) / 9000);
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.8,
        gold: Math.random() < 0.35
      }));
      const emberCount = Math.round(w / 40);
      embers = Array.from({ length: emberCount }, () => newEmber(true));
    }

    function newEmber(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.6,
        vy: 0.12 + Math.random() * 0.3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.008,
        alpha: 0.15 + Math.random() * 0.45
      };
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? 'rgba(224, 178, 90, 0.6)'
          : 'rgba(226, 220, 255, 0.5)';
        ctx.fill();
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + t * 0.001 * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? `rgba(224, 178, 90, ${0.7 * tw})`
          : `rgba(226, 220, 255, ${0.55 * tw})`;
        ctx.fill();
      }

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy * energy;
        e.sway += e.swaySpeed * energy;
        const x = e.x + Math.sin(e.sway) * 14;
        if (e.y < -10) { embers[i] = newEmber(false); continue; }
        ctx.beginPath();
        ctx.arc(x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 198, 116, ${e.alpha * Math.min(energy, 1.6)})`;
        ctx.shadowColor = 'rgba(224, 178, 90, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (prefersReducedMotion || raf) return;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    resize();
    start();

    return { setEnergy: (v) => { energy = v; } };
  })();

  // ----------------------------------------------------------
  // Rovásírás (Old Hungarian) transliteration
  // ----------------------------------------------------------

  const ROVAS_MULTI = [
    ['ssz', '\u{10CE5}\u{10CE5}'], ['zzs', '\u{10CF0}\u{10CF0}'],
    ['ccs', '\u{10CC6}\u{10CC6}'], ['ggy', '\u{10CCE}\u{10CCE}'],
    ['lly', '\u{10CD7}\u{10CD7}'], ['nny', '\u{10CDA}\u{10CDA}'],
    ['tty', '\u{10CE8}\u{10CE8}'],
    ['dzs', '\u{10CC7}\u{10CF0}'], ['dz', '\u{10CC7}\u{10CEF}'],
    ['cs', '\u{10CC6}'], ['gy', '\u{10CCE}'], ['ly', '\u{10CD7}'],
    ['ny', '\u{10CDA}'], ['sz', '\u{10CE5}'], ['ty', '\u{10CE8}'],
    ['zs', '\u{10CF0}']
  ];

  const ROVAS_SINGLE = {
    a: '\u{10CC0}', 'á': '\u{10CC1}', b: '\u{10CC2}', c: '\u{10CC4}',
    d: '\u{10CC7}', e: '\u{10CC9}', 'é': '\u{10CCB}', f: '\u{10CCC}',
    g: '\u{10CCD}', h: '\u{10CCF}', i: '\u{10CD0}', 'í': '\u{10CD1}',
    j: '\u{10CD2}', k: '\u{10CD3}', l: '\u{10CD6}', m: '\u{10CD8}',
    n: '\u{10CD9}', o: '\u{10CDB}', 'ó': '\u{10CDC}', 'ö': '\u{10CDE}',
    'ő': '\u{10CDF}', p: '\u{10CE0}', q: '\u{10CD3}', r: '\u{10CE2}',
    s: '\u{10CE4}', t: '\u{10CE6}', u: '\u{10CEA}', 'ú': '\u{10CEB}',
    'ü': '\u{10CEC}', 'ű': '\u{10CED}', v: '\u{10CEE}', w: '\u{10CEE}',
    x: '\u{10CD3}\u{10CE5}', y: '\u{10CD0}', z: '\u{10CEF}'
  };

  function toRovas(text) {
    let s = text.toLowerCase();
    let out = '';
    let i = 0;
    outer:
    while (i < s.length) {
      for (const [seq, glyph] of ROVAS_MULTI) {
        if (s.startsWith(seq, i)) {
          out += glyph;
          i += seq.length;
          continue outer;
        }
      }
      const ch = s[i];
      out += ROVAS_SINGLE[ch] !== undefined ? ROVAS_SINGLE[ch] : ch;
      i++;
    }
    return out;
  }

  // ----------------------------------------------------------
  // Phases: idle → divining → revealed
  // ----------------------------------------------------------

  function setPhase(phase) {
    els.body.dataset.phase = phase;
    sky.setEnergy(phase === 'divining' ? 2.5 : 1);
  }

  function setStatus(text) {
    els.orbStatus.textContent = text;
    els.orbStatus.classList.toggle('visible', !!text);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function scrollTo(el, block) {
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: block || 'center'
    });
  }

  function drawProverb() {
    let idx;
    do {
      idx = Math.floor(Math.random() * proverbs.length);
    } while (idx === lastIdx && proverbs.length > 1);
    lastIdx = idx;
    return proverbs[idx];
  }

  function renderAnswer() {
    if (!currentEntry) return;
    const rovas = els.body.classList.contains('rovas-mode');

    const proverb = rovas ? toRovas(currentEntry.proverb) : currentEntry.proverb;
    const meaning = rovas ? toRovas(currentEntry.meaning) : currentEntry.meaning;

    els.answerIntro.textContent = currentIntro;
    els.answerText.textContent = '„' + proverb + '”';
    els.answerMeaning.textContent = meaning;

    const len = currentEntry.proverb.length;
    els.answerText.classList.toggle('long', len > 60 && len <= 110);
    els.answerText.classList.toggle('x-long', len > 110);
  }

  function reveal() {
    currentEntry = drawProverb();
    const hasQ = els.question.value.trim().length > 0;
    currentIntro = pick(hasQ ? introsWithQ : introsNoQ);

    renderAnswer();
    addToHistory(els.question.value.trim(), currentEntry);

    setStatus('');
    setPhase('revealed');

    els.answerPanel.hidden = false;
    els.answerPanel.classList.remove('enter');
    void els.answerPanel.offsetWidth; // restart the stagger animation
    els.answerPanel.classList.add('enter');

    busy = false;
    const fits = els.answerCard.offsetHeight < window.innerHeight * 0.85;
    scrollTo(els.answerCard, fits ? 'center' : 'start');
    els.againBtn.focus({ preventScroll: true });
  }

  function ask() {
    if (busy || proverbs.length === 0) return;
    busy = true;

    els.askForm.hidden = true;
    els.answerPanel.hidden = true;
    setPhase('divining');
    setStatus(pick(divinationLines));
    scrollTo(els.orb);

    setTimeout(reveal, prefersReducedMotion ? 300 : 2400);
  }

  function redraw() {
    if (busy) return;
    busy = true;

    els.answerPanel.hidden = true;
    setPhase('divining');
    setStatus(pick(divinationLines));
    scrollTo(els.orb);

    setTimeout(reveal, prefersReducedMotion ? 300 : 1400);
  }

  function reset() {
    if (busy) return;
    currentEntry = null;
    setPhase('idle');
    setStatus('');

    els.answerPanel.hidden = true;
    els.answerPanel.classList.remove('enter');
    els.askForm.hidden = false;
    els.askForm.classList.remove('enter');
    void els.askForm.offsetWidth;
    els.askForm.classList.add('enter');

    els.question.value = '';
    scrollTo(els.askForm);
    els.question.focus({ preventScroll: true });
  }

  // ----------------------------------------------------------
  // Clipboard
  // ----------------------------------------------------------

  async function copyReading() {
    if (!currentEntry) return;
    const text = '„' + currentEntry.proverb + '” — ' +
      currentEntry.meaning + '\n(oracle.gyoma.org)';
    try {
      await navigator.clipboard.writeText(text);
      els.copyBtn.textContent = 'Lemásolva ✓';
      els.copyBtn.classList.add('copied');
    } catch (e) {
      els.copyBtn.textContent = 'Nem sikerült';
    }
    setTimeout(() => {
      els.copyBtn.textContent = 'Másolás';
      els.copyBtn.classList.remove('copied');
    }, 1800);
  }

  // ----------------------------------------------------------
  // History (last 5 readings, localStorage)
  // ----------------------------------------------------------

  const HISTORY_KEY = 'josda-history';
  const HISTORY_MAX = 5;

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (e) { /* private mode, quota — history is optional */ }
  }

  function addToHistory(question, entry) {
    const items = loadHistory();
    items.unshift({ q: question, p: entry.proverb, m: entry.meaning });
    saveHistory(items.slice(0, HISTORY_MAX));
    renderHistory();
  }

  function renderHistory() {
    const items = loadHistory();
    els.history.hidden = items.length === 0;
    els.historyList.textContent = '';
    const rovas = els.body.classList.contains('rovas-mode');

    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'history-item';

      if (item.q) {
        const q = document.createElement('p');
        q.className = 'history-q';
        q.textContent = '» ' + item.q;
        li.appendChild(q);
      }

      const p = document.createElement('p');
      p.className = 'history-p';
      p.textContent = '„' + (rovas ? toRovas(item.p) : item.p) + '”';
      li.appendChild(p);

      const m = document.createElement('p');
      m.className = 'history-m';
      m.textContent = rovas ? toRovas(item.m) : item.m;
      li.appendChild(m);

      els.historyList.appendChild(li);
    }
  }

  // ----------------------------------------------------------
  // Rovás mode toggle (persisted)
  // ----------------------------------------------------------

  const ROVAS_KEY = 'josda-rovas';

  function setRovasMode(on) {
    els.body.classList.toggle('rovas-mode', on);
    els.rovasToggle.setAttribute('aria-checked', String(on));
    try { localStorage.setItem(ROVAS_KEY, on ? '1' : '0'); } catch (e) { /* optional */ }
    renderAnswer();
    renderHistory();
  }

  // ----------------------------------------------------------
  // Rotating placeholder
  // ----------------------------------------------------------

  function startPlaceholderRotation() {
    let i = 0;
    setInterval(() => {
      if (document.hidden || els.askForm.hidden) return;
      if (els.question.value || document.activeElement === els.question) return;
      i = (i + 1) % placeholders.length;
      els.question.classList.add('placeholder-fade');
      setTimeout(() => {
        els.question.placeholder = placeholders[i];
        els.question.classList.remove('placeholder-fade');
      }, 400);
    }, 5000);
  }

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------

  async function init() {
    try {
      const res = await fetch('data/proverbs.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      proverbs.push(...data);
      const count = proverbs.length.toLocaleString('hu-HU');
      els.footer.querySelector('p').textContent =
        'oracle.gyoma.org · ' + count + ' szólás a birtokunkban';
      els.askBtn.disabled = false;
    } catch (e) {
      els.footer.querySelector('p').textContent =
        'oracle.gyoma.org · a szólások nem töltődtek be';
      els.askBtn.querySelector('.btn-text').textContent = 'A jósda hallgat…';
      return;
    }

    els.askForm.addEventListener('submit', (e) => {
      e.preventDefault();
      ask();
    });

    els.orb.addEventListener('click', () => {
      if (!els.askForm.hidden) ask();
    });

    els.againBtn.addEventListener('click', reset);
    els.redrawBtn.addEventListener('click', redraw);
    els.copyBtn.addEventListener('click', copyReading);

    els.rovasToggle.addEventListener('click', () => {
      setRovasMode(els.rovasToggle.getAttribute('aria-checked') !== 'true');
    });

    let savedRovas = false;
    try { savedRovas = localStorage.getItem(ROVAS_KEY) === '1'; } catch (e) { /* optional */ }
    if (savedRovas) setRovasMode(true);

    renderHistory();
    startPlaceholderRotation();
  }

  init();
})();
