import React, { useState } from 'react';
import { 
  PhoneCall, PhoneOff, MessageSquare, Send, Mic, Volume2, 
  Check, X, CheckCircle2
} from 'lucide-react';
import { workflowStore } from '../../services/workflowStore';
import { notificationService } from '../../services/notificationService';

export interface IVRWhatsAppIntakeGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketGenerated?: (reportId: string) => void;
}

export const IVRWhatsAppIntakeGateway: React.FC<IVRWhatsAppIntakeGatewayProps> = ({
  isOpen,
  onClose,
  onTicketGenerated,
}) => {
  const [activeChannel, setActiveChannel] = useState<'ivr' | 'whatsapp'>('ivr');

  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'recording' | 'submitted'>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<'hindi' | 'santhali' | 'english'>('hindi');
  const [selectedDomainKey, setSelectedDomainKey] = useState<string>('');
  const [ivrTranscript, setIvrTranscript] = useState<string>('Hamare gaon me handpump ka paani laal rang ka nikal raha hai aur peene me lohe jaisa lagta hai. Kripya jaanch karein.');
  const [ivrDistrict, setIvrDistrict] = useState<string>('Ranchi');
  const [generatedTicketId, setGeneratedTicketId] = useState<string>('');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: 'Namaste! Welcome to NIVAARAN Jharkhand Societal Innovation Helpline. Please choose how to report: Type 1 for Clean Water, 2 for Mine Fire or Subsidence, 3 for Road or Bridge, 4 for Crop Disaster.', time: '10:00 AM' }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [whatsappStep, setWhatsappStep] = useState<number>(1);

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

  const handleFinishRecording = () => {
    setCallState('recording');
    setTimeout(() => {
      const ticketId = `JH-2026-IVR-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTicketId(ticketId);
      setCallState('submitted');

      workflowStore.addChallenge({
        id: ticketId,
        reportId: ticketId,
        title: `IVR Audio Report: High Iron Water Contamination in ${ivrDistrict}`,
        description: `Caller audio transcript: "${ivrTranscript}" via Toll Free Helpline 1800 345 NIVAARAN. Language: ${selectedLanguage.toUpperCase()}.`,
        category: 'Clean Water & Sanitation',
        district: ivrDistrict,
        block: `${ivrDistrict} Rural Block`,
        village: 'Ward 4',
        stageNumber: 2,
        stageName: 'Under Review',
        evidenceUrls: [],
        status: 'Under Review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      notificationService.addNotification({
        title: `New Toll Free IVR Report: ${ticketId}`,
        message: `Citizen audio complaint recorded from ${ivrDistrict}: "${ivrTranscript.slice(0, 60)}..."`,
        type: 'emergency',
        reportId: ticketId,
        channel: 'in_app',
      });

      if (onTicketGenerated) onTicketGenerated(ticketId);
    }, 1500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const userText = inputChat.trim();
    const newMsgs = [...chatMessages, { sender: 'user' as const, text: userText, time: 'Just now' }];
    setChatMessages(newMsgs);
    setInputChat('');

    setTimeout(() => {
      if (whatsappStep === 1) {
        setChatMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Thank you. Please share your District name and village or ward location.', time: 'Just now' }
        ]);
        setWhatsappStep(2);
      } else if (whatsappStep === 2) {
        setChatMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Location received. Please describe the hazard or attach a photo.', time: 'Just now' }
        ]);
        setWhatsappStep(3);
      } else {
        const ticket = `JH-2026-WA-${Math.floor(1000 + Math.random() * 9000)}`;
        setGeneratedTicketId(ticket);
        setChatMessages(prev => [
          ...prev,
          { sender: 'bot', text: `Incident logged successfully! Your Official Tracking Docket is: ${ticket}. An automated SMS confirmation has been dispatched. Assigned HEI will survey the location.`, time: 'Just now' }
        ]);

        workflowStore.addChallenge({
          id: ticket,
          reportId: ticket,
          title: `WhatsApp Helpline Report: ${userText.slice(0, 45)}`,
          description: `Citizen report submitted via official WhatsApp Gateway +91 98351 24982. Message: "${userText}"`,
          category: 'Clean Water & Sanitation',
          district: 'Ranchi',
          block: 'Ranchi Sadar',
          village: 'Main Ward',
          stageNumber: 2,
          stageName: 'Under Review',
          evidenceUrls: [],
          status: 'Under Review',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (onTicketGenerated) onTicketGenerated(ticket);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[250] p-4 text-left">
      <div className="bg-white border border-[#E4DDD1] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#FAF8F4] border-b border-[#E4DDD1] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded-full border border-[#2C6E49]/20 uppercase">
                Low Connectivity Digital Public Good
              </span>
              <span className="text-[10px] text-[#8A7F72]">·</span>
              <span className="text-[10px] text-[#5A5247] font-semibold">Toll Free & WhatsApp Gateway</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#201C18] mt-0.5">
              Offline Phone & WhatsApp Citizen Intake Simulator
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#E4DDD1] bg-white text-xs font-extrabold">
          <button
            onClick={() => setActiveChannel('ivr')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === 'ivr'
                ? 'border-[#2C6E49] text-[#2C6E49] bg-[#FAF8F4]'
                : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>1. Toll Free IVR Helpline (1800 345 NIVAARAN)</span>
          </button>
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'border-[#2C6E49] text-[#2C6E49] bg-[#FAF8F4]'
                : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Official WhatsApp Chatbot (+91 98351 24982)</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeChannel === 'ivr' && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Jharkhand State Disaster Helpline</span>
                  <p className="text-sm font-black text-[#201C18]">Toll Free: 1800 345 NIVAARAN (1800 345 6482)</p>
                  <p className="text-[11px] text-[#6A6155]">Designed for 2G keypad feature phones without internet</p>
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
                  <p className="text-xs font-bold text-[#201C18]">Dialing Toll Free 1800 345 NIVAARAN...</p>
                  <p className="text-[11px] text-[#8A7F72]">Connecting to Jharkhand State Cloud IVR PBX Server</p>
                </div>
              )}

              {callState === 'connected' && (
                <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-[#2C6E49] animate-bounce" />
                      <span className="text-xs font-extrabold text-[#201C18]">IVR Voice Prompt Active (Simulated Audio)</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#2C6E49]/10 text-[#2C6E49] px-2 py-0.5 rounded-full">
                      Call Connected · 00:14
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs space-y-2">
                    <p className="text-[#5A5247] italic">
                      "Nivaaran me aapka swagat hai. Hindi ke liye 1 dabayein, Santhali ke liye 2 dabayein, English ke liye 3 dabayein."
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedLanguage('hindi')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedLanguage === 'hindi' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        1. Hindi
                      </button>
                      <button 
                        onClick={() => setSelectedLanguage('santhali')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedLanguage === 'santhali' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        2. Santhali
                      </button>
                      <button 
                        onClick={() => setSelectedLanguage('english')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedLanguage === 'english' ? 'bg-[#2C6E49] text-white' : 'bg-[#EAE4D8] text-[#201C18]'
                        }`}
                      >
                        3. English
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">
                      Step 2: Press Keypad to Choose Hazard Category
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: '1', label: '1. Water Contamination / Flood' },
                        { key: '2', label: '2. Mine Fire / Subsidence' },
                        { key: '3', label: '3. Agriculture / Soil Hazard' },
                        { key: '4', label: '4. Bridge / Road Hazard' },
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

                  <div className="space-y-2 pt-2 border-t border-[#F0EBE0]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8A7F72] uppercase">
                        Step 3: Caller Voice Message (Auto Speech to Text Transcribed)
                      </span>
                      <span className="text-[10px] font-mono text-[#2C6E49] flex items-center gap-1">
                        <Mic className="w-3 h-3 animate-pulse" /> Recording
                      </span>
                    </div>
                    <textarea
                      value={ivrTranscript}
                      onChange={(e) => setIvrTranscript(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5A5247]">District:</span>
                      <select
                        value={ivrDistrict}
                        onChange={(e) => setIvrDistrict(e.target.value)}
                        className="px-2 py-1 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg text-[#201C18]"
                      >
                        <option value="Ranchi">Ranchi</option>
                        <option value="Dhanbad">Dhanbad</option>
                        <option value="Bokaro">Bokaro</option>
                        <option value="East Singhbhum">East Singhbhum</option>
                        <option value="Hazaribagh">Hazaribagh</option>
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
                  <p className="text-xs font-bold text-[#201C18]">Saving Call Recording & Generating Ticket Docket...</p>
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
                    Simulated confirmation SMS dispatched to citizen phone number. Challenge has been pushed to the Government Review Queue.
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

          {activeChannel === 'whatsapp' && (
            <div className="bg-[#EFEAE2] border border-[#E4DDD1] rounded-2xl p-4 flex flex-col h-[420px]">
              <div className="bg-[#075E54] text-white p-3 rounded-xl flex items-center justify-between mb-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">
                    NV
                  </div>
                  <div>
                    <p className="font-bold text-xs">NIVAARAN Official Grievance Bot</p>
                    <p className="text-[9px] text-emerald-200">Verified State Emergency Service</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                  +91 98351 24982
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 p-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#DCF8C6] text-[#201C18] rounded-tr-none'
                          : 'bg-white text-[#201C18] rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-[#8A7F72] text-right block mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-[#D5CDBF]">
                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  placeholder="Type a message or response..."
                  className="flex-1 bg-white px-3.5 py-2 text-xs rounded-xl border border-[#E4DDD1] focus:outline-none focus:border-[#2C6E49]"
                />
                <button
                  type="submit"
                  className="bg-[#075E54] hover:bg-[#064d45] text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
