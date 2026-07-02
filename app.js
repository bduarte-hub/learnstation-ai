/* ═══════════════════════════════════════════════════════
   Agentic HR — Learning Portal
   Flow DS aligned · Tabler Icons · sidebar shell
   ═══════════════════════════════════════════════════════ */

/* ── Onboarding background shader (WebGL neural net) ───── */
function initObShader() {
  const canvas = document.getElementById('ob-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { fallbackObBg(canvas); return; }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vsrc = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;
  const fsrc = `
    precision mediump float;
    uniform float u_t;
    uniform vec2  u_res;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // Smooth noise
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i), b = hash(i + vec2(1,0));
      float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
    }

    // Fbm — layered noise for organic feel
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p  = p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p  = uv * 3.5 + vec2(u_t * 0.04, u_t * 0.02);

      // Base fbm flow
      float f1 = fbm(p);
      float f2 = fbm(p + vec2(f1 * 1.8, f1 * 1.2) + vec2(u_t * 0.03));
      float f3 = fbm(p + f2 * 2.0);

      // Color blend: deep navy → coral glow → indigo
      vec3 navy  = vec3(0.059, 0.106, 0.24);   // #0f1b3d
      vec3 coral = vec3(0.98, 0.353, 0.314);    // #FA5A50
      vec3 indigo= vec3(0.231, 0.51, 0.965);    // #3b82f6
      vec3 dark  = vec3(0.04, 0.08, 0.18);

      float t1 = smoothstep(0.3, 0.75, f2);
      float t2 = smoothstep(0.55, 0.9, f3);

      vec3 col = mix(dark, navy, f1);
      col = mix(col, coral * 0.35, t1 * 0.6);
      col = mix(col, indigo * 0.25, t2 * 0.5);

      // Vignette
      vec2 vig = uv * 2.0 - 1.0;
      float v = 1.0 - dot(vig, vig) * 0.45;
      col *= clamp(v, 0.0, 1.0);

      // Opacity low — let bg show through
      gl_FragColor = vec4(col, 0.92);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uT   = gl.getUniformLocation(prog, 'u_t');
  const uRes = gl.getUniformLocation(prog, 'u_res');

  let start = null, rafId;
  function frame(ts) {
    if (!document.getElementById('ob-canvas')) { cancelAnimationFrame(rafId); return; }
    if (!start) start = ts;
    const t = (ts - start) * 0.001;
    gl.uniform1f(uT, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
}

function fallbackObBg(canvas) {
  canvas.style.background = 'linear-gradient(135deg, #0a1020 0%, #0f1b3d 60%, #0a0f22 100%)';
}

/* ── i18n ─────────────────────────────────────────────── */
const LANGS = {
  en: {
    // Header
    nav_journey: 'My Journey', nav_episodes: 'Episodes', nav_profile: 'Profile',
    // Onboarding hero
    ob_eyebrow: 'CI&T · LearnStation.AI',
    ob_hero_title: 'The future of HR starts with <em>one</em> good question.',
    ob_hero_desc: 'A learning journey on generative AI built for people who work with people. Not about technology — about what you\'ll be able to do with it.',
    ob_stat1_num: '12<span>+</span>', ob_stat1_lbl: 'curated modules',
    ob_stat2_num: '10<span>h</span>', ob_stat2_lbl: 'base track',
    ob_stat3_num: '100<span>%</span>',ob_stat3_lbl: 'applied to People',
    // Onboarding card
    ob_step0_eyebrow: 'Welcome', ob_step0_h1: 'Who\'s joining this journey?',
    ob_step0_p: 'Tell us a little about yourself. It helps make the journey relevant from the first module.',
    ob_name_label: 'Name', ob_name_ph: 'What do you prefer to be called?',
    ob_login_label: 'Corporate login', ob_login_ph: 'login@ciandt.com',
    ob_continue: 'Continue', ob_back: '← Back',
    ob_step1_eyebrow: 'Your area', ob_step1_h1: 'Where do you work in HR?',
    ob_step1_p: 'The content is the same — what changes are the examples. Choose the area that best reflects your day-to-day.',
    ob_step2_eyebrow: 'Right now', ob_step2_h1: 'How are you coming into this journey?',
    ob_step2_p: 'No right answer. We just want to understand how to welcome you best.',
    ob_start: 'Start the journey',
    mood_animado: 'With a lot of curiosity',   mood_animado_desc: 'I want to understand everything and can already picture how to apply it.',
    mood_cauteloso: 'Taking it slow',           mood_cauteloso_desc: 'I have questions — I want to understand before drawing conclusions.',
    mood_receoso: 'With some doubts',           mood_receoso_desc: 'I\'m not yet clear on what this means for my role.',
    mood_pragmatico: 'Focused on what\'s practical', mood_pragmatico_desc: 'Less theory, more application. Give me what works now.',
    // Portal
    portal_greeting_sub_done: 'Track complete — you made it to the end.',
    portal_greeting_sub: 'Pick up where you left off —',
    portal_greeting_of: 'of',
    portal_greeting_modules: 'modules completed',
    portal_notice_title: 'Enrollment on Coursera for Business',
    portal_notice_text: 'The step-by-step process for requesting enrollment on Coursera for Business via Unico Skill is detailed in the',
    portal_notice_link: 'Gen AI Orchestrator track',
    cert_banner_title: 'You completed the full track',
    cert_banner_sub: 'Your certificate is ready to download.',
    cert_banner_btn: 'View certificate',
    filter_all: 'All', filter_req: 'Required', filter_opt: 'Optional',
    mod_req: 'required', mod_opt: 'optional', mod_soon: 'Coming soon',
    mod_read: 'Read', mod_access: 'Access', mod_done: 'Mark done', mod_done_done: 'Done',
    stage_locked: 'Complete at least 70% of the previous stage to unlock.',
    ach_title: 'Achievements',
    preview_label: '🛠 Preview (temporary)',
    preview_cert: 'Certificate', preview_flow: 'Completion flow',
    // Assessment
    as_title: 'Let\'s find your level',
    as_back: '← Previous', as_next: 'Next', as_start: 'Start the journey',
    as_eyebrow: 'Assessment',
    as_question_of: 'of',
    as_question_label: 'Question',
    as_completed: 'Completed',
    as_see_result: 'See my result',
    as_result_badge_label: 'Your result',
    as_step_label: 'Step 1 of 2',
    as_step_name: 'Assessment complete',
    as_go: 'View my journey',
    as_redo: 'Retake the assessment',
    as_notice: 'The step-by-step process for requesting enrollment on Coursera for Business via Unico Skill is detailed in the',
    as_notice_link: 'Gen AI Orchestrator track',
    lv_title_prefix: 'For this learning program, your level is',
    lv_base_badge: 'Base Level', lv_base_title: 'You\'re in the right place to start.', lv_base_desc: 'The journey covers Generative AI fundamentals, responsible use of people data, and first practical steps with Claude.',
    lv_int_badge: 'Intermediate Level', lv_int_title: 'You have a foundation — time to go deeper.', lv_int_desc: 'The journey focuses on fixed-context projects, reusable HR Skills, and first steps in agent orchestration.',
    lv_adv_badge: 'Advanced Level', lv_adv_title: 'You\'re ready to orchestrate.', lv_adv_desc: 'The journey goes straight to the full AI Orchestrator path. The goal: become a reference in AI in your area.',
    // Stage titles
    s1_label: 'Base', s1_title: 'Foundations', s1_subtitle: 'Required for everyone — conceptual base and essential tools',
    s2_label: 'Practice', s2_title: 'Practice & Tools', s2_subtitle: 'For those who already have basic AI experience',
    // Portal
    portal_hello: 'Hello,',
    portal_modules: 'modules',
    portal_not_started: 'Not started', portal_completed: 'Completed ✓', portal_in_progress: 'done',
    portal_locked_msg: 'Complete 70% of the previous stage to unlock.',
    portal_mod_count_s: 'module', portal_mod_count_p: 'modules',
    // Profile stats
    prof_stat_modules: 'modules completed', prof_stat_track: 'of track complete',
    prof_stat_ach: 'achievements', prof_stat_days: 'active days',
    prof_edit_save: 'Save', prof_edit_cancel: 'Cancel', prof_edit_btn: 'Edit name',
    prof_section_progress: 'Progress by stage', prof_section_ach: 'Achievements', prof_section_settings: 'Settings',
    prof_level_label: 'Level', prof_area_label: 'Area',
    prof_area_edit: 'Edit area',
    // Cert
    cert_completed_label: 'Completed',
    cert_label: 'Certificate of Completion', cert_program: 'Agentic HR',
    cert_certifies: 'This certificate recognizes that',
    cert_body: 'completed all tracks of the <strong>Agentic HR</strong> program — a generative AI journey designed for HR professionals. Foundations were explored, real tools were used, and a personal perspective on the future was built.',
    cert_date_label: 'Completion date',
    cert_sign_label: 'CI&T People',
    cert_png_btn: 'Download PNG', cert_pdf_btn: 'Save PDF', cert_close_btn: 'Close',
    cert_loading: 'Generating...', cert_participant: 'Participant', cert_close_tooltip: 'Close',
    cert_png_error: 'Could not generate PNG. Try saving as PDF.',
    // Pages titles
    page_title_portal: 'My Journey — Agentic HR', page_title_profile: 'My Profile — Agentic HR',
    page_title_onboarding: 'Welcome — Agentic HR', page_title_episodes: 'Episodes — Agentic HR',
    // Portal
    portal_name_fallback: 'you',
    // Onboarding mood heading personalised
    ob_step2_h1_suffix: ', how are you coming into this journey?',
    // Profile
    prof_avatar_alt: 'Profile photo', prof_avatar_tooltip: 'Click to change photo',
    prof_name_ph: 'Your name', prof_ach_unlocked: 'Unlocked on',
    prof_area_edit_short: 'Edit',
    // Achievements
    ach_toast_title: 'Achievement unlocked!',
    // Mod soon
    mod_soon_label: 'Coming soon',
    // Episodes
    ep_available: 'Available', ep_label: 'Episode',
    ep_back: 'Back', ep_not_published: 'Episode not yet published.',
    ep_opener_label: 'Watch before reading', ep_next_label: 'Next episode',
    ep_done_done: 'Episode completed', ep_mark_done: 'Mark as complete',
    ep_back_journey: 'Back to journey', ep_grid_title: 'All episodes',
    ep_locked: 'Locked',
    // Sandbox
    sandbox_eyebrow: 'Now it\'s on you',
    sandbox_title: 'What problem in your area would you solve with this?',
    sandbox_desc: 'Write down your idea — process, challenge, hypothesis. 2 minutes and it\'s your first real step.',
    sandbox_btn: 'Submit idea',
    // Episode sections
    sec_checkpoint_lbl: 'Pause for reflection',
    // eNPS standalone
    enps_last_q: 'One last question',
    // Module descriptions (EN)
    mod_genai_desc: 'Generative AI fundamentals — what it is, how it works, capabilities and limits.',
    mod_genai_hr_desc: 'How HR teams are using generative AI in practice — recruitment, onboarding, L&D, headcount planning.',
    mod_c101_desc: 'Interface, projects, artifacts, external tool connections, skills and research mode.',
    mod_chr_desc: 'Practical examples of Claude in HR — recruitment, onboarding, headcount. Includes data safety guidelines.',
    mod_flowob_desc: 'How to use Flow — CI&T\'s internal content platform.',
    mod_lean_desc: 'Lean mindset applied to work — the process thinking foundation that complements AI in workflows.',
    mod_cow_desc: 'Claude as an agent that operates the computer autonomously via folder permissions and sub-agent coordination.',
    mod_cc101_desc: 'Intro to Claude Code — task automation, scripts and AI-powered flows directly in the terminal.',
    mod_gov_desc: 'What is and isn\'t allowed with sensitive people data; permitted tools; how to classify data before using AI.',
    mod_gov_title: 'Data Governance — AI in People',
    mod_prompt_desc: 'How to structure prompts for more consistent and useful results.',
    mod_fluency_desc: 'AI fluency framework — conceptual and practical foundations for working confidently with language models.',
    mod_soft_desc: 'How to work with AI critically, ethically and collaboratively.',
    mod_agentswf_desc: 'How AI agents are reshaping work — strategic context for People teams.',
    mod_proj_desc: 'How Claude Projects organise conversations and documents with fixed context per sub-area.',
    mod_skills_desc: 'Build, configure and share reusable Claude Skills — CV screening, climate survey analysis, JD generation.',
    mod_orch_desc: 'Multi-agent orchestration, flow design, coordination and supervision — build complete agentic flows for HR processes.',
    // Completion
    comp_eyebrow: 'Track completed',
    comp_title_name: ', you made it to the end.', comp_title: 'You made it to the end.',
    comp_desc: 'That\'s no small thing. You dedicated real time to understanding how AI can amplify your work — and you leave with more than knowledge: you leave with your own perspective on a future that\'s already happening.',
    comp_cert_btn: 'View my certificate', comp_next_btn: 'Continue',
    enps_eyebrow: 'Two quick questions',
    enps_reflection_label: 'How do you leave here?', enps_reflection_opt: '(optional)',
    enps_reflection_ph: 'What changes in your work from now on?',
    enps_q: 'From 0 to 10, how likely are you to recommend this track to a colleague?',
    enps_low: 'Not at all', enps_high: 'Absolutely',
    enps_comment_label: 'Any other comments?', enps_comment_opt: '(optional)',
    enps_comment_ph: 'What could be better? What worked well?',
    enps_submit: 'Submit', enps_done_eyebrow: 'Thank you',
    enps_done_title: 'Your feedback has been recorded.',
    enps_done_desc: 'It helps improve the experience for the next people.',
    enps_close: 'Close',
    // Profile
    prof_reset_confirm: 'This will restart your journey. Continue?',
    prof_level_title: 'Level', prof_area_title: 'Area',
    // Notice
    notice_coursera: 'Enrollment on Coursera for Business',
  },
  pt: {
    nav_journey: 'Minha jornada', nav_episodes: 'Episódios', nav_profile: 'Meu perfil',
    ob_eyebrow: 'CI&T · LearnStation.AI',
    ob_hero_title: 'O futuro do RH começa com <em>uma</em> boa pergunta.',
    ob_hero_desc: 'Uma jornada de aprendizado sobre IA generativa feita para quem trabalha com pessoas. Não sobre tecnologia — sobre o que você vai conseguir fazer com ela.',
    ob_stat1_num: '12<span>+</span>', ob_stat1_lbl: 'módulos curados',
    ob_stat2_num: '3<span>h</span>',  ob_stat2_lbl: 'trilha base',
    ob_stat3_num: '100<span>%</span>',ob_stat3_lbl: 'aplicado a People',
    ob_step0_eyebrow: 'Boas-vindas', ob_step0_h1: 'Quem vai nessa jornada?',
    ob_step0_p: 'Conta um pouco sobre você. Assim a jornada faz sentido desde o primeiro módulo.',
    ob_name_label: 'Nome', ob_name_ph: 'Como prefere ser chamado?',
    ob_login_label: 'Login corporativo', ob_login_ph: 'login@ciandt.com',
    ob_continue: 'Continuar', ob_back: '← Voltar',
    ob_step1_eyebrow: 'Sua área', ob_step1_h1: 'Onde você atua no RH?',
    ob_step1_p: 'O conteúdo é o mesmo — o que muda são os exemplos. Escolha a área que mais reflete o seu dia a dia.',
    ob_step2_eyebrow: 'Momento atual', ob_step2_h1: 'Como você está chegando nessa jornada?',
    ob_step2_p: 'Sem resposta certa. Queremos entender como receber você da melhor forma.',
    ob_start: 'Começar a jornada',
    mood_animado: 'Com muita curiosidade',     mood_animado_desc: 'Quero entender tudo e já imagino como aplicar no meu trabalho.',
    mood_cauteloso: 'Explorando com calma',    mood_cauteloso_desc: 'Tenho perguntas — quero entender antes de tirar conclusões.',
    mood_receoso: 'Com algumas dúvidas',       mood_receoso_desc: 'Ainda não tenho clareza sobre o que isso significa pro meu papel.',
    mood_pragmatico: 'Com foco no prático',    mood_pragmatico_desc: 'Menos teoria, mais aplicação. Quero o que funciona agora.',
    portal_greeting_sub_done: 'Trilha completa — você chegou até o fim.',
    portal_greeting_sub: 'Continue de onde parou —',
    portal_greeting_of: 'de', portal_greeting_modules: 'módulos concluídos',
    portal_notice_title: 'Enrollment on Coursera for Business',
    portal_notice_text: 'O passo a passo para solicitar a inscrição no Coursera for Business via Unico Skill está detalhado na',
    portal_notice_link: 'trilha Gen AI Orchestrator',
    cert_banner_title: 'Você concluiu a trilha completa',
    cert_banner_sub: 'Seu certificado está disponível para download.',
    cert_banner_btn: 'Ver certificado',
    filter_all: 'Todos', filter_req: 'Obrigatórios', filter_opt: 'Opcionais',
    mod_req: 'obrigatório', mod_opt: 'opcional', mod_soon: 'Em breve',
    mod_read: 'Ler', mod_access: 'Acessar', mod_done: 'Marcar feito', mod_done_done: 'Feito',
    stage_locked: 'Conclua pelo menos 70% do estágio anterior para desbloquear.',
    ach_title: 'Conquistas',
    preview_label: '🛠 Preview (temporário)',
    preview_cert: 'Certificado', preview_flow: 'Fluxo de conclusão',
    as_title: 'Vamos encontrar seu nível',
    as_back: '← Anterior', as_next: 'Próxima', as_start: 'Começar a jornada',
    as_eyebrow: 'Nivelamento',
    as_question_of: 'de',
    as_question_label: 'Pergunta',
    as_completed: 'Concluído',
    as_see_result: 'Ver resultado',
    as_result_badge_label: 'Seu resultado',
    as_step_label: 'Etapa 1 de 2',
    as_step_name: 'Nivelamento concluído',
    as_go: 'Ver minha jornada',
    as_redo: 'Refazer o assessment',
    as_notice: 'O passo a passo para solicitar a inscrição no Coursera for Business via Unico Skill está detalhado na trilha',
    as_notice_link: 'Gen AI Orchestrator',
    lv_title_prefix: 'Nesse programa de trilhas, identificamos o',
    lv_base_badge: 'Nível Base', lv_base_title: 'Você está no lugar certo para começar.', lv_base_desc: 'A jornada cobre fundamentos de IA Generativa, uso responsável de dados de pessoas e os primeiros passos práticos com o Claude.',
    lv_int_badge: 'Nível Intermediário', lv_int_title: 'Você já tem base — hora de ir mais fundo.', lv_int_desc: 'A jornada foca em projetos com contexto fixo, Skills reutilizáveis de RH e primeiros passos em orquestração de agentes.',
    lv_adv_badge: 'Nível Avançado', lv_adv_title: 'Você está pronto para orquestrar.', lv_adv_desc: 'A jornada vai direto ao AI Orchestrator path completo. O objetivo: sair como referência em IA na sua área.',
    s1_label: 'Base', s1_title: 'Fundamentos', s1_subtitle: 'Obrigatório para todos — base conceitual e ferramentas essenciais',
    s2_label: 'Prática', s2_title: 'Prática & Ferramentas', s2_subtitle: 'Para quem já tem prática básica com IA',
    portal_hello: 'Olá,',
    portal_modules: 'módulos',
    portal_not_started: 'Não iniciado', portal_completed: 'Concluído ✓', portal_in_progress: 'feitos',
    portal_locked_msg: 'Conclua pelo menos 70% do estágio anterior para desbloquear.',
    portal_mod_count_s: 'módulo', portal_mod_count_p: 'módulos',
    prof_stat_modules: 'módulos concluídos', prof_stat_track: 'da trilha completa',
    prof_stat_ach: 'conquistas', prof_stat_days: 'dias ativos',
    prof_edit_save: 'Salvar', prof_edit_cancel: 'Cancelar', prof_edit_btn: 'Editar nome',
    prof_section_progress: 'Progresso por estágio', prof_section_ach: 'Conquistas', prof_section_settings: 'Configurações',
    prof_level_label: 'Nível', prof_area_label: 'Área',
    prof_area_edit: 'Editar área',
    cert_completed_label: 'Concluído',
    cert_label: 'Certificado de Conclusão', cert_program: 'Agentic HR',
    cert_certifies: 'Este certificado reconhece que',
    cert_body: 'concluiu com dedicação todas as trilhas do programa <strong>Agentic HR</strong> — uma jornada sobre IA generativa aplicada ao trabalho em RH. Você explorou fundamentos, experimentou ferramentas reais e construiu uma visão própria sobre como a IA pode ampliar o seu impacto.',
    cert_date_label: 'Concluído em',
    cert_sign_label: 'CI&T People',
    cert_png_btn: 'Baixar PNG', cert_pdf_btn: 'Salvar PDF', cert_close_btn: 'Fechar',
    cert_loading: 'Gerando...', cert_participant: 'Participante', cert_close_tooltip: 'Fechar',
    cert_png_error: 'Não foi possível gerar o PNG. Tente salvar como PDF.',
    page_title_portal: 'Minha Jornada — Agentic HR', page_title_profile: 'Meu Perfil — Agentic HR',
    page_title_onboarding: 'Bem-vindo — Agentic HR', page_title_episodes: 'Episódios — Agentic HR',
    portal_name_fallback: 'você',
    ob_step2_h1_suffix: ', como você está chegando nessa jornada?',
    prof_avatar_alt: 'Foto de perfil', prof_avatar_tooltip: 'Clique para trocar a foto',
    prof_name_ph: 'Seu nome', prof_ach_unlocked: 'Desbloqueado em',
    prof_area_edit_short: 'Editar',
    ach_toast_title: 'Conquista desbloqueada!',
    mod_soon_label: 'Em breve',
    ep_available: 'Disponível', ep_label: 'Episódio',
    ep_back: 'Voltar', ep_not_published: 'Episódio não publicado ainda.',
    ep_opener_label: 'Ative a intuição antes de ler', ep_next_label: 'Próximo episódio',
    ep_done_done: 'Episódio concluído', ep_mark_done: 'Marcar como concluído',
    ep_back_journey: 'Voltar à jornada', ep_grid_title: 'Todos os episódios',
    ep_locked: 'Bloqueado',
    sandbox_eyebrow: 'Agora é com você',
    sandbox_title: 'Qual problema da sua área você resolveria com isso?',
    sandbox_desc: 'Registre sua ideia — processo, desafio, hipótese. 2 minutos e é o primeiro passo real.',
    sandbox_btn: 'Registrar ideia',
    sec_checkpoint_lbl: 'Pausa para reflexão',
    enps_last_q: 'Uma última pergunta',
    mod_genai_desc: 'Fundamentos de IA generativa — o que é, como funciona, capacidades e limites.',
    mod_genai_hr_desc: 'Como times de RH estão usando IA generativa na prática — recrutamento, onboarding, L&D, planejamento de headcount.',
    mod_c101_desc: 'Interface, projetos, artefatos, conexão com ferramentas externas, skills e modo de pesquisa.',
    mod_chr_desc: 'Exemplos práticos de uso do Claude em RH — recrutamento, onboarding, headcount. Inclui orientações de segurança para dados de pessoas.',
    mod_flowob_desc: 'Como usar o Flow — plataforma de conteúdo interno da CI&T.',
    mod_lean_desc: 'Mentalidade lean aplicada ao trabalho — base de pensamento de processo que complementa o uso de IA em workflows.',
    mod_cow_desc: 'Claude como agente que opera o computador de forma autônoma via permissão de pastas e coordenação de sub-agentes.',
    mod_cc101_desc: 'Introdução ao Claude Code — automação de tarefas, scripts e fluxos com IA diretamente no terminal.',
    mod_gov_desc: 'O que pode e não pode com dados sensíveis; ferramentas permitidas; como classificar um dado antes de usar com IA.',
    mod_gov_title: 'Governança de Dados — IA em People',
    mod_prompt_desc: 'Como estruturar prompts para obter resultados mais consistentes e úteis.',
    mod_fluency_desc: 'Framework de fluência em IA — fundamentos conceituais e práticos para trabalhar com modelos de linguagem com confiança.',
    mod_soft_desc: 'Como trabalhar com IA de forma crítica, ética e colaborativa.',
    mod_agentswf_desc: 'Como agentes de IA estão redesenhando o trabalho — contexto estratégico para times de People.',
    mod_proj_desc: 'Como os Projetos do Claude organizam conversas e documentos com contexto fixo por subárea.',
    mod_skills_desc: 'Como construir, configurar e compartilhar Skills reutilizáveis no Claude — triagem de CVs, análise de pesquisa de clima, geração de JDs.',
    mod_orch_desc: 'Orquestração de múltiplos agentes, design de fluxos, coordenação e supervisão — para construir fluxos agênticos completos para processos de RH.',
    comp_eyebrow: 'Trilha concluída',
    comp_title_name: ', você chegou até o fim.', comp_title: 'Você chegou até o fim.',
    comp_desc: 'Isso não é pouca coisa. Você dedicou tempo real a entender como a IA pode ampliar o seu trabalho — e saiu daqui com mais do que conhecimento: saiu com uma perspectiva própria sobre o futuro que já está acontecendo.',
    comp_cert_btn: 'Ver meu certificado', comp_next_btn: 'Continuar',
    enps_eyebrow: 'Duas perguntas rápidas',
    enps_reflection_label: 'Como você sai daqui?', enps_reflection_opt: '(opcional)',
    enps_reflection_ph: 'O que muda no seu trabalho a partir de agora?',
    enps_q: 'De 0 a 10, o quanto você indicaria essa trilha para um colega?',
    enps_low: 'Não indicaria', enps_high: 'Com certeza',
    enps_comment_label: 'Mais algum comentário?', enps_comment_opt: '(opcional)',
    enps_comment_ph: 'O que poderia ser melhor? O que funcionou bem?',
    enps_submit: 'Enviar', enps_done_eyebrow: 'Obrigado',
    enps_done_title: 'Seu feedback foi registrado.',
    enps_done_desc: 'Ele ajuda a melhorar a experiência para os próximos.',
    enps_close: 'Fechar',
    prof_reset_confirm: 'Isso vai reiniciar sua jornada. Continuar?',
    prof_level_title: 'Nível', prof_area_title: 'Área',
    notice_coursera: 'Enrollment on Coursera for Business',
  }
};

let _lang = 'en'; // always start in English
const t = key => LANGS[_lang]?.[key] ?? LANGS['en'][key] ?? key;

function setLang(lang) {
  _lang = lang;
  localStorage.setItem('of_lang', lang);
  // update toggle UI
  document.querySelectorAll('#lang-toggle .lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  // re-render active view
  if (activeView) showView(activeView);
}

/* ── Stage entrance animation ─────────────────────────── */
const _stageIO = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.style.opacity = '1';
      en.target.style.transform = 'translateY(0)';
      _stageIO.unobserve(en.target);
    }
  });
}, { threshold: 0.06 });

function observeStages() {
  document.querySelectorAll('.stage').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 0.45s ${i * 0.09}s ease, transform 0.45s ${i * 0.09}s cubic-bezier(0.4,0,0.2,1)`;
    _stageIO.observe(el);
  });
}

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
  get user()        { return JSON.parse(sessionStorage.getItem('of_user') || localStorage.getItem('of_user') || 'null'); },
  get nivel()       { return sessionStorage.getItem('of_nivel') || localStorage.getItem('of_nivel') || null; },
  get progress()    { return JSON.parse(localStorage.getItem('of_progress') || '{}'); },
  get achievements(){ return JSON.parse(localStorage.getItem('of_achievements') || '{}'); },
  get episodeVisits(){ return JSON.parse(localStorage.getItem('of_ep_visits') || '[]'); },
  get dailyDone()   { return JSON.parse(localStorage.getItem('of_daily_done') || '{}'); },
  get photo()       { return localStorage.getItem('of_photo') || null; },
  set photo(v)      { if (v) localStorage.setItem('of_photo', v); else localStorage.removeItem('of_photo'); },
  set user(v)       { const s = JSON.stringify(v); sessionStorage.setItem('of_user', s); localStorage.setItem('of_user', s); },
  set nivel(v)      { sessionStorage.setItem('of_nivel', v); localStorage.setItem('of_nivel', v); },
  done(id)          { return !!this.progress[id]; },
  markDone(id)   {
    const p=this.progress; p[id]=true; localStorage.setItem('of_progress',JSON.stringify(p));
    // track daily completions
    const today = new Date().toISOString().slice(0,10);
    const dd = this.dailyDone;
    dd[today] = (dd[today]||0)+1;
    localStorage.setItem('of_daily_done', JSON.stringify(dd));
    const login=this.user?.login;
    if(login) fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login,episodeId:id,done:true})}).catch(()=>{});
    checkAchievements();
  },
  markVisit(slug) {
    const v = this.episodeVisits;
    if (!v.includes(slug)) { v.push(slug); localStorage.setItem('of_ep_visits', JSON.stringify(v)); }
    checkAchievements();
  },
  unlockAchievement(id) {
    const a = this.achievements;
    if (a[id]) return false;
    a[id] = new Date().toISOString();
    localStorage.setItem('of_achievements', JSON.stringify(a));
    return true;
  },
  stagePct(ids)  { const d=ids.filter(id=>this.done(id)).length; return {done:d,total:ids.length,pct:ids.length?Math.round(d/ids.length*100):0}; }
};

