"use client";

import { supabase } from '@/integrations/supabase/client';

export type MemoryEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO
};

const MAX_ENTRIES = 50;
const MAX_AGE_DAYS = 30;

const dataTypeForSub = (subName: string) => `sub_memory:${subName}`;

function applyDecay(entries: MemoryEntry[]): MemoryEntry[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const filtered = entries.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  if (filtered.length > MAX_ENTRIES) {
    return filtered.slice(filtered.length - MAX_ENTRIES);
  }
  return filtered;
}

export async function addToSubMemory(userId: string, subName: string, entry: MemoryEntry): Promise<void> {
  const dt = dataTypeForSub(subName);
  const { data } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', dt)
    .single();

  const existing: MemoryEntry[] = data?.data?.entries || [];
  const next = applyDecay([...existing, entry]);

  const { error } = await supabase
    .from('user_data')
    .upsert(
      { user_id: userId, data_type: dt, data: { entries: next } },
      { onConflict: 'user_id,data_type' }
    );
  if (error) throw error;
}

export async function getRecentSubMemory(userId: string, subName: string, limit = 10): Promise<MemoryEntry[]> {
  const dt = dataTypeForSub(subName);
  const { data } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', dt)
    .single();

  const entries: MemoryEntry[] = applyDecay(data?.data?.entries || []);
  return entries.slice(Math.max(0, entries.length - limit));
}