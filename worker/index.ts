export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
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

let schemaReady: Promise<void> | null = null;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
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

async function handleApi(request: Request, env: Env): Promise<Response> {
  await ensureSchema(env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

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
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
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
