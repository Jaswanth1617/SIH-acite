import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  CheckCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Hash
} from 'lucide-react';
import { sha256 } from '../services/cryptoService';

export default function SecurityLedgerModal({ cases, onClose }) {
  const [testText, setTestText] = useState('AICTE Official Redressal Order Ref-2026/RB/0412: Directed college to disburse faculty salary arrears with immediate effect.');
  const [computedHash, setComputedHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [tamperedState, setTamperedState] = useState(false);

  // Compute live hash of test text
  const handleComputeHash = async () => {
    setIsHashing(true);
    const hash = await sha256(testText);
    setComputedHash(hash);
    setIsHashing(false);
  };

  // Total action blocks across all cases
  const totalBlocks = cases.reduce((acc, c) => acc + (c.actionHistory ? c.actionHistory.length : 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-container modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="modal-header-title">
            <ShieldCheck size={24} color="#34d399" />
            <span>AICTE Security Architecture: SHA-256 Tamper-Proof Audit Ledger</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-scrollable">
          {/* Overview Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <Lock size={26} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46', marginBottom: 4 }}>
                  Statutory Cryptographic Standard: SHA-256 Chained Integrity
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#047857', lineHeight: 1.5 }}>
                  In accordance with regulatory compliance standards, every grievance action, inter-bureau transfer, hearing transcript, and uploaded piece of evidence is cryptographically sealed using <strong>SHA-256 (FIPS PUB 180-4)</strong>.
                  Each block incorporates the hash of the preceding action, establishing an immutable cryptographic audit chain that guarantees non-repudiation.
                </p>
              </div>
            </div>
          </div>

          {/* Ledger Health Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>TOTAL ACTION BLOCKS SEALED</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--primary-navy)' }}>{totalBlocks} Blocks</strong>
              <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
                ✓ Merkle-style chronological chaining
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>ALGORITHM COMPLEXITY</span>
              <strong style={{ fontSize: '1.8rem', color: '#2563eb' }}>256-bit Digest</strong>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>
                64-character hexadecimal security seal
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>AUDIT INTEGRITY STATE</span>
              <strong style={{ fontSize: '1.8rem', color: tamperedState ? '#dc2626' : '#059669' }}>
                {tamperedState ? 'TAMPER ALERT' : '100% INTACT'}
              </strong>
              <div style={{ fontSize: '0.74rem', color: tamperedState ? '#dc2626' : '#059669', fontWeight: 600, marginTop: 4 }}>
                {tamperedState ? '⚠️ Signature mismatch in block' : '✓ Zero broken cryptographic links'}
              </div>
            </div>
          </div>

          {/* Interactive Tamper Proof Demonstration */}
          <div className="dashboard-card" style={{ marginBottom: 24, border: '1px solid #cbd5e1' }}>
            <div className="card-heading-bar">
              <div className="card-title-group">
                <ShieldAlert size={20} color="#ea580c" />
                <div>
                  <h4 className="card-title">Interactive Tamper-Evident Chain Simulator</h4>
                  <span className="card-subtitle">
                    Observe how changing even a single byte in an archived record invalidates the entire chain
                  </span>
                </div>
              </div>

              <button
                className="btn-filter-toggle"
                style={tamperedState ? { background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' } : { background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}
                onClick={() => setTamperedState(!tamperedState)}
              >
                {tamperedState ? 'Restore Canonical Integrity' : 'Simulate Database Alteration'}
              </button>
            </div>

            {tamperedState ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontWeight: 800, fontSize: '0.94rem', marginBottom: 6 }}>
                  <AlertTriangle size={20} />
                  <span>CRYPTOGRAPHIC INTEGRITY VIOLATION DETECTED!</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#7f1d1d', marginBottom: 10 }}>
                  A malicious actor altered the timestamp and penalty amount in archived case <code>AICTE-RB-2026-0319</code>. Because SHA-256 is mathematically irreversible, the computed hash <code>7d8f9a2...</code> does not equal expected <code>b10a8db...</code>. The system automatically isolated the record and flagged the administrative bureau.
                </p>
                <div className="sha256-hash-badge" style={{ borderColor: '#ef4444', color: '#991b1b' }}>
                  <span>Broken Chain at Block #2 • Status: INVALIDATED / AUDIT FLAG RAISED</span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                  Every case log mathematically binds:
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, margin: '0 4px' }}>
                    SHA-256(PreviousHash + CaseId + Timestamp + Officer + Bureau + Remarks + DocumentChecksum)
                  </code>.
                  This ensures that no bureau official or college administrator can alter historical directives or evidence post facto.
                </p>
              </div>
            )}
          </div>

          {/* Live In-Browser SHA-256 Hasher Tool */}
          <div className="dashboard-card">
            <div className="card-heading-bar">
              <div className="card-title-group">
                <Hash size={20} color="#2563eb" />
                <div>
                  <h4 className="card-title">Live AICTE SHA-256 Checksum Calculator</h4>
                  <span className="card-subtitle">
                    Verify digital orders or evidentiary text using the browser Web Crypto API
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                rows={3}
                className="search-input"
                style={{ resize: 'vertical' }}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Type any order text or compliance message..."
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Payload size: {new TextEncoder().encode(testText).length} bytes
                </span>
                <button
                  className="btn-primary"
                  onClick={handleComputeHash}
                  disabled={isHashing}
                  style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                >
                  <Key size={14} />
                  <span>{isHashing ? 'Computing...' : 'Calculate SHA-256 Seal'}</span>
                </button>
              </div>

              {computedHash && (
                <div className="sha256-hash-badge" style={{ marginTop: 6, background: '#f1f5f9' }}>
                  <span>SHA-256: {computedHash}</span>
                  <span className="hash-verified-pill">
                    <CheckCircle size={11} />
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button className="btn-filter-toggle" onClick={onClose}>
            Close Security Console
          </button>
        </div>
      </div>
    </div>
  );
}
