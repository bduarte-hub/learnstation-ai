// POST /api/progress — update episode completion for a user
export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { login, episodeId, done } = await request.json();
    if (!login || !episodeId) return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400, headers: cors });

    const key    = `user:${login.toLowerCase().trim()}`;
    const record = await env.LEARNSTATION_USERS.get(key, 'json');
    if (!record) return new Response(JSON.stringify({ error: 'user not found' }), { status: 404, headers: cors });

    record.progress            = record.progress || {};
    record.progress[episodeId] = done ? new Date().toISOString() : null;
    record.updatedAt           = new Date().toISOString();

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
