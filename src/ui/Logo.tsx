import { BRAND } from '../data/brand';

export function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="16" stroke={BRAND.gold} strokeWidth="1" opacity="0.6" />
        <path
          d="M3 20 C 8 14, 12 26, 17 20 S 26 14, 31 20"
          stroke={BRAND.sea}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M3 24 C 8 18, 12 30, 17 24 S 26 18, 31 24"
          stroke={BRAND.gold}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <div className="leading-none">
        <div className="font-display text-lg tracking-wide text-paper">MILAREX</div>
        <div className="text-[9px] uppercase tracking-[0.34em] text-mist">
          Digital Architecture
        </div>
      </div>
    </div>
  );
}
