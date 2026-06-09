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
      <div class="hero-bg-symbol">${featured.thumbnail}</div>
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
          <span><strong>${published}</strong> ${UI[LANG].publishedCount.replace('{published}','').replace('{total}', series.totalEpisodes).trim()}</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
            <span>${pct}%</span>
          </div>
        </div>
      </div>
    `;
    heroBanner.innerHTML = `
      <div class="hero-bg-symbol">${featured.thumbnail}</div>
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

  const grid = $('episodes-grid');
  if (grid) {
    grid.innerHTML = '';
    episodes.forEach((ep, idx) => {
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
          <span>${ep.thumbnail}</span>
          <span class="card-week-badge">${t(ep.weekLabel)}</span>
          <span class="card-status-badge ${locked ? 'coming' : 'available'}">
            ${locked ? UI[LANG].comingSoon : UI[LANG].available}
          </span>
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
      grid.appendChild(card);
    });
  }

  const about = $('about-strip');
  if (about) {
    about.innerHTML = `
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
