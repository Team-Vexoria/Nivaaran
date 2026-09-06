import React from 'react';
export const ChartNoData: React.FC<{ message?: string }> = ({ message = 'No data available' }) => (
  <div className="w-full h-48 flex items-center justify-center bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl">
    <p className="text-xs font-bold text-[#8A7F72]">{message}</p>
  </div>
);
