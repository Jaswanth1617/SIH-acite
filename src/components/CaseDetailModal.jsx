import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  FileText,
  User,
  AlertTriangle,
  Upload,
  CheckCircle,
  ArrowRight,
  Send,
  Lock,
  GitBranch
} from 'lucide-react';
import { createChainedAuditHash, verifyAuditChain, computeFileHash } from '../services/cryptoService';
import { STATUS_TYPES, BUREAUS } from '../data/mockData';

export default function CaseDetailModal({
  caseItem,
  onClose,
  onAddAction,
  onUpdateStatus,
  currentRole
}) {
  const [activeTab, setActiveTab] = useState('TIMELINE'); // TIMELINE | NEW_ACTION | TRANSFER
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // New Action Form State
  const [actionTitle, setActionTitle] = useState('');
  const [actionRemarks, setActionRemarks] = useState('');
  const [newStatus, setNewStatus] = useState(caseItem.status);
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle File Upload and calculate SHA-256
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile(file);
    setIsComputingHash(true);
    try {
      const hash = await computeFileHash(file);
      setFileHash(hash);
    } catch (err) {
      console.error('File hash error:', err);
    } finally {
      setIsComputingHash(false);
    }
  };

  // Verify Audit Chain
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    const result = await verifyAuditChain(caseItem.actionHistory);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  // Submit New Action
  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!actionTitle.trim() || !actionRemarks.trim()) {
      alert('Please specify action taken and remarks.');
      return;
    }

    setIsSubmitting(true);

    const prevHash = caseItem.actionHistory && caseItem.actionHistory.length > 0
      ? caseItem.actionHistory[caseItem.actionHistory.length - 1].hash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = new Date().toISOString();
    const actionPayload = {
      caseId: caseItem.caseId,
      timestamp,
      officer: `${currentRole.name} (${currentRole.title})`,
      bureau: caseItem.bureau,
      action: actionTitle,
      remarks: actionRemarks,
      documents: attachedFile ? [{ name: attachedFile.name, size: `${(attachedFile.size / 1024).toFixed(1)} KB`, hash: fileHash }] : []
    };

    const hash = await createChainedAuditHash(prevHash, actionPayload);

    const newEntry = {
      id: `ACT-${Date.now()}`,
      ...actionPayload,
      hash
    };

    onAddAction(caseItem.caseId, newEntry, newStatus);
    setIsSubmitting(false);
    setActionTitle('');
    setActionRemarks('');
    setAttachedFile(null);
    setFileHash('');
    setActiveTab('TIMELINE');
    setVerificationResult(null);
  };

  const statusMeta = STATUS_TYPES.find(s => s.id === caseItem.status) || { label: caseItem.status, color: '#475569', bg: '#f1f5f9' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-container modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <ShieldCheck size={22} color="#fbbf24" />
            <span>Case Dossier: {caseItem.caseId}</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: statusMeta.bg,
                color: statusMeta.color,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {statusMeta.label}
            </span>
            {caseItem.overlapDetected && (
              <span className="overlap-flag-indicator" style={{ marginLeft: 8 }}>
                <AlertTriangle size={11} />
                Overlap Alert
              </span>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs in Modal */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px', background: 'var(--bg-surface-soft)' }}>
          <button
            className={`nav-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
            onClick={() => setActiveTab('TIMELINE')}
          >
            <Clock size={15} />
            <span>Action History & SHA-256 Ledger</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'NEW_ACTION' ? 'active' : ''}`}
            onClick={() => setActiveTab('NEW_ACTION')}
          >
            <FileText size={15} />
            <span>Record Official Action</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-scrollable">
          {/* Key Summary Header Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>INSTITUTION</span>
                <strong style={{ fontSize: '0.94rem', color: 'var(--primary-navy)' }}>{caseItem.institutionName}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AICTE ID: {caseItem.institutionPermanentId}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>COMPLAINT CATEGORY</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{caseItem.category}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Complainant: {caseItem.complainantName}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>HANDLING BUREAU</span>
                <strong style={{ fontSize: '0.86rem', color: '#1d4ed8' }}>{caseItem.bureau} Bureau</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Officer: {caseItem.assignedOfficer}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TIMELINES (SLA)</span>
                <div style={{ fontSize: '0.8rem', color: caseItem.isOverdue ? '#dc2626' : 'var(--text-primary)', fontWeight: 700 }}>
                  Target: {caseItem.expectedDisposalDate}
                  {caseItem.isOverdue && ' (BREACHED)'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Received: {caseItem.dateOfReceipt}</div>
              </div>
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', fontSize: '0.82rem', color: '#334155' }}>
              <strong>Allegation / Description:</strong> {caseItem.description}
            </div>
          </div>

          {activeTab === 'TIMELINE' ? (
            <div>
              {/* Cryptographic Integrity Verifier Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={20} color="#7c3aed" />
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: '#5b21b6' }}>
                      Cryptographic Audit Trail (SHA-256 Chained Block Integrity)
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>
                      Each action log mathematically seals the previous state to guarantee non-repudiation.
                    </div>
                  </div>
                </div>

                <button
                  className="btn-security"
                  style={{ background: '#7c3aed', color: '#ffffff', borderColor: '#7c3aed', padding: '6px 14px', borderRadius: 'var(--radius-sm)' }}
                  onClick={handleVerifyChain}
                  disabled={isVerifying}
                >
                  <Lock size={13} />
                  <span>{isVerifying ? 'Recalculating Hashes...' : 'Verify Cryptographic Integrity'}</span>
                </button>
              </div>

              {verificationResult && (
                <div style={{ background: verificationResult.valid ? '#ecfdf5' : '#fef2f2', border: `1px solid ${verificationResult.valid ? '#a7f3d0' : '#fecaca'}`, borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16 }}>
                  {verificationResult.valid ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', fontSize: '0.82rem', fontWeight: 700 }}>
                      <CheckCircle size={16} />
                      <span>Ledger Verified: All {verificationResult.verifiedCount} historical action blocks match exact cryptographic SHA-256 signatures. No tampering detected.</span>
                    </div>
                  ) : (
                    <div style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700 }}>
                      ⚠️ Tampering Detected at Block #{verificationResult.brokenIndex}! Cryptographic signature mismatch.
                    </div>
                  )}
                </div>
              )}

              {/* Chronological Action Timeline */}
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>
                Chronological Action History & Evidence
              </h4>

              <div className="timeline-wrapper">
                {caseItem.actionHistory && caseItem.actionHistory.map((act, index) => (
                  <div key={act.id || index} className="timeline-entry-node">
                    <div className="timeline-dot" />
                    <div className="timeline-card">
                      <div className="timeline-meta-bar">
                        <span className="timeline-officer-info">
                          {act.officer} [{act.bureau}]
                        </span>
                        <span className="timeline-timestamp">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="timeline-action-title">
                        {act.action}
                      </div>

                      <div className="timeline-remarks">
                        {act.remarks}
                      </div>

                      {/* Attached Documents */}
                      {act.documents && act.documents.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                            ATTACHED VERIFIED DOCUMENTS:
                          </span>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {act.documents.map((doc, dIdx) => (
                              <div
                                key={dIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  fontSize: '0.75rem'
                                }}
                              >
                                <FileText size={13} color="#2563eb" />
                                <span>{doc.name} ({doc.size})</span>
                                {doc.hash && (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#64748b' }}>
                                    SHA: {doc.hash.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cryptographic SHA-256 Seal for this Action */}
                      <div className="sha256-hash-badge">
                        <span>SHA-256 Digest: {act.hash || 'Not Yet Sealed'}</span>
                        <span className="hash-verified-pill">
                          <ShieldCheck size={11} />
                          Signed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Record New Action Tab */
            <form onSubmit={handleSubmitAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Action / Stage Title
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g., Show Cause Notice Issued / Explanation Received / Standing Hearing Held"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Update Case Status
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_TYPES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Official Remarks & Findings
                </label>
                <textarea
                  rows={4}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Record formal proceedings, hearing outcomes, or compliance directives..."
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  required
                />
              </div>

              {/* Document Attachment with Live Browser SHA-256 Checksum */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Attach Supporting Evidence / Official Order (with instant SHA-256 Hash computation)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.85rem' }}
                />

                {isComputingHash && (
                  <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: 6 }}>
                    Computing cryptographic SHA-256 digest in browser...
                  </div>
                )}

                {fileHash && (
                  <div className="sha256-hash-badge" style={{ marginTop: 8 }}>
                    <span>SHA-256 File Checksum: {fileHash}</span>
                    <span className="hash-verified-pill">
                      <ShieldCheck size={11} />
                      Verified
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-filter-toggle"
                  onClick={() => setActiveTab('TIMELINE')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Computing Cryptographic Seal...' : 'Sign & Record Action'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-bar">
          <div style={{ marginRight: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AICTE Digital Grievance Record • Protected under Section 10 of AICTE Act 1987
          </div>
          <button className="btn-filter-toggle" onClick={onClose}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
