import { io, type Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/supabase/auth";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  cleanUp: () => void;
  error: Error | null;
}

interface UseSocketProps {
  autoConnect?: boolean;
}

export const useSocket = ({ autoConnect }: UseSocketProps): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(async () => {
    try {
      if (socketRef.current?.connected) {
        return;
      }

      const token = await getAccessToken();
      const socket = io(process.env.NEXT_PUBLIC_FACE_AUTH_SOCKET_URL || "", {
        transports: ["websocket"],
        autoConnect: false,
        secure: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: token ? { authorization: `Bearer ${token}` } : undefined,
      });

      // Setup event handlers
      socket.on("connect", () => {
        setIsConnected(true);
        setError(null);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        setError(err);
        setIsConnected(false);
      });

      socket.on("error", (err) => {
        setError(err);
        setIsConnected(false);
      });

      // Store socket in ref
      socketRef.current = socket;

      // Connect
      socket.connect();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect"));
      setIsConnected(false);
    }
  }, []);

  const cleanUp = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
      setError(null);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnect || socketRef.current) {
      return;
    }

    connect();
    return () => {
      cleanUp();
    };
  }, [connect, cleanUp, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    cleanUp,
    error,
  };
};
