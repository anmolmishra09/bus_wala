import { useEffect, useState } from 'react';

export function useLiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  return { hours, minutes, seconds, date: time };
}

export function usePassengerCount() {
  const [count, setCount] = useState(216);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0;
        return Math.max(180, Math.min(250, prev + delta));
      });
    }, 7000);
    return () => clearInterval(t);
  }, []);

  return count;
}

export function useShare() {
  const [copied, setCopied] = useState(false);

  const share = async (text?: string, url?: string) => {
    const shareUrl = url ?? window.location.href;
    const shareText = text ?? 'Someone you know still knows every word to these. There\'s room on the bus.';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'बस वाला', text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return { share, copied };
}

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
