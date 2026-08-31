'use client';

import React from 'react';
import { useLiveClock, usePassengerCount } from '@/hooks/useUtils';
import { usePlayer } from '@/context/PlayerContext';

const Header = React.memo(function Header() {
  const { hours, minutes, seconds } = useLiveClock();
  const passengers = usePassengerCount();
  const { setShowWhoDriving } = usePlayer();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7">
      {/* Logo */}
      <div className="pointer-events-auto animate-rise flex items-center gap-2.5 sm:gap-3">
        <svg viewBox="0 0 24 24" width="34" height="34" className="shrink-0 drop-shadow-[0_2px_10px_rgba(14,6,2,0.6)]" aria-hidden="true">
          <path d="m12.06 24c6.72-.17 12.11-5.64 11.94-12.06a12 12 0 1 0 -11.94 12.06" fill="#ffc72c"/>
          <path d="m18.78 10.67-.66-5.17c-.16-.93-.75-1.3-1.63-1.68a14.25 14.25 0 0 0 -4.49-.82 14.32 14.32 0 0 0 -4.5.82c-.86.37-1.45.75-1.63 1.68l-.66 5.17v7.15h1.17v1.25a1 1 0 0 0 1.91 0v-1.25h7.45v1.25a.91.91 0 0 0 .48.8 1 1 0 0 0 1 0 .88.88 0 0 0 .47-.8v-1.25h1.13zm-9.57-6.36h5.61a.42.42 0 0 1 .43.41.42.42 0 0 1-.43.42h-5.61a.43.43 0 0 1-.43-.42.42.42 0 0 1 .43-.41zm-2.79 6.21.58-4.09a.54.54 0 0 1 .51-.43h9.06a.56.56 0 0 1 .54.44l.54 4.09a.33.33 0 0 1 0 .14.49.49 0 0 1-.16.37.54.54 0 0 1-.38.15h-10.17a.56.56 0 0 1-.38-.19.57.57 0 0 1-.14-.38.33.33 0 0 1 0-.1zm.92 5.09a1 1 0 1 1 1-1 1 1 0 0 1-.3.7 1 1 0 0 1-.7.3zm9.36 0a1 1 0 1 1 1-1 1 1 0 0 1-.3.7 1.06 1.06 0 0 1-.72.29z" fill="#1c1e23"/>
        </svg>
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold leading-none text-white sm:text-lg" style={{ textShadow: '0 1px 10px rgba(14,6,2,0.9)' }}>
            बस वाला
          </span>
          <span className="mt-1 whitespace-nowrap text-[8px] uppercase text-white/55 sm:text-[9px] tracking-[0.3em]" style={{ textShadow: '0 1px 10px rgba(14,6,2,0.9)' }}>
            NH-39 · Jhansi – Sonbhadra, UP
          </span>
        </span>
        <span className="sr-only">Bus Wala</span>
      </div>

      {/* Right side: Passengers + Who's driving */}
      <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-2 animate-rise">
        
        {/* Passengers */}
        <p className="flex items-center gap-1.5 whitespace-nowrap leading-none mt-0.5" style={{ textShadow: '0 1px 10px rgba(10,4,1,0.9)' }}>
          <span className="relative flex size-1.5 shrink-0">
            <span className="animate-beacon absolute inset-0 rounded-full bg-amber-500" />
            <span className="relative size-1.5 rounded-full bg-amber-500" />
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-[13px] font-semibold tabular-nums text-white/95 sm:text-[14px]">{passengers}</span>
            <span className="text-[9px] uppercase font-bold text-white/40 sm:text-[10px] tracking-[0.25em]">aboard</span>
          </span>
        </p>

        {/* Who's driving */}
        <button
          onClick={() => setShowWhoDriving(true)}
          className="mt-0.5 flex items-center gap-1.5 rounded-full border border-red-500/20 bg-black/60 px-2 py-0.5 text-[8px] font-semibold text-white/80 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)] backdrop-blur-md transition-all hover:border-red-500/40 hover:text-white sm:px-2.5 sm:py-1 sm:text-[9px] hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.3)] active:scale-95"
        >
          <span className="text-[8px] leading-none drop-shadow-md">🐱</span>
          <span className="tracking-wide">Who&apos;s driving?</span>
        </button>
      </div>
    </header>
  );
});
export default Header;
