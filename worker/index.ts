export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  VISITORS_PASSWORD?: string;
}

const CONFIG_KEYS = {
  factoryMapping: 'factory_mapping',
  architectureConfig: 'architecture_config',
} as const;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const AUTH_COOKIE = 'visitors_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STATIC_EXT =
  /\.(js|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|mp3|mp4|webm|json|txt)$/i;

let schemaReady: Promise<void> | null = null;
let visitorSchemaReady: Promise<void> | null = null;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function html(body: string, status = 200, headers: HeadersInit = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

async function ensureSchema(env: Env): Promise<void> {
  if (!env.DB) {
    throw new Error('D1 binding "DB" is not configured');
  }
  if (!schemaReady) {
    schemaReady = env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    )
      .run()
      .then(() => undefined);
  }
  await schemaReady;
}

async function ensureVisitorSchema(env: Env): Promise<void> {
  if (!env.DB) {
    throw new Error('D1 binding "DB" is not configured');
  }
  if (!visitorSchemaReady) {
    visitorSchemaReady = (async () => {
      await env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS visitor_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          country TEXT,
          city TEXT,
          region TEXT,
          continent TEXT,
          timezone TEXT,
          ip TEXT,
          method TEXT,
          url TEXT,
          path TEXT,
          user_agent TEXT,
          referer TEXT
        )`,
      ).run();
      await env.DB.prepare(
        `CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at
         ON visitor_logs (created_at DESC)`,
      ).run();
    })();
  }
  await visitorSchemaReady;
}

async function getConfigValue(env: Env, key: string): Promise<unknown | null> {
  const row = await env.DB.prepare(
    'SELECT value FROM app_config WHERE key = ?',
  )
    .bind(key)
    .first<{ value: string }>();
  if (!row?.value) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

async function setConfigValue(
  env: Env,
  key: string,
  value: unknown,
): Promise<void> {
  const result = await env.DB.prepare(
    `INSERT INTO app_config (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = excluded.updated_at`,
  )
    .bind(key, JSON.stringify(value))
    .run();

  if (!result.success) {
    throw new Error(`D1 write failed for key "${key}"`);
  }
}

function shouldLogVisit(request: Request, path: string): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  if (path.startsWith('/api/')) return false;
  if (path.startsWith('/visitors')) return false;
  if (STATIC_EXT.test(path)) return false;
  const accept = request.headers.get('Accept') ?? '';
  return accept.includes('text/html');
}

async function insertVisitorLog(request: Request, env: Env): Promise<void> {
  try {
    await ensureVisitorSchema(env);
    const url = new URL(request.url);
    const cf = request.cf;
    await env.DB.prepare(
      `INSERT INTO visitor_logs
        (country, city, region, continent, timezone, ip, method, url, path, user_agent, referer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        cf?.country ?? null,
        cf?.city ?? null,
        cf?.region ?? null,
        cf?.continent ?? null,
        cf?.timezone ?? null,
        request.headers.get('CF-Connecting-IP') ??
          request.headers.get('X-Forwarded-For') ??
          null,
        request.method,
        request.url,
        url.pathname,
        request.headers.get('User-Agent') ?? null,
        request.headers.get('Referer') ?? null,
      )
      .run();
  } catch (err) {
    console.error('visitor log insert failed:', err);
  }
}

function getCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('Cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function createSessionToken(password: string): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmacSign(password, `visitors:${exp}`);
  return `${exp}.${sig}`;
}

async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const password = env.VISITORS_PASSWORD;
  if (!password) return false;
  const token = getCookie(request, AUTH_COOKIE);
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  const expected = await hmacSign(password, `visitors:${exp}`);
  return timingSafeEqual(sig, expected);
}

function setAuthCookie(token: string): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

function clearAuthCookie(): string {
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

type VisitorRow = {
  id: number;
  created_at: string;
  country: string | null;
  city: string | null;
  region: string | null;
  continent: string | null;
  timezone: string | null;
  ip: string | null;
  method: string | null;
  url: string | null;
  path: string | null;
  user_agent: string | null;
  referer: string | null;
};

async function queryVisitors(
  env: Env,
  q: string,
  limit: number,
): Promise<VisitorRow[]> {
  await ensureVisitorSchema(env);
  const capped = Math.min(Math.max(limit, 1), 200);
  if (q) {
    const like = `%${q}%`;
    const result = await env.DB.prepare(
      `SELECT id, created_at, country, city, region, continent, timezone,
              ip, method, url, path, user_agent, referer
       FROM visitor_logs
       WHERE IFNULL(ip, '') LIKE ?
          OR IFNULL(country, '') LIKE ?
          OR IFNULL(city, '') LIKE ?
          OR IFNULL(region, '') LIKE ?
          OR IFNULL(url, '') LIKE ?
          OR IFNULL(path, '') LIKE ?
          OR IFNULL(user_agent, '') LIKE ?
          OR IFNULL(referer, '') LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
      .bind(like, like, like, like, like, like, like, like, capped)
      .all<VisitorRow>();
    return result.results ?? [];
  }

  const result = await env.DB.prepare(
    `SELECT id, created_at, country, city, region, continent, timezone,
            ip, method, url, path, user_agent, referer
     FROM visitor_logs
     ORDER BY created_at DESC
     LIMIT ?`,
  )
    .bind(capped)
    .all<VisitorRow>();
  return result.results ?? [];
}

function loginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visitors · Login</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      background: #0b1220; color: #e8eef8;
    }
    form {
      width: min(360px, 92vw); display: grid; gap: 12px;
      padding: 28px; border: 1px solid #1e2a3f; border-radius: 12px;
      background: #111a2b;
    }
    h1 { margin: 0 0 4px; font-size: 1.15rem; font-weight: 600; }
    p { margin: 0 0 8px; color: #8fa0b8; font-size: 0.9rem; }
    input {
      width: 100%; padding: 10px 12px; border-radius: 8px;
      border: 1px solid #2a3a55; background: #0b1220; color: inherit;
    }
    button {
      padding: 10px 12px; border: 0; border-radius: 8px; cursor: pointer;
      background: #3b82f6; color: white; font-weight: 600;
    }
    .err { color: #f87171; font-size: 0.85rem; min-height: 1.2em; }
  </style>
</head>
<body>
  <form method="POST" action="/visitors/login">
    <h1>Visitors</h1>
    <p>Enter the access password.</p>
    <input type="password" name="password" placeholder="Password" autofocus required />
    <div class="err">${error ? escapeHtml(error) : ''}</div>
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;
}

function visitorsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visitors</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      background: #0b1220; color: #e8eef8;
    }
    header {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
      padding: 16px 20px; border-bottom: 1px solid #1e2a3f;
      background: #111a2b; position: sticky; top: 0;
    }
    h1 { margin: 0; font-size: 1.1rem; font-weight: 600; margin-right: auto; }
    input[type="search"] {
      min-width: min(320px, 70vw); padding: 8px 12px; border-radius: 8px;
      border: 1px solid #2a3a55; background: #0b1220; color: inherit;
    }
    button, .link-btn {
      padding: 8px 12px; border-radius: 8px; border: 1px solid #2a3a55;
      background: #182338; color: inherit; cursor: pointer; font: inherit;
    }
    main { padding: 16px 20px 40px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td {
      text-align: left; padding: 8px 10px; border-bottom: 1px solid #1a2436;
      vertical-align: top; white-space: nowrap; max-width: 280px;
      overflow: hidden; text-overflow: ellipsis;
    }
    th { color: #8fa0b8; font-weight: 600; position: sticky; top: 57px; background: #0b1220; }
    td.wrap { white-space: normal; max-width: 360px; }
    .meta { color: #8fa0b8; font-size: 0.85rem; padding: 0 20px 12px; }
    .empty { color: #8fa0b8; padding: 40px 0; text-align: center; }
  </style>
</head>
<body>
  <header>
    <h1>Visitors</h1>
    <input id="q" type="search" placeholder="Search IP, country, city, path, UA…" />
    <button type="button" id="refresh">Refresh</button>
    <form method="POST" action="/visitors/logout" style="margin:0">
      <button type="submit">Logout</button>
    </form>
  </header>
  <div class="meta" id="meta">Loading…</div>
  <main>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Country</th>
          <th>City</th>
          <th>IP</th>
          <th>Path</th>
          <th>Referer</th>
          <th>User agent</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <div class="empty" id="empty" hidden>No visitors yet.</div>
  </main>
  <script>
    const rowsEl = document.getElementById('rows');
    const metaEl = document.getElementById('meta');
    const emptyEl = document.getElementById('empty');
    const qEl = document.getElementById('q');
    let timer;

    function esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[c]);
    }

    function trunc(s, n) {
      s = String(s ?? '');
      return s.length > n ? s.slice(0, n - 1) + '…' : s;
    }

    async function load() {
      const q = qEl.value.trim();
      const url = '/api/visitors?limit=200' + (q ? '&q=' + encodeURIComponent(q) : '');
      metaEl.textContent = 'Loading…';
      const res = await fetch(url, { credentials: 'same-origin' });
      if (res.status === 401) {
        location.reload();
        return;
      }
      if (!res.ok) {
        metaEl.textContent = 'Failed to load visitors (' + res.status + ')';
        return;
      }
      const data = await res.json();
      const items = data.visitors || [];
      metaEl.textContent = items.length + ' row' + (items.length === 1 ? '' : 's')
        + (q ? ' matching “' + q + '”' : '') + ' (newest first, max 200)';
      emptyEl.hidden = items.length > 0;
      rowsEl.innerHTML = items.map((v) =>
        '<tr>' +
          '<td>' + esc(v.created_at) + '</td>' +
          '<td>' + esc(v.country) + '</td>' +
          '<td>' + esc(v.city) + '</td>' +
          '<td>' + esc(v.ip) + '</td>' +
          '<td title="' + esc(v.path) + '">' + esc(v.path) + '</td>' +
          '<td class="wrap" title="' + esc(v.referer) + '">' + esc(trunc(v.referer, 60)) + '</td>' +
          '<td class="wrap" title="' + esc(v.user_agent) + '">' + esc(trunc(v.user_agent, 80)) + '</td>' +
        '</tr>'
      ).join('');
    }

    qEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(load, 250);
    });
    document.getElementById('refresh').addEventListener('click', load);
    load();
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function handleVisitorsAdmin(
  request: Request,
  env: Env,
  path: string,
): Promise<Response> {
  if (!env.VISITORS_PASSWORD) {
    return html(
      loginPage('VISITORS_PASSWORD is not configured on this Worker.'),
      503,
    );
  }

  if (path === '/visitors/login' && request.method === 'POST') {
    const form = await request.formData();
    const password = String(form.get('password') ?? '');
    const ok =
      password.length === env.VISITORS_PASSWORD.length &&
      timingSafeEqual(password, env.VISITORS_PASSWORD);
    if (!ok) {
      return html(loginPage('Incorrect password.'), 401);
    }
    const token = await createSessionToken(env.VISITORS_PASSWORD);
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/visitors',
        'Set-Cookie': setAuthCookie(token),
      },
    });
  }

  if (path === '/visitors/logout' && request.method === 'POST') {
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/visitors',
        'Set-Cookie': clearAuthCookie(),
      },
    });
  }

  if (path === '/visitors' && request.method === 'GET') {
    if (!(await isAuthenticated(request, env))) {
      return html(loginPage());
    }
    return html(visitorsPage());
  }

  return json({ error: 'Not found' }, 404);
}

async function handleVisitorsApi(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!(await isAuthenticated(request, env))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Number(url.searchParams.get('limit') ?? '200');
  const visitors = await queryVisitors(
    env,
    q,
    Number.isFinite(limit) ? limit : 200,
  );
  return json({ visitors });
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  await ensureSchema(env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/visitors') {
    return handleVisitorsApi(request, env);
  }

  if (path === '/api/config' && request.method === 'GET') {
    const [factoryMapping, architectureConfig] = await Promise.all([
      getConfigValue(env, CONFIG_KEYS.factoryMapping),
      getConfigValue(env, CONFIG_KEYS.architectureConfig),
    ]);
    return json({ factoryMapping, architectureConfig });
  }

  if (path === '/api/config/factory-mapping' && request.method === 'PUT') {
    const body = await request.json();
    await setConfigValue(env, CONFIG_KEYS.factoryMapping, body);
    return json({ ok: true });
  }

  if (path === '/api/config/architecture' && request.method === 'PUT') {
    const body = await request.json();
    await setConfigValue(env, CONFIG_KEYS.architectureConfig, body);
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (
      path === '/visitors' ||
      path === '/visitors/login' ||
      path === '/visitors/logout'
    ) {
      try {
        return await handleVisitorsAdmin(request, env, path);
      } catch (err) {
        console.error('Visitors admin error:', err);
        return html(loginPage('Server error.'), 500);
      }
    }

    if (shouldLogVisit(request, path)) {
      ctx.waitUntil(insertVisitorLog(request, env));
    }

    if (path.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (err) {
        console.error('API error:', err);
        const message =
          err instanceof Error ? err.message : 'Internal server error';
        return json({ error: message }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
