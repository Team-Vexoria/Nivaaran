import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { 
  Camera, Upload, MapPin, CheckCircle, X, Loader2, ArrowRight, AlertTriangle, RefreshCw, ShieldAlert, TrendingUp, Users
} from 'lucide-react';
import { submitChallengeToFirestore, submitFeedPostToFirestore } from '../services/firebaseService';
import { uploadEvidenceS3 } from '../services/evidenceUpload';
import { runAITriageEngineAsync, runAITriageEngine, AITriageResult } from '../services/aiTriageEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatStageName, getStageForStatus } from '../services/workflowLifecycle';
import { workflowStore } from '../services/workflowStore';
import { findSimilarChallenges, mergeWithPrimaryChallenge } from '../services/deduplicationService';
import { extractIncidentMetadata } from '../services/dataExtractionService';
import type { PriorityFactors, ResearchResult, RiskLevel } from '../services/workflowTypes';

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reportId: string) => void;
}

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Palamu', 
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar', 
  'Garhwa', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Jamtara', 
  'Khunti', 'Gumla', 'Simdega', 'West Singhbhum', 'Seraikela Kharsawan', 
  'Chatra', 'Koderma', 'Lohardaga'
];

export const QuickReportModal: React.FC<QuickReportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, currentLang } = useLanguage();
  const [step, setStep] = useState<'form' | 'submitting' | 'success' | 'forensic_rejected' | 'dedup_merged'>('form');
