import { useEffect, useState } from 'react';

export function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen();
  }
}

export function FullscreenButton() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      title={active ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-mist transition hover:border-sea/50 hover:text-paper"
    >
      {active ? '⤡ Exit' : '⤢ Fullscreen'}
    </button>
  );
}
