'use client';

import { useEffect, useCallback } from 'react';

// Define the payload contract for terminal events
interface SyncEvent {
  type: 'REFORMER_BOOKED' | 'REFORMER_RELEASED' | 'WAITLIST_UPDATED';
  payload: {
    classId: string;
    reformerId: string;
    timestamp: number;
  };
}

export function useTerminalSync(onSyncMessage: (event: SyncEvent) => void) {
  useEffect(() => {
    // Instantiate channel scoped strictly to the studio POS system
    const channel = new BroadcastChannel('evolve_cams_pos_sync');

    const handleMessage = (event: MessageEvent<SyncEvent>) => {
      onSyncMessage(event.data);
    };

    channel.addEventListener('message', handleMessage);

    // Clean up channel listener on component unmount to prevent memory leaks
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [onSyncMessage]);

  // Method to safely dispatch local checkout actions to other tabs
  const broadcastChange = useCallback((type: SyncEvent['type'], classId: string, reformerId: string) => {
    const channel = new BroadcastChannel('evolve_cams_pos_sync');
    const message: SyncEvent = {
      type,
      payload: {
        classId,
        reformerId,
        timestamp: Date.now(),
      },
    };
    channel.postMessage(message);
    channel.close(); // Close short-lived broadcast handle immediately
  }, []);

  return { broadcastChange };
}