/* ── Achievements ─────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id:'first_step',   icon:'🚀', name:'First Step',        desc:'Completed the first module of the journey.' },
  { id:'momentum',     icon:'🔥', name:'Momentum',          desc:'Completed 3 modules.' },
  { id:'reader',       icon:'📖', name:'Devoted Reader',    desc:'Read an episode all the way through.' },
  { id:'stage_done',   icon:'🏁', name:'Stage Complete',    desc:'Completed 100% of a stage.' },
  { id:'halfway',      icon:'⚡', name:'Halfway There',     desc:'Reached 50% of the track.' },
  { id:'focused',      icon:'🎯', name:'Focused',           desc:'Completed 3 modules in one day.' },
  { id:'explorer',     icon:'🔭', name:'Explorer',          desc:'Visited all available episodes.' },
  { id:'orchestrator', icon:'🌟', name:'Orchestrator',      desc:'Completed 100% of the track.' },
];

function checkAchievements() {
  const nivel   = SS.nivel || 'basico';
  const visible = STAGES.filter(s => s.levels.includes(nivel));
  const allIds  = visible.flatMap(s => s.mods.map(m => m.id));
  const doneIds = allIds.filter(id => SS.done(id));
  const pct     = allIds.length ? Math.round(doneIds.length / allIds.length * 100) : 0;

  const today   = new Date().toISOString().slice(0,10);
  const todayDone = SS.dailyDone[today] || 0;

  const publishedEps = DATA?.episodes?.filter(e => e.status === 'published').map(e => e.slug) || [];
  const visitedAll   = publishedEps.length > 0 && publishedEps.every(s => SS.episodeVisits.includes(s));

  const stageComplete = visible.some(s => SS.stagePct(s.mods.map(m => m.id)).pct === 100);

  const conditions = {
    first_step:   doneIds.length >= 1,
    momentum:     doneIds.length >= 3,
    reader:       SS.achievements['reader'] !== undefined, // set manually on scroll
    stage_done:   stageComplete,
    halfway:      pct >= 50,
    focused:      todayDone >= 3,
    explorer:     visitedAll,
    orchestrator: pct === 100,
  };

  ACHIEVEMENTS.forEach(a => {
    if (a.id === 'reader') return; // handled separately
    if (conditions[a.id] && SS.unlockAchievement(a.id)) {
      showAchievementToast(a);
      if (a.id === 'orchestrator') setTimeout(() => showCompletion(), 1800);
    }
  });
}

/* ── Completion flow: mensagem → certificado → eNPS ────── */
function showCompletion() {
  const user = SS.user;
  const name = user?.name ? user.name.split(' ')[0] : '';
  const existing = document.getElementById('completion-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'completion-modal';
  modal.className = 'completion-overlay';
  modal.innerHTML = `
    <div class="completion-modal" id="completion-panel">

      <!-- Etapa 1: mensagem motivacional -->
      <div class="completion-step" id="cs-message">
        <div class="completion-burst">✦</div>
        <p class="completion-eyebrow">${t('comp_eyebrow')}</p>
        <h2 class="completion-title">${name ? name + t('comp_title_name') : t('comp_title')}</h2>
        <p class="completion-desc">${t('comp_desc')}</p>
        <div class="completion-actions">
          <button class="btn btn-secondary btn-lg" id="cs-go-cert">
            <i class="ti ti-certificate"></i> ${t('comp_cert_btn')}
          </button>
          <button class="btn btn-primary btn-lg" id="cs-go-enps">
            ${t('comp_next_btn')} <i class="ti ti-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Etapa 2: eNPS -->
      <div class="completion-step" id="cs-enps" style="display:none">
        <p class="completion-eyebrow">${t('enps_eyebrow')}</p>
        <div class="completion-reflection">
          <label class="enps-comment-label" for="cs-reflection">${t('enps_reflection_label')} <span>${t('enps_reflection_opt')}</span></label>
          <textarea class="enps-comment" id="cs-reflection" placeholder="${t('enps_reflection_ph')}" rows="3"></textarea>
        </div>
        <h2 class="completion-title" style="font-size:clamp(1.125rem,2.5vw,1.375rem);margin-top:1.5rem">${t('enps_q')}</h2>
        <div class="enps-scale" id="enps-scale">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<button class="enps-btn" data-score="${n}">${n}</button>`).join('')}
        </div>
        <div class="enps-labels">
          <span>${t('enps_low')}</span>
          <span>${t('enps_high')}</span>
        </div>
        <div class="enps-comment-wrap" id="enps-comment-wrap" style="display:none">
          <label class="enps-comment-label" for="enps-comment">${t('enps_comment_label')} <span>${t('enps_comment_opt')}</span></label>
          <textarea class="enps-comment" id="enps-comment" placeholder="${t('enps_comment_ph')}" rows="3"></textarea>
          <button class="btn btn-primary enps-submit" id="enps-submit">
            ${t('enps_submit')} <i class="ti ti-send"></i>
          </button>
        </div>
      </div>

      <!-- Etapa 3: confirmação -->
      <div class="completion-step" id="cs-done" style="display:none">
        <div class="completion-burst" style="color:var(--success)">✓</div>
        <p class="completion-eyebrow">${t('enps_done_eyebrow')}</p>
        <h2 class="completion-title" style="font-size:clamp(1.25rem,3vw,1.625rem)">${t('enps_done_title')}</h2>
        <p class="completion-desc" style="margin-bottom:2rem">${t('enps_done_desc')}</p>
        <button class="btn btn-secondary" id="cs-close">${t('enps_close')}</button>
      </div>

    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));

  // Ver certificado — abre em overlay separado, modal de conclusão fica aberto
  modal.querySelector('#cs-go-cert').addEventListener('click', () => {
    showCertificate();
  });

  // Continuar → vai para o eNPS dentro do mesmo modal
  modal.querySelector('#cs-go-enps').addEventListener('click', () => {
    modal.querySelector('#cs-message').style.display = 'none';
    const enps = modal.querySelector('#cs-enps');
    enps.style.display = 'block';
    enps.style.animation = 'ob-fade-up 0.45s ease forwards';
    _bindENPS(modal);
  });

  modal.addEventListener('click', e => { if (e.target === modal) closeMod('completion-modal'); });
  modal.querySelector('#cs-close')?.addEventListener('click', () => closeMod('completion-modal'));
}

