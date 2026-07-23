import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';

type PlaybackState = 'off' | 'loading' | 'playing' | 'paused' | 'unavailable';

const slideAudioPath = (index: number) =>
  `/voice/slide${String(index + 1).padStart(2, '0')}.mp3`;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const wholeSeconds = Math.round(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioPath = slideAudioPath(index);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const remaining = Math.max(duration - currentTime, 0);

  const playCurrentSlide = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlayback('loading');
    setCurrentTime(0);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
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
      setCurrentTime(0);
      setDuration(0);
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
        onLoadStart={() => {
          setCurrentTime(0);
          setDuration(0);
          if (enabled) setPlayback('loading');
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
        }}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration)) setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onPlaying={() => setPlayback('playing')}
        onWaiting={() => enabled && setPlayback('loading')}
        onEnded={(event) => {
          setCurrentTime(event.currentTarget.duration);
          setPlayback('paused');
        }}
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
        className={`group min-h-9 border px-3.5 py-2 text-slide-caption font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
          enabled
            ? 'w-56 rounded-xl'
            : 'rounded-full'
        }`}
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
        <span className="flex items-center gap-2">
          <SpeakerIcon active={enabled && playback !== 'unavailable'} />
          <span>{label}</span>
          {playback === 'loading' && (
            <span
              aria-hidden="true"
              className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-current"
            />
          )}
        </span>
        {enabled && playback !== 'unavailable' && (
          <span className="mt-2 block">
            <span
              role="progressbar"
              aria-label={`Narration progress for slide ${index + 1}`}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              className="block h-1 overflow-hidden rounded-full bg-white/10"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-sea transition-[width] duration-200 ease-out motion-reduce:transition-none"
                style={{ width: `${progress * 100}%` }}
              />
            </span>
            <span className="mt-1 flex justify-between font-mono text-[10px] font-normal tabular-nums text-mist">
              <span>{formatTime(currentTime)}</span>
              <span>
                {duration > 0 ? `${formatTime(remaining)} left` : 'Loading'}
              </span>
            </span>
          </span>
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
