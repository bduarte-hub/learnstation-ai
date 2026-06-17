/* ═══════════════════════════════════════════════════════
   Orquestrando o Futuro — Learning Portal
   Flow DS aligned · Tabler Icons · sidebar shell
   ═══════════════════════════════════════════════════════ */

/* ── Helpers ──────────────────────────────────────────── */
const $ = id => document.getElementById(id);
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmt(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
}
function yt(id) { return `https://img.youtube.com/vi/${id}/mqdefault.jpg`; }

/* ── Persistent state ─────────────────────────────────── */
const SS = {
  get user()     { return JSON.parse(sessionStorage.getItem('of_user') || 'null'); },
  get nivel()    { return sessionStorage.getItem('of_nivel') || null; },
  get progress() { return JSON.parse(localStorage.getItem('of_progress') || '{}'); },
  set user(v)    { sessionStorage.setItem('of_user', JSON.stringify(v)); },
  set nivel(v)   { sessionStorage.setItem('of_nivel', v); },
  done(id)       { return !!this.progress[id]; },
  markDone(id)   { const p=this.progress; p[id]=true; localStorage.setItem('of_progress',JSON.stringify(p)); },
  stagePct(ids)  { const d=ids.filter(id=>this.done(id)).length; return {done:d,total:ids.length,pct:ids.length?Math.round(d/ids.length*100):0}; }
};

/* ── View router ──────────────────────────────────────── */
let DATA = null;
let activeView = null;

function showView(name, params={}) {
  // Full-page views: hide shell
  const fullpage = name==='onboarding' || name==='assessment';
  $('app-shell').style.display   = fullpage ? 'none' : 'flex';
  document.querySelectorAll('.view-fullpage').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.shell-view').forEach(v => v.classList.remove('active'));

  const viewEl = $('view-'+name);
  if (viewEl) viewEl.classList.add('active');
  activeView = name;

  // Sidebar active state
  [$('nav-portal'), $('nav-episodes')].forEach(b => b?.classList.remove('active'));
  if (name==='portal')   $('nav-portal')?.classList.add('active');
  if (name==='episodes' || name==='episode') $('nav-episodes')?.classList.add('active');

  // Header page title
  const titles = {portal:'Minha jornada', episodes:'Episódios', episode:'Episódio', onboarding:'', assessment:''};
  const hp = $('header-page');
  if (hp) hp.textContent = titles[name] || 'Orquestrando o Futuro';

  // User chip
  updateUserChip();

  window.scrollTo(0,0);

  switch(name) {
    case 'onboarding': renderOnboarding(); break;
    case 'assessment': renderAssessment(); break;
    case 'portal':     renderPortal();     break;
    case 'episodes':   renderEpisodes();   break;
    case 'episode':    renderEpisode(params.slug); break;
  }
}

function updateUserChip() {
  const u = SS.user;
  const nameEl = $('user-name');
  const avatarEl = $('user-avatar');
  if (!u || !u.name) return;
  if (nameEl)   nameEl.textContent  = u.name.split(' ')[0];
  if (avatarEl) avatarEl.innerHTML  = `<span style="font-size:0.75rem;font-weight:700;color:#fff">${u.name.charAt(0).toUpperCase()}</span>`;
}

/* ── Boot ─────────────────────────────────────────────── */
fetch('content.json')
  .then(r => r.json())
  .then(data => {
    DATA = data;
    const params = new URLSearchParams(location.search);
    const slug   = params.get('ep');
    if (slug) {
      if (!SS.user) SS.user = {name:'',area:'',mood:''};
      showView('episode', {slug});
    } else if (!SS.user) {
      showView('onboarding');
    } else {
      showView('portal');
    }
  })
  .catch(() => { document.body.innerHTML = '<p style="padding:4rem 2rem;color:#666">Erro ao carregar conteúdo.</p>'; });

/* ── Sidebar wiring ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  $('nav-portal')?.addEventListener('click',   () => showView('portal'));
  $('nav-episodes')?.addEventListener('click', () => showView('episodes'));
  $('nav-restart')?.addEventListener('click',  () => {
    if (!confirm('Isso vai reiniciar sua jornada. Continuar?')) return;
    sessionStorage.clear();
    showView('onboarding');
  });
});


/* ══════════════════════════════════════════════════════
   ONBOARDING
   ══════════════════════════════════════════════════════ */