function showENPS() {
  const existing = document.getElementById('completion-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'completion-modal';
  modal.className = 'completion-overlay';
  modal.innerHTML = `
    <div class="completion-modal" id="completion-panel">
      <div class="completion-step" id="cs-enps">
        <p class="completion-eyebrow">Uma última pergunta</p>
        <h2 class="completion-title" style="font-size:clamp(1.25rem,3vw,1.625rem)">${t('enps_q')}</h2>
        <div class="enps-scale" id="enps-scale">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<button class="enps-btn" data-score="${n}">${n}</button>`).join('')}
        </div>
        <div class="enps-labels">
          <span>${t('enps_low')}</span>
          <span>${t('enps_high')}</span>
        </div>
        <div class="enps-comment-wrap" id="enps-comment-wrap" style="display:none">
          <label class="enps-comment-label" for="enps-comment">Quer deixar um comentário? <span>(opcional)</span></label>
          <textarea class="enps-comment" id="enps-comment" placeholder="${t('enps_comment_ph')}" rows="3"></textarea>
          <button class="btn btn-primary enps-submit" id="enps-submit">
            ${t('enps_submit')} <i class="ti ti-send"></i>
          </button>
        </div>
      </div>
      <div class="completion-step" id="cs-done" style="display:none">
        <div class="completion-burst" style="color:var(--success)">✓</div>
        <p class="completion-eyebrow">${t('enps_done_eyebrow')}</p>
        <h2 class="completion-title" style="font-size:clamp(1.25rem,3vw,1.625rem)">${t('enps_done_title')}</h2>
        <p class="completion-desc" style="margin-bottom:2rem">${t('enps_done_desc')}</p>
        <button class="btn btn-secondary" id="cs-close">${t('enps_close')}</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
  _bindENPS(modal);
  modal.querySelector('#cs-close')?.addEventListener('click', () => closeMod('completion-modal'));
  modal.addEventListener('click', e => { if (e.target === modal) closeMod('completion-modal'); });
}

