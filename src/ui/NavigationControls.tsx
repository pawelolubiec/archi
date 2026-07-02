import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';

export function NavigationControls() {
  const index = useStore((s) => s.index);
  const next = useStore((s) => s.next);
  const prev = useStore((s) => s.prev);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        disabled={index === 0}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-paper transition hover:border-sea/50 hover:bg-sea/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ← Back
      </button>
      <button
        onClick={next}
        disabled={index === TOTAL_CHAPTERS - 1}
        className="rounded-full border px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          borderColor: '#D6BF9166',
          background: 'rgba(214,191,145,0.10)',
          color: '#D6BF91',
        }}
      >
        Next →
      </button>
    </div>
  );
}
