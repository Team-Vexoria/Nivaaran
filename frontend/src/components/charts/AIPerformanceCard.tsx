import React from 'react';

interface AIPerformanceProps {
  data: { avgConfidence: number; totalAnalyzed: number; avgPriorityScore: number };
}

export const AIPerformanceCard: React.FC<AIPerformanceProps> = ({ data }) => {
  const conf = Math.round((data?.avgConfidence || 0) * 100);
  const total = data?.totalAnalyzed || 0;
  const pri = Math.round((data?.avgPriorityScore || 0) * 10) / 10;

  return (
    <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2C6E49]/10 rounded-lg flex items-center justify-center text-[#2C6E49]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-[#201C18]">AI Performance</h3>
          <p className="text-[10px] text-[#8A7F72] font-bold">Gemini 1.5 Flash · 60-domain taxonomy</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-[#2C6E49]">{conf}%</p>
          <p className="text-[9px] text-[#6A6155] font-bold uppercase tracking-wider mt-0.5">Avg Confidence</p>
        </div>
        <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-[#C98A2C]">{total}</p>
          <p className="text-[9px] text-[#6A6155] font-bold uppercase tracking-wider mt-0.5">Analyzed</p>
        </div>
        <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-[#B3261E]">{pri}/10</p>
          <p className="text-[9px] text-[#6A6155] font-bold uppercase tracking-wider mt-0.5">Avg Priority</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] font-bold text-[#8A7F72] mb-1">
          <span>Confidence Score</span>
          <span>{conf}%</span>
        </div>
        <div className="h-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2C6E49] to-[#4A9C6B] rounded-full transition-all duration-700" style={{ width: `${conf}%` }} />
        </div>
      </div>
    </div>
  );
};
