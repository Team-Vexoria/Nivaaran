import { getAuth } from 'firebase/auth';

import { getBearerToken } from '../api/client';
export async function uploadEvidenceS3(file: File): Promise<{ storageRef: string }> {
  const base = (import.meta.env?.VITE_API_URL || '') + '/api/v1';
  const token = await getBearerToken();
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
  if (!confirmRes.ok) throw new Error('Confirm failed: ' + confirmRes.status);
  const confirmData = await confirmRes.json();
  return { storageRef: (confirmData.data || confirmData).storageRef || file.name };
}
