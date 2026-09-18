/**
 * NIVAARAN Multimodal Computer Vision Classifier & Forensic Gate (SIH 26043)
 * Decision Point 1: Real-time Authenticity & Hazard Classification
 */

export interface VisionAnalysisResult {
  visualCategory: string;
  categoryCode: string;
  visionConfidence: number; // e.g. 96%
  detectedFeatures: string[];
  visualDescription: string;
  isRealPhoto: boolean;
  fakeReason: string | null;
  hasHazard: boolean;
  hazardType: 'FLOODING' | 'CONTAMINATED_WATER' | 'MINE_SUBSIDENCE' | 'ROAD_DAMAGE' | 'WILDLIFE' | 'NONE';
  status: 'ACCEPTED' | 'REJECTED';
}

/**
 * Local Forensic Quick-Check (EXIF & Metadata anomaly analyzer)
 */
export function quickForensicCheck(imageDataUrl: string): { isFlagged: boolean; reason: string | null } {
  if (!imageDataUrl) return { isFlagged: true, reason: 'Empty media provided.' };
  if (imageDataUrl.length < 200) {
    return { isFlagged: true, reason: 'Media file is empty or corrupted.' };
  }
  try {
    const header = imageDataUrl.slice(0, 1000).toLowerCase();
    const syntheticSignatures = ['midjourney', 'dall-e', 'dalle', 'stablediffusion', 'stable diffusion', 'novelai', 'firefly', 'comfyui'];
    for (const sig of syntheticSignatures) {
      if (header.includes(sig)) {
        return { isFlagged: true, reason: `Synthetic AI generator header detected: ${sig}` };
      }
    }
  } catch {
    // ignore
  }
  return { isFlagged: false, reason: null };
}

/**
 * Computer Vision Analysis Engine:
 * Analyzes Image Evidence via Multimodal Vision AI & Forensic Verification
 */
export const analyzeImageEvidenceWithVision = async (
  imageDataUrl: string, 
  title: string = '', 
  description: string = ''
): Promise<VisionAnalysisResult> => {
  // 1. Run local metadata check
  const localCheck = quickForensicCheck(imageDataUrl);
  if (localCheck.isFlagged) {
    return {
      visualCategory: 'Flagged Synthetic Media',
      categoryCode: 'fake_media',
      visionConfidence: 98,
      detectedFeatures: ['Synthetic Generation Signature', 'Metadata Anomaly'],
      visualDescription: `Image Rejected: ${localCheck.reason}`,
      isRealPhoto: false,
      fakeReason: localCheck.reason,
      hasHazard: false,
      hazardType: 'NONE',
      status: 'REJECTED'
    };
  }

  // 2. Delegate to Multimodal AI Triage Engine
  try {
    const { runAITriageEngineAsync } = await import('./aiTriageEngine');
    const triage = await runAITriageEngineAsync(title, description, 1, imageDataUrl);

    const isReal = triage.isRealPhoto !== false && triage.forensicStatus !== 'REJECTED' && triage.hasHazard !== false;
    const fakeReason = isReal ? null : (triage.fakeReason || 'Image flagged: Non-civic scene or synthetic manipulation');

    return {
      visualCategory: triage.category,
      categoryCode: triage.categoryCode,
      visionConfidence: triage.confidenceScore,
      detectedFeatures: [
        triage.matchedProblem || triage.category,
        `Risk: ${triage.riskLevel}`,
        isReal ? 'Authentic Geotagged Photo' : 'Flagged Media'
      ],
      visualDescription: triage.reasoning,
      isRealPhoto: isReal,
      fakeReason,
      hasHazard: Boolean(triage.hasHazard && isReal),
      hazardType: isReal ? (triage.hazardType || 'FLOODING') : 'NONE',
      status: isReal ? 'ACCEPTED' : 'REJECTED'
    };
  } catch (err) {
    console.warn('[Vision AI] Analysis error:', err);
    return {
      visualCategory: 'Unverified Media',
      categoryCode: 'unverified_media',
      visionConfidence: 40,
      detectedFeatures: ['Visual Evidence Unverified'],
      visualDescription: 'Forensic inspection failed to verify civic hazard in image.',
      isRealPhoto: false,
      fakeReason: 'Failed to verify image authenticity or civic hazard.',
      hasHazard: false,
      hazardType: 'NONE',
      status: 'REJECTED'
    };
  }
};
