import { getBearerToken } from '../api/client';
export async function uploadEvidenceS3(file: File, challengeId?: string): Promise<{ storageRef: string }> {
  const base = (import.meta.env?.VITE_API_URL || '') + '/api/v1';
  const token = await getBearerToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const presignRes = await fetch(`${base}/evidence/presign`, {
    method: 'POST', headers,
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) throw new Error('Presign failed: '+presignRes.status);
  const { data: { uploadUrl } } = await presignRes.json();
  await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  const evidenceType = file.type.startsWith('video') ? 'VIDEO' : file.type.startsWith('audio') ? 'AUDIO' : 'PHOTO';
  const confirmRes = await fetch(`${base}/evidence/confirm`, {
    method: 'POST', headers,
    body: JSON.stringify({ url: file.name, challenge_id: challengeId || null, type: evidenceType, mime_type: file.type }),
  });
  if (!confirmRes.ok) throw new Error('Confirm failed: ' + confirmRes.status);
  const confirmData = await confirmRes.json();
  return { storageRef: (confirmData.data || confirmData).storage_ref || file.name };
}
