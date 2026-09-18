import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { JHARKHAND_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { subscribeToChallenges, ChallengeDoc } from '../../services/firebaseService';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import {
  User, MapPin, CheckCircle2, ShieldCheck, Mail, Sprout,
  FileText, Clock, Edit3, Save, ChevronRight, LogOut, Globe,
  Camera, Trash2, AlertCircle
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
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { currentLang, setLanguage, t } = useLanguage();

  const profileStorageKey = `nivaaran_citizen_profile_${currentUser?.uid || 'default'}`;

  // Read persisted citizen profile from localStorage on initial render
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Storage parse fallback
    }
    return {
      displayName: currentUser?.displayName || userDisplayName || 'Harshit Mishra',
      phone: '+91 94311 20455',
      district: currentUser?.district || 'Ranchi',
      block: 'Kanke Block',
      village: 'Hutup Panchayat',
      photoUrl: currentUser?.photoURL || '',
    };
  });

  const [displayName, setDisplayName] = useState<string>(profileData.displayName);
  const [phone, setPhone] = useState<string>(profileData.phone);
  const [district, setDistrict] = useState<string>(profileData.district);
  const [block, setBlock] = useState<string>(profileData.block);
  const [village, setVillage] = useState<string>(profileData.village);
  const [photoUrl, setPhotoUrl] = useState<string>(profileData.photoUrl || currentUser?.photoURL || '');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const MAX_PHOTO_BYTES = 500 * 1024 * 1024; // 500 MB limit

  // Sync state if currentUser changes from outside
  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDisplayName(parsed.displayName || currentUser?.displayName || userDisplayName);
        setPhone(parsed.phone || '+91 94311 20455');
        setDistrict(parsed.district || currentUser?.district || 'Ranchi');
        setBlock(parsed.block || 'Kanke Block');
        setVillage(parsed.village || 'Hutup Panchayat');
        if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
      }
    } catch {
      // Storage fallback
    }
  }, [currentUser?.uid, userDisplayName]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (file.size > MAX_PHOTO_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setPhotoError(`Selected file exceeds the maximum allowed size of 500 MB (${sizeMB} MB). Please choose a smaller image file.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 640;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        let finalDataUrl = rawDataUrl;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        }

        setPhotoUrl(finalDataUrl);
        const updated = {
          ...profileData,
          displayName,
          phone,
          district,
          block,
          village,
          photoUrl: finalDataUrl,
        };
        setProfileData(updated);
        try {
          localStorage.setItem(profileStorageKey, JSON.stringify(updated));
        } catch (err) {
          console.warn('LocalStorage save error:', err);
        }
        if (updateUserProfile) {
          updateUserProfile({ photoURL: finalDataUrl });
        }
        window.dispatchEvent(new CustomEvent('nivaaran_profile_updated', { detail: updated }));
        setSaveFeedback(true);
        setTimeout(() => setSaveFeedback(false), 3500);
      };
      img.onerror = () => {
        setPhotoUrl(rawDataUrl);
        const updated = { ...profileData, photoUrl: rawDataUrl };
        setProfileData(updated);
        try {
          localStorage.setItem(profileStorageKey, JSON.stringify(updated));
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent('nivaaran_profile_updated', { detail: updated }));
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoError(null);
    const updated = {
      ...profileData,
      photoUrl: '',
    };
    setProfileData(updated);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (updateUserProfile) {
      updateUserProfile({ photoURL: '' });
    }
    window.dispatchEvent(new CustomEvent('nivaaran_profile_updated', { detail: updated }));
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3500);
  };

  const handleSaveProfile = () => {
    const updated = {
      displayName: displayName.trim() || 'Citizen User',
      phone: phone.trim() || '+91 94311 20455',
      district: district.trim() || 'Ranchi',
      block: block.trim() || 'Kanke Block',
      village: village.trim() || 'Hutup Panchayat',
      photoUrl: photoUrl || '',
    };
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updated));
    } catch {
      // Storage save fallback
    }
    setProfileData(updated);
    if (updateUserProfile) {
      updateUserProfile({ displayName: updated.displayName, district: updated.district, photoURL: updated.photoUrl });
    }
    window.dispatchEvent(new CustomEvent('nivaaran_profile_updated', { detail: updated }));
    setIsEditing(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3500);
  };

  // Live challenge data for stats
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  useEffect(() => {
    const unsub = subscribeToChallenges(setChallenges);
    return () => unsub();
  }, []);

  // Also sync from workflowStore for transitions that don't hit Firebase
  const [wfChallenges, setWfChallenges] = useState(workflowStore.getChallenges());
  useEffect(() => {
    const handler = () => setWfChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  // Merge: workflowStore is source of truth for status, Firebase for full list
  const allChallenges = challenges.length > 0 ? challenges : (wfChallenges as unknown as ChallengeDoc[]);

  const totalFiled = allChallenges.length;
  const govtVerified = allChallenges.filter(c =>
    ['Government Validated','Clustered','Prioritized','HEI Matched','University Accepted',
     'In Progress','Proposal Submitted','Industry Collaboration','Prototype Active',
     'Pilot Active','Outcome Audit','Resolved','Closed'].includes(c.status)
  ).length;
  const uniActive = allChallenges.filter(c =>
    ['University Accepted','In Progress','Proposal Submitted','Industry Collaboration',
     'Prototype Active','Pilot Active','Outcome Audit'].includes(c.status)
  ).length;
  const resolvedCount = allChallenges.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const saplingCount = Math.min(resolvedCount + Math.floor(govtVerified / 3), 9);

  const stats = [
    { label: t.profile.reportsFiledStat, value: String(totalFiled || 4), icon: <FileText className="w-5 h-5 text-emerald-700" /> },
    { label: t.profile.govtVerifiedStat, value: String(govtVerified || 3), icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { label: t.profile.uniActiveStat, value: String(uniActive || 2), icon: <ShieldCheck className="w-5 h-5 text-amber-700" /> },
    { label: t.profile.treeVouchersStat, value: `${saplingCount || 3} Saplings`, icon: <Sprout className="w-5 h-5 text-emerald-600" /> },
  ];

  // Live recent activity: most recently updated challenges
  const recentActivity = allChallenges
    .slice()
    .sort((a, b) => ((b as any).updatedAt || b.createdAt || '').localeCompare((a as any).updatedAt || a.createdAt || ''))
    .slice(0, 3)
    .map(c => ({
      id: c.reportId || c.id,
      title: c.title,
      district: c.district,
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
      status: c.status,
      stage: c.stageName || `Stage ${c.stageNumber || 1}`,
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-500 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label
              htmlFor="citizen-profile-photo-input"
              className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md cursor-pointer border-2 border-white transition-all hover:scale-110 flex items-center justify-center"
              title="Upload Profile Photo (Max 500 MB)"
              aria-label="Upload Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-tight">
                {displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center shrink-0">
                <ShieldCheck className="w-3 h-3 mr-1" /> {t.profile.verifiedCitizenBadge}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> {currentUser?.email || userEmail}
            </p>

            <p className="text-xs font-semibold text-slate-700 flex items-center pt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
              {village}, {block}, District {district}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {saveFeedback && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved Successfully
            </span>
          )}

          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-4 py-2 font-bold text-xs rounded-xl border transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
              isEditing 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {isEditing ? <Save className="w-3.5 h-3.5 text-white" /> : <Edit3 className="w-3.5 h-3.5 text-slate-700" />}
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
            {/* Profile Photo Upload Option */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <label className="text-slate-700 font-bold block text-xs">Profile Photo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg border-2 border-emerald-500 overflow-hidden shrink-0 shadow-2xs">
                  {photoUrl ? (
                    <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label
                      htmlFor="citizen-profile-photo-input"
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 active:scale-95"
                    >
                      <Camera className="w-3 h-3 text-emerald-200" />
                      <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </label>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-[11px] transition-colors border border-red-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Remove current photo"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Maximum file size: 500 MB (JPG, PNG, WEBP)
                  </p>
                </div>
              </div>

              <input
                id="citizen-profile-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {photoError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] font-semibold flex items-start gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.2" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter full name"
                className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                  isEditing 
                    ? 'bg-white border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 disabled:opacity-90'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 94311 20455"
                className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                  isEditing 
                    ? 'bg-white border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 disabled:opacity-90'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Resident District</label>
              <input
                type="text"
                disabled={!isEditing}
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder="District name"
                className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                  isEditing 
                    ? 'bg-white border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 disabled:opacity-90'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Block</label>
              <input
                type="text"
                disabled={!isEditing}
                value={block}
                onChange={e => setBlock(e.target.value)}
                placeholder="Block name"
                className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                  isEditing 
                    ? 'bg-white border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 disabled:opacity-90'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Village / Panchayat</label>
              <input
                type="text"
                disabled={!isEditing}
                value={village}
                onChange={e => setVillage(e.target.value)}
                placeholder="Village / Panchayat name"
                className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                  isEditing 
                    ? 'bg-white border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 disabled:opacity-90'
                }`}
              />
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Profile Changes</span>
              </button>
            )}
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
