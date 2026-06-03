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
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function ytThumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
fetch('content.json')
  .then(r => r.json())
  .then(data => {
    const slug = new URLSearchParams(location.search).get('ep');
    if (slug) renderEpisodePage(data, slug);
    else      renderIndexPage(data);
  })
  .catch(() => {
    document.body.innerHTML =
      '<p style="padding:4rem;color:#999">Erro ao carregar conteúdo.</p>';
  });

/* ══ INDEX PAGE ═══════════════════════════════════════ */
function renderIndexPage(data) {
  const { series, episodes } = data;
  const published = episodes.filter(e => e.status === 'published').length;
  const pct       = Math.round((published / series.totalEpisodes) * 100);
  const featured  = episodes.find(e => e.status === 'published') || episodes[0];

  const heroBanner = $('hero-banner');
  if (heroBanner) {
    heroBanner.innerHTML = `
      <div class="hero-bg-symbol">${featured.thumbnail}</div>
      <div class="hero-content">
        <p class="hero-eyebrow">Série em andamento · ${series.totalEpisodes} episódios</p>
        <h1>${series.title}</h1>
        <p class="hero-subtitle">${series.description}</p>
        <div class="hero-actions">
          <a class="btn-primary" href="episode.html?ep=${featured.slug}">
            ▶ Começar Episódio 1
          </a>
          <button class="btn-ghost" onclick="document.getElementById('all-episodes').scrollIntoView({behavior:'smooth'})">
            Ver todos os episódios
          </button>
        </div>
        <div class="hero-meta">
          <span><strong>${published}</strong> de ${series.totalEpisodes} publicados</span>
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
    episodes.forEach(ep => {
      const locked = ep.status !== 'published';
      const card   = el('div', `episode-card${locked ? ' locked' : ''}`);
      if (!locked) {
        card.addEventListener('click', () => {
          location.href = `episode.html?ep=${ep.slug}`;
        });
      }
      card.innerHTML = `
        <div class="card-thumbnail">
          <span>${ep.thumbnail}</span>
          <span class="card-week-badge">${ep.weekLabel}</span>
          <span class="card-status-badge ${ep.status === 'published' ? 'available' : 'coming'}">
            ${ep.status === 'published' ? 'Disponível' : 'Em breve'}
          </span>
        </div>
        <div class="card-body">
          <p class="card-episode-num">Episódio ${ep.id}</p>
          <h2 class="card-title">${ep.title}</h2>
          <p class="card-tagline">${ep.tagline}</p>
          <div class="card-tags">
            ${ep.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          ${!locked ? '<div class="card-cta">Ler episódio <span>→</span></div>' : ''}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  const about = $('about-strip');
  if (about) {
    about.innerHTML = `
      <div class="about-avatar">🧠</div>
      <div class="about-text">
        <h3>${series.author.name} — ${series.author.role}</h3>
        <p>${series.author.bio}</p>
      </div>
    `;
  }

  const foot = $('footer-text');
  if (foot) foot.textContent = `${series.title} · ${series.author.name} · CI&T`;
  document.title = series.title;
}

/* ══ EPISODE PAGE ═════════════════════════════════════ */
function renderEpisodePage(data, slug) {
  const { series, episodes } = data;
  const ep   = episodes.find(e => e.slug === slug);
  const page = $('episode-page');
  if (!page) return;

  if (!ep || ep.status !== 'published') {
    page.innerHTML = `
      <a class="ep-back" href="index.html">← Todos os episódios</a>
      <p style="color:var(--text-muted);padding:2rem 0">
        Episódio não encontrado ou ainda não publicado.
      </p>`;
    return;
  }

  document.title = `${ep.weekLabel}: ${ep.title} — ${series.title}`;
  initReadProgress();

  const nextIdx = episodes.indexOf(ep) + 1;
  const next    = nextIdx < episodes.length ? episodes[nextIdx] : null;

  /* Opener video — shown before intro if defined */
  const openerHTML = ep.openerVideo
    ? `<div class="ep-opener">
         <p class="ep-opener-label">Assista antes de ler</p>
         <div class="ep-opener-embed">
           <iframe src="https://www.youtube.com/embed/${ep.openerVideo}?rel=0&modestbranding=1"
                   loading="lazy"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowfullscreen></iframe>
         </div>
       </div>`
    : '';

  const sectionsHTML = ep.sections.map(renderSection).join('');

  const nextHTML = next
    ? `<a class="next-ep-teaser" href="${next.status === 'published' ? `episode.html?ep=${next.slug}` : '#'}">
         <div>
           <p class="next-ep-label">Próximo episódio</p>
           <p class="next-ep-title">${next.weekLabel}: ${next.title}</p>
           <p style="font-size:.78rem;color:var(--text-dim);margin-top:.3rem">${next.tagline}</p>
         </div>
         <span class="next-ep-arrow">→</span>
       </a>`
    : '';

  /* Sandbox CTA — always present at end of every published episode */
  const sandboxHTML = `
    <div class="sandbox-cta">
      <div class="sandbox-cta-text">
        <p class="sandbox-cta-eyebrow">Agora é com você</p>
        <p class="sandbox-cta-title">Qual problema da sua área você resolveria com isso?</p>
        <p class="sandbox-cta-desc">Registre sua ideia de aplicação — processo, desafio, hipótese. Leva 2 minutos e é o primeiro passo real da transformação.</p>
      </div>
      <a class="sandbox-btn"
         href="https://docs.google.com/forms/d/e/1FAIpQLSd_PLACEHOLDER/viewform"
         target="_blank" rel="noopener noreferrer">
        <span class="sandbox-btn-icon">💡</span>
        Registrar minha ideia
      </a>
    </div>`;

  page.innerHTML = `
    <a class="ep-back" href="index.html">← Todos os episódios</a>
    <header class="ep-header">
      <p class="ep-week">${ep.weekLabel} · Episódio ${ep.id}</p>
      <h1 class="ep-title">${ep.title}</h1>
      <p class="ep-tagline">${ep.tagline}</p>
      <div class="ep-meta">
        <span>${formatDate(ep.publishedAt)}</span>
        ${ep.duration ? `<span class="dot">${ep.duration}</span>` : ''}
      </div>
      <div class="ep-tags">
        ${ep.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </header>
    ${openerHTML}
    <p class="ep-intro">${ep.intro}</p>
    <article>${sectionsHTML}</article>
    ${nextHTML}
    ${sandboxHTML}
  `;

  const foot = $('footer-text');
  if (foot) foot.textContent = `${series.title} · ${series.author.name} · CI&T`;
}

/* ── Section renderers ──────────────────────────────── */
function renderSection(s) {
  switch (s.type) {

    case 'insight':
    case 'definition':
    case 'reflection':
      return `<div class="ep-section section-${s.type}">
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        <p class="ep-section-body">${s.body}</p>
      </div>`;

    case 'highlight':
      return `<div class="ep-section section-highlight">
        <p class="ep-section-body">"${s.body}"</p>
      </div>`;

    case 'concept':
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        <ul class="concept-list">
          ${s.items.map(item => `
            <li class="concept-item">
              <div>
                <p class="concept-term">${item.term}</p>
                <p class="concept-desc">${item.description}</p>
              </div>
            </li>`).join('')}
        </ul>
      </div>`;

    case 'videos':
      return `<div class="ep-section section-videos">
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:1rem">${s.description}</p>` : ''}
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
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        ${s.description ? `<p class="ep-section-body" style="margin-bottom:1rem">${s.description}</p>` : ''}
        <div class="stats-grid">
          ${s.items.map(st => `
            <div class="stat-card">
              <p class="stat-number">${st.number}</p>
              <p class="stat-label">${st.label}</p>
            </div>`).join('')}
        </div>
      </div>`;

    case 'checkpoint':
      return `<div class="section-checkpoint">
        <p class="checkpoint-label">Pausa para reflexão</p>
        <div class="checkpoint-questions">
          ${s.questions.map((q, i) => `
            <div class="checkpoint-q" id="cpq-${i}">
              <div class="checkpoint-q-text" onclick="toggleCheckpoint('cpq-${i}')">
                <span>${q.question}</span>
                <span class="checkpoint-toggle">▾</span>
              </div>
              <div class="checkpoint-answer">
                <p>${q.answer}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>`;

    default:
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        <p class="ep-section-body">${s.body || ''}</p>
      </div>`;
  }
}

/* ── Checkpoint toggle ───────────────────────────────── */
function toggleCheckpoint(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}
