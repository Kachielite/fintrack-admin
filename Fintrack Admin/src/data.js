// ===== Mock data for FinTrack admin =====

const seed = (n) => {
  let s = n;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

// 30-day daily series for handoff trend
function makeHandoffSeries(days = 30, startRegex = 0.55, endRegex = 0.83) {
  const rand = seed(42);
  const arr = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const target = startRegex + (endRegex - startRegex) * t;
    const noise = (rand() - 0.5) * 0.04;
    const total = 1100 + Math.round(rand() * 600);
    const regex = Math.round(total * Math.max(0.3, Math.min(0.95, target + noise)));
    arr.push({
      day: i,
      date: new Date(2026, 3, 11 + i).toISOString().slice(5, 10),
      total,
      regex,
      ai: total - regex,
    });
  }
  return arr;
}

window.MOCK = {
  user: { email: 'leah@fintrack.io', name: 'Leah' },

  overview: {
    totalTx: 1248732,
    txAi: 218429,
    txRegex: 1030303,
    regexRateLifetime: 82.5,
    regexRate30d: 86.3,
    activeUsers30d: 4382,
    aiCostMonth: 184.27,
    costPerTx: 0.000147,
    handoff: makeHandoffSeries(30, 0.66, 0.86),
  },

  regexSnapshot: {
    production: 47,
    total: 62,
    avgConfidence: 88.4,
    coveredBanks: 8,
    totalBanks: 10,
  },

  ingestion: {
    activeConnections: 4128,
    staleConnections: 87,
    successRate30d: 98.6,
    revoked: 38,
    emailsProcessed30d: 213847,
    failed: 2942,
    nonTransaction: 8120,
    parsed: 202785,
  },

  audit: {
    pending: 7,
    oldestHours: 38,
    items: [
      { id: 'tpl_039_v3', bank: 'Monzo', version: 3, hours: 38 },
      { id: 'tpl_044_v1', bank: 'Wise', version: 1, hours: 22 },
      { id: 'tpl_021_v4', bank: 'Revolut', version: 4, hours: 14 },
      { id: 'tpl_058_v2', bank: 'N26', version: 2, hours: 9 },
      { id: 'tpl_019_v6', bank: 'Barclays', version: 6, hours: 6 },
      { id: 'tpl_062_v1', bank: 'Lloyds', version: 1, hours: 4 },
      { id: 'tpl_048_v2', bank: 'Starling', version: 2, hours: 2 },
    ],
  },

  funnel: [
    { step: 'Signed up', count: 7820 },
    { step: 'Email connected', count: 5961 },
    { step: 'Onboarding complete', count: 4108 },
    { step: 'First transaction', count: 3702 },
  ],

  banks: [
    { name: 'HSBC', prodTpl: 8, conf: 94.2, tx30: 48820, regexRate: 91.4, corrRate: 1.2, status: 'healthy' },
    { name: 'Barclays', prodTpl: 6, conf: 91.7, tx30: 41208, regexRate: 88.9, corrRate: 1.8, status: 'healthy' },
    { name: 'Lloyds', prodTpl: 5, conf: 89.4, tx30: 32418, regexRate: 86.1, corrRate: 2.4, status: 'healthy' },
    { name: 'Monzo', prodTpl: 7, conf: 87.6, tx30: 29981, regexRate: 83.2, corrRate: 3.1, status: 'healthy' },
    { name: 'Starling', prodTpl: 4, conf: 85.2, tx30: 21039, regexRate: 79.8, corrRate: 4.2, status: 'healthy' },
    { name: 'Revolut', prodTpl: 6, conf: 82.1, tx30: 18742, regexRate: 74.6, corrRate: 6.8, status: 'degrading' },
    { name: 'NatWest', prodTpl: 5, conf: 80.4, tx30: 14821, regexRate: 71.2, corrRate: 5.4, status: 'degrading' },
    { name: 'Wise', prodTpl: 3, conf: 76.5, tx30: 9421, regexRate: 62.9, corrRate: 9.2, status: 'degrading' },
    { name: 'N26', prodTpl: 2, conf: 0, tx30: 4218, regexRate: 0, corrRate: 0, status: 'no_coverage' },
    { name: 'Chase UK', prodTpl: 0, conf: 0, tx30: 1842, regexRate: 0, corrRate: 0, status: 'no_coverage' },
  ],

  templates: [
    { id: 'tpl_HSBC_001', bank: 'HSBC', version: 4, desc: 'Card transaction debit', status: 'production', conf: 96, match: 12420, fail: 18, corr: 142, promoted: '2025-09-12', lastFail: '2026-04-22' },
    { id: 'tpl_BARC_002', bank: 'Barclays', version: 3, desc: 'Direct debit incoming', status: 'production', conf: 94, match: 9842, fail: 24, corr: 188, promoted: '2025-08-04', lastFail: '2026-04-30' },
    { id: 'tpl_LLOY_001', bank: 'Lloyds', version: 5, desc: 'Faster payment outgoing', status: 'production', conf: 91, match: 7218, fail: 32, corr: 184, promoted: '2025-07-11', lastFail: '2026-05-02' },
    { id: 'tpl_MONZ_007', bank: 'Monzo', version: 2, desc: 'Pot transfer notification', status: 'production', conf: 88, match: 6240, fail: 41, corr: 207, promoted: '2025-11-22', lastFail: '2026-05-04' },
    { id: 'tpl_STRL_003', bank: 'Starling', version: 1, desc: 'Standing order monthly', status: 'audited', conf: 86, match: 3104, fail: 28, corr: 142, promoted: '2026-01-18', lastFail: '2026-05-01' },
    { id: 'tpl_REVO_009', bank: 'Revolut', version: 4, desc: 'FX exchange settlement', status: 'degrading', conf: 72, match: 2841, fail: 187, corr: 312, promoted: '2025-10-04', lastFail: '2026-05-09' },
    { id: 'tpl_WISE_002', bank: 'Wise', version: 2, desc: 'International transfer in', status: 'candidate', conf: 78, match: 1428, fail: 142, corr: 0, promoted: '—', lastFail: '2026-05-08' },
    { id: 'tpl_N26_001', bank: 'N26', version: 1, desc: 'Card payment generic', status: 'failed_audit', conf: 64, match: 2104, fail: 421, corr: 0, promoted: '—', lastFail: '2026-05-09' },
    { id: 'tpl_NATW_004', bank: 'NatWest', version: 3, desc: 'Salary credit', status: 'production', conf: 89, match: 5482, fail: 22, corr: 124, promoted: '2025-12-09', lastFail: '2026-04-28' },
    { id: 'tpl_HSBC_002', bank: 'HSBC', version: 6, desc: 'ATM withdrawal', status: 'production', conf: 93, match: 4218, fail: 12, corr: 86, promoted: '2025-09-30', lastFail: '2026-04-19' },
  ],

  templateRules: {
    'tpl_HSBC_001': [
      { field: 'amount',      regex: '£([0-9,]+\\.[0-9]{2})\\s+(?:debit|paid)' },
      { field: 'merchant',    regex: 'at\\s+([A-Z0-9 \\.\'&\\-]{3,40})\\s+on' },
      { field: 'datetime',    regex: 'on\\s+(\\d{1,2}\\s+[A-Z][a-z]+\\s+\\d{4})\\s+at\\s+(\\d{2}:\\d{2})' },
      { field: 'card_last4',  regex: 'card ending\\s+(\\d{4})' },
    ],
  },

  regexGaps: [
    { bank: 'N26', txCount: 4218, candidate: true },
    { bank: 'Chase UK', txCount: 1842, candidate: false },
    { bank: 'Citibank', txCount: 920, candidate: false },
  ],

  staleConnections: [
    { email: 'm.alvarez@gmail.com', lastSync: '6d 4h', status: 'stale' },
    { email: 'jharper.dev@gmail.com', lastSync: '4d 11h', status: 'stale' },
    { email: 'priya.s@outlook.com', lastSync: '3d 19h', status: 'stale' },
    { email: 'roman.k@gmail.com', lastSync: '2d 18h', status: 'stale' },
    { email: 'okwon.lee@gmail.com', lastSync: '2d 6h', status: 'stale' },
    { email: 'amelia.t@gmail.com', lastSync: '14d 2h', status: 'revoked' },
    { email: 'jasper.f@yahoo.com', lastSync: '21d 8h', status: 'revoked' },
  ],

  ingestionTimeline: (() => {
    const r = seed(11);
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const total = 6500 + Math.round(r() * 1800);
      const failed = Math.round(total * (0.012 + r() * 0.01));
      const nonTx = Math.round(total * (0.04 + r() * 0.02));
      arr.push({
        date: new Date(2026, 3, 11 + i).toISOString().slice(5, 10),
        parsed: total - failed - nonTx,
        failed,
        nonTx,
      });
    }
    return arr;
  })(),

  txByBank: [
    { name: 'HSBC', count: 48820 },
    { name: 'Barclays', count: 41208 },
    { name: 'Lloyds', count: 32418 },
    { name: 'Monzo', count: 29981 },
    { name: 'Starling', count: 21039 },
    { name: 'Revolut', count: 18742 },
    { name: 'NatWest', count: 14821 },
    { name: 'Wise', count: 9421 },
    { name: 'N26', count: 4218 },
    { name: 'Chase UK', count: 1842 },
  ],

  txByCurrency: [
    { ccy: 'GBP', debit: 1842220, credit: 1928420 },
    { ccy: 'EUR', debit: 421809, credit: 388210 },
    { ccy: 'USD', debit: 218492, credit: 192011 },
    { ccy: 'PLN', debit: 48202, credit: 41020 },
  ],

  txByCategory: [
    { name: 'Groceries', count: 38421 },
    { name: 'Transport', count: 28429 },
    { name: 'Dining', count: 24102 },
    { name: 'Bills', count: 19842 },
    { name: 'Shopping', count: 17428 },
    { name: 'Other', count: 14528 },
  ],

  topCorrections: [
    { tpl: 'tpl_REVO_009', bank: 'Revolut', match: 2841, corr: 312, rate: 11.0, field: 'merchant' },
    { tpl: 'tpl_WISE_002', bank: 'Wise', match: 1428, corr: 224, rate: 15.7, field: 'amount' },
    { tpl: 'tpl_MONZ_007', bank: 'Monzo', match: 6240, corr: 207, rate: 3.3, field: 'category_hint' },
    { tpl: 'tpl_BARC_002', bank: 'Barclays', match: 9842, corr: 188, rate: 1.9, field: 'merchant' },
    { tpl: 'tpl_LLOY_001', bank: 'Lloyds', match: 7218, corr: 184, rate: 2.5, field: 'datetime' },
    { tpl: 'tpl_STRL_003', bank: 'Starling', match: 3104, corr: 142, rate: 4.6, field: 'merchant' },
    { tpl: 'tpl_HSBC_001', bank: 'HSBC', match: 12420, corr: 142, rate: 1.1, field: 'amount' },
    { tpl: 'tpl_N26_001',  bank: 'N26', match: 2104, corr: 421, rate: 20.0, field: 'merchant' },
  ],

  users: {
    total: 7820,
    newThisMonth: 612,
    active30d: 4382,
    onboardingPct: 52.5,
    plans: [
      { name: 'Free', count: 5612, color: 'var(--c4)' },
      { name: 'Pro', count: 1842, color: 'var(--c1)' },
      { name: 'Premium', count: 366, color: 'var(--c2)' },
    ],
    retention7d: 2841,
    retention30d: 4382,
  },

  ai: {
    totalTokens30d: 48_241_820,
    promptTokens: 32_184_004,
    completionTokens: 16_057_816,
    costUsd30d: 184.27,
    costPerTx: 0.000147,
    calls30d: 38420,
    targetCpt: 0.0001,
    costTrend: (() => {
      const r = seed(7);
      const arr = [];
      for (let i = 0; i < 30; i++) {
        const t = i / 29;
        const cost = 9.4 - t * 3.2 + (r() - 0.5) * 0.6;
        const cpt = 0.00022 - t * 0.00010 + (r() - 0.5) * 0.00002;
        arr.push({
          date: new Date(2026, 3, 11 + i).toISOString().slice(5, 10),
          cost: Math.max(2, cost),
          cpt: Math.max(0.00005, cpt),
        });
      }
      return arr;
    })(),
    operations: [
      { name: 'parse_email',         calls: 21420, tokens: 22_184_204, cost: 84.21,  pct: 45.7 },
      { name: 'generate_template',   calls:   142, tokens: 12_420_004, cost: 47.92,  pct: 26.0 },
      { name: 'audit_template',      calls:   421, tokens:  6_842_182, cost: 26.34,  pct: 14.3 },
      { name: 'generate_insight',    calls:  9412, tokens:  4_204_812, cost: 16.11,  pct:  8.7 },
      { name: 'budget_suggestion',   calls:  7025, tokens:  2_590_618, cost:  9.69,  pct:  5.3 },
    ],
  },
};
