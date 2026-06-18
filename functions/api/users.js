// GET /api/users?pwd=XXX — admin: list all users
const ADMIN_PWD = 'learnstation2025';

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
    const list   = await env.LEARNSTATION_USERS.list({ prefix: 'user:' });
    const users  = await Promise.all(
      list.keys.map(k => env.LEARNSTATION_USERS.get(k.name, 'json'))
    );
    return new Response(JSON.stringify(users.filter(Boolean)), { headers: cors });
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
