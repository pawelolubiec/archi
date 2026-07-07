import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  delay?: number;
}

/** Count-up number animation using framer-motion. */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  delay = 0,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : String(Math.round(v)),
  );
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, delay, motionValue]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      if (spanRef.current) spanRef.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={spanRef} className={className}>0</span>;
}

interface AnimatedBarProps {
  widthPct: number;
  color: string;
  delay?: number;
  className?: string;
}

export function AnimatedBar({ widthPct, color, delay = 0, className }: AnimatedBarProps) {
  return (
    <motion.div
      className={className ?? 'h-full rounded-full'}
      initial={{ width: '0%' }}
      animate={{ width: `${widthPct}%` }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: color }}
    />
  );
}

interface AnimatedDeltaProps {
  delta: number;
  improved: boolean;
  decimals?: number;
}

export function AnimatedDelta({ delta, improved, decimals = 0 }: AnimatedDeltaProps) {
  const formatted =
    (delta > 0 ? '+' : '') +
    (decimals > 0 ? delta.toFixed(decimals) : String(delta));

  return (
    <motion.span
      key={formatted}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="ml-auto text-xs font-medium"
      style={{ color: improved ? '#34D399' : '#ff8a8a' }}
    >
      {formatted}
    </motion.span>
  );
}
