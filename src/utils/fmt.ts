export const fmt = {
  num: (n: number) => n.toLocaleString('en-US'),
  numK: (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (n >= 10_000)    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (n >= 1_000)     return (n / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'k';
    return n.toLocaleString('en-US');
  },
  usd: (n: number, dp = 2) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  pct: (n: number, dp = 1) => n.toFixed(dp) + '%',
  cpt: (n: number) => '$' + n.toFixed(6),
  date: (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
};
