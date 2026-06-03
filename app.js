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

/* ── Load & route ─────────────────────────────────── */
fetch('content.json')
  .then(r => r.json())
  .then(data => {
    const page = location.pathname.split('/').pop();
    const params = new URLSearchParams(location.search);

    if (page === 'areas.html') {
      renderAreasPage(data, params.get('area'));
    } else if (params.get('ep')) {
      renderEpisodePage(data, params.get('ep'));
    } else {
      renderIndexPage(data);
    }
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

  /* ── Hero banner ── */
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
            ▶ Assistir Episódio 1
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

  /* ── Episodes grid ── */
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

  /* ── About ── */
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

  /* ── Footer ── */
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

  const nextIdx = episodes.indexOf(ep) + 1;
  const next    = nextIdx < episodes.length ? episodes[nextIdx] : null;

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
    <p class="ep-intro">${ep.intro}</p>
    <article>${sectionsHTML}</article>
    ${nextHTML}
  `;

  const foot = $('footer-text');
  if (foot) foot.textContent = `${series.title} · ${series.author.name} · CI&T`;
}

/* ══ AREAS PAGE ═══════════════════════════════════════ */
function renderAreasPage(data, activeId) {
  const { series, areas } = data;
  const page = $('areas-page');
  if (!page || !areas) return;

  const active = areas.find(a => a.id === activeId) || areas[0];

  const footerEl = $('footer-text');
  if (footerEl) footerEl.textContent = `${series.title} · ${series.author.name} · CI&T`;
  document.title = `Para a sua área — ${series.title}`;

  page.innerHTML = `
    <div class="areas-hero">
      <p class="hero-eyebrow">RH em prática</p>
      <h1>O que isso significa para a sua área</h1>
      <p>Cada área de RH tem problemas específicos que a IA Generativa pode resolver hoje — com as ferramentas que você já usa. Escolha a sua área e veja a cena que você vive toda semana, o papel da IA e prompts prontos para testar.</p>
    </div>

    <div class="area-tabs" id="area-tabs">
      ${areas.map(a => `
        <button class="area-tab ${a.id === active.id ? 'active' : ''}"
                onclick="selectArea('${a.id}')">
          <span class="tab-icon">${a.icon}</span>
          ${a.title}
        </button>
      `).join('')}
    </div>

    <div class="area-panel" id="area-panel">
      ${renderAreaPanel(active)}
    </div>
  `;

  window._areasData = areas;
}

function selectArea(id) {
  const areas = window._areasData;
  if (!areas) return;
  const area = areas.find(a => a.id === id);
  if (!area) return;

  document.querySelectorAll('.area-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('onclick').includes(id));
  });

  $('area-panel').innerHTML = renderAreaPanel(area);
  history.replaceState(null, '', `?area=${id}`);
}

function renderAreaPanel(area) {
  return `
    <div class="area-panel-header">
      <div class="area-panel-icon">${area.icon}</div>
      <div class="area-panel-meta">
        <h2 class="area-panel-title">${area.title}</h2>
        <div class="area-tools">
          ${area.tools.map(t => `<span class="tool-badge">${t}</span>`).join('')}
        </div>
        <p class="area-metric">${area.metric}</p>
      </div>
    </div>

    <div class="area-scene">
      <p class="area-scene-label">A cena que você conhece</p>
      <p>${area.scene}</p>
    </div>

    <div class="area-two-col">
      <div class="area-block">
        <p class="area-block-label">O problema real</p>
        <p>${area.problem}</p>
      </div>
      <div class="area-block ai-role">
        <p class="area-block-label">O papel da IA</p>
        <p>${area.aiRole}</p>
      </div>
    </div>

    <p class="experiments-title">Experimentos — o que você pode testar hoje</p>
    <div class="experiment-list">
      ${area.experiments.map((exp, i) => `
        <div class="experiment-card" id="exp-${area.id}-${i}">
          <div class="experiment-header" onclick="toggleExperiment('exp-${area.id}-${i}')">
            <div class="experiment-header-left">
              <p class="experiment-title">${exp.title}</p>
              <p class="experiment-desc">${exp.description}</p>
            </div>
            <span class="experiment-difficulty">${exp.difficulty}</span>
            <span class="experiment-toggle">▾</span>
          </div>
          <div class="experiment-body">
            <p class="prompt-label">📋 Prompt pronto para copiar</p>
            <div class="prompt-box" id="prompt-${area.id}-${i}">${escapeHtml(exp.prompt)}</div>
            <button class="copy-btn" id="copy-${area.id}-${i}"
                    onclick="copyPrompt('${area.id}', ${i})">
              Copiar prompt
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleExperiment(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('open');
}

function copyPrompt(areaId, idx) {
  const promptEl = document.getElementById(`prompt-${areaId}-${idx}`);
  const btnEl    = document.getElementById(`copy-${areaId}-${idx}`);
  if (!promptEl || !btnEl) return;

  navigator.clipboard.writeText(promptEl.textContent).then(() => {
    btnEl.textContent = '✓ Copiado!';
    btnEl.classList.add('copied');
    setTimeout(() => {
      btnEl.textContent = 'Copiar prompt';
      btnEl.classList.remove('copied');
    }, 2000);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

    default:
      return `<div class="ep-section">
        ${s.title ? `<h2 class="ep-section-title">${s.title}</h2>` : ''}
        <p class="ep-section-body">${s.body || ''}</p>
      </div>`;
  }
}
