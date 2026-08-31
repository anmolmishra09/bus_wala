'use client';

import { useEffect } from 'react';

export default function YouTubeAPILoader() {
  useEffect(() => {
    if (document.getElementById('yt-iframe-api')) return;
    const script = document.createElement('script');
    script.id = 'yt-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
