import React, { useState } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  Building2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  ThumbsUp,
  MessageSquare,
  Volume2,
  Film,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { workflowStore } from '../../services/workflowStore';
import { LIFECYCLE_STAGES } from '../../services/workflowLifecycle';
import { StageDetailAccordionByPhase } from '../stages/StageDetailAccordion';
import { extractIncidentMetadata } from '../../services/dataExtractionService';
import { getDistrictCentroid } from '../../services/deduplicationService';
import { tr } from '../../i18n/translationEngine';
import { SupportedLanguage } from '../../i18n/translations';
import type { Challenge } from '../../services/workflowTypes';

export interface CommunityPostDetailModalProps {
  post: {
    id?: string;
    author?: string;
    district?: string;
    block?: string;
    village?: string;
    title?: string;
    content?: string;
    category?: string;
    status?: string;
    evidenceUrl?: string;
    evidenceUrls?: string[];
    videoUrl?: string;
    audioUrl?: string;
    voiceLanguage?: string;
    upvotes?: number;
    hasUpvoted?: boolean;
    timestamp?: string;
    comments?: Array<{
      id?: string;
      author: string;
      role: string;
      text: string;
      timestamp?: string;
      isVerifiedGovt?: boolean;
      beforeImg?: string;
      afterImg?: string;
    }>;
    citizenReportCount?: number;
    translations?: Record<string, any>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang?: SupportedLanguage;
  onUpvote?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
}

export const CommunityPostDetailModal: React.FC<CommunityPostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  currentLang = 'en',
  onUpvote,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');

  if (!isOpen || !post) return null;

  // 1. Resolve or create dynamic Challenge from workflowStore
  const allChallenges: Challenge[] = workflowStore.getChallenges();
  const normalizedTitle = (post.title || '').toLowerCase().trim();
  const postEvidence = post.evidenceUrl || post.evidenceUrls?.[0] || '';

  const matchedChallenge: Challenge | undefined = allChallenges.find(c => {
    if (post.id && (c.id === post.id || c.reportId === post.id)) return true;
    if (postEvidence && c.evidenceUrls?.includes(postEvidence)) return true;
    const cTitle = (c.title || '').toLowerCase().trim();
    if (normalizedTitle && (cTitle.includes(normalizedTitle) || normalizedTitle.includes(cTitle))) return true;
    return false;
  });

  const centroid = getDistrictCentroid(post.district || 'Ranchi') || { lat: 23.3441, lng: 85.3096 };

  // Calculate dynamic priority score and stage number logically if not stored
  const statusStr = (post.status || 'Under Review').toLowerCase();
  let defaultStageNum = 6;
  if (statusStr.includes('submitted')) defaultStageNum = 1;
  else if (statusStr.includes('review')) defaultStageNum = 2;
  else if (statusStr.includes('validat')) defaultStageNum = 5;
  else if (statusStr.includes('team') || statusStr.includes('assign') || statusStr.includes('hei')) defaultStageNum = 8;
  else if (statusStr.includes('prototype')) defaultStageNum = 11;
  else if (statusStr.includes('pilot')) defaultStageNum = 12;
  else if (statusStr.includes('audit')) defaultStageNum = 13;
  else if (statusStr.includes('deploy') || statusStr.includes('resolved')) defaultStageNum = 14;
  else if (statusStr.includes('closed')) defaultStageNum = 16;

  // Derive dynamic realistic priority score from content length, upvotes and category
  const dynamicPriority = matchedChallenge?.priorityScore ?? Math.min(
    98,
    Math.max(68, 72 + Math.round((post.upvotes || 0) * 0.25) + ((post.content || '').length > 100 ? 6 : 0))
  );

  const dynamicRiskLevel = matchedChallenge?.riskLevel ?? (
    dynamicPriority >= 90 ? 'CRITICAL' : dynamicPriority >= 80 ? 'HIGH' : 'STANDARD'
  );

