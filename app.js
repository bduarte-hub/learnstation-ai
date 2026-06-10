/* ── i18n core ────────────────────────────────────── */
let LANG = 'pt';
let cachedData = null;
let currentSlug = null;

function initLang() {
  const urlParam = new URLSearchParams(location.search).get('lang');
  if (urlParam === 'en' || urlParam === 'pt') {
    LANG = urlParam;
    localStorage.setItem('learnstation_lang', urlParam);
  } else {
    LANG = localStorage.getItem('learnstation_lang') || 'pt';
  }
  document.documentElement.lang = LANG === 'en' ? 'en-US' : 'pt-BR';
}

function t(field) {
  if (!field && field !== 0) return '';
  if (typeof field === 'string' || typeof field === 'number') return String(field);
  return field[LANG] ?? field['pt'] ?? '';
}

function tArr(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return field[LANG] ?? field['pt'] ?? [];
}

function switchLang(newLang) {
  LANG = newLang;
  localStorage.setItem('learnstation_lang', newLang);
  document.documentElement.lang = newLang === 'en' ? 'en-US' : 'pt-BR';
  if (currentSlug) renderEpisodePage(cachedData, currentSlug);
  else             renderIndexPage(cachedData);
}

/* ── Helpers ──────────────────────────────────────── */
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const locale = LANG === 'en' ? 'en-US' : 'pt-BR';
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function ytThumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/* ── Language switcher ────────────────────────────── */
function renderSwitcher() {
  const nav = document.querySelector('.site-header nav');
  if (!nav) return;
  let sw = document.getElementById('lang-switcher');
  if (!sw) {
    sw = document.createElement('div');
    sw.id = 'lang-switcher';
    sw.setAttribute('role', 'group');
    nav.appendChild(sw);
  }
  sw.setAttribute('aria-label', UI[LANG].switchLang);
  sw.innerHTML = `
    <button class="lang-btn${LANG === 'pt' ? ' active' : ''}"
            onclick="switchLang('pt')"
            aria-pressed="${LANG === 'pt'}"
            title="Português (BR)">🇧🇷</button>
    <button class="lang-btn${LANG === 'en' ? ' active' : ''}"
            onclick="switchLang('en')"
            aria-pressed="${LANG === 'en'}"
            title="English (US)">🇺🇸</button>
  `;
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (UI[LANG][key]) el.textContent = UI[LANG][key];
  });
}

