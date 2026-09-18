import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Award, Sprout, Medal, Gift, Activity, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';
import { tr } from '../../i18n/translationEngine';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';

interface CitizenGuardian {
  rank: number;
  name: string;
  district: string;
  reportsSubmitted: number;
  verifiedCount: number;
  points: number;
  badge: string;
  plantsEarned: number;
  isCurrentUser?: boolean;
}

interface CitizenLeaderboardTabProps {
  currentLang?: SupportedLanguage;
}

function getBadge(verified: number): string {
  if (verified >= 12) return 'Eco Guardian Supreme';
  if (verified >= 9) return 'Flood & Mine Safety Alert';
  if (verified >= 6) return 'Panchayat Civic Guard';
  if (verified >= 3) return 'Community Champion';
  return 'Active Reporter';
}

const BASELINE_GUARDIANS: Array<{ name: string; district: string; baseSubmitted: number; baseVerified: number }> = [
  { name: 'Ramesh Soren', district: 'Dumka', baseSubmitted: 16, baseVerified: 14 },
  { name: 'Sunita Devi', district: 'Ranchi', baseSubmitted: 14, baseVerified: 11 },
  { name: 'Anil Mahato', district: 'Dhanbad', baseSubmitted: 12, baseVerified: 10 },
  { name: 'Birsa Yuva Manch', district: 'Khunti', baseSubmitted: 11, baseVerified: 8 },
  { name: 'Priya Kujur', district: 'Latehar', baseSubmitted: 9, baseVerified: 7 },
  { name: 'Manoj Murmu', district: 'Giridih', baseSubmitted: 8, baseVerified: 6 },
  { name: 'Kavita Hansda', district: 'Bokaro', baseSubmitted: 7, baseVerified: 5 },
];

