import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips markdown syntax from AI-generated text
 * Removes: **bold**, *italic*, _underline_, [citations], ### headers, `code`
 * @param text - Raw text from AI/Perplexity API
 * @returns Cleaned text without markdown or citations
 */
export function stripMarkdown(text: string | undefined | null): string {
  if (!text) return '';
  
  let cleaned = String(text);
  
  // Remove citation brackets like [1], [2], [3], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  
  // Remove bold markdown (**text** or __text__)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  
  // Remove italic markdown (*text* or _text_)
  // Be careful not to remove underscores in the middle of words
  cleaned = cleaned.replace(/\*([^\*]+)\*/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove headers (# ## ### etc)
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  
  // Remove inline code (`text`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep text [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Remove multiple spaces and normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Legacy function name - use stripMarkdown instead
 * Kept for backwards compatibility
 */
export function cleanAIText(text: string | undefined | null): string {
  return stripMarkdown(text);
}
