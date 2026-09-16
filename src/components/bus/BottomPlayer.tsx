'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePlayer, usePlayerProgress } from '@/context/PlayerContext';
import { formatTime } from '@/hooks/useUtils';
import QueuePanel from './QueuePanel';
import TicketModal from './TicketModal';

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    togglePlay,
    next,
    prev,
    seek,
    toggleMute,
    showQueue,
    setShowQueue,
    showTicket,
    setShowTicket,
    playerRef,
  } = usePlayer();

  const { progress, currentTime, duration } = usePlayerProgress();

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const getSeekRatio = useCallback((clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Global mouse event listeners during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      setDragProgress(getSeekRatio(e.clientX));
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      const finalRatio = getSeekRatio(e.clientX);
      seek(finalRatio);
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, getSeekRatio, seek]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const ratio = getSeekRatio(e.clientX);
    setIsDragging(true);
    setDragProgress(ratio);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const ratio = getSeekRatio(e.touches[0].clientX);
    setIsDragging(true);
    setDragProgress(ratio);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragProgress(getSeekRatio(e.touches[0].clientX));
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      seek(dragProgress);
      setIsDragging(false);
    }
  };

  if (!currentTrack) return null;

  // Render drag value during active scrubbing, otherwise actual player progress
  const displayProgress = isDragging ? dragProgress : progress;
  const displayCurrentTime = isDragging ? dragProgress * duration : currentTime;

  return (
    <>
      {/* Hidden YouTube iframe */}
      <div className="fixed -top-full left-0 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        <iframe
          ref={playerRef}
          id="yt-player"
          title="YouTube Player"
          allow="autoplay; encrypted-media"
          src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?enablejsapi=1&playsinline=1`}
          width="1"
          height="1"
        />
      </div>

      {/* Queue panel */}
      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}

      {/* Ticket modal */}
      {showTicket && <TicketModal onClose={() => setShowTicket(false)} />}

      {/* Player bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center px-3 sm:px-6"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-full max-w-2xl">
          <div className="flex w-full flex-col gap-1 rounded-[28px] border border-white/12 bg-black/50 p-3 shadow-[0_24px_60px_-20px_rgba(10,4,1,0.85)] backdrop-blur-3xl backdrop-saturate-150 transition-all duration-300 hover:border-white/20 sm:flex-row sm:items-center sm:gap-5 sm:rounded-full sm:pr-5">
            {/* Track info + seek */}
            <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
              {/* Spinning album art */}
              <span className="relative block size-14 shrink-0 sm:size-16">
                <img
                  alt={currentTrack.title}
                  src={currentTrack.thumbnail}
                  className="size-full rounded-full object-cover ring-1 ring-white/25 transition-transform will-change-transform"
                  style={{
                    animation: isPlaying ? 'spin 8s linear infinite' : 'none',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/bus-thumb-fallback.svg';
                  }}
                />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/90 ring-1 ring-white/25" />
              </span>

              {/* Title + artist + progress */}
              <div className="min-w-0 flex-1">
                <div>
                  <p className="truncate text-sm font-semibold text-white leading-tight">
                    {currentTrack.title}
                  </p>
                  <p className="truncate text-xs text-white/50 mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Seek bar */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-white/40">
                    {formatTime(displayCurrentTime)}
                  </span>
                  <div
                    className="group relative flex-1 -my-2 cursor-pointer touch-none py-2 select-none"
                    ref={progressBarRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Seek"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(displayProgress * 100)}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') seek(Math.min(1, progress + 0.02));
                      if (e.key === 'ArrowLeft') seek(Math.max(0, progress - 0.02));
                    }}
                  >
                    <div className="relative w-full overflow-hidden rounded-full bg-white/15 h-0.5 group-hover:h-1 transition-all duration-200">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-[width] duration-100"
                        style={{ width: `${displayProgress * 100}%` }}
                      />
                    </div>
                    <span
                      className={`pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity duration-200 ${
                        isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ left: `${displayProgress * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-[10px] tabular-nums text-white/40">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between sm:shrink-0">
              {/* Left filler (mobile layout balance) */}
              <div className="flex items-center gap-0.5 sm:hidden">
                <ShuffleButton />
              </div>

              {/* Core controls */}
              <div className="flex items-center gap-1">
                <ControlButton onClick={prev} label="Previous track">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <rect x="5" y="6" width="2" height="12" rx="1" />
                    <path d="M18.9 7.06a.8.8 0 0 0-1.23-.68l-8 4.94a.8.8 0 0 0 0 1.36l8 4.94a.8.8 0 0 0 1.23-.68V7.06Z" />
                  </svg>
                </ControlButton>

                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-black shadow-[0_6px_20px_-6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-105 active:scale-90 sm:size-11"
                >
                  {isLoading ? (
                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  ) : isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                      <rect x="6.5" y="5" width="3.5" height="14" rx="1.2" />
                      <rect x="14" y="5" width="3.5" height="14" rx="1.2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                      <path d="M6 4.75a.75.75 0 0 0-1.2.6v13.3a.75.75 0 0 0 1.2.6l10-6.65a.75.75 0 0 0 0-1.2L6 4.75Z" />
                    </svg>
                  )}
                </button>

                <ControlButton onClick={next} label="Next track">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="M5.1 7.06a.8.8 0 0 1 1.23-.68l8 4.94a.8.8 0 0 1 0 1.36l-8 4.94a.8.8 0 0 1-1.23-.68V7.06Z" />
                    <rect x="16.8" y="6" width="2" height="12" rx="1" />
                  </svg>
                </ControlButton>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-0.5">
                <div className="hidden sm:flex">
                  <ShuffleButton />
                </div>

                {/* Volume (desktop) */}
                <div className="hidden sm:flex items-center gap-1">
                  <ControlButton onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted || volume === 0 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M11.4 4.6a.8.8 0 0 1 1.35.58v13.64a.8.8 0 0 1-1.35.58L7.2 15.5H4.6a1.1 1.1 0 0 1-1.1-1.1v-4.8a1.1 1.1 0 0 1 1.1-1.1h2.6l4.2-3.9Z" fill="currentColor" stroke="none" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M11.4 4.6a.8.8 0 0 1 1.35.58v13.64a.8.8 0 0 1-1.35.58L7.2 15.5H4.6a1.1 1.1 0 0 1-1.1-1.1v-4.8a1.1 1.1 0 0 1 1.1-1.1h2.6l4.2-3.9Z" fill="currentColor" stroke="none" />
                        <path d="M16.1 9.2a4 4 0 0 1 0 5.6" />
                        <path d="M18.7 6.4a7.8 7.8 0 0 1 0 11.2" />
                      </svg>
                    )}
                  </ControlButton>
                </div>

                {/* Ticket button */}
                <button
                  type="button"
                  onClick={() => setShowTicket(true)}
                  aria-label="Get your ticket"
                  className="flex h-9 items-center gap-1.5 rounded-full px-2.5 bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30 transition hover:bg-amber-500/25 active:scale-90"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <path d="M5 6.4h14a1 1 0 0 1 1 1v2.3a2.3 2.3 0 0 0 0 4.6v2.3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.3a2.3 2.3 0 0 0 0-4.6V7.4a1 1 0 0 1 1-1Z" />
                    <path d="M12.4 8.6v1.6M12.4 11.6v1.6M12.4 14.6v1.6" opacity="0.65" />
                  </svg>
                  <span className="hidden text-xs font-semibold sm:inline">Ticket</span>
                </button>

                {/* Queue toggle */}
                <ControlButton onClick={() => setShowQueue(!showQueue)} label="Toggle queue" active={showQueue}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="size-4">
                    <path d="M4 7h11M4 12h11M4 17h7" />
                    <path d="M18.5 16.5V9l2.5-.8" />
                    <circle cx="17" cy="17" r="1.8" fill="currentColor" stroke="none" />
                  </svg>
                </ControlButton>
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts bar */}
          <KeyboardShortcuts />
        </div>
      </div>
    </>
  );
}

function ShuffleButton() {
  const { isShuffled, toggleShuffle } = usePlayer();
  return (
    <button
      type="button"
      onClick={toggleShuffle}
      aria-pressed={isShuffled}
      aria-label="Shuffle"
      className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-200 active:scale-90 ${
        isShuffled
          ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30'
          : 'text-white/50 hover:bg-white/10 hover:text-white'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
        <path d="M16 3.5h4.5V8" />
        <path d="M4 20 20.5 3.5" />
        <path d="M16 20.5h4.5V16" />
        <path d="m14.5 14 6 6.5" />
        <path d="m4 4 5 5" />
      </svg>
    </button>
  );
}

function ControlButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-200 active:scale-90 ${
        active ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function KeyboardShortcuts() {
  return (
    <div className="mt-3.5 hidden items-center justify-center gap-5 sm:flex" aria-hidden="true">
      {[
        ['Space', 'Play / Pause'],
        ['←', '→', 'Seek'],
        ['N', 'P', 'Track'],
        ['Q', 'Queue'],
        ['T', 'Ticket'],
        ['H', 'Horn'],
      ].map((group, i) => (
        <span key={i} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-0.5">
            {group.slice(0, -1).map((key) => (
              <kbd
                key={key}
                className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white/50"
              >
                {key}
              </kbd>
            ))}
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-white/40">
            {group[group.length - 1]}
          </span>
        </span>
      ))}
    </div>
  );
}