function renderOnboarding() {
  const wrap = $('view-onboarding');
  document.title = 'Bem-vindo — Orquestrando o Futuro';
  wrap.innerHTML = `
    <div class="ob-wrap">
      <div class="ob-card">
        <div class="ob-logo-row">
          <div class="ob-logo-mark">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M2 8h4l2-4 3 8 2-4h1" stroke="#0a1a0a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="ob-logo-text">CI&amp;T · Flow</span>
          <span class="ob-logo-sub">/ Orquestrando o Futuro</span>
        </div>
        <div class="ob-progress">
          <div class="ob-dot on" id="od0"></div>
          <div class="ob-dot"    id="od1"></div>
          <div class="ob-dot"    id="od2"></div>
        </div>

        <div class="ob-step on" id="os0">
          <p class="ob-eyebrow">Bem-vindo</p>
          <h1 class="ob-h1">Antes de começar, me conta um pouco sobre você</h1>
          <p class="ob-p">Vamos personalizar sua jornada de aprendizagem em IA Agêntica.</p>
          <label class="field-label" for="ob-name">Qual é o seu nome?</label>
          <input class="input" id="ob-name" type="text" placeholder="Digite seu nome…" autocomplete="off">
          <div class="ob-footer"><span></span><button class="btn btn-primary btn-lg" id="obn0" disabled>Continuar <i class="ti ti-arrow-right"></i></button></div>
        </div>

        <div class="ob-step" id="os1">
          <p class="ob-eyebrow">Sua área</p>
          <h1 class="ob-h1">Em qual área você atua?</h1>
          <p class="ob-p">Vamos conectar IA com os desafios do seu dia a dia.</p>
          <div class="opt-grid cols-2">
            <div class="opt-card" data-g="area" data-v="talent-acquisition"><span class="opt-icon">🎯</span><div><p class="opt-name">Talent Acquisition</p><p class="opt-desc">R&S, triagem, shortlist</p></div></div>
            <div class="opt-card" data-g="area" data-v="business-partner"><span class="opt-icon">🤝</span><div><p class="opt-name">Business Partner</p><p class="opt-desc">Performance, retenção</p></div></div>
            <div class="opt-card" data-g="area" data-v="people-services"><span class="opt-icon">⚙️</span><div><p class="opt-name">People Services</p><p class="opt-desc">Payroll, benefícios</p></div></div>
            <div class="opt-card" data-g="area" data-v="learning"><span class="opt-icon">📚</span><div><p class="opt-name">Learning &amp; Engagement</p><p class="opt-desc">L&D, trilhas</p></div></div>
            <div class="opt-card" data-g="area" data-v="comms"><span class="opt-icon">📢</span><div><p class="opt-name">Comms &amp; ESG</p><p class="opt-desc">Comunicação, cultura</p></div></div>
            <div class="opt-card" data-g="area" data-v="executive"><span class="opt-icon">🏆</span><div><p class="opt-name">Executive Mastery</p><p class="opt-desc">Líderes de alto impacto</p></div></div>
          </div>
          <div class="ob-footer"><button class="btn-link" id="obb1">← Voltar</button><button class="btn btn-primary btn-lg" id="obn1" disabled>Continuar <i class="ti ti-arrow-right"></i></button></div>
        </div>

        <div class="ob-step" id="os2">
          <p class="ob-eyebrow">Momento atual</p>
          <h1 class="ob-h1" id="ob-mood-h">Como você está chegando nessa jornada?</h1>
          <p class="ob-p">Sem certo ou errado — queremos entender como receber você melhor.</p>
          <div class="opt-grid cols-1">
            <div class="opt-card" data-g="mood" data-v="animado"><span class="opt-icon">🚀</span><div><p class="opt-name">Animado e curioso</p><p class="opt-desc">Quero entender tudo e já imagino como aplicar.</p></div></div>
            <div class="opt-card" data-g="mood" data-v="cauteloso"><span class="opt-icon">🧭</span><div><p class="opt-name">Cauteloso e explorando</p><p class="opt-desc">Tenho dúvidas — quero entender antes de opinar.</p></div></div>
            <div class="opt-card" data-g="mood" data-v="receoso"><span class="opt-icon">😬</span><div><p class="opt-name">Um pouco receoso</p><p class="opt-desc">Tenho dúvidas sobre o impacto no meu papel.</p></div></div>
            <div class="opt-card" data-g="mood" data-v="pragmatico"><span class="opt-icon">⚡</span><div><p class="opt-name">Pragmático e focado</p><p class="opt-desc">Sem teoria — quero o que funciona agora.</p></div></div>
          </div>
          <div class="ob-footer"><button class="btn-link" id="obb2">← Voltar</button><button class="btn btn-primary btn-lg" id="obn2" disabled>Começar <i class="ti ti-arrow-right"></i></button></div>
        </div>
      </div>
    </div>`;

  const st = {name:'',area:'',mood:''};
  function goStep(n) {
    wrap.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('on'));
    wrap.querySelector('#os'+n).classList.add('on');
    [0,1,2].forEach(i=>wrap.querySelector('#od'+i).classList.toggle('on',i<=n));
    if (n===2 && st.name) $('ob-mood-h').textContent = st.name.split(' ')[0]+', como você está chegando nessa jornada?';
  }

  const ni = $('ob-name');
  ni.addEventListener('input',  () => { st.name=ni.value.trim(); $('obn0').disabled=!st.name; });
  ni.addEventListener('keydown',e => { if(e.key==='Enter'&&st.name) goStep(1); });
  $('obn0').addEventListener('click', () => { if(st.name) goStep(1); });

  wrap.addEventListener('click', e => {
    const c = e.target.closest('.opt-card'); if(!c) return;
    c.closest('.opt-grid').querySelectorAll('.opt-card').forEach(x=>x.classList.remove('on'));
    c.classList.add('on');
    st[c.dataset.g] = c.dataset.v;
    if (c.dataset.g==='area') $('obn1').disabled=false;
    if (c.dataset.g==='mood') $('obn2').disabled=false;
  });

  $('obb1').addEventListener('click', () => goStep(0));
  $('obn1').addEventListener('click', () => { if(st.area) goStep(2); });
  $('obb2').addEventListener('click', () => goStep(1));
  $('obn2').addEventListener('click', () => { if(!st.mood) return; SS.user=st; showView('assessment'); });
}


