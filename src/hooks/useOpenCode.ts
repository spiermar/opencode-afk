import { useState, useCallback, useRef } from 'react';
import { createOpencodeClient } from '@opencode-ai/sdk/client';

export type OpenCodeClient = ReturnType<typeof createOpencodeClient>;

export interface Session {
  id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  projectID?: string;
}

export interface Project {
  id: string;
  name?: string;
  path?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  createdAt?: string;
}

export interface MessagePart {
  type: string;
  // For text parts
  text?: string;
  // For tool parts
  tool?: string;
  toolName?: string;
  callID?: string;
  state?: {
    status?: string;
    input?: any;
    output?: string;
  } | string;
  // For step parts
  reason?: string;
  cost?: number;
  tokens?: {
    input: number;
    output: number;
    reasoning: number;
  };
}

export interface MessageWithParts {
  info: Message;
  parts: MessagePart[];
}

export function useOpenCode() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState('http://10.0.10.59:9034');
  
  const clientRef = useRef<OpenCodeClient | null>(null);

  const connect = useCallback(async (url?: string) => {
    const targetUrl = url || serverUrl;
    setConnecting(true);
    setError(null);
    
    try {
      const client = createOpencodeClient({
        baseUrl: targetUrl,
      });
      
      // Test connection
      await client.session.list();
      
      clientRef.current = client;
      setServerUrl(targetUrl);
      setConnected(true);
      setConnecting(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setConnected(false);
      setConnecting(false);
      return false;
    }
  }, [serverUrl]);

  const disconnect = useCallback(() => {
    clientRef.current = null;
    setConnected(false);
  }, []);

  const getSessions = useCallback(async (): Promise<Session[]> => {
    if (!clientRef.current) return [];
    try {
      const result = await clientRef.current.session.list();
      return (result.data ?? []) as Session[];
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, []);

  const getProjects = useCallback(async (): Promise<Project[]> => {
    if (!clientRef.current) return [];
    try {
      const result = await clientRef.current.project.list();
      return (result.data ?? []) as Project[];
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, []);

  const getSessionMessages = useCallback(async (sessionId: string): Promise<MessageWithParts[]> => {
    if (!clientRef.current) return [];
    try {
      const result = await clientRef.current.session.messages({
        path: { id: sessionId },
      });
      return (result.data ?? []) as MessageWithParts[];
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    if (!clientRef.current) return null;
    try {
      const result = await clientRef.current.session.get({
        path: { id: sessionId },
      });
      return (result.data ?? null) as Session | null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  return {
    // State
    connected,
    connecting,
    error,
    serverUrl,
    
    // Actions
    connect,
    disconnect,
    setServerUrl,
    
    // Data fetching
    getSessions,
    getProjects,
    getSession,
    getSessionMessages,
    
    // Client access
    client: clientRef.current,
  };
}
