import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(events = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3333');
    socketRef.current = socket;

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
