import React from 'react';
import { Shield, ShieldAlert, PlusCircle, CheckCircle2, UserCheck, Bell, Building2, FileCheck } from 'lucide-react';
import { USER_ROLES } from '../data/mockData';

export default function Header({
  currentRole,
  onRoleChange,
  onOpenNewCaseModal,
  onOpenSecurityModal,
  overlapCount,
  activeCasesCount
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand & Gov Emblem */}
        <div className="brand-section">
          <div className="aicte-emblem-badge" title="All India Council for Technical Education">
            <Building2 size={28} />
          </div>
          <div className="brand-titles">
            <span className="brand-subtitle">
              All India Council for Technical Education • MoE, Govt. of India
            </span>
            <h1 className="brand-main-title">
              AICTE<span className="brand-highlight">-SETU</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#cbd5e1', marginLeft: 8 }}>
                Integrated Complaint Monitoring & Cross-Bureau Redressal Dashboard
              </span>
            </h1>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="header-actions">
          {/* Role-Based Access Control Switcher */}
          <div className="role-switcher-card">
            <UserCheck size={16} color="#fbbf24" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="role-label">Active Persona (RBAC)</span>
              <select
                className="role-select"
                value={currentRole.id}
                onChange={(e) => {
                  const selected = USER_ROLES.find(r => r.id === e.target.value);
                  if (selected) onRoleChange(selected);
                }}
              >
                {USER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.scope === 'ALL_BUREAUS' ? 'Admin' : role.scope})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cryptographic SHA-256 Ledger Button */}
          <button
            className="header-btn btn-security"
            onClick={onOpenSecurityModal}
            title="Inspect SHA-256 Cryptographic Audit Ledger"
          >
            <Shield size={16} />
            <span>SHA-256 Security</span>
          </button>

          {/* Lodge New Complaint */}
          <button
            className="header-btn btn-primary"
            onClick={onOpenNewCaseModal}
          >
            <PlusCircle size={16} />
            <span>Log New Complaint</span>
          </button>
        </div>
      </div>
    </header>
  );
}