/* ── Reading progress bar ─────────────────────────── */
function initReadProgress() {
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.id = 'read-progress';
  document.body.prepend(bar);
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Load & route ─────────────────────────────────── */
initLang();

fetch('content.json')
  .then(r => r.json())
  .then(data => {
    cachedData = data;
    currentSlug = new URLSearchParams(location.search).get('ep');
    if (currentSlug) renderEpisodePage(data, currentSlug);
    else             renderIndexPage(data);
  })
  .catch(() => {
    document.body.innerHTML =
      `<p style="padding:4rem;color:#999">${UI[LANG].loadError}</p>`;
  });

/* ══ INDEX PAGE ═══════════════════════════════════════ */
function renderIndexPage(data) {
  currentSlug = null;
  const { series, episodes } = data;
  const published = episodes.filter(e => e.status === 'published').length;
  const pct       = Math.round((published / series.totalEpisodes) * 100);
  const featured  = episodes.find(e => e.status === 'published') || episodes[0];

  const heroBanner = $('hero-banner');
  if (heroBanner) {
    heroBanner.innerHTML = `
      <video class="hero-bg-video" autoplay loop muted playsinline aria-hidden="true">
        <source src="assets/herogifai_web.mp4" type="video/mp4">
      </video>
      <div class="hero-content">
        <p class="hero-eyebrow">${UI[LANG].seriesOngoing.replace('{total}', series.totalEpisodes)}</p>
        <h1>${t(series.title)}</h1>
        <p class="hero-subtitle">${t(series.description)}</p>
        <div class="hero-actions">
          <a class="btn-primary" href="episode.html?ep=${featured.slug}">
            ${UI[LANG].startEp1}
          </a>
          <button class="btn-ghost" onclick="document.getElementById('all-episodes').scrollIntoView({behavior:'smooth'})">
            ${UI[LANG].viewAllEps}
          </button>
        </div>
        <div class="hero-meta">
          <span><strong>${published}</strong> ${UI[LANG].publishedCount.replace('{published}', published).replace('{total}', series.totalEpisodes)}</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
            <span>${pct}%</span>
          </div>
        </div>
      </div>
    `;
  }

  renderVicAudio();

  const grid = $('episodes-grid');
  if (grid) {
    grid.innerHTML = '';

    // Group episodes by week key (e.g. "Semana 1", "Semana 2")
    const weekGroups = [];
    const weekMap = {};
    episodes.forEach((ep, idx) => {
      const weekKey = t(ep.weekLabel).split('·')[0].trim(); // "Semana 1"
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { label: weekKey, episodes: [], indices: [] };
        weekGroups.push(weekMap[weekKey]);
      }
      weekMap[weekKey].episodes.push(ep);
      weekMap[weekKey].indices.push(idx);
    });

    weekGroups.forEach((group, groupIdx) => {
      // Week separator
      const separator = el('div', 'week-separator');
      const hasPublished = group.episodes.some(e => e.status === 'published');
      separator.innerHTML = `
        <div class="week-sep-inner">
          <span class="week-sep-label${hasPublished ? ' week-sep-active' : ''}">${group.label}</span>
          ${!hasPublished ? `<span class="week-sep-soon">${UI[LANG].comingSoon}</span>` : ''}
        </div>
        <div class="week-sep-line"></div>
      `;
      grid.appendChild(separator);

      // Cards row for this week
      const row = el('div', 'week-row');
      group.episodes.forEach((ep, i) => {
        const idx = group.indices[i];
        const locked = ep.status !== 'published';
        const card   = el('div', `episode-card${locked ? ' locked' : ''}`);
        if (!locked) {
          card.addEventListener('click', () => {
            location.href = `episode.html?ep=${ep.slug}`;
          });
        }
        const thumbClass = `ep-thumb-${idx + 1}`;
        const comingDate = ep.expectedAt
          ? `${UI[LANG].availableOn.replace('{date}', formatDate(ep.expectedAt))}`
          : UI[LANG].comingSoon;

        card.innerHTML = `
          <div class="card-thumbnail ${thumbClass}">
            ${!locked ? `<span class="card-new-badge">${UI[LANG].available}</span>` : ''}
            <span class="card-thumb-icon">${ep.thumbnail}</span>
            <span class="card-thumb-num">${ep.id}</span>
          </div>
          <div class="card-body">
            <p class="card-episode-num">${UI[LANG].episodeNum.replace('{n}', ep.id)}</p>
            <h2 class="card-title">${t(ep.title)}</h2>
            <p class="card-tagline">${t(ep.tagline)}</p>
            ${locked
              ? `<p class="card-coming-date">${comingDate}</p>`
              : `<div class="card-tags">
                  ${tArr(ep.tags).map(tag => `<span class="tag">${tag}</span>`).join('')}
                 </div>
                 <div class="card-cta">${UI[LANG].readEpisode} <span>→</span></div>`
            }
          </div>
        `;
        row.appendChild(card);
      });
      grid.appendChild(row);
    });
  }

  const about = $('about-strip');
  if (about) {
    about.innerHTML = `
      <img class="about-ciandt-s12" src="assets/s12.svg" alt="" aria-hidden="true">
      <img class="about-ciandt-s24" src="assets/s24.svg" alt="" aria-hidden="true">
      <img class="about-photo" src="vic.png" alt="${series.author.name}">
      <div class="about-text">
        <h3 class="about-name">Vic Marchiori</h3>
        <p class="about-role">Global Sr People Innovation Manager</p>
        <p class="about-bio">${t(series.author.bio)}</p>
      </div>
    `;
  }

  const foot = $('footer-text');
  if (foot) foot.textContent = UI[LANG].footerText.replace('{name}', series.author.name);
  document.title = `LearnStation.AI — ${t(series.title)}`;

  renderSwitcher();
  applyStaticTranslations();
}

