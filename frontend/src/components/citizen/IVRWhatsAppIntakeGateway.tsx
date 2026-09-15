import React, { useState, useRef } from 'react';
import { 
  PhoneCall, PhoneOff, MessageSquare, Send, Mic, Volume2, 
  Check, X, CheckCircle2, Paperclip, Camera, AlertTriangle, Loader2, 
  ShieldCheck, Sparkles
} from 'lucide-react';
import { workflowStore } from '../../services/workflowStore';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { runAITriageEngineAsync, runAITriageEngine, isPlaceholderText, AITriageResult } from '../../services/aiTriageEngine';

export interface IVRWhatsAppIntakeGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketGenerated?: (reportId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string;
  time: string;
  triage?: {
    category: string;
    priorityScore: number;
    riskLevel: string;
    confidenceScore: number;
    docket: string;
    district: string;
  };
  isError?: boolean;
}

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'Bokaro', 'East Singhbhum', 'West Singhbhum', 
  'Saraikela Kharsawan', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Khunti', 
  'Gumla', 'Simdega', 'Latehar', 'Palamu', 'Garhwa', 'Chatra', 
  'Koderma', 'Deoghar', 'Dumka', 'Jamtara', 'Godda', 'Sahibganj', 
  'Pakur', 'Lohardaga'
];

// Sample genuine field photos for rapid testing if user does not upload a file
const SAMPLE_INCIDENT_PRESETS = [
  {
    label: 'Contaminated Handpump Water',
    url: 'https://cdn.ncbi.nlm.nih.gov/pmc/blobs/2e16/5920553/a342a6cbc907/nihms960800f1.jpg',
    defaultText: 'Ranchi Hutup handpump discharging red turbid water with metallic odor affecting 40 households',
  },
  {
    label: 'Road Breach & Culvert Collapse',
    url: 'https://imgs.etvbharat.com/etvbharat/prod-images/22-08-2026/1200-675-27455673-thumbnail-16x9-land-subsidence-1-aspera.jpg',
    defaultText: 'Dhanbad main connector road cave in with 1.5m fracture blocking school bus transit',
  },
  {
    label: 'Storm Runoff Dam Overflow',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq1D23HuJQ6RVpd3c7min0GBgYLAgX9Z45pSscUBl66A3FD8_T6ZYPOpU&s=10',
    defaultText: 'Kanke dam spillway flood water inundating rural agriculture fields and village pathways',
  },
];

