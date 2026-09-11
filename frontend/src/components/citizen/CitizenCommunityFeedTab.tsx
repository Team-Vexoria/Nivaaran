import React, { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, MessageSquare, MapPin, CheckCircle2, Send, Image as ImageIcon, Zap, Users, Trash2, User } from 'lucide-react';
import {
  subscribeToFeedPosts, submitFeedPostToFirestore, upvotePostInFirestore, FeedPostDoc, addCommentToFeedPost, deleteFeedPostFromFirestore
} from '../../services/firebaseService';
import { useLanguage } from '../../context/LanguageContext';
import { tr } from '../../i18n/translationEngine';
import { workflowStore, STORE_EVENT } from '../../services/workflowStore';
import { getStageForStatus, getPublicStatusLabel } from '../../services/workflowLifecycle';

// All 24 Jharkhand districts for the report district picker.
const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Palamu',
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar',
  'Garhwa', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Jamtara',
  'Khunti', 'Gumla', 'Simdega', 'West Singhbhum', 'Seraikela Kharsawan',
  'Chatra', 'Koderma', 'Lohardaga',
];

interface FeedComment {
  id: string;
  postId?: string;
  author: string;
  role: 'Citizen' | 'Government Admin' | 'University Student';
  text: string;
  timestamp: string;
  isVerifiedGovt?: boolean;
  beforeImg?: string;
  afterImg?: string;
}

interface FeedPostUI extends FeedPostDoc {
  hasUpvoted?: boolean;
  timestamp?: string;
  comments?: FeedComment[];
  isProgress?: boolean;
  citizenReportCount?: number;
}

