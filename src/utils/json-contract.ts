"use client";

import { sanitizeAiText } from '@/utils/ai-sanitize';

type Target = 'object' | 'array';

export function parseCompactJson(input: string, target: Target): any | null {
  if (!input) return null;

  // First strip markdown code blocks if present
  let cleaned = input.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();

  // Then sanitize
  const sanitized = sanitizeAiText(cleaned);

  // Try to find JSON using multiple strategies
  let jsonStr: string | null = null;

  if (target === 'array') {
    // For arrays, find the outermost array brackets
    const firstBracket = sanitized.indexOf('[');
    const lastBracket = sanitized.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = sanitized.substring(firstBracket, lastBracket + 1);
    }
  } else {
    // For objects, find the outermost object braces
    const firstBrace = sanitized.indexOf('{');
    const lastBrace = sanitized.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = sanitized.substring(firstBrace, lastBrace + 1);
    }
  }

  if (!jsonStr) return null;

  // Try parsing with minimal whitespace normalization
  try {
    const parsed = JSON.parse(jsonStr);
    if (target === 'array' && !Array.isArray(parsed)) return null;
    if (target === 'object' && typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    // If first attempt fails, try with whitespace compacting
    try {
      const compact = jsonStr.replace(/\s+/g, ' ').trim();
      const parsed = JSON.parse(compact);
      if (target === 'array' && !Array.isArray(parsed)) return null;
      if (target === 'object' && typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      console.error('Failed to parse JSON:', jsonStr.substring(0, 200));
      return null;
    }
  }
}