import React, { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, MessageSquare, MapPin, CheckCircle2, Send, Image as ImageIcon, Zap, Users, Trash2, Volume2, Film } from 'lucide-react';
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

// Helper to provide relevant Jharkhand-specific photo and video evidence
const getJharkhandMediaForIncident = (category: string = '', title: string = '') => {
  const c = `${category} ${title}`.toLowerCase();
  if (c.includes('mine') || c.includes('coal') || c.includes('subsidence') || c.includes('jharia')) {
    return {
      img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-excavator-working-on-a-construction-site-43093-large.mp4',
    };
  }
  if (c.includes('arsenic') || c.includes('fluoride') || c.includes('water') || c.includes('handpump')) {
    return {
      img: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-crop-field-43285-large.mp4',
    };
  }
  if (c.includes('drought') || c.includes('aquifer') || c.includes('palamu') || c.includes('borewell')) {
    return {
      img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-dry-yellow-fields-43282-large.mp4',
    };
  }
  if (c.includes('elephant') || c.includes('wildlife') || c.includes('forest') || c.includes('betla')) {
    return {
      img: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-dense-green-forest-43283-large.mp4',
    };
  }
  if (c.includes('ganga') || c.includes('erosion') || c.includes('diara') || c.includes('riverbank')) {
    return {
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-rapidly-in-a-river-stream-43188-large.mp4',
    };
  }
  if (c.includes('road') || c.includes('bridge') || c.includes('scour') || c.includes('sinkhole')) {
    return {
      img: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-cars-moving-on-a-road-in-a-rural-area-43309-large.mp4',
    };
  }
  if (c.includes('chemical') || c.includes('slurry') || c.includes('effluent') || c.includes('red mud')) {
    return {
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      video: 'https://assets.mixkit.co/videos/preview/mixkit-heavy-rain-falling-on-the-ground-43243-large.mp4',
    };
  }
  // Default to flood / drainage
  return {
    img: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-rapidly-in-a-river-stream-43188-large.mp4',
  };
};

