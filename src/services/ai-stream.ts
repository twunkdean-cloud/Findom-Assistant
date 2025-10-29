"use client";

import { API_BASE_URL } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';

export interface StreamOptions {
  prompt: string;
  systemInstruction?: string;
  onChunk?: (delta: string) => void;
}

export async function streamGemini({ prompt, systemInstruction, onChunk }: StreamOptions): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('You must be signed in to use AI features.');

  const resp = await fetch(`${API_BASE_URL}/gemini-chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to start AI stream.');
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.delta) {
          full += json.delta;
          onChunk?.(json.delta);
        } else if (json.done) {
          return full;
        }
      } catch {
        // ignore malformed lines
      }
    }
  }

  return full;
}