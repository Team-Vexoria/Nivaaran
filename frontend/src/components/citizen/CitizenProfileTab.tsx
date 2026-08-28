import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { JHARKHAND_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { 
  User, MapPin, CheckCircle2, ShieldCheck, Mail, Sprout, 
  FileText, Clock, Edit3, Save, ChevronRight, LogOut, Globe
} from 'lucide-react';

interface CitizenProfileTabProps {
  userDisplayName?: string;
  userEmail?: string;
  onOpenReportModal?: () => void;
  onTabChange?: (tab: any) => void;
  currentLang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
}

export const CitizenProfileTab: React.FC<CitizenProfileTabProps> = ({
  userDisplayName = 'Harshit Mishra',
  userEmail = 'harshit.mishra@jharkhand.gov.in',
  onOpenReportModal: _onOpenReportModal,
  onTabChange,
}) => {
  const { logout } = useAuth();
  const { currentLang, setLanguage, t } = useLanguage();

  const [district, setDistrict] = useState('Ranchi');
  const [block, setBlock] = useState('Kanke Block');
  const village = 'Hutup Panchayat';
  const [phone, setPhone] = useState('+91 98351 40912');
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { label: t.profile.reportsFiledStat, value: '4', icon: <FileText className="w-5 h-5 text-blue-600" /> },
    { label: t.profile.govtVerifiedStat, value: '3', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { label: t.profile.uniActiveStat, value: '2', icon: <ShieldCheck className="w-5 h-5 text-purple-600" /> },
    { label: t.profile.treeVouchersStat, value: '3 Saplings', icon: <Sprout className="w-5 h-5 text-emerald-600" /> },
  ];

  const recentActivity = [
    {
      id: 'JH-2026-FL-3125',
      title: 'Monsoon flash flood risk near primary school road',
      district: 'Ranchi',
      date: '2 hours ago',
      status: 'Under Review',
      stage: 'Stage 1: Citizen Submission & Evidence Upload',
    },
    {
      id: 'JH-2026-FL-0842',
      title: 'River overflow floods Kanke village main highway',
      district: 'Ranchi',
      date: 'Yesterday',
      status: 'In Progress',
      stage: 'Stage 8: University Telemetry Team Assigned (BIT Mesra)',
    },
    {
      id: 'JH-2026-DR-0319',
      title: 'Borewell water level drop in Daltonganj village',
      district: 'Palamu',
      date: '3 days ago',
      status: 'Government Validated',
      stage: 'Stage 4: Geotag Validated & Deduplicated',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-500 shrink-0">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-tight">
                {userDisplayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center shrink-0">
                <ShieldCheck className="w-3 h-3 mr-1" /> {t.profile.verifiedCitizenBadge}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> {userEmail}
            </p>

            <p className="text-xs font-semibold text-slate-700 flex items-center pt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
              {village}, {block}, District {district}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5"
          >
            {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? t.profile.saveChanges : t.profile.editProfile}</span>
          </button>

          {/* Official Sign Out / Logout Button */}
          <button
            onClick={async () => {
              if (logout) {
                await logout();
              }
              const url = new URL(window.location.href);
              url.searchParams.delete('portal');
              url.searchParams.set('tab', 'home');
              window.history.pushState({ tab: 'home' }, '', url.toString());
              window.dispatchEvent(new Event('popstate'));
              if (onTabChange) {
                onTabChange('home');
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>{t.profile.signOutBtn}</span>
          </button>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{st.label}</span>
              {st.icon}
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">{st.value}</p>
          </div>
        ))}
      </div>

      {/* Official Language & Regional Dialect Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {t.profile.langSectionTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.profile.langSectionSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {JHARKHAND_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-500 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-semibold'
                }`}
              >
                <div>
                  <span className="block text-xs font-bold font-heading">{lang.nativeName}</span>
                  <span className="text-[10px] text-slate-500 block">{lang.name} · {lang.region}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editable Citizen Profile Details */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <User className="w-4 h-4 mr-1.5 text-slate-700" /> Citizen Details
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={userDisplayName}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold disabled:opacity-80"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Resident District</label>
              <input
                type="text"
                disabled={!isEditing}
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Block / Panchayat</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${block}, ${village}`}
                onChange={e => setBlock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Earned Tree Vouchers & Recent Submissions */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Tree Sapling Voucher Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                  Jharkhand Green Reward Voucher
                </span>
                <h4 className="text-base font-extrabold font-heading text-white mt-0.5">
                  3 Free Native Tree Saplings
                </h4>
                <p className="text-xs text-emerald-100 mt-1">
                  Redeemable at Ranchi District Forestry Nursery using your verified citizen ID.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-400/40 flex items-center justify-center text-white shrink-0">
                <Sprout className="w-7 h-7 text-emerald-300" />
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-200">VOUCHER CODE: <strong className="text-white">JH-SAPLING-8402</strong></span>
              {onTabChange && (
                <button
                  onClick={() => onTabChange('leaderboard')}
                  className="px-3 py-1 bg-white text-emerald-900 font-extrabold rounded-lg hover:bg-emerald-50 transition-colors text-[11px]"
                >
                  View Leaderboard Rank
                </button>
              )}
            </div>
          </div>

          {/* Recent Submissions List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-slate-700" /> Your Submitted Incidents
              </h3>

              {onTabChange && (
                <button
                  onClick={() => onTabChange('my-reports')}
                  className="text-xs text-emerald-700 font-extrabold hover:underline flex items-center"
                >
                  <span>View All Reports</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-600 text-[11px]">{act.id}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {act.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{act.title}</h4>
                  <p className="text-[11px] text-slate-500">{act.stage}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
