'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { playlists, Track } from '@/data/playlist';
import { useShare } from '@/hooks/useUtils';

interface QueuePanelProps {
  onClose: () => void;
}

export default function QueuePanel({ onClose }: QueuePanelProps) {
  const { currentPlaylist, currentIndex, selectTrack, switchPlaylist, isShuffled, toggleShuffle } = usePlayer();
  const { share, copied } = useShare();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Filter playlist tabs
  const tabs = playlists.map(pl => ({
    id: pl.id,
    label: pl.label,
    active: pl.id === currentPlaylist.id,
    playlist: pl,
  }));

  return (
    <div className="fixed inset-x-0 bottom-10 z-40 flex justify-center px-3 pb-[5.5rem] sm:px-6 sm:pb-24" style={{ paddingBottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + 5.5rem)' }}>
      <div ref={panelRef} className="w-full max-w-2xl">
        <div className="flex flex-col rounded-[28px] border border-white/12 bg-black/60 shadow-[0_24px_60px_-24px_rgba(10,4,1,0.95)] backdrop-blur-3xl backdrop-saturate-150">

          {/* Header */}
          <div className="flex flex-col gap-2 px-4 pb-2 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            {/* Playlist tabs */}
            <nav aria-label="Playlists" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchPlaylist(tab.playlist)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase font-medium tracking-[0.18em] transition-all duration-200 ${
                    tab.active
                      ? 'bg-white/12 text-amber-300'
                      : 'text-white/40 hover:bg-white/8 hover:text-white/75'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Controls row */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={toggleShuffle}
                aria-pressed={isShuffled}
                aria-label="Shuffle"
                className={`grid size-7 shrink-0 place-items-center rounded-full transition duration-200 active:scale-90 ${
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
              <p className="text-[10px] tabular-nums text-white/35">{currentPlaylist.tracks.length} tracks</p>
            </div>
          </div>

          {/* Track list */}
          <ul
            className="max-h-[min(45vh,18rem)] overflow-y-auto overscroll-contain px-2 pb-2 scrollbar-none"
            aria-label="Playlist tracks"
          >
            {currentPlaylist.tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isActive={idx === currentIndex}
                onSelect={() => selectTrack(track, currentPlaylist)}
              />
            ))}
          </ul>

          {/* Share footer */}
          <button
            onClick={() => share()}
            className="flex items-center gap-3 border-t border-white/8 px-5 py-3 transition-colors hover:bg-white/5"
          >
            <span className="grid size-8 place-items-center rounded-full bg-white/8 text-white/60">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </span>
            <span className="flex flex-col text-left leading-none">
              <span className="text-sm font-semibold text-white/80">
                {copied ? '✓ Link copied!' : 'Share the bus'}
              </span>
              <span className="text-xs text-white/35">buswala.com</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface TrackRowProps {
  track: Track;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

function TrackRow({ track, index, isActive, onSelect }: TrackRowProps) {
  const { isPlaying } = usePlayer();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 text-left group ${
          isActive ? 'bg-white/8' : 'hover:bg-white/5'
        }`}
      >
        {/* Number / playing indicator */}
        <span className={`flex w-5 shrink-0 items-center justify-center text-xs font-medium tabular-nums ${isActive ? 'text-amber-400' : 'text-white/35 group-hover:text-white/60'}`}>
          {isActive && isPlaying ? (
            <EqualiserIcon />
          ) : (
            <span>{index + 1}</span>
          )}
        </span>

        {/* Thumbnail */}
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-lg">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="size-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </span>

        {/* Title + artist */}
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
            {track.title}
          </span>
          <span className={`block truncate text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-white/35'}`}>
            {track.artist}
          </span>
        </span>
      </button>
    </li>
  );
}

function EqualiserIcon() {
  return (
    <span className="flex items-end gap-px h-3.5">
      {[1, 2, 3].map(i => (
        <span key={i} className="w-0.5 rounded-full bg-amber-400 animate-equalize" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
