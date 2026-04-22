import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans AI-generated text by removing markdown syntax and citation brackets
 * @param text - Raw text from AI/Perplexity API
 * @returns Cleaned text without markdown or citations
 */
export function cleanAIText(text: string | undefined | null): string {
  if (!text) return '';
  
  return text
    // Remove citation brackets like [1], [2], [3]
    .replace(/\[\d+\]/g, '')
    // Remove bold markdown (**text**)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic markdown (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove headers (### text)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove inline code (`text`)
    .replace(/`(.+?)`/g, '$1')
    // Remove links but keep text [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove trailing/leading whitespace
    .trim()
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ');
}
