import type { ConfigSaveStatus } from '../store/useStore';

export function SaveStatus({
  status,
  error,
}: {
  status: ConfigSaveStatus;
  error: string | null;
}) {
  if (status === 'idle') return null;

  const label =
    status === 'saving'
      ? 'Saving to database…'
      : status === 'saved'
        ? 'Saved to database'
        : error ?? 'Failed to save';

  const color =
    status === 'saving'
      ? 'text-sea'
      : status === 'saved'
        ? 'text-green-400'
        : 'text-red-400';

  return (
    <p className={`mt-2 text-xs font-medium ${color}`} role="status">
      {label}
    </p>
  );
}
