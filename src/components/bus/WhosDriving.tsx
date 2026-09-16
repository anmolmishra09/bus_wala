'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePlayer } from '@/context/PlayerContext';

interface WhosDrivingProps {
  onClose: () => void;
}

export default function WhosDriving({ onClose }: WhosDrivingProps) {
  const { currentTrack } = usePlayer();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-8"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Who's driving"
    >
      <div className="mt-20 w-80 overflow-hidden rounded-2xl border border-white/12 bg-black/70 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <p className="text-sm font-semibold text-white">Who&apos;s driving?</p>
          <button
            onClick={onClose}
            className="grid size-6 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Driver card */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Driver avatar */}
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/30">
              <Image
                src="https://raw.githubusercontent.com/anmolmishra09/detaling/refs/heads/main/driver.png"
                alt="Driver"
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Anmol</p>
              <p className="text-xs text-white/50 mt-0.5">NH-39 Night Express</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="relative flex size-1.5">
                  <span className="animate-beacon absolute inset-0 rounded-full bg-amber-400" />
                  <span className="relative size-1.5 rounded-full bg-amber-400" />
                </span>
                <span className="text-[10px] text-amber-400/80">On duty</span>
              </div>
            </div>
          </div>

          {/* Now playing */}
          {currentTrack && (
            <div className="mt-3 rounded-xl bg-white/6 p-3">
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Now playing</p>
              <p className="mt-1 text-sm font-semibold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-white/50 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          )}

          {/* Flavor text */}
          <p className="mt-3 text-xs text-white/40 leading-relaxed">
            &ldquo;आधी रात का NH-39, सुकून भरी हवा और सफर में बजते पुराने गाने — इससे बेहतर और क्या चाहिए।&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
