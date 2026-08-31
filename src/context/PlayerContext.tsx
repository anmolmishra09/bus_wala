'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Track, Playlist, playlists } from '@/data/playlist';

export interface PlayerProgressState {
  progress: number;
  duration: number;
  currentTime: number;
}

export interface PlayerState {
  currentPlaylist: Playlist;
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  showQueue: boolean;
  showTicket: boolean;
  showWhoDriving: boolean;
  isHornActive: boolean;
}

interface PlayerContextValue extends PlayerState {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  selectTrack: (track: Track, playlist?: Playlist) => void;
  seek: (ratio: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setShowQueue: (v: boolean) => void;
  setShowTicket: (v: boolean) => void;
  setShowWhoDriving: (v: boolean) => void;
  switchPlaylist: (playlist: Playlist) => void;
  playerRef: React.RefObject<HTMLIFrameElement | null>;
  playHorn: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const PlayerProgressContext = createContext<PlayerProgressState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider');
  return ctx;
}

export function usePlayerProgress() {
  const ctx = useContext(PlayerProgressContext);
  if (!ctx) throw new Error('usePlayerProgress must be inside PlayerProvider');
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // --- Core State ---
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(playlists[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- UI Toggles ---
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showWhoDriving, setShowWhoDriving] = useState(false);
  const [isHornActive, setIsHornActive] = useState(false);

  // --- Progress State (Fast updating) ---
  const [progressState, setProgressState] = useState<PlayerProgressState>({
    progress: 0,
    duration: 0,
    currentTime: 0,
  });

  const playerRef = useRef<HTMLIFrameElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const isReadyRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = currentPlaylist.tracks[currentIndex] ?? null;

  // ── Refs that always point to latest state (solves stale closure) ──
  const handleNextRef = useRef<() => void>(() => {});
  const handlePrevRef = useRef<() => void>(() => {});

  // ── Load persisted state ──
  useEffect(() => {
    try {
      const savedVol = localStorage.getItem('bd_volume');
      if (savedVol) setVolumeState(parseFloat(savedVol));
      const savedPlaylistId = localStorage.getItem('bd_playlist');
      const savedTrackIndex = localStorage.getItem('bd_track_index');
      if (savedPlaylistId) {
        const pl = playlists.find(p => p.id === savedPlaylistId);
        if (pl) setCurrentPlaylist(pl);
      }
      if (savedTrackIndex) setCurrentIndex(parseInt(savedTrackIndex, 10));
    } catch { /* ignore */ }
  }, []);

  // ── Persist state changes ──
  useEffect(() => {
    try { localStorage.setItem('bd_volume', String(volume)); } catch { /* */ }
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem('bd_playlist', currentPlaylist.id);
      localStorage.setItem('bd_track_index', String(currentIndex));
    } catch { /* */ }
  }, [currentPlaylist.id, currentIndex]);

  // ── Media Session API ──
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'Bus Wala',
        artwork: [
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => ytPlayerRef.current?.playVideo());
      navigator.mediaSession.setActionHandler('pause', () => ytPlayerRef.current?.pauseVideo());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevRef.current());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextRef.current());
    }
  }, [currentTrack]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // ── Progress Loop (requestAnimationFrame for buttery smoothness) ──
  const updateProgress = useCallback(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
      const curr = ytPlayerRef.current.getCurrentTime?.() ?? 0;
      const dur = ytPlayerRef.current.getDuration?.() ?? 0;
      setProgressState({
        currentTime: curr,
        duration: dur,
        progress: dur > 0 ? curr / dur : 0,
      });
      // Update media session position state for OS sync
      if ('mediaSession' in navigator && dur > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: 1,
            position: curr
          });
        } catch { /* ignore */ }
      }
    }
    requestRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const startProgressInterval = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  const stopProgressInterval = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
  }, []);

  // ── Loading safety timeout (never stuck forever) ──
  const startLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 15000); // 15s max loading
  }, []);

  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  // ── Load track ──
  const loadTrack = useCallback((track: Track, autoPlay = true) => {
    setIsLoading(true);
    startLoadingTimeout();
    setProgressState({ progress: 0, currentTime: 0, duration: 0 });
    
    if (ytPlayerRef.current && isReadyRef.current) {
      if (autoPlay) {
        ytPlayerRef.current.loadVideoById(track.youtubeId);
      } else {
        ytPlayerRef.current.cueVideoById(track.youtubeId);
        // When cueing (not auto-playing), clear loading immediately
        setTimeout(() => { setIsLoading(false); clearLoadingTimeout(); }, 500);
      }
    }
  }, [startLoadingTimeout, clearLoadingTimeout]);

  // ── Play / Pause ──
  const play = useCallback(() => {
    if (ytPlayerRef.current && isReadyRef.current) {
      ytPlayerRef.current.playVideo();
    }
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (ytPlayerRef.current && isReadyRef.current) {
      ytPlayerRef.current.pauseVideo();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  // ── Next / Prev (uses refs for latest playlist state) ──
  const handleNext = useCallback(() => {
    handleNextRef.current();
  }, []);

  const handlePrev = useCallback(() => {
    handlePrevRef.current();
  }, []);

  // Keep refs in sync with latest state
  useEffect(() => {
    handleNextRef.current = () => {
      const tracks = currentPlaylist.tracks;
      if (tracks.length === 0) return;
      const nextIndex = isShuffled
        ? Math.floor(Math.random() * tracks.length)
        : (currentIndex + 1) % tracks.length;
      setCurrentIndex(nextIndex);
      loadTrack(tracks[nextIndex]);
    };
  }, [currentIndex, currentPlaylist, isShuffled, loadTrack]);

  useEffect(() => {
    handlePrevRef.current = () => {
      const tracks = currentPlaylist.tracks;
      if (tracks.length === 0) return;
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      loadTrack(tracks[prevIndex]);
    };
  }, [currentIndex, currentPlaylist, loadTrack]);

  // ── YouTube Player API setup ──
  useEffect(() => {
    const onYTReady = () => {
      if (!playerRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ytPlayerRef.current = new (window as any).YT.Player(playerRef.current, {
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onReady: (e: any) => {
            isReadyRef.current = true;
            e.target.setVolume(Math.round(volume * 100));
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const YT = (window as any).YT.PlayerState;
            if (e.data === YT.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
              clearLoadingTimeout();
              startProgressInterval();
            } else if (e.data === YT.PAUSED) {
              setIsPlaying(false);
              stopProgressInterval();
            } else if (e.data === YT.ENDED) {
              setIsPlaying(false);
              setIsLoading(false);
              clearLoadingTimeout();
              stopProgressInterval();
              // Use ref so we always call the LATEST handleNext
              setTimeout(() => handleNextRef.current(), 200);
            } else if (e.data === YT.BUFFERING) {
              setIsLoading(true);
              startLoadingTimeout();
            } else if (e.data === -1) {
              setTimeout(() => {
                if (ytPlayerRef.current && ytPlayerRef.current.getPlayerState() === -1) {
                  setIsLoading(false);
                  clearLoadingTimeout();
                  setIsPlaying(false);
                }
              }, 1500);
            }
          },
          onError: () => {
            setIsLoading(false);
            clearLoadingTimeout();
            // Skip broken videos automatically
            setTimeout(() => handleNextRef.current(), 500);
          },
        },
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT && (window as any).YT.Player) {
      onYTReady();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).onYouTubeIframeAPIReady = onYTReady;
    }

    return () => {
      stopProgressInterval();
      clearLoadingTimeout();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select track ──
  const selectTrack = useCallback((track: Track, playlist?: Playlist) => {
    if (playlist && playlist.id !== currentPlaylist.id) {
      setCurrentPlaylist(playlist);
      const idx = playlist.tracks.findIndex(t => t.id === track.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      loadTrack(track);
    } else {
      const idx = currentPlaylist.tracks.findIndex(t => t.id === track.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      loadTrack(track);
    }
  }, [currentPlaylist, loadTrack]);

  // ── Seek ──
  const seek = useCallback((ratio: number) => {
    if (ytPlayerRef.current && isReadyRef.current && progressState.duration > 0) {
      ytPlayerRef.current.seekTo(ratio * progressState.duration, true);
      setProgressState(prev => ({
        ...prev,
        progress: ratio,
        currentTime: ratio * prev.duration
      }));
    }
  }, [progressState.duration]);

  // ── Volume ──
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (ytPlayerRef.current && isReadyRef.current) {
      ytPlayerRef.current.setVolume(Math.round(v * 100));
      if (v > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (ytPlayerRef.current && isReadyRef.current) {
        if (next) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      }
      return next;
    });
  }, []);

  // ── Shuffle ──
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  // ── Switch playlist ──
  const switchPlaylist = useCallback((playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentIndex(0);
    setIsPlaying(false);
    setProgressState({ progress: 0, currentTime: 0, duration: 0 });
    loadTrack(playlist.tracks[0], false);
  }, [loadTrack]);

  // ── Horn (Optimized with requestAnimationFrame) ──
  const hornAudiosRef = useRef<HTMLAudioElement[]>([]);
  const hornFadeAnimationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const hornFiles = [
        '/horn/horn-rajasthani.mp3',
        '/horn/horn-air.mp3',
        '/horn/horn-truck-1.mp3',
        '/horn/horn-truck-2.mp3',
        '/horn/horn-truck-3.mp3',
        '/horn/horn-truck-4.mp3',
        '/horn/horn-truck-5.mp3',
      ];
      hornAudiosRef.current = hornFiles.map((src) => {
        const audio = new Audio(src);
        audio.volume = 0.6;
        return audio;
      });
    }
  }, []);

  const playHorn = useCallback(() => {
    if (hornAudiosRef.current.length === 0 || isHornActive) return;
    setIsHornActive(true);

    const originalVol = Math.round(volume * 100);
    const duckedVol = Math.round(originalVol * 0.2);
    const fadeDuration = 300; 

    // Helper to run rAF animation
    const runFade = (startVol: number, endVol: number, duration: number, onComplete?: () => void) => {
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentVol = startVol + (endVol - startVol) * progress;
        
        if (isReadyRef.current && ytPlayerRef.current && !isMuted) {
          try { ytPlayerRef.current.setVolume(Math.round(currentVol)); } catch { /* ignore */ }
        }

        if (progress < 1) {
          hornFadeAnimationRef.current = requestAnimationFrame(animate);
        } else if (onComplete) {
          onComplete();
        }
      };
      if (hornFadeAnimationRef.current) cancelAnimationFrame(hornFadeAnimationRef.current);
      hornFadeAnimationRef.current = requestAnimationFrame(animate);
    };

    // Fade OUT background music
    runFade(originalVol, duckedVol, fadeDuration);

    const randomIndex = Math.floor(Math.random() * hornAudiosRef.current.length);
    const audio = hornAudiosRef.current[randomIndex];

    try { audio.currentTime = 0; } catch { /* ignore */ }
    audio.play().catch(e => console.warn('Horn audio play failed:', e));
    
    const hornDuration = (audio.duration && !isNaN(audio.duration)) ? audio.duration * 1000 : 1500;
    
    setTimeout(() => {
      setIsHornActive(false);
      // Fade IN background music
      runFade(duckedVol, originalVol, fadeDuration);
    }, hornDuration + 100);
  }, [isHornActive, isMuted, volume]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': seek(Math.min(1, progressState.progress + 0.02)); break;
        case 'ArrowLeft': seek(Math.max(0, progressState.progress - 0.02)); break;
        case 'KeyN': handleNext(); break;
        case 'KeyP': handlePrev(); break;
        case 'KeyM': toggleMute(); break;
        case 'KeyQ': setShowQueue(prev => !prev); break;
        case 'KeyT': setShowTicket(prev => !prev); break;
        case 'KeyH': playHorn(); break;
        case 'Escape':
          setShowQueue(false);
          setShowTicket(false);
          setShowWhoDriving(false);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, handleNext, handlePrev, toggleMute, seek, progressState.progress, playHorn]);

  const value: PlayerContextValue = {
    currentPlaylist,
    currentTrack,
    currentIndex,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    isShuffled,
    showQueue,
    showTicket,
    showWhoDriving,
    playHorn,
    isHornActive,
    play,
    pause,
    togglePlay,
    next: handleNext,
    prev: handlePrev,
    selectTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setShowQueue,
    setShowTicket,
    setShowWhoDriving,
    switchPlaylist,
    playerRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      <PlayerProgressContext.Provider value={progressState}>
        {children}
      </PlayerProgressContext.Provider>
    </PlayerContext.Provider>
  );
}
