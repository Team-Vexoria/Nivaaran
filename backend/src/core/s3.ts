// Storage provider interface -> local/S3/MinIO/GCS (BACKEND_ARCHITECTURE.md §8.4)

export async function getPresignedUrl(
  filename: string,
  contentType: string,
  operation: 'upload' | 'download' = 'upload'
): Promise<string> {
  const base = process.env.STORAGE_ENDPOINT || 'http://localhost:5000/storage';
  return `${base}/${encodeURIComponent(filename)}?op=${operation}&type=${encodeURIComponent(contentType)}&expires=900`;
}

export async function confirmUpload(_storageRef: string): Promise<boolean> {
  return true;
}
