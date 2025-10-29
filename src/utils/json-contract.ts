"use client";

import { sanitizeAiText } from '@/utils/ai-sanitize';

type Target = 'object' | 'array';

export function parseCompactJson(input: string, target: Target): any | null {
  if (!input) return null;
  const sanitized = sanitizeAiText(input);
  // Find the nearest JSON block
  const match = target === 'array'
    ? sanitized.match(/\[[\s\S]*\]/)
    : sanitized.match(/\{[\s\S]*\}/);

  if (!match) return null;

  const compact = match[0].replace(/\s+/g, ' ').trim();
  try {
    const parsed = JSON.parse(compact);
    if (target === 'array' && !Array.isArray(parsed)) return null;
    if (target === 'object' && typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}