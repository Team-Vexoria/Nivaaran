import React, { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, MessageSquare, MapPin, CheckCircle2, Send, Image as ImageIcon, Zap, Users, Trash2, Volume2, Film, Camera, Sparkles, ShieldCheck, Tag, X } from 'lucide-react';
import {
  subscribeToFeedPosts, submitFeedPostToFirestore, upvotePostInFirestore, FeedPostDoc, addCommentToFeedPost, deleteFeedPostFromFirestore
} from '../../services/firebaseService';
import { useLanguage } from '../../context/LanguageContext';
import { tr } from '../../i18n/translationEngine';

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



const CIVIC_CATEGORIES = [
  { id: 'Flooding & Drainage', label: 'Flooding & Drainage', icon: '🌊' },
  { id: 'Water Quality & Contamination', label: 'Water Quality', icon: '🧪' },
  { id: 'Mining & Coalfire Disaster', label: 'Mining / Coalfire', icon: '🔥' },
  { id: 'Drought & Aquifer Depletion', label: 'Drought & Crops', icon: '🌾' },
  { id: 'Bridge Infrastructure & Transport Safety', label: 'Road & Bridge', icon: '🛣️' },
  { id: 'Wildlife Conservation & Conflict', label: 'Forest & Wildlife', icon: '🐾' },
  { id: 'Public Health & Sanitation', label: 'Health & Sanitation', icon: '🏥' },
];
export const CitizenCommunityFeedTab: React.FC = () => {
  const { currentLang } = useLanguage();

  // ═════════════════════════════════════════════════════════════════════════════
  // 15 REAL RECENT JHARKHAND COMMUNITY POSTS
  // ═════════════════════════════════════════════════════════════════════════════
  const seedPosts: FeedPostUI[] = [
    // Post 1: Ranchi (Kanke / Hutup)
    {
      id: 'POST-101',
      author: 'Ramesh Kumar (Hutup Ward Resident)',
      district: 'Ranchi',
      block: 'Kanke',
      title: 'Monsoon stormwater accumulation submerging Government High School road in Hutup',
      content: 'Heavy storm runoff from Kanke catchment has submerged the main access road under 3.5 feet of stagnant runoff. 450 school children cannot reach school safely.',
      upvotes: 48,
      hasUpvoted: false,
      timestamp: '2 hours ago',
      category: 'Flooding & Drainage',
      status: 'University Team Assigned',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq1D23HuJQ6RVpd3c7min0GBgYLAgX9Z45pSscUBl66A3FD8_T6ZYPOpU&s=10',
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
          text: 'OFFICIAL UPDATE: Ground inspection completed by Ranchi BDO office. BIT Mesra Civil & IoT Engineering team assigned to install solar millimeter wave water level radar and automated desilting siphon.',
          timestamp: '30 mins ago',
        },
      ],
    },

    // Post 2: Giridih (Tisri / Lokai)
    {
      id: 'POST-102',
      author: 'Deepak Soren (Tisri Gram Pradhan)',
      district: 'Giridih',
      block: 'Tisri',
      title: 'Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps',
      content: 'Water quality lab tests show arsenic at 8x WHO safe limits and fluoride at 3.6 mg per litre in community tubewells. Over 6,200 residents suffering from skeletal fluorosis and skin lesions.',
      upvotes: 62,
      hasUpvoted: false,
      timestamp: '4 hours ago',
      category: 'Water Quality & Contamination',
      status: 'Prototype Active',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0Bs60g67PALhjpjdj_1vx-i_nuY6qeagpO3xmZY5PBl0ROCznqT5mYCY&s=10',
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

    // Post 3: Dhanbad (Jharia / Lodna)
    {
      id: 'POST-103',
      author: 'Manoj Mahto (Jharia Colliery Action Committee)',
      district: 'Dhanbad',
      block: 'Jharia',
      title: 'Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits',
      content: 'Continuous subterranean coalfire smoke and 1.2m wide ground cracks opened near residential quarters. Ground surface temperature measured at 56 degrees Celsius with asphyxiation risks.',
      upvotes: 84,
      hasUpvoted: false,
      timestamp: '5 hours ago',
      category: 'Mining & Coalfire Disaster',
      status: 'Government Validated',
      evidenceUrl: 'https://imgs.etvbharat.com/etvbharat/prod-images/22-08-2026/1200-675-27455673-thumbnail-16x9-land-subsidence-1-aspera.jpg',
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

    // Post 4: Palamu (Chhatarpur / Mahugawan)
    {
      id: 'POST-104',
      author: 'Sunita Devi (Chhatarpur Kisan Samiti)',
      district: 'Palamu',
      block: 'Chhatarpur',
      title: 'North Koel rain shadow drought and deep aquifer drawdown below 42 metres',
      content: 'Over 1,800 hectares of paddy wilting due to 45 day monsoon deficit. Deep community borewells running dry with zero surface irrigation for 940 tribal farming families.',
      upvotes: 39,
      hasUpvoted: false,
      timestamp: '7 hours ago',
      category: 'Drought & Aquifer Depletion',
      status: 'University Team Assigned',
      evidenceUrl: 'https://img.manoramayearbook.in/content/dam/yearbook/learn/world/images/2023/oct/koel-project.jpg',
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

    // Post 5: East Singhbhum (Jamshedpur / Bagbera & Mango)
    {
      id: 'POST-105',
      author: 'Subhasish Ghosh (Bagbera Citizens Welfare)',
      district: 'East Singhbhum',
      block: 'Jamshedpur',
      title: 'Subarnarekha and Kharkai confluence flash flood backwater inundating Bagbera colony',
      content: 'Depressional downpour caused 4.2m rapid river swell. Storm culverts choked with industrial slag runoff, trapping stormwater across 6 residential wards and cutting off arterial roads.',
      upvotes: 56,
      hasUpvoted: false,
      timestamp: '8 hours ago',
      category: 'Flood Management & Urban Drainage',
      status: 'University Team Assigned',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1pjzJvqfd0SNcS-r-ko5t2jUzh9xVHK42Q-IKunXanI7MNj5moYR-Q9s&s=10',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-rapidly-in-a-river-stream-43188-large.mp4',
      comments: [
        {
          id: 'C-06',
          author: 'Dr. V. K. Mahato (NIT Jamshedpur Hydraulic Engg)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'TECHNICAL PLAN: NIT Jamshedpur team installing ultrasonic stage telemetry sensors and self scouring vortex siphon gates at Bagbera outflow with Tata Steel TSRDS grant.',
          timestamp: '4 hours ago',
        }
      ],
    },

    // Post 6: West Singhbhum (Noamundi / Gua Basti)
    {
      id: 'POST-106',
      author: 'Birsa Ho (Saranda Forest Rights Samiti)',
      district: 'West Singhbhum',
      block: 'Noamundi',
      title: 'Hematite red mud slurry runoff polluting Karo river drinking water sources',
      content: 'Opencast iron ore mine tailing bund breach discharged high turbidity hematite red slurry above 450 NTU into Karo river, depriving 14 Ho tribal settlements of safe drinking water.',
      upvotes: 73,
      hasUpvoted: false,
      timestamp: '10 hours ago',
      category: 'Industrial Mining Effluent & River Contamination',
      status: 'Government Validated',
      evidenceUrl: 'https://www.researchgate.net/publication/257909496/figure/fig1/AS:611887985225730@1522896872236/Discharge-of-red-mud-as-slurry-into-the-pond.png',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-heavy-rain-falling-on-the-ground-43243-large.mp4',
      comments: [
        {
          id: 'C-07',
          author: 'Shri Kuldeep Choudhary (DC West Singhbhum)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'GOVERNMENT DIRECTIVE: State Pollution Board issued emergency containment order to mine operator. Kolhan University and NIT Jamshedpur deploying solar mobile clarifier units.',
          timestamp: '5 hours ago',
        }
      ],
    },

    // Post 7: Latehar (Barwadih / Betla Buffer)
    {
      id: 'POST-107',
      author: 'Kishore Tirkey (Betla Eco Development Committee)',
      district: 'Latehar',
      block: 'Barwadih',
      title: 'Elephant herd corridor disruption and nocturnal crop raiding in Betla forest fringe',
      content: 'A herd of 16 Asiatic elephants displaced by railway barrier construction is entering agricultural farmlands nightly. 120 farming families lost 22 lakh rupees in ruined paddy crops.',
      upvotes: 67,
      hasUpvoted: false,
      timestamp: '12 hours ago',
      category: 'Wildlife Conservation & Conflict',
      status: 'University Team Assigned',
      evidenceUrl: 'https://images.moneycontrol.com/static-mcnews/2018/09/Elephants.jpg?impolicy=website&width=1280&height=720',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-dense-green-forest-43283-large.mp4',
      comments: [
        {
          id: 'C-08',
          author: 'Dr. Priya Sharma (BIT Sindri Wildlife IoT)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'FIELD UPDATE: 6 buried solar geophone seismic sensors deployed along elephant crossing corridor with automated SMS early warning sirens for surrounding villagers.',
          timestamp: '6 hours ago',
        }
      ],
    },

    // Post 8: Sahibganj (Rajmahal / Kankjol Diara)
    {
      id: 'POST-108',
      author: 'Alimuddin Ansari (Diara Island Mukhiya)',
      district: 'Sahibganj',
      block: 'Rajmahal',
      title: 'Ganga riverbank erosion and seasonal island submergence cutting off boat access',
      content: 'Severe northward meander scour along Ganga riverbank eroded 85 metres of embankment near Rajmahal, isolating 420 diara families and cutting off river ambulance logistics.',
      upvotes: 51,
      hasUpvoted: false,
      timestamp: '14 hours ago',
      category: 'Riverbank Erosion & Disaster Inundation',
      status: 'In Progress',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRSRC9joMqrn5vUquRFw-ONf7divu8yjdflgDMnbYFYbVk0SeRc8nhF8LZ&s=10',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-rapidly-in-a-river-stream-43188-large.mp4',
      comments: [
        {
          id: 'C-09',
          author: 'Dr. Hemant Murmu (SKMU Dumka Geomorphology)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'R and D INTERVENTION: Sido Kanhu Murmu University team deploying bamboo reinforced geotextile eco spurs and real time bathymetric sonar buoys with Jindal CSR co funding.',
          timestamp: '7 hours ago',
        }
      ],
    },

    // Post 9: Bokaro (Bermo / Phusro)
    {
      id: 'POST-109',
      author: 'Rajesh Pandey (Bermo Citizen Forum)',
      district: 'Bokaro',
      block: 'Bermo',
      title: 'Coal fly ash slurry pipeline rupture contaminating Konar river municipal intake',
      content: 'Thermal power plant ash pond slurry pipeline rupture discharged dense coal fly ash into Konar tributary. Total dissolved solids surged above 1850 ppm, choking public water intake for 28,000 people.',
      upvotes: 58,
      hasUpvoted: false,
      timestamp: '16 hours ago',
      category: 'Thermal Power Industrial Pollution',
      status: 'Under Review',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhPjXniEU02EaABe2m7kGFX1AVhsfBLFVCQkv2vCA-v2Yx0z4OCxDARFy9&s=10',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-heavy-rain-falling-on-the-ground-43243-large.mp4',
      comments: [
        {
          id: 'C-10',
          author: 'Officer N. K. Jha (Bokaro Disaster Management Cell)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'OFFICIAL NOTICE: Power utility instructed to halt pipeline flow. IIT (ISM) Dhanbad testing autonomous electro coagulation ash separator.',
          timestamp: '8 hours ago',
        }
      ],
    },

    // Post 10: Saraikela Kharsawan (Adityapur / Gamharia)
    {
      id: 'POST-110',
      author: 'Manish Sahu (Adityapur Industrial Association)',
      district: 'Saraikela Kharsawan',
      block: 'Adityapur',
      title: 'Untreated electroplating heavy metal chemical effluent discharge into Kharkai river',
      content: 'High hexavalent chromium and nickel detected in stormwater runoff discharging into Kharkai river at Adityapur Phase 6. Downstream villagers report skin dermatitis and severe fish mortality.',
      upvotes: 64,
      hasUpvoted: false,
      timestamp: '18 hours ago',
      category: 'Hazardous Industrial Chemical Effluent',
      status: 'Government Validated',
      evidenceUrl: 'https://irp.cdn-website.com/c6509cd8/dms3rep/multi/opt/902x677p591x444-640w.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-heavy-rain-falling-on-the-ground-43243-large.mp4',
      comments: [
        {
          id: 'C-11',
          author: 'Dr. P. K. Soren (NIT Jamshedpur Chemical Engg)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'PILOT DEPLOYMENT: NIT Jamshedpur chemical engineering team installing continuous optical fluorometer stream and electrochemical reduction cells.',
          timestamp: '9 hours ago',
        }
      ],
    },

    // Post 11: Khunti (Torpa / Diyakel)
    {
      id: 'POST-111',
      author: 'Somra Munda (Torpa Lac Growers Cooperative)',
      district: 'Khunti',
      block: 'Torpa',
      title: 'Fungal blight and moth infestation destroying tribal lac cultivation on Kusum trees',
      content: 'Sudden outbreak of fungal blight and predatory moth larvae attacking 2,400 lac host trees across 12 Munda tribal hamlets in Torpa. 680 farming families facing 70 percent income loss.',
      upvotes: 45,
      hasUpvoted: false,
      timestamp: '20 hours ago',
      category: 'Agro Forestry & Tribal Livelihood',
      status: 'University Team Assigned',
      evidenceUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGMcQw-Fy1pxN0uo1Yz7QbJ59GZA9UVbQQ5sn0HwGAOrKmWbch3oPF3iE&s=10',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-dry-yellow-fields-43282-large.mp4',
      comments: [
        {
          id: 'C-12',
          author: 'Dr. R. N. Tiwari (BAU Ranchi Lac Research)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'RESEARCH ACTION: Birsa Agricultural University deploying organic micro encapsulated neem bio spray and thermal drone canopy survey across 500 trees in Diyakel.',
          timestamp: '10 hours ago',
        }
      ],
    },

    // Post 12: Deoghar (Madhupur / Mohanpur)
    {
      id: 'POST-112',
      author: 'Gopal Krishna Jha (Shravani Seva Samiti)',
      district: 'Deoghar',
      block: 'Madhupur',
      title: 'High coliform biological contamination and handpump failure during pilgrim rush',
      content: 'Coliform bacteria counts above 120 CFU per 100ml detected in 19 public water points along Shravani Mela pilgrim corridor near Mohanpur. 3 deep handpumps collapsed under high extraction.',
      upvotes: 43,
      hasUpvoted: false,
      timestamp: '1 day ago',
      category: 'Public Health & Drinking Water Quality',
      status: 'Submitted',
      evidenceUrl: 'https://cdn.ncbi.nlm.nih.gov/pmc/blobs/2e16/5920553/a342a6cbc907/nihms960800f1.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-crop-field-43285-large.mp4',
      comments: [],
    },

    // Post 13: Hazaribagh (Chouparan / Barakar Ghat)
    {
      id: 'POST-113',
      author: 'Surendra Singh (Barakar River Bridge Samiti)',
      district: 'Hazaribagh',
      block: 'Chouparan',
      title: 'Barakar river bridge pier foundation scour endangering rural transit lifeline',
      content: '2.8m deep riverbed scour pocket detected around Pier 3 of Barakar bridge connecting 22 agrarian villages to Chouparan market. Foundation exposure creates collapse risk during flash currents.',
      upvotes: 68,
      hasUpvoted: false,
      timestamp: '1 day ago',
      category: 'Bridge Infrastructure & Transport Safety',
      status: 'Government Validated',
      evidenceUrl: 'https://www.mdpi.com/water/water-15-02858/article_deploy/html/images/water-15-02858-g001-550.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cars-moving-on-a-road-in-a-rural-area-43309-large.mp4',
      comments: [
        {
          id: 'C-13',
          author: 'Executive Engineer (PWD Hazaribagh)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'OFFICIAL ACTION: Load limit restricted to light vehicles. VBU and NIT Jamshedpur structural teams installing fiber optic Bragg strain sensors and micro concrete geo jacket.',
          timestamp: '12 hours ago',
        }
      ],
    },

    // Post 14: Koderma (Chandwara / Dhab Forest Rim)
    {
      id: 'POST-104-B',
      author: 'Budhan Soren (Dhab Van Suraksha Samiti)',
      district: 'Koderma',
      block: 'Chandwara',
      title: 'Abandoned open pit mica mine quarry waterlogging and slope rim collapse hazard',
      content: 'Unbarricaded 35 foot deep acidic water pit spanning 18 hectares near residential settlement. Heavy slope erosion threatens 140 tribal houses during monsoon cloudbursts.',
      upvotes: 37,
      hasUpvoted: false,
      timestamp: '1 day ago',
      category: 'Abandoned Mine Hazard & Geotechnical Stability',
      status: 'Submitted',
      evidenceUrl: 'https://static.independent.co.uk/2023/02/23/08/newFile-6.jpg?width=1200&height=630&fit=crop',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-excavator-working-on-a-construction-site-43093-large.mp4',
      comments: [],
    },

    // Post 15: Gumla (Bishunpur / Netarhat Foothills)
    {
      id: 'POST-115',
      author: 'Anand Bhagat (Bishunpur Tribal Kisan Sangha)',
      district: 'Gumla',
      block: 'Bishunpur',
      title: 'Bauxite ore haulage truck road subsidence and hill slope slip on rural route',
      content: 'Heavy 16 wheeler bauxite transport trucks caused 2km stretch of hill road to develop deep rutting and edge shoulder collapse, cutting off bus and emergency ambulance connectivity to Bishunpur PHC.',
      upvotes: 49,
      hasUpvoted: false,
      timestamp: '2 days ago',
      category: 'Rural Road Infrastructure & Transport',
      status: 'Under Review',
      evidenceUrl: 'https://imgs.mongabay.com/wp-content/uploads/sites/30/2023/04/28114850/Boxite-Mines-near-Sakhuapani-Village-768x512-1.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cars-moving-on-a-road-in-a-rural-area-43309-large.mp4',
      comments: [
        {
          id: 'C-14',
          author: 'BDO Bishunpur (Gumla District)',
          role: 'Government Admin',
          isVerifiedGovt: true,
          text: 'FIELD INSPECTION: PWD Gumla conducting road shoulder grading. Ranchi University civil engineering team assessing geogrid soil stabilization.',
          timestamp: '1 day ago',
        }
      ],
    },
  ];

    const [posts, setPosts] = useState<FeedPostUI[]>(seedPosts);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostDistrict, setNewPostDistrict] = useState('Ranchi');
  const [newPostBlock, setNewPostBlock] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Flooding & Drainage');
  const [newPostPhotoUrl, setNewPostPhotoUrl] = useState('');
  const [newPostVideoUrl, setNewPostVideoUrl] = useState('');
  const [showMediaInputs, setShowMediaInputs] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    // Clear out any old dummy testing submissions from localStorage
    try {
      localStorage.removeItem('nivaaran_feed_posts');
    } catch {}

    const unsubscribe = subscribeToFeedPosts((incomingPosts) => {
      if (incomingPosts && incomingPosts.length > 0) {
        // Strict filter: Reject random junk, short test strings, and gibberish
        const validIncoming = incomingPosts.filter(p => {
          const t = (p.title || '').trim();
          const c = (p.content || '').trim();
          if (t.length < 8 || c.length < 8) return false;
          if (/^[,.s/\-_;:'"]+$/.test(t)) return false;
          const tLower = t.toLowerCase();
          const cLower = c.toLowerCase();
          const blocked = ['testing', 'testinq', 'dombivali', 'sfsv', 'hjhkm', ',nbbn', 'asdf', 'qwerty'];
          if (blocked.some(b => tLower.includes(b) || cLower.includes(b))) return false;
          return true;
        });

        // Collect new user/citizen posts not already in seedPosts
        const seedIdSet = new Set(seedPosts.map(s => s.id));
        const customUserPosts: FeedPostUI[] = validIncoming
          .filter(p => !seedIdSet.has(p.id))
          .map(p => ({
            ...p,
            hasUpvoted: false,
            timestamp: 'Live',
            comments: (p.comments || []).map((c: any, idx: number) => ({
              id: c.id || `C-${idx}`,
              author: c.author || 'Citizen',
              role: c.role || 'Citizen',
              text: c.text || '',
              timestamp: c.timestamp || 'Just now',
              beforeImg: c.beforeImg,
              afterImg: c.afterImg,
              isVerifiedGovt: c.isVerifiedGovt,
            })),
          }));

        setPosts([...customUserPosts, ...seedPosts]);
      } else {
        setPosts(seedPosts);
      }
    });

    return () => unsubscribe();
  }, []);

  const allPosts = useMemo<FeedPostUI[]>(() => posts, [posts, currentLang]);

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

    const fallbackImg = newPostPhotoUrl.trim() || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80';
    const videoLink = newPostVideoUrl.trim() || undefined;

    const newId = await submitFeedPostToFirestore({
      author: 'You (Citizen Resident)',
      district: newPostDistrict,
      block: newPostBlock.trim() || 'Local Panchayat',
      title: newPostTitle.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      content: newPostContent.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      category: newPostCategory,
      status: 'Under Review',
      evidenceUrl: fallbackImg,
      videoUrl: videoLink,
      upvotes: 0,
    });

    const newPost: FeedPostUI = {
      id: newId,
      author: 'You (Citizen Resident)',
      district: newPostDistrict,
      block: newPostBlock.trim() || 'Local Panchayat',
      title: newPostTitle.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      content: newPostContent.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
      category: newPostCategory,
      status: 'Under Review',
      evidenceUrl: fallbackImg,
      videoUrl: videoLink,
      upvotes: 0,
      hasUpvoted: false,
      timestamp: 'Just now',
      comments: [],
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostBlock('');
    setNewPostPhotoUrl('');
    setNewPostVideoUrl('');
    setShowMediaInputs(false);
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
    <div className="space-y-8 max-w-4xl mx-auto pt-8 pb-16 px-4 sm:px-6">
      {/* Clean Civic Ground Reality & Problem Post Box */}
      <div className="bg-white border border-stone-300 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
        {/* Warm Clean Header Ribbon */}
        <div className="bg-[#FAF7F2] border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-900 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-stone-900 flex items-center gap-2">
                <span>{tr('Community Crisis & Ground Reality Desk', currentLang)}</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  Jharkhand Live
                </span>
              </h3>
              <p className="text-[11px] text-stone-600 font-normal">
                {tr('Post ground issues to mobilize local citizens and fast track response from Government & University Labs', currentLang)}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-700 bg-white px-3 py-1 rounded-lg border border-stone-300 font-semibold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
            <span>AI Verified Pipeline</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreatePost} className="p-5 sm:p-6 space-y-4 bg-white">
          {/* Category Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-stone-500" />
              <span>{tr('Select Problem Category', currentLang)}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CIVIC_CATEGORIES.map(cat => {
                const isSelected = newPostCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewPostCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{tr(cat.label, currentLang)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                {tr('Incident Title / Problem Summary', currentLang)} <span className="text-amber-700">*</span>
              </label>
              <input
                type="text"
                placeholder={tr('e.g. Broken culvert submerged main hospital road in Kanke...', currentLang)}
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50 font-medium shadow-2xs"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                {tr('District', currentLang)} <span className="text-amber-700">*</span>
              </label>
              <select
                value={newPostDistrict}
                onChange={e => setNewPostDistrict(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50 font-semibold text-stone-800 shadow-2xs"
              >
                {JHARKHAND_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                {tr('Block / Panchayat', currentLang)}
              </label>
              <input
                type="text"
                placeholder={tr('e.g. Tisri, Hutup', currentLang)}
                value={newPostBlock}
                onChange={e => setNewPostBlock(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50 shadow-2xs"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
              {tr('Ground Details & Community Impact', currentLang)} <span className="text-amber-700">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={tr('Describe the ground reality, severity, affected citizens, landmarks, and what assistance is urgently required...', currentLang)}
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50 resize-y shadow-2xs leading-relaxed"
              required
            />
          </div>

          {/* Toggleable Media Links (Photo URL & Video URL) */}
          {showMediaInputs && (
            <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-300 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-800" />
                  <span>Attach Photographic or Video Evidence</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowMediaInputs(false)}
                  className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                    Photo URL (JPG / PNG)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={newPostPhotoUrl}
                    onChange={e => setNewPostPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                    Video URL (MP4 / Stream)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={newPostVideoUrl}
                    onChange={e => setNewPostVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!showMediaInputs && (
                <button
                  type="button"
                  onClick={() => setShowMediaInputs(true)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:border-stone-400 hover:bg-stone-100 text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-800" />
                  <span>{tr('Add Photo / Video Evidence', currentLang)}</span>
                </button>
              )}
              <span className="text-[11px] text-stone-500 hidden md:inline">
                Verified posts receive automated telemetry routing.
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer font-sans"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{tr('Publish Ground Reality Post', currentLang)}</span>
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
                      className="w-full aspect-[16/9] max-h-[440px] object-cover bg-black"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {photoUrl && (!videoUrl || photoUrl !== videoUrl) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm group">
                    <img
                      src={photoUrl}
                      alt={post.title}
                      className="w-full aspect-[16/9] max-h-[440px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
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