/* ══ EPISODE PAGE ═════════════════════════════════════ */
function renderEpisodePage(data, slug) {
  currentSlug = slug;
  const { series, episodes } = data;
  const ep   = episodes.find(e => e.slug === slug);
  const page = $('episode-page');
  if (!page) return;

  if (!ep || ep.status !== 'published') {
    page.innerHTML = `
      <a class="ep-back" href="index.html">${UI[LANG].backToAll}</a>
      <p style="color:var(--text-muted);padding:2rem 0">${UI[LANG].notFound}</p>`;
    renderSwitcher();
    applyStaticTranslations();
    return;
  }

  document.title = `${t(ep.title)} — LearnStation.AI`;
  initReadProgress();

  const nextIdx = episodes.indexOf(ep) + 1;
  const next    = nextIdx < episodes.length ? episodes[nextIdx] : null;

  const openerMeta = ep.openerVideoMeta || {};
  const openerHTML = ep.openerVideo
    ? `<div class="ep-opener">
         <p class="ep-opener-label">${UI[LANG].activateIntuition}${openerMeta.channel ? ` · <span style="color:var(--text-muted);font-weight:500;text-transform:none;letter-spacing:0">${openerMeta.channel}</span>` : ''}</p>
         <div class="ep-opener-embed">
           <iframe src="https://www.youtube.com/embed/${ep.openerVideo}?rel=0&modestbranding=1"
                   title="${openerMeta.title || ''}"
                   loading="lazy"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowfullscreen></iframe>
         </div>
       </div>`
    : '';

  const objectives = tArr(ep.objectives);
  const objectivesHTML = objectives.length
    ? `<div class="ep-objectives">
         <p class="ep-objectives-label">${UI[LANG].whatYoullLearn}</p>
         ${objectives.map(o => `<span class="ep-obj-item">${o}</span>`).join('')}
       </div>`
    : '';

  const sectionsHTML = (ep.sections || []).map(renderSection).join('');

  const nextHTML = next
    ? `<a class="next-ep-teaser" href="${next.status === 'published' ? `episode.html?ep=${next.slug}` : '#'}">
         <div>
           <p class="next-ep-label">${UI[LANG].nextEpisode}</p>
           <p class="next-ep-title">${t(next.weekLabel)}: ${t(next.title)}</p>
           <p style="font-size:.78rem;color:var(--text-dim);margin-top:.3rem">${t(next.tagline)}</p>
         </div>
         <span class="next-ep-arrow">→</span>
       </a>`
    : '';

  const sandboxHTML = `
    <div class="sandbox-cta">
      <div class="sandbox-cta-text">
        <p class="sandbox-cta-eyebrow">${UI[LANG].sandboxEyebrow}</p>
        <p class="sandbox-cta-title">${UI[LANG].sandboxTitle}</p>
        <p class="sandbox-cta-desc">${UI[LANG].sandboxDesc}</p>
      </div>
      <a class="sandbox-btn"
         href="https://docs.google.com/forms/d/e/1FAIpQLSd_PLACEHOLDER/viewform"
         target="_blank" rel="noopener noreferrer">
        <span class="sandbox-btn-icon">💡</span>
        ${UI[LANG].sandboxBtn}
      </a>
    </div>`;

  page.innerHTML = `
    <a class="ep-back" href="index.html">${UI[LANG].backToAll}</a>
    <header class="ep-header">
      <p class="ep-week">${t(ep.weekLabel)} · ${UI[LANG].episodeNum.replace('{n}', ep.id)}</p>
      <h1 class="ep-title">${t(ep.title)}</h1>
      <p class="ep-tagline">${t(ep.tagline)}</p>
      <div class="ep-meta">
        <span>${formatDate(ep.publishedAt)}</span>
        ${ep.duration ? `<span class="dot">${t(ep.duration)}</span>` : ''}
      </div>
      <div class="ep-tags">
        ${tArr(ep.tags).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </header>
    ${openerHTML}
    ${objectivesHTML}
    <p class="ep-intro">${t(ep.intro)}</p>
    <article>${sectionsHTML}</article>
    ${nextHTML}
    ${sandboxHTML}
  `;

  const foot = $('footer-text');
  if (foot) foot.textContent = UI[LANG].footerText.replace('{name}', series.author.name);

  renderSwitcher();
  applyStaticTranslations();
}

