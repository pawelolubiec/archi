import type { ArchitectureConfig } from '../data/architectureLayout';
import type { FactoryMapping } from '../data/factoryLayout';

export interface RemoteConfig {
  factoryMapping: FactoryMapping | null;
  architectureConfig: ArchitectureConfig | null;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Config API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  const res = await fetch('/api/config');
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
