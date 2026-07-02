import { useStore } from '../store/useStore';

export function ModeToggle() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);

  const options: Array<typeof mode> = ['strategic', 'technical'];

  return (
    <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      {options.map((opt) => {
        const active = mode === opt;
        return (
          <button
            key={opt}
            onClick={() => setMode(opt)}
            className="rounded-full px-3 py-1 font-medium capitalize transition"
            style={{
              background: active ? 'rgba(46,197,197,0.18)' : 'transparent',
              color: active ? '#2EC5C5' : '#9DB4CC',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
