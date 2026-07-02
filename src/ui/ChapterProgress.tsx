import { chapters } from '../data/chapters';
import { useStore } from '../store/useStore';

export function ChapterProgress() {
  const index = useStore((s) => s.index);
  const goTo = useStore((s) => s.goTo);

  return (
    <div className="flex items-center gap-2">
      {chapters.map((c, i) => {
        const active = i === index;
        const done = i < index;
        return (
          <button
            key={c.id}
            onClick={() => goTo(i)}
            title={c.title}
            className="group relative h-1.5 rounded-full transition-all"
            style={{
              width: active ? 34 : 14,
              background: active
                ? '#D6BF91'
                : done
                  ? 'rgba(46,197,197,0.6)'
                  : 'rgba(157,180,204,0.25)',
            }}
          >
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink/90 px-2 py-1 text-[10px] text-mist opacity-0 transition group-hover:opacity-100">
              {String(i + 1).padStart(2, '0')} · {c.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
