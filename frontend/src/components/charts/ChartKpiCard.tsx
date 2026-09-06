import React from 'react';

interface ChartKpiCardProps {
  label: string;
  value: number | string;
  color?: string;
  bg?: string;
  subLabel?: string;
}

export const ChartKpiCard: React.FC<ChartKpiCardProps> = ({
  label, value, color = 'text-[#201C18]', bg = 'bg-white', subLabel,
}) => (
  <div className={`${bg} border border-[#E4DDD1] rounded-xl p-5 shadow-2xs transition-all hover:shadow-xs`}>
    <p className="text-[10px] text-[#8A7F72] font-bold uppercase tracking-wider mb-2">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    {subLabel && <p className="text-[11px] text-[#6A6155] mt-1 font-medium">{subLabel}</p>}
  </div>
);
