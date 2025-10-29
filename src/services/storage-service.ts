import { supabase } from '@/integrations/supabase/client';

export const CONVERSATIONS_BUCKET = 'conversations';

const sanitizeFilename = (name: string) => name.replace(/[^\w.\-]+/g, '_');

export async function uploadConversationHistory(userId: string, subId: string, file: File): Promise<string> {
  const safeName = sanitizeFilename(file.name || 'conversation.json');
  const path = `${userId}/${subId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from(CONVERSATIONS_BUCKET).upload(path, file, {
    contentType: file.type || 'application/json',
    upsert: false,
  });
  if (error) {
    throw new Error(error.message || 'Failed to upload conversation history. Ensure a private bucket named "conversations" exists.');
  }
  return path;
}

export async function getConversationHistorySignedUrl(path: string, expiresIn: number = 60): Promise<string> {
  const { data, error } = await supabase.storage.from(CONVERSATIONS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Failed to create signed URL for conversation history.');
  }
  return data.signedUrl;
}