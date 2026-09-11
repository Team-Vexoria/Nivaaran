import React, { useState, useEffect } from 'react';
import { 
  Radio, Volume2, VolumeX, X,
  PhoneCall
} from 'lucide-react';
import { 
  subscribeToEmergencyBroadcast, 
  dismissBroadcast, 
  startEmergencySiren, 
  stopEmergencySiren, 
  isSirenPlaying,
  EmergencyAlertPayload 
} from '../services/emergencyBroadcastService';
import { useLanguage } from '../context/LanguageContext';

export const LiveEmergencyAlertBanner: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlertPayload | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { currentLang } = useLanguage();

  useEffect(() => {
    const unsub = subscribeToEmergencyBroadcast((payload: EmergencyAlertPayload | null) => {
      setActiveAlert(payload);
      if (payload && payload.channels.siren) {
        setIsMuted(false);
      }
    });
    return () => unsub();
  }, []);

  if (!activeAlert) return null;

  const toggleSirenMute = () => {
    if (isSirenPlaying()) {
      stopEmergencySiren();
      setIsMuted(true);
    } else {
      startEmergencySiren();
      setIsMuted(false);
    }
  };

  const handleDismiss = () => {
    dismissBroadcast();
  };

  // Determine message based on citizen's selected language
  const localizedMessage = currentLang === 'hi' 
    ? activeAlert.messageHindi 
    : currentLang === 'sat' 
    ? activeAlert.messageSanthali || activeAlert.messageHindi
    : activeAlert.messageEnglish || activeAlert.messageHindi;

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white shadow-xl border-b-2 border-red-400 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Alert Indicator & Hazard Info */}
        <div className="flex items-start sm:items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white text-red-700 font-black flex items-center justify-center shrink-0 shadow-md">
            <Radio className="w-5 h-5 animate-spin" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] font-black uppercase bg-black/40 text-red-200 border border-red-300/40 px-2 py-0.5 rounded-full font-mono">
                CRITICAL DISASTER ALERT · {activeAlert.district.toUpperCase()}
              </span>
              <span className="text-xs font-black text-white font-heading">
                {activeAlert.hazard}
              </span>
            </div>
            <p className="text-xs text-white/95 font-medium leading-tight">
              {localizedMessage}
            </p>
          </div>
        </div>

        {/* Action Controls: Siren Mute, Helpline & Acknowledge */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          {/* Siren Mute/Play Button */}
          {activeAlert.channels.siren && (
            <button
              onClick={toggleSirenMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                !isMuted 
                  ? 'bg-white text-red-700 hover:bg-slate-100 ring-2 ring-white/50' 
                  : 'bg-red-950/60 text-red-200 hover:bg-red-950'
              }`}
              title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>Siren Playing</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Siren Muted</span>
                </>
              )}
            </button>
          )}

          {/* Helpline Link */}
          <a
            href="tel:1077"
            className="px-3 py-1.5 bg-black/30 hover:bg-black/40 text-white rounded-xl text-xs font-bold flex items-center space-x-1 border border-white/20 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>SDMA: 1077</span>
          </a>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Acknowledge and dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
