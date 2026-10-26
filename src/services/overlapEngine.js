/**
 * AICTE-SETU: Cross-Bureau Overlap Detection & Intelligent Coordination Engine
 * Implements Multi-layer Matching:
 * 1. Exact AICTE Permanent ID Match
 * 2. Institution Name & Alias Token Similarity (Fuzzy Match)
 * 3. Semantic Category Correlation
 * 4. Inter-Bureau Conflict Risk Scoring
 */

// Normalizes strings for robust fuzzy comparison
function normalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\b(college|institute|tech|technology|engineering|management|campus|research|of|and|the|dr|shree|st)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Token Jaccard similarity for institution names
function calculateTokenSimilarity(str1, str2) {
  const norm1 = normalizeName(str1);
  const norm2 = normalizeName(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  const set1 = new Set(norm1.split(' ').filter(t => t.length > 2));
  const set2 = new Set(norm2.split(' ').filter(t => t.length > 2));
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

// Correlated grievance category mappings
const CATEGORY_CORRELATION_MATRIX = {
  'Non-Payment of 7th CPC Faculty Salaries & Arrears': ['Withholding of Original Certificates & Degrees', 'Excess Tuition / Unsanctioned Capitation Fee', 'Faculty Shortage & Fictitious Faculty (Ghost Teachers)'],
  'Withholding of Original Certificates & Degrees': ['Non-Payment of 7th CPC Faculty Salaries & Arrears', 'Non-Refund of Caution Deposit / Fees on Withdrawal'],
  'Running Unapproved Programs / Over-Admission Beyond Intake': ['Non-Refund of Caution Deposit / Fees on Withdrawal', 'Infrastructure, Lab Equipment & Safety Deficiencies', 'Excess Tuition / Unsanctioned Capitation Fee'],
  'Excess Tuition / Unsanctioned Capitation Fee': ['Non-Refund of Caution Deposit / Fees on Withdrawal', 'Running Unapproved Programs / Over-Admission Beyond Intake']
};

/**
 * Evaluates whether two complaints share a high-risk systemic correlation
 */
export function areCategoriesCorrelated(cat1, cat2) {
  if (cat1 === cat2) return true;
  const related1 = CATEGORY_CORRELATION_MATRIX[cat1] || [];
  return related1.includes(cat2);
}

/**
 * Scans the entire case registry and identifies overlapping clusters
 */
export function detectAllOverlaps(cases, institutions = []) {
  const institutionMap = new Map();
  // Map by permanentId
  institutions.forEach(inst => {
    institutionMap.set(inst.permanentId, inst);
  });

  // Group cases by institutionPermanentId first (Primary Exact Key)
  const idGroups = new Map();
  cases.forEach(c => {
    const key = c.institutionPermanentId || 'UNKNOWN';
    if (!idGroups.has(key)) idGroups.set(key, []);
    idGroups.get(key).push(c);
  });

  const overlapClusters = [];

  idGroups.forEach((caseList, permId) => {
    if (caseList.length > 1) {
      // Check if multiple bureaus are involved
      const bureausInvolved = Array.from(new Set(caseList.map(c => c.bureau)));
      if (bureausInvolved.length > 1) {
        // Multi-bureau presence detected!
        const activeStatuses = ['RECEIVED', 'UNDER_PROCESS', 'NOTICE_ISSUED', 'COORDINATION_REQUIRED', 'HEARING_SCHEDULED', 'ESCALATED'];
        const activeCases = caseList.filter(c => activeStatuses.includes(c.status));
        const activeBureaus = Array.from(new Set(activeCases.map(c => c.bureau)));

        let conflictLevel = 'LOW';
        let recommendation = 'Monitor cases for administrative closure';

        if (activeBureaus.length >= 2) {
          conflictLevel = 'CRITICAL';
          recommendation = 'Hold immediate Joint Standing Hearing; designate Lead Bureau to issue unified show-cause order';
        } else if (activeCases.length >= 2) {
          conflictLevel = 'HIGH';
          recommendation = 'Synchronize compliance responses between bureaus to prevent conflicting deadlines';
        } else {
          conflictLevel = 'MODERATE';
          recommendation = 'Share historical case docket before final order sign-off';
        }

        const instInfo = institutionMap.get(permId) || {
          name: caseList[0].institutionName,
          region: caseList[0].region
        };

        overlapClusters.push({
          institutionPermanentId: permId,
          institutionName: instInfo.name || caseList[0].institutionName,
          region: instInfo.region || caseList[0].region,
          bureaus: bureausInvolved,
          activeBureaus,
          conflictLevel,
          recommendation,
          cases: caseList,
          activeCaseCount: activeCases.length,
          totalCaseCount: caseList.length,
          hasRbAndPgrc: bureausInvolved.includes('RB') && bureausInvolved.includes('PGRC'),
          detectedAt: new Date().toISOString()
        });
      }
    }
  });

  // Sort by conflict urgency: CRITICAL first, then HIGH, then MODERATE
  const rank = { CRITICAL: 3, HIGH: 2, MODERATE: 1, LOW: 0 };
  return overlapClusters.sort((a, b) => rank[b.conflictLevel] - rank[a.conflictLevel]);
}

/**
 * Pre-screening engine when intake officer is lodging a new complaint
 * Detects if the proposed institution already has active cases in other bureaus
 */
export function checkPotentialIntakeOverlap(newCaseData, existingCases, institutions = []) {
  const targetId = (newCaseData.institutionPermanentId || '').trim();
  const targetName = (newCaseData.institutionName || '').trim();
  const targetBureau = newCaseData.bureau;

  const matches = [];

  for (const c of existingCases) {
    if (c.status === 'DISPOSED') continue; // only check active or under process

    let isMatch = false;
    let matchReason = '';
    let matchConfidence = 0;

    // 1. Exact Permanent ID Match
    if (targetId && c.institutionPermanentId && targetId.toLowerCase() === c.institutionPermanentId.toLowerCase()) {
      isMatch = true;
      matchReason = 'Exact AICTE Permanent ID match';
      matchConfidence = 100;
    }
    // 2. Fuzzy Name / Alias match
    else if (targetName && c.institutionName) {
      const sim = calculateTokenSimilarity(targetName, c.institutionName);
      if (sim >= 0.65) {
        isMatch = true;
        matchReason = `Institutional name similarity match (${Math.round(sim * 100)}% match)`;
        matchConfidence = Math.round(sim * 100);
      }
    }

    if (isMatch) {
      const isCrossBureau = c.bureau !== targetBureau;
      const isCategoryCorrelated = areCategoriesCorrelated(newCaseData.category, c.category);

      matches.push({
        caseId: c.caseId,
        bureau: c.bureau,
        category: c.category,
        status: c.status,
        officer: c.assignedOfficer,
        matchReason,
        matchConfidence,
        isCrossBureau,
        isCategoryCorrelated
      });
    }
  }

  const crossBureauMatches = matches.filter(m => m.isCrossBureau);

  return {
    hasOverlap: matches.length > 0,
    hasCrossBureauOverlap: crossBureauMatches.length > 0,
    matches,
    crossBureauMatches,
    alertTitle: crossBureauMatches.length > 0
      ? 'Potential Overlapping Cases – Coordination Required'
      : matches.length > 0
        ? 'Duplicate / Parallel Case Detected in Same Bureau'
        : null
  };
}