/* ══════════════════════════════════════════════════════
   ASSESSMENT
   ══════════════════════════════════════════════════════ */
const QS = [
  { q:'Quando você pensa em usar IA no trabalho, qual mais se aproxima do que você faz hoje?',
    ctx:'Não existe resposta certa — queremos entender seu ponto de partida.',
    opts:[
      {l:'Nunca usei ou raramente — não sei bem por onde começar.',s:0},
      {l:'Uso ChatGPT ou similar para tarefas pontuais: resumir textos, rascunhar e-mails.',s:1},
      {l:'Tenho rotina com IA: ferramentas diversas, bons prompts, experimento casos novos.',s:2},
      {l:'Já montei fluxos ou automações com IA — conecto ferramentas e penso em escala.',s:3}
    ]},
  { q:'Imagine analisar 200 currículos. Qual seu nível de conforto para usar IA nisso?',
    ctx:'Pense em como você abordaria hoje — não como gostaria de abordar no futuro.',
    opts:[
      {l:'Não me sinto confortável — não sei como a IA me ajudaria.',s:0},
      {l:'Tentaria usar o ChatGPT para resumir alguns, sem processo estruturado.',s:1},
      {l:'Saberia montar prompt completo com contexto, critérios e formato de saída.',s:2},
      {l:'Pensaria direto em criar um agente ou fluxo automatizado.',s:3}
    ]},
  { q:'O que são agentes de IA?',
    ctx:'Escolha a alternativa que melhor descreve seu entendimento atual.',
    opts:[
      {l:'Não sei — ouço falar mas não tenho clareza.',s:0},
      {l:'São assistentes como ChatGPT ou Claude que respondem perguntas.',s:0},
      {l:'São sistemas que executam tarefas autonomamente, usando ferramentas em múltiplos passos.',s:2},
      {l:'São pipelines que orquestram múltiplos modelos e ferramentas com supervisão mínima.',s:3}
    ]},
  { q:'Qual frase mais se parece com como você pensa sobre IA no RH?',
    ctx:'Escolha a que mais ressoa com seu momento atual.',
    opts:[
      {l:'Ainda entendendo o básico — quero saber o que é antes de experimentar.',s:0},
      {l:'Já entendo, mas quero aprender a usar melhor no meu trabalho.',s:1},
      {l:'Já uso bem — quero construir fluxos e automações para minha área.',s:2},
      {l:'Quero ser referência em AI no RH — liderar experimentos e construir soluções.',s:3}
    ]}
];

const LV = {
  basico:        {badge:'🟢 Nível Base',         cls:'badge-brand',   title:'Você está no lugar certo para começar.',           desc:'Sua jornada cobre fundamentos de IA Generativa, uso seguro de dados de pessoas e os primeiros passos práticos com o Claude.'},
  intermediario: {badge:'🟡 Nível Intermediário', cls:'badge-warning', title:'Você já tem base — hora de ganhar profundidade.',   desc:'Sua jornada foca em projetos com contexto fixo, Skills reutilizáveis de RH e primeiros passos em orquestração de agentes.'},
  avancado:      {badge:'🔴 Nível Avançado',      cls:'badge-indigo',  title:'Você está pronto para orquestrar.',                 desc:'Sua jornada vai direto ao AI Orchestrator path completo e VSM de processos. Objetivo: sair como AI Champion da sua área.'}
};

function calcLevel(ans) {
  const t = ans.reduce((s,a,i)=>s+(a!=null?QS[i].opts[a].s:0),0);
  return t<=2?'basico':t<=5?'intermediario':'avancado';
}

