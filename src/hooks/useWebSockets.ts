'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface SocketMessage {
  type: 'SPOT_LOCKED' | 'SPOT_UNLOCKED' | 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'CUSTOMER_UPDATED' | 'TRANSACTION_UPDATED' | 'CLASS_UPDATED' | 'CLASS_DELETED';
  payload: any;
  senderId: string;
}

export function useWebSockets(onMessageReceived?: (msg: SocketMessage) => void) {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const channelRef = useRef<BroadcastChannel | null>(null);
  // BUG 6 FIX: Store the callback in a ref so the effect never re-fires when
  // the parent passes a new function reference. Without this, every state
  // change in BookingContext recreated the BroadcastChannel.
  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Retrieve or establish a session ID for this terminal instance
    let sid = sessionStorage.getItem('evolve_session_id');
    if (!sid) {
      sid = `session-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('evolve_session_id', sid);
    }
    setSessionId(sid);

    // Initialize cross-tab BroadcastChannel as our high-fidelity local websocket fallback
    const channel = new BroadcastChannel('evolve_terminal_sync');
    channelRef.current = channel;
    setConnected(true);

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data as SocketMessage;
      if (msg && msg.senderId !== sid) {
        onMessageRef.current?.(msg);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      setConnected(false);
    };
  }, []); // empty deps — stable channel for the lifetime of the component

  const sendMessage = useCallback((type: SocketMessage['type'], payload: any) => {
    if (!channelRef.current || !sessionId) return;

    const message: SocketMessage = {
      type,
      payload,
      senderId: sessionId,
    };

    // Broadcast to other tabs/terminals locally
    channelRef.current.postMessage(message);
  }, [sessionId]);

  return {
    connected,
    sessionId,
    sendMessage,
  };
}
