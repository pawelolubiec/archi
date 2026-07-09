import { useStore } from '../store/useStore';

export function ArchitectureConfigButton() {
  const chapter = useStore((s) => s.current());
  const openArchitectureConfig = useStore((s) => s.openArchitectureConfig);

  if (chapter.scene !== 'architecture') return null;

  return (
    <button
      type="button"
      onClick={openArchitectureConfig}
      title="Configure architecture layers"
      aria-label="Configure architecture layers"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist transition hover:border-sea/40 hover:bg-sea/10 hover:text-sea"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Configure
    </button>
  );
}