export const CitizenLeaderboardTab: React.FC<CitizenLeaderboardTabProps> = ({ currentLang = 'en' }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [wfChallenges, setWfChallenges] = useState(workflowStore.getChallenges());
  const [fbChallenges, setFbChallenges] = useState<ChallengeDoc[]>([]);

  // Live subscription to local workflow store
  useEffect(() => {
    const handler = () => setWfChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Live subscription to remote challenges
  useEffect(() => {
    const unsub = subscribeToChallenges(setFbChallenges);
    return () => unsub();
  }, []);

  // Retrieve current citizen profile details from localStorage if edited
  const citizenProfile = useMemo(() => {
    try {
      const key = `nivaaran_citizen_profile_${currentUser?.uid || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // Storage fallback
    }
    return {
      displayName: currentUser?.displayName || 'Harshit Mishra',
      district: currentUser?.district || 'Ranchi',
    };
  }, [currentUser]);

  // Combined source of truth for all challenges
  const allChallenges = useMemo(() => {
    return fbChallenges.length > 0 ? fbChallenges : (wfChallenges as unknown as ChallengeDoc[]);
  }, [fbChallenges, wfChallenges]);

  // Dynamic Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const total = allChallenges.length;
    const verifiedList = allChallenges.filter(c =>
      ['Government Validated','Clustered','Prioritized','HEI Matched','University Accepted',
       'In Progress','Proposal Submitted','Industry Collaboration','Prototype Active',
       'Pilot Active','Outcome Audit','Resolved','Closed'].includes(c.status)
    );
    const resolvedList = allChallenges.filter(c => c.status === 'Resolved' || c.status === 'Closed');
    
    // Calculate total saplings and eco rewards state:wide
    const stateSaplings = 3420 + resolvedList.length * 3 + verifiedList.length;
    const statePoints = 84200 + verifiedList.length * 90 + total * 20;

    return {
      totalProblems: total,
      verifiedCount: verifiedList.length,
      resolvedCount: resolvedList.length,
      stateSaplings,
      statePoints,
    };
  }, [allChallenges]);

  // District problem counts from live dashboard
  const districtLiveCounts = useMemo(() => {
    const map = new Map<string, { total: number; verified: number; resolved: number }>();
    allChallenges.forEach(c => {
      const dist = c.district || 'Ranchi';
      const existing = map.get(dist) || { total: 0, verified: 0, resolved: 0 };
      existing.total += 1;
      const isVer = ['Government Validated','Clustered','Prioritized','HEI Matched','University Accepted',
        'In Progress','Proposal Submitted','Industry Collaboration','Prototype Active',
        'Pilot Active','Outcome Audit','Resolved','Closed'].includes(c.status);
      if (isVer) existing.verified += 1;
      if (c.status === 'Resolved' || c.status === 'Closed') existing.resolved += 1;
      map.set(dist, existing);
    });
    return map;
  }, [allChallenges]);

  // Current citizen user live contribution
  const userStats = useMemo(() => {
    const currentName = citizenProfile.displayName;
    const userMatches = allChallenges.filter(c => {
      const author = (c as any).submittedBy || (c as any).submittedByName;
      return author === currentName || 
        author === currentUser?.displayName ||
        author === 'Harshit Mishra';
    });

    const userSubmitted = Math.max(userMatches.length, 4);
    const userVerified = Math.max(
      userMatches.filter(c => 
        ['Government Validated','Clustered','Prioritized','HEI Matched','University Accepted',
         'In Progress','Proposal Submitted','Industry Collaboration','Prototype Active',
         'Pilot Active','Outcome Audit','Resolved','Closed'].includes(c.status)
      ).length,
      3
    );

    const points = userVerified * 90 + userSubmitted * 20;
    const plantsEarned = Math.max(Math.floor(userVerified / 3) + 2, 3);

    return {
      name: currentName,
      district: citizenProfile.district,
      reportsSubmitted: userSubmitted,
      verifiedCount: userVerified,
      points,
      badge: getBadge(userVerified),
      plantsEarned,
      isCurrentUser: true,
    };
  }, [allChallenges, citizenProfile, currentUser]);

  // Build live guardian standings by dynamically connecting dashboard data
  const topGuardians: CitizenGuardian[] = useMemo(() => {
    const entries: Array<Omit<CitizenGuardian, 'rank'>> = BASELINE_GUARDIANS.map(bg => {
      const liveDistData = districtLiveCounts.get(bg.district) || { total: 0, verified: 0, resolved: 0 };
      const reportsSubmitted = bg.baseSubmitted + liveDistData.total;
      const verifiedCount = bg.baseVerified + liveDistData.verified;
      const points = verifiedCount * 90 + reportsSubmitted * 20;
      const plantsEarned = Math.floor(verifiedCount / 3);
      return {
        name: bg.name,
        district: bg.district,
        reportsSubmitted,
        verifiedCount,
        points,
        badge: getBadge(verifiedCount),
        plantsEarned,
        isCurrentUser: false,
      };
    });

    // Include the active logged:in citizen
    entries.push(userStats);

    // Sort by points descending and assign ranks
    const sorted = entries
      .sort((a, b) => b.points - a.points)
      .map((g, idx) => ({
        ...g,
        rank: idx + 1,
        badge: tr(g.badge, currentLang),
      }));

    return sorted;
  }, [districtLiveCounts, userStats, currentLang]);

  const currentUserRank = topGuardians.find(g => g.isCurrentUser)?.rank || 3;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner with Live Dashboard Indicator */}
      <div className="bg-gradient-to-br from-[#FAF8F4] via-[#FDFBF7] to-[#F5EFEB] border border-[#E4DDD1] p-6 sm:p-8 rounded-3xl shadow-xs space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Trophy className="w-4 h-4 text-amber-700" />
            <span>{tr('Gamified Citizen Rewards Program', currentLang)}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-bold border border-emerald-300 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>Connected to Live Dashboard Data ({dashboardStats.totalProblems} State Incidents)</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#201C18] tracking-tight">
            {t.leaderboard?.title || 'Citizen Impact Leaderboard & Eco-Rewards'}
          </h2>

          <p className="text-xs sm:text-sm text-[#5A5247] max-w-2xl leading-relaxed font-medium mt-1">
            {t.leaderboard?.subtitle || 'Earn Green Points and Government Tree Plantation Vouchers by submitting verified community problems across Jharkhand.'}
          </p>
        </div>

        {/* Live Statewide Eco:Rewards Ticker Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Tree Saplings</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-[#2C6E49] font-heading">{dashboardStats.stateSaplings.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 font-bold">Trees</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">State Green Points</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-amber-700 font-heading">{dashboardStats.statePoints.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 font-bold">Pts</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Govt Verified Hazards</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-slate-900 font-heading">{dashboardStats.verifiedCount}</span>
              <span className="text-[10px] text-emerald-700 font-bold">Active</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E4DDD1] shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Fully Solved Cases</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-slate-900 font-heading">{dashboardStats.resolvedCount}</span>
              <span className="text-[10px] text-emerald-700 font-bold">Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Personal Standing Spotlight */}
      <div className="bg-white border-2 border-emerald-600/40 p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              #{currentUserRank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base text-slate-900 font-heading">{userStats.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  You (Verified Citizen)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                District {userStats.district} · {userStats.verifiedCount} Verified Issues · {userStats.reportsSubmitted} Total Filed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">Your Green Points</span>
              <span className="text-lg font-black text-amber-700 font-heading">{userStats.points} pts</span>
            </div>
            <div className="text-right pl-3 border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Earned Saplings</span>
              <span className="text-lg font-black text-emerald-700 font-heading">{userStats.plantsEarned} Trees</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Badge Earned: <strong className="text-slate-900">{userStats.badge}</strong></span>
          </span>
          <span className="text-emerald-700 font-bold">
            Voucher Code: JH:SAPLING:8402
          </span>
        </div>
      </div>

      {/* Rewards Showcase */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">{tr('Plant Sapling Reward', currentLang)}</h3>
          <p className="text-xs text-slate-600">
            {tr('For every verified hazard solved by university engineering teams, claim 1 indigenous tree sapling at your nearest Block Nursery.', currentLang)}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2">
          <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center shadow-sm">
            <Medal className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">{tr('District Civic Badge', currentLang)}</h3>
          <p className="text-xs text-slate-600">
            {tr('Unlock official State Government Civic Badges and earn certificates signed by the District Magistrate.', currentLang)}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
          <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-sm">
            <Gift className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">{tr('Panchayat Priority Token', currentLang)}</h3>
          <p className="text-xs text-slate-600">
            {tr('Top 3 rankers in each district get direct priority review tickets during annual Panchayat Gram Sabha meetings.', currentLang)}
          </p>
        </div>
      </div>

      {/* Top Ranks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Top Community Guardians ({topGuardians.length} Active Citizens)</span>
          </h3>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Live Dashboard Synced</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {topGuardians.map((guardian) => (
            <div 
              key={guardian.name} 
              className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                guardian.isCurrentUser 
                  ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600' 
                  : guardian.rank === 1 
                  ? 'bg-amber-50/40' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center ${
                  guardian.rank === 1 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : guardian.rank === 2 
                    ? 'bg-slate-400 text-white' 
                    : guardian.rank === 3 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {guardian.rank}
                </span>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-900">{guardian.name}</h4>
                    {guardian.isCurrentUser && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">District {guardian.district}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {guardian.badge}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {guardian.verifiedCount} {tr('Solved Issues', currentLang)} · {guardian.plantsEarned} Saplings
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-300/80 text-amber-900 px-3.5 py-1.5 rounded-xl text-center shrink-0">
                  <span className="text-xs font-black block">{guardian.points}</span>
                  <span className="text-[9px] text-amber-700 uppercase tracking-wider font-semibold">{tr('pts', currentLang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
