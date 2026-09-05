import { getAuth } from 'firebase/auth';

import { apiClient } from '../api/client';
// Reuse apiClient's getBearerToken via shared pattern; direct fetch kept for raw PUT to presigned URL
export async function uploadEvidenceS3(file: File): Promise<{ storageRef: string }> {
  const base = (import.meta.env?.VITE_API_URL || '') + '/api/v1';
  const token = await (async () => { try { const a = await import('firebase/auth'); const u = a.getAuth().currentUser; return u ? await u.getIdToken() : ''; } catch { return ''; } })();
  const presignRes = await fetch(`${base}/evidence/presign`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) throw new Error('Presign failed: '+presignRes.status);
  const { url } = await presignRes.json();
  await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  const confirmRes = await fetch(`${base}/evidence/confirm`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ storageRef: file.name }),
  });
  if (!confirmRes.ok) throw new Error('Confirm failed');
  return { storageRef: file.name };
}