function renderAssessment() {
  const wrap = $('view-assessment');
  document.title = 'Nivelamento — Orquestrando o Futuro';
  const user = SS.user||{};
  const ans  = new Array(QS.length).fill(null);
  let cur    = 0;

  function qHTML() {
    const q=QS[cur], ltrs=['A','B','C','D'];
    return `
      <div class="as-prog-row">
        <div class="as-prog-bar"><div class="as-prog-fill" id="as-fill" style="width:${Math.round(cur/QS.length*100)}%"></div></div>
        <span class="as-prog-label">Pergunta ${cur+1} de ${QS.length}</span>
      </div>
      <p class="as-eyebrow">Nivelamento</p>
      <h2 class="as-q">${q.q}</h2>
      <p class="as-ctx">${q.ctx}</p>
      <div class="as-opts">
        ${q.opts.map((o,i)=>`
          <div class="as-opt${ans[cur]===i?' on':''}" data-i="${i}">
            <span class="as-letter">${ltrs[i]}</span>
            <span class="as-opt-text">${o.l}</span>
          </div>`).join('')}
      </div>
      <div class="as-footer">
        <button class="btn-link" id="as-prev" style="visibility:${cur===0?'hidden':'visible'}">← Anterior</button>
        <button class="btn btn-primary btn-lg" id="as-next" ${ans[cur]===null?'disabled':''}>${cur<QS.length-1?'Próxima <i class="ti ti-arrow-right"></i>':'Ver resultado <i class="ti ti-arrow-right"></i>'}</button>
      </div>`;
  }

  function resHTML(nivel) {
    const r=LV[nivel], nm=user.name?user.name.split(' ')[0]:'';
    return `
      <div class="as-prog-row">
        <div class="as-prog-bar"><div class="as-prog-fill" style="width:100%"></div></div>
        <span class="as-prog-label">Concluído <i class="ti ti-check"></i></span>
      </div>
      <div class="as-result-wrap">
        <span class="badge ${r.cls}">${r.badge}</span>
        <h2 class="as-result-title">${nm?nm+', '+r.title.charAt(0).toLowerCase()+r.title.slice(1):r.title}</h2>
        <p class="as-result-desc">${r.desc}</p>
        <div class="as-result-btns">
          <button class="btn btn-primary btn-lg" id="as-go">Ver minha jornada <i class="ti ti-arrow-right"></i></button>
          <button class="btn btn-ghost btn-md" id="as-redo">Refazer o assessment</button>
        </div>
      </div>`;
  }

  function render() {
    wrap.innerHTML = `<div class="as-wrap"><div class="as-card" id="as-card">${qHTML()}</div></div>`;
    wire();
  }

  function wire() {
    const card=$('as-card'), ac=new AbortController(), s=ac.signal;
    card.addEventListener('click', e=>{
      const o=e.target.closest('.as-opt'); if(!o) return;
      const i=parseInt(o.dataset.i); ans[cur]=i;
      card.querySelectorAll('.as-opt').forEach((x,j)=>x.classList.toggle('on',j===i));
      $('as-next').disabled=false;
    },{signal:s});
    $('as-prev')?.addEventListener('click',()=>{ ac.abort(); cur--; card.innerHTML=qHTML(); wire(); },{signal:s});
    $('as-next')?.addEventListener('click',()=>{
      if(ans[cur]===null) return; ac.abort();
      if(cur<QS.length-1){ cur++; card.innerHTML=qHTML(); wire(); }
      else {
        const nivel=calcLevel(ans); SS.nivel=nivel;
        card.innerHTML=resHTML(nivel);
        $('as-go').addEventListener('click',()=>showView('portal'));
        $('as-redo').addEventListener('click',()=>renderAssessment());
      }
    },{signal:s});
  }

  render();
}


/* ══════════════════════════════════════════════════════
   CURRICULUM DATA
   ══════════════════════════════════════════════════════ */
