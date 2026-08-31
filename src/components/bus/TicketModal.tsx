'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { useShare } from '@/hooks/useUtils';
import { SIDES } from '@/data/playlist';

interface TicketModalProps {
  onClose: () => void;
}

export default function TicketModal({ onClose }: TicketModalProps) {
  const { currentTrack, currentPlaylist, currentIndex } = usePlayer();
  const { share, copied } = useShare();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click or Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!currentTrack) return null;

  // Generate a seat number from the track index
  const seatNum = `${currentPlaylist.seatPrefix}${String(currentIndex + 1).padStart(1, '')}`;
  const seatSide = SIDES[(currentIndex) % SIDES.length];
  const departs = currentPlaylist.departsAt;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Your bus ticket"
    >
      {/* Ticket card */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">

        {/* Top part: cream bg */}
        <div className="bg-[#EDE8DF] px-7 pt-7 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="m12.06 24c6.72-.17 12.11-5.64 11.94-12.06a12 12 0 1 0-11.94 12.06" fill="#ffc72c" />
                <path d="m18.78 10.67-.66-5.17c-.16-.93-.75-1.3-1.63-1.68a14.25 14.25 0 0 0-4.49-.82 14.32 14.32 0 0 0-4.5.82c-.86.37-1.45.75-1.63 1.68l-.66 5.17v7.15h1.17v1.25a1 1 0 0 0 1.91 0v-1.25h7.45v1.25a.91.91 0 0 0 .48.8 1 1 0 0 0 1 0 .88.88 0 0 0 .47-.8v-1.25h1.13zm-9.57-6.36h5.61a.42.42 0 0 1 .43.41.42.42 0 0 1-.43.42h-5.61a.43.43 0 0 1-.43-.42.42.42 0 0 1 .43-.41zm-2.79 6.21.58-4.09a.54.54 0 0 1 .51-.43h9.06a.56.56 0 0 1 .54.44l.54 4.09a.33.33 0 0 1 0 .14.49.49 0 0 1-.16.37.54.54 0 0 1-.38.15h-10.17a.56.56 0 0 1-.38-.19.57.57 0 0 1-.14-.38.33.33 0 0 1 0-.1zm.92 5.09a1 1 0 1 1 1-1 1 1 0 0 1-.3.7 1 1 0 0 1-.7.3zm9.36 0a1 1 0 1 1 1-1 1 1 0 0 1-.3.7 1.06 1.06 0 0 1-.72.29z" fill="#1c1e23" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/60">Bus Wala</p>
                <p className="text-[9px] text-black/40 tracking-wider">बस वाला</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/50">Night Service</p>
            </div>
          </div>

          {/* Route */}
          <div className="mt-5">
            <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Route</p>
            <p className="mt-1 text-lg font-bold text-black leading-tight">{currentPlaylist.route}</p>
          </div>

          {/* Boarding */}
          <div className="mt-3">
            <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Boarding</p>
            <p className="mt-1 text-base font-bold text-black">{currentPlaylist.boarding}</p>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative flex h-7 items-center bg-[#EDE8DF]">
          <div className="absolute -left-3.5 h-7 w-7 rounded-full bg-black/60" />
          <div className="absolute -right-3.5 h-7 w-7 rounded-full bg-black/60" />
          <div className="mx-6 w-full border-t-2 border-dashed border-black/15" />
        </div>

        {/* Bottom stub */}
        <div className="bg-[#EDE8DF] px-7 pb-7 pt-4">
          {/* Now playing */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Now Playing</p>
            <h2 className="mt-1 text-2xl font-bold text-black leading-tight">{currentTrack.title}</h2>
            <p className="mt-1 text-sm text-black/60">{currentTrack.artist}</p>
          </div>

          {/* Seat info */}
          <div className="mt-5 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Seat</p>
              <p className="mt-1 text-lg font-bold text-black">{seatNum}{String.fromCharCode(65 + (currentIndex % 4))}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Side</p>
              <p className="mt-1 text-lg font-bold text-black">{seatSide}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-black/50 font-semibold">Departs</p>
              <p className="mt-1 text-lg font-bold text-black">{departs}</p>
            </div>
          </div>

          {/* Barcode */}
          <div className="mt-5">
            <Barcode />
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] font-bold text-black/70">buswala.com</p>
            <p className="text-[9px] uppercase tracking-widest text-black/40 font-semibold">Passenger Copy</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex w-full max-w-sm flex-col gap-2">
        <button
          onClick={() => share(`I'm listening to "${currentTrack?.title}" on the night bus. There's room for you too.`)}
          className="flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
        >
          {copied ? '✓ Copied to clipboard' : 'Share your ticket'}
        </button>
        <button
          onClick={onClose}
          className="flex h-12 w-full items-center justify-center rounded-full bg-white/8 text-sm font-medium text-white/70 transition hover:bg-white/12 active:scale-95"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function Barcode() {
  // Generate a fake barcode from vertical bars
  const bars = Array.from({ length: 40 }, (_, i) => {
    const widths = [1, 1, 2, 1, 3, 1, 2];
    return widths[i % widths.length];
  });

  return (
    <div className="flex items-end gap-px h-10" aria-hidden="true">
      {bars.map((w, i) => (
        <div
          key={i}
          className="bg-black/80"
          style={{ width: w * 2, height: `${40 + Math.sin(i * 0.8) * 15}%` }}
        />
      ))}
    </div>
  );
}
