export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_LOGOUT: '/admin/auth/logout',
  ADMIN_ME: '/admin/auth/me',

  // Dashboard
  OVERVIEW: '/admin/overview',
  REGEX_HEALTH: '/admin/regex/health',
  REGEX_TEMPLATES: '/admin/regex/templates',
  AUDIT_QUEUE: '/admin/regex/audit-queue',
  REGEX_GAPS: '/admin/regex/gaps',
  REGEX_CORRECTIONS: '/admin/regex/corrections',
  INGESTION_HEALTH: '/admin/ingestion/health',
  INGESTION_TIMELINE: '/admin/ingestion/timeline',
  TRANSACTION_VOLUME: '/admin/transactions/volume',
  USER_STATS: '/admin/users/stats',
  AI_USAGE: '/admin/ai/usage',

  // Actions
  PROMOTE_TEMPLATE: (id: number) => `/admin/regex/templates/${id}/promote`,
  AUDIT_TEMPLATE: (id: number) => `/admin/regex/templates/${id}/audit`,
} as const;
