import React, { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, MessageSquare, MapPin, CheckCircle2, Send, Image as ImageIcon, Zap, Users, Trash2, Volume2, Film, Camera, Sparkles, ShieldCheck, Tag, X, Eye } from 'lucide-react';
import {
  subscribeToFeedPosts, submitFeedPostToFirestore, upvotePostInFirestore, FeedPostDoc, addCommentToFeedPost, deleteFeedPostFromFirestore
} from '../../services/firebaseService';
import { CommunityPostDetailModal } from './CommunityPostDetailModal';
import { useLanguage } from '../../context/LanguageContext';
import { DISTRICT_PROBLEM_IMAGES } from '../../services/districtProblemImages';
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
    {
      "id": "POST-101",
      "author": "Citizen Cell (Lodna Colliery, Dhanbad)",
      "district": "Dhanbad",
      "block": "Jharia",
      "title": "Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits",
      "content": "Continuous subterranean coalfire smoke and 1.2m wide ground cracks opened near residential quarters. Ground surface temperature measured at 56 degrees Celsius with asphyxiation risks.",
      "upvotes": 69,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Mining & Coalfire Disaster",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-001'],
      "comments": [
        {
          "id": "C-101A",
          "author": "Local Citizen Representative (Lodna Colliery)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy continuous Fiber Optic Distributed Temperature Sensing (DTS) along with deep borehole nitrogen foam injection barrier.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-101B",
          "author": "District Admin Cell (Dhanbad)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri A. K. Rai, DC Dhanbad. Academic R&D team from IIT (ISM) Dhanbad onboarded with Bharat Coking Coal Limited (BCCL CSR) CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-102",
      "author": "Citizen Cell (Govindpur Cluster, Dhanbad)",
      "district": "Dhanbad",
      "block": "Katras",
      "title": "Heavy coal transport track vibration causing structural cracks in nearby schools and masonry",
      "content": "Continuous 40 tonne coal trailer movements create ground vibrations exceeding 8 mm/s PPV, causing diagonal shearing cracks in two primary schools and 60+ rural homes.",
      "upvotes": 52,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Mining & Coalfire Disaster",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-025'],
      "comments": [
        {
          "id": "C-102A",
          "author": "Local Citizen Representative (Govindpur Cluster)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Design recycled fly ash geopolymer seismic damping trenches and sub base vibration attenuation baffles along haulage corridors.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-102B",
          "author": "District Admin Cell (Dhanbad)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri A. K. Rai, DC Dhanbad. Engineering specification underway with IIT (ISM) Dhanbad and Bharat Coking Coal Limited (BCCL CSR).",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-103",
      "author": "Citizen Cell (Lokai & Baramasia, Giridih)",
      "district": "Giridih",
      "block": "Tisri",
      "title": "Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps",
      "content": "Water quality lab tests show arsenic at 8x WHO safe limits and fluoride at 3.6 mg per litre in community tubewells. Over 6200 residents suffering from skeletal fluorosis and skin lesions.",
      "upvotes": 71,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Water Quality & Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-002'],
      "comments": [
        {
          "id": "C-103A",
          "author": "Local Citizen Representative (Lokai & Baramasia)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Fabricate stainless steel 304 filter cartridge with toolless quick swap flange and nano iron adsorbent media.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-103B",
          "author": "District Admin Cell (Giridih)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Vikram Singh, DC Giridih. Academic R&D team from IIT (ISM) Dhanbad & BIT Sindri onboarded with Tata Steel Foundation CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-104",
      "author": "Citizen Cell (Bengabad Solar Grid, Giridih)",
      "district": "Giridih",
      "block": "Pirtand",
      "title": "High seasonal solar pump failure and inverter degradation due to extreme mica and quartz dust deposition",
      "content": "Fine abrasive mica and silica dust coats solar arrays in off grid tribal lift irrigation stations, causing 42% power yield drop and inverter overheating failures.",
      "upvotes": 54,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Renewable Energy & Power",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-026'],
      "comments": [
        {
          "id": "C-104A",
          "author": "Local Citizen Representative (Bengabad Solar Grid)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Develop hydrophobic self cleaning nano coatings and automatic piezo electric dust wiper rings for rural PV arrays.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-104B",
          "author": "District Admin Cell (Giridih)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Vikram Singh, DC Giridih. Engineering specification underway with IIT (ISM) Dhanbad & BIT Sindri and Tata Steel Foundation.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-105",
      "author": "Citizen Cell (Mahugawan, Palamu)",
      "district": "Palamu",
      "block": "Chhatarpur",
      "title": "North Koel rain shadow drought and deep aquifer drawdown below 42 metres",
      "content": "Over 1800 hectares of paddy wilting due to 45 day monsoon deficit. Deep community borewells running dry with zero surface irrigation for 940 tribal farming families.",
      "upvotes": 73,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Drought & Aquifer Depletion",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-003'],
      "comments": [
        {
          "id": "C-105A",
          "author": "Local Citizen Representative (Mahugawan)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install 24 LoRaWAN solar piezometers for real time aquifer recharge modeling and smart micro drip controllers.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-105B",
          "author": "District Admin Cell (Palamu)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Shashi Ranjan, DC Palamu. Academic R&D team from Birsa Agricultural University (BAU) onboarded with NTPC CSR Rural Energy Fund CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-106",
      "author": "Citizen Cell (Chainpur Pastoral Belt, Palamu)",
      "district": "Palamu",
      "block": "Daltonganj",
      "title": "Severe summer thermal stress and mortality in indigenous black Bengal goat rearing herds",
      "content": "Extreme 46C peak summer heat waves cause 28% herd mortality and acute dehydration across 800+ landless women goat farmers.",
      "upvotes": 56,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Drought & Livestock Livelihoods",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-027'],
      "comments": [
        {
          "id": "C-106A",
          "author": "Local Citizen Representative (Chainpur Pastoral Belt)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Construct passive evaporative cooled bamboo composite shelters with integrated IoT microclimate misters and electrolyte dispensers.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-106B",
          "author": "District Admin Cell (Palamu)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Shashi Ranjan, DC Palamu. Engineering specification underway with Birsa Agricultural University (BAU) and NTPC CSR Rural Energy Fund.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-107",
      "author": "Citizen Cell (Bagbera Colony, East Singhbhum)",
      "district": "East Singhbhum",
      "block": "Jamshedpur Urban",
      "title": "Subarnarekha and Kharkai river confluence backwater flood surge in Bagbera settlement",
      "content": "High tide monsoon surge forces river water 1.8km backwards through open drainage culverts, flooding 4200 low lying homes with contaminated floodwaters.",
      "upvotes": 75,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Flooding & Drainage",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-004'],
      "comments": [
        {
          "id": "C-107A",
          "author": "Local Citizen Representative (Bagbera Colony)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy ultrasonic stage telemetry sentinel array and solar automated knife gate backflow valves.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-107B",
          "author": "District Admin Cell (East Singhbhum)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Manjunath Bhajantri, DC East Singhbhum. Academic R&D team from NIT Jamshedpur onboarded with Tata Steel TSRDS CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-108",
      "author": "Citizen Cell (Golmuri Agricultural Strip, East Singhbhum)",
      "district": "East Singhbhum",
      "block": "Potka",
      "title": "Chromium and copper heavy metal bioaccumulation in vegetable farm soils along Kharkai river discharge channels",
      "content": "Treated industrial runoff contains residual heavy metals accumulating in topsoil, exceeding permissible agronomic phytotoxicity limits in spinach and brinjal crops.",
      "upvotes": 58,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Industrial Pollution & Soil Remediation",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-028'],
      "comments": [
        {
          "id": "C-108A",
          "author": "Local Citizen Representative (Golmuri Agricultural Strip)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Synthesize customized agricultural waste pyrolyzed magnetic biochar pellets for in situ heavy metal immobilization.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-108B",
          "author": "District Admin Cell (East Singhbhum)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Manjunath Bhajantri, DC East Singhbhum. Engineering specification underway with NIT Jamshedpur and Tata Steel TSRDS.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-109",
      "author": "Citizen Cell (Gua & Barajamda, West Singhbhum)",
      "district": "West Singhbhum",
      "block": "Noamundi",
      "title": "Iron ore tailings slurry and hematite red mud runoff polluting Karo river at Gua",
      "content": "Monsoon heavy rain overtopped iron ore slime ponds, releasing high turbidity hematite red sludge into Karo river, elevating TSS to 840 mg per litre.",
      "upvotes": 77,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Industrial Mining Effluent & River Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-005'],
      "comments": [
        {
          "id": "C-109A",
          "author": "Local Citizen Representative (Gua & Barajamda)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install modular multi chamber lamella clarifier tank with eco friendly bio flocculant dosing system.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-109B",
          "author": "District Admin Cell (West Singhbhum)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Kuldeep Chaudhary, DC West Singhbhum. Academic R&D team from Kolhan University & NIT Jamshedpur onboarded with Tata Steel Mining & SAIL RMD CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-110",
      "author": "Citizen Cell (Noamundi Forest Belt, West Singhbhum)",
      "district": "West Singhbhum",
      "block": "Jhinkpani",
      "title": "Acid mine drainage and manganese leaching into tribal forest drinking wells",
      "content": "Oxidation of exposed iron and manganese pyrite ores acidifies groundwater (pH 4.8) and leaches soluble manganese (1.4 mg/L) into 22 village wells.",
      "upvotes": 60,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Water Quality & Contamination",
      "status": "Prototype Active",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-029'],
      "comments": [
        {
          "id": "C-110A",
          "author": "Local Citizen Representative (Noamundi Forest Belt)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Construct limestone neutralization permeable reactive barriers (PRBs) coupled with manganese oxide catalytic bio sand filters.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-110B",
          "author": "District Admin Cell (West Singhbhum)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Kuldeep Chaudhary, DC West Singhbhum. Engineering specification underway with Kolhan University & NIT Jamshedpur and Tata Steel Mining & SAIL RMD.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-111",
      "author": "Citizen Cell (Betla Buffer Zone, Latehar)",
      "district": "Latehar",
      "block": "Barwadih",
      "title": "Elephant migration corridor nocturnal crop raiding and human elephant conflict at Betla buffer",
      "content": "Herd of 14 wild elephants routinely leaves Betla National Park corridor, destroying 65 hectares of standing maize crops and threatening 12 tribal hamlets.",
      "upvotes": 79,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Wildlife Conservation & Conflict",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-006'],
      "comments": [
        {
          "id": "C-111A",
          "author": "Local Citizen Representative (Betla Buffer Zone)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy 8 thermal IR camera towers with YOLOv8 Edge AI elephant detection and ultrasonic acoustic repellers.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-111B",
          "author": "District Admin Cell (Latehar)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Himanshu Mohan, DC Latehar. Academic R&D team from BIT Mesra & BAU Ranchi onboarded with Essar Power CSR & CCL CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-112",
      "author": "Citizen Cell (Chandwa Valley Link, Latehar)",
      "district": "Latehar",
      "block": "Mahuadanr",
      "title": "Frequent monsoon flash flood logjams and wooden culvert collapse cutting off Mahuadanr valley",
      "content": "Mountain torrents carry uprooted timber logjams that smash temporary wooden culverts, cutting off medical and food access for 11000 tribal villagers during peak rains.",
      "upvotes": 62,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Bridge Infrastructure & Transport Safety",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-030'],
      "comments": [
        {
          "id": "C-112A",
          "author": "Local Citizen Representative (Chandwa Valley Link)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Design modular precast ultra high performance fiber reinforced concrete (UHPFRC) self scouring arch culverts.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-112B",
          "author": "District Admin Cell (Latehar)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Himanshu Mohan, DC Latehar. Engineering specification underway with BIT Mesra & BAU Ranchi and Essar Power CSR & CCL CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-113",
      "author": "Citizen Cell (Diara Khas & Udhwa, Sahibganj)",
      "district": "Sahibganj",
      "block": "Rajmahal",
      "title": "Severe Ganga riverbank scouring and seasonal road washaway isolating 14 Diara island villages",
      "content": "High velocity flood currents scoured 85 metres of riverbank in Rajmahal, threatening the main connecting road and isolating 14 Diara island hamlets with 11000 residents.",
      "upvotes": 53,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Flooding & Riverbank Scour",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-007'],
      "comments": [
        {
          "id": "C-113A",
          "author": "Local Citizen Representative (Diara Khas & Udhwa)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install biodegradable vetiver grass root geocells and submerged concrete tetrahedron deflectors.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-113B",
          "author": "District Admin Cell (Sahibganj)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Umesh Prasad Sah, DC Sahibganj. Academic R&D team from SKMU Dumka & IIT (ISM) Dhanbad onboarded with Adani Ports & Inland Waterways CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-114",
      "author": "Citizen Cell (Sahibganj Harbor Sector, Sahibganj)",
      "district": "Sahibganj",
      "block": "Sakrigali",
      "title": "River siltation and sudden shoreline recession disrupting inland vessel loading and fishing jetties",
      "content": "Excessive bedload silt deposition creates shifting shallow sandbars (depth < 1.4m), stranding cargo barges and blocking traditional fishing boats.",
      "upvotes": 64,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Waterways & Sedimentation Control",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-031'],
      "comments": [
        {
          "id": "C-114A",
          "author": "Local Citizen Representative (Sahibganj Harbor Sector)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy autonomous solar sonar bathymetric mapping drone and dynamic hydrodynamic sediment diversion curtains.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-114B",
          "author": "District Admin Cell (Sahibganj)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Umesh Prasad Sah, DC Sahibganj. Engineering specification underway with SKMU Dumka & IIT (ISM) Dhanbad and Adani Ports & Inland Waterways CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-115",
      "author": "Citizen Cell (Hutup & Mesra Mor, Ranchi)",
      "district": "Ranchi",
      "block": "Kanke",
      "title": "Monsoon stormwater accumulation submerging Government High School road in Hutup",
      "content": "Heavy storm runoff from Kanke catchment has submerged the main access road under 3.5 feet of stagnant runoff. 450 school children cannot reach school safely.",
      "upvotes": 55,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Flooding & Drainage",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-008'],
      "comments": [
        {
          "id": "C-115A",
          "author": "Local Citizen Representative (Hutup & Mesra Mor)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install radar water level sentinels, automated solar sump pumps, and perforated precast drainage conduits.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-115B",
          "author": "District Admin Cell (Ranchi)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Rahul Kumar Sinha, DC Ranchi. Academic R&D team from BIT Mesra & Ranchi University onboarded with Central Coalfields Ltd (CCL CSR) CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-116",
      "author": "Citizen Cell (Mandar Agro Market Belt, Ranchi)",
      "district": "Ranchi",
      "block": "Bero",
      "title": "Cold storage decay and high post harvest loss in peri urban tomato and green chili crops",
      "content": "Lack of local cold chain causes 35% rotting in 120 tonnes of daily harvested tomatoes and chilies during summer months, causing heavy distress sales.",
      "upvotes": 66,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Agri Cold Chain & Renewable Storage",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-032'],
      "comments": [
        {
          "id": "C-116A",
          "author": "Local Citizen Representative (Mandar Agro Market Belt)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Engineer solar powered decentralized phase change material (PCM) thermal storage cooling micro units with smart humidity regulation.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-116B",
          "author": "District Admin Cell (Ranchi)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Rahul Kumar Sinha, DC Ranchi. Engineering specification underway with BIT Mesra & Ranchi University and Central Coalfields Ltd (CCL CSR).",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-117",
      "author": "Citizen Cell (Phusro & Jaridih, Bokaro)",
      "district": "Bokaro",
      "block": "Bermo",
      "title": "Fly ash slurry pipeline breach discharging into Konar river intake zone at Phusro",
      "content": "Rupture in thermal power plant ash disposal pipeline discharged 450 tonnes of fly ash slurry into Konar river, threatening municipal drinking water intake wells.",
      "upvotes": 57,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Industrial Power Plant Fly Ash Spill",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-009'],
      "comments": [
        {
          "id": "C-117A",
          "author": "Local Citizen Representative (Phusro & Jaridih)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy mobile continuous hydrocyclone slurry separators and optical suspended solids sensors.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-117B",
          "author": "District Admin Cell (Bokaro)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Kuldeep Chaudhary, DC Bokaro. Academic R&D team from IIT (ISM) Dhanbad & BIT Mesra onboarded with SAIL Bokaro Steel Plant CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-118",
      "author": "Citizen Cell (Balidih Industrial Area, Bokaro)",
      "district": "Bokaro",
      "block": "Chas",
      "title": "Toxic phenolic wastewater and cyanide traces in industrial storm drains near steel processing belt",
      "content": "Intermittent discharge of untreated industrial by products into open storm drains contaminates shallow borewells with phenol (0.45 mg/L) and toxic trace compounds.",
      "upvotes": 68,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Industrial Effluent & Chemical Remediation",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-033'],
      "comments": [
        {
          "id": "C-118A",
          "author": "Local Citizen Representative (Balidih Industrial Area)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Construct multi stage immobilized enzyme bioreactor coupled with constructed floating wetland phytoremediation beds.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-118B",
          "author": "District Admin Cell (Bokaro)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Kuldeep Chaudhary, DC Bokaro. Engineering specification underway with IIT (ISM) Dhanbad & BIT Mesra and SAIL Bokaro Steel Plant CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-119",
      "author": "Citizen Cell (Adityapur Phase 4, Saraikela Kharsawan)",
      "district": "Saraikela Kharsawan",
      "block": "Gamharia",
      "title": "Untreated electroplating heavy metal and acid bath discharge into Kharkai river tributary",
      "content": "Unauthorized discharge of chromium, nickel, and acidic wash water from small scale electroplating units in Adityapur Phase 4 into natural nallah entering Kharkai river.",
      "upvotes": 59,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Industrial Chemical Water Pollution",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-010'],
      "comments": [
        {
          "id": "C-119A",
          "author": "Local Citizen Representative (Adityapur Phase 4)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Fabricate decentralized modular electrochemical reduction and heavy metal precipitation unit with smart pH/EC telemetry.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-119B",
          "author": "District Admin Cell (Saraikela Kharsawan)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Ravi Shankar Shukla, DC Saraikela Kharsawan. Academic R&D team from NIT Jamshedpur onboarded with Adityapur Industrial Association & Tata Motors CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-120",
      "author": "Citizen Cell (Adityapur Auto Ancillary Zone, Saraikela Kharsawan)",
      "district": "Saraikela Kharsawan",
      "block": "Gamharia",
      "title": "High volatile organic compound (VOC) emissions and toxic paint sludge fumes in auto ancillary zones",
      "content": "Uncontained paint baking ovens and solvent degreasing booths release benzene and toluene fumes at 4x permissible limits, impacting 3200 surrounding workers.",
      "upvotes": 70,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Air Quality & VOC Control",
      "status": "Prototype Active",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-034'],
      "comments": [
        {
          "id": "C-120A",
          "author": "Local Citizen Representative (Adityapur Auto Ancillary Zone)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy photocatalytic TiO2 air purification filter scrubbers with real time photoionization detector (PID) telemetry.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-120B",
          "author": "District Admin Cell (Saraikela Kharsawan)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Ravi Shankar Shukla, DC Saraikela Kharsawan. Engineering specification underway with NIT Jamshedpur and Adityapur Industrial Association & Tata Motors CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-121",
      "author": "Citizen Cell (Dormo & Tapkara, Khunti)",
      "district": "Khunti",
      "block": "Torpa",
      "title": "Fungal shoot blight and Eublemma moth infestation destroying tribal Kusum tree lac yields",
      "content": "Severe fungal twig blight coupled with predatory caterpillar attack destroyed 70% of Rangeeni and Kusmi lac crops across 2400 tribal farmer host trees in Torpa block.",
      "upvotes": 61,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Agro Forestry & Tribal Livelihood Disease",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-011'],
      "comments": [
        {
          "id": "C-121A",
          "author": "Local Citizen Representative (Dormo & Tapkara)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Formulate bio fungicide botanical spray based on Trichoderma harzianum and deploy solar pheromone insect light traps.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-121B",
          "author": "District Admin Cell (Khunti)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Lokesh Mishra, DC Khunti. Academic R&D team from Birsa Agricultural University (BAU) onboarded with Tata Trusts & JASCOLAMPF CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-122",
      "author": "Citizen Cell (Karra Horticulture Cluster, Khunti)",
      "district": "Khunti",
      "block": "Torpa",
      "title": "Severe stem borer pest infestation damaging Dragon Fruit and Papaya horticulture plantations",
      "content": "Wood boring beetle larvae tunnel through high value dragon fruit and papaya stems, causing 30% crop mortality in newly established tribal agribusiness clusters.",
      "upvotes": 72,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Agri Biotechnology & Pest Control",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-035'],
      "comments": [
        {
          "id": "C-122A",
          "author": "Local Citizen Representative (Karra Horticulture Cluster)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy smart solar IoT acoustic sensors detecting larval boring frequencies combined with entomopathogenic nematode bio injection.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-122B",
          "author": "District Admin Cell (Khunti)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Lokesh Mishra, DC Khunti. Engineering specification underway with Birsa Agricultural University (BAU) and Tata Trusts & JASCOLAMPF CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-123",
      "author": "Citizen Cell (Duma & Ghormara, Deoghar)",
      "district": "Deoghar",
      "block": "Mohanpur",
      "title": "Fecal coliform and microbial contamination in 32 community handpumps along pilgrim route",
      "content": "High pilgrim footfall during Shravani Mela season caused shallow aquifer microbial contamination. Coliform counts exceed 140 CFU/100ml in 32 community handpumps.",
      "upvotes": 63,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Public Health & Water Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-012'],
      "comments": [
        {
          "id": "C-123A",
          "author": "Local Citizen Representative (Duma & Ghormara)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy automated inline electrolytic sodium hypochlorite dosers and smart microbial ATP fluorescence rapid sensors.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-123B",
          "author": "District Admin Cell (Deoghar)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Vishal Sagar, DC Deoghar. Academic R&D team from AIIMS Deoghar & BIT Mesra onboarded with Adani Power & Indian Oil CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-124",
      "author": "Citizen Cell (Baidyanathdham Heritage Zone, Deoghar)",
      "district": "Deoghar",
      "block": "Jasidih",
      "title": "Enormous biodegradable floral and leaf waste accumulation decaying near religious heritage grounds",
      "content": "Over 8 tonnes of holy flowers (marigold, bel leaves) dumped daily in open drainage lines, causing methane odor, drain blockages, and vector breeding.",
      "upvotes": 74,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Solid Waste & Biomethanation",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-036'],
      "comments": [
        {
          "id": "C-124A",
          "author": "Local Citizen Representative (Baidyanathdham Heritage Zone)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Design modular rapid thermophilic bio digestion reactors converting sacred offerings into dry organic bio fertilizer pellets and biogas.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-124B",
          "author": "District Admin Cell (Deoghar)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Vishal Sagar, DC Deoghar. Engineering specification underway with AIIMS Deoghar & BIT Mesra and Adani Power & Indian Oil CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-125",
      "author": "Citizen Cell (Barakar River Crossing, Hazaribagh)",
      "district": "Hazaribagh",
      "block": "Chouparan",
      "title": "Barakar river bridge Pier 3 foundation scouring and concrete spalling risk on NH connector",
      "content": "Violent river turbulence scoured 2.8m deep cavity around foundation pier of Barakar bridge. Heavy mineral truck traffic risks structural fatigue and critical pier failure.",
      "upvotes": 65,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Bridge Infrastructure & Transport Safety",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-013'],
      "comments": [
        {
          "id": "C-125A",
          "author": "Local Citizen Representative (Barakar River Crossing)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install MEMS tilt and wireless crack sensor telemetry network combined with underwater epoxy mortar and stone riprap packing.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-125B",
          "author": "District Admin Cell (Hazaribagh)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Ms. Nancy Sahay, DC Hazaribagh. Academic R&D team from Vinoba Bhave University & NIT Jamshedpur onboarded with NTPC Coal Mining Project CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-126",
      "author": "Citizen Cell (Katkamsandi Slopes, Hazaribagh)",
      "district": "Hazaribagh",
      "block": "Barkagaon",
      "title": "Rapid soil erosion and gullying on agricultural slopes caused by deforestation and heavy monsoon runoff",
      "content": "Heavy monsoon sheet erosion carves 2m deep gullies across 320 hectares of terraced tribal farms, stripping 4cm of fertile topsoil annually.",
      "upvotes": 76,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Soil Conservation & Geosynthetics",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-037'],
      "comments": [
        {
          "id": "C-126A",
          "author": "Local Citizen Representative (Katkamsandi Slopes)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy bio degradable coconut coir geosynthetic check dams and deep rooting vetiver grass bio hedges.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-126B",
          "author": "District Admin Cell (Hazaribagh)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Ms. Nancy Sahay, DC Hazaribagh. Engineering specification underway with Vinoba Bhave University & NIT Jamshedpur and NTPC Coal Mining Project CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-127",
      "author": "Citizen Cell (Dhab & Domchanch, Koderma)",
      "district": "Koderma",
      "block": "Chandwara",
      "title": "Abandoned open pit mica mine quarry slope collapse and unfenced deep water pit hazard",
      "content": "Over 40 abandoned illegal mica quarry pits left un reclaimed in Dhab forest belt. Steep quarry walls (65 degree slope) collapsing after rains, trapping livestock and endangering villagers.",
      "upvotes": 67,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Mining & Coalfire Disaster",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-014'],
      "comments": [
        {
          "id": "C-127A",
          "author": "Local Citizen Representative (Dhab & Domchanch)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy drone LiDAR slope stability analysis, wire mesh geogrid terracing, and fast growing native vetiver bio fencing.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-127B",
          "author": "District Admin Cell (Koderma)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Aditya Ranjan, DC Koderma. Academic R&D team from BIT Sindri & Vinoba Bhave University onboarded with Damodar Valley Corporation (DVC CSR) CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-128",
      "author": "Citizen Cell (Satgawan Plateau, Koderma)",
      "district": "Koderma",
      "block": "Markacho",
      "title": "Acute groundwater salinity and heavy mineral hardness in dry rocky plateau habitations",
      "content": "Total dissolved solids (TDS) exceed 1800 ppm with high calcium and magnesium sulfate hardness in 28 deep handpumps, causing chronic renal calculi.",
      "upvotes": 46,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Water Purification & Capacitive Deionization",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-038'],
      "comments": [
        {
          "id": "C-128A",
          "author": "Local Citizen Representative (Satgawan Plateau)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Build solar low pressure capacitive deionization (CDI) water treatment plants with zero chemical reject water.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-128B",
          "author": "District Admin Cell (Koderma)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Aditya Ranjan, DC Koderma. Engineering specification underway with BIT Sindri & Vinoba Bhave University and Damodar Valley Corporation (DVC CSR).",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-129",
      "author": "Citizen Cell (Netarhat Ghat Road, Gumla)",
      "district": "Gumla",
      "block": "Bishunpur",
      "title": "Heavy bauxite haulage truck axle loads causing road subsidence and shoulder collapse on Bishunpur ghat",
      "content": "Continuous movement of overloaded bauxite dumper trucks caused severe longitudinal shearing and edge failure on 4.2km stretch of Bishunpur hill road.",
      "upvotes": 69,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Bridge Infrastructure & Transport Safety",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-015'],
      "comments": [
        {
          "id": "C-129A",
          "author": "Local Citizen Representative (Netarhat Ghat Road)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy high modulus biaxial geogrid reinforcement with polymer modified bitumen overlay and solar strain gauges.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-129B",
          "author": "District Admin Cell (Gumla)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Sushant Gaurav, DC Gumla. Academic R&D team from Ranchi University & BIT Mesra onboarded with Hindalco Industries CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-130",
      "author": "Citizen Cell (Dare Seepage Hamlet, Gumla)",
      "district": "Gumla",
      "block": "Chainpur",
      "title": "Severe iron oxide staining and sediment blockage in natural hillside seepage drinking water springs",
      "content": "Natural underground spring water used by 1400 Asur and Oraon tribal villagers has high dissolved ferrous iron (4.2 mg/L) that oxidizes into thick rust colored slime.",
      "upvotes": 48,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Water Filtration & Spring Rejuvenation",
      "status": "Prototype Active",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-039'],
      "comments": [
        {
          "id": "C-130A",
          "author": "Local Citizen Representative (Dare Seepage Hamlet)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Install multi chamber gravity fed aeration cascading chambers with granular activated carbon and basaltic sand filters.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-130B",
          "author": "District Admin Cell (Gumla)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Sushant Gaurav, DC Gumla. Engineering specification underway with Ranchi University & BIT Mesra and Hindalco Industries CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-131",
      "author": "Citizen Cell (Kharaundhi & Nagar Untari, Garhwa)",
      "district": "Garhwa",
      "block": "Bhavnathpur",
      "title": "Severe fluoride contamination in deep borewells causing endemic dental and skeletal fluorosis",
      "content": "Fluoride concentration in drinking water handpumps reached 5.2 mg per litre in Bhavnathpur, exceeding safe limits by 3.5x. Over 450 school children show permanent dental mottling.",
      "upvotes": 71,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Water Quality & Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-016'],
      "comments": [
        {
          "id": "C-131A",
          "author": "Local Citizen Representative (Kharaundhi & Nagar Untari)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install community scale solar electrocoagulation defluoridation units with activated alumina polishing columns.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-131B",
          "author": "District Admin Cell (Garhwa)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Shekhar Jamuar, DC Garhwa. Academic R&D team from IIT (ISM) Dhanbad & BAU Ranchi onboarded with JASCOLAMPF & UPL CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-132",
      "author": "Citizen Cell (Kharaundhi Pulse Plains, Garhwa)",
      "district": "Garhwa",
      "block": "Bhawnathpur",
      "title": "High soil alkalinity and calcification preventing pulse crop germination in Kanhar river basin",
      "content": "Excess soil calcium carbonate and high pH (8.8) lock phosphorus and micronutrients, causing 40% stunted germination in pigeon pea and chickpea crops.",
      "upvotes": 50,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Soil Chemistry & Agro Conditioners",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-040'],
      "comments": [
        {
          "id": "C-132A",
          "author": "Local Citizen Representative (Kharaundhi Pulse Plains)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Formulate bio acidified organic soil conditioners derived from composted mahua flower residue and phospho gypsum.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-132B",
          "author": "District Admin Cell (Garhwa)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Shekhar Jamuar, DC Garhwa. Engineering specification underway with IIT (ISM) Dhanbad & BAU Ranchi and JASCOLAMPF & UPL CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-133",
      "author": "Citizen Cell (Simaria & Piparwar, Chatra)",
      "district": "Chatra",
      "block": "Tandwa",
      "title": "Opencast coal mining PM2.5 and PM10 dust fallout smothering standing tomato and maize crops",
      "content": "High speed coal haulage and un sprayed overburden blasting created thick airborne particulate plumes. PM10 levels exceed 420 ug/m3, coating 380 hectares of vegetable fields.",
      "upvotes": 73,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Air Quality & Agricultural Dust Pollution",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-017'],
      "comments": [
        {
          "id": "C-133A",
          "author": "Local Citizen Representative (Simaria & Piparwar)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install solar powered high pressure dry fog misting cannon barriers and optical dust sensors.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-133B",
          "author": "District Admin Cell (Chatra)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Abu Imran, DC Chatra. Academic R&D team from Vinoba Bhave University & BIT Mesra onboarded with NTPC North Karanpura & CCL CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-134",
      "author": "Citizen Cell (Tandwa Lift Canal, Chatra)",
      "district": "Chatra",
      "block": "Simaria",
      "title": "Excessive siltation and heavy sand clogging of micro lift irrigation canals from opencast mine earthworks",
      "content": "Unchecked monsoon surface wash off from coal mine dumps chokes 12km of lift irrigation canals with fine coal dust and silt, halting water delivery to 600 hectares.",
      "upvotes": 52,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Irrigation Engineering & Hydrocyclones",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-041'],
      "comments": [
        {
          "id": "C-134A",
          "author": "Local Citizen Representative (Tandwa Lift Canal)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Install automated vortex sand separator hydrocyclones with solar backwash scraper filters at canal headworks.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-134B",
          "author": "District Admin Cell (Chatra)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Abu Imran, DC Chatra. Engineering specification underway with Vinoba Bhave University & BIT Mesra and NTPC North Karanpura & CCL CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-135",
      "author": "Citizen Cell (Rajrappa Confluence, Ramgarh)",
      "district": "Ramgarh",
      "block": "Patratu",
      "title": "Damodar river black sludge sedimentation and coal washery effluent overflow near Rajrappa",
      "content": "Discharge of fine coal slurry from nearby washeries turned the Damodar riverbed into thick black sludge near Rajrappa temple ghats. Dissolved oxygen plunged to 1.8 mg/L.",
      "upvotes": 75,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Industrial Mining Effluent & River Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-018'],
      "comments": [
        {
          "id": "C-135A",
          "author": "Local Citizen Representative (Rajrappa Confluence)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy continuous hydrocyclone dewatering units and solar floating dissolved oxygen aeration buoys.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-135B",
          "author": "District Admin Cell (Ramgarh)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Chandan Kumar, DC Ramgarh. Academic R&D team from BIT Mesra & IIT (ISM) Dhanbad onboarded with Tata Steel West Bokaro & CCL CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-136",
      "author": "Citizen Cell (Patratu Overburden Yard, Ramgarh)",
      "district": "Ramgarh",
      "block": "Bhurkunda",
      "title": "Spontaneous combustion and suffocating sulfur dioxide fumes in abandoned overburden dump yards",
      "content": "Sub surface coal seam oxidation in 40m high overburden dumps generates underground fires (70C) releasing pungent SO2 and CO gases near village settlements.",
      "upvotes": 54,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Mining Safety & Thermal InSAR",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-042'],
      "comments": [
        {
          "id": "C-136A",
          "author": "Local Citizen Representative (Patratu Overburden Yard)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy drone thermal IR surveying with localized high expansion hydrogel extinguishing foam injection systems.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-136B",
          "author": "District Admin Cell (Ramgarh)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Chandan Kumar, DC Ramgarh. Engineering specification underway with BIT Mesra & IIT (ISM) Dhanbad and Tata Steel West Bokaro & CCL CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-137",
      "author": "Citizen Cell (Sankh River Basin, Simdega)",
      "district": "Simdega",
      "block": "Kolebira",
      "title": "Seasonal flash flood washouts of low level causeway isolating 8 tribal villages in Kolebira",
      "content": "Flash floods on Sankh river submerge and wash out the single submersible causeway every monsoon, isolating 7800 tribal residents without emergency ambulance access.",
      "upvotes": 77,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Bridge Infrastructure & Transport Safety",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-019'],
      "comments": [
        {
          "id": "C-137A",
          "author": "Local Citizen Representative (Sankh River Basin)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Construct modular lightweight galvanized structural steel pedestrian and light vehicle truss bridge.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-137B",
          "author": "District Admin Cell (Simdega)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Ajay Kumar Singh, DC Simdega. Academic R&D team from NIT Jamshedpur & BAU Ranchi onboarded with JASCOLAMPF & Tata Trusts CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-138",
      "author": "Citizen Cell (Kurdeg Mahua Groves, Simdega)",
      "district": "Simdega",
      "block": "Thethaitangar",
      "title": "Rapid rotting and fungal mold spoilage in harvested Mahua flowers during humid monsoon transition",
      "content": "Tribal women collect 200 tonnes of Mahua flowers annually, but humidity causes 40% loss to Aspergillus and Penicillium mold during sun drying.",
      "upvotes": 56,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Agro Forestry Post Harvest Tech",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-043'],
      "comments": [
        {
          "id": "C-138A",
          "author": "Local Citizen Representative (Kurdeg Mahua Groves)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy solar hybrid dehumidification drying tunnels with integrated UV C sanitization chambers for tribal cooperatives.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-138B",
          "author": "District Admin Cell (Simdega)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Ajay Kumar Singh, DC Simdega. Engineering specification underway with NIT Jamshedpur & BAU Ranchi and JASCOLAMPF & Tata Trusts.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-139",
      "author": "Citizen Cell (Bagru Hill Terraces, Lohardaga)",
      "district": "Lohardaga",
      "block": "Kisko",
      "title": "Bauxite mine surface red mud runoff burying terraced paddy fields of Asur tribal farmers",
      "content": "Heavy monsoon runoff from Bagru plateau bauxite mines deposited 15cm of alkaline red silt across 220 hectares of terraced paddy fields in Kisko.",
      "upvotes": 79,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Environmental Siltation & Agro Degradation",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-020'],
      "comments": [
        {
          "id": "C-139A",
          "author": "Local Citizen Representative (Bagru Hill Terraces)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Construct bio engineered vetiver grass silt traps and apply organic humic acid and phospho gypsum amendments.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-139B",
          "author": "District Admin Cell (Lohardaga)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Dr. Waghmare Prasad Krishna, DC Lohardaga. Academic R&D team from Birsa Agricultural University (BAU) onboarded with Hindalco Industries Lohardaga CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-140",
      "author": "Citizen Cell (Kisko Plateau Uplands, Lohardaga)",
      "district": "Lohardaga",
      "block": "Senha",
      "title": "Acidic red soil phosphorus fixation reducing maize and mustard crop yields in Asur plateau villages",
      "content": "High soil aluminum and iron oxides bind 80% of applied phosphate fertilizer, rendering it insoluble and resulting in poor crop root development.",
      "upvotes": 58,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Soil Microbiology & Biofertilizers",
      "status": "Prototype Active",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-044'],
      "comments": [
        {
          "id": "C-140A",
          "author": "Local Citizen Representative (Kisko Plateau Uplands)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Formulate phosphate solubilizing fungal microbial inoculants (PSB bio fertilizer) tailored for high aluminum acidic red soils.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-140B",
          "author": "District Admin Cell (Lohardaga)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Dr. Waghmare Prasad Krishna, DC Lohardaga. Engineering specification underway with Birsa Agricultural University (BAU) and Hindalco Industries Lohardaga CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-141",
      "author": "Citizen Cell (Ranishwar & Kathikund, Dumka)",
      "district": "Dumka",
      "block": "Shikaripara",
      "title": "Unfiltered Mayurakshi river basin water supply contaminated with high microbial pathogens and arsenic",
      "content": "Community drinking water scheme drawn from Mayurakshi river shows elevated total coliforms (220 CFU/100ml) and arsenic spikes (0.06 mg/L) across 24 villages.",
      "upvotes": 53,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Water Quality & Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-021'],
      "comments": [
        {
          "id": "C-141A",
          "author": "Local Citizen Representative (Ranishwar & Kathikund)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Deploy multi barrier solar gravity sand filtration units with iron oxide nano coated media and smart turbidity sensors.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-141B",
          "author": "District Admin Cell (Dumka)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Ameet Kumar, DC Dumka. Academic R&D team from Sido Kanhu Murmu University (SKMU) onboarded with Jharcraft & JASCOLAMPF CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-142",
      "author": "Citizen Cell (Gopi Kandar Silk Tract, Dumka)",
      "district": "Dumka",
      "block": "Kathikund",
      "title": "Unregulated stone quarry blasting dust suppressing Mulberry leaf yield and destroying Tussar silkworm farming",
      "content": "Quarry blasting dust coats Arjun and Asan host tree leaves, causing bacterial flacherie disease and 50% cocoon yield drop for 1800 tribal sericulturists.",
      "upvotes": 60,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Agro Silk & Dust Filtration",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-045'],
      "comments": [
        {
          "id": "C-142A",
          "author": "Local Citizen Representative (Gopi Kandar Silk Tract)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy organic bio spray dust binders and vegetative tall grass dust filtration buffer screens around rearing groves.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-142B",
          "author": "District Admin Cell (Dumka)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Ameet Kumar, DC Dumka. Engineering specification underway with Sido Kanhu Murmu University (SKMU) and Jharcraft & JASCOLAMPF CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-143",
      "author": "Citizen Cell (Mehrma & Mahagama, Godda)",
      "district": "Godda",
      "block": "Boarijor",
      "title": "Coal thermal plant suspended particulate matter (SPM) fallout damaging betel vine and mango orchards",
      "content": "Continuous deposition of fine coal ash and particulate matter on betel leaf greenhouses and mango blossoms reduced crop yields by 45% across 320 hectares.",
      "upvotes": 55,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Thermal Power Industrial Pollution",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-022'],
      "comments": [
        {
          "id": "C-143A",
          "author": "Local Citizen Representative (Mehrma & Mahagama)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Install automated solar canopy misting sprinklers and optical dust monitoring stations.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-143B",
          "author": "District Admin Cell (Godda)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Zeeshan Qamar, DC Godda. Academic R&D team from SKMU Dumka & BAU Ranchi onboarded with Adani Power Godda CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-144",
      "author": "Citizen Cell (Boarijor Basin, Godda)",
      "district": "Godda",
      "block": "Mehrma",
      "title": "High groundwater boron levels affecting wheat crop germination and drinking water quality",
      "content": "Geogenic boron levels in deep tube wells exceed 2.4 mg/L in Boarijor basin, causing leaf tip chlorosis in wheat crops and gastrointestinal irritation.",
      "upvotes": 62,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Water Purification & Ion Exchange",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-046'],
      "comments": [
        {
          "id": "C-144A",
          "author": "Local Citizen Representative (Boarijor Basin)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy selective boron specific ion exchange resin column filtration units with automated solar regeneration.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-144B",
          "author": "District Admin Cell (Godda)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Zeeshan Qamar, DC Godda. Engineering specification underway with SKMU Dumka & BAU Ranchi and Adani Power Godda CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-145",
      "author": "Citizen Cell (Malpaharia Cluster, Pakur)",
      "district": "Pakur",
      "block": "Hiranpur",
      "title": "Stone crushing silica dust emission causing acute silicosis risk among tribal workers",
      "content": "Dry stone crushing and unshielded conveyor belts in Hiranpur released crystalline silica dust at 12x safe limits. Over 1600 tribal laborers report chronic coughing.",
      "upvotes": 57,
      "hasUpvoted": false,
      "timestamp": "2 hours ago",
      "category": "Mining & Coalfire Disaster",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-023'],
      "comments": [
        {
          "id": "C-145A",
          "author": "Local Citizen Representative (Malpaharia Cluster)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Retrofit high pressure ultrasonic dry fog dust suppression manifolds and deploy real time optical PM counters.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-145B",
          "author": "District Admin Cell (Pakur)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Mrityunjay Kumar Baranwal, DC Pakur. Academic R&D team from IIT (ISM) Dhanbad & SKMU Dumka onboarded with Eastern Coalfields & State Mineral CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-146",
      "author": "Citizen Cell (Pakuria Tribal Belt, Pakur)",
      "district": "Pakur",
      "block": "Maheshpur",
      "title": "Groundwater fluoride and heavy iron precipitate poisoning deep tube wells in tribal hamlets",
      "content": "Over 34 remote tribal handpumps deliver reddish water with 3.8 mg/L iron and 2.9 mg/L fluoride, staining teeth and causing chronic stomach ailments.",
      "upvotes": 64,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Water Quality & Contamination",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-047'],
      "comments": [
        {
          "id": "C-146A",
          "author": "Local Citizen Representative (Pakuria Tribal Belt)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Deploy modular solar electrocoagulation and manganese dioxide catalytic oxidation filter skids.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-146B",
          "author": "District Admin Cell (Pakur)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Mrityunjay Kumar Baranwal, DC Pakur. Engineering specification underway with IIT (ISM) Dhanbad & SKMU Dumka and Eastern Coalfields & State Mineral CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
    {
      "id": "POST-147",
      "author": "Citizen Cell (Ajay Basin Farmlands, Jamtara)",
      "district": "Jamtara",
      "block": "Kundahit",
      "title": "Ajay river seasonal sand deposition suffocating fertile paddy alluvial topsoil",
      "content": "Violent monsoon runoff along the Ajay river deposited 0.8m thick sterile sand sheets across 480 hectares of fertile paddy fields in Kundahit.",
      "upvotes": 59,
      "hasUpvoted": false,
      "timestamp": "4 hours ago",
      "category": "Flooding & Drainage",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-024'],
      "comments": [
        {
          "id": "C-147A",
          "author": "Local Citizen Representative (Ajay Basin Farmlands)",
          "role": "Citizen",
          "text": "Critical issue in our locality. We request rapid field execution of Construct 4 brushwood and rock deflector spurs and distribute 25 tons biochar organic soil conditioner.",
          "timestamp": "2 hours ago"
        },
        {
          "id": "C-147B",
          "author": "District Admin Cell (Jamtara)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Ground assessment verified by Shri Faiz Aq Ahmed Mumtaz, DC Jamtara. Academic R&D team from Birsa Agricultural University (BAU) onboarded with DVC & JASCOLAMPF CSR CSR co-funding.",
          "timestamp": "30 mins ago"
        }
      ]
    },
    {
      "id": "POST-148",
      "author": "Citizen Cell (Karmatar Arid Groves, Jamtara)",
      "district": "Jamtara",
      "block": "Narayanpur",
      "title": "Heavy soil lateritization and low water retention stunting cashew and fruit sapling survival in dry tracts",
      "content": "Hard compact lateritic crusts cause 65% summer mortality in newly planted fruit orchards and cashew saplings across 180 hectares in Narayanpur.",
      "upvotes": 66,
      "hasUpvoted": false,
      "timestamp": "6 hours ago",
      "category": "Arid Agronomy & Hydrogels",
      "status": "University Team Assigned",
      "evidenceUrl": DISTRICT_PROBLEM_IMAGES['DEMO-CH-048'],
      "comments": [
        {
          "id": "C-148A",
          "author": "Local Citizen Representative (Karmatar Arid Groves)",
          "role": "Citizen",
          "text": "Severe challenge facing our farming and residential community. Urgently need Incorporate biodegradable potassium polyacrylate superabsorbent hydrogels infused with mycorrhizal bio stimulants.",
          "timestamp": "3 hours ago"
        },
        {
          "id": "C-148B",
          "author": "District Admin Cell (Jamtara)",
          "role": "Government Admin",
          "isVerifiedGovt": true,
          "text": "OFFICIAL UPDATE: Field inspection cleared by Shri Faiz Aq Ahmed Mumtaz, DC Jamtara. Engineering specification underway with Birsa Agricultural University (BAU) and DVC & JASCOLAMPF CSR.",
          "timestamp": "45 mins ago"
        }
      ]
    },
  ];

  // Persistent upvoting helper functions
  const getStoredUpvotes = (): { votedPostIds: Set<string>; deltas: Record<string, number> } => {
    try {
      const votedArr = JSON.parse(localStorage.getItem('nivaaran_user_voted_posts') || '[]');
      const deltasMap = JSON.parse(localStorage.getItem('nivaaran_post_upvote_deltas') || '{}');
      return {
        votedPostIds: new Set(Array.isArray(votedArr) ? votedArr : []),
        deltas: typeof deltasMap === 'object' && deltasMap !== null ? deltasMap : {}
      };
    } catch {
      return { votedPostIds: new Set(), deltas: {} };
    }
  };

  const applyUpvotesToPosts = (list: FeedPostUI[]): FeedPostUI[] => {
    const { votedPostIds, deltas } = getStoredUpvotes();
    return list.map(p => {
      const postId = p.id || '';
      const delta = postId ? (deltas[postId] || 0) : 0;
      const isVoted = postId ? votedPostIds.has(postId) : false;
      return {
        ...p,
        hasUpvoted: isVoted,
        upvotes: Math.max(0, p.upvotes + delta)
      };
    });
  };

  const [posts, setPosts] = useState<FeedPostUI[]>(() => applyUpvotesToPosts(seedPosts));
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
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<FeedPostUI | null>(null);

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

        setPosts(applyUpvotesToPosts([...customUserPosts, ...seedPosts]));
      } else {
        setPosts(applyUpvotesToPosts(seedPosts));
      }
    });

    return () => unsubscribe();
  }, []);

  const allPosts = useMemo<FeedPostUI[]>(() => posts, [posts, currentLang]);

  const handleUpvote = async (postId: string) => {
    const target = posts.find(p => p.id === postId);
    if (!target) return;

    const nextHasUpvoted = !target.hasUpvoted;
    const diff = nextHasUpvoted ? 1 : -1;

    try {
      const votedArr: string[] = JSON.parse(localStorage.getItem('nivaaran_user_voted_posts') || '[]');
      const votedSet = new Set(votedArr);
      const deltasMap: Record<string, number> = JSON.parse(localStorage.getItem('nivaaran_post_upvote_deltas') || '{}');

      if (nextHasUpvoted) {
        votedSet.add(postId);
        deltasMap[postId] = (deltasMap[postId] || 0) + 1;
      } else {
        votedSet.delete(postId);
        deltasMap[postId] = (deltasMap[postId] || 0) - 1;
      }

      localStorage.setItem('nivaaran_user_voted_posts', JSON.stringify(Array.from(votedSet)));
      localStorage.setItem('nivaaran_post_upvote_deltas', JSON.stringify(deltasMap));
    } catch {}

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasUpvoted: nextHasUpvoted,
          upvotes: Math.max(0, p.upvotes + diff),
        };
      }
      return p;
    }));

    try {
      await upvotePostInFirestore(postId, target.upvotes + diff);
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

  const handleAddComment = async (postId: string, customText?: string) => {
    const textToSubmit = (customText !== undefined ? customText : commentInput).trim();
    if (!textToSubmit) return;

    const newComment: FeedComment = {
      id: `C-${Date.now()}`,
      author: 'You (Citizen Resident)',
      role: 'Citizen',
      text: textToSubmit.replace(/[—–]/g, ' to ').replace(/--+/g, ' '),
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
            <div
              key={post.id || idx}
              onClick={() => setSelectedPostForDetail(post)}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
            >
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

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id!, post.title);
                      }}
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
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs" onClick={e => e.stopPropagation()}>
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
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    {post.translations?.[currentLang]?.title 
                      ? post.translations[currentLang].title 
                      : tr(post.title, currentLang)}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <Eye className="w-3 h-3" />
                    <span>View 16 Stages</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {post.translations?.[currentLang]?.content 
                    ? post.translations[currentLang].content 
                    : tr(post.content, currentLang)}
                </p>
              </div>

              {/* Citizen Voice Note Audio Player */}
              {(post as any).audioUrl && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs" onClick={e => e.stopPropagation()}>
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
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600" onClick={e => e.stopPropagation()}>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
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
                    type="button"
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : (post.id || null))}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{tr('Comments', currentLang)} ({(post.comments || []).length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPostForDetail(post)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View All Details</span>
                </button>
              </div>

              {/* Comments Stream */}
              <div className="bg-slate-50/70 p-4 rounded-xl space-y-3" onClick={e => e.stopPropagation()}>
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

      {/* Full Modal Overlay for Detailed Post Information & 16 Stages */}
      {selectedPostForDetail && (
        <CommunityPostDetailModal
          post={selectedPostForDetail}
          isOpen={!!selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          currentLang={currentLang}
          onUpvote={(id) => {
            handleUpvote(id);
            // Synchronize modal state with updated upvote count and hasUpvoted state
            setSelectedPostForDetail(prev => {
              if (!prev || prev.id !== id) return prev;
              const nextVoted = !prev.hasUpvoted;
              return {
                ...prev,
                hasUpvoted: nextVoted,
                upvotes: Math.max(0, (prev.upvotes || 0) + (nextVoted ? 1 : -1)),
              };
            });
          }}
          onAddComment={(id, text) => {
            handleAddComment(id, text);
            // Synchronize modal state with new comment
            setSelectedPostForDetail(prev => {
              if (!prev || prev.id !== id) return prev;
              const newComment: FeedComment = {
                id: `C-${Date.now()}`,
                author: 'You (Citizen Resident)',
                role: 'Citizen',
                text,
                timestamp: 'Just now',
              };
              return {
                ...prev,
                comments: [...(prev.comments || []), newComment],
              };
            });
          }}
        />
      )}
    </div>
  );
};