const STAGES = [
  { id:'s1', label:'Estágio 1', icon:'ti-brain',
    title:'Fundamentos de IA Generativa',
    subtitle:'Do que a IA é ao que pode dar errado — base para todos',
    levels:['basico','intermediario','avancado'],
    mods:[
      {id:'ep1',    type:'ep',   slug:'ai-basics',                    title:'AI Basics',                    src:'serie',     srcL:'Série',           desc:'Do que a IA discrimina ao que ela cria — entendendo o motor por dentro.', dur:'14 min', req:true},
      {id:'genai',  type:'link', url:'https://university.ciandt.com/plus/catalog/courses/455', title:'GEN AI Basic', src:'ciandt', srcL:'CI&T University', desc:'Fundamentos de IA generativa — o que é, como funciona, capacidades e limites.', dur:'~1h', req:true},
      {id:'ep2',    type:'ep',   slug:'engenharia-de-prompt',          title:'Engenharia de Prompt',          src:'serie',     srcL:'Série',           desc:'A qualidade do que você pede determina a qualidade do que você recebe.', dur:'12 min', req:true},
      {id:'c101',   type:'link', url:'https://anthropic-partners.skilljar.com/claude-101', title:'Claude 101', src:'anthropic', srcL:'Anthropic', desc:'Interface, projetos, artefatos, conexão com ferramentas externas e skills.', dur:'~1h', req:true},
      {id:'genai-hr',type:'link',url:'https://linkedin.com/learning/generative-ai-in-hr', title:'Generative AI in HR', src:'linkedin', srcL:'LinkedIn Learning', desc:'Como times de RH usam IA — recrutamento, onboarding, L&D.', dur:'~1–2h', req:true},
      {id:'ep3',    type:'ep',   slug:'deep-learning-e-modelos-genai', title:'Deep Learning e Modelos GenAI', src:'serie',     srcL:'Série',           desc:'RAG, alucinação e as capacidades que existem hoje.', dur:'13 min', req:true},
      {id:'ep4',    type:'ep',   slug:'responsabilidade-social',       title:'Responsabilidade Social',       src:'serie',     srcL:'Série',           desc:'Deepfakes, vieses, direito autoral e o que o RH precisa saber.', dur:'11 min', req:true},
      {id:'c-hr',   type:'link', url:'https://claude.com/resources/tutorials/claude-for-human-resources', title:'Claude for Human Resources', src:'anthropic', srcL:'Anthropic', desc:'Exemplos práticos no RH com orientações de segurança.', dur:'~20min', req:true},
      {id:'gov',    type:'link', url:null, title:'Governança de Dados — IA em People', src:'interno', srcL:'Interno', desc:'O que pode e não pode com dados sensíveis. Pré-requisito obrigatório.', dur:'~30min', req:true, soon:true}
    ]
  },
  { id:'s2', label:'Estágio 2', icon:'ti-tool',
    title:'De usuária para diretora',
    subtitle:'Projetos, skills e os primeiros agentes',
    levels:['basico','intermediario','avancado'],
    mods:[
      {id:'soft',   type:'link', url:'https://linkedin.com/learning/paths/ci-t-gen-ai-soft-skills?u=451056106', title:'GEN AI Soft Skills', src:'linkedin', srcL:'LinkedIn Learning', desc:'Como trabalhar com IA de forma crítica, ética e colaborativa.', dur:'~1h', req:true},
      {id:'proj',   type:'link', url:'https://claude.com/resources/tutorials/intro-to-projects', title:'Intro to Projects', src:'anthropic', srcL:'Anthropic', desc:'Organize conversas e documentos com contexto fixo por subárea.', dur:'~20min', req:true},
      {id:'cow',    type:'link', url:'https://anthropic-partners.skilljar.com/introduction-to-claude-cowork', title:'Introduction to Claude Cowork', src:'anthropic', srcL:'Anthropic', desc:'Claude como agente que opera o computador com supervisão humana.', dur:'~1h', req:true},
      {id:'skills', type:'link', url:'https://anthropic-partners.skilljar.com/introduction-to-agent-skills', title:'Introduction to Agent Skills', src:'anthropic', srcL:'Anthropic', desc:'Construa, configure e compartilhe Skills reutilizáveis de RH.', dur:'~1h', req:true},
      {id:'orch12', type:'link', url:'https://linkedin.com/learning/paths/ci-t-gen-ai-orchestrator-certification-pathway?u=451056106', title:'AI Orchestrator — Módulos 1 e 2', src:'linkedin', srcL:'LinkedIn Learning', desc:'Introdução ao conceito de fluxos multi-agente.', dur:'~1–2h', req:true},
      {id:'lean',   type:'link', url:'https://linkedin.com/learning/paths/ci-t-lean-kickstart?u=451056106', title:'Lean Kick Start', src:'linkedin', srcL:'LinkedIn Learning', desc:'Mentalidade lean para workflows com IA.', dur:'~1h', req:false}
    ]
  },
  { id:'s3', label:'Estágio 3', icon:'ti-rocket',
    title:'Orquestração',
    subtitle:'AI Champions — construa e lidere fluxos agênticos',
    levels:['intermediario','avancado'],
    mods:[
      {id:'native', type:'link', url:'https://www.frameworkainative.org/metodologia', title:'AI Native Metodologia', src:'interno', srcL:'Framework AI Native', desc:'Como organizações se transformam com IA — contexto estratégico.', dur:'~2h', req:false},
      {id:'orch',   type:'link', url:'https://linkedin.com/learning/paths/ci-t-gen-ai-orchestrator-certification-pathway?u=451056106', title:'AI Orchestrator — Path Completo', src:'linkedin', srcL:'LinkedIn Learning', desc:'Orquestração de múltiplos agentes, design de fluxos e coordenação.', dur:'~3–4h', req:true},
      {id:'vsm',    type:'link', url:null, title:'VSM Pre-work', src:'interno', srcL:'Template Interno', desc:'Mapeie 2–3 processos reais da sua área com Value Stream Mapping para People.', dur:'~1–2h', req:true, soon:true}
    ]
  }
];


/* ══════════════════════════════════════════════════════
   PORTAL
   ══════════════════════════════════════════════════════ */
