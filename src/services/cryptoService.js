/**
 * Cryptographic Utility for SHA-256 Hashing and Tamper-Proof Audit Chaining
 * Compliant with AICTE Security Standard & Data Integrity Requirements
 */

export async function sha256(message) {
  // Use native Web Crypto API for ultra-fast, secure SHA-256 computation
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function computeFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Creates an immutable cryptographic hash chain block for an action entry
 */
export async function createChainedAuditHash(previousHash, actionPayload) {
  const serialized = JSON.stringify({
    prev: previousHash || '0000000000000000000000000000000000000000000000000000000000000000',
    caseId: actionPayload.caseId,
    timestamp: actionPayload.timestamp,
    officer: actionPayload.officer,
    bureau: actionPayload.bureau,
    action: actionPayload.action,
    remarks: actionPayload.remarks || '',
    documents: (actionPayload.documents || []).map(d => d.hash || d.name)
  });
  return await sha256(serialized);
}

/**
 * Verifies the integrity of a sequence of action logs
 */
export async function verifyAuditChain(history) {
  if (!history || history.length === 0) return { valid: true, details: 'Empty history' };

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    const expectedHash = await createChainedAuditHash(prevHash, item);
    if (item.hash && item.hash !== expectedHash) {
      return {
        valid: false,
        brokenIndex: i,
        expectedHash,
        actualHash: item.hash,
        item
      };
    }
    prevHash = item.hash || expectedHash;
  }
  return { valid: true, verifiedCount: history.length, latestHash: prevHash };
}
