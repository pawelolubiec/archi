/** Display slide number from zero-based chapter index. */
export function formatSlideNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
