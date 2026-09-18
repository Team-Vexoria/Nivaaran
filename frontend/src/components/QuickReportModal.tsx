import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { 
  Camera, Upload, MapPin, CheckCircle, X, Loader2, ArrowRight, AlertTriangle, RefreshCw, ShieldAlert, TrendingUp, Users,
  Mic, Square, Volume2, VolumeX, Film, RotateCcw, Languages, Copy, Check, ShieldCheck, Sparkles, HelpCircle
} from 'lucide-react';
import { submitChallengeToFirestore, submitFeedPostToFirestore, uploadEvidenceAudio } from '../services/firebaseService';
import { runAITriageEngineAsync, runAITriageEngine, AITriageResult } from '../services/aiTriageEngine';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatStageName, getStageForStatus } from '../services/workflowLifecycle';
import { workflowStore } from '../services/workflowStore';
import { findSimilarChallenges, mergeWithPrimaryChallenge, getDistrictCentroid, type MergeResult } from '../services/deduplicationService';
import { extractIncidentMetadata } from '../services/dataExtractionService';
import {
  analyzeMissingInformation,
  speakAICounterQuestion,
  extractPopulationFromClarification,
  type ClarificationQuestion,
} from '../services/aiClarificationService';
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

const JHARKHAND_ISSUE_PRESETS = [
  {
    label: '🔥 Jharia Coalfire & Smoke',
    title: 'Subterranean coalfield fire & toxic gas venting in Lodna Colliery',
    desc: 'Ground subsidence cracks reaching 1.2m width and continuous carbon monoxide & sulphur dioxide emissions observed near Lodna 4-Pits residential quarters. Ground temperature 56°C.',
    district: 'Dhanbad',
    blockVillage: 'Jharia - Lodna Colliery',
    coords: { lat: 23.7460, lng: 86.4132 },
    address: 'Lodna 4-Pits Sector, Jharia Coalfield, Dhanbad, Jharkhand',
  },
  {
    label: '☠️ Giridih Arsenic Water',
    title: 'Severe handpump arsenic & fluoride toxicity in 18 Santhal tribal hamlets',
    desc: 'Hydrogeological sampling by PHED reveals arsenic levels at 0.08 mg/L (8x WHO safe limit) and fluoride at 3.6 mg/L across 42 handpumps in Tisri block.',
    district: 'Giridih',
    blockVillage: 'Tisri - Lokai & Baramasia',
    coords: { lat: 24.5821, lng: 86.0543 },
    address: 'Tisri Tribal Belt, Giridih District, Jharkhand',
  },
  {
    label: '☀️ Palamu Drought & Dry Wells',
    title: 'Severe rain-shadow agricultural drought & acute aquifer drawdown in North Koel basin',
    desc: 'Consecutive 45-day dry spell led to water table plunging below 42m depth across 1,800 hectares of paddy land in Chhatarpur block. 940 tribal families affected.',
    district: 'Palamu',
    blockVillage: 'Chhatarpur - Mahugawan',
    coords: { lat: 24.2341, lng: 84.1852 },
    address: 'Chhatarpur Block, Palamu District, Jharkhand',
  },
  {
    label: '🌊 Kanke School Road Flood',
    title: 'Kanke dam spillway overflow & Hutup culvert blockage flooding school access road',
    desc: 'Storm backwater accumulation in Hutup Panchayat has submerged the main access road under 3.5 feet of stagnant runoff. 450 students unable to reach Government High School Hutup.',
    district: 'Ranchi',
    blockVillage: 'Kanke - Hutup Panchayat',
    coords: { lat: 23.4031, lng: 85.3208 },
    address: 'Hutup Panchayat Main Road, Kanke, Ranchi, Jharkhand',
  },
  {
    label: '🐘 Betla Elephant Conflict',
    title: 'Elephant corridor fragmentation & nocturnal crop raiding in Betla buffer zone',
    desc: 'A herd of 16 Asiatic elephants entering agrarian settlements nightly in Barwadih block. 120+ farming families lost ₹22 lakh of paddy crops this season.',
    district: 'Latehar',
    blockVillage: 'Barwadih - Betla Fringe',
    coords: { lat: 23.8731, lng: 84.0640 },
    address: 'Betla Forest Buffer, Barwadih, Latehar, Jharkhand',
  },
  {
    label: '🏭 Saranda Karo Red Mud',
    title: 'Hematite red mud slurry runoff polluting Karo river tribal drinking sources',
    desc: 'Heavy rains breached opencast iron ore mine tailing bunds near Gua, discharging high-turbidity hematite red slurry (>450 NTU) into the Karo river.',
    district: 'West Singhbhum',
    blockVillage: 'Noamundi - Gua Basti',
    coords: { lat: 22.1854, lng: 85.3942 },
    address: 'Saranda Forest Fringe, Gua, West Singhbhum, Jharkhand',
  },
];