function _bindENPS(modal) {
  let selectedScore = null;
  modal.querySelectorAll('.enps-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.enps-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedScore = parseInt(btn.dataset.score);
      modal.querySelector('#enps-comment-wrap').style.display = 'block';
    });
  });

  modal.querySelector('#enps-submit')?.addEventListener('click', async () => {
    if (selectedScore === null) return;
    const comment    = modal.querySelector('#enps-comment')?.value.trim() || '';
    const reflection = modal.querySelector('#cs-reflection')?.value.trim() || '';
    const login      = SS.user?.login || 'anonimo';

    try {
      await fetch('/api/enps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, score: selectedScore, comment, reflection }),
      });
    } catch(e) { /* não bloqueia */ }

    localStorage.setItem('of_enps_done', '1');

    // Mostra confirmação
    modal.querySelector('#cs-enps').style.display = 'none';
    const done = modal.querySelector('#cs-done');
    if (done) { done.style.display = 'block'; done.style.animation = 'ob-fade-up 0.5s ease forwards'; }
  });
}

function closeMod(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('show');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

function showCertificate() {
  const user  = SS.user;
  const name  = user?.name || t('cert_participant');
  const today = new Date().toLocaleDateString(_lang==='pt'?'pt-BR':'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const existing = document.getElementById('cert-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'cert-modal';
  modal.className = 'cert-overlay';
  modal.innerHTML = `
    <div class="cert-modal">
      <button class="cert-close" id="cert-close-btn" title="${t('cert_close_tooltip')}">✕</button>

      <!-- Blobs de luz fora do printável para não afetar PNG -->
      <div class="cert-inner" id="cert-printable">
        <div class="cert-blob-1"></div>
        <div class="cert-blob-2"></div>
        <div class="cert-border-ring"></div>

        <div class="cert-body">
          <div class="cert-top-rule"></div>

          <div class="cert-logo-row">
            <div class="cert-logo-mark"><i class="ti ti-activity-heartbeat"></i></div>
            <span class="cert-logo-text">CI&T · LearnStation.AI</span>
          </div>

          <p class="cert-label">${t('cert_label')}</p>

          <h2 class="cert-program">${t('cert_program')}</h2>

          <div class="cert-ornament">
            <div class="cert-ornament-line"></div>
            <div class="cert-ornament-diamond"></div>
            <div class="cert-ornament-line"></div>
          </div>

          <p class="cert-certifies">${t('cert_certifies')}</p>
          <p class="cert-name">${esc(name)}</p>

          <p class="cert-body-text">${t('cert_body')}</p>

          <div class="cert-footer-row">
            <div class="cert-date-block">
              <p class="cert-date-label">${t('cert_date_label')}</p>
              <p class="cert-date-val">${today}</p>
            </div>
            <div class="cert-seal-block">
              <div class="cert-seal-ring">⭐</div>
              <span class="cert-seal-label">${t('cert_completed_label')}</span>
            </div>
            <div class="cert-sign-block">
              <div class="cert-sign-line"></div>
              <span class="cert-sign-label">${t('cert_sign_label')}</span>
            </div>
          </div>
        </div>

        <div class="cert-bottom-rule"></div>
      </div>

      <div class="cert-actions">
        <button class="btn btn-secondary" id="cert-png-btn"><i class="ti ti-download"></i> ${t('cert_png_btn')}</button>
        <button class="btn btn-secondary" id="cert-print-btn"><i class="ti ti-printer"></i> ${t('cert_pdf_btn')}</button>
        <button class="btn btn-primary"   id="cert-close-btn2">${t('cert_close_btn')}</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));

  modal.querySelector('#cert-close-btn').addEventListener('click',  () => closeCertificate());
  modal.querySelector('#cert-close-btn2').addEventListener('click', () => closeCertificate());
  modal.addEventListener('click', e => { if (e.target === modal) closeCertificate(); });

  modal.querySelector('#cert-print-btn').addEventListener('click', () => {
    window.print();
  });

  modal.querySelector('#cert-png-btn').addEventListener('click', async () => {
    const btn = modal.querySelector('#cert-png-btn');
    btn.classList.add('cert-btn-loading');
    btn.innerHTML = '<i class="ti ti-loader-2"></i> ' + t('cert_loading');

    // Carrega html2canvas via CDN se ainda não estiver
    if (!window.html2canvas) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    try {
      const el = document.getElementById('cert-printable');
      const canvas = await window.html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#080f24',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `certificado-${(name).replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) {
      alert(t('cert_png_error'));
    } finally {
      btn.classList.remove('cert-btn-loading');
      btn.innerHTML = '<i class="ti ti-download"></i> ' + t('cert_png_btn');
    }
  });
}

function closeCertificate() {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.addEventListener('transitionend', () => modal.remove(), { once: true });
}

function unlockReaderAchievement() {
  if (SS.unlockAchievement('reader')) {
    showAchievementToast(ACHIEVEMENTS.find(a => a.id === 'reader'));
  }
}

let _toastQueue = [], _toastBusy = false;
function showAchievementToast(achievement) {
  _toastQueue.push(achievement);
  if (!_toastBusy) drainToastQueue();
}

function drainToastQueue() {
  if (!_toastQueue.length) { _toastBusy = false; return; }
  _toastBusy = true;
  const a = _toastQueue.shift();

  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `
    <div class="ach-toast-icon">${a.icon}</div>
    <div class="ach-toast-body">
      <p class="ach-toast-title">Conquista desbloqueada!</p>
      <p class="ach-toast-name">${a.name}</p>
    </div>`;
  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    el.addEventListener('transitionend', () => { el.remove(); drainToastQueue(); }, {once:true});
  }, 3200);
}

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
  [$('nav-portal'), $('nav-episodes'), $('nav-profile')].forEach(b => b?.classList.remove('active'));
  if (name==='portal')   $('nav-portal')?.classList.add('active');
  if (name==='episodes' || name==='episode') $('nav-episodes')?.classList.add('active');
  if (name==='profile')  $('nav-profile')?.classList.add('active');

  // Header page title
  const titles = {portal:t('nav_journey'), episodes:t('nav_episodes'), episode:t('nav_episodes'), profile:t('nav_profile'), onboarding:'', assessment:''};
  const hp = $('header-page');
  if (hp) hp.textContent = titles[name] || 'Agentic HR';

  // User chip
  updateUserChip();

  window.scrollTo(0,0);

  switch(name) {
    case 'onboarding': renderOnboarding(); break;
    case 'assessment': renderAssessment(); break;
    case 'portal':     renderPortal();     break;
    case 'episodes':   renderEpisodes();   break;
    case 'episode':    renderEpisode(params.slug); break;
    case 'profile':    renderProfile();    break;
  }
}

