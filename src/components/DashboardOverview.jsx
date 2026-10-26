import React from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Building,
  Users,
  Flame,
  ArrowRight
} from 'lucide-react';
import { BUREAUS, REGIONS } from '../data/mockData';

export default function DashboardOverview({
  cases,
  institutions,
  overlapClusters,
  onNavigateTab,
  onFilterByBureau,
  onFilterByRegion,
  onOpenSecurityModal,
  onOpenCoordinationView
}) {
  // Compute High-Level Metrics
  const totalCases = cases.length;
  const underProcessCases = cases.filter(c => ['RECEIVED', 'UNDER_PROCESS', 'NOTICE_ISSUED', 'HEARING_SCHEDULED'].includes(c.status)).length;
  const disposedCases = cases.filter(c => c.status === 'DISPOSED').length;
  const transferredCases = cases.filter(c => c.status === 'TRANSFERRED').length;
  const overdueCases = cases.filter(c => c.isOverdue && c.status !== 'DISPOSED').length;
  const disposalRate = totalCases > 0 ? Math.round((disposedCases / totalCases) * 100) : 0;

  // Bureau Workload Breakdown
  const bureauStats = BUREAUS.map(bureau => {
    const bCases = cases.filter(c => c.bureau === bureau.id);
    const active = bCases.filter(c => c.status !== 'DISPOSED').length;
    const disposed = bCases.filter(c => c.status === 'DISPOSED').length;
    const overdue = bCases.filter(c => c.isOverdue && c.status !== 'DISPOSED').length;
    const percent = totalCases > 0 ? Math.round((bCases.length / totalCases) * 100) : 0;
    return {
      ...bureau,
      total: bCases.length,
      active,
      disposed,
      overdue,
      percent
    };
  });

  // Regional Distribution
  const regionStats = REGIONS.map(reg => {
    const rCases = cases.filter(c => c.region === reg.name);
    return {
      name: reg.name,
      count: rCases.length,
      active: rCases.filter(c => c.status !== 'DISPOSED').length
    };
  }).sort((a, b) => b.count - a.count);

  // Ageing Breakdown
  const ageing = {
    under15: cases.filter(c => c.status !== 'DISPOSED' && !c.isOverdue).length,
    overdue15_30: cases.filter(c => c.status !== 'DISPOSED' && c.isOverdue).length,
    critical30Plus: cases.filter(c => c.status === 'COORDINATION_REQUIRED' || (c.isOverdue && c.priority === 'HIGH')).length
  };

  return (
    <div className="dashboard-overview-container">
      {/* 1. KPI Summary Cards Grid */}
      <div className="kpi-grid">
        {/* Total Received */}
        <div className="kpi-card kpi-total">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Cases Received</span>
            <div className="kpi-icon-container">
              <FileText size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{totalCases}</span>
            <span className="kpi-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
              All Bureaus
            </span>
          </div>
          <div className="kpi-subtext">Consolidated across 4 AICTE directorates</div>
        </div>

        {/* Active Under Process */}
        <div className="kpi-card kpi-under-process">
          <div className="kpi-card-header">
            <span className="kpi-title">Cases Under Process</span>
            <div className="kpi-icon-container">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{underProcessCases}</span>
            <span className="kpi-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
              Active
            </span>
          </div>
          <div className="kpi-subtext">Action initiated / Inquiry ongoing</div>
        </div>

        {/* Overlapping Conflicts */}
        <div
          className="kpi-card kpi-overlap"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('overlap')}
          title="Click to resolve inter-bureau overlapping cases"
        >
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ color: '#be123c', fontWeight: 700 }}>
              Overlapping Conflicts
            </span>
            <div className="kpi-icon-container">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#e11d48' }}>
              {overlapClusters.length}
            </span>
            <span className="kpi-badge" style={{ background: '#ffe4e6', color: '#be123c' }}>
              Action Needed
            </span>
          </div>
          <div className="kpi-subtext" style={{ color: '#e11d48', fontWeight: 600 }}>
            {overlapClusters.reduce((acc, c) => acc + c.cases.length, 0)} linked parallel cases
          </div>
        </div>

        {/* Cases Disposed */}
        <div className="kpi-card kpi-disposed">
          <div className="kpi-card-header">
            <span className="kpi-title">Cases Disposed</span>
            <div className="kpi-icon-container">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#059669' }}>
              {disposedCases}
            </span>
            <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#047857' }}>
              {disposalRate}% Rate
            </span>
          </div>
          <div className="kpi-subtext">Orders issued & refunds disbursed</div>
        </div>

        {/* SLA Breached / Overdue */}
        <div className="kpi-card kpi-overdue">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ color: '#b45309' }}>
              Overdue &gt; 30 Days SLA
            </span>
            <div className="kpi-icon-container">
              <Flame size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#d97706' }}>
              {overdueCases}
            </span>
            <span className="kpi-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
              Escalated
            </span>
          </div>
          <div className="kpi-subtext">Exceeded statutory response limit</div>
        </div>

        {/* Cryptographic SHA-256 Ledger Status */}
        <div
          className="kpi-card kpi-integrity"
          style={{ cursor: 'pointer' }}
          onClick={onOpenSecurityModal}
          title="Inspect cryptographic proof chain"
        >
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ color: '#6d28d9' }}>
              SHA-256 Security Ledger
            </span>
            <div className="kpi-icon-container">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#7c3aed', fontSize: '1.8rem' }}>
              100%
            </span>
            <span className="kpi-badge" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
              Tamper Proof
            </span>
          </div>
          <div className="kpi-subtext">All audit trail logs cryptographically sealed</div>
        </div>
      </div>

      {/* 2. Visual Analytics Section: Bureau Workload & Regional Breakdown */}
      <div className="analytics-dashboard-grid">
        {/* Bureau Workload Distribution */}
        <div className="dashboard-card">
          <div className="card-heading-bar">
            <div className="card-title-group">
              <Building size={20} color="#2563eb" />
              <div>
                <h3 className="card-title">Bureau & Cell Workload Distribution</h3>
                <span className="card-subtitle">
                  Active monitoring across Regulation Bureau (RB), PGRC, Approval Bureau & Vigilance Cell
                </span>
              </div>
            </div>
            <button
              className="btn-table-action"
              onClick={() => onNavigateTab('cases')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bureau-workload-list">
            {bureauStats.map((bureau) => (
              <div key={bureau.id} className="workload-item">
                <div className="workload-meta">
                  <div className="workload-bureau-name">
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: bureau.color
                      }}
                    />
                    <span>{bureau.name} ({bureau.shortName})</span>
                    {bureau.overdue > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                        • {bureau.overdue} Overdue
                      </span>
                    )}
                  </div>
                  <div className="workload-stat">
                    <span>{bureau.active} Active</span>
                    <span style={{ color: '#94a3b8', margin: '0 6px' }}>/</span>
                    <span style={{ color: '#64748b' }}>{bureau.total} Total</span>
                  </div>
                </div>

                <div className="workload-bar-track">
                  <div
                    className="workload-bar-fill"
                    style={{
                      width: `${Math.max(bureau.percent, 8)}%`,
                      backgroundColor: bureau.color
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {bureau.mandate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Intelligence Breakdown */}
        <div className="dashboard-card">
          <div className="card-heading-bar">
            <div className="card-title-group">
              <Users size={20} color="#059669" />
              <div>
                <h3 className="card-title">Regional Grievance Distribution</h3>
                <span className="card-subtitle">AICTE Regional Offices jurisdiction</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {regionStats.map((reg) => (
              <div
                key={reg.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-soft)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onClick={() => onFilterByRegion(reg.name)}
                title={`Filter cases for ${reg.name}`}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {reg.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                    {reg.active} active
                  </span>
                  <span
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {reg.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Cross-Bureau Overlap Showcase Matrix */}
      <div className="dashboard-card" style={{ marginBottom: 24, borderLeft: '5px solid #e11d48' }}>
        <div className="card-heading-bar">
          <div className="card-title-group">
            <GitBranch size={20} color="#e11d48" />
            <div>
              <h3 className="card-title">Active Cross-Bureau Overlap Watchlist</h3>
              <span className="card-subtitle">
                Institutions simultaneously being handled by Regulation Bureau and Grievance/Approval Cells
              </span>
            </div>
          </div>
          <button
            className="btn-resolve-overlap"
            onClick={() => onNavigateTab('overlap')}
          >
            <span>Open Coordination Center</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {overlapClusters.map((cluster) => (
            <div
              key={cluster.institutionPermanentId}
              style={{
                border: '1px solid #fecdd3',
                background: '#fff5f5',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {cluster.institutionPermanentId}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: 12 }}>
                    {cluster.conflictLevel} CONFLICT RISK
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#9f1239', marginBottom: 4 }}>
                  {cluster.institutionName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Region: {cluster.region} • {cluster.activeCaseCount} Active Cases
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#881337', marginBottom: 4 }}>
                  Parallel Bureaus Involved:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {cluster.cases.map(c => (
                    <span
                      key={c.caseId}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: c.bureau === 'RB' ? '#eff6ff' : '#fffbeb',
                        color: c.bureau === 'RB' ? '#1d4ed8' : '#b45309',
                        fontWeight: 600,
                        border: `1px solid ${c.bureau === 'RB' ? '#bfdbfe' : '#fde68a'}`
                      }}
                    >
                      {c.bureau}: {c.caseId}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn-table-action"
                style={{ width: '100%', justifyContent: 'center', background: '#ffffff', borderColor: '#fca5a5', color: '#be123c', fontWeight: 700 }}
                onClick={() => onOpenCoordinationView(cluster.institutionPermanentId)}
              >
                Coordinate Joint Directives
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
