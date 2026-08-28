import React from 'react';
import { Trophy, Award, Sprout, Medal, Gift } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';
import { tr } from '../../i18n/translationEngine';

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

export const CitizenLeaderboardTab: React.FC<CitizenLeaderboardTabProps> = ({ currentLang = 'en' }) => {
  const { t } = useLanguage();

  const topGuardians: CitizenGuardian[] = [
    {
      rank: 1,
      name: 'Sunil Kumar Mahto',
      district: 'Ranchi (Kanke Block)',
      reportsSubmitted: 14,
      verifiedCount: 12,
      points: 1280,
      badge: tr('Eco Guardian Supreme', currentLang),
      plantsEarned: 4,
    },
    {
      rank: 2,
      name: 'Pooja Rani',
      district: 'Dhanbad (Jharia)',
      reportsSubmitted: 11,
      verifiedCount: 10,
      points: 990,
      badge: tr('Flood & Mine Safety Alert', currentLang),
      plantsEarned: 3,
    },
    {
      rank: 3,
      name: 'Rameshwar Oraon',
      district: 'Palamu (Daltonganj)',
      reportsSubmitted: 9,
      verifiedCount: 8,
      points: 820,
      badge: tr('Panchayat Civic Guard', currentLang),
      plantsEarned: 2,
    },
    {
      rank: 4,
      name: 'Anita Hansda',
      district: 'East Singhbhum',
      reportsSubmitted: 7,
      verifiedCount: 7,
      points: 710,
      badge: tr('Community Champion', currentLang),
      plantsEarned: 2,
    },
    {
      rank: 5,
      name: 'Vikas Singh',
      district: 'Hazaribagh',
      reportsSubmitted: 6,
      verifiedCount: 5,
      points: 540,
      badge: tr('Active Reporter', currentLang),
      plantsEarned: 1,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>{tr('Gamified Citizen Rewards Program', currentLang)}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
          {t.leaderboard?.title || 'Jharkhand Citizen Guardians Leaderboard'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {t.leaderboard?.subtitle || 'Report verified community problems, earn impact points, and get rewarded with free native tree saplings (Sal, Mango, Neem) distributed via the Department of Forest & Environment, Government of Jharkhand.'}
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
          {topGuardians.map((guardian) => (
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

                <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-center shrink-0">
                  <span className="text-xs font-black block">{guardian.points}</span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">{tr('pts', currentLang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