function updateUserChip() {
  const u = SS.user;
  const nameEl = $('user-name');
  const avatarEl = $('user-avatar');
  if (!u || !u.name) return;
  if (nameEl) nameEl.textContent = u.name.split(' ')[0];
  if (avatarEl) {
    const photo = SS.photo;
    avatarEl.innerHTML = photo
      ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`
      : `<span style="font-size:0.75rem;font-weight:700;color:#fff">${u.name.charAt(0).toUpperCase()}</span>`;
  }
}


/* ══════════════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════════════ */
const AREA_LABELS_FULL = {
  'learning':           'Learning & Engagement',
  'people-services':    'People Services',
  'hr-tech':            'Tech & Performance',
  'talent-acquisition': 'Hiring & Workforce Planning',
  'executive':          'Exec Mastery',
  'comms':              'ESG & Comunicação',
  'business-partner':   'BPs e Hiring por região',
  'directors':          'Directors',
};

function renderProfile() {
  const wrap  = $('view-profile');
  const user  = SS.user || {};
  const nivel = SS.nivel || 'basico';
  const lv    = LV[nivel];
  document.title = t('page_title_profile');

  const visible = STAGES.filter(s => s.levels.includes(nivel));
  const allIds  = visible.flatMap(s => s.mods.map(m => m.id));
  const overall = SS.stagePct(allIds);

  const unlockedAchs = SS.achievements;
  const achCount     = Object.keys(unlockedAchs).length;
  const activeDays   = Object.keys(SS.dailyDone).length;

  const photo = SS.photo;
  const avatarInner = photo
    ? `<img src="${photo}" class="prof-avatar-img" alt="${t('prof_avatar_alt')}">`
    : `<span class="prof-avatar-initials">${(user.name||'?').charAt(0).toUpperCase()}</span>`;

  const stagesHTML = visible.map(s => {
    const sp   = SS.stagePct(s.mods.map(m => m.id));
    const prev = visible[visible.indexOf(s) - 1];
    const unlocked = !prev || SS.stagePct(prev.mods.map(m => m.id)).pct >= 70;
    return `
      <div class="prof-stage-row">
        <div class="prof-stage-meta">
          <span class="prof-stage-label">${s.label}</span>
          <span class="prof-stage-title">${s.title}</span>
        </div>
        <div class="prof-stage-bar-wrap">
          <div class="prof-stage-bar">
            <div class="prof-stage-fill${sp.pct===100?' done':''}" style="width:${unlocked?sp.pct:0}%"></div>
          </div>
          <span class="prof-stage-pct">${unlocked ? sp.pct+'%' : '🔒'}</span>
        </div>
      </div>`;
  }).join('');

  const achsHTML = ACHIEVEMENTS.map(a => {
    const unlockedAt = unlockedAchs[a.id];
    const dateStr = unlockedAt
      ? new Date(unlockedAt).toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric'})
      : null;
    return `
      <div class="prof-ach-item${unlockedAt ? ' unlocked' : ''}">
        <div class="prof-ach-icon">${a.icon}</div>
        <div class="prof-ach-info">
          <p class="prof-ach-name">${a.name}</p>
          <p class="prof-ach-desc">${unlockedAt ? `${t('prof_ach_unlocked')} ${dateStr}` : a.desc}</p>
        </div>
        ${unlockedAt ? '<div class="prof-ach-check"><i class="ti ti-check"></i></div>' : ''}
      </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="prof-scroll">
      <div class="prof-inner">

        <!-- Hero -->
        <div class="prof-hero">
          <div class="prof-avatar-wrap" id="prof-avatar-wrap" title="${t('prof_avatar_tooltip')}">
            <div class="prof-avatar">${avatarInner}</div>
            <div class="prof-avatar-overlay"><i class="ti ti-camera"></i></div>
            <input type="file" id="prof-photo-input" accept="image/*" style="display:none">
          </div>
          <div class="prof-hero-info">
            <div class="prof-name-row">
              <h1 class="prof-name" id="prof-name-display">${esc(user.name || '—')}</h1>
              <button class="prof-edit-btn" id="prof-edit-name-btn" title="${t('prof_edit_btn')}"><i class="ti ti-pencil"></i></button>
            </div>
            <div class="prof-name-edit" id="prof-name-edit" style="display:none">
              <input class="input prof-name-input" id="prof-name-input" value="${esc(user.name||'')}" placeholder="${t('prof_name_ph')}">
              <button class="btn btn-primary btn-sm" id="prof-name-save">${t('prof_edit_save')}</button>
              <button class="btn btn-secondary btn-sm" id="prof-name-cancel">${t('prof_edit_cancel')}</button>
            </div>
            <div class="prof-meta-row">
              <span class="badge ${lv.cls}">${lv.badge}</span>
              ${user.area ? `<span class="badge badge-neutral">${esc(AREA_LABELS_FULL[user.area] || user.area)}</span>` : ''}
              ${user.login ? `<span class="prof-login">${esc(user.login)}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="prof-stats">
          <div class="prof-stat">
            <span class="prof-stat-num">${overall.done}</span>
            <span class="prof-stat-label">${t('prof_stat_modules')}</span>
          </div>
          <div class="prof-stat-div"></div>
          <div class="prof-stat">
            <span class="prof-stat-num">${overall.pct}%</span>
            <span class="prof-stat-label">${t('prof_stat_track')}</span>
          </div>
          <div class="prof-stat-div"></div>
          <div class="prof-stat">
            <span class="prof-stat-num">${achCount}</span>
            <span class="prof-stat-label">${t('prof_stat_ach')}</span>
          </div>
          <div class="prof-stat-div"></div>
          <div class="prof-stat">
            <span class="prof-stat-num">${activeDays}</span>
            <span class="prof-stat-label">${t('prof_stat_days')}</span>
          </div>
        </div>

        <!-- Progress by stage -->
        <div class="prof-section">
          <p class="prof-section-title"><i class="ti ti-chart-bar"></i> ${t('prof_section_progress')}</p>
          <div class="prof-stages">${stagesHTML}</div>
        </div>

        <!-- Achievements -->
        <div class="prof-section">
          <p class="prof-section-title"><i class="ti ti-trophy"></i> ${t('prof_section_ach')} <span class="ach-count">${achCount}/${ACHIEVEMENTS.length}</span></p>
          <div class="prof-ach-list">${achsHTML}</div>
        </div>

        <!-- Área edit -->
        <div class="prof-section">
          <p class="prof-section-title"><i class="ti ti-settings"></i> ${t('prof_section_settings')}</p>
          <div class="prof-settings-card">
            <div class="prof-setting-row">
              <div>
                <p class="prof-setting-label">${t('prof_area_label')}</p>
                <p class="prof-setting-val">${esc(AREA_LABELS_FULL[user.area] || '—')}</p>
              </div>
              <button class="prof-edit-btn" id="prof-area-edit-btn"><i class="ti ti-pencil"></i> ${t('prof_area_edit_short')}</button>
            </div>
            <div id="prof-area-edit" style="display:none;margin-top:1rem;">
              <div class="prof-area-grid">
                ${Object.entries(AREA_LABELS_FULL).map(([v,l]) =>
                  `<div class="prof-area-opt${user.area===v?' on':''}" data-v="${v}">${l}</div>`
                ).join('')}
              </div>
              <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
                <button class="btn btn-primary btn-sm" id="prof-area-save">${t('prof_edit_save')}</button>
                <button class="btn btn-secondary btn-sm" id="prof-area-cancel">${t('prof_edit_cancel')}</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>`;

  // Photo upload
  $('prof-avatar-wrap').addEventListener('click', () => $('prof-photo-input').click());
  $('prof-photo-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      SS.photo = ev.target.result;
      updateUserChip();
      renderProfile();
    };
    reader.readAsDataURL(file);
  });

  // Name edit
  $('prof-edit-name-btn').addEventListener('click', () => {
    $('prof-name-display').style.display = 'none';
    $('prof-edit-name-btn').style.display = 'none';
    $('prof-name-edit').style.display = 'flex';
    $('prof-name-input').focus();
  });
  $('prof-name-cancel').addEventListener('click', () => {
    $('prof-name-edit').style.display = 'none';
    $('prof-name-display').style.display = '';
    $('prof-edit-name-btn').style.display = '';
  });
  $('prof-name-save').addEventListener('click', () => {
    const val = $('prof-name-input').value.trim();
    if (!val) return;
    SS.user = { ...SS.user, name: val };
    updateUserChip();
    renderProfile();
  });

  // Area edit
  let selectedArea = user.area || '';
  $('prof-area-edit-btn').addEventListener('click', () => {
    $('prof-area-edit').style.display = 'block';
  });
  $('prof-area-cancel').addEventListener('click', () => {
    $('prof-area-edit').style.display = 'none';
  });
  wrap.addEventListener('click', e => {
    const opt = e.target.closest('.prof-area-opt');
    if (!opt) return;
    wrap.querySelectorAll('.prof-area-opt').forEach(x => x.classList.remove('on'));
    opt.classList.add('on');
    selectedArea = opt.dataset.v;
  });
  $('prof-area-save').addEventListener('click', () => {
    SS.user = { ...SS.user, area: selectedArea };
    fetch('/api/register', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...SS.user, nivel: SS.nivel }),
    }).catch(() => {});
    renderProfile();
  });
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
  // Language toggle — init state and bind
  document.querySelectorAll('#lang-toggle .lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === _lang);
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Move toggle into header when shell is visible, restore when not
  function repositionLangToggle() {
    const toggle = document.getElementById('lang-toggle');
    const headerRight = document.querySelector('.app-header-right');
    const shell = document.getElementById('app-shell');
    if (!toggle) return;
    const shellVisible = shell && shell.style.display !== 'none';
    if (shellVisible && headerRight && !headerRight.contains(toggle)) {
      headerRight.insertBefore(toggle, headerRight.firstChild);
      toggle.style.position = 'relative';
      toggle.style.top = '';
      toggle.style.right = '';
    } else if (!shellVisible && document.body.contains(toggle) && toggle.parentElement !== document.body) {
      document.body.appendChild(toggle);
      toggle.style.position = 'fixed';
      toggle.style.top = '0.875rem';
      toggle.style.right = '1rem';
    }
  }

  // Patch showView to reposition after each view change
  const _origShowView = showView;
  window.showView = function(name, params) {
    _origShowView(name, params);
    setTimeout(repositionLangToggle, 0);
  };
  repositionLangToggle();

  $('nav-portal')?.addEventListener('click',   () => showView('portal'));
  $('nav-episodes')?.addEventListener('click', () => showView('episodes'));
  $('nav-profile')?.addEventListener('click',  () => showView('profile'));
  $('user-chip')?.addEventListener('click',    () => showView('profile'));
  $('nav-restart')?.addEventListener('click',  () => {
    if (!confirm(t('prof_reset_confirm'))) return;
    sessionStorage.clear();
    localStorage.removeItem('of_user');
    localStorage.removeItem('of_nivel');
    showView('onboarding');
  });

  // Spotlight nos .mod — atualiza variáveis CSS --mx/--my com a posição do mouse
  document.addEventListener('mousemove', e => {
    const mod = e.target.closest('.mod');
    if (!mod) return;
    const r = mod.getBoundingClientRect();
    mod.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
    mod.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
  });

  // Tilt sutil nos ep-cards
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.ep-card');
    if (!card) { return; }
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  document.addEventListener('mouseover', e => {
    const leaving = document.querySelector('.ep-card:not(:hover)');
    if (leaving) { leaving.style.transform = ''; leaving.style.transition = 'transform 0.35s ease'; }
  });

  setTimeout(() => { if (typeof observeStages === 'function') observeStages(); }, 200);

  // Ripple nos opt-cards
  document.addEventListener('click', e => {
    const card = e.target.closest('.opt-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const el = document.createElement('span');
    el.className = 'ripple';
    el.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px`;
    card.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
});


/* ══════════════════════════════════════════════════════
   ONBOARDING
   ══════════════════════════════════════════════════════ */
function renderOnboarding() {
  const wrap = $('view-onboarding');
  document.title = t('page_title_onboarding');
  wrap.innerHTML = `
    <video id="ob-bg-video" autoplay muted loop playsinline preload="auto">
      <source src="bg-video.mp4" type="video/mp4">
    </video>
    <div id="ob-aurora"><div class="ob-aurora-mid"></div></div>
    <div id="ob-canvas-overlay"></div>
    <div class="ob-wrap">

      <!-- Hero copy -->
      <div class="ob-hero">
        <p class="ob-hero-eyebrow">${t('ob_eyebrow')}</p>
        <h1 class="ob-hero-title">${t('ob_hero_title')}</h1>
        <p class="ob-hero-desc">${t('ob_hero_desc')}</p>
        <div class="ob-hero-stats">
          <div>
            <span class="ob-hero-stat-num">${t('ob_stat1_num')}</span>
            <span class="ob-hero-stat-label">${t('ob_stat1_lbl')}</span>
          </div>
          <div>
            <span class="ob-hero-stat-num">${t('ob_stat2_num')}</span>
            <span class="ob-hero-stat-label">${t('ob_stat2_lbl')}</span>
          </div>
          <div>
            <span class="ob-hero-stat-num">${t('ob_stat3_num')}</span>
            <span class="ob-hero-stat-label">${t('ob_stat3_lbl')}</span>
          </div>
        </div>
      </div>

      <!-- Card de onboarding -->
      <div class="ob-panel">
        <div class="ob-card">
          <div class="ob-progress">
            <div class="ob-dot on" id="od0"></div>
            <div class="ob-dot"    id="od1"></div>
            <div class="ob-dot"    id="od2"></div>
          </div>

          <div class="ob-step on" id="os0">
            <p class="ob-eyebrow">${t('ob_step0_eyebrow')}</p>
            <h1 class="ob-h1">${t('ob_step0_h1')}</h1>
            <p class="ob-p">${t('ob_step0_p')}</p>
            <div class="ob-fields">
              <div class="ob-field-group">
                <label class="field-label" for="ob-name">${t('ob_name_label')}</label>
                <input class="input" id="ob-name" type="text" placeholder="${t('ob_name_ph')}" autocomplete="given-name">
              </div>
              <div class="ob-field-group">
                <label class="field-label" for="ob-login">${t('ob_login_label')}</label>
                <input class="input" id="ob-login" type="text" placeholder="${t('ob_login_ph')}" autocomplete="username">
              </div>
            </div>
            <div class="ob-footer"><span></span><button class="btn btn-primary btn-lg" id="obn0" disabled>${t('ob_continue')} <i class="ti ti-arrow-right"></i></button></div>
          </div>

        <div class="ob-step" id="os1">
          <p class="ob-eyebrow">${t('ob_step1_eyebrow')}</p>
          <h1 class="ob-h1">${t('ob_step1_h1')}</h1>
          <p class="ob-p">${t('ob_step1_p')}</p>
          <div class="opt-grid cols-2">
            <div class="opt-card" data-g="area" data-v="learning"><span class="opt-icon">📚</span><div><p class="opt-name">Learning &amp; Engagement</p></div></div>
            <div class="opt-card" data-g="area" data-v="people-services"><span class="opt-icon">⚙️</span><div><p class="opt-name">People Services</p></div></div>
            <div class="opt-card" data-g="area" data-v="hr-tech"><span class="opt-icon">🔬</span><div><p class="opt-name">Tech &amp; Performance</p></div></div>
            <div class="opt-card" data-g="area" data-v="talent-acquisition"><span class="opt-icon">🎯</span><div><p class="opt-name">Hiring &amp; Workforce Planning</p></div></div>
            <div class="opt-card" data-g="area" data-v="executive"><span class="opt-icon">🏆</span><div><p class="opt-name">Exec Mastery</p></div></div>
            <div class="opt-card" data-g="area" data-v="comms"><span class="opt-icon">📢</span><div><p class="opt-name">ESG &amp; Comunicação</p></div></div>
            <div class="opt-card" data-g="area" data-v="business-partner"><span class="opt-icon">🤝</span><div><p class="opt-name">BPs e Hiring por região</p></div></div>
            <div class="opt-card" data-g="area" data-v="directors"><span class="opt-icon">🎯</span><div><p class="opt-name">Directors</p></div></div>
          </div>
          <div class="ob-footer"><button class="btn-link" id="obb1">${t('ob_back')}</button><button class="btn btn-primary btn-lg" id="obn1" disabled>${t('ob_continue')} <i class="ti ti-arrow-right"></i></button></div>
        </div>

        <div class="ob-step" id="os2">
          <p class="ob-eyebrow">${t('ob_step2_eyebrow')}</p>
          <h1 class="ob-h1" id="ob-mood-h">${t('ob_step2_h1')}</h1>
          <p class="ob-p">${t('ob_step2_p')}</p>
          <div class="opt-grid cols-1">
            <div class="opt-card" data-g="mood" data-v="animado"><span class="opt-icon">🚀</span><div><p class="opt-name">${t('mood_animado')}</p><p class="opt-desc">${t('mood_animado_desc')}</p></div></div>
            <div class="opt-card" data-g="mood" data-v="cauteloso"><span class="opt-icon">🧭</span><div><p class="opt-name">${t('mood_cauteloso')}</p><p class="opt-desc">${t('mood_cauteloso_desc')}</p></div></div>
            <div class="opt-card" data-g="mood" data-v="receoso"><span class="opt-icon">😬</span><div><p class="opt-name">${t('mood_receoso')}</p><p class="opt-desc">${t('mood_receoso_desc')}</p></div></div>
            <div class="opt-card" data-g="mood" data-v="pragmatico"><span class="opt-icon">⚡</span><div><p class="opt-name">${t('mood_pragmatico')}</p><p class="opt-desc">${t('mood_pragmatico_desc')}</p></div></div>
          </div>
          <div class="ob-footer"><button class="btn-link" id="obb2">${t('ob_back')}</button><button class="btn btn-primary btn-lg" id="obn2" disabled>${t('ob_start')} <i class="ti ti-arrow-right"></i></button></div>
          </div>
        </div><!-- /ob-card -->
      </div><!-- /ob-panel -->
    </div><!-- /ob-wrap -->`;

  const st = {name:'',login:'',area:'',mood:''};
  function goStep(n) {
    wrap.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('on'));
    wrap.querySelector('#os'+n).classList.add('on');
    [0,1,2].forEach(i=>wrap.querySelector('#od'+i).classList.toggle('on',i<=n));
    if (n===2 && st.name) $('ob-mood-h').textContent = st.name.split(' ')[0]+t('ob_step2_h1_suffix');
  }

  function checkStep0() {
    st.name  = $('ob-name').value.trim();
    st.login = $('ob-login').value.trim();
    $('obn0').disabled = !(st.name && st.login);
  }

  $('ob-name').addEventListener('input', checkStep0);
  $('ob-login').addEventListener('input', checkStep0);
  $('ob-name').addEventListener('keydown', e => { if(e.key==='Enter') $('ob-login').focus(); });
  $('ob-login').addEventListener('keydown', e => { if(e.key==='Enter' && st.name && st.login) goStep(1); });
  $('obn0').addEventListener('click', () => { if(st.name && st.login) goStep(1); });

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
  $('obn2').addEventListener('click', () => {
    if(!st.mood) return;
    SS.user = st;
    // persist to backend (fire-and-forget — don't block UX)
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: st.name, login: st.login, area: st.area, mood: st.mood }),
    }).catch(() => {});
    showView('assessment');
  });
}


/* ══════════════════════════════════════════════════════
   ASSESSMENT
   ══════════════════════════════════════════════════════ */
const QS_EN = [
  { q:'How does AI already show up in your work today?',
    ctx:'No right answer — what matters is your real starting point.',
    opts:[
      {l:'I haven\'t used it yet. Not sure where to begin.',s:0},
      {l:'I use ChatGPT or similar for one-off tasks: summarizing texts, drafting e-mails.',s:1},
      {l:'I have an AI routine: various tools, solid prompts, I experiment with new use cases.',s:2},
      {l:'I\'ve built flows or automations with AI — I connect tools and think in scale.',s:3}
    ]},
  { q:'You need to screen 200 candidate profiles. How would you use AI?',
    ctx:'Think about how you\'d act today — not how you\'d like to act in the future.',
    opts:[
      {l:'I\'m not sure how AI would help me with this task.',s:0},
      {l:'I\'d try using ChatGPT to summarize a few profiles, without a defined process.',s:1},
      {l:'I\'d build a complete prompt with context, criteria, and output format.',s:2},
      {l:'I\'d go straight to creating an agent or automated flow for the entire process.',s:3}
    ]},
  { q:'What are AI agents?',
    ctx:'Choose the option that best describes your understanding today.',
    opts:[
      {l:'I\'ve heard of them but I\'m still unclear on what they actually are.',s:0},
      {l:'Assistants like ChatGPT or Claude that answer questions.',s:0},
      {l:'Systems that execute tasks autonomously, using tools across multiple steps.',s:2},
      {l:'Pipelines that orchestrate multiple models and tools with minimal supervision.',s:3}
    ]},
  { q:'Which statement best reflects how you think about AI in HR today?',
    ctx:'Choose the one that resonates most with where you are right now.',
    opts:[
      {l:'I\'m still grasping the basics — I want to understand it before experimenting.',s:0},
      {l:'I get the concept but want to use it better in my day-to-day work.',s:1},
      {l:'I already use it well — I want to build flows and automations for my area.',s:2},
      {l:'I want to be a reference in AI for HR — lead experiments and build solutions.',s:3}
    ]}
];

const QS_PT = [
  { q:'Como a IA já aparece no seu trabalho hoje?',
    ctx:'Sem resposta certa — o que importa é o seu ponto de partida real.',
    opts:[
      {l:'Ainda não usei. Não sei bem por onde começar.',s:0},
      {l:'Uso ChatGPT ou similar para tarefas pontuais: resumir textos, rascunhar e-mails.',s:1},
      {l:'Tenho uma rotina com IA: ferramentas variadas, bons prompts, experimento casos novos.',s:2},
      {l:'Já montei fluxos ou automações com IA — conecto ferramentas e penso em escala.',s:3}
    ]},
  { q:'Precisando analisar 200 perfis de candidatos. Como você usaria IA nisso?',
    ctx:'Pense em como agiria hoje — não em como gostaria de agir no futuro.',
    opts:[
      {l:'Não sei como a IA me ajudaria nessa tarefa.',s:0},
      {l:'Tentaria usar o ChatGPT para resumir alguns perfis, sem processo definido.',s:1},
      {l:'Montaria um prompt completo com contexto, critérios e formato de saída.',s:2},
      {l:'Pensaria direto em criar um agente ou fluxo automatizado para o processo inteiro.',s:3}
    ]},
  { q:'O que são agentes de IA?',
    ctx:'Escolha a opção que melhor descreve seu entendimento hoje.',
    opts:[
      {l:'Ouço falar, mas ainda não tenho clareza sobre o que são.',s:0},
      {l:'São assistentes como ChatGPT ou Claude que respondem perguntas.',s:0},
      {l:'São sistemas que executam tarefas de forma autônoma, usando ferramentas em múltiplos passos.',s:2},
      {l:'São pipelines que orquestram múltiplos modelos e ferramentas com supervisão mínima.',s:3}
    ]},
  { q:'Qual frase mais reflete como você pensa sobre IA no RH hoje?',
    ctx:'Escolha a que mais ressoa com o seu momento.',
    opts:[
      {l:'Ainda estou entendendo o básico — quero saber o que é antes de experimentar.',s:0},
      {l:'Já entendo o conceito, mas quero aprender a usar melhor no dia a dia.',s:1},
      {l:'Já uso bem — quero construir fluxos e automações para a minha área.',s:2},
      {l:'Quero ser referência em IA no RH — liderar experimentos e construir soluções.',s:3}
    ]}
];

const QS = () => _lang === 'pt' ? QS_PT : QS_EN;

const LV = {
  basico:        {get badge(){return t('lv_base_badge')}, cls:'badge-brand',   get title(){return t('lv_base_title')}, get desc(){return t('lv_base_desc')}},
  intermediario: {get badge(){return t('lv_int_badge')},  cls:'badge-warning', get title(){return t('lv_int_title')},  get desc(){return t('lv_int_desc')}},
  avancado:      {get badge(){return t('lv_adv_badge')},  cls:'badge-indigo',  get title(){return t('lv_adv_title')},  get desc(){return t('lv_adv_desc')}},
};

function calcLevel(ans) {
  const qs = QS();
  const score = ans.reduce((s,a,i)=>s+(a!=null?qs[i].opts[a].s:0),0);
  return score<=2?'basico':score<=5?'intermediario':'avancado';
}

function renderAssessment() {
  const wrap = $('view-assessment');
  document.title = 'Assessment — Agentic HR';
  const user = SS.user||{};
  const qs   = QS();
  const ans  = new Array(qs.length).fill(null);
  let cur    = 0;

  function qHTML() {
    const q=qs[cur], ltrs=['A','B','C','D'];
    return `
      <div class="as-prog-row">
        <div class="as-prog-bar"><div class="as-prog-fill" id="as-fill" style="width:${Math.round(cur/qs.length*100)}%"></div></div>
        <span class="as-prog-label">${t('as_question_label')} ${cur+1} ${t('as_question_of')} ${qs.length}</span>
      </div>
      <p class="as-eyebrow">${t('as_eyebrow')}</p>
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
        <button class="btn-link" id="as-prev" style="visibility:${cur===0?'hidden':'visible'}">${t('as_back')}</button>
        <button class="btn btn-primary btn-lg" id="as-next" ${ans[cur]===null?'disabled':''}>${cur<qs.length-1?t('as_next')+' <i class="ti ti-arrow-right"></i>':t('as_see_result')+' <i class="ti ti-arrow-right"></i>'}</button>
      </div>`;
  }

  function resHTML(nivel) {
    const nm=user.name?user.name.split(' ')[0]:'';
    return `
      <div class="as-prog-row">
        <div class="as-prog-bar"><div class="as-prog-fill" style="width:100%"></div></div>
        <span class="as-prog-label">${t('as_completed')} <i class="ti ti-check"></i></span>
      </div>
      <div class="as-result-wrap">
        <div class="as-result-btns">
          <button class="btn btn-primary btn-lg" id="as-go">${t('as_go')} <i class="ti ti-arrow-right"></i></button>
          <button class="btn btn-ghost btn-md" id="as-redo">${t('as_redo')}</button>
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
      if(cur<qs.length-1){ cur++; card.innerHTML=qHTML(); wire(); }
      else {
        const nivel=calcLevel(ans); SS.nivel=nivel;
        const u=SS.user; if(u?.login) fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...u,nivel})}).catch(()=>{});
        card.innerHTML=resHTML(nivel);
        showLevelModal(nivel, user);
        $('as-go').addEventListener('click',()=>showView('portal'));
        $('as-redo').addEventListener('click',()=>renderAssessment());
      }
    },{signal:s});
  }

  render();
}