export const CitizenCommunityFeedTab: React.FC = () => {
  const { currentLang } = useLanguage();
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
      author: 'Ramesh Kumar (Hutup Ward Resident)',
      district: 'Ranchi',
      block: 'Kanke',
      title: 'Monsoon water accumulation near Government High School Hutup',
      content: 'Heavy storm runoff from Kanke catchment has submerged the main access road under 3.5 feet of stagnant water. 450 school children cannot reach school safely.',
      upvotes: 48,
      hasUpvoted: false,
      timestamp: '2 hours ago',
      category: 'Flooding & Drainage',
      status: 'University Team Assigned',
      evidenceUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-rapidly-in-a-river-stream-43188-large.mp4',
      comments: [
        {
          id: 'C-01',
          author: 'Priya Sharma (Parent, Hutup)',
          role: 'Citizen',
          text: 'This happens every monsoon. We need permanent telemetry warning and automated drainage pumps here.',
          timestamp: '1 hour ago',
        },
        {
          id: 'C-02',
          author: 'Officer A. K. Verma (District Disaster Management Cell, Ranchi)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'OFFICIAL UPDATE: Ground inspection completed by Ranchi BDO office. BIT Mesra Civil & IoT Engineering team assigned to install solar millimeter-wave water level radar and automated desilting siphon.',
          timestamp: '30 mins ago',
          beforeImg: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
          afterImg: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'POST-102',
      author: 'Deepak Soren (Tisri Gram Pradhan)',
      district: 'Giridih',
      block: 'Tisri',
      title: 'Severe arsenic and fluoride contamination in 18 Santhal village handpumps',
      content: 'Water quality lab tests show arsenic at 8x WHO limits. Children and elders in Lokai and Baramasia suffering from skeletal fluorosis and skin lesions.',
      upvotes: 62,
      hasUpvoted: false,
      timestamp: '4 hours ago',
      category: 'Water Quality & Contamination',
      status: 'Prototype Active',
      evidenceUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-crop-field-43285-large.mp4',
      comments: [
        {
          id: 'C-03',
          author: 'Prof. Ankit Verma (IIT ISM Dhanbad)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'HEI UPDATE: IIT (ISM) Dhanbad Environmental Engineering team has assembled the FeOOH nanoadsorbent cartridge prototype. Field testing at Lokai Mark II handpumps scheduled this week with Tata Steel Foundation support.',
          timestamp: '1 hour ago',
        }
      ],
    },
    {
      id: 'POST-103',
      author: 'Manoj Mahto (Jharia Colliery Action Committee)',
      district: 'Dhanbad',
      block: 'Jharia',
      title: 'Ground subsidence cracks and toxic CO smoke venting near Lodna 4 Pits',
      content: 'Continuous subterranean coalfire smoke and 1.2m wide ground cracks opened near residential quarters. Ground temperature measured at 56°C.',
      upvotes: 84,
      hasUpvoted: false,
      timestamp: '5 hours ago',
      category: 'Mining & Coalfire Disaster',
      status: 'Government Validated',
      evidenceUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-excavator-working-on-a-construction-site-43093-large.mp4',
      comments: [
        {
          id: 'C-04',
          author: 'Shri A. K. Rai (Deputy Commissioner, Dhanbad)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'OFFICIAL ORDER: Section 144 advisory issued for immediate periphery. BCCL safety cell and IIT (ISM) Rock Mechanics team deployed for borehole DTS temperature logging and nitrogen grouting.',
          timestamp: '2 hours ago',
        }
      ],
    },
    {
      id: 'POST-104',
      author: 'Sunita Devi (Chhatarpur Kisan Samiti)',
      district: 'Palamu',
      block: 'Chhatarpur',
      title: 'North Koel rain shadow drought: Groundwater plunged below 42 metres',
      content: 'Over 1,800 hectares of paddy wilting due to 45 day monsoon deficit. Deep community borewells running dry with zero surface irrigation.',
      upvotes: 39,
      hasUpvoted: false,
      timestamp: '7 hours ago',
      category: 'Drought & Aquifer Depletion',
      status: 'University Team Assigned',
      evidenceUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-dry-yellow-fields-43282-large.mp4',
      comments: [
        {
          id: 'C-05',
          author: 'Dr. Rameshwar Oraon (BAU Ranchi Agronomy)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'R and D INTERVENTION: Birsa Agricultural University team deploying solar LoRa piezometers and automated tension triggered micro drip kits across 50 hectares in Mahugawan.',
          timestamp: '3 hours ago',
        }
      ],
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

  // Live subscription to workflowStore challenges
  useEffect(() => {
    const langHandler = () => setChallenges(workflowStore.getChallenges());
    window.addEventListener(STORE_EVENT, langHandler);
    return () => window.removeEventListener(STORE_EVENT, langHandler);
  }, []);

  // Auto-generate verified progress posts for challenges in verified pipeline
  const progressPosts: FeedPostUI[] = useMemo(() => {
    return challenges
      .filter(c => (getStageForStatus(c.status)?.stageNumber ?? 0) >= 3)
      .slice(0, 8)
      .map(c => {
        const media = getJharkhandMediaForIncident(c.category, c.title);
        const photo = c.evidenceUrls?.[0] || (c as any).evidenceUrl || media.img;
        const video = c.videoUrl || (c as any).videoUrls?.[0] || media.video;

        return {
          id: `PROG-${c.id}`,
          author: 'NIVAARAN Verified Update',
          district: c.district,
          block: c.block || 'District HQ',
          title: c.title.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
          content: `This community concern has entered the verified institutional pipeline and is now under an active government and university solution. Live stage: ${getPublicStatusLabel(c.status)}.`,
          upvotes: 0,
          hasUpvoted: false,
          timestamp: 'Live',
          category: c.category,
          status: getPublicStatusLabel(c.status),
          evidenceUrl: photo,
          videoUrl: video,
          isProgress: true,
          citizenReportCount: c.citizenReportCount || 1,
        };
      });
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
      title: newPostTitle.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      content: newPostContent.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      category: 'General Civic Problem',
      status: 'Under Review',
      evidenceUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      upvotes: 0,
    });

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: FeedComment = {
      id: `C-${Date.now()}`,
      author: 'You (Citizen Resident)',
      role: 'Citizen',
      text: commentInput.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      timestamp: 'Just now',
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
      }
      return p;
    }));

    try {
      await addCommentToFeedPost(postId, newComment);
    } catch {
      // Offline fallback
    }

    setCommentInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Create New Post Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>{tr('Share an Incident or Ground Reality with Your Community', currentLang)}</span>
        </h3>
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={tr('Incident summary title...', currentLang)}
              value={newPostTitle}
              onChange={e => setNewPostTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
              required
            />
            <select
              value={newPostDistrict}
              onChange={e => setNewPostDistrict(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium"
            >
              {JHARKHAND_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <textarea
            rows={2}
            placeholder={tr('Describe the issue, street, landmark, or impact on villagers...', currentLang)}
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{tr('Post to Community', currentLang)}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {allPosts.map((post, idx) => {
          const photoUrl = (post as any).evidenceUrl || (post as any).img || (post as any).beforeImg || (post as any).evidenceUrls?.[0];
          const videoUrl = (post as any).videoUrl || ((post as any).evidenceUrl && ((post as any).evidenceUrl.endsWith('.mp4') || (post as any).evidenceUrl.includes('/evidence_videos/')) ? (post as any).evidenceUrl : null);

          return (
            <div key={post.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${
                    post.isProgress ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {post.isProgress ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{tr(post.author, currentLang)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">· {tr(post.timestamp || 'Live', currentLang)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      {tr(post.district, currentLang)} {post.block ? `(${tr(post.block, currentLang)})` : ''}
                    </span>
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

              {/* Media Section: Photos & Playable Videos */}
              <div className="space-y-2">
                {videoUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs">
                    <div className="absolute top-2.5 left-2.5 z-10 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold border border-white/20">
                      <Film className="w-3 h-3 text-rose-400" />
                      <span>Live Incident Video Footage</span>
                    </div>
                    <video
                      src={videoUrl}
                      controls
                      preload="metadata"
                      className="w-full h-56 sm:h-64 object-cover"
                    />
                  </div>
                )}

                {photoUrl && (!videoUrl || photoUrl !== videoUrl) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-60 group shadow-xs">
                    <img
                      src={photoUrl}
                      alt={post.title}
                      className="w-full h-52 object-cover group-hover:scale-102 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold border border-white/20">
                      <ImageIcon className="w-2.5 h-2.5 text-slate-300" />
                      <span>Geotagged Field Photo Evidence</span>
                    </div>

                    {post.citizenReportCount && post.citizenReportCount > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-amber-500/95 text-amber-950 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-amber-300/70 text-[11px] font-black">
                        <Users className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                        <span>{post.citizenReportCount} Citizens Reported</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {/* Citizen Voice Note Audio Player */}
              {(post as any).audioUrl && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold shrink-0 text-xs">
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>🎙️ Voice Note {(post as any).voiceLanguage ? `(${(post as any).voiceLanguage === 'hi-IN' ? 'हिन्दी' : (post as any).voiceLanguage === 'bn-IN' ? 'বাংলা' : (post as any).voiceLanguage === 'sa-IN' ? 'संथाली' : 'English'})` : ''}</span>
                  </div>
                  <audio src={(post as any).audioUrl} controls className="h-7 max-w-[200px]" />
                </div>
              )}

              {post.isProgress && (
                <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{tr('In NIVAARAN verified pipeline: government and university working solution.', currentLang)}</span>
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
                      <p className="text-slate-700">{tr(c.text, currentLang)}</p>
                      {c.beforeImg && c.afterImg && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">{tr('Before Intervention', currentLang)}</span>
                            <img src={c.beforeImg} alt="Before" className="rounded-lg h-24 w-full object-cover border border-slate-200" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-600 block mb-1">{tr('After Solution Deployed', currentLang)}</span>
                            <img src={c.afterImg} alt="After" className="rounded-lg h-24 w-full object-cover border border-emerald-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-1">{tr('No comments yet. Be the first to reply!', currentLang)}</p>
                )}

                {/* Comment Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder={tr('Write a comment or query...', currentLang)}
                    value={activeCommentPostId === post.id ? commentInput : ''}
                    onFocus={() => setActiveCommentPostId(post.id || null)}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && post.id) {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  />
                  <button
                    onClick={() => post.id && handleAddComment(post.id)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {tr('Reply', currentLang)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