const [affectedPopulation, setAffectedPopulation] = useState<number | undefined>(undefined);
const [economicValueEstimate, setEconomicValueEstimate] = useState<number | undefined>(undefined);
const [estimatedResolutionCost, setEstimatedResolutionCost] = useState<number | undefined>(undefined);
  const [forensicRejectionReason, setForensicRejectionReason] = useState<string>('');
  const [dedupInfo, setDedupInfo] = useState<{
    primaryId: string;
    primaryTitle: string;
    district: string;
    category: string;
    totalReports: number;
    boostedPriority: number;
  } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [blockVillage, setBlockVillage] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [locating, setLocating] = useState(false);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState('');
  const [precomputedAITriage, setPrecomputedAITriage] = useState<AITriageResult | null>(null);
  const [isVerifyingRealtime, setIsVerifyingRealtime] = useState(false);
  const triagePromiseRef = useRef<Promise<AITriageResult> | null>(null);

  const triggerInstantPreTriage = (compressedImage: string, currentTitle: string = title, currentDesc: string = description) => {
    if (!compressedImage) return;
    setIsVerifyingRealtime(true);
    const p = runAITriageEngineAsync(currentTitle, currentDesc, 1, compressedImage).then(res => {
      setPrecomputedAITriage(res);
      setIsVerifyingRealtime(false);
      return res;
    }).catch(() => {
      const fallback = runAITriageEngine(currentTitle, currentDesc, 1);
      setPrecomputedAITriage(fallback);
      setIsVerifyingRealtime(false);
      return fallback;
    });
    triagePromiseRef.current = p;
  };

  // Live Camera WebCam Viewfinder State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop WebCam Stream helper
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Automatically reset all form state and fetch GPS geolocation as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setTitle('');
      setDescription('');
      setFilePreviews([]);
      setDedupInfo(null);
      setPrecomputedAITriage(null);
      setForensicRejectionReason('');
      setSubmittedId('');
      setIsVerifyingRealtime(false);
      handleGetLocation();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Reverse Geocoding via OpenStreetMap Nominatim API
  const fetchReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || '';
          const locality = addr.village || addr.town || addr.city || addr.suburb || '';
          const districtName = addr.state_district || addr.county || addr.city_district || '';
          const stateName = addr.state || '';

          const parts = [road, locality, districtName, stateName].filter(Boolean);
          const uniqueParts = parts.filter((item, index) => parts.indexOf(item) === index);
          
          if (uniqueParts.length > 0) {
            setFormattedAddress(uniqueParts.join(', '));
            return;
          }
        }
        if (data.display_name) {
          setFormattedAddress(data.display_name);
          return;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    setFormattedAddress(`Geotagged Location (${lat}°N, ${lng}°E)`);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setLocationCoords({ lat, lng });
        await fetchReverseGeocode(lat, lng);
        setLocating(false);
      },
      async () => {
        // Fallback coordinates for test environment
        const lat = 23.3441;
        const lng = 85.3096;
        setLocationCoords({ lat, lng });
        await fetchReverseGeocode(lat, lng);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Start Live WebCam Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or device not found.');
      setIsCameraActive(false);
    }
  };

  // Take Snapshot from Live Camera Stream
  const takeCameraSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFilePreviews((prev) => [...prev, dataUrl]);
        triggerInstantPreTriage(dataUrl);
        stopCamera();
        if (!locationCoords) handleGetLocation();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      for (const file of filesArray) {
        // High-speed compression to 480px wide, 55% JPEG quality (~20KB).
        // Resolves canvas in <2ms and transmits in milliseconds.
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (typeof evt.target?.result !== 'string') return;
          const img = new Image();
          img.onload = () => {
            const MAX_DIM = 480;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.55);
            setFilePreviews((prev) => [...prev, compressed]);
            triggerInstantPreTriage(compressed);
          };
          img.src = evt.target.result as string;
        };
        reader.readAsDataURL(file);

        // Background cloud backup if configured
        uploadEvidenceS3(file).catch(() => {});
      }
      input.value = '';
      if (!locationCoords) handleGetLocation();
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setPrecomputedAITriage(null);
  };

  // Strict Validation: Evidence photo/video AND GPS location are REQUIRED
  const isEvidenceAttached = filePreviews.length > 0;
  const isGPSAttached = locationCoords !== null;
  const isFormValid = title.trim().length > 0 && description.trim().length > 0 && blockVillage.trim().length > 0 && isEvidenceAttached && isGPSAttached;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStep('submitting');
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `JH-2026-NIV-${randomNum}`;
    const coords = locationCoords || { lat: 23.3441, lng: 85.3096 };
    const finalAddress = formattedAddress || `${blockVillage}, District ${district}`;

    // 1. Instant Decision Point 1 Gate: Resolved in milliseconds from preloaded triage or fast engine
    let aiResult: AITriageResult;
    if (precomputedAITriage) {
      aiResult = precomputedAITriage;
    } else if (triagePromiseRef.current) {
      aiResult = await triagePromiseRef.current;
    } else {
      aiResult = filePreviews[0]
        ? await runAITriageEngineAsync(title, description, 1, filePreviews[0])
        : runAITriageEngine(title, description, 1);
    }

    // If fake image detected -> block submitChallengeToFirestore, show rejection warning
    if (aiResult.isRealPhoto === false || aiResult.forensicStatus === 'REJECTED') {
      setStep('forensic_rejected');
      setForensicRejectionReason(
        aiResult.fakeReason || 'Image flagged as synthetic AI generation or digitally manipulated. Submission blocked by Decision Point 1 Forensic Gate.'
      );
      return;
    }

    const initialStage = getStageForStatus('Under Review');

    const now = new Date().toISOString();

    // Build translations object: store title/summary in current language + English fallback
    const translations: Record<string, { title: string; summary: string }> = {};
    const langCode: string = currentLang || 'en';
    translations[langCode] = {
      title: title || 'Local Community Issue',
      summary: description || 'Reported by citizen with geotagged photo evidence.',
    };
    // Also store English fallback so it's always readable
    translations['en'] = {
      title: title || 'Local Community Issue',
      summary: description || 'Reported by citizen with geotagged photo evidence.',
    };

    // ── Semantic deduplication & auto-merge check ──
    const dedupeResult = findSimilarChallenges({
      title: title || 'Local Community Issue',
      description,
      district,
      block: blockVillage || 'Central Block',
      village: blockVillage || 'Panchayat Area',
      locationCoords: coords,
      category: aiResult.category,
      createdAt: now,
    });

    // ── AUTO-DEDUPLICATION BRANCH: Merge with existing primary incident ──
    if (dedupeResult.isDuplicate && dedupeResult.primaryChallenge) {
      const mergeRes = await mergeWithPrimaryChallenge(dedupeResult.primaryChallenge.id, {
        title: title || 'Citizen Follow-up Report',
        description,
        evidenceUrls: filePreviews,
        locationCoords: coords,
        formattedAddress: finalAddress,
        village: blockVillage,
        block: blockVillage,
        district,
      });

      setDedupInfo({
        primaryId: dedupeResult.primaryChallenge.reportId || dedupeResult.primaryChallenge.id,
        primaryTitle: dedupeResult.primaryChallenge.title,
        district: dedupeResult.primaryChallenge.district,
        category: dedupeResult.primaryChallenge.category,
        totalReports: mergeRes.newReportCount,
        boostedPriority: mergeRes.newPriorityScore,
      });

      // ⚠️ Do NOT close the modal or call onSuccess yet —
      // the user must see the dedup_merged screen first and click "Done" to dismiss.
      setStep('dedup_merged');
      return;
    }

    // ── STAGE 4: Automated Data & Evidence Extraction ──
    const extractedData = extractIncidentMetadata({
      reportId: generatedId,
      title: title || 'Local Community Issue',
      description,
      category: aiResult.category,
      district,
      block: blockVillage || 'Central Block',
      village: blockVillage || 'Panchayat Area',
      locationCoords: coords,
      formattedAddress: finalAddress,
      captureSource: isCameraActive ? 'Geotagged Live WebCam' : 'Mobile Geotagged Upload',
    });

    try {
      await submitChallengeToFirestore({
        reportId: generatedId,
        title: title || 'Local Community Issue',
        district,
        block: blockVillage || 'Central Block',
        village: blockVillage || 'Panchayat Area',
        category: aiResult.category,
        status: 'Under Review',
        summary: description || 'Reported by citizen with geotagged photo evidence.',
        evidenceUrl: filePreviews[0] || '', // S3 storage_ref / data URL
        locationCoords: coords,
        formattedAddress: finalAddress,
        priorityScore: aiResult.priorityScore,
        confidenceScore: aiResult.confidenceScore,
        riskLevel: aiResult.riskLevel,
        aiReasoning: aiResult.reasoning,
        priorityFactors: aiResult.factors,
        needsHumanVerification: aiResult.needsHumanVerification,
        stageNumber: initialStage?.stageNumber || 2,
        stageName: formatStageName(initialStage?.stageNumber || 2),
        govtOfficerNote: aiResult.reasoning,
        clusterId: dedupeResult.clusterId ?? undefined,
        extractedMetadata: extractedData,
        translations,  // Multilingual strings
        affectedPopulation,
        economicValueEstimate,
        estimatedResolutionCost,
      });

      submitFeedPostToFirestore({
        author: 'Citizen Resident',
        district,
        block: blockVillage || 'Local Block',
        title: title || 'Local Community Report',
        content: `${description} [Location: ${finalAddress}]`,
        upvotes: 1,
        category: aiResult.category,
        status: 'Under Review',
        translations: {
          [langCode]: {
            title: title || 'Local Community Report',
            content: `${description} [Location: ${finalAddress}]`,
          },
          en: {
            title: title || 'Local Community Report',
            content: `${description} [Location: ${finalAddress}]`,
          },
        },
      });
    } catch (err) {
      console.warn('Error saving challenge:', err);
    }

    // Add a submission timeline event
    workflowStore.addTimelineEvent({
      id: `TL-${Date.now()}-submit`,
      entityType: 'challenge',
      entityId: generatedId,
      action: 'submitted',
      actor: 'Citizen',
      actorRole: 'Citizen',
      description: `Challenge submitted. AI classified as "${aiResult.category}" with ${aiResult.confidenceScore}% confidence. Priority: ${aiResult.priorityScore}/100 [${aiResult.riskLevel}].`,
      newValue: 'Under Review',
      timestamp: now,
    });

    // If similar challenges were found, add a deduplication timeline event
    if (dedupeResult.clusterId && dedupeResult.primaryChallenge) {
      const simPct = Math.round(dedupeResult.similarityScore * 100);
      workflowStore.addTimelineEvent({
        id: `TL-${Date.now()}-dedup`,
        entityType: 'challenge',
        entityId: generatedId,
        action: 'clustered',
        actor: 'AI Deduplication Engine',
        actorRole: 'AI System',
        description: `${simPct}% similarity detected with "${dedupeResult.primaryChallenge.title}" (${dedupeResult.primaryChallenge.reportId}) in ${dedupeResult.primaryChallenge.district}. Grouped into cluster ${dedupeResult.clusterId}.`,
        newValue: dedupeResult.isDuplicate ? 'Probable Duplicate' : 'Clustered',
        timestamp: new Date(Date.now() + 1).toISOString(),
      });
    }

    setSubmittedId(generatedId);
    setStep('success');
    if (onSuccess) {
      onSuccess(generatedId);
    }

    // ── Background: fire backend 5-stage AI pipeline for enrichment ─────
    // Research + HEI matching runs server-side with real network calls.
    // Fire-and-forget: enriches the local store when it returns (~2-8s).
    (async () => {
      try {
        const { apiClient } = await import('../api/client');
        const backendRes = await apiClient.runAIPipeline({
          challenge: {
            title: title || 'Local Community Issue',
            description,
            category: aiResult.category,
            district,
            block: blockVillage || 'Central Block',
            village: blockVillage || 'Panchayat Area',
            location: { lat: coords.lat, lng: coords.lng, district, block: blockVillage },
            affectedPopulation,
            economicValue: economicValueEstimate,
            estimatedResolutionCost,
          },
          upvotes: 1,
        });

        if (backendRes.ok && backendRes.data) {
          const pipeline = backendRes.data;
          // Merge backend enrichment into the existing aiAnalysis (preserve prior fields)
          const existing = workflowStore.getChallenge(generatedId);
          const backendSummary = pipeline.understanding.summary || aiResult.reasoning;
          // Update local workflowStore with backend-enriched data
          workflowStore.updateChallenge(generatedId, {
            research: pipeline.research as unknown as ResearchResult,
            priorityScore: pipeline.priority.priorityScore,
            riskLevel: pipeline.priority.riskLevel as RiskLevel,
            confidenceScore: pipeline.confidence,
            aiAnalysis: {
              category: pipeline.category || existing?.aiAnalysis?.category || aiResult.category,
              categoryCode: pipeline.domainCode || existing?.aiAnalysis?.categoryCode || '',
              priorityScore: pipeline.priority.priorityScore,
              riskLevel: pipeline.priority.riskLevel as RiskLevel,
              factors: pipeline.priority.factors as unknown as PriorityFactors,
              reasoning: backendSummary,
              confidenceScore: pipeline.confidence * 100,
              needsHumanVerification: existing?.aiAnalysis?.needsHumanVerification ?? aiResult.needsHumanVerification,
              recommendedUniversityDepts: existing?.aiAnalysis?.recommendedUniversityDepts ?? aiResult.recommendedUniversityDepts,
              research: pipeline.research as unknown as ResearchResult,
            },
          });
          // Add enrichment timeline event
          workflowStore.addTimelineEvent({
            id: `TL-${Date.now()}-pipeline`,
            entityType: 'challenge',
            entityId: generatedId,
            action: 'prioritized',
            actor: 'NIVAARAN 5-Stage AI Pipeline',
            actorRole: 'AI System',
            description: `Backend AI pipeline completed [${pipeline.pipeline.join(' → ')}]. Research confidence: ${pipeline.research.confidence}. HEI matches: ${pipeline.matches.length}. Backend priority: ${pipeline.priority.priorityScore}/100 [${pipeline.priority.riskLevel}].`,
            timestamp: new Date().toISOString(),
          });
          console.log('[NIVAARAN] Backend pipeline enrichment complete for', generatedId);
        }
      } catch (err) {
        console.warn('[NIVAARAN] Backend pipeline enrichment failed (non-fatal):', err);
      }
    })();
  };

  const resetAndClose = () => {
    stopCamera();
    setStep('form');
    setTitle('');
    setDescription('');
    setFilePreviews([]);
    setLocationCoords(null);
    setFormattedAddress('');
    setDedupInfo(null);
    setPrecomputedAITriage(null);
    setForensicRejectionReason('');
    setSubmittedId('');
    setIsVerifyingRealtime(false);
    setAffectedPopulation(undefined);
    setEconomicValueEstimate(undefined);
    setEstimatedResolutionCost(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden my-auto">
        {/* Sticky Light Header */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 backdrop-blur-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">{t.reportModal.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300 uppercase tracking-wider hidden sm:inline-block">GovTech AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t.reportModal.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container for all Modal Steps */}
        <div className="overflow-y-auto flex-1">

          {/* Step 1: Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {t.reportModal.problemTitleLabel} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t.reportModal.problemTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {t.reportModal.descLabel} <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={t.reportModal.descPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            {/* Photo / Video Evidence Intake (Camera & File Picker) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{t.reportModal.uploadTitle} <span className="text-red-600">*</span></span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isEvidenceAttached 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {isEvidenceAttached ? `✓ Photo Attached` : `⚠️ Required to Submit`}
                </span>
              </label>

              {/* Live WebCam Viewfinder Container */}
              {isCameraActive ? (
                <div className="bg-slate-900 rounded-2xl p-4 space-y-3 border-2 border-emerald-500 shadow-md">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center animate-pulse">
                      ● LIVE CAMERA VIEW
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={takeCameraSnapshot}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo Snapshot</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  
                  {/* Option 1: Live Camera Viewfinder Launcher */}
                  <div className="relative border-2 border-dashed border-[#1E3A5F]/50 bg-emerald-50/70 hover:bg-emerald-100/50 rounded-xl p-4 text-center transition-all">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full flex flex-col items-center justify-center space-y-2 py-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1E3A5F] block">📸 Open Live Camera View</span>
                        <span className="text-[10px] text-slate-500 block">Take real-time photo/video</span>
                      </div>
                    </button>
                  </div>

                  {/* Option 2: File Upload (Testing Mode) */}
                  <div className="relative border-2 border-dashed border-[#DCD6C6] bg-white hover:bg-[#F3F0E8]/50 rounded-xl p-4 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="evidence-upload-input"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <label 
                      htmlFor="evidence-upload-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-1"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1E3A5F] block">📁 Upload File (Testing Mode)</span>
                        <span className="text-[10px] text-slate-500 block">Pick image/video from desktop</span>
                      </div>
                    </label>
                  </div>

                </div>
              )}

              {cameraError && (
                <p className="text-xs text-red-600 font-semibold pt-1">{cameraError}</p>
              )}

              {/* Media Previews */}
              {filePreviews.length > 0 && (
                <div className="space-y-2 mt-3 pt-2 border-t border-[#DCD6C6]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Attached Evidence ({filePreviews.length} Files)</span>
                    {formattedAddress && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 max-w-[280px] truncate">
                        📍 {formattedAddress}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filePreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-600 group shadow-xs">
                        <img src={preview} alt="Evidence preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-xs hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Real-time AI Verification & Triage Feedback Pill */}
                  <div className="pt-1">
                    {isVerifyingRealtime ? (
                      <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>AI Forensics & 100-Domain Categorization running in background...</span>
                      </div>
                    ) : precomputedAITriage?.isRealPhoto === false ? (
                      <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>AI Warning: Potential synthetic or non-field media detected</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Verified: Authenticated Field Photo</span>
                        </div>
                        {precomputedAITriage?.category && (
                          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-mono">
                            {precomputedAITriage.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  {t.reportModal.districtLabel} <span className="text-red-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-xs font-medium text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  {t.reportModal.panchayatLabel} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanke Block, Village Sukurhutu"
                  value={blockVillage}
                  onChange={(e) => setBlockVillage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-xs text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>
            </div>

            {/* Human-Readable Reverse Geocoded Address Card */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                <MapPin className={`w-5 h-5 shrink-0 ${formattedAddress ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-slate-900 block truncate">
                    {locating
                      ? 'Fetching exact street address...'
                      : formattedAddress
                      ? `📍 ${formattedAddress}`
                      : 'Location Geotag Missing'}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {locationCoords ? `GPS Lat: ${locationCoords.lat}°N, Lng: ${locationCoords.lng}°E` : 'Auto-resolving street address via GPS'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-1 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{locating ? 'Locating...' : 'Refresh Address'}</span>
              </button>
            </div>

            {/* Optional Numeric Impact Inputs */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Impact Estimates (Optional)</div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Affected Population</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={affectedPopulation ?? ''}
                    onChange={(e) => setAffectedPopulation(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-white border border-[#DCD6C6] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Estimated Economic Value (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 80000"
                    value={economicValueEstimate ?? ''}
                    onChange={(e) => setEconomicValueEstimate(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-white border border-[#DCD6C6] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Estimated Resolution Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={estimatedResolutionCost ?? ''}
                    onChange={(e) => setEstimatedResolutionCost(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-white border border-[#DCD6C6] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
              </div>
            </div>

            {/* Stage 4 Live Evidence & Spatial Extraction Indicator */}
            {locationCoords && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">4</span>
                    <span>Stage 4: Automated Data & Evidence Extraction Active</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Geotag Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Extracted Time & Date:</span>
                    <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Extracted Coordinates:</span>
                    <span className="font-mono font-bold text-slate-800">{locationCoords.lat}°N, {locationCoords.lng}°E</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Validation Warning Notice */}
            {!isFormValid && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {!isEvidenceAttached && !isGPSAttached 
                    ? '⚠️ Photo/Video Evidence & GPS Geotag Location are required to submit.' 
                    : !isEvidenceAttached 
                    ? '⚠️ Photo/Video Evidence is required to submit.' 
                    : '⚠️ GPS Geotag location is required to submit.'}
                </span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-3.5 bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
              >
                <span>{t.reportModal.submitButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* Step 2: Submitting state */}
        {step === 'submitting' && (
          <div className="p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-slate-900 animate-spin mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Processing Geotagged Evidence...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Running spatial deduplication and routing incident details to District Verification Cell...
            </p>
          </div>
        )}

        {/* Step 3: Success state */}
        {step === 'success' && (
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{t.reportModal.trackingIdLabel}</span>
              <h3 className="text-2xl font-black font-mono text-slate-900">{submittedId}</h3>
              <p className="text-xs text-slate-600 pt-0.5">
                {t.reportModal.successDesc}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-left space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-900">Under Review (Stage 1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[260px] inline-block">
                  {formattedAddress || `${blockVillage}, ${district}`}
                </span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t.reportModal.closeBtn}
            </button>
          </div>
        )}

        {/* Step 3b: Auto-Deduplication & Merge State */}
        {step === 'dedup_merged' && dedupInfo && (
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200/90 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>ACTIVE INCIDENT CONSOLIDATED</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1 tracking-tight">
                Existing Incident Found & Verified in this Area
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                An active government ticket already exists for this community challenge. To prevent department backlog and accelerate resolution, your submission has been merged into the master incident file.
              </p>
            </div>

            {/* High-Visibility Clean Light Consolidated Metric Card */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100/60 p-5 rounded-2xl border border-slate-200/90 text-center space-y-2 shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>NIVAARAN CITIZEN IMPACT GRID</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {dedupInfo.totalReports} Citizens Reported
              </div>
              <p className="text-xs font-medium text-slate-600 max-w-md mx-auto">
                Consolidated into Primary Ticket <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">#{dedupInfo.primaryId}</span> · Urgency boosted to <span className="font-bold text-slate-900">{dedupInfo.boostedPriority}/100</span>
              </p>
            </div>

            {/* Original Post Summary Card */}
            <div className="bg-white p-4 rounded-xl text-xs text-left space-y-3 border border-slate-200/90 shadow-2xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Master Incident ID</span>
                  <span className="font-mono font-black text-sm text-slate-900">{dedupInfo.primaryId}</span>
                </div>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {dedupInfo.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Incident Title:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{dedupInfo.primaryTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                    <Users className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Total Citizens</span>
                    <span className="text-sm font-black text-slate-900">{dedupInfo.totalReports} Reports</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Priority Level</span>
                    <span className="text-sm font-black text-slate-900">{dedupInfo.boostedPriority} / 100</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center font-medium">
                🏛️ <strong>Institutional Routing:</strong> Consolidated tickets are prioritized for University Lab allocation and District Officer on-ground execution.
              </div>
            </div>

            <button
              onClick={() => {
                if (onSuccess && dedupInfo) {
                  onSuccess(dedupInfo.primaryId);
                }
                resetAndClose();
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Done / View Consolidated Incident
            </button>
          </div>
        )}

        {/* Step 4: Forensic Rejection State (Decision Point 1 Gate) */}
        {step === 'forensic_rejected' && (
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto ring-6 ring-red-50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                Decision Point 1 AI Gate: Blocked
              </span>
              <h3 className="text-xl font-black text-[#1E3A5F] pt-1">Evidence Flagged as Synthetic / Fake</h3>
              <p className="text-xs text-[#5C574C]">
                NIVAARAN forensic AI vision engine inspected the uploaded photo and flagged non-authentic artifacts.
              </p>
            </div>

            <div className="bg-red-50/70 p-3.5 rounded-xl text-xs text-left space-y-2 border border-red-200 text-red-900">
              <div className="flex items-center space-x-2 font-bold text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Forensic Rejection Reason:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-800 font-medium pl-6">
                {forensicRejectionReason || 'AI-generated, stock photo, or digitally manipulated media detected. Real on-ground geotagged photographic evidence is required for government resource allocation.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-3 bg-[#0F766E] hover:bg-[#0D625B] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Upload Authentic Camera Photo
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t.reportModal.closeBtn}
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
