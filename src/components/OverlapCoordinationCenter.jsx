import React, { useState } from 'react';
import {
  GitMerge,
  AlertTriangle,
  Building2,
  Calendar,
  FileCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { sha256 } from '../services/cryptoService';

export default function OverlapCoordinationCenter({
  overlapClusters,
  selectedInstitutionId,
  onResolveCoordination,
  onSelectCase
}) {
  const [activeInstId, setActiveInstId] = useState(
    selectedInstitutionId || (overlapClusters[0] ? overlapClusters[0].institutionPermanentId : null)
  );
  const [leadBureau, setLeadBureau] = useState('RB');
  const [meetingDate, setMeetingDate] = useState('2026-11-04');
  const [coordinationNotes, setCoordinationNotes] = useState('');
  const [unifiedDirective, setUnifiedDirective] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState(null);

  const currentCluster = overlapClusters.find(c => c.institutionPermanentId === activeInstId) || overlapClusters[0];

  if (!currentCluster) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          No Active Cross-Bureau Overlaps Flagged!
        </h3>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          All technical institutions are currently being processed with single-bureau jurisdiction.
        </p>
      </div>
    );
  }

  // Find cases for RB and PGRC (or other bureaus)
  const rbCases = currentCluster.cases.filter(c => c.bureau === 'RB');
  const pgrcCases = currentCluster.cases.filter(c => c.bureau === 'PGRC');
  const otherCases = currentCluster.cases.filter(c => c.bureau !== 'RB' && c.bureau !== 'PGRC');

  const handleExecuteCoordination = async () => {
    if (!coordinationNotes.trim()) {
      alert('Please enter coordination remarks or joint resolution terms before signing.');
      return;
    }

    setIsSubmitting(true);

    // Compute cryptographic SHA-256 seal for the joint resolution directive
    const jointDirectiveText = `AICTE-JOINT-COORDINATION-RESOLUTION | Institution: ${currentCluster.institutionPermanentId} | Lead Bureau: ${leadBureau} | Joint Hearing: ${meetingDate} | Notes: ${coordinationNotes} | Timestamp: ${new Date().toISOString()}`;
    const hash = await sha256(jointDirectiveText);

    // Call parent handler to update state
    onResolveCoordination({
      institutionPermanentId: currentCluster.institutionPermanentId,
      leadBureau,
      meetingDate,
      notes: coordinationNotes,
      directive: unifiedDirective || 'Unified Show-Cause Notice & Consolidated Fact-Finding Directives issued to avoid conflicting sanctions.',
      sha256Hash: hash,
      timestamp: new Date().toISOString()
    });

    setIsSubmitting(false);
    setResolutionSuccess({
      hash,
      leadBureau,
      meetingDate
    });
  };

  return (
    <div className="coordination-center-view">
      {/* 1. Header & Institution Selector Tabs */}
      <div className="glass-panel" style={{ padding: 20, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="overlap-badge" style={{ background: '#e11d48' }}>
                AICTE Inter-Bureau Desk
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Cross-Bureau Overlap & Conflict Coordination Hub
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Resolving simultaneous inquiries across <strong>Regulation Bureau (RB)</strong> and <strong>PGRC</strong> to maintain single-window regulatory coherence.
            </p>
          </div>

          {/* Institution Selector Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {overlapClusters.map((cluster) => (
              <button
                key={cluster.institutionPermanentId}
                className={`btn-filter-toggle ${cluster.institutionPermanentId === activeInstId ? 'active' : ''}`}
                style={
                  cluster.institutionPermanentId === activeInstId
                    ? { background: 'var(--primary-navy)', color: '#ffffff', borderColor: 'var(--primary-navy)' }
                    : {}
                }
                onClick={() => {
                  setActiveInstId(cluster.institutionPermanentId);
                  setResolutionSuccess(null);
                }}
              >
                <Building2 size={14} />
                <span>{cluster.institutionName.split(' ')[0]} ({cluster.institutionPermanentId.slice(-4)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Overlap Assessment Notice Card */}
      <div className="coordination-summary-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <AlertTriangle size={28} color="#e11d48" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9f1239' }}>
                  Potential Overlapping Cases – Coordination Required
                </h3>
                <span style={{ fontSize: '0.72rem', background: '#ffe4e6', color: '#be123c', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  CONFLICT LEVEL: {currentCluster.conflictLevel}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#881337', lineHeight: 1.5 }}>
                Institution <strong>{currentCluster.institutionName}</strong> (AICTE Permanent ID: <code>{currentCluster.institutionPermanentId}</code>) is concurrently active in <strong>{currentCluster.activeBureaus.join(' and ')}</strong>.
                AI-assisted pattern matching indicates an underlying institutional breakdown spanning governance and student financial grievance.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: '0.76rem', background: '#ffffff', border: '1px solid #fecdd3', padding: '4px 10px', borderRadius: 4, color: '#9f1239', fontWeight: 600 }}>
                  Recommendation: {currentCluster.recommendation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side Parallel Cases Comparator */}
      <div className="coordination-grid">
        {/* Left Pane: Regulation Bureau (RB) Case */}
        <div className="coordination-case-pane pane-rb">
          <div className="pane-header">
            <div>
              <span className="bureau-tag bureau-tag-rb" style={{ fontSize: '0.78rem' }}>
                REGULATION BUREAU (RB) DOCKET
              </span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: 4 }}>
                Regulatory Compliance & Sanctions
              </h4>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '3px 8px', borderRadius: 4 }}>
              {rbCases.length} Active Case(s)
            </span>
          </div>

          {rbCases.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active cases in Regulation Bureau.</p>
          ) : (
            rbCases.map((c) => (
              <div key={c.caseId} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="case-id-badge">{c.caseId}</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Recv: {c.dateOfReceipt}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e3a8a', marginBottom: 6 }}>
                  {c.category}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', marginBottom: 10, lineHeight: 1.4 }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#eff6ff', padding: 8, borderRadius: 6, border: '1px solid #bfdbfe' }}>
                  <strong>Last Action Taken:</strong> {c.lastActionTaken} ({c.lastActionDate})
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    className="btn-table-action"
                    onClick={() => onSelectCase(c)}
                  >
                    View RB Timeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Public Grievance Redressal Cell (PGRC) Case */}
        <div className="coordination-case-pane pane-pgrc">
          <div className="pane-header">
            <div>
              <span className="bureau-tag bureau-tag-pgrc" style={{ fontSize: '0.78rem' }}>
                PGRC GRIEVANCE DOCKET
              </span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: 4 }}>
                Stakeholder & Student Restitution
              </h4>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309', background: '#fffbeb', padding: '3px 8px', borderRadius: 4 }}>
              {pgrcCases.length} Active Case(s)
            </span>
          </div>

          {pgrcCases.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active cases in PGRC.</p>
          ) : (
            pgrcCases.map((c) => (
              <div key={c.caseId} style={{ background: '#fffdfa', border: '1px solid #fde68a', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="case-id-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {c.caseId}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Recv: {c.dateOfReceipt}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e', marginBottom: 6 }}>
                  {c.category}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', marginBottom: 10, lineHeight: 1.4 }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#92400e', background: '#fffbeb', padding: 8, borderRadius: 6, border: '1px solid #fde68a' }}>
                  <strong>Last Action Taken:</strong> {c.lastActionTaken} ({c.lastActionDate})
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    className="btn-table-action"
                    onClick={() => onSelectCase(c)}
                  >
                    View PGRC Timeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Joint Resolution & Alignment Workspace */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
          <Sparkles size={20} color="#7c3aed" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Execute Inter-Bureau Alignment & Joint Directive
          </h3>
        </div>

        {resolutionSuccess ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#065f46', fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>
              <CheckCircle size={20} color="#059669" />
              <span>Inter-Bureau Coordination Executed & Sealed!</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#047857', marginBottom: 14 }}>
              The joint directive has been successfully communicated to both <strong>Regulation Bureau</strong> and <strong>PGRC</strong>. Parallel action has been unified under Lead Bureau: <strong>{resolutionSuccess.leadBureau}</strong>.
            </p>
            <div className="sha256-hash-badge">
              <span>SHA-256 Seal: {resolutionSuccess.hash}</span>
              <span className="hash-verified-pill">
                <ShieldCheck size={12} />
                Cryptographically Signed
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Select Lead Bureau */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Designate Primary Lead Bureau
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={leadBureau}
                  onChange={(e) => setLeadBureau(e.target.value)}
                >
                  <option value="RB">Regulation Bureau (RB) - Lead for Regulatory & Administrative Sanctions</option>
                  <option value="PGRC">Public Grievance Redressal Cell (PGRC) - Lead for Restitution & Fee Refunds</option>
                  <option value="JOINT_COMMITTEE">Joint AICTE Standing Committee (RB + PGRC Combined Bench)</option>
                </select>
              </div>

              {/* Schedule Joint Hearing */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Joint Coordination Hearing Date
                </label>
                <input
                  type="date"
                  className="search-input"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
            </div>

            {/* Coordination Minutes & Directives */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Joint Coordination Minutes & Consolidated Redressal Terms
              </label>
              <textarea
                rows={3}
                className="search-input"
                style={{ resize: 'vertical' }}
                placeholder="Enter alignment decision: e.g. 'Both bureaus will issue a combined notice through RB giving 15 days to deposit faculty arrears and release student original certificates, preventing multiple conflicting appearances.'"
                value={coordinationNotes}
                onChange={(e) => setCoordinationNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#059669" />
                <span>Signing this joint directive logs an immutable SHA-256 seal across all linked bureau dockets.</span>
              </div>

              <button
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px' }}
                onClick={handleExecuteCoordination}
                disabled={isSubmitting}
              >
                <GitMerge size={16} />
                <span>{isSubmitting ? 'Signing...' : 'Seal & Harmonize Directives'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
