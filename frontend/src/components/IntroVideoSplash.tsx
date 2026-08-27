import React, { useState, useEffect, useRef } from 'react';
import { SkipForward, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nivaaran_has_seen_intro_v1';

interface IntroVideoSplashProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const IntroVideoSplash: React.FC<IntroVideoSplashProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!hasSeen || forceShow) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      if (onComplete) onComplete();
    }
  }, [forceShow, onComplete]);

  const handleFinish = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleError = () => {
    setVideoError(true);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none"
      aria-label="NIVAARAN Introduction Video"
    >
      {!videoError ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          onEnded={handleFinish}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
        >
          <source src="/intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-center p-8 max-w-md bg-[#16293F] border border-nivaaran-accent/30 rounded-xl text-white shadow-2xl">
          <div className="w-14 h-14 bg-nivaaran-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-nivaaran-accent">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Welcome to NIVAARAN</h2>
          <p className="text-nivaaran-muted text-sm mb-6 leading-relaxed">
            Please place your 6-second video file at <code className="bg-black/40 text-nivaaran-accent px-1.5 py-0.5 rounded">frontend/public/intro.mp4</code>.
          </p>
          <button
            onClick={handleFinish}
            className="w-full py-3 px-6 bg-nivaaran-accent hover:bg-[#a66308] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Proceed to Platform</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Control Overlay */}
      {!videoError && (
        <div className="absolute bottom-8 right-8 z-10 flex items-center space-x-3">
          <button
            onClick={handleFinish}
            className="px-5 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Skip Intro</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Branding watermark during playback */}
      {!videoError && isPlaying && (
        <div className="absolute top-8 left-8 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-nivaaran-secondary animate-pulse" />
            <span className="font-bold text-xs tracking-wider uppercase text-nivaaran-bg">NIVAARAN</span>
          </div>
        </div>
      )}
    </div>
  );
};
