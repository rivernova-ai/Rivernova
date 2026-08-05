// Strip characters that can be used to escape or override LLM prompt context.
// maxLength caps token cost and limits injection payload size.
export function sanitizeForPrompt(val: unknown, maxLength = 200): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>\[\]{}\\`]/g, '').slice(0, maxLength);
}