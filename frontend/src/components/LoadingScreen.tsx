import React from 'react';

/**
 * Full-screen loading fallback rendered inside <Suspense> while a
 * lazily-loaded portal module is being fetched and parsed.
 */
export const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'Loading NIVAARAN…' }) => {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-nivaaran-primary border-t-transparent rounded-full animate-spin" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-black tracking-tight">NIVAARAN</span>
        <span className="text-xs font-bold text-nivaaran-primary">{label}</span>
      </div>
    </div>
  );
};
