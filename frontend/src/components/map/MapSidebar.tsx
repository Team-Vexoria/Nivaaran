import React from 'react';
import { MapPin, AlertCircle, TrendingUp, Filter, X } from 'lucide-react';
import { DistrictStat, getSeverityColor } from '../../services/mapDataService';
import { ChallengeDoc } from '../../services/firebaseService';
import { CHALLENGE_STATUS_OPTIONS } from '../../services/workflowLifecycle';
import { useLanguage } from '../../context/LanguageContext';

export type FilterState = {
  categories: string[];
  statuses: string[];
  riskLevels: string[];
};

interface MapSidebarProps {
  districtStats: Record<string, DistrictStat>;
  challenges: ChallengeDoc[];
  selectedDistrict: string | null;
  onDistrictSelect: (district: string | null) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  totalCount: number;
  criticalCount: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

const STATUS_OPTIONS = CHALLENGE_STATUS_OPTIONS;

const RISK_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'STANDARD'];

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  districtStats,
  selectedDistrict,
  onDistrictSelect,
  filters,
  onFiltersChange,
  totalCount,
  criticalCount,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const riskLabel: Record<string, string> = {
    CRITICAL: t.map.riskCritical || t.map.legendCritical || 'CRITICAL',
    HIGH: t.map.riskHigh || t.map.legendHigh || 'HIGH',
    MEDIUM: t.map.riskMedium || t.map.legendMedium || 'MEDIUM',
    STANDARD: t.map.riskStandard || t.map.legendStandard || 'STANDARD',
  };

  const statusLabel: Record<string, string> = {
    'Under Review': t.map.statusUnderReview || 'Under Review',
    'Government Validated': t.map.statusGovtValidated || 'Government Validated',
    'University Active': t.map.statusUniActive || 'University Active',
    'Resolved': t.map.statusResolved || 'Resolved',
  };

  const sortedDistricts = Object.values(districtStats).sort((a, b) => b.total - a.total);
  const maxCount = Math.max(...sortedDistricts.map(d => d.total), 1);
  const hasFilters =
    filters.categories.length > 0 || filters.statuses.length > 0 || filters.riskLevels.length > 0;

  const renderContent = (isMobile: boolean) => (
    <div className={`w-72 max-w-[85vw] flex flex-col bg-[#FAF8F4] border-r border-[#E4DDD1] overflow-hidden ${isMobile ? 'h-full shadow-2xl' : 'h-full'}`}>
      {/* Mobile-only Header with Close Button */}
      {isMobile && (
        <div className="px-3 py-2.5 bg-white border-b border-[#E4DDD1] flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[#201C18] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2C6E49]" />
            <span>Filters &amp; Districts</span>
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-[#6A6155] hover:text-[#201C18] rounded-lg hover:bg-[#FAF8F4]"
              title="Close Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── KPI Strip ── */}
      <div className="px-3 py-3 border-b border-[#E4DDD1] bg-[#F3EDE2] shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg border border-[#E4DDD1] px-2.5 py-2">
            <p className="text-[10px] text-[#6A6155] uppercase font-semibold">{t.map.statsTotal || t.map.totalReports}</p>
            <p className="text-xl font-black text-[#201C18]">{totalCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E4DDD1] px-2.5 py-2">
            <p className="text-[10px] text-[#6A6155] uppercase font-semibold">{t.map.statsCritical || t.map.critical}</p>
            <p className="text-xl font-black text-[#B3261E]">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-3 py-2.5 border-b border-[#E4DDD1] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#6A6155] uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            <span>{t.map.filtersTitle || t.map.filters}</span>
          </div>
          {hasFilters && (
            <button
              onClick={() => onFiltersChange({ categories: [], statuses: [], riskLevels: [] })}
              className="text-[9px] font-bold text-[#B5502D] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-2.5 h-2.5" /> {t.map.clearAll}
            </button>
          )}
        </div>

        {/* Risk Level */}
        <p className="text-[9px] text-[#8A7F72] uppercase font-bold tracking-wider mb-1">{t.map.severityTitle || t.map.severity}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {RISK_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => onFiltersChange({ ...filters, riskLevels: toggleItem(filters.riskLevels, r) })}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                filters.riskLevels.includes(r)
                  ? 'text-white border-transparent'
                  : 'text-[#4A433B] border-[#E4DDD1] bg-white hover:bg-[#F3EDE2]'
              }`}
              style={filters.riskLevels.includes(r) ? { backgroundColor: getSeverityColor(r) } : {}}
            >
              {riskLabel[r] || r}
            </button>
          ))}
        </div>

        {/* Status */}
        <p className="text-[9px] text-[#8A7F72] uppercase font-bold tracking-wider mb-1">{t.map.statusTitle || t.map.status}</p>
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => onFiltersChange({ ...filters, statuses: toggleItem(filters.statuses, s) })}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                filters.statuses.includes(s)
                  ? 'bg-[#2C6E49] text-white border-transparent'
                  : 'text-[#4A433B] border-[#E4DDD1] bg-white hover:bg-[#F3EDE2]'
              }`}
            >
              {statusLabel[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* ── District List ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-[#FAF8F4] border-b border-[#E4DDD1] px-3 py-2 flex items-center gap-1 z-10">
          <TrendingUp className="w-3.5 h-3.5 text-[#2C6E49]" />
          <p className="text-[10px] font-bold text-[#4A433B] uppercase tracking-wider">{t.map.districtsTitle || t.map.districtsByReports}</p>
        </div>

        {selectedDistrict && (
          <div className="px-3 py-1.5 bg-[#EAE4D8] border-b border-[#E4DDD1]">
            <button
              onClick={() => onDistrictSelect(null)}
              className="text-[10px] font-bold text-[#B5502D] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <X className="w-3 h-3" /> {t.map.clearDistrict || t.map.clearDistrictFilter}
            </button>
          </div>
        )}

        <div className="divide-y divide-[#E4DDD1]">
          {sortedDistricts.map(stat => {
            const isSelected = selectedDistrict === stat.district;
            const barWidth = stat.total > 0 ? `${(stat.total / maxCount) * 100}%` : '2%';
            const barColor = stat.critical > 0 ? '#B3261E' : stat.high > 0 ? '#B45309' : '#2C6E49';

            return (
              <button
                key={stat.district}
                onClick={() => onDistrictSelect(isSelected ? null : stat.district)}
                className={`w-full px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#EAE4D8]' : 'hover:bg-[#F3EDE2]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3 h-3 shrink-0 text-[#C98A2C]" />
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#2C6E49]' : 'text-[#201C18]'}`}>
                      {stat.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {stat.critical > 0 && (
                      <AlertCircle className="w-3 h-3 text-[#B3261E]" />
                    )}
                    <span className={`text-xs font-extrabold ${stat.total > 0 ? 'text-[#201C18]' : 'text-[#B0A89A]'}`}>
                      {stat.total}
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full bg-[#E4DDD1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: barWidth, backgroundColor: barColor }}
                  />
                </div>

                {stat.total > 0 && (
                  <p className="text-[9px] text-[#8A7F72] mt-0.5">{stat.topCategory}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="border-t border-[#E4DDD1] px-3 py-2 bg-[#F3EDE2] shrink-0">
        <p className="text-[9px] text-[#8A7F72] font-bold uppercase tracking-wider mb-1.5">{t.map.legendTitle || t.map.severity}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[
            { label: t.map.legendCritical || t.map.riskCritical, color: '#B3261E' },
            { label: t.map.legendHigh, color: '#B45309' },
            { label: t.map.legendMedium, color: '#C98A2C' },
            { label: t.map.legendStandard, color: '#2C6E49' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-[#4A433B] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar: visible on md and up */}
      <aside className="hidden md:flex w-72 shrink-0 h-full">
        {renderContent(false)}
      </aside>

      {/* Mobile drawer: visible only when toggled on mobile */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-xs flex md:hidden animate-fadeIn"
          onClick={onCloseMobile}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full bg-[#FAF8F4] shadow-2xl"
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
