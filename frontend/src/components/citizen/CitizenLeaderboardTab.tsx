import React from 'react';
import { Trophy, Award, Sprout, Medal, Gift } from 'lucide-react';

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

export const CitizenLeaderboardTab: React.FC = () => {
  const topGuardians: CitizenGuardian[] = [
    {
      rank: 1,
      name: 'Sunil Kumar Mahto',
      district: 'Ranchi (Kanke Block)',
      reportsSubmitted: 14,
      verifiedCount: 12,
      points: 1280,
      badge: '🌿 Eco Guardian Supreme',
      plantsEarned: 4,
    },
    {
      rank: 2,
      name: 'Pooja Rani',
      district: 'Dhanbad (Jharia)',
      reportsSubmitted: 11,
      verifiedCount: 10,
      points: 990,
      badge: '🌊 Flood & Mine Safety Alert',
      plantsEarned: 3,
    },
    {
      rank: 3,
      name: 'Rameshwar Oraon',
      district: 'Palamu (Daltonganj)',
      reportsSubmitted: 9,
      verifiedCount: 8,
      points: 820,
      badge: '🏛️ Panchayat Civic Guard',
      plantsEarned: 2,
    },
    {
      rank: 4,
      name: 'Anita Hansda',
      district: 'East Singhbhum',
      reportsSubmitted: 7,
      verifiedCount: 7,
      points: 710,
      badge: '🌱 Community Champion',
      plantsEarned: 2,
    },
    {
      rank: 5,
      name: 'Vikas Singh',
      district: 'Hazaribagh',
      reportsSubmitted: 6,
      verifiedCount: 5,
      points: 540,
      badge: '⭐ Active Reporter',
      plantsEarned: 1,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Gamified Citizen Rewards Program</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
          Jharkhand Citizen Guardians Leaderboard
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Report verified community problems, earn impact points, and get rewarded with free native tree saplings (Sal, Mango, Neem) distributed via the Department of Forest & Environment, Government of Jharkhand.
        </p>

        {/* Tree Sapling Voucher Callout */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center space-x-2 text-xs">
            <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Reward Rule:</strong> Every 3 Verified Reports = 1 Tree Sapling Voucher</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center space-x-2 text-xs">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Redeemable at any District Forestry Nursery</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <Medal className="w-4 h-4 text-amber-500 mr-2" /> Top Community Guardians This Month
          </h3>
          <span className="text-xs font-semibold text-slate-500">Updated Daily</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Citizen Name</th>
                <th className="px-5 py-3">District & Block</th>
                <th className="px-5 py-3 text-center">Verified Reports</th>
                <th className="px-5 py-3 text-center">Impact Points</th>
                <th className="px-5 py-3 text-center">Plant Vouchers</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {topGuardians.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-black text-slate-900 text-sm">
                    {item.rank === 1 && <span className="inline-block w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-center leading-6 font-bold mr-1">🥇</span>}
                    {item.rank === 2 && <span className="inline-block w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-center leading-6 font-bold mr-1">🥈</span>}
                    {item.rank === 3 && <span className="inline-block w-6 h-6 rounded-full bg-amber-700/10 text-amber-800 text-center leading-6 font-bold mr-1">🥉</span>}
                    {item.rank > 3 && <span className="pl-2">#{item.rank}</span>}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900 block text-sm">{item.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{item.badge}</span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {item.district}
                  </td>

                  <td className="px-5 py-4 text-center font-bold text-slate-900">
                    {item.verifiedCount} / {item.reportsSubmitted}
                  </td>

                  <td className="px-5 py-4 text-center font-mono font-bold text-emerald-700 text-sm">
                    {item.points} pts
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sprout className="w-3.5 h-3.5 mr-1" /> {item.plantsEarned} Saplings
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Redeem Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <h4 className="font-bold text-slate-900 text-base">Your Active Reward Status</h4>
          </div>
          <p className="text-xs text-slate-600">
            You currently have 1 verified report. Submit 2 more verified reports to unlock your next <strong>Tree Sapling Reward Voucher</strong>!
          </p>
        </div>

        <button 
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 whitespace-nowrap"
          onClick={() => alert('Plant Sapling Voucher Code: JH-TREE-2026-NIVAARAN. Show this voucher at your District Forestry Office.')}
        >
          View My Plant Voucher Code
        </button>
      </div>

    </div>
  );
};
