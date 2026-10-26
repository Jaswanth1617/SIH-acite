import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react';
import { BUREAUS, REGIONS, STATUS_TYPES } from '../data/mockData';

export default function ReportsAnalyticsView({
  cases,
  institutions,
  overlapClusters
}) {
  const [selectedReportType, setSelectedReportType] = useState('BUREAU'); // BUREAU | REGION | OVERLAP | AGEING
  const [timePeriod, setTimePeriod] = useState('CURRENT_YEAR');

  // Compute Bureau Report
  const bureauReport = BUREAUS.map(b => {
    const bCases = cases.filter(c => c.bureau === b.id);
    const active = bCases.filter(c => c.status !== 'DISPOSED').length;
    const disposed = bCases.filter(c => c.status === 'DISPOSED').length;
    const overdue = bCases.filter(c => c.isOverdue && c.status !== 'DISPOSED').length;
    const overlapInvolved = bCases.filter(c => c.overlapDetected).length;
    const disposalRate = bCases.length > 0 ? Math.round((disposed / bCases.length) * 100) : 0;
    return {
      bureau: b.name,
      code: b.id,
      head: b.headOfficer,
      total: bCases.length,
      active,
      disposed,
      overdue,
      overlapInvolved,
      disposalRate
    };
  });

  // Compute Region Report
  const regionReport = REGIONS.map(r => {
    const rCases = cases.filter(c => c.region === r.name);
    const active = rCases.filter(c => c.status !== 'DISPOSED').length;
    const disposed = rCases.filter(c => c.status === 'DISPOSED').length;
    const overdue = rCases.filter(c => c.isOverdue && c.status !== 'DISPOSED').length;
    return {
      region: r.name,
      states: r.states,
      office: r.office,
      total: rCases.length,
      active,
      disposed,
      overdue,
      disposalRate: rCases.length > 0 ? Math.round((disposed / rCases.length) * 100) : 0
    };
  });

  // Handle Printable Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-analytics-view">
      {/* 1. Report Selector & Export Toolbar */}
      <div className="glass-panel" style={{ padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={22} color="#2563eb" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Executive Reports & Performance Analytics
              </h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Statutory oversight summaries for Member Secretary, Bureau Heads and Ministry Review Panels.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Report Type Selector */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`btn-filter-toggle ${selectedReportType === 'BUREAU' ? 'active' : ''}`}
                onClick={() => setSelectedReportType('BUREAU')}
              >
                Bureau Performance
              </button>
              <button
                className={`btn-filter-toggle ${selectedReportType === 'REGION' ? 'active' : ''}`}
                onClick={() => setSelectedReportType('REGION')}
              >
                Regional Trends
              </button>
              <button
                className={`btn-filter-toggle ${selectedReportType === 'OVERLAP' ? 'active' : ''}`}
                onClick={() => setSelectedReportType('OVERLAP')}
              >
                Overlap Audit
              </button>
            </div>

            <button className="btn-filter-toggle" onClick={handlePrint} title="Print official PDF report">
              <Printer size={15} />
              <span>Print Official Docket</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Report Table */}
      {selectedReportType === 'BUREAU' && (
        <div className="dashboard-card">
          <div className="card-heading-bar">
            <div>
              <h3 className="card-title">Bureau / Cell Performance & Disposal Velocity</h3>
              <span className="card-subtitle">AICTE Statutory Prescribed SLA: 30 Calendar Days</span>
            </div>
          </div>

          <div className="data-table-container" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bureau / Directorate</th>
                  <th>Nodal Head</th>
                  <th style={{ textAlign: 'center' }}>Total Cases</th>
                  <th style={{ textAlign: 'center' }}>Active Under Process</th>
                  <th style={{ textAlign: 'center' }}>Disposed</th>
                  <th style={{ textAlign: 'center' }}>Disposal Rate</th>
                  <th style={{ textAlign: 'center' }}>Overdue (&gt;30d)</th>
                  <th style={{ textAlign: 'center' }}>Overlap Flagged</th>
                </tr>
              </thead>
              <tbody>
                {bureauReport.map((b) => (
                  <tr key={b.code}>
                    <td>
                      <strong style={{ color: 'var(--primary-navy)' }}>{b.bureau}</strong>
                      <span className={`bureau-tag ${b.code === 'RB' ? 'bureau-tag-rb' : 'bureau-tag-pgrc'}`} style={{ marginLeft: 8 }}>
                        {b.code}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{b.head}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{b.total}</td>
                    <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{b.active}</td>
                    <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{b.disposed}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: 12, fontWeight: 700, fontSize: '0.78rem' }}>
                        {b.disposalRate}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {b.overdue > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>{b.overdue}</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>0</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {b.overlapInvolved > 0 ? (
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>{b.overlapInvolved}</span>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReportType === 'REGION' && (
        <div className="dashboard-card">
          <div className="card-heading-bar">
            <div>
              <h3 className="card-title">Regional Directorate Grievance & Compliance Load</h3>
              <span className="card-subtitle">Territorial jurisdiction across India</span>
            </div>
          </div>

          <div className="data-table-container" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>AICTE Region</th>
                  <th>Regional Office</th>
                  <th>States / UTs Covered</th>
                  <th style={{ textAlign: 'center' }}>Total Complaints</th>
                  <th style={{ textAlign: 'center' }}>Active Inquiries</th>
                  <th style={{ textAlign: 'center' }}>Disposed</th>
                  <th style={{ textAlign: 'center' }}>SLA Compliance</th>
                </tr>
              </thead>
              <tbody>
                {regionReport.map((r) => (
                  <tr key={r.region}>
                    <td>
                      <strong style={{ color: 'var(--primary-navy)' }}>{r.region}</strong>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{r.office}</td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.states}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.total}</td>
                    <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{r.active}</td>
                    <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{r.disposed}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: 12, fontWeight: 700, fontSize: '0.78rem' }}>
                        {r.disposalRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReportType === 'OVERLAP' && (
        <div className="dashboard-card">
          <div className="card-heading-bar">
            <div>
              <h3 className="card-title">Cross-Bureau Overlap Incidence Audit Report</h3>
              <span className="card-subtitle">Institutions identified with simultaneous parallel inquiries</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {overlapClusters.map((cluster) => (
              <div
                key={cluster.institutionPermanentId}
                style={{
                  border: '1px solid #fecdd3',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  background: '#fff9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#9f1239' }}>{cluster.institutionName}</strong>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginLeft: 8, color: '#64748b' }}>
                      (AICTE ID: {cluster.institutionPermanentId})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#ffe4e6', color: '#be123c', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    {cluster.conflictLevel} CONFLICT LEVEL
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: 10 }}>
                  <strong>Bureaus Handling Concurrently:</strong> {cluster.bureaus.join(', ')} • <strong>Region:</strong> {cluster.region}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239', marginBottom: 6 }}>
                    Parallel Docket References:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {cluster.cases.map(c => (
                      <div key={c.caseId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span>
                          <strong style={{ color: c.bureau === 'RB' ? '#1d4ed8' : '#b45309' }}>[{c.bureau}]</strong> {c.caseId}: {c.category}
                        </span>
                        <span style={{ color: '#64748b' }}>Assigned: {c.assignedOfficer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