/* ── Level result modal ───────────────────────────────── */
function showLevelModal(nivel, user) {
  const el = document.createElement('div');
  el.className = 'lv-modal-backdrop';
  el.innerHTML = `
    <div class="lv-modal" role="dialog" aria-modal="true">
      <div class="lv-modal-step">
        <div class="lv-step-check"><i class="ti ti-check"></i></div>
        <div class="lv-step-info">
          <span class="lv-step-label">${t('as_step_label')}</span>
          <span class="lv-step-name">${t('as_step_name')}</span>
        </div>
      </div>
      <div class="lv-modal-footer" style="padding:1.5rem">
        <button class="btn btn-primary btn-lg lv-modal-cta" id="lv-modal-go">
          ${t('as_go')} <i class="ti ti-arrow-right"></i>
        </button>
      </div>
    </div>`;

  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('lv-modal-visible'));

  el.querySelector('#lv-modal-go').addEventListener('click', () => {
    el.classList.remove('lv-modal-visible');
    el.addEventListener('transitionend', () => { el.remove(); showView('portal'); }, { once: true });
  });
}

/* ══════════════════════════════════════════════════════
   CURRICULUM DATA
   ══════════════════════════════════════════════════════ */
const STAGES = [
  { id:'s1', get label(){return t('s1_label')}, icon:'ti-brain',
    get title(){return t('s1_title')},
    get subtitle(){return t('s1_subtitle')},
    levels:['basico','intermediario','avancado'],
    mods:[
      {id:'genai',    type:'link', url:'https://university.ciandt.com/plus/catalog/courses/455',                                    title:'GEN AI Basic',                   src:'ciandt',   srcL:'CI&T University',   get desc(){return t('mod_genai_desc')},                                                        dur:'~1h',      req:true},
      {id:'genai-hr', type:'link', url:'https://www.linkedin.com/learning/generative-ai-in-hr',                                     title:'Generative AI in HR',            src:'linkedin', srcL:'LinkedIn Learning', get desc(){return t('mod_genai_hr_desc')},                   dur:'~2h',      req:true},
      {id:'c101',     type:'link', url:'https://anthropic-partners.skilljar.com/claude-101',                                        title:'Claude 101',                     src:'anthropic',srcL:'Anthropic',         get desc(){return t('mod_c101_desc')},                                          dur:'~1h',      req:true},
      {id:'c-hr',     type:'link', url:'https://claude.com/resources/tutorials/claude-for-human-resources',                         title:'Claude for Human Resources',     src:'anthropic',srcL:'Anthropic',         get desc(){return t('mod_chr_desc')},dur:'~30min',   req:true},
      {id:'flow-ob',  type:'link', url:'https://flow.ciandt.com/content-hub/en/category/onboarding',                                title:'Flow Onboarding',                src:'interno',  srcL:'CI&T Flow',         get desc(){return t('mod_flowob_desc')},                                                                           dur:'~30min',   req:true},
      {id:'lean',     type:'link', url:'https://www.linkedin.com/learning/paths/ci-t-lean-kickstart?u=451056106',                   title:'Lean Kick Start',                src:'linkedin', srcL:'LinkedIn Learning', get desc(){return t('mod_lean_desc')},                   dur:'~1h',      req:true},
      {id:'cow',      type:'link', url:'https://anthropic-partners.skilljar.com/introduction-to-claude-cowork',                     title:'Introduction to Claude Cowork',  src:'anthropic',srcL:'Anthropic',         get desc(){return t('mod_cow_desc')},                    dur:'~1h',      req:true},
      {id:'cc101',    type:'link', url:'https://anthropic.skilljar.com/claude-code-101',                                            title:'Claude Code 101',                src:'anthropic',srcL:'Anthropic',         get desc(){return t('mod_cc101_desc')},                                    dur:'~2h',      req:true},
      {id:'gov',      type:'link', url:null,                                                                                                                                              get title(){return t('mod_gov_title')},               src:'interno',  srcL:'Interno',           get desc(){return t('mod_gov_desc')},          dur:'~30min',   req:true,  soon:true},
      // Optional modules
      {id:'prompt',   type:'link', url:'https://www.coursera.org/learn/generative-ai-prompt-engineering-for-everyone/home/module/1',                                              title:'Prompt Engineering Basics',                    src:'coursera', srcL:'Coursera',           get desc(){return t('mod_prompt_desc')},       dur:'~10h',     req:false},
      {id:'fluency',  type:'link', url:'https://anthropic.skilljar.com/ai-fluency-framework-foundations',                                                                         title:'AI Fluency: Framework & Foundations',           src:'anthropic',srcL:'Anthropic',          get desc(){return t('mod_fluency_desc')},      dur:'~2h',      req:false},
      {id:'soft',     type:'link', url:'https://www.linkedin.com/learning/paths/ci-t-gen-ai-soft-skills?u=451056106',                                                             title:'GEN AI Soft Skills',                           src:'linkedin', srcL:'LinkedIn Learning',  get desc(){return t('mod_soft_desc')},         dur:'~20h',     req:false},
      {id:'agents-wf',type:'link', url:'https://www.linkedin.com/learning/content/paths/90738605?contextUrn=urn%3Ali%3AlyndaLearningPath%3A1~AAAAABrikeo%3D7091015&u=451056106', title:'Preparing for the Future of Work with AI Agents',src:'linkedin',srcL:'LinkedIn Learning', get desc(){return t('mod_agentswf_desc')},     dur:'~2h30',    req:false},
      {id:'proj',     type:'link', url:'https://claude.com/resources/tutorials/intro-to-projects',                                                                                title:'Intro to Projects',                            src:'anthropic',srcL:'Anthropic',          get desc(){return t('mod_proj_desc')},         dur:'~15–20min',req:false},
      {id:'skills',   type:'link', url:'https://anthropic-partners.skilljar.com/introduction-to-agent-skills',                                                                    title:'Introduction to Agent Skills',                 src:'anthropic',srcL:'Anthropic',          get desc(){return t('mod_skills_desc')},       dur:'~1h',      req:false},
      {id:'orch',     type:'link', url:'https://www.linkedin.com/learning/paths/ci-t-gen-ai-orchestrator-certification-pathway?u=451056106',                                      title:'AI Orchestrator — Full Path',                  src:'linkedin', srcL:'LinkedIn Learning',  get desc(){return t('mod_orch_desc')},         dur:'~52h',     req:false},
    ]
  },
];


