import React, { useEffect, useState } from 'react';
import { Trophy, Award, Sprout, Medal, Gift } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';
import { tr } from '../../i18n/translationEngine';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';

interface CitizenGuardian {
  rank: number;
  name: string;
  district: string;
  reportsSubmitted: number;
  verifiedCount: number;
  points: number;
  badge: string;
  plantsEarned: number;
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

export const CitizenLeaderboardTab: React.FC<CitizenLeaderboardTabProps> = ({ currentLang = 'en' }) => {
  const { t } = useLanguage();
  const [wfChallenges, setWfChallenges] = useState(workflowStore.getChallenges());

  useEffect(() => {
    const handler = () => setWfChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Build a live leaderboard from workflowStore submissions
  const liveMap = new Map<string, { district: string; submitted: number; verified: number }>();
  wfChallenges.forEach(c => {
    const name = c.submittedBy;
    if (!name) return;
    const existing = liveMap.get(name) || { district: c.district || '', submitted: 0, verified: 0 };
    existing.submitted += 1;
    const isVerified = ['Government Validated','Clustered','Prioritized','HEI Matched',
      'University Accepted','In Progress','Proposal Submitted','Industry Collaboration',
      'Prototype Active','Pilot Active','Outcome Audit','Resolved','Closed'].includes(c.status);
    if (isVerified) existing.verified += 1;
    liveMap.set(name, existing);
  });

  const merged = new Map<string, Omit<CitizenGuardian, 'rank'>>();
  liveMap.forEach((data, name) => {
    merged.set(name, {
      name,
      district: data.district,
      reportsSubmitted: data.submitted,
      verifiedCount: data.verified,
      points: data.verified * 90 + data.submitted * 20,
      badge: getBadge(data.verified),
      plantsEarned: Math.floor(data.verified / 3),
    });
  });

  const topGuardians: CitizenGuardian[] = Array.from(merged.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((g, i) => ({ ...g, rank: i + 1, badge: tr(g.badge, currentLang) }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#FAF8F4] via-[#FDFBF7] to-[#F5EFEB] border border-[#E4DDD1] p-6 sm:p-8 rounded-3xl shadow-xs space-y-3 text-left">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
          <Trophy className="w-4 h-4 text-amber-700" />
          <span>{tr('Gamified Citizen Rewards Program', currentLang)}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#201C18] tracking-tight">
          {t.leaderboard?.title || 'Citizen Impact Leaderboard & Eco-Rewards'}
        </h2>

        <p className="text-xs sm:text-sm text-[#5A5247] max-w-2xl leading-relaxed font-medium">
          {t.leaderboard?.subtitle || 'Earn Green Points and Government Tree Plantation Vouchers by submitting verified community problems.'}
        </p>
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

        <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-2">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
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
            <Award className="w-5 h-5 text-amber-500" />
            <span>{tr('Top 5 Community Guardians This Month', currentLang)}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">{tr('Updated Hourly', currentLang)}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {topGuardians.length > 0 ? (
            topGuardians.map((guardian) => (
              <div 
                key={guardian.rank} 
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50 ${
                  guardian.rank === 1 ? 'bg-amber-50/40' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center ${
                    guardian.rank === 1 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : guardian.rank === 2 
                      ? 'bg-slate-300 text-slate-800' 
                      : guardian.rank === 3 
                      ? 'bg-amber-700 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {guardian.rank}
                  </span>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{guardian.name}</h4>
                    <p className="text-xs text-slate-500">{guardian.district}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right">
                  <div className="hidden sm:block">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {guardian.badge}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {guardian.verifiedCount} {tr('Solved Issues', currentLang)}
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-300/80 text-amber-900 px-3.5 py-1.5 rounded-xl text-center shrink-0">
                    <span className="text-xs font-black block">{guardian.points}</span>
                    <span className="text-[9px] text-amber-700 uppercase tracking-wider font-semibold">{tr('pts', currentLang)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Sprout className="w-8 h-8 mx-auto mb-3 text-emerald-400 opacity-50" />
              <p className="text-sm font-medium">{tr('No citizen guardians yet.', currentLang)}</p>
              <p className="text-xs mt-1">{tr('Submit and verify community issues to climb the leaderboard!', currentLang)}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
