import React, { useState } from 'react';
import { ArrowLeft, Map, Loader2, AlertCircle, Filter } from 'lucide-react';
import { MapViewport } from './MapViewport';
import { MapSidebar, FilterState } from './MapSidebar';
import { useMapData } from '../../services/mapDataService';
import { ChallengeDoc } from '../../services/firebaseService';
import { useLanguage } from '../../context/LanguageContext';

interface JharkhandMapExplorerProps {
  govtMode?: boolean;
  onNavigateHome?: () => void;
  embedded?: boolean;
  /** If provided (from GovPortal), map popup buttons delegate to these handlers */
  onValidate?: (challengeId: string) => void;
  onRequestEvidence?: (challengeId: string) => void;
}

export const JharkhandMapExplorer: React.FC<JharkhandMapExplorerProps> = ({
  govtMode = false,
  onNavigateHome,
  embedded = false,
  onValidate: externalValidate,
  onRequestEvidence: externalRequestEvidence,
}) => {
  const { t } = useLanguage();
  const { challenges, districtStats, totalCount, criticalCount, validatedCount, resolvedCount, loading } =
    useMapData();

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    statuses: [],
    riskLevels: [],
  });

  // Filter challenges based on active filters + selected district
  const filteredChallenges = challenges.filter((ch: ChallengeDoc) => {
    if (selectedDistrict && ch.district !== selectedDistrict) return false;
    if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(ch.riskLevel || 'STANDARD')) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(ch.status)) return false;
    if (filters.categories.length > 0) {
      const catMatch = filters.categories.some(fc =>
        (ch.category || '').toLowerCase().includes(fc.toLowerCase())
      );
      if (!catMatch) return false;
    }
    return true;
  });

  // Use external handlers when embedded in GovPortal, otherwise no-ops
  const handleValidate = externalValidate ?? (() => {});
  const handleRequestEvidence = externalRequestEvidence ?? (() => {});

  const heightClass = embedded ? 'flex-1 h-full min-h-[620px]' : 'h-screen';

  return (
    <div className={`${heightClass} flex flex-col bg-[#FAF8F4] overflow-hidden w-full`}>

      {/* ── Top Bar (Only when standalone / not embedded in a parent portal) ── */}
      {!embedded && (
        <div className="shrink-0 bg-[#FAF8F4] border-b border-[#E4DDD1] px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A433B] hover:text-[#201C18] bg-[#EAE4D8] hover:bg-[#DFD8CA] border border-[#E4DDD1] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.map.back || t.common.back}</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#2C6E49] rounded-lg flex items-center justify-center shrink-0">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-[#201C18] leading-none">
                  {t.map.title || t.map.explorerTitle}
                </h1>
                <p className="text-[10px] text-[#6A6155]">
                  {t.map.subtitle || t.map.explorerSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Live stats strip */}
          <div className="hidden md:flex items-center gap-4 text-center">
            <div>
              <p className="text-base font-black text-[#201C18]">{totalCount}</p>
              <p className="text-[9px] text-[#8A7F72] uppercase font-semibold">{t.map.statsTotal || t.map.statReports}</p>
            </div>
            <div className="h-6 w-px bg-[#E4DDD1]" />
            <div>
              <p className="text-base font-black text-[#B3261E]">{criticalCount}</p>
              <p className="text-[9px] text-[#8A7F72] uppercase font-semibold">{t.map.statsCritical || t.map.statCritical}</p>
            </div>
            <div className="h-6 w-px bg-[#E4DDD1]" />
            <div>
              <p className="text-base font-black text-[#2C6E49]">{validatedCount}</p>
              <p className="text-[9px] text-[#8A7F72] uppercase font-semibold">{t.map.statsValidated || t.map.statValidated}</p>
            </div>
            <div className="h-6 w-px bg-[#E4DDD1]" />
            <div>
              <p className="text-base font-black text-[#6A6155]">{resolvedCount}</p>
              <p className="text-[9px] text-[#8A7F72] uppercase font-semibold">{t.map.statsResolved || t.map.statResolved}</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A7F72]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.map.loading || t.common.loading}</span>
            </div>
          )}
        </div>
      )}

      {/* ── No data notice ── */}
      {!loading && totalCount === 0 && (
        <div className="shrink-0 bg-[#FFF8F0] border-b border-[#E4DDD1] px-4 py-2 flex items-center gap-2 text-[11px] text-[#B45309]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{t.map.noDataTitle || t.map.noReportsNotice}</span>
        </div>
      )}

      {/* ── Main body ── */}
      <div className="relative flex flex-1 overflow-hidden min-h-[380px] sm:min-h-[520px] h-full w-full">
        {/* Mobile Floating Filter Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden absolute top-3 left-3 z-[400] bg-white/95 hover:bg-white text-[#201C18] border border-[#E4DDD1] px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-xs active:scale-95"
          title="Open Filters & Districts"
        >
          <Filter className="w-3.5 h-3.5 text-[#2C6E49]" />
          <span>Filters &amp; Districts</span>
          {filters.categories.length + filters.statuses.length + filters.riskLevels.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#2C6E49]" />
          )}
        </button>

        <MapSidebar
          districtStats={districtStats}
          challenges={filteredChallenges}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={(d) => {
            setSelectedDistrict(d);
            setIsMobileSidebarOpen(false);
          }}
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={filteredChallenges.length}
          criticalCount={filteredChallenges.filter(c => c.riskLevel === 'CRITICAL').length}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <MapViewport
          challenges={filteredChallenges}
          districtStats={districtStats}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={setSelectedDistrict}
          govtMode={govtMode}
          onValidate={handleValidate}
          onRequestEvidence={handleRequestEvidence}
        />
      </div>
    </div>
  );
};
