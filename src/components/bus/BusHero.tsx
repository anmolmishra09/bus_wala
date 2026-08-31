'use client';

import React from 'react';
import { usePlayer } from '@/context/PlayerContext';

const BusHero = React.memo(function BusHero() {
  const { currentPlaylist } = usePlayer();

  return (
    <div className="relative flex flex-col items-center text-center px-6 w-full -translate-y-8 md:-translate-y-22">
      {/* Soft radial dark halo behind text for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[260%] w-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(10,4,1,0.62) 0%, rgba(10,4,1,0.3) 50%, rgba(10,4,1,0) 100%)',
        }}
      />

      {/* Track count */}
      <p
        className="text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-white/70 animate-rise font-medium"
        style={{ animationDelay: '120ms', textShadow: '0 1px 14px rgba(10,3,0,0.9)' }}
      >
        {currentPlaylist.tracks.length} tracks · non-stop
      </p>

      {/* Main Hindi title with 3D block shadow */}
      <h1
        aria-label="बस वाला"
        className="mt-1 sm:mt-1.5 font-display font-extrabold leading-[0.86] tracking-tight text-white animate-rise"
        style={{
          fontSize: 'clamp(3.4rem, 14vw, 11rem)',
          animationDelay: '220ms',
          textShadow: `
            0 1px 0 #d9d4d0, 
            0 2px 0 #c9c4c0, 
            0 3px 0 #b8b3af, 
            0 4px 0 #a9a4a1, 
            0 5px 0 #95908e, 
            0 6px 0 #888381, 
            0 7px 0 #7e7a78, 
            0 8px 0 #736f6d, 
            0 9px 12px rgba(0,0,0,0.6), 
            0 15px 30px rgba(0,0,0,0.4)
          `,
        }}
      >
        <span aria-hidden="true">बस वाला</span>
      </h1>

      {/* Divider + subtitle */}
      <div
        className="mt-10 sm:mt-14 flex items-center gap-4 animate-rise opacity-75"
        style={{ animationDelay: '340ms' }}
      >
        <span
          className="h-[1px] w-12 sm:w-16"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.35))' }}
        />
        <p
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white font-medium"
          style={{ textShadow: '0 1px 14px rgba(10,3,0,0.9)' }}
        >
          All night on NH 96
        </p>
        <span
          className="h-[1px] w-12 sm:w-16"
          style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.35))' }}
        />
      </div>

      {/* Horn button */}
      <div
        className="mt-6 sm:mt-7 animate-rise"
        style={{ animationDelay: '460ms' }}
      >
        <HornButton />
      </div>
    </div>
  );
});
export default BusHero;

const HornButton = React.memo(function HornButton() {
  const { playHorn, isHornActive } = usePlayer();

  return (
    <button
      type="button"
      onClick={playHorn}
      className={`group shrink-0 touch-manipulation select-none rounded-full transition-transform duration-100 ${isHornActive ? 'scale-95' : 'active:scale-95'}`}
      aria-label="Horn ok please"
    >
      <span className={`flex items-center gap-3 rounded-full border border-white/10 bg-black/40 py-2 pl-2.5 pr-5 shadow-[0_12px_36px_-10px_rgba(6,2,0,0.9)] backdrop-blur-2xl transition-colors duration-200 ${isHornActive ? 'bg-white/10 border-white/30' : 'hover:border-white/25 hover:bg-black/60'}`}>
        <span className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-200 ${isHornActive ? 'bg-white text-black' : 'bg-white/10 text-white/90 group-hover:bg-white/15'}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
            aria-hidden="true"
          >
            <path d="M18 8a3 3 0 0 1 0 6" />
            <path d="M10 8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5" />
            <path d="M12 8l4.524-3.77A.9.9 0 0 1 17.976 4.922v12.156a.9.9 0 0 1-1.452.692L12 14H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h8" />
          </svg>
        </span>
        <span className="flex flex-col text-left leading-none">
          <span className="font-display text-[14px] font-bold text-white/95">हॉर्न ओके प्लीज़</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
            Horn ok pleaseeee
          </span>
        </span>
      </span>
    </button>
  );
});