function renderPortal() {
  const wrap   = $('view-portal');
  const user   = SS.user||{};
  const nivel  = SS.nivel||'basico';
  const name   = user.name ? user.name.split(' ')[0] : 'você';
  document.title = 'Minha Jornada — Orquestrando o Futuro';

  const visible = STAGES.filter(s=>s.levels.includes(nivel));
  const allIds  = visible.flatMap(s=>s.mods.map(m=>m.id));
  const overall = SS.stagePct(allIds);
  const lv = LV[nivel];

  wrap.innerHTML = `
    <div class="portal-scroll" id="portal-scroll">
      <div class="portal-inner">
        <div class="portal-welcome">
          <div>
            <h1 class="portal-greeting">Olá, ${esc(name)} <span class="badge ${lv.cls} badge-sm" style="vertical-align:middle">${lv.badge}</span></h1>
            <p class="portal-sub">Continue de onde parou — ${overall.done} de ${overall.total} módulos concluídos</p>
          </div>
          <div class="portal-overall">
            <span class="portal-overall-pct">${overall.pct}%</span>
            <div class="portal-overall-info"><strong>${overall.done}/${overall.total}</strong>módulos</div>
          </div>
        </div>
        <div class="stages" id="portal-stages"></div>
      </div>
    </div>`;

  const stagesEl = $('portal-stages');

  visible.forEach((stage, si) => {
    const sp = SS.stagePct(stage.mods.map(m=>m.id));
    const prev = visible[si-1];
    const unlocked = !prev || SS.stagePct(prev.mods.map(m=>m.id)).pct >= 70;
    const isDone   = sp.pct === 100;
    const sCls     = !unlocked ? 's-locked' : isDone ? 's-done' : 's-active';

    let pillCls='badge-neutral', pillTxt='Não iniciado';
    if (isDone)         { pillCls='badge-brand';   pillTxt='Concluído ✓'; }
    else if (sp.done>0) { pillCls='badge-warning';  pillTxt=`${sp.done}/${sp.mods||sp.total} feitos`; }

    const el = document.createElement('div');
    el.className = `stage ${sCls}`;
    el.dataset.sid = stage.id;

    const iconLabel = isDone ? '✓' : !unlocked ? `<i class="ti ti-lock"></i>` : `<i class="${stage.icon} ti"></i>`;

    el.innerHTML = `
      <div class="stage-hd" id="shd-${stage.id}">
        <div class="stage-icon">${iconLabel}</div>
        <div class="stage-info">
          <p class="stage-lbl">${stage.label}</p>
          <p class="stage-title">${stage.title}</p>
          <p class="stage-subtitle">${stage.subtitle}</p>
        </div>
        <div class="stage-right">
          <span class="badge ${pillCls} badge-sm">${pillTxt}</span>
          <i class="ti ti-chevron-down stage-arrow"></i>
        </div>
      </div>
      <div class="stage-prog-wrap" style="padding-bottom:${unlocked?'0.875rem':'0'}">
        ${unlocked ? `<div class="stage-prog-bar"><div class="stage-prog-fill" style="width:${sp.pct}%"></div></div>` : ''}
      </div>
      <div class="stage-body" id="sbody-${stage.id}">
        ${unlocked ? buildModList(stage.mods) : `<div class="stage-locked-msg"><i class="ti ti-lock"></i> Complete 70% do Estágio ${si} para desbloquear.</div>`}
      </div>`;

    stagesEl.appendChild(el);

    el.querySelector('#shd-'+stage.id).addEventListener('click', () => {
      if (!unlocked) return;
      el.classList.toggle('open');
    });

    // Auto-open first active stage
    if (unlocked && !isDone && si===0) el.classList.add('open');
    if (unlocked && !isDone && si>0 && sp.done>0) el.classList.add('open');
  });

  // Module click delegation
  wrap.addEventListener('click', e => {
    const doneBtn = e.target.closest('.mod-btn-done');
    if (doneBtn) { e.stopPropagation(); SS.markDone(doneBtn.dataset.mid); renderPortal(); return; }
    const openBtn = e.target.closest('.mod-btn-open');
    if (openBtn) {
      e.stopPropagation();
      if (openBtn.dataset.slug) showView('episode', {slug: openBtn.dataset.slug});
      return;
    }
    const mod = e.target.closest('.mod[data-mid]');
    if (mod && !e.target.closest('button,a')) {
      const slug = mod.dataset.slug, url = mod.dataset.url;
      if (slug) showView('episode', {slug});
      else if (url) window.open(url,'_blank','noopener');
    }
  });
}

function buildModList(mods) {
  const sc = {linkedin:'src-linkedin', anthropic:'src-anthropic', ciandt:'src-ciandt', interno:'src-interno', serie:'src-serie'};
  return `<div class="mod-list"><p class="mod-list-hdr">${mods.length} módulo${mods.length>1?'s':''}</p>` +
    mods.map(m => {
      const done = SS.done(m.id);
      const openBtn = m.soon
        ? `<span style="font-size:0.7rem;color:var(--text-dim);display:flex;align-items:center;gap:0.3rem"><i class="ti ti-clock"></i> Em breve</span>`
        : m.type==='ep'
          ? `<button class="mod-btn-open" data-slug="${esc(m.slug)}"><i class="ti ti-book-open"></i> Ler</button>`
          : m.url
            ? `<a class="mod-btn-open" href="${esc(m.url)}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Acessar</a>`
            : '';

      return `
        <div class="mod${done?' done':''}${m.soon?' coming':''}" data-mid="${m.id}" ${m.type==='ep'?`data-slug="${esc(m.slug)}"`:`data-url="${esc(m.url||'')}"`}>
          <div class="mod-check">${done?'✓':''}</div>
          <div class="mod-body">
            <p class="mod-title">${m.title}</p>
            <p class="mod-desc">${m.desc}</p>
            <div class="mod-meta">
              <span class="src-badge ${sc[m.src]||'src-serie'}">${m.srcL}</span>
              <span class="mod-dur"><i class="ti ti-clock" style="font-size:0.65rem"></i> ${m.dur}</span>
              ${m.req?'<span class="mod-req">obrigatório</span>':''}
            </div>
          </div>
          <div class="mod-actions">
            ${openBtn}
            ${!m.soon?`<button class="mod-btn-done${done?' is-done':''}" data-mid="${m.id}">${done?'<i class="ti ti-check"></i> Feito':'Marcar feito'}</button>`:''}
          </div>
        </div>`;
    }).join('') + '</div>';
}


