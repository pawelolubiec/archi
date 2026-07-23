import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';

type PlaybackState = 'off' | 'loading' | 'playing' | 'paused' | 'unavailable';

const slideAudioPath = (index: number) =>
  `/voice/slide${String(index + 1).padStart(2, '0')}.mp3`;

function SpeakerIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z" />
      {active ? (
        <>
          <path d="M14.5 9.2a4 4 0 0 1 0 5.6" />
          <path d="M17.4 6.5a7.8 7.8 0 0 1 0 11" />
        </>
      ) : (
        <path d="m15.5 10 4 4m0-4-4 4" />
      )}
    </svg>
  );
}

export function NarrationControl() {
  const index = useStore((s) => s.index);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastStartedIndex = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>('off');

  const audioPath = slideAudioPath(index);

  const playCurrentSlide = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlayback('loading');
    audio.currentTime = 0;

    try {
      await audio.play();
      setPlayback('playing');
    } catch {
      setPlayback(audio.error ? 'unavailable' : 'paused');
    }
  }, []);

  useEffect(() => {
    if (!enabled || lastStartedIndex.current === index) return;
    lastStartedIndex.current = index;
    void playCurrentSlide();
  }, [enabled, index, playCurrentSlide]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  const toggleNarration = () => {
    const audio = audioRef.current;

    if (enabled) {
      audio?.pause();
      lastStartedIndex.current = null;
      setEnabled(false);
      setPlayback('off');
      return;
    }

    setEnabled(true);
    lastStartedIndex.current = index;
    void playCurrentSlide();
  };

  const label =
    playback === 'unavailable'
      ? 'Narration unavailable'
      : enabled
        ? 'Narration on'
        : 'Enable narration';

  return (
    <>
      <audio
        ref={audioRef}
        src={audioPath}
        preload="metadata"
        onLoadStart={() => enabled && setPlayback('loading')}
        onPlaying={() => setPlayback('playing')}
        onWaiting={() => enabled && setPlayback('loading')}
        onEnded={() => setPlayback('paused')}
        onError={() => enabled && setPlayback('unavailable')}
      />
      <button
        type="button"
        onClick={toggleNarration}
        aria-pressed={enabled}
        aria-label={
          enabled ? 'Disable slide narration' : 'Enable slide narration'
        }
        title={
          playback === 'unavailable'
            ? `Add ${audioPath} to enable narration for this slide`
            : undefined
        }
        className="group flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-2 text-slide-caption font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        style={{
          borderColor: enabled
            ? playback === 'unavailable'
              ? 'rgba(214,191,145,0.5)'
              : 'rgba(46,197,197,0.55)'
            : 'rgba(255,255,255,0.12)',
          background: enabled
            ? playback === 'unavailable'
              ? 'rgba(214,191,145,0.1)'
              : 'rgba(46,197,197,0.12)'
            : 'rgba(255,255,255,0.05)',
          color: enabled
            ? playback === 'unavailable'
              ? '#D6BF91'
              : '#2EC5C5'
            : '#F2F7FC',
        }}
      >
        <SpeakerIcon active={enabled && playback !== 'unavailable'} />
        <span>{label}</span>
        {playback === 'loading' && (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
          />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {playback === 'unavailable'
          ? `Narration audio is unavailable for slide ${index + 1}.`
          : playback === 'playing'
            ? `Narration playing for slide ${index + 1}.`
            : ''}
      </span>
    </>
  );
}
