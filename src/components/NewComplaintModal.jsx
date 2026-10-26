import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Building2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Calendar,
  User,
  Send,
  GitBranch
} from 'lucide-react';
import { BUREAUS, REGIONS, COMPLAINT_CATEGORIES } from '../data/mockData';
import { checkPotentialIntakeOverlap } from '../services/overlapEngine';
import { computeFileHash, sha256 } from '../services/cryptoService';

export default function NewComplaintModal({
  institutions,
  existingCases,
  preselectedInstitution,
  onClose,
  onSubmitNewCase,
  currentRole
}) {
  const [institutionPermanentId, setInstitutionPermanentId] = useState(
    preselectedInstitution ? preselectedInstitution.permanentId : ''
  );
  const [institutionName, setInstitutionName] = useState(
    preselectedInstitution ? preselectedInstitution.name : ''
  );
  const [region, setRegion] = useState(
    preselectedInstitution ? preselectedInstitution.region : REGIONS[0].name
  );
  const [bureau, setBureau] = useState(currentRole.scope !== 'ALL_BUREAUS' && currentRole.scope !== 'REGIONAL' ? currentRole.scope : 'PGRC');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [complainantName, setComplainantName] = useState('');
  const [complainantType, setComplainantType] = useState('Student / Candidate');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Overlap Pre-screening result
  const [overlapCheckResult, setOverlapCheckResult] = useState(null);

  // Run overlap check dynamically as institution or bureau changes
  useEffect(() => {
    if (institutionPermanentId || institutionName) {
      const res = checkPotentialIntakeOverlap(
        { institutionPermanentId, institutionName, bureau, category },
        existingCases,
        institutions
      );
      setOverlapCheckResult(res);
    } else {
      setOverlapCheckResult(null);
    }
  }, [institutionPermanentId, institutionName, bureau, category, existingCases, institutions]);

  // Handle Institution Preset when selecting from dropdown
  const handleSelectPredefined = (e) => {
    const permId = e.target.value;
    const inst = institutions.find(i => i.permanentId === permId);
    if (inst) {
      setInstitutionPermanentId(inst.permanentId);
      setInstitutionName(inst.name);
      setRegion(inst.region);
    }
  };

  // Handle Document Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile(file);
    setIsComputingHash(true);
    try {
      const hash = await computeFileHash(file);
      setFileHash(hash);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComputingHash(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionName.trim() || !institutionPermanentId.trim() || !complainantName.trim() || !description.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setIsSubmitting(true);

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const caseId = `AICTE-${bureau}-${year}-${randomSeq}`;
    const today = new Date().toISOString().slice(0, 10);

    // Calculate SLA target: 30 days from today
    const slaTarget = new Date();
    slaTarget.setDate(slaTarget.getDate() + 30);
    const expectedDisposalDate = slaTarget.toISOString().slice(0, 10);

    const assignedOfficer = bureau === 'RB' ? 'Dr. Rajeshwar Sharma' : bureau === 'PGRC' ? 'Smt. Ananya Sen' : bureau === 'AB' ? 'Prof. K. V. Ramanathan' : 'Shri Vikram Malhotra';

    // Initial action entry
    const actionTimestamp = new Date().toISOString();
    const actionPayload = {
      caseId,
      timestamp: actionTimestamp,
      officer: `${currentRole.name} (Intake Authority)`,
      bureau,
      action: 'Initial Complaint Lodged & Intake Verified',
      remarks: description,
      documents: attachedFile ? [{ name: attachedFile.name, size: `${(attachedFile.size / 1024).toFixed(1)} KB`, hash: fileHash }] : []
    };

    const initialHash = await sha256(JSON.stringify(actionPayload));

    const newCase = {
      caseId,
      institutionPermanentId,
      institutionName,
      region,
      bureau,
      category,
      complainantType,
      complainantName,
      dateOfReceipt: today,
      status: overlapCheckResult?.hasCrossBureauOverlap ? 'COORDINATION_REQUIRED' : 'RECEIVED',
      priority,
      assignedOfficer,
      officerDesignation: `${bureau} Assigned Nodal Officer`,
      slaDaysLimit: 30,
      expectedDisposalDate,
      isOverdue: false,
      overlapDetected: overlapCheckResult?.hasCrossBureauOverlap || false,
      linkedCaseIds: overlapCheckResult?.crossBureauMatches ? overlapCheckResult.crossBureauMatches.map(m => m.caseId) : [],
      lastActionTaken: 'Initial Complaint Lodged & Scrutiny Initiated',
      lastActionDate: today,
      nextActionRequired: overlapCheckResult?.hasCrossBureauOverlap
        ? 'Cross-Bureau Coordination with linked active bureau'
        : 'Issue preliminary clarification notice to institution',
      description,
      actionHistory: [
        {
          id: `ACT-INIT-${Date.now()}`,
          ...actionPayload,
          hash: initialHash
        }
      ]
    };

    onSubmitNewCase(newCase);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-container modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <PlusCircle size={22} color="#fbbf24" />
            <span>Lodge New Institution Complaint / Grievance</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-scrollable">
          {/* Overlap Pre-Screening Banner (Live AI Engine) */}
          {overlapCheckResult?.hasCrossBureauOverlap && (
            <div className="coordination-summary-box" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <AlertTriangle size={24} color="#e11d48" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: '0.94rem', color: '#9f1239' }}>
                      Potential Overlapping Cases – Coordination Required
                    </strong>
                    <span className="overlap-badge">Live Intake Warning</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#881337', lineHeight: 1.4 }}>
                    This institution already has <strong>{overlapCheckResult.crossBureauMatches.length} active case(s)</strong> being handled by other Bureaus:
                  </p>
                  <ul style={{ fontSize: '0.78rem', color: '#881337', marginTop: 6, paddingLeft: 18 }}>
                    {overlapCheckResult.crossBureauMatches.map(m => (
                      <li key={m.caseId}>
                        <strong>{m.bureau} Bureau</strong>: Case {m.caseId} ({m.category}) - Assigned to {m.officer}
                      </li>
                    ))}
                  </ul>
                  <div style={{ fontSize: '0.74rem', color: '#9f1239', fontWeight: 700, marginTop: 8 }}>
                    ✓ Submitting this complaint will automatically flag it for Inter-Bureau Coordination to prevent conflicting orders.
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Select from Registered Institutes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Select Registered AICTE Institution (Auto-fills ID & Region)
              </label>
              <select
                className="filter-select"
                style={{ width: '100%', padding: '10px 12px' }}
                value={institutionPermanentId}
                onChange={handleSelectPredefined}
              >
                <option value="">-- Or enter custom institution details below --</option>
                {institutions.map(inst => (
                  <option key={inst.permanentId} value={inst.permanentId}>
                    {inst.name} ({inst.permanentId}) - {inst.city}, {inst.region}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Institution Full Name *
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g. Kalinga Institute of Engineering & Technology"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  AICTE Permanent ID *
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g. 1-3324901231"
                  value={institutionPermanentId}
                  onChange={(e) => setInstitutionPermanentId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Assigning Bureau / Cell *
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={bureau}
                  onChange={(e) => setBureau(e.target.value)}
                >
                  {BUREAUS.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.shortName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  AICTE Region *
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {REGIONS.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Case Priority
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="HIGH">High (Mandatory statutory hearing)</option>
                  <option value="MEDIUM">Medium (Standard 30-day inquiry)</option>
                  <option value="LOW">Low (Routine clarification)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Grievance / Complaint Category *
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {COMPLAINT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Complainant Identity / Affiliation *
                </label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="e.g. Graduating B.Tech Students Batch 2026 / Faculty Assoc."
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Grievance Summary & Specific Allegations *
              </label>
              <textarea
                rows={3}
                className="search-input"
                style={{ resize: 'vertical' }}
                placeholder="Detail the exact violation, non-compliance with AICTE regulations, dates, and names..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Document Upload with instant browser SHA-256 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Upload Evidentiary Document (SHA-256 Hash Computed on Upload)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ fontSize: '0.85rem' }}
              />

              {isComputingHash && (
                <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: 4 }}>
                  Computing cryptographic SHA-256 digest in browser...
                </div>
              )}

              {fileHash && (
                <div className="sha256-hash-badge" style={{ marginTop: 8 }}>
                  <span>SHA-256 Document Checksum: {fileHash}</span>
                  <span className="hash-verified-pill">
                    <ShieldCheck size={11} />
                    Verified
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                * Mandatory statutory fields for AICTE Registry Intake
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-filter-toggle" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  <Send size={15} />
                  <span>{isSubmitting ? 'Registering...' : 'Submit & Register Case'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
