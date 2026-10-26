import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import OverlapAlertBanner from './components/OverlapAlertBanner';
import DashboardOverview from './components/DashboardOverview';
import CaseTrackingTable from './components/CaseTrackingTable';
import InstitutionProfileView from './components/InstitutionProfileView';
import OverlapCoordinationCenter from './components/OverlapCoordinationCenter';
import CaseDetailModal from './components/CaseDetailModal';
import NewComplaintModal from './components/NewComplaintModal';
import SecurityLedgerModal from './components/SecurityLedgerModal';
import ReportsAnalyticsView from './components/ReportsAnalyticsView';

import {
  INITIAL_CASES,
  INITIAL_INSTITUTIONS,
  USER_ROLES,
  BUREAUS
} from './data/mockData';
import { detectAllOverlaps } from './services/overlapEngine';

import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  GitMerge,
  BarChart3,
  Shield,
  Bell
} from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [institutions, setInstitutions] = useState(INITIAL_INSTITUTIONS);
  const [currentRole, setCurrentRole] = useState(USER_ROLES[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | cases | institutions | overlap | reports

  // Modal States
  const [selectedCaseForModal, setSelectedCaseForModal] = useState(null);
  const [selectedInstitutionForCoordination, setSelectedInstitutionForCoordination] = useState(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [preselectedInstForNewCase, setPreselectedInstForNewCase] = useState(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Compute Overlaps in Real Time
  const overlapClusters = useMemo(() => {
    return detectAllOverlaps(cases, institutions);
  }, [cases, institutions]);

  // Toast Notification Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add Action to Case
  const handleAddAction = (caseId, actionEntry, newStatus) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.caseId === caseId) {
          const updatedHistory = [...(c.actionHistory || []), actionEntry];
          const isDisposed = newStatus === 'DISPOSED';
          return {
            ...c,
            status: newStatus,
            lastActionTaken: actionEntry.action,
            lastActionDate: actionEntry.timestamp.slice(0, 10),
            isOverdue: isDisposed ? false : c.isOverdue,
            actionHistory: updatedHistory
          };
        }
        return c;
      })
    );

    // Update modal if currently inspecting this case
    if (selectedCaseForModal && selectedCaseForModal.caseId === caseId) {
      setSelectedCaseForModal((prev) => ({
        ...prev,
        status: newStatus,
        lastActionTaken: actionEntry.action,
        lastActionDate: actionEntry.timestamp.slice(0, 10),
        actionHistory: [...(prev.actionHistory || []), actionEntry]
      }));
    }

    showToast(`Official action logged on ${caseId} with verified SHA-256 seal.`);
  };

  // Joint Coordination Resolution
  const handleResolveCoordination = ({
    institutionPermanentId,
    leadBureau,
    meetingDate,
    notes,
    directive,
    sha256Hash,
    timestamp
  }) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.institutionPermanentId === institutionPermanentId && c.status !== 'DISPOSED') {
          const coordAction = {
            id: `ACT-COORD-${Date.now()}`,
            timestamp,
            officer: `${currentRole.name} (Inter-Bureau Bench)`,
            bureau: 'RB-PGRC Joint',
            action: `Inter-Bureau Alignment Executed (Lead: ${leadBureau})`,
            remarks: `Directives Harmonized: ${notes}. Joint Hearing set for ${meetingDate}.`,
            hash: sha256Hash,
            documents: []
          };

          return {
            ...c,
            status: 'HEARING_SCHEDULED',
            assignedOfficer: `${c.assignedOfficer} (Coordinated with ${leadBureau})`,
            lastActionTaken: `Inter-Bureau Alignment with Lead Bureau: ${leadBureau}`,
            lastActionDate: timestamp.slice(0, 10),
            nextActionRequired: `Joint Standing Hearing on ${meetingDate}`,
            actionHistory: [...(c.actionHistory || []), coordAction]
          };
        }
        return c;
      })
    );

    showToast(`Inter-bureau overlap coordinated for ${institutionPermanentId}. Joint directives harmonized under Lead Bureau: ${leadBureau}!`);
  };

  // Submit New Case
  const handleSubmitNewCase = (newCase) => {
    setCases((prev) => [newCase, ...prev]);

    // Check if institution already exists, otherwise add to institutions list
    const existing = institutions.find(i => i.permanentId === newCase.institutionPermanentId);
    if (!existing) {
      const newInst = {
        permanentId: newCase.institutionPermanentId,
        name: newCase.institutionName,
        region: newCase.region,
        city: 'New Delhi',
        address: 'AICTE Registered Address',
        type: 'Approved Technical Institute',
        approvedIntake: 420,
        establishedYear: 2020,
        principalName: 'Authorized Representative',
        email: 'info@institute.edu.in',
        phone: '+91 11 23456789',
        accreditation: 'AICTE Approved',
        riskLevel: newCase.overlapDetected ? 'HIGH' : 'LOW',
        activeCasesCount: 1,
        totalHistoricalCases: 1
      };
      setInstitutions((prev) => [newInst, ...prev]);
    } else {
      setInstitutions((prev) =>
        prev.map(inst =>
          inst.permanentId === newCase.institutionPermanentId
            ? { ...inst, activeCasesCount: inst.activeCasesCount + 1, totalHistoricalCases: inst.totalHistoricalCases + 1 }
            : inst
        )
      );
    }

    showToast(`New Case ${newCase.caseId} successfully registered in ${newCase.bureau} Bureau with SHA-256 seal.`);
  };

  const handleOpenCoordinationView = (instId) => {
    setSelectedInstitutionForCoordination(instId);
    setActiveTab('overlap');
  };

  const handleOpenNewCaseWithInstitution = (inst) => {
    setPreselectedInstForNewCase(inst);
    setIsNewCaseModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* 1. Official Government Tricolor Strip */}
      <div className="gov-tricolor-strip" />

      {/* 2. Official Portal Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNewCaseModal={() => {
          setPreselectedInstForNewCase(null);
          setIsNewCaseModalOpen(true);
        }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        overlapCount={overlapClusters.length}
        activeCasesCount={cases.filter(c => c.status !== 'DISPOSED').length}
      />

      {/* 3. Main Navigation Tab Bar */}
      <nav className="main-navigation-bar">
        <div className="nav-inner">
          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Executive Dashboard</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              <FileSpreadsheet size={16} />
              <span>Complaint Tracking Register</span>
              <span className="tab-badge tab-badge-blue">{cases.length}</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'overlap' ? 'active' : ''}`}
              onClick={() => setActiveTab('overlap')}
            >
              <GitMerge size={16} />
              <span>Cross-Bureau Coordination</span>
              {overlapClusters.length > 0 && (
                <span className="tab-badge tab-badge-crimson">
                  {overlapClusters.length} Overlaps
                </span>
              )}
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'institutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('institutions')}
            >
              <Building2 size={16} />
              <span>Centralized Institution Profiles</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 size={16} />
              <span>Reports & Analytics</span>
            </button>
          </div>

          <div className="system-status-indicator">
            <span className="live-indicator-dot" />
            <span>AICTE-SETU Real-Time Sync: Active</span>
          </div>
        </div>
      </nav>

      {/* 4. Main Body Content Area */}
      <main className="main-content">
        {/* Global Overlap Alert Banner (shown across screens if overlaps exist) */}
        {activeTab !== 'overlap' && (
          <OverlapAlertBanner
            overlapClusters={overlapClusters}
            onOpenCoordinationView={handleOpenCoordinationView}
          />
        )}

        {/* Tab 1: Executive Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            cases={cases}
            institutions={institutions}
            overlapClusters={overlapClusters}
            onNavigateTab={setActiveTab}
            onFilterByBureau={(bureau) => {
              setActiveTab('cases');
            }}
            onFilterByRegion={(region) => {
              setActiveTab('cases');
            }}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onOpenCoordinationView={handleOpenCoordinationView}
          />
        )}

        {/* Tab 2: Complaint Tracking Table */}
        {activeTab === 'cases' && (
          <CaseTrackingTable
            cases={cases}
            onSelectCase={setSelectedCaseForModal}
            onOpenCoordination={handleOpenCoordinationView}
            onOpenNewCaseModal={() => {
              setPreselectedInstForNewCase(null);
              setIsNewCaseModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Cross-Bureau Overlap Coordination Hub */}
        {activeTab === 'overlap' && (
          <OverlapCoordinationCenter
            overlapClusters={overlapClusters}
            selectedInstitutionId={selectedInstitutionForCoordination}
            onResolveCoordination={handleResolveCoordination}
            onSelectCase={setSelectedCaseForModal}
          />
        )}

        {/* Tab 4: Centralized Institution Profile View */}
        {activeTab === 'institutions' && (
          <InstitutionProfileView
            institutions={institutions}
            cases={cases}
            onSelectCase={setSelectedCaseForModal}
            onOpenCoordination={handleOpenCoordinationView}
            onOpenNewCaseWithInstitution={handleOpenNewCaseWithInstitution}
          />
        )}

        {/* Tab 5: Reports & Analytics */}
        {activeTab === 'reports' && (
          <ReportsAnalyticsView
            cases={cases}
            institutions={institutions}
            overlapClusters={overlapClusters}
          />
        )}
      </main>

      {/* 5. Modals and Drawers */}
      {/* Case Detail Modal with SHA-256 Verification */}
      {selectedCaseForModal && (
        <CaseDetailModal
          caseItem={selectedCaseForModal}
          onClose={() => setSelectedCaseForModal(null)}
          onAddAction={handleAddAction}
          currentRole={currentRole}
        />
      )}

      {/* Lodge New Complaint Modal */}
      {isNewCaseModalOpen && (
        <NewComplaintModal
          institutions={institutions}
          existingCases={cases}
          preselectedInstitution={preselectedInstForNewCase}
          onClose={() => {
            setIsNewCaseModalOpen(false);
            setPreselectedInstForNewCase(null);
          }}
          onSubmitNewCase={handleSubmitNewCase}
          currentRole={currentRole}
        />
      )}

      {/* Security & Cryptographic SHA-256 Ledger Modal */}
      {isSecurityModalOpen && (
        <SecurityLedgerModal
          cases={cases}
          onClose={() => setIsSecurityModalOpen(false)}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--primary-navy)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.88rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Bell size={18} color="#fbbf24" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
