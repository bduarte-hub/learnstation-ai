// POST /api/register — called on onboarding completion
export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { name, login, area, mood, nivel } = body;

    if (!login) return new Response(JSON.stringify({ error: 'login required' }), { status: 400, headers: cors });

    const key   = `user:${login.toLowerCase().trim()}`;
    const existing = await env.LEARNSTATION_USERS.get(key, 'json');

    const record = {
      name:      name || '',
      login:     login.toLowerCase().trim(),
      area:      area || '',
      mood:      mood || '',
      nivel:     nivel || 'basico',
      progress:  existing?.progress  || {},
      joinedAt:  existing?.joinedAt  || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
