import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Phone,
  Award,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  GitMerge,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { STATUS_TYPES } from '../data/mockData';

export default function InstitutionProfileView({
  institutions,
  cases,
  onSelectCase,
  onOpenCoordination,
  onOpenNewCaseWithInstitution
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.permanentId || '');

  // Filter institutions based on search query
  const filteredInstitutions = institutions.filter(inst => {
    const q = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.permanentId.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.region.toLowerCase().includes(q)
    );
  });

  const currentInstitution = institutions.find(i => i.permanentId === selectedInstId) || institutions[0];

  // Get all cases associated with this institution
  const institutionCases = cases.filter(c => c.institutionPermanentId === currentInstitution?.permanentId);

  // Group cases by Bureau to visualize multi-bureau footprint
  const casesByBureau = {
    RB: institutionCases.filter(c => c.bureau === 'RB'),
    PGRC: institutionCases.filter(c => c.bureau === 'PGRC'),
    AB: institutionCases.filter(c => c.bureau === 'AB'),
    VC: institutionCases.filter(c => c.bureau === 'VC')
  };

  const hasOverlap = Object.values(casesByBureau).filter(list => list.length > 0).length > 1;

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { label: 'CRITICAL OVERLAP RISK', bg: '#ffe4e6', color: '#be123c', border: '#fecdd3' };
      case 'HIGH':
        return { label: 'HIGH RISK', bg: '#fff1f2', color: '#e11d48', border: '#fca5a5' };
      case 'MODERATE':
        return { label: 'MODERATE RISK', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      default:
        return { label: 'LOW RISK / COMPLIANT', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
  };

  const riskBadge = getRiskBadge(currentInstitution?.riskLevel);

  return (
    <div className="institution-profile-view">
      {/* 1. Institution Selector & Quick Search */}
      <div className="glass-panel" style={{ padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              Select Institution by Name, City or AICTE Permanent ID
            </label>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search across all approved technical institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', maxWidth: 800 }}>
            {filteredInstitutions.slice(0, 5).map(inst => (
              <button
                key={inst.permanentId}
                className={`btn-filter-toggle ${inst.permanentId === selectedInstId ? 'active' : ''}`}
                style={
                  inst.permanentId === selectedInstId
                    ? { background: 'var(--primary-navy)', color: '#ffffff', borderColor: 'var(--primary-navy)' }
                    : {}
                }
                onClick={() => setSelectedInstId(inst.permanentId)}
              >
                <Building2 size={13} />
                <span>{inst.name.split(' ')[0]} ({inst.permanentId.slice(-4)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentInstitution && (
        <>
          {/* 2. Centralized Profile Header Dossier Card */}
          <div className="dashboard-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    background: '#eff6ff',
                    border: '2px solid #bfdbfe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={32} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: '#e2e8f0',
                        color: 'var(--primary-navy)',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}
                    >
                      AICTE PERMANENT ID: {currentInstitution.permanentId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        background: riskBadge.bg,
                        color: riskBadge.color,
                        border: `1px solid ${riskBadge.border}`,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {riskBadge.label}
                    </span>
                    {hasOverlap && (
                      <span className="overlap-flag-indicator">
                        <AlertTriangle size={11} />
                        Active Cross-Bureau Overlap
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: 6 }}>
                    {currentInstitution.name}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="#64748b" />
                      <span>{currentInstitution.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={14} color="#f59e0b" />
                      <span>{currentInstitution.accreditation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Institution */}
              <div style={{ display: 'flex', gap: 10 }}>
                {hasOverlap && (
                  <button
                    className="btn-resolve-overlap"
                    onClick={() => onOpenCoordination(currentInstitution.permanentId)}
                  >
                    <GitMerge size={15} />
                    <span>Open Inter-Bureau Coordination</span>
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => onOpenNewCaseWithInstitution(currentInstitution)}
                >
                  <FileText size={15} />
                  <span>Log Complaint on this Institute</span>
                </button>
              </div>
            </div>

            {/* Quick Metadata Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-light)',
                fontSize: '0.8rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>INSTITUTION TYPE</span>
                <strong>{currentInstitution.type}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>AICTE REGION</span>
                <strong>{currentInstitution.region}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SANCTIONED INTAKE</span>
                <strong>{currentInstitution.approvedIntake} Seats</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>HEAD OF INSTITUTION</span>
                <strong>{currentInstitution.principalName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>CONTACT EMAIL</span>
                <strong>{currentInstitution.email}</strong>
              </div>
            </div>
          </div>

          {/* 3. Multi-Bureau Cross-Footprint Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {['RB', 'PGRC', 'AB', 'VC'].map((bureauCode) => {
              const list = casesByBureau[bureauCode] || [];
              const bureauName = bureauCode === 'RB' ? 'Regulation Bureau' : bureauCode === 'PGRC' ? 'PGRC Cell' : bureauCode === 'AB' ? 'Approval Bureau' : 'Vigilance Cell';
              return (
                <div
                  key={bureauCode}
                  style={{
                    background: list.length > 0 ? (bureauCode === 'RB' ? '#eff6ff' : bureauCode === 'PGRC' ? '#fffbeb' : '#f0fdf4') : '#ffffff',
                    border: `1px solid ${list.length > 0 ? (bureauCode === 'RB' ? '#bfdbfe' : bureauCode === 'PGRC' ? '#fde68a' : '#bbf7d0') : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 14
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-navy)' }}>
                      {bureauName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: list.length > 0 ? 'var(--primary-navy)' : '#e2e8f0',
                        color: list.length > 0 ? '#ffffff' : '#64748b'
                      }}
                    >
                      {list.length} Case(s)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {list.length > 0 ? `${list.filter(c => c.status !== 'DISPOSED').length} Active inquiries` : 'No complaints recorded'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Consolidated History of Complaints & Grievances across all Bureaus */}
          <div className="dashboard-card">
            <div className="card-heading-bar">
              <div className="card-title-group">
                <Layers size={20} color="#2563eb" />
                <div>
                  <h3 className="card-title">Consolidated Case Dossier (Single-Window History)</h3>
                  <span className="card-subtitle">
                    Complete chronological history of all regulatory and grievance proceedings for {currentInstitution.name}
                  </span>
                </div>
              </div>
            </div>

            {institutionCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px', display: 'block' }} />
                <strong>Clean Institutional Record: No complaints logged against this institute.</strong>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {institutionCases.map((c) => (
                  <div
                    key={c.caseId}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      background: c.overlapDetected ? '#fffbfb' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="case-id-badge">{c.caseId}</span>
                        <span className={`bureau-tag ${c.bureau === 'RB' ? 'bureau-tag-rb' : 'bureau-tag-pgrc'}`}>
                          {c.bureau}
                        </span>
                        {c.overlapDetected && (
                          <span className="overlap-flag-indicator">
                            <AlertTriangle size={10} />
                            Parallel Case Active
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} />
                          Received: {c.dateOfReceipt}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} />
                          Target: {c.expectedDisposalDate}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 4 }}>
                        {c.category}
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {c.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <strong>Last Action:</strong> {c.lastActionTaken} ({c.lastActionDate})
                      </div>
                      <button
                        className="btn-table-action"
                        onClick={() => onSelectCase(c)}
                      >
                        <Eye size={13} />
                        <span>View Timeline & Audit Hash</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
