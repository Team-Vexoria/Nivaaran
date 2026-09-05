import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const PortalEmptyState: React.FC<{ title: string; description: string; icon?: React.ReactNode }> = ({
  title,
  description,
  icon = <AlertCircle className="w-8 h-8 text-[#C98A2C]" />
}) => (
  <div className="bg-white border border-[#E4DDD1] rounded-2xl p-12 text-center shadow-2xs">
    {React.cloneElement(icon as React.ReactElement, { className: 'mx-auto mb-3 ' + (icon as React.ReactElement).props.className })}
    <h4 className="font-black text-[#201C18]">{title}</h4>
    <p className="text-xs text-[#6A6155] mt-1">{description}</p>
  </div>
);

export const PortalLoadingState: React.FC<{ message?: string }> = ({ message = 'Loading data…' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-3" />
    <p className="text-xs font-semibold text-[#8A7F72]">{message}</p>
  </div>
);

export const PortalErrorState: React.FC<{ error?: Error; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-2xs">
    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
    <h4 className="font-black text-red-900">Failed to load portal content</h4>
    {error && <p className="text-xs text-red-600 mt-1 font-mono">{error.message}</p>}
    <button
      onClick={onRetry}
      className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors"
    >
      Try Again
    </button>
  </div>
);
