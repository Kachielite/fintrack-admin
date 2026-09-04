import { useState } from 'react';
import { Download, Plus, Play, Search } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StatChips } from '@/components/ui/StatChips';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { LineChartWidget } from '@/components/charts/LineChart';
import { useOverview } from '@/hooks/use-overview';
import { useRegexHealth } from '@/hooks/use-regex-health';
import { useRegexTemplates } from '@/hooks/use-regex-templates';
import { useAuditQueue } from '@/hooks/use-audit-queue';
import { useRegexGaps } from '@/hooks/use-regex-gaps';
import { fmt } from '@/utils/fmt';
import { downloadCsv } from '@/utils/csv-export';
import apiClient from '@/network/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { TemplateStatus } from '@/types/admin.types';

type SortDir = 'asc' | 'desc';

function useSortState(init: string) {
  const [key, setKey] = useState(init);
  const [dir, setDir] = useState<SortDir>('asc');
  const toggle = (k: string) => {
    if (k === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setKey(k); setDir('asc'); }
  };
  return { key, dir, toggle };
}

function SortTh({ label, sortKey, current, dir, onToggle, align }: {
  label: string; sortKey: string; current: string;
  dir: SortDir; onToggle: (k: string) => void; align?: string;
}) {
  return (
    <th
      className="sortable"
      style={{ textAlign: (align as React.CSSProperties['textAlign']) || 'left' }}
      onClick={() => onToggle(sortKey)}
    >
      {label}
      {current === sortKey && (
        <span className="sort-arrow">{dir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  );
}

export function RegexEnginePage() {
  // Not wired into useRegexHealth: GET /admin/regex/health ignores query
  // params entirely server-side (no date-range or bank-scoping support
  // exists there today, unlike ingestion/timeline, transactions/volume, and
  // ai/usage which genuinely honor a dateRange). Wiring either the tabs or
  // the bank dropdown meaningfully needs backend work beyond this ticket's
  // scope - see fintrack-frontend#68.
  const [timeRange, setTimeRange] = useState('30d');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [auditedRow, setAuditedRow] = useState<number | null>(null);

  const bankSort = useSortState('regex_rate_pct');
  const tplSort = useSortState('correction_count');

  const { data: ov } = useOverview();
  const { data: health, isLoading: hLoading, isError: hError } = useRegexHealth();
  const { data: tplData, isLoading: tLoading, isError: tError } = useRegexTemplates();
  const { data: auditData, isLoading: aLoading, isError: aError } = useAuditQueue();
  const { data: gapsData, isLoading: gLoading, isError: gError } = useRegexGaps();

  const queryClient = useQueryClient();
  const triggerAudit = useMutation({
    mutationFn: (id: number) => apiClient.post(API_ENDPOINTS.AUDIT_TEMPLATE(id)),
    onSuccess: (_, id) => {
      setAuditedRow(id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_QUEUE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGEX_HEALTH] });
    },
  });

  const bulkReaudit = useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.BULK_REAUDIT),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_QUEUE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGEX_HEALTH] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGEX_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OVERVIEW] });
    },
  });

  if (hLoading || tLoading || aLoading || gLoading) return <Spinner />;
  if (hError || !health) return <ErrorState />;
  if (tError || !tplData) return <ErrorState />;

  const byBank = [...(health.by_bank ?? [])].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[bankSort.key];
    const bv = (b as unknown as Record<string, unknown>)[bankSort.key];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return bankSort.dir === 'asc' ? cmp : -cmp;
  });

  const filteredTpls = [...tplData.items]
    .filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!String(t.id).includes(s) &&
            !(t.bank_name ?? '').toLowerCase().includes(s) &&
            !(t.description ?? '').toLowerCase().includes(s)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[tplSort.key];
      const bv = (b as unknown as Record<string, unknown>)[tplSort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return tplSort.dir === 'asc' ? cmp : -cmp;
    });

  function handleExport() {
    downloadCsv(
      'regex-templates.csv',
      filteredTpls.map((t) => ({
        id: t.id,
        bank_name: t.bank_name,
        status: t.status,
        description: t.description,
        confidence_score: t.confidence_score,
        match_count: t.match_count,
        fail_count: t.fail_count,
        correction_count: t.correction_count,
      })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Regex Engine"
        subtitle="Self-improving parsing pipeline · monitoring & debug"
        actions={
          <>
            <button className="btn" onClick={handleExport}><Download size={14} /> Export</button>
            <button
              className="btn primary"
              onClick={() => bulkReaudit.mutate()}
              disabled={bulkReaudit.isPending}
            >
              <Plus size={14} /> {bulkReaudit.isPending ? 'Re-auditing…' : 'Trigger audit'}
            </button>
          </>
        }
      />

      <StatChips items={[
        { label: 'Production', value: ov?.regex_engine.production ?? '—', kind: 'healthy' },
        { label: 'Candidate', value: ov?.regex_engine.candidate ?? '—' },
        { label: 'Failed audit', value: ov?.regex_engine.failed_audit ?? '—', kind: 'critical' },
        { label: 'Degrading', value: ov?.regex_engine.degrading ?? '—', kind: 'warning' },
        { label: 'Avg confidence', value: ov ? fmt.pct(ov.regex_engine.avg_confidence_score) : '—' },
        { label: 'Overall regex rate', value: fmt.pct(health.overall_regex_rate_pct) },
      ]} />

      <div className="section-gap" />

      {/* Trend chart */}
      <div className="card no-pad" style={{ padding: 24 }}>
        <SectionHeader
          title="Regex rate over time"
          subtitle="Daily handoff between regex and AI parsing"
          action={
            <div className="filter-bar">
              <select
                className="input"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="all">All banks</option>
                {health.by_bank?.map((b) => (
                  <option key={b.bank_name} value={b.bank_name}>{b.bank_name}</option>
                ))}
              </select>
              <Tabs
                current={timeRange}
                onChange={setTimeRange}
                tabs={[
                  { value: '30d', label: '30d' },
                  { value: '90d', label: '90d' },
                  { value: '1y', label: '1y' },
                ]}
              />
            </div>
          }
        />
        {health.trend?.length > 0 ? (
          <LineChartWidget
            data={health.trend}
            height={260}
            xKey="date"
            series={[
              { key: 'regex_count', label: 'Regex', color: 'var(--c1)', areaOpacity: 0.18 },
              { key: 'ai_count', label: 'AI', color: 'var(--c2)', areaOpacity: 0.08 },
            ]}
          />
        ) : (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="dim">No trend data available</span>
          </div>
        )}
      </div>

      <div className="section-gap" />

      {/* By-bank health */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px' }}>
          <SectionHeader title="By-bank health" subtitle="Sorted by regex rate (worst first)" />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <SortTh label="Bank" sortKey="bank_name" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} />
                <SortTh label="Prod tpl" sortKey="production_templates" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} align="right" />
                <SortTh label="Avg confidence" sortKey="avg_confidence" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} />
                <SortTh label="Tx (30d)" sortKey="transaction_count_30d" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} align="right" />
                <SortTh label="Regex rate" sortKey="regex_rate_pct" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} align="right" />
                <SortTh label="Correction" sortKey="correction_rate_pct" current={bankSort.key} dir={bankSort.dir} onToggle={bankSort.toggle} align="right" />
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {byBank.map((b) => (
                <tr key={b.bank_name}>
                  <td style={{ fontWeight: 500 }}>{b.bank_name}</td>
                  <td className="num">{b.production_templates}</td>
                  <td style={{ minWidth: 180 }}>
                    {b.avg_confidence > 0 ? (
                      <Progress value={b.avg_confidence} dp={1} />
                    ) : (
                      <span className="dim mono">—</span>
                    )}
                  </td>
                  <td className="num">{fmt.num(b.transaction_count_30d)}</td>
                  <td
                    className="num"
                    style={{
                      color: b.regex_rate_pct >= 80
                        ? 'var(--healthy)'
                        : b.regex_rate_pct >= 65
                        ? 'var(--warning)'
                        : b.regex_rate_pct > 0
                        ? 'var(--critical)'
                        : 'var(--text-tertiary)',
                    }}
                  >
                    {b.regex_rate_pct > 0 ? fmt.pct(b.regex_rate_pct) : '—'}
                  </td>
                  <td
                    className="num"
                    style={{
                      color: b.correction_rate_pct >= 15
                        ? 'var(--critical)'
                        : b.correction_rate_pct >= 5
                        ? 'var(--warning)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {b.correction_rate_pct > 0 ? fmt.pct(b.correction_rate_pct) : '—'}
                  </td>
                  <td><Badge kind={b.status}>{b.status.replace('_', ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap" />

      {/* Templates table */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader title="Templates" subtitle="Click a row to inspect details" />
          <div className="filter-bar">
            <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px' }}>
              <Search size={12} />
              <input
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontFamily: 'var(--font-mono)', fontSize: 12, width: 140 }}
                placeholder="Search templates"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="production">Production</option>
              <option value="audited">Audited</option>
              <option value="candidate">Candidate</option>
              <option value="failed_audit">Failed audit</option>
              <option value="degrading">Degrading</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Template ID</th>
                <th>Bank</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ minWidth: 160 }}>Confidence</th>
                <th style={{ textAlign: 'right' }}>Match</th>
                <th style={{ textAlign: 'right' }}>Fail</th>
                <SortTh label="Corr" sortKey="correction_count" current={tplSort.key} dir={tplSort.dir} onToggle={tplSort.toggle} align="right" />
                <th>Promoted</th>
              </tr>
            </thead>
            <tbody>
              {filteredTpls.map((t) => (
                <>
                  <tr
                    key={t.id}
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    style={{ cursor: 'pointer' }}
                    className={expanded === t.id ? 'expanded' : ''}
                  >
                    <td className="code">
                      {t.id} <span className="dim">v{t.version}</span>
                    </td>
                    <td>{t.bank_name}</td>
                    <td className="muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description ?? '—'}
                    </td>
                    <td>
                      <Badge kind={t.status as TemplateStatus}>{t.status.replace('_', ' ')}</Badge>
                    </td>
                    <td><Progress value={t.confidence_score} /></td>
                    <td className="num">{fmt.num(t.match_count)}</td>
                    <td className="num" style={{ color: t.fail_count > 100 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {fmt.num(t.fail_count)}
                    </td>
                    <td className="num" style={{ color: t.correction_count > 200 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {fmt.num(t.correction_count)}
                    </td>
                    <td className="muted mono" style={{ fontSize: 12 }}>
                      {t.promoted_at ?? '—'}
                    </td>
                  </tr>
                  {expanded === t.id && (
                    <tr key={`${t.id}-expanded`}>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <div className="rule-row">
                          <div className="rule-row-head">
                            <span>Field</span>
                            <span>Details</span>
                            <span style={{ textAlign: 'right' }}>Info</span>
                          </div>
                          {[
                            { field: 'Created by', value: t.created_by },
                            { field: 'Created at', value: t.created_at },
                            { field: 'Audit passed', value: t.audit_passed_at ?? '—' },
                            { field: 'Last failed', value: t.last_failed_at ?? '—' },
                          ].map((r, i) => (
                            <div className="rule-item" key={i}>
                              <span className="rule-item-field">{r.field}</span>
                              <code>{r.value}</code>
                              <span className="num mono" />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap" />

      {/* Audit queue + gaps */}
      <div className="grid">
        <div className="col-6">
          <div className="card">
            <SectionHeader
              title="Audit queue"
              subtitle={`${auditData?.total_pending ?? 0} candidate templates waiting`}
            />
            {aError || !auditData ? (
              <ErrorState />
            ) : auditData.items.length === 0 ? (
              <EmptyState title="No templates waiting" sub="The audit pipeline is caught up" />
            ) : (
              <div className="col" style={{ gap: 0 }}>
                {auditData.items.map((item) => (
                  <div
                    key={item.template_id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-hairline)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5 }}>
                        {item.bank_name}{' '}
                        <span className="dim mono" style={{ fontSize: 11 }}>v{item.version}</span>
                      </div>
                      <div className="dim mono" style={{ fontSize: 11.5 }}>#{item.template_id}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 12.5, color: item.hours_waiting >= 24 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {item.hours_waiting}h waiting
                    </span>
                    {auditedRow === item.template_id ? (
                      <span style={{ fontSize: 12, color: 'var(--healthy)' }}>Triggered ✓</span>
                    ) : (
                      <button
                        className="btn sm row-action"
                        onClick={() => triggerAudit.mutate(item.template_id)}
                        disabled={triggerAudit.isPending}
                      >
                        <Play size={11} /> Audit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <SectionHeader title="Coverage gaps" subtitle="Banks with unhandled transactions" />
            {gError || !gapsData ? (
              <ErrorState />
            ) : gapsData.items.length === 0 ? (
              <EmptyState title="No gaps" sub="All active banks have a production template" />
            ) : (
              <div className="col" style={{ gap: 0 }}>
                {gapsData.items.map((g) => (
                  <div
                    key={g.bank_name}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-hairline)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5 }}>{g.bank_name}</div>
                      <div className="dim" style={{ fontSize: 12 }}>
                        <span className="mono">{fmt.num(g.unhandled_tx_count)}</span> unhandled tx
                      </div>
                    </div>
                    {g.candidate_template_exists ? (
                      <Badge kind="candidate">candidate exists</Badge>
                    ) : (
                      <Badge kind="no_coverage">no candidate</Badge>
                    )}
                    <button className="btn sm">Generate</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
