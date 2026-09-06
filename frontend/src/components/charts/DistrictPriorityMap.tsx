import React from 'react';

interface DistrictPriorityMapProps {
  data: { districtCode: string; districtName: string; totalChallenges: number; avgPriorityScore: number | null; topCategory?: string | null }[];
}

export const DistrictPriorityMap: React.FC<DistrictPriorityMapProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-64 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-center justify-center text-xs font-bold text-[#8A7F72]">No district data</div>;
  }

  const getColor = (score: number | null) => {
    if (score === null) return '#EAE4D8';
    if (score >= 7.5) return '#B3261E';
    if (score >= 5) return '#C98A2C';
    if (score >= 2.5) return '#B45309';
    return '#2C6E49';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {data.map(d => (
          <div
            key={d.districtCode}
            className="rounded-xl p-3 border border-[#E4DDD1] bg-white shadow-xs transition hover:shadow-xs flex flex-col justify-between min-h-[90px]"
            style={{ borderLeft: `4px solid ${getColor(d.avgPriorityScore)}` }}
          >
            <div>
              <p className="text-[10px] font-mono font-bold text-[#8A7F72] uppercase leading-none">{d.districtCode}</p>
              <p className="text-xs font-extrabold text-[#201C18] leading-tight mt-0.5 truncate" title={d.districtName}>{d.districtName}</p>
            </div>
            <div className="flex items-end justify-between mt-1">
              <span className="text-[10px] font-bold text-[#6A6155]">{d.totalChallenges} reports</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${d.avgPriorityScore !== null ? 'text-white' : 'text-[#8A7F72]'}`}
                style={d.avgPriorityScore !== null ? { backgroundColor: getColor(d.avgPriorityScore) } : { backgroundColor: '#EAE4D8' }}>
                {d.avgPriorityScore !== null ? d.avgPriorityScore.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
