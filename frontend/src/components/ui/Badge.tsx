import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'heritage' | 'spiritual' | 'nature' | 'adventure' | 'cultural' | 'beach' | 'wildlife';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'nature' }) => {
  const variantStyles = {
    heritage: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    spiritual: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    nature: 'bg-green-500/20 text-green-300 border-green-500/30',
    adventure: 'bg-red-500/20 text-red-300 border-red-500/30',
    cultural: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    beach: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    wildlife: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
