import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type FeedKind = 'order' | 'truck' | 'ocean';

interface FeedEntry {
  key: number;
  kind: FeedKind;
  text: string;
}

/** Scripted pool cycled as a "live" ticker — orders in, shipments out. */
const FEED_POOL: Array<{ kind: FeedKind; text: string }> = [
  { kind: 'order', text: 'DE · 12.4 t sliced salmon → plan confirmed same day' },
  { kind: 'truck', text: '→ Hamburg · truck · ETA 14 h' },
  { kind: 'order', text: 'FR · 6.8 t MAP portions → plan confirmed same day' },
  { kind: 'ocean', text: '→ Tokyo · ocean freight · ETA 26 d' },
  { kind: 'order', text: 'US · 18.2 t frozen fillets → plan confirmed same day' },
  { kind: 'truck', text: '→ Milan · truck · ETA 22 h' },
  { kind: 'order', text: 'JP · 4.6 t sashimi grade → plan confirmed same day' },
  { kind: 'ocean', text: '→ Los Angeles · ocean freight · ETA 21 d' },
  { kind: 'order', text: 'IT · 9.1 t smoked salmon → plan confirmed same day' },
  { kind: 'truck', text: '→ Lille · truck · ETA 16 h' },
  { kind: 'order', text: 'AU · 7.5 t frozen portions → plan confirmed same day' },
  { kind: 'ocean', text: '→ Sydney · ocean freight · ETA 32 d' },
];

const KIND_COLOR: Record<FeedKind, string> = {
  order: '#34D399',
  truck: '#D6BF91',
  ocean: '#2EC5C5',
};

const VISIBLE = 2;
const TICK_MS = 2200;

export function LiveOrderFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const cursor = useRef(0);

  useEffect(() => {
    const push = () => {
      const item = FEED_POOL[cursor.current % FEED_POOL.length];
      const key = cursor.current;
      cursor.current += 1;
      setEntries((prev) => [...prev, { key, ...item }].slice(-VISIBLE));
    };
    push();
    const t = setInterval(push, TICK_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none w-[23rem] rounded-xl border border-white/10 bg-navy-900/70 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
          Live · orders &amp; shipments
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.div
              key={e.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-baseline gap-2 overflow-hidden text-xs leading-snug"
            >
              <span
                className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: KIND_COLOR[e.kind] }}
              />
              <span className="text-paper/85">{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
