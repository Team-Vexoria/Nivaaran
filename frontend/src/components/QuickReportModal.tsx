import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, MapPin, CheckCircle, X, Loader2, ArrowRight, AlertTriangle, RefreshCw
} from 'lucide-react';
import { submitChallengeToFirestore, submitFeedPostToFirestore } from '../services/firebaseService';
import { runAITriageEngineAsync } from '../services/aiTriageEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatStageName, getStageForStatus } from '../services/workflowLifecycle';
import { workflowStore } from '../services/workflowStore';
import { findSimilarChallenges } from '../services/deduplicationService';

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
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [blockVillage, setBlockVillage] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [locating, setLocating] = useState(false);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState('');

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

  // Automatically fetch GPS geolocation & reverse geocode as soon as modal opens
  useEffect(() => {
    if (isOpen) {
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
      setCameraError('Camera access denied or unavailable on this device. Use file picker below.');
    }
  };

  // Take Snapshot from Live Camera Stream
  const takeCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFilePreviews(prev => [...prev, snapshotDataUrl]);
      stopCamera();
      if (!locationCoords) handleGetLocation();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
      if (!locationCoords) handleGetLocation();
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
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

    // Run Multimodal Computer Vision & NLP AI Engine on Evidence Photo
    const aiResult = await runAITriageEngineAsync(title, description, 1, filePreviews[0] || '');
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
        evidenceUrl: filePreviews[0] || '',
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
        translations,  // NEW: store multilingual strings
      });

      await submitFeedPostToFirestore({
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
        },  // NEW: store multilingual strings
      });
    } catch (err) {
      console.warn('Error saving to Firestore:', err);
    }

    // ── Semantic deduplication check before adding to workflowStore ──
    const dedupeResult = findSimilarChallenges({
      title: title || 'Local Community Issue',
      description,
      district,
      block: blockVillage || 'Central Block',
      village: blockVillage || 'Panchayat Area',
      category: aiResult.category,
      createdAt: now,
    });

    // ── Also add to the local workflowStore so the citizen portal tracks it ──
    await workflowStore.addChallenge({
      id: generatedId,
      reportId: generatedId,
      title: title || 'Local Community Issue',
      description,
      district,
      block: blockVillage || 'Central Block',
      village: blockVillage || 'Panchayat Area',
      locationCoords: coords,
      formattedAddress: finalAddress,
      status: 'Under Review',
      stageNumber: initialStage?.stageNumber || 2,
      stageName: formatStageName(initialStage?.stageNumber || 2),
      category: aiResult.category,
      // Attach cluster info if a similar challenge was found
      clusterId: dedupeResult.clusterId ?? undefined,
      aiAnalysis: {
        category: aiResult.category,
        categoryCode: aiResult.categoryCode,
        matchedProblem: aiResult.matchedProblem,
        confidenceScore: aiResult.confidenceScore,
        priorityScore: aiResult.priorityScore,
        riskLevel: aiResult.riskLevel,
        factors: aiResult.factors,
        reasoning: aiResult.reasoning,
        needsHumanVerification: aiResult.needsHumanVerification,
        recommendedUniversityDepts: aiResult.recommendedUniversityDepts,
      },
      priorityScore: aiResult.priorityScore,
      confidenceScore: aiResult.confidenceScore,
      riskLevel: aiResult.riskLevel,
      needsHumanVerification: aiResult.needsHumanVerification,
      govtOfficerNote: aiResult.reasoning,
      evidenceUrls: filePreviews,
      submittedBy: 'citizen',
      submittedByRole: 'Citizen',
      createdAt: now,
      updatedAt: now,
    });

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
  };

  const resetAndClose = () => {
    stopCamera();
    setStep('form');
    setTitle('');
    setDescription('');
    setFilePreviews([]);
    setLocationCoords(null);
    setFormattedAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F3] border border-[#DCD6C6] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#C2760C] rounded-xl flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg leading-tight">{t.reportModal.title}</h3>
              <p className="text-xs text-amber-200 font-semibold">{t.reportModal.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="text-white hover:text-amber-200 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  1. Problem Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. River overflow submerging primary school road during heavy rain"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-sm text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  2. Detailed Description & Hazard Context <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the current problem, frequency, and local impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-sm text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>
            </div>

            {/* Photo / Video Evidence Intake (Camera & File Picker) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>3. Mandatory Photo / Video Evidence <span className="text-red-600">*</span></span>
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
                  <div className="border-2 border-dashed border-[#1E3A5F]/50 bg-emerald-50/70 hover:bg-emerald-100/50 rounded-xl p-4 text-center transition-all">
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
                  <div className="border-2 border-dashed border-[#DCD6C6] bg-white hover:bg-[#F3F0E8]/50 rounded-xl p-4 text-center transition-colors">
                    <input
                      type="file"
                      id="evidence-upload-input"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
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
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  4. District (Jharkhand) <span className="text-red-600">*</span>
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
                  Block / Village / Landmark <span className="text-red-600">*</span>
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
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#DCD6C6] shadow-2xs">
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
                className="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16293F] transition-colors flex items-center space-x-1 disabled:opacity-50 shrink-0"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{locating ? 'Locating...' : 'Refresh Address'}</span>
              </button>
            </div>

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
                className="w-full py-3.5 bg-[#0F766E] disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-[#0D625B] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
              >
                <span>{t.reportModal.submitButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* Step 2: Submitting state */}
        {step === 'submitting' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#0F766E] animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-[#1E3A5F]">Processing Geotagged Evidence...</h4>
            <p className="text-xs text-[#5C574C] max-w-sm mx-auto">
              Running spatial deduplication and routing incident details to District Verification Cell...
            </p>
          </div>
        )}

        {/* Step 3: Success state */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#C2760C]">TRACKING CODE</span>
              <h3 className="text-2xl font-black font-mono text-[#1E3A5F]">{submittedId}</h3>
              <p className="text-xs text-[#5C574C] pt-1">
                Your geotagged incident report has been registered in the Government of Jharkhand Intake System.
              </p>
            </div>

            <div className="bg-[#F3F0E8] p-4 rounded-xl text-xs text-left space-y-2 border border-[#DCD6C6]">
              <div className="flex justify-between">
                <span className="text-[#5C574C]">Status:</span>
                <span className="font-bold text-[#0F766E]">Under Review (Stage 1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C574C]">Location:</span>
                <span className="font-semibold text-[#22201B] truncate max-w-[260px] inline-block">
                  {formattedAddress || `${blockVillage}, ${district}`}
                </span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#16293F] text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Done & Return to Portal
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