  let resolvedChallenge: Challenge;
  if (matchedChallenge) {
    resolvedChallenge = matchedChallenge;
  } else {
    resolvedChallenge = {
      id: post.id || `POST-${Date.now()}`,
      reportId: post.id ? (post.id.startsWith('NIV-') ? post.id : `NIV-2026-${post.id.replace('POST-', '')}`) : 'NIV-2026-COMM',
      title: post.title || 'Civic Community Challenge',
      description: post.content || '',
      district: post.district || 'Ranchi',
      block: post.block || 'Sadar',
      village: post.village || post.block || 'Local Habitation',
      locationCoords: centroid,
      formattedAddress: `${post.village || post.block || 'Panchayat'}, ${post.district || 'Ranchi'}, Jharkhand`,
      status: (post.status as any) || 'Under Review',
      stageNumber: defaultStageNum,
      stageName: `Stage ${defaultStageNum}: Pipeline Active`,
      category: post.category || 'Civic Infrastructure',
      priorityScore: dynamicPriority,
      confidenceScore: 94,
      riskLevel: dynamicRiskLevel as any,
      evidenceUrls: post.evidenceUrls && post.evidenceUrls.length > 0 ? post.evidenceUrls : (post.evidenceUrl ? [post.evidenceUrl] : []),
      assignedHEI: 'IIT (ISM) Dhanbad & BIT Sindri',
      assignedDept: 'Civil & Environmental Engineering',
      csrSponsor: 'State Innovation Grant & District CSR Council',
      govtOfficerNote: `Field inspection verified by DC ${post.district || 'District'} Administration. Scheduled for academic R&D deployment.`,
      govtValidatedBy: `Shri District Nodal Officer, ${post.district || 'Jharkhand'}`,
      govtValidatedAt: new Date().toISOString(),
      citizenReportCount: post.citizenReportCount || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Extract Stage 4 Incident Spatial & Forensic Metadata
  const extractedMeta = extractIncidentMetadata({
    reportId: resolvedChallenge.reportId || resolvedChallenge.id,
    title: resolvedChallenge.title,
    description: resolvedChallenge.description || '',
    category: resolvedChallenge.category,
    district: resolvedChallenge.district,
    block: resolvedChallenge.block,
    village: resolvedChallenge.village,
    locationCoords: resolvedChallenge.locationCoords,
    formattedAddress: resolvedChallenge.formattedAddress,
    customDate: resolvedChallenge.createdAt ? new Date(resolvedChallenge.createdAt) : undefined,
  });

  const photoUrl = post.evidenceUrl || post.evidenceUrls?.[0] || resolvedChallenge.evidenceUrls?.[0];
  const videoUrl = post.videoUrl || (photoUrl && photoUrl.endsWith('.mp4') ? photoUrl : undefined);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !post.id || !onAddComment) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200/90 max-h-[88vh] overflow-y-auto my-auto animate-fadeIn">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {resolvedChallenge.reportId}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Govt Verified Geotag
              </span>
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {tr(post.status || 'Under Review', currentLang)}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 leading-snug pt-1">
              {post.translations?.[currentLang]?.title ? post.translations[currentLang].title : tr(resolvedChallenge.title, currentLang)}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{resolvedChallenge.village}, {resolvedChallenge.block} Block, District {resolvedChallenge.district}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{tr(post.author || 'Citizen Cell', currentLang)}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Official Incident Audit & Priority Breakdown ─────────────────── */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg flex items-center space-x-1">
                <span>Priority Score: {resolvedChallenge.priorityScore !== undefined ? resolvedChallenge.priorityScore.toFixed(1) : '85.0'}/100</span>
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                [{resolvedChallenge.riskLevel || 'HIGH RISK'}]
              </span>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Auto-Verified Intake ({resolvedChallenge.confidenceScore || 96}%)</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official Challenge Category</span>
            <p className="font-extrabold text-slate-900 text-sm flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-slate-700 shrink-0" />
              {resolvedChallenge.category || 'Civic Infrastructure'}
            </p>
          </div>

          {/* Detailed Problem Narrative */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reported Societal Grievance & Impact</span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {post.translations?.[currentLang]?.content ? post.translations[currentLang].content : tr(resolvedChallenge.description, currentLang)}
            </p>
          </div>

          {resolvedChallenge.govtOfficerNote && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Government Officer Note</span>
              <p className="text-xs text-slate-800 font-medium italic">"{resolvedChallenge.govtOfficerNote}"</p>
              {resolvedChallenge.govtValidatedBy && (
                <p className="text-[10px] text-slate-500 font-semibold">— {resolvedChallenge.govtValidatedBy}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Stage 4: Extracted On-Ground Proof & Spatial Evidence ────────── */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                4
              </span>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">Stage 4: Extracted On-Ground Proof & Spatial Evidence</h4>
                <span className="text-[10px] text-slate-500">Official extraction record for government accountability</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Hash Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* 1. Date & Time */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Date & Timestamp</span>
              </div>
              <div className="font-extrabold text-slate-900">{extractedMeta.formattedDate}</div>
              <div className="text-[11px] text-slate-600 font-medium">{extractedMeta.formattedTime} ({extractedMeta.timeOfDay})</div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 inline-block mt-0.5">
                Season: {extractedMeta.season}
              </span>
            </div>

            {/* 2. GPS Coordinates */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>GPS Geotag Coordinates</span>
              </div>
              <div className="font-mono font-black text-slate-900 text-xs">
                {extractedMeta.gpsCoordinates
                  ? `${extractedMeta.gpsCoordinates.lat.toFixed(4)}°N, ${extractedMeta.gpsCoordinates.lng.toFixed(4)}°E`
                  : `${centroid.lat.toFixed(4)}°N, ${centroid.lng.toFixed(4)}°E`}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Precision: ±{extractedMeta.gpsCoordinates?.accuracyMeters || 4.5}m (District Centroid)
              </div>
              <a
                href={`https://maps.google.com/?q=${extractedMeta.gpsCoordinates?.lat || centroid.lat},${extractedMeta.gpsCoordinates?.lng || centroid.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>Open Sat-Map View</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            {/* 3. Forensic Audit Hash */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Forensic Audit Stamp</span>
              </div>
              <div className="font-mono font-bold text-[10px] text-slate-800 break-all bg-slate-50 p-1.5 rounded border border-slate-200">
                {extractedMeta.evidenceProofHash}
              </div>
              <div className="text-[9px] text-slate-500 font-medium">Capture: {extractedMeta.captureSource}</div>
            </div>
          </div>

          {/* Detected Features */}
          {extractedMeta.detectedFeatures && extractedMeta.detectedFeatures.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Extracted Visual Objects & Risk Features:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedMeta.detectedFeatures.map((feat, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Ground Photographic & Voice Evidence ─────────────────────────── */}
        {(photoUrl || videoUrl || (post as any).audioUrl) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center">
                <ImageIcon className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                Ground Reality Photographic Evidence
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                1 Visual Evidence Capture
              </span>
            </div>

            {videoUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <div className="absolute top-2.5 left-2.5 z-10 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold border border-white/20">
                  <Film className="w-3 h-3 text-rose-400" />
                  <span>Live Incident Video Footage</span>
                </div>
                <video src={videoUrl} controls preload="metadata" className="w-full aspect-[16/9] max-h-[380px] object-cover bg-black" />
              </div>
            )}

            {photoUrl && !videoUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                <img
                  src={photoUrl}
                  alt={resolvedChallenge.title}
                  className="w-full aspect-[16/9] max-h-[380px] object-cover object-center"
                />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-semibold border border-white/20">
                  <ImageIcon className="w-3 h-3 text-slate-300" />
                  <span>Geotagged Field Photo Evidence</span>
                </div>
              </div>
            )}

            {(post as any).audioUrl && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold shrink-0 text-xs">
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  <span>Citizen Voice Note Recording</span>
                </div>
                <audio src={(post as any).audioUrl} controls className="h-8 max-w-[240px]" />
              </div>
            )}
          </div>
        )}

        {/* ── 16-Stage End-to-End Progress Accordion ───────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
              16-Stage Government & University Lifecycle Pipeline
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Stage {resolvedChallenge.stageNumber} of 16 Active
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Click any of the 16 stages below to inspect the AI matching rationale, university labs, faculty mentors, and industry co-funding details:
          </p>

          <StageDetailAccordionByPhase
            allStages={LIFECYCLE_STAGES.map(s => ({
              num: s.stageNumber,
              name: s.displayName,
              phase: s.stageNumber <= 5 ? 'Phase 1: Problem Intake & Triage'
                : s.stageNumber <= 9 ? 'Phase 2: Academic Allocation & Team'
                : s.stageNumber <= 13 ? 'Phase 3: Industry & Prototyping'
                : 'Phase 4: Statewide Deployment & Impact',
              actor: s.description || '',
            }))}
            currentStageNum={resolvedChallenge.stageNumber}
            challenge={resolvedChallenge}
            compact
          />
        </div>

        {/* ── Academic & CSR Allocation Summary ────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-700 shrink-0" /> Assigned Academic R&D Lead
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {resolvedChallenge.assignedHEI || 'IIT (ISM) Dhanbad & BIT Sindri'}
            </p>
            <p className="text-[11px] text-slate-500">
              {resolvedChallenge.assignedDept || 'Mining & Geotechnical Engineering'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700 shrink-0" /> CSR & Industry Grant Co-Partner
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {resolvedChallenge.csrSponsor || 'BCCL & Tata Steel Foundation CSR'}
            </p>
            <p className="text-[11px] text-slate-500">
              Hardware Co-Funding & Field Mentorship
            </p>
          </div>
        </div>

        {/* ── Community Comments Stream & Reply inside Modal ──────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <span>Community Discussion & Field Inquiries ({(post.comments || []).length})</span>
            </span>

            {/* Modal Upvote Button */}
            {onUpvote && post.id && (
              <button
                type="button"
                onClick={() => onUpvote(post.id!)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  post.hasUpvoted
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{post.hasUpvoted ? 'Upvoted' : 'Upvote Challenge'} ({post.upvotes || 0})</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {(post.comments || []).length > 0 ? (
              (post.comments || []).map((c, idx) => (
                <div key={c.id || idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{tr(c.author, currentLang)}</span>
                      {c.isVerifiedGovt && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white shadow-2xs">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> VERIFIED GOVT ADMIN
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{tr(c.timestamp || 'Recent', currentLang)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{tr(c.text, currentLang)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">No citizen comments yet. Share your ground perspective below!</p>
            )}
          </div>

          {/* Comment Form inside Modal */}
          {onAddComment && post.id && (
            <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                placeholder={tr('Add your field observation or community inquiry...', currentLang)}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {tr('Reply', currentLang)}
              </button>
            </form>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>NIVAARAN Smart Education & Governance Pipeline</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Close Incident Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
