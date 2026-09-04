const PRESET_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

/**
 * Concrete {from, to} ISO strings for a preset like '7d'/'30d'/'90d'/'1y',
 * relative to now - mirrors the mobile app's date-filter.ts resolveDateRange
 * pattern. Unrecognized presets (e.g. Transactions' not-yet-wired 'custom'
 * option) fall back to 30 days rather than sending an unbounded range.
 * See fintrack-frontend#68.
 */
export function resolveDateRange(preset: string): { from: string; to: string } {
  const days = PRESET_DAYS[preset] ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}
