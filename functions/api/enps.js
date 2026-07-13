// POST /api/enps — salva resposta eNPS no KV
export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { login, score, comment } = body;

    if (!login || score === undefined) {
      return new Response(JSON.stringify({ error: 'login e score são obrigatórios' }), { status: 400, headers: cors });
    }

    const key    = `enps:${login.toLowerCase().trim()}`;
    const record = {
      login:     login.toLowerCase().trim(),
      score:     Number(score),
      comment:   comment || '',
      answeredAt: new Date().toISOString(),
    };

    await env.LEARNSTATION_USERS.put(key, JSON.stringify(record));

    return new Response(JSON.stringify({ ok: true }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