/* ══════════════════════════════════════════════════════
   EPISODES GRID
   ══════════════════════════════════════════════════════ */
function renderEpisodes() {
  if (!DATA) return;
  const {episodes} = DATA;
  const wrap = $('view-episodes');
  document.title = 'Episódios — Orquestrando o Futuro';

  const cards = episodes.map(ep => {
    const locked = ep.status !== 'published';
    const mid    = STAGES.flatMap(s=>s.mods).find(m=>m.slug===ep.slug)?.id;
    const done   = mid ? SS.done(mid) : false;
    return `
      <div class="ep-card${locked?' locked':''}" data-slug="${esc(ep.slug)}" data-locked="${locked}">
        <div class="ep-thumb">
          <span>${ep.thumbnail}</span>
          <span class="ep-week-badge">${ep.weekLabel}</span>
          <span class="ep-status-badge ${locked?'soon':'avail'}">${locked?'Em breve':'Disponível'}</span>
          ${done?'<div class="ep-done-ring">✓</div>':''}
        </div>
        <div class="ep-body">
          <p class="ep-num">Episódio ${ep.id}</p>
          <p class="ep-title">${ep.title}</p>
          <p class="ep-tagline">${ep.tagline}</p>
          <div class="ep-tags">${ep.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          ${!locked?'<div class="ep-cta">Ler <i class="ti ti-arrow-right"></i></div>':''}
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="ep-grid-scroll">
      <div class="ep-grid-inner">
        <p class="ep-grid-title">Todos os episódios</p>
        <div class="ep-grid">${cards}</div>
      </div>
    </div>`;

  wrap.addEventListener('click', e => {
    const card = e.target.closest('.ep-card[data-slug]');
    if (!card || card.dataset.locked==='true') return;
    showView('episode', {slug: card.dataset.slug});
  });
}


/* ══════════════════════════════════════════════════════
   EPISODE PAGE
   ══════════════════════════════════════════════════════ */
let rp = null, rpRef = null;
function initRP() {
  if (!rp) {
    rp = document.createElement('div'); rp.className='read-progress';
    document.body.prepend(rp);
    rpRef = () => {
      const scroll = document.querySelector('.ep-page-scroll');
      if (!scroll || !rp) return;
      const pct = scroll.scrollHeight - scroll.clientHeight > 0
        ? Math.min(1, scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight)) : 0;
      rp.style.transform = `scaleX(${pct})`;
    };
  }
  rp.style.transform = 'scaleX(0)';
}

function renderEpisode(slug) {
  if (!DATA) return;
  const {episodes} = DATA;
  const wrap = $('view-episode');
  const ep   = episodes.find(e=>e.slug===slug);
  document.title = ep ? `${ep.title} — Orquestrando o Futuro` : 'Orquestrando o Futuro';
  initRP();

  if (!ep || ep.status!=='published') {
    wrap.innerHTML=`<div class="ep-page-scroll"><div class="ep-page-inner"><button class="ep-back" id="ep-back"><i class="ti ti-arrow-left"></i> Voltar</button><p style="color:var(--text-muted);padding:2rem 0">Episódio não publicado ainda.</p></div></div>`;
    $('ep-back').addEventListener('click',()=>showView('portal'));
    return;
  }

  const next = episodes[episodes.indexOf(ep)+1] || null;
  const mid  = STAGES.flatMap(s=>s.mods).find(m=>m.slug===slug)?.id;
  const done = mid ? SS.done(mid) : false;
  const ometa = ep.openerVideoMeta||{};

  const openerHTML = ep.openerVideo ? `
    <div class="ep-opener">
      <p class="ep-opener-label"><i class="ti ti-player-play-filled"></i> Ative a intuição antes de ler${ometa.channel?` · <span style="color:var(--text-muted);font-weight:500;text-transform:none;letter-spacing:0">${ometa.channel}</span>`:''}</p>
      <div class="ep-opener-embed"><iframe src="https://www.youtube.com/embed/${ep.openerVideo}?rel=0&modestbranding=1" title="${esc(ometa.title||'')}" loading="lazy" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>
    </div>` : '';

  const nextHTML = next && next.status==='published' ? `
    <div class="next-ep" data-slug="${esc(next.slug)}" tabindex="0" role="button">
      <div>
        <p class="next-ep-lbl">Próximo episódio</p>
        <p class="next-ep-title">${next.weekLabel}: ${next.title}</p>
        <p class="next-ep-sub">${next.tagline}</p>
      </div>
      <span class="next-ep-arrow"><i class="ti ti-arrow-right"></i></span>
    </div>` : '';

  const markDoneHTML = mid ? `
    <div class="ep-mark-done-wrap">
      <button class="btn ${done?'btn-brand-ghost':'btn-primary'} btn-lg" id="ep-mark-done">
        <i class="ti ${done?'ti-check':'ti-circle-check'}"></i>
        ${done ? 'Episódio concluído' : 'Marcar como concluído'}
      </button>
    </div>` : '';

  wrap.innerHTML = `
    <div class="ep-page-scroll" id="ep-scroll">
      <div class="ep-page-inner">
        <button class="ep-back" id="ep-back"><i class="ti ti-arrow-left"></i> Voltar à jornada</button>
        <header>
          <p class="ep-hd-eyebrow">${ep.weekLabel} · Episódio ${ep.id}</p>
          <h1 class="ep-hd-title">${ep.title}</h1>
          <p class="ep-hd-tagline">${ep.tagline}</p>
          <div class="ep-hd-meta">
            <span>${fmt(ep.publishedAt)}</span>
            ${ep.duration?`<span class="dot">${ep.duration}</span>`:''}
          </div>
          <div class="ep-hd-tags">${ep.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </header>
        ${openerHTML}
        <p class="ep-intro">${ep.intro}</p>
        <article>${ep.sections.map(renderSec).join('')}</article>
        ${nextHTML}
        ${markDoneHTML}
        <div class="sandbox">
          <div class="sandbox-text">
            <p class="sandbox-eyebrow">Agora é com você</p>
            <p class="sandbox-title">Qual problema da sua área você resolveria com isso?</p>
            <p class="sandbox-desc">Registre sua ideia — processo, desafio, hipótese. 2 minutos e é o primeiro passo real.</p>
          </div>
          <a class="sandbox-btn" href="https://docs.google.com/forms/d/e/1FAIpQLSd_PLACEHOLDER/viewform" target="_blank" rel="noopener"><i class="ti ti-bulb"></i> Registrar ideia</a>
        </div>
      </div>
    </div>`;

  $('ep-back').addEventListener('click', () => showView('portal'));

  if (mid && !done) {
    $('ep-mark-done')?.addEventListener('click', () => { SS.markDone(mid); renderEpisode(slug); });
  }

  const nxt = wrap.querySelector('.next-ep[data-slug]');
  if (nxt) {
    const go = () => showView('episode', {slug: nxt.dataset.slug});
    nxt.addEventListener('click', go);
    nxt.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' ')go();});
  }

  const scroll = $('ep-scroll');
  if (scroll && rpRef) scroll.addEventListener('scroll', rpRef, {passive:true});
}