export const IVRWhatsAppIntakeGateway: React.FC<IVRWhatsAppIntakeGatewayProps> = ({
  isOpen,
  onClose,
  onTicketGenerated,
}) => {
  const { currentUser } = useAuth();
  const [activeChannel, setActiveChannel] = useState<'ivr' | 'whatsapp'>('whatsapp');

  // IVR state
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'recording' | 'submitted'>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<'hindi' | 'santhali' | 'english'>('hindi');
  const [selectedDomainKey, setSelectedDomainKey] = useState<string>('1');
  const [ivrTranscript, setIvrTranscript] = useState<string>('');
  const [ivrDistrict, setIvrDistrict] = useState<string>('Ranchi');
  const [ivrError, setIvrError] = useState<string>('');
  const [generatedTicketId, setGeneratedTicketId] = useState<string>('');

  // WhatsApp state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Namaste! Welcome to NIVAARAN Official Citizen Grievance Desk for Jharkhand. To log an authentic field hazard for government inspection, please provide a detailed description (at least 15 characters) specifying what happened and your district or locality, and attach a photo using the paperclip or camera icon.',
      time: '10:00 AM'
    }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleStartCall = () => {
    setCallState('calling');
    setTimeout(() => {
      setCallState('connected');
    }, 1200);
  };

  const handleKeyPress = (num: string) => {
    setSelectedDomainKey(num);
  };

  const handlePopulateSampleIvr = () => {
    setIvrTranscript('Hamare gaon me handpump ka paani laal rang ka nikal raha hai aur peene me lohe jaisa lagta hai. Kripya shighra jaanch karein.');
    setIvrError('');
  };

  const handleFinishRecording = () => {
    const cleanTranscript = ivrTranscript.trim();
    if (!cleanTranscript || cleanTranscript.length < 15 || isPlaceholderText(cleanTranscript)) {
      setIvrError('Please provide a genuine audio transcript (at least 15 characters) describing the issue before submitting.');
      return;
    }
    setIvrError('');
    setCallState('recording');

    setTimeout(() => {
      const ticketId = `JH-2026-IVR-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTicketId(ticketId);
      setCallState('submitted');

      // Run AI triage regressor on voice transcript
      const categoryFromKey: Record<string, string> = {
        '1': 'Clean Water & Sanitation',
        '2': 'Mining & Coalfire Hazards',
        '3': 'Agriculture & Soil Degradation',
        '4': 'Roads & Bridge Infrastructure',
      };
      const initialCat = categoryFromKey[selectedDomainKey] || 'Civic Infrastructure';
      const triageRes = runAITriageEngine(initialCat, cleanTranscript, 1);

      workflowStore.addChallenge({
        id: ticketId,
        reportId: ticketId,
        title: triageRes.matchedProblem || `IVR Voice Grievance: ${triageRes.category} in ${ivrDistrict}`,
        description: `Caller voice transcript: "${cleanTranscript}" received via Toll Free Helpline 1070 / 1800 345 6555. Language: ${selectedLanguage.toUpperCase()}.`,
        category: triageRes.category,
        district: ivrDistrict,
        block: `${ivrDistrict} Rural Block`,
        village: 'Ward Area',
        stageNumber: 2,
        stageName: 'Under Review',
        evidenceUrls: [],
        status: 'Under Review',
        priorityScore: triageRes.priorityScore,
        riskLevel: triageRes.riskLevel,
        reporterId: currentUser?.uid,
        reporterEmail: currentUser?.email || undefined,
        reporterName: currentUser?.displayName || 'IVR Caller',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      try {
        const userKey = `nivaaran_my_reports_${currentUser?.uid || currentUser?.email || 'guest'}`;
        const myIds: string[] = JSON.parse(localStorage.getItem(userKey) || '[]');
        if (!myIds.includes(ticketId)) {
          myIds.unshift(ticketId);
          localStorage.setItem(userKey, JSON.stringify(myIds));
        }
      } catch (err) {
        console.warn('Failed to save IVR report locally', err);
      }

      notificationService.addNotification({
        title: `New Toll Free IVR Grievance: ${ticketId}`,
        message: `Citizen audio complaint recorded from ${ivrDistrict}: "${cleanTranscript.slice(0, 60)}..."`,
        type: 'emergency',
        reportId: ticketId,
        channel: 'in_app',
      });

      if (onTicketGenerated) onTicketGenerated(ticketId);
    }, 1500);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectSamplePreset = (preset: typeof SAMPLE_INCIDENT_PRESETS[0]) => {
    setAttachedImage(preset.url);
    if (!inputChat.trim()) {
      setInputChat(preset.defaultText);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userText = inputChat.trim();
    const currentImg = attachedImage;

    if (!userText && !currentImg) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      image: currentImg || undefined,
      time: timestamp,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputChat('');
    setAttachedImage(null);

    // Logical Validation 1: Description quality check
    if (!userText || userText.length < 15 || isPlaceholderText(userText)) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Description too short or incomplete: Please provide a meaningful description of the hazard (minimum 15 characters) specifying what occurred and your district or locality.',
            time: timestamp,
            isError: true,
          }
        ]);
      }, 500);
      return;
    }

    // Logical Validation 2: Photo evidence check
    if (!currentImg) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Photo Evidence Required: Official NIVAARAN verification requires photographic evidence to inspect the hazard and prevent false alerts. Please attach an incident photo using the paperclip or camera icon, or select a sample photo above.',
            time: timestamp,
            isError: true,
          }
        ]);
      }, 500);
      return;
    }

    // Logical Validation 3: Real Multimodal AI Triage & Forensic Check
    setIsAiAnalyzing(true);
    setChatMessages(prev => [
      ...prev,
      {
        id: `bot-analyzing-${Date.now()}`,
        sender: 'bot',
        text: 'Analyzing photo and incident details with NIVAARAN Multimodal AI Engine...',
        time: timestamp,
      }
    ]);

    try {
      const triageResult: AITriageResult = await runAITriageEngineAsync(
        userText.slice(0, 50),
        userText,
        1,
        currentImg
      );

      setIsAiAnalyzing(false);

      // Check if forensic verification rejected the photo
      if (triageResult.forensicStatus === 'REJECTED') {
        setChatMessages(prev => [
          ...prev.filter(m => !m.text.includes('Analyzing photo')),
          {
            id: `bot-rej-${Date.now()}`,
            sender: 'bot',
            text: `AI Verification Failed: The attached image could not be verified as a genuine field hazard. Reason: ${triageResult.fakeReason || 'Synthetic or non-hazard image detected'}. Please upload an authentic real-world photograph taken at the incident location.`,
            time: timestamp,
            isError: true,
          }
        ]);
        return;
      }

      // Detect district from user text or default to Ranchi
      const detectedDistrict = JHARKHAND_DISTRICTS.find(d => 
        userText.toLowerCase().includes(d.toLowerCase())
      ) || 'Ranchi';

      const ticket = `JH-2026-WA-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTicketId(ticket);

      // Add to workflowStore with real data and real evidence photo
      workflowStore.addChallenge({
        id: ticket,
        reportId: ticket,
        title: triageResult.matchedProblem || `WhatsApp Report: ${userText.slice(0, 45)}`,
        description: `Citizen grievance submitted via Official WhatsApp Gateway (+91 651 2446 070). Transcript: "${userText}"`,
        category: triageResult.category,
        district: detectedDistrict,
        block: `${detectedDistrict} Sadar`,
        village: 'Ward Area',
        stageNumber: 2,
        stageName: 'Under Review',
        evidenceUrls: [currentImg],
        status: 'Under Review',
        priorityScore: triageResult.priorityScore,
        riskLevel: triageResult.riskLevel,
        reporterId: currentUser?.uid,
        reporterEmail: currentUser?.email || undefined,
        reporterName: currentUser?.displayName || 'WhatsApp Citizen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      try {
        const userKey = `nivaaran_my_reports_${currentUser?.uid || currentUser?.email || 'guest'}`;
        const myIds: string[] = JSON.parse(localStorage.getItem(userKey) || '[]');
        if (!myIds.includes(ticket)) {
          myIds.unshift(ticket);
          localStorage.setItem(userKey, JSON.stringify(myIds));
        }
      } catch (err) {
        console.warn('Failed to save WhatsApp report locally', err);
      }

      notificationService.addNotification({
        title: `WhatsApp Helpline Report: ${ticket}`,
        message: `Verified grievance logged from ${detectedDistrict}: ${triageResult.category} (Priority: ${triageResult.priorityScore}/100)`,
        type: 'emergency',
        reportId: ticket,
        channel: 'in_app',
      });

      if (onTicketGenerated) onTicketGenerated(ticket);

      setChatMessages(prev => [
        ...prev.filter(m => !m.text.includes('Analyzing photo')),
        {
          id: `bot-ok-${Date.now()}`,
          sender: 'bot',
          text: `Grievance verified and registered successfully. Your Official Tracking Docket has been created and transmitted to the Government Review Queue.`,
          time: timestamp,
          triage: {
            category: triageResult.category,
            priorityScore: triageResult.priorityScore,
            riskLevel: triageResult.riskLevel,
            confidenceScore: triageResult.confidenceScore,
            docket: ticket,
            district: detectedDistrict,
          }
        }
      ]);
    } catch (err) {
      setIsAiAnalyzing(false);
      console.error('AI verification failed', err);
      setChatMessages(prev => [
        ...prev.filter(m => !m.text.includes('Analyzing photo')),
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'An error occurred during AI processing. Please retry sending your message with a valid photo.',
          time: timestamp,
          isError: true,
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 text-left">
      <div className="bg-white border border-[#E4DDD1] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#FAF8F4] border-b border-[#E4DDD1] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded-full border border-[#2C6E49]/20 uppercase">
                Digital Public Good
              </span>
              <span className="text-[10px] text-[#8A7F72]">·</span>
              <span className="text-[10px] text-[#5A5247] font-semibold">Toll Free 1070 & WhatsApp Service</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#201C18] mt-0.5">
              Citizen Offline Phone & WhatsApp Intake Gateway
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E4DDD1] bg-white text-xs font-extrabold">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'border-[#2C6E49] text-[#2C6E49] bg-[#FAF8F4]'
                : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>1. Official WhatsApp Helpline (+91 651 2446 070)</span>
          </button>
          <button
            onClick={() => setActiveChannel('ivr')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === 'ivr'
                ? 'border-[#2C6E49] text-[#2C6E49] bg-[#FAF8F4]'
                : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>2. Toll Free IVR Helpline (1070 / 1800 345 6555)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* WhatsApp Channel */}
          {activeChannel === 'whatsapp' && (
            <div className="bg-[#EFEAE2] border border-[#E4DDD1] rounded-2xl p-4 flex flex-col h-[520px]">
              
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs text-white">
                    NV
                  </div>
                  <div>
                    <p className="font-bold text-xs">NIVAARAN Official Grievance Bot</p>
                    <p className="text-[9px] text-emerald-200">Jharkhand State Citizen Emergency Desk</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded block">
                    +91 651 2446 070
                  </span>
                  <span className="text-[9px] text-emerald-200">AI Verification Active</span>
                </div>
              </div>

              {/* Sample Photo Presets for quick testing */}
              <div className="bg-white/80 border border-[#D5CDBF] rounded-xl p-2 my-2 text-[11px]">
                <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-[#5A5247]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Quick Test Evidence Samples:
                  </span>
                  <span className="text-[#8A7F72]">Click to attach</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_INCIDENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSamplePreset(preset)}
                      className="bg-stone-100 hover:bg-emerald-50 hover:text-[#2C6E49] border border-stone-200 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#DCF8C6] text-[#201C18] rounded-tr-none'
                          : msg.isError
                          ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-none'
                          : 'bg-white text-[#201C18] rounded-tl-none'
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/10 bg-black/5 max-h-48">
                          <img
                            src={msg.image}
                            alt="Incident Evidence"
                            className="w-full h-auto max-h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      <p>{msg.text}</p>

                      {/* Verified Docket Card */}
                      {msg.triage && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-200 bg-emerald-50/70 p-2.5 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-[#2C6E49]">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Incident Verified by AI Triage
                            </span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#C3E6D0]">
                              {msg.triage.docket}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-[#5A5247]">
                            <div><strong>Category:</strong> {msg.triage.category}</div>
                            <div><strong>District:</strong> {msg.triage.district}</div>
                            <div><strong>Priority Score:</strong> {msg.triage.priorityScore}/100</div>
                            <div><strong>Risk Level:</strong> {msg.triage.riskLevel}</div>
                          </div>
                          <p className="text-[10px] text-[#2C6E49] font-medium pt-1">
                            Transmitted to Government Review Queue and assigned University Research Cell.
                          </p>
                        </div>
                      )}

                      <span className="text-[9px] text-[#8A7F72] text-right block mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isAiAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 text-[#5A5247] shadow-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2C6E49]" />
                      <span>Verifying image authenticity and evaluating risk factors...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Attached Photo Preview */}
              {attachedImage && (
                <div className="bg-white border border-[#D5CDBF] rounded-xl p-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={attachedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg border" />
                    <div>
                      <p className="text-xs font-bold text-[#201C18]">Photo Evidence Attached</p>
                      <p className="text-[10px] text-[#8A7F72]">Ready for AI multimodal verification</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-[#D5CDBF]">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  title="Attach Photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-stone-100 text-[#5A5247] p-2.5 rounded-xl border border-[#E4DDD1] transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Capture or Select Image"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-stone-100 text-[#5A5247] p-2.5 rounded-xl border border-[#E4DDD1] transition-colors cursor-pointer hidden sm:flex"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  placeholder="Describe the incident (location, what happened)..."
                  className="flex-1 bg-white px-3.5 py-2.5 text-xs rounded-xl border border-[#E4DDD1] focus:outline-none focus:border-[#2C6E49]"
                />

                <button
                  type="submit"
                  disabled={isAiAnalyzing || (!inputChat.trim() && !attachedImage)}
                  className="bg-[#075E54] hover:bg-[#064d45] disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* IVR Phone Call Channel */}
          {activeChannel === 'ivr' && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">
                    Jharkhand State Citizen Emergency Call Desk
                  </span>
                  <p className="text-sm font-black text-[#201C18]">
                    Toll Free: 1070 (Disaster Management) / 1800 345 6555 (Jan Samvad)
                  </p>
                  <p className="text-[11px] text-[#6A6155]">
                    Accessible from any 2G feature phone without internet or smartphone
                  </p>
                </div>
                {callState === 'idle' && (
                  <button
                    onClick={handleStartCall}
                    className="bg-[#2C6E49] hover:bg-[#23583a] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Simulate Dial In</span>
                  </button>
                )}
                {['calling', 'connected'].includes(callState) && (
                  <button
                    onClick={() => setCallState('idle')}
                    className="bg-[#B3261E] hover:bg-[#911f18] text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Call</span>
                  </button>
                )}
              </div>

              {callState === 'calling' && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-[#2C6E49] rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#201C18]">Dialing Toll Free 1070 / 1800 345 6555...</p>
                  <p className="text-[11px] text-[#8A7F72]">Connecting to Jharkhand State Cloud IVR PBX Server</p>
                </div>
              )}

              {callState === 'connected' && (
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-[#2C6E49] animate-bounce" />
                      <span className="text-xs font-extrabold text-[#201C18]">IVR Voice Prompt Active</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#2C6E49]/10 text-[#2C6E49] px-2 py-0.5 rounded-full">
                      Call Connected · 00:18
                    </span>
                  </div>

                  {/* Language Selection */}
                  <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs space-y-2">
                    <p className="text-[#5A5247] italic">
                      "Nivaaran me aapka swagat hai. Hindi ke liye 1 dabayein, Santhali ke liye 2 dabayein, English ke liye 3 dabayein."
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedLanguage('hindi')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedLanguage === 'hindi' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        1. Hindi
                      </button>
                      <button 
                        onClick={() => setSelectedLanguage('santhali')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedLanguage === 'santhali' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        2. Santhali
                      </button>
                      <button 
                        onClick={() => setSelectedLanguage('english')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedLanguage === 'english' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        3. English
                      </button>
                    </div>
                  </div>

                  {/* Hazard Keypad Choice */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">
                      Step 2: Press Keypad to Choose Hazard Category
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: '1', label: '1. Water Contamination or Flood' },
                        { key: '2', label: '2. Mine Fire or Subsidence' },
                        { key: '3', label: '3. Agriculture or Soil Hazard' },
                        { key: '4', label: '4. Bridge or Road Damage' },
                      ].map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => handleKeyPress(cat.key)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                            selectedDomainKey === cat.key
                              ? 'border-[#2C6E49] bg-[#F0FAF4] text-[#2C6E49]'
                              : 'border-[#E4DDD1] hover:bg-[#FAF8F4] text-[#201C18]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transcript Recording & Input */}
                  <div className="space-y-2 pt-2 border-t border-[#F0EBE0]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8A7F72] uppercase">
                        Step 3: Caller Voice Grievance Statement (Speech to Text)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePopulateSampleIvr}
                          className="text-[10px] text-[#2C6E49] hover:underline font-bold cursor-pointer"
                        >
                          Load Sample Statement
                        </button>
                        <span className="text-[10px] font-mono text-[#2C6E49] flex items-center gap-1">
                          <Mic className="w-3 h-3 animate-pulse" /> Recording
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={ivrTranscript}
                      onChange={(e) => {
                        setIvrTranscript(e.target.value);
                        setIvrError('');
                      }}
                      placeholder="Speak or type caller audio transcript here (e.g. handpump water contamination or road collapse in your ward)..."
                      rows={3}
                      className="w-full p-2.5 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
                    />
                    {ivrError && (
                      <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {ivrError}
                      </p>
                    )}
                  </div>

                  {/* District & Submission */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5A5247]">District:</span>
                      <select
                        value={ivrDistrict}
                        onChange={(e) => setIvrDistrict(e.target.value)}
                        className="px-2 py-1 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg text-[#201C18]"
                      >
                        {JHARKHAND_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleFinishRecording}
                      className="bg-[#2C6E49] hover:bg-[#23583a] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Audio Grievance</span>
                    </button>
                  </div>
                </div>
              )}

              {callState === 'recording' && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 border-2 border-[#2C6E49] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#201C18]">Saving Call Recording & Running AI Triage...</p>
                </div>
              )}

              {callState === 'submitted' && (
                <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-2xl p-5 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[#2C6E49] mx-auto" />
                  <div>
                    <h4 className="text-sm font-black text-[#201C18]">Audio Grievance Registered Successfully</h4>
                    <p className="text-xs text-[#5A5247] mt-0.5">
                      The citizen was played a confirmation audio message with docket number:
                    </p>
                    <span className="inline-block mt-1 font-mono font-black text-sm bg-white border border-[#C3E6D0] text-[#2C6E49] px-3 py-1 rounded-lg">
                      {generatedTicketId}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6A6155]">
                    Simulated confirmation SMS dispatched to citizen phone number. Grievance has been classified by AI triage and pushed to the Government Review Queue.
                  </p>
                  <button
                    onClick={() => setCallState('idle')}
                    className="bg-[#2C6E49] text-white text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer"
                  >
                    Simulate Another Call
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
