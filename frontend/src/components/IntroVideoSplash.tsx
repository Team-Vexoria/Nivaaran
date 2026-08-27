import React, { useState, useEffect, useRef } from 'react';

interface IntroVideoSplashProps {
  userId?: string | null;
  onComplete: () => void;
}

export const IntroVideoSplash: React.FC<IntroVideoSplashProps> = ({
  userId,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsVisible(false);
      return;
    }

    const storageKey = `nivaaran_intro_seen_${userId}`;
    const hasSeen = localStorage.getItem(storageKey);

    if (hasSeen === 'true') {
      setIsVisible(false);
      onComplete();
    } else {
      setIsVisible(true);
    }
  }, [userId, onComplete]);

  const handleFinish = () => {
    if (userId) {
      localStorage.setItem(`nivaaran_intro_seen_${userId}`, 'true');
    }
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible || !userId) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        onError={handleFinish}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Very small minimalist skip button with no extra text */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleFinish}
          className="px-2.5 py-1 text-[11px] bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-sm border border-white/20 rounded transition-all tracking-wide uppercase font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  );
};
