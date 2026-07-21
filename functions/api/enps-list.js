// GET /api/enps-list?pwd=XXX — admin: list all eNPS responses
const ADMIN_PWD = 'hrsummit@2026';

export async function onRequestGet({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const url = new URL(request.url);
  if (url.searchParams.get('pwd') !== ADMIN_PWD) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors });
  }

  try {
    const list    = await env.LEARNSTATION_USERS.list({ prefix: 'enps:' });
    const records = await Promise.all(
      list.keys.map(k => env.LEARNSTATION_USERS.get(k.name, 'json'))
    );
    return new Response(JSON.stringify(records.filter(Boolean)), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
