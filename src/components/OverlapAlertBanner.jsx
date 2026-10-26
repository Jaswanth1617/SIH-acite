import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, GitMerge, Building2 } from 'lucide-react';

export default function OverlapAlertBanner({ overlapClusters, onOpenCoordinationView }) {
  if (!overlapClusters || overlapClusters.length === 0) return null;

  const topCluster = overlapClusters[0];

  return (
    <div className="overlap-banner-wrapper">
      <div className="overlap-alert-card">
        <div className="overlap-alert-content">
          <div className="overlap-alert-icon">
            <AlertTriangle size={24} />
          </div>

          <div>
            <div className="overlap-title-row">
              <span className="overlap-badge">Conflict Warning</span>
              <h2 className="overlap-banner-heading">
                Potential Overlapping Cases – Coordination Required
              </h2>
            </div>

            <p className="overlap-banner-desc">
              AICTE-SETU real-time deduplication engine identified{' '}
              <strong>{overlapClusters.length} institutions</strong> currently undergoing parallel scrutiny across multiple Bureaus/Cells.
              Active coordination between <strong>Regulation Bureau (RB)</strong> and <strong>Public Grievance Redressal Cell (PGRC)</strong> is mandated to prevent contradictory show-cause orders.
            </p>

            <div className="overlap-chips-row">
              {overlapClusters.slice(0, 3).map((cluster) => (
                <div key={cluster.institutionPermanentId} className="overlap-inst-chip">
                  <Building2 size={13} />
                  <span>
                    <strong>{cluster.institutionName}</strong> ({cluster.institutionPermanentId})
                  </span>
                  <span style={{ color: '#e11d48', fontWeight: 700 }}>
                    [{cluster.bureaus.join(' ↔ ')}]
                  </span>
                </div>
              ))}
              {overlapClusters.length > 3 && (
                <span style={{ fontSize: '0.78rem', color: '#9f1239', fontWeight: 600 }}>
                  +{overlapClusters.length - 3} more overlapping institutions
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overlap-actions">
          <button
            className="btn-resolve-overlap"
            onClick={() => onOpenCoordinationView(topCluster.institutionPermanentId)}
          >
            <GitMerge size={16} />
            <span>Open Coordination Center</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