export const QuickReportModal: React.FC<QuickReportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { t, currentLang } = useLanguage();
  const [step, setStep] = useState<'form' | 'ai_clarification' | 'submitting' | 'success' | 'forensic_rejected' | 'dedup_merged'>('form');
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
  const [submittedCategory, setSubmittedCategory] = useState('');
  const [submittedPriority, setSubmittedPriority] = useState<number>(0);
  const [submittedRisk, setSubmittedRisk] = useState<string>('STANDARD');
  const [copiedId, setCopiedId] = useState(false);
  const [precomputedAITriage, setPrecomputedAITriage] = useState<AITriageResult | null>(null);
  const [isVerifyingRealtime, setIsVerifyingRealtime] = useState(false);
  const triagePromiseRef = useRef<Promise<AITriageResult> | null>(null);

  // Conversational AI Clarification State
  const [clarificationQuestion, setClarificationQuestion] = useState<ClarificationQuestion | null>(null);
  const [clarificationLang, setClarificationLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [clarificationAnswer, setClarificationAnswer] = useState<string>('');
  const [isSpeakingClarification, setIsSpeakingClarification] = useState(false);
  const [isRecordingClarification, setIsRecordingClarification] = useState(false);
  const [isProvisionalSubmission, setIsProvisionalSubmission] = useState(false);
  const clarificationSpeechCancelRef = useRef<(() => void) | null>(null);
  const clarificationRecognitionRef = useRef<any>(null);

  // Multilingual Voice Recording and Speech to Text State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN' | 'bn-IN' | 'sa-IN'>('hi-IN');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Helper to identify video items
  const isVideoUrl = (url: string) => {
    return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('/evidence_videos/');
  };

  const triggerInstantPreTriage = (compressedImage: string, currentTitle: string = title, currentDesc: string = description) => {
    if (!compressedImage || isVideoUrl(compressedImage)) return;
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

  // ── Voice Recording & Real-time Web Speech Transcription Handlers ──
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(250);
      setIsRecordingVoice(true);
      setRecordingDuration(0);
      setVoiceTranscript('');
      
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Real-time Speech-to-Text via Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceLanguage === 'sa-IN' ? 'hi-IN' : voiceLanguage;
        
        let finalTranscript = '';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const fullText = (finalTranscript + interimTranscript).trim();
          if (fullText) {
            setVoiceTranscript(fullText);
            setDescription(prev => (!prev || prev === voiceTranscript ? fullText : prev));
            setTitle(prev => {
              if (!prev || prev.startsWith('Voice Report:')) {
                const firstSentence = fullText.split(/[.?!।\n]/)[0].slice(0, 60);
                return firstSentence || 'Voice Report: ' + fullText.slice(0, 40);
              }
              return prev;
            });
          }
        };
        
        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
        };
        
        recognition.start();
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone access to record audio reports.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecordingVoice(false);
  };

  const clearVoiceRecording = () => {
    stopVoiceRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setVoiceTranscript('');
    setRecordingDuration(0);
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
      clearVoiceRecording();
      handleGetLocation();
    } else {
      stopCamera();
      stopVoiceRecording();
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
        // Geolocation denied/unavailable: anchor the report on the *selected
        // district's centroid* so the 4-stage dedup pipeline (Stage 3 GPS
        // proximity) still has a meaningful coordinate to compare. Previously
        // this hard-coded Ranchi (23.3441, 85.3096), which falsely anchored
        // every report — including Khunti, Palamu, etc. — to Ranchi and
        // triggered cross-district dedup matches. The centroid is district-
        // aware, so a Khunti report anchors in Khunti.
        const centroid = getDistrictCentroid(district);
        if (centroid) {
          setLocationCoords({ lat: centroid.lat, lng: centroid.lng });
          console.warn(`Geolocation unavailable; anchored to ${district} district centroid for dedup.`);
        } else {
          console.warn('Geolocation unavailable and district centroid unknown; dedup will use text matching only.');
        }
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
        if (file.type.startsWith('video/')) {
          // Video evidence: Read directly as Data URL without canvas image compression
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (typeof evt.target?.result === 'string') {
              const videoDataUrl = evt.target.result;
              setFilePreviews((prev) => [...prev, videoDataUrl]);
              // Video files bypass image forensic gate as requested; trigger text-based triage
              if (!precomputedAITriage) {
                const textTriage = runAITriageEngine(title || 'Incident Video Report', description || 'Citizen uploaded video evidence', 1);
                setPrecomputedAITriage(textTriage);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          // Photo evidence: High-speed compression to 480px wide, 55% JPEG quality (~20KB)
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
        }

        // Evidence S3 backup will fire AFTER challenge creation (needs challengeId)
      }
      input.value = '';
      if (!locationCoords) handleGetLocation();
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setPrecomputedAITriage(null);
  };

  // Strict Validation: Evidence (photo/video/audio) AND GPS location are REQUIRED
  const isEvidenceAttached = filePreviews.length > 0 || audioUrl !== null;
  const isGPSAttached = locationCoords !== null;
  const isFormValid = title.trim().length > 0 && description.trim().length > 0 && blockVillage.trim().length > 0 && isEvidenceAttached && isGPSAttached;

  // Conversational AI Speech and Clarification Handlers
  const playQuestionAudio = (q: ClarificationQuestion, lang: 'hi-IN' | 'en-IN') => {
    if (clarificationSpeechCancelRef.current) {
      clarificationSpeechCancelRef.current();
    }
    const textToSpeak = lang === 'hi-IN' ? q.questionHi : q.questionEn;
    clarificationSpeechCancelRef.current = speakAICounterQuestion(
      textToSpeak,
      lang,
      () => setIsSpeakingClarification(true),
      () => setIsSpeakingClarification(false)
    );
  };

  const stopQuestionAudio = () => {
    if (clarificationSpeechCancelRef.current) {
      clarificationSpeechCancelRef.current();
      clarificationSpeechCancelRef.current = null;
    }
    setIsSpeakingClarification(false);
  };

  const toggleClarificationLang = (newLang: 'hi-IN' | 'en-IN') => {
    setClarificationLang(newLang);
    if (clarificationQuestion) {
      playQuestionAudio(clarificationQuestion, newLang);
    }
  };

  const startClarificationVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }
    try {
      stopQuestionAudio();
      const recognition = new SpeechRecognition();
      clarificationRecognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = clarificationLang;

      let finalTranscript = '';
      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const full = (finalTranscript + interim).trim();
        if (full) {
          setClarificationAnswer(full);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Clarification speech recognition error:', err);
        setIsRecordingClarification(false);
      };

      recognition.onend = () => {
        setIsRecordingClarification(false);
      };

      recognition.start();
      setIsRecordingClarification(true);
    } catch (e) {
      console.warn('Clarification speech recognition start warning:', e);
      setIsRecordingClarification(false);
    }
  };

  const stopClarificationVoiceInput = () => {
    if (clarificationRecognitionRef.current) {
      try {
        clarificationRecognitionRef.current.stop();
      } catch {}
      clarificationRecognitionRef.current = null;
    }
    setIsRecordingClarification(false);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Inspect if critical parameters are missing
    const missingQ = analyzeMissingInformation({
      title,
      description,
      district,
      blockVillage,
      affectedPopulation,
      audioTranscript: voiceTranscript,
    });

    if (missingQ) {
      const isHindi = voiceLanguage === 'hi-IN' || currentLang === 'hi' || /[\u0900-\u097F]/.test(`${title} ${description}`);
      const targetLang: 'hi-IN' | 'en-IN' = isHindi ? 'hi-IN' : 'en-IN';
      setClarificationQuestion(missingQ);
      setClarificationLang(targetLang);
      setClarificationAnswer('');
      setStep('ai_clarification');
      setTimeout(() => {
        playQuestionAudio(missingQ, targetLang);
      }, 300);
      return;
    }

    executeFinalSubmission(false, description, affectedPopulation);
  };

  const handleClarificationSubmit = () => {
    stopQuestionAudio();
    stopClarificationVoiceInput();

    let finalDesc = description;
    let finalPop = affectedPopulation;

    if (clarificationAnswer.trim()) {
      const header = clarificationLang === 'hi-IN' ? 'नागरिक जमीनी स्पष्टीकरण' : 'Citizen Ground Clarification';
      finalDesc = `${description}\n\n[${header} / ${clarificationQuestion?.titleEn || 'Metrics'}]: ${clarificationAnswer.trim()}`;
      setDescription(finalDesc);

      const extracted = extractPopulationFromClarification(clarificationAnswer);
      if (extracted && (!finalPop || finalPop === 0)) {
        finalPop = extracted;
        setAffectedPopulation(extracted);
      }
    }

    executeFinalSubmission(false, finalDesc, finalPop);
  };

  const handleClarificationSkip = () => {
    stopQuestionAudio();
    stopClarificationVoiceInput();
    setIsProvisionalSubmission(true);
    executeFinalSubmission(true, description, affectedPopulation);
  };

  const executeFinalSubmission = async (
    isSkipped: boolean,
    descOverride?: string,
    popOverride?: number
  ) => {
    setStep('submitting');
    const finalDescription = descOverride !== undefined ? descOverride : description;
    const finalPopulation = popOverride !== undefined ? popOverride : affectedPopulation;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `JH-2026-NIV-${randomNum}`;
    const coords = locationCoords || undefined;
    const finalAddress = formattedAddress || `${blockVillage}, District ${district}`;

    const videoUrls = filePreviews.filter(isVideoUrl);
    const imageUrls = filePreviews.filter(u => !isVideoUrl(u));
    const isAllVideo = filePreviews.length > 0 && videoUrls.length === filePreviews.length;

    // 1. Instant Decision Point 1 Gate: Resolved in milliseconds from preloaded triage or fast engine.
    const TRIAGE_TIMEOUT_MS = 3000;
    const fallbackTriage = runAITriageEngine(title, finalDescription, 1);
    let aiResult: AITriageResult;
    if (precomputedAITriage) {
      aiResult = precomputedAITriage;
    } else if (triagePromiseRef.current) {
      aiResult = await Promise.race([
        triagePromiseRef.current,
        new Promise<AITriageResult>(r => setTimeout(() => r(fallbackTriage), TRIAGE_TIMEOUT_MS)),
      ]);
    } else if (imageUrls.length > 0) {
      aiResult = await Promise.race([
        runAITriageEngineAsync(title, finalDescription, 1, imageUrls[0]),
        new Promise<AITriageResult>(r => setTimeout(() => r(fallbackTriage), TRIAGE_TIMEOUT_MS)),
      ]);
    } else {
      aiResult = fallbackTriage;
    }

    // Apply 18 point penalty if citizen skipped clarification
    if (isSkipped) {
      const penalizedScore = Math.max(15, Math.round(aiResult.priorityScore - 18));
      aiResult = {
        ...aiResult,
        priorityScore: penalizedScore,
        riskLevel: penalizedScore >= 80 ? 'CRITICAL' : penalizedScore >= 60 ? 'HIGH' : penalizedScore >= 40 ? 'MEDIUM' : 'STANDARD',
        reasoning: `${aiResult.reasoning} [Provisional Intake: Citizen skipped AI clarification on missing community evidence. Priority score penalized by 18 points.]`,
      };
      setIsProvisionalSubmission(true);
    } else {
      setIsProvisionalSubmission(false);
    }

    // If fake image detected (only checked on static images, skipped on pure video submissions)
    if (!isAllVideo && imageUrls.length > 0 && (aiResult.isRealPhoto === false || aiResult.forensicStatus === 'REJECTED')) {
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
      const MERGE_TIMEOUT_MS = 5000;
      const mergeRes = await Promise.race([
        mergeWithPrimaryChallenge(dedupeResult.primaryChallenge.id, {
          title: title || 'Citizen Follow-up Report',
          description,
          evidenceUrls: filePreviews,
          locationCoords: coords,
          formattedAddress: finalAddress,
          village: blockVillage,
          block: blockVillage,
          district,
        }),
        new Promise<MergeResult>(r => setTimeout(() => r({
          success: true,
          newReportCount: 2,
          newPriorityScore: dedupeResult.primaryChallenge!.priorityScore || 60,
          newRiskLevel: dedupeResult.primaryChallenge!.riskLevel || 'MEDIUM',
        }), MERGE_TIMEOUT_MS)),
      ]);

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

    let uploadedAudioUrl = audioUrl || undefined;
    if (audioBlob) {
      try {
        uploadedAudioUrl = await Promise.race([
          uploadEvidenceAudio(audioBlob, `voice_${generatedId}.webm`),
          new Promise<string | undefined>(r => setTimeout(() => {
            console.warn('[QuickReportModal] Audio upload timed out — using local blob URL');
            r(audioUrl || undefined);
          }, 5000)),
        ]);
      } catch (e) {
        console.warn('Audio upload warning:', e);
      }
    }

    const primaryVideo = videoUrls[0] || undefined;
    const evidenceType: 'image' | 'video' | 'mixed' = videoUrls.length > 0 && imageUrls.length > 0 ? 'mixed' : videoUrls.length > 0 ? 'video' : 'image';

    try {
      await submitChallengeToFirestore({
        id: generatedId,
        reportId: generatedId,
        title: title || 'Local Community Issue',
        district,
        block: blockVillage || 'Central Block',
        village: blockVillage || 'Panchayat Area',
        category: aiResult.category,
        status: 'Under Review',
        summary: finalDescription || 'Reported by citizen with geotagged photo evidence.',
        evidenceUrl: filePreviews[0] || '', // S3 storage_ref / data URL
        evidenceUrls: filePreviews,
        videoUrl: primaryVideo,
        videoUrls: videoUrls,
        audioUrl: uploadedAudioUrl,
        voiceLanguage: audioUrl ? voiceLanguage : undefined,
        evidenceType: evidenceType,
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
        affectedPopulation: finalPopulation,
        economicValueEstimate,
        estimatedResolutionCost,
        reporterId: currentUser?.uid,
        reporterEmail: currentUser?.email || undefined,
        reporterName: currentUser?.displayName || 'Citizen Resident',
        isProvisionalIntake: isSkipped,
        provisionalReason: isSkipped ? 'Provisional Intake: Missing Community Impact Metrics (Citizen Skipped Clarification)' : undefined,
      });

      // Track this report as created by the current user
      try {
        const userKey = `nivaaran_my_reports_${currentUser?.uid || currentUser?.email || 'guest'}`;
        const myIds: string[] = JSON.parse(localStorage.getItem(userKey) || '[]');
        if (!myIds.includes(generatedId)) {
          myIds.unshift(generatedId);
          localStorage.setItem(userKey, JSON.stringify(myIds));
        }
      } catch (err) {
        console.warn('Failed to record user report ID locally', err);
      }

      submitFeedPostToFirestore({
        author: 'Citizen Resident',
        district,
        block: blockVillage || 'Local Block',
        title: title || 'Local Community Report',
        content: `${finalDescription} [Location: ${finalAddress}]`,
        upvotes: 1,
        category: aiResult.category,
        status: 'Under Review',
        evidenceUrl: filePreviews[0] || '',
        evidenceUrls: filePreviews,
        videoUrl: primaryVideo,
        videoUrls: videoUrls,
        audioUrl: uploadedAudioUrl,
        voiceLanguage: audioUrl ? voiceLanguage : undefined,
        evidenceType: evidenceType,
        translations: {
          [langCode]: {
            title: title || 'Local Community Report',
            content: `${finalDescription} [Location: ${finalAddress}]`,
          },
          en: {
            title: title || 'Local Community Report',
            content: `${finalDescription} [Location: ${finalAddress}]`,
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
      description: isSkipped
        ? `Challenge submitted under Provisional Intake. Citizen skipped AI clarification on missing ground metrics. Priority score penalized by 18 points (Final: ${aiResult.priorityScore}/100 [${aiResult.riskLevel}]).`
        : `Challenge submitted. Citizen provided verified ground metrics via AI conversation. Priority: ${aiResult.priorityScore}/100 [${aiResult.riskLevel}].`,
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
    setSubmittedCategory(aiResult.category);
    setSubmittedPriority(aiResult.priorityScore);
    setSubmittedRisk(aiResult.riskLevel);
    setStep('success');
    // Note: Do NOT call onSuccess(generatedId) here!
    // The citizen must first see the official Acceptance Screen.
    // onSuccess(generatedId) will be called when the citizen clicks "Proceed to My Reports".

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
            location: coords
              ? { lat: coords.lat, lng: coords.lng, district, block: blockVillage }
              : { district, block: blockVillage },
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
    stopQuestionAudio();
    stopClarificationVoiceInput();
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
    setSubmittedCategory('');
    setSubmittedPriority(0);
    setSubmittedRisk('STANDARD');
    setCopiedId(false);
    setIsVerifyingRealtime(false);
    setAffectedPopulation(undefined);
    setEconomicValueEstimate(undefined);
    setEstimatedResolutionCost(undefined);
    setClarificationQuestion(null);
    setClarificationAnswer('');
    setIsSpeakingClarification(false);
    setIsRecordingClarification(false);
    setIsProvisionalSubmission(false);
    onClose();
  };

  const handleProceedToReports = () => {
    const id = submittedId;
    resetAndClose();
    if (onSuccess && id) {
      onSuccess(id);
    }
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
            <form onSubmit={handleInitialSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* ── Multilingual Voice Reporting & Speech-to-Text Bar ── */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-emerald-50/50 border-2 border-amber-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                    isRecordingVoice ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
                  }`}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
                      🎙️ Speak in Your Language (बोलकर दर्ज करें)
                      <span className="text-[9px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Live STT</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-fills title, description & translates speech into challenge</span>
                  </div>
                </div>

                {/* Voice Language Selector */}
                <div className="flex items-center gap-1 bg-white border border-amber-200 rounded-lg p-0.5 shadow-2xs">
                  <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value as any)}
                    className="text-[11px] font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1 py-0.5"
                  >
                    <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
                    <option value="en-IN">🇬🇧 English</option>
                    <option value="bn-IN">🇮🇳 বাংলা (Bengali)</option>
                    <option value="sa-IN">🏹 संथाली / Regional</option>
                  </select>
                </div>
              </div>

              {/* Active Recording State vs Idle State vs Playback */}
              {isRecordingVoice ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span className="text-xs font-black text-rose-800">
                        Recording... ({Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Square className="w-3 h-3" /> Stop & Transcribe
                    </button>
                  </div>

                  {/* Animated Soundwave Visualizer */}
                  <div className="flex items-center justify-center gap-1 h-8 py-1">
                    {[40, 75, 100, 60, 85, 45, 95, 70, 30, 90, 65, 40, 80, 100, 50].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-150 animate-pulse"
                        style={{
                          height: `${Math.max(20, (h * ((recordingDuration % 3) + 1)) / 3)}%`,
                          animationDelay: `${i * 60}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {voiceTranscript && (
                    <p className="text-[11px] font-medium text-slate-800 bg-white/90 p-2 rounded-lg border border-rose-100 italic">
                      "{voiceTranscript}"
                    </p>
                  )}
                </div>
              ) : audioUrl ? (
                <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 block">Voice Note Recorded ({recordingDuration}s)</span>
                      <span className="text-[9px] text-emerald-700 font-semibold">✓ Attached to report as audio evidence</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <audio ref={audioElementRef} src={audioUrl} controls className="h-7 max-w-[200px]" />
                    <button
                      type="button"
                      onClick={clearVoiceRecording}
                      title="Re-record / Delete voice note"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="w-full py-2 px-3 bg-white hover:bg-amber-100/50 border border-amber-300 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs hover:border-amber-400 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>Tap to Speak in {voiceLanguage === 'hi-IN' ? 'हिन्दी (Hindi)' : voiceLanguage === 'bn-IN' ? 'বাংলা' : voiceLanguage === 'sa-IN' ? 'संथाली' : 'English'}</span>
                </button>
              )}
            </div>

            {/* Common Jharkhand Incident Presets */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block flex items-center gap-1">
                📍 Common Jharkhand Ground Issues (1-Click Fill)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {JHARKHAND_ISSUE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(preset.title);
                      setDescription(preset.desc);
                      setDistrict(preset.district);
                      setBlockVillage(preset.blockVillage);
                      setLocationCoords(preset.coords);
                      setFormattedAddress(preset.address);
                      triggerInstantPreTriage('', preset.title, preset.desc);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

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

                  <div className="flex flex-wrap gap-2.5">
                    {filePreviews.map((preview, idx) => {
                      const isVideo = isVideoUrl(preview);
                      return (
                        <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-600 group shadow-xs bg-slate-900">
                          {isVideo ? (
                            <div className="w-full h-full relative flex items-center justify-center">
                              <video src={preview} className="w-full h-full object-cover" muted />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                <Film className="w-6 h-6 text-white drop-shadow-md" />
                              </div>
                              <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Video
                              </span>
                            </div>
                          ) : (
                            <img src={preview} alt="Evidence preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-xs hover:bg-red-700 transition-colors z-10 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
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

        {/* Step: AI Conversational Voice Clarification */}
        {step === 'ai_clarification' && clarificationQuestion && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Header Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
                    🤖 NIVAARAN AI Ground Intake Cell
                    <span className="text-[9px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Clarification</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {clarificationLang === 'hi-IN'
                      ? 'सटीक समाधान के लिए AI द्वारा आवश्यक प्रश्न'
                      : 'AI counter question to complete critical impact metrics'}
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-white border border-amber-200 rounded-lg p-0.5 shadow-2xs">
                <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  type="button"
                  onClick={() => toggleClarificationLang('hi-IN')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                    clarificationLang === 'hi-IN'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🇮🇳 हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => toggleClarificationLang('en-IN')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                    clarificationLang === 'en-IN'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* AI Spoken Question Box */}
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-emerald-50/60 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className={`w-4 h-4 ${isSpeakingClarification ? 'text-amber-700 animate-pulse' : 'text-slate-600'}`} />
                  {clarificationLang === 'hi-IN' ? clarificationQuestion.titleHi : clarificationQuestion.titleEn}
                </span>

                {isSpeakingClarification && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                    Speaking Aloud...
                  </span>
                )}
              </div>

              {/* Animated Soundwave Visualizer when AI speaks */}
              {isSpeakingClarification && (
                <div className="flex items-center justify-center gap-1 h-6 py-0.5">
                  {[35, 70, 95, 55, 80, 40, 90, 65, 30, 85, 60, 40, 75, 95, 45].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-amber-600 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Question Text */}
              <p className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                "{clarificationLang === 'hi-IN' ? clarificationQuestion.questionHi : clarificationQuestion.questionEn}"
              </p>

              {/* Audio Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => playQuestionAudio(clarificationQuestion, clarificationLang)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{clarificationLang === 'hi-IN' ? 'दोबारा सुनें (Listen Again)' : 'Listen Again'}</span>
                </button>

                {isSpeakingClarification && (
                  <button
                    type="button"
                    onClick={stopQuestionAudio}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                    <span>{clarificationLang === 'hi-IN' ? 'आवाज़ रोकें (Mute)' : 'Mute'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Citizen Response Section: Voice or Text */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>
                  {clarificationLang === 'hi-IN' ? 'आपका उत्तर (बोलकर या लिखकर)' : 'Your Response (Voice or Text)'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {clarificationLang === 'hi-IN' ? 'माइक दबाकर बोलें' : 'Tap mic to speak'}
                </span>
              </label>

              {/* Voice Input Button */}
              {isRecordingClarification ? (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 flex items-center justify-between shadow-xs animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-black text-rose-900">
                      {clarificationLang === 'hi-IN' ? 'आपकी आवाज़ सुनी जा रही है...' : 'Listening to your response...'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={stopClarificationVoiceInput}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Square className="w-3 h-3" />
                    <span>{clarificationLang === 'hi-IN' ? 'बोलना समाप्त करें' : 'Done Speaking'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startClarificationVoiceInput}
                  className="w-full py-2.5 px-3 bg-white hover:bg-amber-50 border-2 border-amber-400 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer hover:border-amber-500"
                >
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>
                    {clarificationLang === 'hi-IN'
                      ? '🎙️ बोलकर उत्तर दें (Tap to Speak Answer in Hindi)'
                      : '🎙️ Tap to Speak Answer in English'}
                  </span>
                </button>
              )}

              {/* Text Input Area */}
              <textarea
                rows={3}
                value={clarificationAnswer}
                onChange={(e) => setClarificationAnswer(e.target.value)}
                placeholder={clarificationLang === 'hi-IN' ? clarificationQuestion.placeholderHi : clarificationQuestion.placeholderEn}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
              />

              {/* Context Hint */}
              <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{clarificationLang === 'hi-IN' ? clarificationQuestion.contextHintHi : clarificationQuestion.contextHintEn}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleClarificationSubmit}
                disabled={!clarificationAnswer.trim()}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
              >
                <span>
                  {clarificationLang === 'hi-IN' ? 'उत्तर जमा करें एवं आगे बढ़ें' : 'Submit Clarification and Proceed'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClarificationSkip}
                className="w-full py-2.5 bg-slate-100 hover:bg-amber-100/70 text-slate-700 hover:text-amber-950 border border-slate-300 hover:border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {clarificationLang === 'hi-IN'
                  ? 'जानकारी उपलब्ध नहीं है / प्रश्न छोड़ें (Skip Question)'
                  : 'I Do Not Have This Information / Skip'}
              </button>

              <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 text-center text-[10px] text-amber-900 font-medium">
                {clarificationLang === 'hi-IN'
                  ? '⚠️ ध्यान दें: जानकारी न होने पर प्रश्न छोड़ सकते हैं, किंतु अधूरी जानकारी से AI प्राथमिकता स्कोर में 18 अंकों की कटौती होगी और रिपोर्ट अनंतिम (Provisional) दर्ज होगी।'
                  : '⚠️ Notice: Skipping is allowed, but missing metrics deduct 18 points from AI Priority Score and flag the grievance as Provisional Intake.'}
              </div>
            </div>
          </div>
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

        {/* Step 3: Official Grievance Acceptance State */}
        {step === 'success' && (
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs ring-4 ring-emerald-50/50">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1 pt-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>DECISION POINT 1 GATE: ACCEPTED & LOGGED</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                Problem Successfully Registered & Accepted
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your civic grievance has cleared forensic verification and has been assigned an official government tracking identifier.
              </p>
            </div>

            {/* Tracking ID Badge with 1-Click Copy */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Official State Tracking Ticket ID
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400">
                  {submittedId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(submittedId);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer active:scale-95"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-extrabold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ticket ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Ticket Receipt Summary Grid */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-left space-y-2.5 border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Issue:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{title || 'Community Grievance'}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 uppercase shrink-0">
                  {submittedCategory || 'Triaged'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Lifecycle Stage</span>
                  <p className="font-extrabold text-slate-900">Stage 1: Under Review</p>
                  <p className="text-[9px] text-emerald-700 font-semibold">✓ Automated AI Intake Complete</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Geo Location</span>
                  <p className="font-extrabold text-slate-900 truncate">{blockVillage}, {district}</p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {locationCoords ? `${locationCoords.lat}°N, ${locationCoords.lng}°E` : 'District Centroid'}
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Uploaded Evidence</span>
                  <p className="font-extrabold text-slate-900">
                    {filePreviews.length} File{filePreviews.length !== 1 ? 's' : ''} {audioUrl ? '· 1 Voice Note' : ''}
                  </p>
                  <p className="text-[9px] text-slate-500">Forensic proof stamped</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">AI Priority Assessment</span>
                  <p className="font-extrabold text-slate-900">
                    {submittedPriority}/100 <span className="text-[10px] text-red-600 font-bold">[{submittedRisk}]</span>
                  </p>
                  <p className="text-[9px] text-slate-500">Routing to District Officer</p>
                </div>
              </div>

              {isProvisionalSubmission ? (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-950 font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>अनंतिम पंजीकरण (Provisional Intake / Incomplete Evidence)</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed pl-5">
                    आवश्यक जमीनी आंकड़े न होने के कारण AI प्राथमिकता स्कोर में 18 अंकों की कटौती लागू की गई है (अंतिम स्कोर: {submittedPriority}/100)। ऑन ग्राउंड फील्ड सत्यापन होने के बाद ही पूर्ण प्राथमिकता बहाल होगी।
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 text-[11px] text-emerald-950 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>आधिकारिक पंजीकरण सफल (AI Verified Intake):</strong> आपके द्वारा दिए गए जमीनी विवरण के आधार पर पूर्ण प्राथमिकता स्कोर ({submittedPriority}/100) आवंटित किया गया है।
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProceedToReports}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to My Reports & Track Progress</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done / Close Window
              </button>
            </div>
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
                const id = dedupInfo?.primaryId || submittedId;
                resetAndClose();
                if (onSuccess && id) {
                  onSuccess(id);
                }
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
