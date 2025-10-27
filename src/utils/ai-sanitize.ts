export const sanitizeAiText = (input?: string | null): string => {
  if (!input) return "";
  let s = String(input);

  // Remove currency symbol + amounts like $12, £9.99, €1,000.00
  s = s.replace(/[$€£]\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g, "[redacted]");
  // Remove amounts with currency words like 10 dollars, 5 bucks
  s = s.replace(/\b\d+(?:[.,]\d{2})?\s*(?:dollars?|bucks?)\b/gi, "[redacted]");
  // Remove common currency codes
  s = s.replace(/\b(?:USD|EUR|GBP)\b/gi, "[redacted]");
  // Neutralize phrases like total: 123.45 or total tributed: 99
  s = s.replace(/\btotal(?:\s*tributed)?\s*[:=]?\s*[\d.,]+/gi, "total: [redacted]");
  // Neutralize generic 'amount: 123'
  s = s.replace(/\bamount\s*[:=]?\s*[\d.,]+/gi, "amount: [redacted]");

  return s.trim();
};