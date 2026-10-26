import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  Eye,
  GitMerge,
  ArrowUpDown,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Plus
} from 'lucide-react';
import { BUREAUS, REGIONS, STATUS_TYPES } from '../data/mockData';

export default function CaseTrackingTable({
  cases,
  onSelectCase,
  onOpenCoordination,
  onOpenNewCaseModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureau, setSelectedBureau] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [onlyOverlaps, setOnlyOverlaps] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [sortField, setSortField] = useState('dateOfReceipt');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and Search Logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Text Search matching Case ID, Institution Name, Permanent ID, Category, Complainant
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesId = (c.caseId || '').toLowerCase().includes(query);
        const matchesName = (c.institutionName || '').toLowerCase().includes(query);
        const matchesPermId = (c.institutionPermanentId || '').toLowerCase().includes(query);
        const matchesCat = (c.category || '').toLowerCase().includes(query);
        const matchesOfficer = (c.assignedOfficer || '').toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesPermId && !matchesCat && !matchesOfficer) {
          return false;
        }
      }

      // 2. Bureau Filter
      if (selectedBureau !== 'ALL' && c.bureau !== selectedBureau) {
        return false;
      }

      // 3. Region Filter
      if (selectedRegion !== 'ALL' && c.region !== selectedRegion) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }

      // 5. Overlap Only Filter
      if (onlyOverlaps && !c.overlapDetected) {
        return false;
      }

      // 6. Overdue Only Filter
      if (onlyOverdue && (!c.isOverdue || c.status === 'DISPOSED')) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [cases, searchTerm, selectedBureau, selectedRegion, selectedStatus, onlyOverlaps, onlyOverdue, sortField, sortAsc]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    const headers = [
      'Case ID',
      'AICTE Permanent ID',
      'Institution Name',
      'Region',
      'Bureau',
      'Category',
      'Complainant',
      'Date of Receipt',
      'Status',
      'Assigned Officer',
      'Expected Disposal (SLA)',
      'Overdue Flag',
      'Overlap Flag',
      'Last Action Taken',
      'Next Action Required'
    ];

    const rows = filteredCases.map(c => [
      `"${c.caseId}"`,
      `"${c.institutionPermanentId}"`,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      `"${c.region}"`,
      `"${c.bureau}"`,
      `"${c.category}"`,
      `"${c.complainantName}"`,
      `"${c.dateOfReceipt}"`,
      `"${c.status}"`,
      `"${c.assignedOfficer}"`,
      `"${c.expectedDisposalDate}"`,
      `"${c.isOverdue ? 'YES' : 'NO'}"`,
      `"${c.overlapDetected ? 'YES' : 'NO'}"`,
      `"${(c.lastActionTaken || '').replace(/"/g, '""')}"`,
      `"${(c.nextActionRequired || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getBureauTagClass = (bureau) => {
    switch (bureau) {
      case 'RB': return 'bureau-tag-rb';
      case 'PGRC': return 'bureau-tag-pgrc';
      case 'AB': return 'bureau-tag-ab';
      case 'VC': return 'bureau-tag-vc';
      default: return 'bureau-tag-rb';
    }
  };

  const getStatusBadge = (statusId) => {
    const meta = STATUS_TYPES.find(s => s.id === statusId) || { label: statusId, color: '#475569', bg: '#f1f5f9' };
    return (
      <span
        className="status-pill"
        style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30` }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
        {meta.label}
      </span>
    );
  };

  return (
    <div className="case-tracking-view">
      {/* 1. Filter and Control Bar */}
      <div className="table-controls-panel">
        <div className="controls-top-row">
          {/* Universal Search Bar */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Institution, AICTE ID (1-XXXX), Case ID, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-filter-toggle" onClick={exportToCSV} title="Export filtered records to CSV">
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button
              className="btn-filter-toggle"
              style={{ background: 'var(--primary-navy)', color: '#ffffff', borderColor: 'var(--primary-navy)' }}
              onClick={onOpenNewCaseModal}
            >
              <Plus size={15} />
              <span>New Case</span>
            </button>
          </div>
        </div>

        {/* Multi-parameter Filters */}
        <div className="filter-pills-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          {/* Bureau Filter */}
          <select
            className="filter-select"
            value={selectedBureau}
            onChange={(e) => setSelectedBureau(e.target.value)}
          >
            <option value="ALL">All Bureaus / Cells</option>
            {BUREAUS.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.shortName})</option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            className="filter-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="ALL">All AICTE Regions</option>
            {REGIONS.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Case Statuses</option>
            {STATUS_TYPES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Overlap Filter Toggle */}
          <button
            className={`btn-filter-toggle ${onlyOverlaps ? 'active' : ''}`}
            onClick={() => setOnlyOverlaps(!onlyOverlaps)}
            style={onlyOverlaps ? { background: '#fff1f2', color: '#e11d48', borderColor: '#fca5a5' } : {}}
          >
            <AlertCircle size={14} />
            <span>Overlapping Cases Only</span>
          </button>

          {/* Overdue SLA Filter Toggle */}
          <button
            className={`btn-filter-toggle ${onlyOverdue ? 'active' : ''}`}
            onClick={() => setOnlyOverdue(!onlyOverdue)}
            style={onlyOverdue ? { background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' } : {}}
          >
            <Clock size={14} />
            <span>SLA Overdue (&gt;30d)</span>
          </button>

          {(searchTerm || selectedBureau !== 'ALL' || selectedRegion !== 'ALL' || selectedStatus !== 'ALL' || onlyOverlaps || onlyOverdue) && (
            <button
              className="btn-filter-toggle"
              style={{ color: '#ef4444' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedBureau('ALL');
                setSelectedRegion('ALL');
                setSelectedStatus('ALL');
                setOnlyOverlaps(false);
                setOnlyOverdue(false);
              }}
            >
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> registered cases
          </div>
        </div>
      </div>

      {/* 2. Master Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('caseId')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Case ID</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Institution & AICTE ID</th>
              <th>Bureau / Cell</th>
              <th>Category & Details</th>
              <th onClick={() => toggleSort('dateOfReceipt')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Date Received</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Current Status</th>
              <th>SLA / Expected Date</th>
              <th>Assigned Officer</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 10px', display: 'block', color: '#94a3b8' }} />
                  <strong>No complaint cases match the selected filter criteria.</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                    Try broadening your search query or resetting filters.
                  </div>
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr
                  key={c.caseId}
                  className={c.overlapDetected ? 'row-overlap-highlight' : ''}
                >
                  {/* Case ID & Overlap Badge */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className="case-id-badge">{c.caseId}</span>
                      {c.overlapDetected && (
                        <span className="overlap-flag-indicator" title="Active parallel complaint in another bureau">
                          <AlertCircle size={10} />
                          Overlap Alert
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Institution Name & Permanent ID */}
                  <td>
                    <div style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)', lineHeight: 1.3 }}>
                        {c.institutionName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          ID: {c.institutionPermanentId}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          • {c.region}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Bureau Tag */}
                  <td>
                    <span className={`bureau-tag ${getBureauTagClass(c.bureau)}`}>
                      {c.bureau}
                    </span>
                  </td>

                  {/* Category & Description Snippet */}
                  <td>
                    <div style={{ maxWidth: 300 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {c.category}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        By: {c.complainantName}
                      </div>
                    </div>
                  </td>

                  {/* Date Received */}
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} color="#94a3b8" />
                      {c.dateOfReceipt}
                    </div>
                  </td>

                  {/* Status Pill */}
                  <td>{getStatusBadge(c.status)}</td>

                  {/* SLA / Target Date */}
                  <td>
                    <div className={`sla-countdown ${c.isOverdue && c.status !== 'DISPOSED' ? 'breached' : 'normal'}`}>
                      <Clock size={13} />
                      <span>{c.expectedDisposalDate}</span>
                      {c.isOverdue && c.status !== 'DISPOSED' && (
                        <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                          BREACHED
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Officer */}
                  <td>
                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <User size={13} color="#94a3b8" />
                      <span>{c.assignedOfficer}</span>
                    </div>
                  </td>

                  {/* Action Tools */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn-table-action"
                        onClick={() => onSelectCase(c)}
                        title="View Full Case Dossier & Cryptographic Audit Log"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>

                      {c.overlapDetected && (
                        <button
                          className="btn-table-action"
                          style={{ borderColor: '#fca5a5', color: '#e11d48', background: '#fff1f2' }}
                          onClick={() => onOpenCoordination(c.institutionPermanentId)}
                          title="Open Inter-Bureau Coordination Workspace"
                        >
                          <GitMerge size={14} />
                          <span>Coordinate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
