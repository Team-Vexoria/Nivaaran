import { detectFakeAndHazard, ForensicResult } from './fakeDetector.js';

export interface VisionPipelineResult extends ForensicResult {
  vision: {
    isRealPhoto: boolean;
    fakeReason: string | null;
    hasHazard: boolean;
    hazardType: 'FLOODING' | 'CONTAMINATED_WATER' | 'MINE_SUBSIDENCE' | 'ROAD_DAMAGE' | 'WILDLIFE' | 'NONE';
  };
}

/**
 * Main Vision Processing Pipeline:
 * Coordinates Forensic Fake Detection and Hazard Classification
 */
export async function processEvidenceImage(imageInput: string | Buffer, fileUri?: string): Promise<VisionPipelineResult> {
  const result = await detectFakeAndHazard(imageInput, fileUri);
  return {
    ...result,
    vision: {
      isRealPhoto: result.isRealPhoto,
      fakeReason: result.fakeReason,
      hasHazard: result.hasHazard,
      hazardType: result.hazardType,
    }
  };
}

export { detectFakeAndHazard };