/* ── Section renderers ──────────────────────────────── */
function renderSec(s) {
  switch(s.type) {
    case 'insight': case 'definition': case 'reflection':
      return `<div class="ep-sec ep-sec-${s.type}">${s.title?`<h2 class="ep-sec-title">${s.title}</h2>`:''}<p class="ep-sec-body">${s.body}</p></div>`;
    case 'highlight':
      return `<div class="ep-sec ep-sec-highlight"><p class="ep-sec-body">"${s.body}"</p></div>`;
    case 'concept':
      return `<div class="ep-sec">${s.title?`<h2 class="ep-sec-title">${s.title}</h2>`:''}<ul class="concept-list">${s.items.map(it=>`<li class="concept-item"><div><p class="concept-term">${it.term}</p><p class="concept-desc">${it.description}</p></div></li>`).join('')}</ul></div>`;
    case 'videos':
      return `<div class="ep-sec">${s.title?`<h2 class="ep-sec-title">${s.title}</h2>`:''}<div class="video-grid">${s.items.map(v=>`
        <a class="video-card" href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" rel="noopener">
          <div class="video-thumb"><img src="${yt(v.videoId)}" alt="${esc(v.title)}" loading="lazy"><div class="video-play"><span>▶</span></div></div>
          <div class="video-info"><p class="video-channel">${v.channel}</p><p class="video-title">${v.title}</p>${v.duration?`<p class="video-dur">${v.duration}</p>`:''}</div>
        </a>`).join('')}</div></div>`;
    case 'stats':
      return `<div class="ep-sec">${s.title?`<h2 class="ep-sec-title">${s.title}</h2>`:''}<div class="stats-grid">${s.items.map(st=>`<div class="stat-card"><p class="stat-num">${st.number}</p><p class="stat-label">${st.label}</p></div>`).join('')}</div></div>`;
    case 'checkpoint':
      return `<div class="checkpoint"><p class="checkpoint-lbl">Pausa para reflexão</p>${s.questions.map((q,i)=>`
        <div class="cp-q" id="cpq${i}">
          <div class="cp-q-text" onclick="toggleCp('cpq${i}')"><span>${q.question}</span><span class="cp-toggle">▾</span></div>
          <div class="cp-answer"><p>${q.answer}</p></div>
        </div>`).join('')}</div>`;
    default:
      return `<div class="ep-sec">${s.title?`<h2 class="ep-sec-title">${s.title}</h2>`:''}<p class="ep-sec-body">${s.body||''}</p></div>`;
  }
}

function toggleCp(id) { document.getElementById(id)?.classList.toggle('open'); }