/* ── Section renderers ──────────────────────────────── */
function renderSection(s) {
  switch (s.type) {

    case 'insight':
    case 'definition':
    case 'reflection':
      return `<div class="ep-section section-${s.type}">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        <p class="ep-section-body">${t(s.body)}</p>
      </div>`;

    case 'highlight':
      return `<div class="ep-section section-highlight">
        <p class="ep-section-body">"${t(s.body)}"</p>
      </div>`;

    case 'concept':
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        <ul class="concept-list">
          ${s.items.map(item => `
            <li class="concept-item">
              <div>
                <p class="concept-term">${t(item.term)}</p>
                <p class="concept-desc">${t(item.description)}</p>
              </div>
            </li>`).join('')}
        </ul>
      </div>`;

    case 'videos':
      return `<div class="ep-section section-videos">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:1rem">${t(s.description)}</p>` : ''}
        <div class="video-grid">
          ${s.items.map(v => `
            <a class="video-card" href="https://www.youtube.com/watch?v=${v.videoId}"
               target="_blank" rel="noopener noreferrer">
              <div class="video-thumb">
                <img src="${ytThumb(v.videoId)}" alt="${v.title}" loading="lazy">
                <div class="video-play-btn"><span>▶</span></div>
              </div>
              <div class="video-info">
                <p class="video-channel">${v.channel}</p>
                <p class="video-title">${v.title}</p>
                ${v.duration ? `<p class="video-duration">${v.duration}</p>` : ''}
              </div>
            </a>`).join('')}
        </div>
      </div>`;

    case 'stats':
      return `<div class="ep-section section-stats">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:1rem">${t(s.description)}</p>` : ''}
        <div class="stats-grid">
          ${s.items.map(st => `
            <div class="stat-card">
              <p class="stat-number">${st.number}</p>
              <p class="stat-label">${t(st.label)}</p>
            </div>`).join('')}
        </div>
      </div>`;

    case 'checkpoint':
      return `<div class="section-checkpoint">
        <p class="checkpoint-label">${UI[LANG].checkpointLabel}</p>
        <div class="checkpoint-questions">
          ${s.questions.map((q, i) => `
            <div class="checkpoint-q" id="cpq-${i}">
              <div class="checkpoint-q-text" onclick="toggleCheckpoint('cpq-${i}')">
                <span>${t(q.question)}</span>
                <span class="checkpoint-toggle">▾</span>
              </div>
              <div class="checkpoint-answer">
                <p>${t(q.answer)}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>`;

    case 'comparison':
      return `<div class="ep-section section-comparison">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:0">${t(s.description)}</p>` : ''}
        <div class="comparison-grid">
          <div class="comparison-col col-a">
            <p class="comparison-col-label">${t(s.colA.label)}</p>
            <p class="comparison-col-title">${t(s.colA.title)}</p>
            <ul>${tArr(s.colA.items).map(i => `<li>${i}</li>`).join('')}</ul>
            ${s.colA.example ? `<div class="comparison-col-example">${UI[LANG].examplePrefix}: ${t(s.colA.example)}</div>` : ''}
          </div>
          <div class="comparison-col col-b">
            <p class="comparison-col-label">${t(s.colB.label)}</p>
            <p class="comparison-col-title">${t(s.colB.title)}</p>
            <ul>${tArr(s.colB.items).map(i => `<li>${i}</li>`).join('')}</ul>
            ${s.colB.example ? `<div class="comparison-col-example">${UI[LANG].examplePrefix}: ${t(s.colB.example)}</div>` : ''}
          </div>
        </div>
      </div>`;

    case 'process':
      return `<div class="ep-section section-process">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:0">${t(s.description)}</p>` : ''}
        <div class="process-steps">
          ${s.steps.map((step, i) => `
            <div class="process-step">
              <div class="process-step-left">
                <div class="process-step-num">${i + 1}</div>
                <div class="process-step-line"></div>
              </div>
              <div class="process-step-body">
                <p class="process-step-title">${t(step.title)}</p>
                <p class="process-step-desc">${t(step.desc)}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>`;

    case 'alert':
      return `<div class="ep-section section-alert">
        <div class="alert-box alert-${s.level || 'danger'}">
          <div class="alert-icon">${s.icon || '⚠️'}</div>
          <div>
            <p class="alert-content-label">${t(s.label) || UI[LANG].alertFallback}</p>
            <p class="alert-content-body">${t(s.body)}</p>
          </div>
        </div>
      </div>`;

    case 'diagram':
      return `<div class="ep-section section-diagram">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:0">${t(s.description)}</p>` : ''}
        <div class="diagram-flow">
          ${s.rows.map(row => `
            <div class="diagram-row">
              ${row.map((node, ni) => `
                ${ni > 0 ? `<span class="diagram-arrow">→</span>` : ''}
                <div class="diagram-node ${node.type ? 'node-' + node.type : ''}">
                  ${node.icon ? `<div class="diagram-node-icon">${node.icon}</div>` : ''}
                  <div class="diagram-node-label">${t(node.label)}</div>
                  ${node.desc ? `<div class="diagram-node-desc">${t(node.desc)}</div>` : ''}
                </div>`).join('')}
            </div>`).join('')}
        </div>
        ${s.note ? `<div class="diagram-note">${t(s.note)}</div>` : ''}
      </div>`;

    case 'timeline':
      return `<div class="ep-section section-timeline">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        <div class="timeline">
          ${s.items.map(item => `
            <div class="timeline-item${item.milestone ? ' milestone' : ''}">
              <div class="timeline-dot"></div>
              <p class="timeline-year">${item.year}</p>
              <p class="timeline-title">${t(item.title)}</p>
              <p class="timeline-desc">${t(item.desc)}</p>
            </div>`).join('')}
        </div>
      </div>`;

    case 'biases':
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:0">${t(s.description)}</p>` : ''}
        <div class="bias-grid">
          ${s.items.map(b => `
            <div class="bias-card">
              <div class="bias-card-icon">${b.icon}</div>
              <p class="bias-card-title">${t(b.title)}</p>
              <p class="bias-card-desc">${t(b.desc)}</p>
            </div>`).join('')}
        </div>
      </div>`;

    case 'temperature':
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body">${t(s.description)}</p>` : ''}
        <div class="temp-visual">
          <div class="temp-bar-labels"><span>${UI[LANG].tempScaleLow}</span><span>${UI[LANG].tempScaleHigh}</span></div>
          <div class="temp-bar-track"></div>
          <div class="temp-extremes">
            <div class="temp-extreme temp-low">
              <p class="temp-extreme-label">${UI[LANG].tempLow}</p>
              <ul>${tArr(s.low).map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="temp-extreme temp-high">
              <p class="temp-extreme-label">${UI[LANG].tempHigh}</p>
              <ul>${tArr(s.high).map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      </div>`;

    default:
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${t(s.title)}</h2>` : ''}
        <p class="ep-section-body">${t(s.body) || ''}</p>
      </div>`;
  }
}

/* ── Checkpoint toggle ───────────────────────────────── */
function toggleCheckpoint(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

/* ══ VIC AUDIO INTRO ═════════════════════════════════════
   Renders a compact audio player strip below the hero.
   Looks for `assets/vic-intro.mp3` — if the file doesn't
   exist yet the strip is hidden until it's uploaded.
═══════════════════════════════════════════════════════════ */
function renderVicAudio() {
  const AUDIO_SRC = 'assets/vic-intro.mp3';

  // Insert strip container right after hero-banner
  const hero = $('hero-banner');
  if (!hero) return;

  const strip = document.createElement('div');
  strip.className = 'vic-audio-strip';
  strip.id = 'vic-audio-strip';
  strip.innerHTML = `
    <img class="vic-audio-photo" src="vic.png" alt="Vic">
    <div class="vic-audio-info">
      <p class="vic-audio-label">Mensagem da Vic</p>
      <p class="vic-audio-name">Vic Marchiori</p>
      <p class="vic-audio-title">Global Sr People Innovation Manager · CI&amp;T</p>
    </div>
    <div class="vic-audio-controls">
      <div class="vic-waveform" aria-hidden="true">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="vic-progress-wrap">
        <div class="vic-progress-track" id="vic-track">
          <div class="vic-progress-fill" id="vic-fill"></div>
        </div>
        <div class="vic-progress-times">
          <span id="vic-cur">0:00</span>
          <span id="vic-dur">—</span>
        </div>
      </div>
      <button class="vic-play-btn" id="vic-play" aria-label="Ouvir mensagem da Vic">
        <svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z"/></svg>
      </button>
    </div>
  `;
  hero.insertAdjacentElement('afterend', strip);

  // Check if audio file exists before wiring up
  fetch(AUDIO_SRC, { method: 'HEAD' })
    .then(r => {
      if (!r.ok) { strip.style.display = 'none'; return; }
      wireAudio(strip, AUDIO_SRC);
    })
    .catch(() => { strip.style.display = 'none'; });
}

function wireAudio(strip, src) {
  const audio   = new Audio(src);
  const playBtn = document.getElementById('vic-play');
  const fill    = document.getElementById('vic-fill');
  const cur     = document.getElementById('vic-cur');
  const dur     = document.getElementById('vic-dur');
  const track   = document.getElementById('vic-track');

  const fmt = s => {
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${ss}`;
  };

  // Play / pause icon SVGs
  const PLAY_ICON  = '<svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>';

  audio.addEventListener('loadedmetadata', () => {
    dur.textContent = fmt(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + '%';
    cur.textContent  = fmt(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    playBtn.innerHTML = PLAY_ICON;
    strip.classList.remove('playing');
    fill.style.width = '0%';
    cur.textContent  = '0:00';
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.innerHTML = PAUSE_ICON;
      strip.classList.add('playing');
    } else {
      audio.pause();
      playBtn.innerHTML = PLAY_ICON;
      strip.classList.remove('playing');
    }
  });

  // Click on progress bar to seek
  track.addEventListener('click', e => {
    if (!audio.duration) return;
    const rect = track.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });
}

/* ══ FEEDBACK MODE ═══════════════════════════════════════
   Double-click / double-tap anywhere → comment dialog.
   Comments stored in localStorage keyed by page + element.
   Floating button (bottom-right) opens the review panel.
═══════════════════════════════════════════════════════════ */
(function initFeedbackMode() {
  const STORE_KEY = 'learnstation_feedback';

  /* ── Storage helpers ── */
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveAll(items) {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  }
  function addComment(comment) {
    const items = loadAll();
    items.unshift(comment);
    saveAll(items);
  }
  function deleteComment(id) {
    saveAll(loadAll().filter(c => c.id !== id));
  }

  /* ── Rich location capture ── */
  function captureLocation(target) {
    // Scroll position as percentage
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1)) * 100
    );

    // Nearest heading walking up the DOM
    let heading = '';
    let el = target;
    for (let i = 0; i < 10 && el && el !== document.body; i++) {
      const h = el.closest
        ? (el.matches('h1,h2,h3') ? el : el.querySelector('h1,h2,h3'))
        : null;
      if (h) { heading = h.textContent.trim().slice(0, 100); break; }
      el = el.parentElement;
    }
    if (!heading) {
      // fallback: find the last heading above the click Y position
      const allH = [...document.querySelectorAll('h1,h2,h3')];
      const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : { top: 0 };
      const above = allH.filter(h => h.getBoundingClientRect().top <= rect.top + 1);
      if (above.length) heading = above[above.length - 1].textContent.trim().slice(0, 100);
    }
    if (!heading) heading = document.title.split('—')[0].trim();

    // Section label (data-od-id or nearest section)
    let sectionId = '';
    let sEl = target;
    for (let i = 0; i < 12 && sEl && sEl !== document.body; i++) {
      if (sEl.dataset && sEl.dataset.odId) { sectionId = sEl.dataset.odId; break; }
      if (sEl.tagName === 'SECTION') { sectionId = sEl.className.split(' ')[0] || 'section'; break; }
      sEl = sEl.parentElement;
    }

    // Snippet of clicked text
    const snippet = (target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

    return { heading, sectionId, scrollPct, snippet };
  }

  function labelFor(target) {
    return captureLocation(target).heading;
  }

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    /* Feedback toast hint */
    .fb-hint {
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(8px);
      background: #1e293b; color: #e2e8f0; font-size: .78rem; letter-spacing: .04em;
      padding: 7px 16px; border-radius: 999px; opacity: 0; pointer-events: none;
      transition: opacity .25s, transform .25s; z-index: 9000; white-space: nowrap;
    }
    .fb-hint.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Floating review button */
    .fb-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 9001;
      width: 48px; height: 48px; border-radius: 50%;
      background: #3b82f6; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(59,130,246,.45);
      transition: transform .15s, background .15s;
      font-size: 20px;
    }
    .fb-fab:hover { background: #2563eb; transform: scale(1.08); }
    .fb-fab .fb-badge {
      position: absolute; top: -4px; right: -4px;
      background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg-primary, #0d1117);
    }

    /* Comment dialog */
    .fb-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9100; padding: 16px;
      animation: fb-fade-in .18s ease;
    }
    .fb-dialog {
      background: #1e293b; border-radius: 16px; width: 100%; max-width: 480px;
      padding: 28px 28px 24px; box-shadow: 0 24px 56px rgba(0,0,0,.5);
      animation: fb-slide-up .2s ease;
    }
    .fb-dialog-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .fb-dialog-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
    .fb-dialog-context { font-size: .74rem; color: #64748b; margin-top: 3px; }
    .fb-dialog-close { background: none; border: none; color: #64748b; font-size: 20px; cursor: pointer; padding: 0 0 0 8px; line-height: 1; }
    .fb-dialog-close:hover { color: #f1f5f9; }
    .fb-dialog textarea {
      width: 100%; min-height: 100px; background: #0f172a; color: #e2e8f0;
      border: 1px solid #334155; border-radius: 10px; padding: 12px 14px;
      font: 15px/1.55 inherit; resize: vertical;
    }
    .fb-dialog textarea:focus { outline: none; border-color: #3b82f6; }
    .fb-dialog-actions { display: flex; gap: 10px; margin-top: 14px; justify-content: flex-end; }
    .fb-btn-cancel { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: .875rem; }
    .fb-btn-cancel:hover { border-color: #64748b; color: #e2e8f0; }
    .fb-btn-save { background: #3b82f6; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: .875rem; font-weight: 600; }
    .fb-btn-save:hover { background: #2563eb; }
    .fb-btn-save:disabled { opacity: .45; cursor: default; }

    /* Review panel */
    .fb-panel-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.55);
      display: flex; align-items: flex-end; justify-content: flex-end;
      z-index: 9100; padding: 16px;
      animation: fb-fade-in .18s ease;
    }
    .fb-panel {
      background: #1e293b; border-radius: 16px; width: 100%; max-width: 440px;
      max-height: 82vh; display: flex; flex-direction: column;
      box-shadow: 0 24px 56px rgba(0,0,0,.5);
      animation: fb-slide-up .2s ease;
    }
    .fb-panel-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 16px; border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    .fb-panel-head h3 { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
    .fb-panel-actions { display: flex; gap: 8px; align-items: center; }
    .fb-panel-export {
      background: #334155; border: none; color: #94a3b8; font-size: .75rem;
      padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 500;
    }
    .fb-panel-export:hover { background: #475569; color: #e2e8f0; }
    .fb-panel-close { background: none; border: none; color: #64748b; font-size: 20px; cursor: pointer; }
    .fb-panel-close:hover { color: #f1f5f9; }
    .fb-panel-body { overflow-y: auto; padding: 16px 24px; flex: 1; }
    .fb-panel-empty { color: #64748b; font-size: .875rem; text-align: center; padding: 32px 0; }
    .fb-comment-item {
      border-bottom: 1px solid #1e293b; padding: 14px 0;
      display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: start;
    }
    .fb-comment-item:first-child { padding-top: 0; }
    .fb-comment-item:last-child { border-bottom: none; }
    .fb-comment-context { font-size: .7rem; color: #3b82f6; margin-bottom: 4px; }
    .fb-comment-text { font-size: .875rem; color: #e2e8f0; line-height: 1.5; }
    .fb-comment-meta { font-size: .68rem; color: #475569; margin-top: 4px; }
    .fb-comment-del { background: none; border: none; color: #475569; cursor: pointer; font-size: 14px; padding: 0; margin-top: 2px; }
    .fb-comment-del:hover { color: #ef4444; }

    @keyframes fb-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fb-slide-up { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `;
  document.head.appendChild(style);

  /* ── Floating action button ── */
  const fab = document.createElement('button');
  fab.className = 'fb-fab';
  fab.title = 'Ver feedbacks';
  fab.innerHTML = '💬<span class="fb-badge" id="fb-badge" style="display:none"></span>';
  document.body.appendChild(fab);

  function updateBadge() {
    const n = loadAll().length;
    const badge = document.getElementById('fb-badge');
    if (!badge) return;
    badge.textContent = n > 9 ? '9+' : n;
    badge.style.display = n ? 'flex' : 'none';
  }
  updateBadge();

  /* ── Hint toast ── */
  const hint = document.createElement('div');
  hint.className = 'fb-hint';
  hint.textContent = 'Duplo clique para comentar';
  document.body.appendChild(hint);
  let hintTimer;
  function showHint() {
    clearTimeout(hintTimer);
    hint.classList.add('show');
    hintTimer = setTimeout(() => hint.classList.remove('show'), 2200);
  }

  /* ── Comment dialog ── */
  function openCommentDialog(context, pageId, location_) {
    const overlay = document.createElement('div');
    overlay.className = 'fb-overlay';
    overlay.innerHTML = `
      <div class="fb-dialog" role="dialog" aria-modal="true" aria-labelledby="fb-dialog-title">
        <div class="fb-dialog-header">
          <div>
            <div class="fb-dialog-title" id="fb-dialog-title">💬 Deixar feedback</div>
            <div class="fb-dialog-context">${context}${location_ && location_.scrollPct != null ? ` · ${location_.scrollPct}% da página` : ''}</div>
          </div>
          <button class="fb-dialog-close" aria-label="Fechar">×</button>
        </div>
        <textarea id="fb-textarea" placeholder="Escreva seu comentário sobre este conteúdo…" autofocus></textarea>
        <div class="fb-dialog-actions">
          <button class="fb-btn-cancel">Cancelar</button>
          <button class="fb-btn-save" disabled>Salvar</button>
        </div>
      </div>`;

    const ta  = overlay.querySelector('#fb-textarea');
    const save = overlay.querySelector('.fb-btn-save');
    const cancel = overlay.querySelector('.fb-btn-cancel');
    const close  = overlay.querySelector('.fb-dialog-close');

    ta.addEventListener('input', () => { save.disabled = !ta.value.trim(); });

    function dismiss() { overlay.remove(); }
    cancel.onclick = close.onclick = dismiss;
    overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', esc); }
    });

    save.onclick = () => {
      const text = ta.value.trim();
      if (!text) return;
      addComment({
        id: Date.now() + Math.random().toString(36).slice(2),
        pageId,
        context,
        location: location_,
        text,
        url: window.location.href,
        at: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      });
      updateBadge();
      dismiss();
      showSavedToast();
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => ta.focus());
  }

  function showSavedToast() {
    const t = document.createElement('div');
    t.className = 'fb-hint show';
    t.style.bottom = '80px';
    t.textContent = '✓ Feedback salvo';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  /* ── Review panel ── */
  function openPanel() {
    const comments = loadAll();
    const overlay = document.createElement('div');
    overlay.className = 'fb-panel-overlay';

    const itemsHTML = comments.length
      ? comments.map(c => `
          <div class="fb-comment-item">
            <div>
              <div class="fb-comment-context">${c.context}</div>
              <div class="fb-comment-text">${c.text.replace(/</g,'&lt;')}</div>
              <div class="fb-comment-meta">${c.at}${c.pageId ? ' · ' + c.pageId : ''}</div>
            </div>
            <button class="fb-comment-del" data-id="${c.id}" title="Apagar">🗑</button>
          </div>`).join('')
      : `<p class="fb-panel-empty">Nenhum feedback ainda.<br>Dê um duplo clique em qualquer parte da página.</p>`;

    overlay.innerHTML = `
      <div class="fb-panel" role="dialog" aria-modal="true" aria-label="Feedbacks salvos">
        <div class="fb-panel-head">
          <h3>💬 Feedbacks (${comments.length})</h3>
          <div class="fb-panel-actions">
            ${comments.length ? `<button class="fb-panel-share">🔗 Compartilhar</button>` : ''}
            ${comments.length ? `<button class="fb-panel-export">Exportar TXT</button>` : ''}
            <button class="fb-panel-close" aria-label="Fechar">×</button>
          </div>
        </div>
        <div class="fb-panel-body">${itemsHTML}</div>
      </div>`;

    overlay.querySelector('.fb-panel-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });

    overlay.querySelectorAll('.fb-comment-del').forEach(btn => {
      btn.onclick = () => {
        deleteComment(btn.dataset.id);
        updateBadge();
        overlay.remove();
        openPanel();
      };
    });

    const exportBtn = overlay.querySelector('.fb-panel-export');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const txt = loadAll().map((c, i) =>
          `[${i + 1}] Episódio: ${c.pageId || 'home'}\nSeção: ${c.context}\n${c.location ? `Posição: ${c.location.scrollPct}% da página\n` : ''}Comentário: ${c.text}\nData: ${c.at}\n`
        ).join('\n---\n\n');
        const a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
        a.download = 'feedbacks-learnstation.txt';
        a.click();
      };
    }

    const shareBtn = overlay.querySelector('.fb-panel-share');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const data  = btoa(unescape(encodeURIComponent(JSON.stringify(loadAll()))));
        const url   = window.location.origin + '/feedback.html#' + data;
        navigator.clipboard.writeText(url).then(() => {
          shareBtn.textContent = '✓ Link copiado!';
          setTimeout(() => { shareBtn.textContent = '🔗 Compartilhar'; }, 2500);
        }).catch(() => {
          prompt('Copie este link e envie para o Bruno:', url);
        });
      };
    }

    document.body.appendChild(overlay);
  }

  fab.addEventListener('click', openPanel);

  /* ── Double-click / double-tap listener ── */
  let lastTap = 0;
  document.addEventListener('dblclick', e => {
    if (e.target.closest('.fb-overlay, .fb-panel-overlay, .fb-fab')) return;
    const loc     = captureLocation(e.target);
    const pageId  = new URLSearchParams(location.search).get('ep') || 'home';
    openCommentDialog(loc.heading, pageId, loc);
  });

  // Mobile double-tap
  document.addEventListener('touchend', e => {
    if (e.target.closest('.fb-overlay, .fb-panel-overlay, .fb-fab')) return;
    const now = Date.now();
    if (now - lastTap < 320) {
      e.preventDefault();
      const loc    = captureLocation(e.target);
      const pageId = new URLSearchParams(location.search).get('ep') || 'home';
      openCommentDialog(loc.heading, pageId, loc);
    }
    lastTap = now;
  }, { passive: false });

  // Show hint on first scroll if no comments yet
  window.addEventListener('scroll', function onceHint() {
    if (loadAll().length === 0) showHint();
    window.removeEventListener('scroll', onceHint);
  }, { once: true });
})();
