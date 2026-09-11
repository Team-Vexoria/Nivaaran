import React, { useState } from 'react';
import { 
  X, Radio, Send, MessageSquare, PhoneCall, Volume2, VolumeX,
  CheckCircle2, Globe, ShieldAlert, RefreshCw
} from 'lucide-react';
import { 
  dispatchBroadcast, 
  startEmergencySiren, 
  stopEmergencySiren, 
  isSirenPlaying,
  EmergencyAlertPayload 
} from '../../services/emergencyBroadcastService';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrict?: string;
  defaultHazard?: string;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultDistrict = 'Ranchi',
  defaultHazard = 'Flash Flood & River Swell Warning'
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [hazardType, setHazardType] = useState(defaultHazard);
  const [severityLevel, setSeverityLevel] = useState<'CRITICAL' | 'HIGH' | 'MODERATE'>('CRITICAL');
  const [selectedChannels, setSelectedChannels] = useState({
    sms: true,
    whatsapp: true,
    ivr: true,
    siren: true,
  });
  const [language, setLanguage] = useState<'all' | 'hi' | 'en' | 'sa'>('all');
  const [isLiveSirenTesting, setIsLiveSirenTesting] = useState(false);
  
  // Custom message templates
  const [customHindiMsg, setCustomHindiMsg] = useState(
    '⚠️ आपातकालीन चेतावनी (झारखंड आपदा प्रबंधन): स्वर्णरेखा नदी जलस्तर खतरे के निशान 5.5m के पार। नामकुम एवं हेसाग पंचायत के सभी नागरिक तुरंत ऊंचे स्थानों पर जाएं। आपातकालीन हेल्पलाइन: 1077 / 112।'
  );
  const [customEnglishMsg, setCustomEnglishMsg] = useState(
    '⚠️ EMERGENCY ALERT (Jharkhand SDMA): Subarnarekha water level has crossed critical danger threshold (5.5m). Residents of Namkum & Hesag are advised to evacuate to nearest cyclone shelters. Helpline: 1077 / 112.'
  );
  const [customSanthaliMsg, setCustomSanthaliMsg] = useState(
    '⚠️ ᱡᱟᱦᱮᱨ ᱦᱩᱥᱤᱭᱟᱹᱨ (ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱟᱯᱚᱫᱽ ᱯᱚᱨᱤᱪᱟᱲᱚᱱ): ᱥᱩᱵᱚᱨᱱᱟᱨᱮᱠᱷᱟ ᱫᱟᱜ ᱟᱹᱰᱤ ᱪᱮᱛᱟᱱ ᱨᱟᱠᱟᱵ ᱟᱠᱟᱱᱟ। ᱥᱟᱱᱟᱢ ᱦᱚᱲ ᱪᱮᱛᱟᱱ ᱡᱟᱭᱜᱟ ᱛᱮ ᱪᱟᱞᱟᱜ ᱯᱮ। ᱦᱮᱞᱯᱞᱟᱭᱤᱱ: 1077।'
  );

  // Dispatch simulation state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [dispatchCompleted, setDispatchCompleted] = useState(false);
  const [stats, setStats] = useState({
    smsSent: 0,
    waSent: 0,
    ivrQueued: 0,
    sirensActivated: 0,
  });

  if (!isOpen) return null;

  const handleToggleTestSiren = () => {
    if (isSirenPlaying()) {
      stopEmergencySiren();
      setIsLiveSirenTesting(false);
    } else {
      startEmergencySiren();
      setIsLiveSirenTesting(true);
    }
  };

  const handleStartBroadcast = () => {
    setIsDispatching(true);
    setDispatchProgress(10);
    setDispatchCompleted(false);

    // Create real payload
    const payload: EmergencyAlertPayload = {
      id: `CAP-${Date.now()}`,
      district: selectedDistrict,
      hazard: hazardType,
      severity: severityLevel,
      messageHindi: customHindiMsg,
      messageEnglish: customEnglishMsg,
      messageSanthali: customSanthaliMsg,
      channels: selectedChannels,
      timestamp: new Date().toISOString(),
      active: true,
    };

    // Dispatch real-time cross-portal event & siren
    dispatchBroadcast(payload);

    const interval = setInterval(() => {
      setDispatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDispatching(false);
          setDispatchCompleted(true);
          setStats({
            smsSent: 46210,
            waSent: 38940,
            ivrQueued: 14200,
            sirensActivated: 8,
          });
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleReset = () => {
    stopEmergencySiren();
    setDispatchProgress(0);
    setDispatchCompleted(false);
    setIsDispatching(false);
    setIsLiveSirenTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black font-heading tracking-wide text-white">
                  Multi-Channel Emergency CAP Broadcast Center
                </h2>
                <span className="text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-700 px-2 py-0.5 rounded">
                  NDMA / SDMA Protocol v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time dispatch across Web Audio Siren, Native Push, Telecom SMS, WhatsApp, and IVR Voice.
              </p>
            </div>
          </div>

          <button
            onClick={() => { stopEmergencySiren(); onClose(); }}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Target Parameters Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Target Disaster District:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold"
              >
                <option value="Ranchi">Ranchi (14 High-Risk Panchayats)</option>
                <option value="Dhanbad">Dhanbad (Mining & Subsidence Zone)</option>
                <option value="East Singhbhum">East Singhbhum (Subarnarekha Basin)</option>
                <option value="Bokaro">Bokaro (Damodar River Belt)</option>
                <option value="Palamu">Palamu (Drought & Water Scarcity)</option>
                <option value="Garhwa">Garhwa (Drought Zone)</option>
                <option value="Deoghar">Deoghar (Urban Heatwave & Flash Flood)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Hazard Trigger Classification:</label>
              <input
                type="text"
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">CAP Threat Severity:</label>
              <div className="flex gap-1.5">
                {(['CRITICAL', 'HIGH', 'MODERATE'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityLevel(sev)}
                    className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      severityLevel === sev
                        ? sev === 'CRITICAL'
                          ? 'bg-red-600 border-red-500 text-white ring-2 ring-red-400/30'
                          : sev === 'HIGH'
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-yellow-600 border-yellow-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Channels Switcher & Live Siren Test */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-teal-400" />
                Select Multi-Channel Dispatch Outlets:
              </span>
              
              {/* Test Real Web Audio Siren button */}
              <button
                type="button"
                onClick={handleToggleTestSiren}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isLiveSirenTesting
                    ? 'bg-red-600 border-red-500 text-white animate-pulse'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isLiveSirenTesting ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isLiveSirenTesting ? 'Stop Siren Audio' : 'Test Siren Audio (Speaker)'}</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
              {/* Channel 1: SMS */}
              <button
                type="button"
                onClick={() => setSelectedChannels(prev => ({ ...prev, sms: !prev.sms }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.sms
                    ? 'bg-teal-950/60 border-teal-500 text-teal-200'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Telecom SMS</span>
                  <span className="text-[10px] text-slate-400">48.5K Registered SIMs</span>
                </div>
              </button>

              {/* Channel 2: WhatsApp */}
              <button
                type="button"
                onClick={() => setSelectedChannels(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.whatsapp
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">WhatsApp Alert</span>
                  <span className="text-[10px] text-slate-400">Verified SDMA Channel</span>
                </div>
              </button>

              {/* Channel 3: IVR Voice */}
              <button
                type="button"
                onClick={() => setSelectedChannels(prev => ({ ...prev, ivr: !prev.ivr }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.ivr
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Auto IVR Call</span>
                  <span className="text-[10px] text-slate-400">Hindi & Santhali Voice</span>
                </div>
              </button>

              {/* Channel 4: Siren */}
              <button
                type="button"
                onClick={() => setSelectedChannels(prev => ({ ...prev, siren: !prev.siren }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChannels.siren
                    ? 'bg-red-950/60 border-red-500 text-red-200'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Village Siren PA</span>
                  <span className="text-[10px] text-slate-400">Speaker + LoRa Relays</span>
                </div>
              </button>
            </div>
          </div>

          {/* Multilingual CAP Message Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Multilingual CAP Broadcast Content:
              </span>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLanguage('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    language === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All (Trilingual)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    language === 'hi' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('sa')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    language === 'sa' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  संथाली (Santhali)
                </button>
              </div>
            </div>

            {/* Hindi Message */}
            {(language === 'all' || language === 'hi') && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400">🇮🇳 हिन्दी (Hindi Message):</span>
                <textarea
                  rows={2}
                  value={customHindiMsg}
                  onChange={(e) => setCustomHindiMsg(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-red-400 outline-hidden"
                />
              </div>
            )}

            {/* Santhali Message */}
            {(language === 'all' || language === 'sa') && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-teal-400">🏹 संथाली (Santhali Message · Ol Chiki Dialect):</span>
                <textarea
                  rows={2}
                  value={customSanthaliMsg}
                  onChange={(e) => setCustomSanthaliMsg(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-teal-400 outline-hidden"
                />
              </div>
            )}

            {/* English Message */}
            {language === 'all' && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-400">🇬🇧 English Message:</span>
                <textarea
                  rows={2}
                  value={customEnglishMsg}
                  onChange={(e) => setCustomEnglishMsg(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-medium focus:ring-1 focus:ring-blue-400 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Dispatch Progress Tracker */}
          {isDispatching && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Broadcasting CAP packets across {selectedDistrict} telecom cells & portals…
                </span>
                <span className="font-mono text-white">{dispatchProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${dispatchProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Broadcast Success Report */}
          {dispatchCompleted && (
            <div className="bg-emerald-950/70 border border-emerald-500 p-5 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-wider">
                  Emergency Broadcast Successfully Dispatched! Live Citizen Banners Active!
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 uppercase block">SMS Delivered</span>
                  <span className="text-base font-black text-white font-mono">{stats.smsSent.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 uppercase block">WhatsApp Delivered</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{stats.waSent.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 uppercase block">IVR Calls Queued</span>
                  <span className="text-base font-black text-blue-400 font-mono">{stats.ivrQueued.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 uppercase block">Sirens Triggered</span>
                  <span className="text-base font-black text-red-400 font-mono">{stats.sirensActivated} Units Active</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Authorized by Jharkhand State Disaster Management Authority (SDMA)</span>
          </div>

          <div className="flex items-center gap-3">
            {dispatchCompleted && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset Broadcast
              </button>
            )}

            <button
              type="button"
              disabled={isDispatching}
              onClick={handleStartBroadcast}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'Transmitting Broadcast…' : 'Transmit Emergency Broadcast Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
