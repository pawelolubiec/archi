import type { ArchitectureConfig } from '../data/architectureLayout';
import type { FactoryMapping } from '../data/factoryLayout';

export interface RemoteConfig {
  factoryMapping: FactoryMapping | null;
  architectureConfig: ArchitectureConfig | null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Config API returned non-JSON (${res.status}). Is the worker deployed with /api routes?`,
    );
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(`Config API returned invalid JSON (${res.status})`);
  }

  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error ?? `Config API ${res.status}`);
  }

  return data;
}

export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  const res = await fetch('/api/config', { cache: 'no-store' });
  return parseJson<RemoteConfig>(res);
}

export async function saveFactoryMappingRemote(
  mapping: FactoryMapping,
): Promise<void> {
  const res = await fetch('/api/config/factory-mapping', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapping),
  });
  await parseJson(res);
}

export async function saveArchitectureConfigRemote(
  config: ArchitectureConfig,
): Promise<void> {
  const res = await fetch('/api/config/architecture', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  await parseJson(res);
}
