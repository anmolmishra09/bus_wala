'use client';

import { usePlayer } from '@/context/PlayerContext';
import WhosDriving from './WhosDriving';

export default function ClientModals() {
  const { showWhoDriving, setShowWhoDriving } = usePlayer();

  return (
    <>
      {showWhoDriving && <WhosDriving onClose={() => setShowWhoDriving(false)} />}
    </>
  );
}
