// Auth
export interface AdminLoginResponse {
  access_token: string;
  expires_in: string;
}

// Overview
export interface AdminOverviewResponse {
  snapshot_at: string;
  transactions: {
    total_count: number;
    total_count_30d: number;
    handled_by_regex: number;
    handled_by_ai: number;
    regex_rate_pct: number;
    regex_rate_30d_pct: number;
    failed_ingestion_count: number;
    unverified_count: number;
  };
  regex_engine: {
    total_templates: number;
    production: number;
    candidate: number;
    failed_audit: number;
    degrading: number;
    avg_confidence_score: number;
    banks_with_coverage: number;
    banks_without_coverage: number;
  };
  users: {
    total: number;
    active_30d: number;
    plan_free: number;
    plan_pro: number;
    plan_premium: number;
    onboarding_complete: number;
    email_connected: number;
  };
  ingestion: {
    connections_active: number;
    connections_stale: number;
    emails_processed_30d: number;
    emails_failed_30d: number;
    avg_parse_time_ms: number | null;
  };
  ai_cost: {
    estimated_cost_today_usd: number;
    estimated_cost_30d_usd: number;
    total_tokens_30d: number;
    cost_per_transaction_30d: number;
  };
}

// Regex Health
export interface RegexHealthResponse {
  as_of: string;
  overall_regex_rate_pct: number;
  trend: Array<{
    date: string;
    regex_count: number;
    ai_count: number;
    regex_rate_pct: number;
  }>;
  by_bank: Array<{
    bank_id: number;
    bank_name: string;
    short_code: string;
    production_templates: number;
    avg_confidence: number;
    transaction_count_30d: number;
    regex_rate_pct: number;
    correction_rate_pct: number;
    status: 'healthy' | 'degrading' | 'no_coverage';
  }>;
  templates_added_30d: number;
  templates_modified_30d: number;
  templates_deprecated_30d: number;
}

// Regex Templates
export type TemplateStatus = 'production' | 'audited' | 'candidate' | 'failed_audit' | 'degrading';

export interface RegexTemplate {
  id: number;
  bank_name: string;
  version: number;
  description: string | null;
  status: string;
  confidence_score: number;
  match_count: number;
  fail_count: number;
  correction_count: number;
  created_by: string;
  audit_passed_at: string | null;
  promoted_at: string | null;
  last_failed_at: string | null;
  created_at: string;
}

export interface RegexTemplateListResponse {
  page: number;
  limit: number;
  total_items: number;
  pages: number;
  items: RegexTemplate[];
}

// Audit Queue
export interface AuditQueueItem {
  template_id: number;
  bank_name: string;
  version: number;
  created_at: string;
  hours_waiting: number;
  triggered_by_tx_id: number | null;
}

export interface AuditQueueResponse {
  total_pending: number;
  items: AuditQueueItem[];
}

// Regex Gaps
export interface RegexGapItem {
  bank_id: number;
  bank_name: string;
  short_code: string;
  unhandled_tx_count: number;
  oldest_unhandled_at: string;
  candidate_template_exists: boolean;
}

export interface RegexGapsResponse {
  total_banks_with_gaps: number;
  items: RegexGapItem[];
}

// Regex Corrections
export interface CorrectionItem {
  template_id: number;
  bank_name: string;
  description: string | null;
  status: string;
  match_count: number;
  correction_count: number;
  correction_rate_pct: number;
  most_corrected_field: string | null;
}

export interface RegexCorrectionsResponse {
  items: CorrectionItem[];
}

// Ingestion Health
export interface IngestionHealthResponse {
  connections: {
    total: number;
    active: number;
    stale: number;
    stale_list: Array<{
      connection_id: number;
      gmail_address: string;
      last_synced_at: string | null;
      status: string;
    }>;
  };
  pipeline_30d: {
    emails_processed: number;
    emails_failed: number;
    failure_rate_pct: number;
    non_transaction_classified: number;
    avg_parse_time_ms: number | null;
  };
  outcomes_30d: {
    parsed: number;
    non_transaction: number;
    failed: number;
  };
}

// Ingestion Timeline
export interface IngestionTimelineResponse {
  from: string;
  to: string;
  buckets: Array<{
    date: string;
    parsed: number;
    failed: number;
    regex_handled: number;
    ai_handled: number;
  }>;
}

// Transaction Volume
export interface TransactionVolumeResponse {
  from: string;
  to: string;
  totals: {
    count: number;
    debit_count: number;
    credit_count: number;
    total_debit_ref: number;
    total_credit_ref: number;
  };
  by_bank: Array<{
    bank_name: string;
    count: number;
    total_ref: number;
    pct_of_total: number;
  }>;
  by_currency: Array<{
    currency: string;
    count: number;
    total_native: number;
    total_ref: number;
  }>;
  by_category: Array<{
    category: string;
    count: number;
    total_ref: number;
    pct_of_total: number;
  }>;
}

// User Stats
export interface UserStatsResponse {
  total_users: number;
  new_users_30d: number;
  active_30d: number;
  onboarding_funnel: {
    signed_up: number;
    email_connected: number;
    onboarding_complete: number;
    first_transaction_parsed: number;
  };
  by_plan: {
    free: number;
    pro: number;
    premium: number;
  };
  retention: {
    users_with_tx_last_7d: number;
    users_with_tx_last_30d: number;
  };
}

// AI Usage
export interface AiUsageResponse {
  from: string;
  to: string;
  totals: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd: number;
    call_count: number;
  };
  by_operation: Array<{
    operation: string;
    call_count: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd: number;
    pct_of_total_cost: number;
  }>;
  trend: Array<{
    date: string;
    total_tokens: number;
    estimated_cost_usd: number;
    call_count: number;
  }>;
  cost_per_transaction_30d: number;
  cost_per_transaction_trend: Array<{
    date: string;
    cost_per_tx: number;
  }>;
}