export const CitizenCommunityFeedTab: React.FC = () => {
  const { t, currentLang } = useLanguage();
  const [posts, setPosts] = useState<FeedPostUI[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostDistrict, setNewPostDistrict] = useState('Ranchi');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [challenges, setChallenges] = useState(workflowStore.getChallenges());

  const seedPosts: FeedPostUI[] = [
    {
      id: 'POST-101',
      author: 'Ramesh Kumar (Ranchi Resident)',
      district: 'Ranchi',
      block: 'Kanke',
      title: 'Monsoon water accumulation near Government School road',
      content: 'Heavy rainfall yesterday caused 3 feet of water on the main school access road in Hutup Panchayat. School children cannot cross safely.',
      upvotes: 42,
      hasUpvoted: false,
      timestamp: '2 hours ago',
      category: 'Flooding & Drainage',
      status: 'University Team Assigned',
      comments: [
        {
          id: 'C-01',
          author: 'Priya Sharma (Parent)',
          role: 'Citizen',
          text: 'This happens every monsoon. We need permanent telemetry warning and drainage pumps here.',
          timestamp: '1 hour ago',
        },
        {
          id: 'C-02',
          author: 'Officer A. K. Verma (District Disaster Management Cell)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'OFFICIAL UPDATE: Ground inspection completed by Ranchi BDO office. BIT Mesra Civil & IoT Engineering team assigned to install automatic water level warning sensors.',
          timestamp: '30 mins ago',
          beforeImg: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
          afterImg: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'POST-102',
      author: 'Sunita Devi (Farmer, Palamu)',
      district: 'Palamu',
      block: 'Daltonganj',
      title: 'Groundwater well water level dropped significantly',
      content: 'Our village deep borewells are running dry earlier than last year. We need solar-powered groundwater monitoring sensors.',
      upvotes: 28,
      hasUpvoted: false,
      timestamp: '5 hours ago',
      category: 'Drought & Water',
      status: 'Government Validated',
      comments: [],
    },
  ];

  useEffect(() => {
    const unsubscribe = subscribeToFeedPosts((incomingPosts) => {
      if (incomingPosts && incomingPosts.length > 0) {
        const formatted: FeedPostUI[] = incomingPosts.map(p => ({
          ...p,
          hasUpvoted: false,
          timestamp: 'Live',
          comments: p.id === 'POST-101' ? seedPosts[0].comments : [],
        }));
        setPosts(formatted);
      } else {
        setPosts(seedPosts);
      }
    });

    return () => unsubscribe();
  }, []);

  // Live subscription to workflowStore challenges so gov-validated
  // reports surface as community progress updates in the feed.
  useEffect(() => {
    const langHandler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, langHandler);
    return () => window.removeEventListener(STORE_EVENT, langHandler);
  }, []);

  // Auto-generate an official progress post for every challenge that has
  // crossed Stage 3 (Government Validated) onward — proof citizens can see
  // their reports being acted on by the verified institutional pipeline.
  const progressPosts: FeedPostUI[] = useMemo(() => {
    return challenges
      .filter(c => (getStageForStatus(c.status)?.stageNumber ?? 0) >= 3)
      .slice(0, 6)
      .map(c => ({
        id: `PROG-${c.id}`,
        author: 'NIVAARAN Verified Update',
        district: c.district,
        block: c.block || 'District HQ',
        title: c.title,
        content: `This community concern has entered the verified institutional pipeline and is now under an active government & university solution. Live stage: ${getPublicStatusLabel(c.status)}.`,
        upvotes: 0,
        hasUpvoted: false,
        timestamp: 'Live',
        category: c.category,
        status: getPublicStatusLabel(c.status),
        isProgress: true,
        citizenReportCount: c.citizenReportCount || 1,
      }));
  }, [challenges]);

  // Verified institutional progress first, then citizen + Firebase reports.
  const allPosts = useMemo<FeedPostUI[]>(() => [...progressPosts, ...posts], [progressPosts, posts, currentLang]);

  const handleUpvote = async (postId: string) => {
    const target = posts.find(p => p.id === postId);
    if (!target) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextHasUpvoted = !p.hasUpvoted;
        return {
          ...p,
          hasUpvoted: nextHasUpvoted,
          upvotes: nextHasUpvoted ? p.upvotes + 1 : p.upvotes - 1,
        };
      }
      return p;
    }));

    try {
      await upvotePostInFirestore(postId, target.upvotes);
    } catch {
      // Offline fallback
    }
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete post "${title}"?`)) {
      try {
        await deleteFeedPostFromFirestore(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (err) {
        console.error('Failed to delete feed post:', err);
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    await submitFeedPostToFirestore({
      author: 'You (Citizen Resident)',
      district: newPostDistrict,
      block: 'Local Panchayat',
      title: newPostTitle,
      content: newPostContent,
      upvotes: 1,
      category: 'Community Report',
      status: 'Under Review',
    });

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;

    await addCommentToFeedPost(postId, {
      postId,
      author: 'You (Citizen)',
      role: 'Citizen',
      text: commentInput,
    });

    setCommentInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Feed Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold font-heading text-slate-900">
          {t.communityFeed?.title || 'Jharkhand Community Challenge Feed'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.communityFeed?.subtitle || 'Live Citizen Geotag Stream across 24 Districts'}
        </p>
      </div>

      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-900 block">{t.communityFeed?.newPostTitle || 'Post a Local Community Concern'}</span>
        
        <input
          type="text"
          placeholder={tr('Issue Title (e.g. Broken culvert near market, waterlogging)', currentLang)}
          value={newPostTitle}
          onChange={e => setNewPostTitle(e.target.value)}
          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <textarea
          placeholder={tr('Describe the issue, location details, and how it impacts people...', currentLang)}
          rows={2}
          value={newPostContent}
          onChange={e => setNewPostContent(e.target.value)}
          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">{tr('District:', currentLang)}</span>
            <select
              value={newPostDistrict}
              onChange={e => setNewPostDistrict(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white font-semibold text-slate-800 max-w-[220px]"
            >
              {JHARKHAND_DISTRICTS.map(d => (
                <option key={d} value={d}>{tr(d, currentLang)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{tr('Post to Feed', currentLang)}</span>
          </button>
        </div>
      </form>

      {/* Posts Feed List */}
      <div className="space-y-4">
        {allPosts.map((post, idx) => (
          <div key={post.id || idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            


            {/* Post Author & Location Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{tr(post.author, currentLang)}</span>
                  <span className="text-[10px] text-slate-400">• {tr(post.timestamp || 'Live', currentLang)}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-500 mr-1" />
                  <span>{tr('District:', currentLang)} {tr(post.district, currentLang)} ({tr(post.block, currentLang)})</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                  post.isProgress
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {post.isProgress ? (
                    <span className="inline-flex items-center"><Zap className="w-3 h-3 mr-1" />{tr(post.status, currentLang)}</span>
                  ) : tr(post.status, currentLang)}
                </span>
                {post.id && !post.isProgress && (
                  <button
                    onClick={() => handleDeletePost(post.id!, post.title)}
                    title="Delete post"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Photo Preview with Floating Priority Overlay */}
            {((post as any).evidenceUrl || (post as any).img || (post as any).beforeImg || (post as any).evidenceUrls?.[0]) ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60 my-1 group">
                <img
                  src={(post as any).evidenceUrl || (post as any).img || (post as any).beforeImg || (post as any).evidenceUrls?.[0]}
                  alt={post.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                {post.citizenReportCount && post.citizenReportCount > 1 ? (
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <div className="bg-amber-500/95 text-amber-950 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-amber-300/70">
                      <Users className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                      <span className="text-[11px] font-black tracking-tight">{post.citizenReportCount} Citizens Reported</span>
                    </div>
                    <span className="text-[9px] bg-amber-950/90 text-amber-100 backdrop-blur-md border border-amber-400/40 px-2 py-0.5 rounded-md font-black uppercase tracking-wider shadow-sm">
                      Consolidated
                    </span>
                  </div>
                ) : (
                  <div className="absolute top-2.5 left-2.5 pointer-events-none">
                    <div className="bg-slate-900/75 text-white backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-white/20">
                      <User className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <span className="text-[10px] font-semibold">1 Citizen Report</span>
                    </div>
                  </div>
                )}
              </div>
            ) : post.citizenReportCount && post.citizenReportCount > 1 ? (
              <div className="bg-amber-50/90 border border-amber-300/80 text-amber-950 p-3 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/25">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider block text-amber-700">HIGH COMMUNITY PRIORITY</span>
                    <span className="text-xs font-black tracking-tight text-amber-950">{post.citizenReportCount} Citizens Reported This Incident</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/15 text-amber-800 border border-amber-400/40 px-2.5 py-1 rounded-lg font-bold tracking-wider uppercase">
                  Consolidated
                </span>
              </div>
            ) : null}

            {/* Title & Body */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {post.translations?.[currentLang]?.title 
                  ? post.translations[currentLang].title 
                  : tr(post.title, currentLang)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {post.translations?.[currentLang]?.content 
                  ? post.translations[currentLang].content 
                  : tr(post.content, currentLang)}
              </p>
            </div>

            {post.isProgress && (
              <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{tr('In NIVAARAN verified pipeline — government & university working solution.', currentLang)}</span>
              </div>
            )}

            {/* Voting & Action Bar */}
            <div className="flex items-center space-x-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <button
                onClick={() => post.id && handleUpvote(post.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  post.hasUpvoted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{tr('Upvote', currentLang)} ({post.upvotes})</span>
              </button>

              <button
                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : (post.id || null))}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{tr('Comments', currentLang)} ({(post.comments || []).length})</span>
              </button>
            </div>

            {/* Comments Stream */}
            <div className="bg-slate-50/70 p-4 rounded-xl space-y-3">
              {(post.comments || []).length > 0 ? (
                (post.comments || []).map(c => (
                  <div key={c.id} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">{tr(c.author, currentLang)}</span>
                        {c.isVerifiedGovt && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> {tr('VERIFIED GOVT ADMIN', currentLang)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{tr(c.timestamp, currentLang)}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{tr(c.text, currentLang)}</p>

                    {/* Government Admin Before & After Proof Photo Comparison */}
                    {c.isVerifiedGovt && c.beforeImg && c.afterImg && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1 text-slate-700" /> {tr('Government Ground Audit Evidence (Before vs After)', currentLang)}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-rose-700 block">{tr('BEFORE (Reported Condition)', currentLang)}</span>
                            <img src={c.beforeImg} alt="Before work" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-emerald-700 block">{tr('AFTER (University & Govt Solution)', currentLang)}</span>
                            <img src={c.afterImg} alt="After work" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">{tr('No comments yet. Be the first to reply!', currentLang)}</p>
              )}

              {/* Add Comment Input */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder={tr('Write a comment or query...', currentLang)}
                  value={activeCommentPostId === post.id ? commentInput : ''}
                  onFocus={() => post.id && setActiveCommentPostId(post.id)}
                  onChange={e => {
                    if (post.id) setActiveCommentPostId(post.id);
                    setCommentInput(e.target.value);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  onClick={() => post.id && handleAddComment(post.id)}
                  className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {tr('Reply', currentLang)}
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
