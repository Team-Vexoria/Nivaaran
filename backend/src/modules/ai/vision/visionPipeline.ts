export interface VisionResult { hasHazard: boolean; confidence: number; description: string; modelVersion: string; }
export async function processEvidenceImage(url: string): Promise<VisionResult> { const ai = (await import('../AIProvider')).AIProvider; if (ai.vision) return await ai.vision(url); else throw new Error('Vision not configured'); }