/* ══════════════════════════════════════════════════════
   PORTAL
   ══════════════════════════════════════════════════════ */
function renderPortal() {
  const wrap   = $('view-portal');
  const user   = SS.user||{};
  const nivel  = SS.nivel||'basico';
  const name   = user.name ? user.name.split(' ')[0] : t('portal_name_fallback');
  document.title = t('page_title_portal');

  const visible = STAGES.filter(s=>s.levels.includes(nivel));
  const allIds  = visible.flatMap(s=>s.mods.map(m=>m.id));
  const overall = SS.stagePct(allIds);
  const lv = LV[nivel];

  const unlockedAchs = SS.achievements;
  const achHTML = ACHIEVEMENTS.map(a => {
    const unlocked = !!unlockedAchs[a.id];
    return `<div class="ach-card${unlocked ? ' unlocked' : ''}" title="${a.desc}">
      <div class="ach-card-icon">${a.icon}</div>
      <p class="ach-card-name">${a.name}</p>
      ${unlocked ? '<div class="ach-card-check">✓</div>' : ''}
    </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="portal-scroll" id="portal-scroll">
      <div class="portal-inner">
        <div class="portal-welcome">
          <div>
            <h1 class="portal-greeting">${t('portal_hello')} ${esc(name)} <span class="badge ${lv.cls} badge-sm" style="vertical-align:middle">${lv.badge}</span></h1>
            <p class="portal-sub">${overall.pct === 100 ? t('portal_greeting_sub_done') : `${t('portal_greeting_sub')} ${overall.done} ${t('portal_greeting_of')} ${overall.total} ${t('portal_greeting_modules')}`}</p>
          </div>
          <div class="portal-overall">
            <span class="portal-overall-pct">${overall.pct}%</span>
            <div class="portal-overall-info"><strong>${overall.done}/${overall.total}</strong>${t('portal_modules')}</div>
          </div>
        </div>
        ${overall.pct === 100 ? `
        <div class="cert-banner">
          <div class="cert-banner-left">
            <span class="cert-banner-icon">🌟</span>
            <div>
              <p class="cert-banner-title">${t('cert_banner_title')}</p>
              <p class="cert-banner-sub">${t('cert_banner_sub')}</p>
            </div>
          </div>
          <button class="btn btn-primary cert-banner-btn" id="open-cert-btn"><i class="ti ti-certificate"></i> ${t('cert_banner_btn')}</button>
        </div>` : ''}
        <div class="stages" id="portal-stages"></div>
        <div class="notice-banner">
          <div class="notice-icon">📋</div>
          <div class="notice-body">
            <p class="notice-title">${t('portal_notice_title')}</p>
            <p class="notice-text">${t('portal_notice_text')} <a class="notice-link" href="https://www.linkedin.com/learning/paths/ci-t-gen-ai-orchestrator-certification-pathway?u=451056106" target="_blank" rel="noopener">${t('portal_notice_link')} <i class="ti ti-arrow-up-right" style="font-size:0.7rem"></i></a>.</p>
          </div>
        </div>
        <div class="ach-section">
          <p class="ach-section-title"><i class="ti ti-trophy"></i> ${t('ach_title')} <span class="ach-count">${Object.keys(unlockedAchs).length}/${ACHIEVEMENTS.length}</span></p>
          <div class="ach-grid">${achHTML}</div>
        </div>
        <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border-dim);display:flex;align-items:center;justify-content:flex-end;gap:0.75rem;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" id="preview-cert-btn"><i class="ti ti-certificate"></i> ${t('preview_cert')}</button>
        </div>
      </div>
    </div>`;

  const stagesEl = $('portal-stages');

  document.getElementById('open-cert-btn')?.addEventListener('click', showCertificate);
  document.getElementById('preview-cert-btn')?.addEventListener('click', showCertificate);
  document.getElementById('preview-completion-btn')?.addEventListener('click', showCompletion);
  if (typeof observeStages === 'function') requestAnimationFrame(observeStages);

  visible.forEach((stage, si) => {
    const sp = SS.stagePct(stage.mods.map(m=>m.id));
    const prev = visible[si-1];
    const unlocked = !prev || SS.stagePct(prev.mods.map(m=>m.id)).pct >= 70;
    const isDone   = sp.pct === 100;
    const sCls     = !unlocked ? 's-locked' : isDone ? 's-done' : 's-active';

    let pillCls='badge-neutral', pillTxt=t('portal_not_started');
    if (isDone)         { pillCls='badge-brand';   pillTxt=t('portal_completed'); }
    else if (sp.done>0) { pillCls='badge-warning';  pillTxt=`${sp.done}/${sp.mods||sp.total} ${t('portal_in_progress')}`; }

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
        ${unlocked ? buildModList(stage.mods) : `<div class="stage-locked-msg"><i class="ti ti-lock"></i> ${t('portal_locked_msg')}</div>`}
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
  const sc = {linkedin:'src-linkedin', anthropic:'src-anthropic', ciandt:'src-ciandt', interno:'src-interno', serie:'src-serie', coursera:'src-coursera'};
  const listId = 'ml-' + Math.random().toString(36).slice(2,7);
  const html = `<div class="mod-list" id="${listId}">
    <p class="mod-list-hdr">
      ${mods.length} ${mods.length===1?t('portal_mod_count_s'):t('portal_mod_count_p')}
      <div class="mod-filter">
        <button class="mod-filter-btn active" data-filter="all"  data-list="${listId}">${t('filter_all')}</button>
        <button class="mod-filter-btn"        data-filter="req"  data-list="${listId}">${t('filter_req')}</button>
        <button class="mod-filter-btn"        data-filter="opt"  data-list="${listId}">${t('filter_opt')}</button>
      </div>
    </p>` +
    mods.map(m => {
      const done = SS.done(m.id);
      const openBtn = m.soon
        ? `<span style="font-size:0.7rem;color:var(--text-dim);display:flex;align-items:center;gap:0.3rem"><i class="ti ti-clock"></i> ${t('mod_soon_label')}</span>`
        : m.type==='ep'
          ? `<button class="mod-btn-open" data-slug="${esc(m.slug)}"><i class="ti ti-book-open"></i> ${t('mod_read')}</button>`
          : m.url
            ? `<a class="mod-btn-open" href="${esc(m.url)}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> ${t('mod_access')}</a>`
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
              ${m.req?`<span class="mod-req">${t('mod_req')}</span>`:`<span class="mod-opt">${t('mod_opt')}</span>`}
            </div>
          </div>
          <div class="mod-actions">
            ${openBtn}
            ${!m.soon?`<button class="mod-btn-done${done?' is-done':''}" data-mid="${m.id}">${done?`<i class="ti ti-check"></i> ${t('mod_done_done')}`:t('mod_done')}</button>`:''}
          </div>
        </div>`;
    }).join('') + '</div>';
  return html;
}

// Delegação global para filtros de módulo
document.addEventListener('click', e => {
  const btn = e.target.closest('.mod-filter-btn');
  if (!btn) return;
  const listId = btn.dataset.list;
  const filter = btn.dataset.filter;
  const list   = document.getElementById(listId);
  if (!list) return;

  list.querySelectorAll('.mod-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  list.querySelectorAll('.mod[data-mid]').forEach(mod => {
    const isReq = mod.querySelector('.mod-req') !== null;
    const show  = filter === 'all' || (filter === 'req' && isReq) || (filter === 'opt' && !isReq);
    mod.style.display = show ? '' : 'none';
  });
});


/* ══════════════════════════════════════════════════════
   EPISODES GRID
   ══════════════════════════════════════════════════════ */
function renderEpisodes() {
  if (!DATA) return;
  const {episodes} = DATA;
  const wrap = $('view-episodes');
  document.title = t('page_title_episodes');

  const cards = episodes.map(ep => {
    const locked = ep.status !== 'published';
    const mid    = STAGES.flatMap(s=>s.mods).find(m=>m.slug===ep.slug)?.id;
    const done   = mid ? SS.done(mid) : false;
    return `
      <div class="ep-card${locked?' locked':''}" data-slug="${esc(ep.slug)}" data-locked="${locked}">
        <div class="ep-thumb">
          <span>${ep.thumbnail}</span>
          <span class="ep-week-badge">${ep.weekLabel}</span>
          <span class="ep-status-badge ${locked?'soon':'avail'}">${locked?t('mod_soon_label'):t('ep_available')}</span>
          ${done?'<div class="ep-done-ring">✓</div>':''}
        </div>
        <div class="ep-body">
          <p class="ep-num">${t('ep_label')} ${ep.id}</p>
          <p class="ep-title">${ep.title}</p>
          <p class="ep-tagline">${ep.tagline}</p>
          <div class="ep-tags">${ep.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          ${!locked?`<div class="ep-cta">${t('mod_read')} <i class="ti ti-arrow-right"></i></div>`:''}
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
  document.title = ep ? `${ep.title} — Agentic HR` : 'Agentic HR';
  initRP();

  if (!ep || ep.status!=='published') {
    wrap.innerHTML=`<div class="ep-page-scroll"><div class="ep-page-inner"><button class="ep-back" id="ep-back"><i class="ti ti-arrow-left"></i> ${t('ep_back')}</button><p style="color:var(--text-muted);padding:2rem 0">Episódio não publicado ainda.</p></div></div>`;
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
        ${done ? t('ep_done_done') : t('ep_mark_done')}
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

  SS.markVisit(slug);

  const scroll = $('ep-scroll');
  if (scroll && rpRef) scroll.addEventListener('scroll', rpRef, {passive:true});

  if (scroll) {
    let readerFired = false;
    scroll.addEventListener('scroll', () => {
      if (readerFired) return;
      const pct = scroll.scrollHeight - scroll.clientHeight > 0
        ? scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight) : 0;
      if (pct >= 0.9) { readerFired = true; unlockReaderAchievement(); }
    }, {passive:true});
  }
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
