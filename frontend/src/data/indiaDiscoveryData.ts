export interface LandmarkPOI {
  id: string;
  name: string;
  city: string;
  state: string;
  category: 'Heritage & History' | 'Spiritual & Sacred' | 'Nature & Wildlife' | 'Hill Stations & Treks' | 'Art & Architecture' | 'Food & Culinary';
  categoryColor: string;
  coordinates: { x: number; y: number };
  image: string;
  entryFee: string;
  bestTime: string;
  duration: string;
  highlight: string;
  description: string;
  verified: boolean;
  rating: number;
  tags: string[];
}

export interface StateRegionData {
  id: string;
  code: string;
  name: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central' | 'Northeast';
  capital: string;
  svgPath: string;
  center: { x: number; y: number };
  popularFor: string[];
  bannerImage: string;
  description: string;
  topPlacesCount: number;
}

export const ZONES = ['All India', 'North', 'South', 'West', 'East', 'Central', 'Northeast'] as const;
export type ZoneType = typeof ZONES[number];

export const CATEGORIES = [
  { value: 'all', label: 'All Categories', color: '#8B5CF6' },
  { value: 'Heritage & History', label: 'Heritage & History', color: '#E76F51' },
  { value: 'Spiritual & Sacred', label: 'Spiritual & Sacred', color: '#F4A261' },
  { value: 'Nature & Wildlife', label: 'Nature & Wildlife', color: '#2A9D8F' },
  { value: 'Hill Stations & Treks', label: 'Hill Stations', color: '#264653' },
  { value: 'Art & Architecture', label: 'Art & Architecture', color: '#E9C46A' },
  { value: 'Food & Culinary', label: 'Food & Culinary', color: '#D4A373' },
];

export const INDIA_STATES_DATA: StateRegionData[] = [
  {
    id: 'raj',
    code: 'RJ',
    name: 'Rajasthan',
    zone: 'North',
    capital: 'Jaipur',
    center: { x: 285, y: 345 },
    svgPath: 'M230,285 L315,265 L360,295 L375,360 L320,430 L250,425 L210,380 L200,320 Z',
    popularFor: ['Palaces & Forts', 'Thar Desert', 'Royal Heritage'],
    bannerImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    description: 'Land of maharajas, majestic hill forts, vibrant bazaars, and golden desert dunes.',
    topPlacesCount: 42,
  },
  {
    id: 'pun',
    code: 'PB',
    name: 'Punjab',
    zone: 'North',
    capital: 'Chandigarh',
    center: { x: 280, y: 225 },
    svgPath: 'M255,200 L305,190 L320,240 L280,265 L245,245 Z',
    popularFor: ['Golden Temple', 'Food Capital', 'Sufi Heritage'],
    bannerImage: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=800&q=80',
    description: 'Heart of Sikh spiritual culture, historic battlegrounds, and rich authentic Punjabi cuisine.',
    topPlacesCount: 18,
  },
  {
    id: 'hp',
    code: 'HP',
    name: 'Himachal Pradesh',
    zone: 'North',
    capital: 'Shimla',
    center: { x: 335, y: 180 },
    svgPath: 'M305,150 L365,145 L385,200 L345,225 L305,195 Z',
    popularFor: ['Snow Peaks', 'Spiti Valley', 'Monasteries'],
    bannerImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    description: 'Himalayan wonderland of pine-scented valleys, Buddhist gompas, and alpine adventures.',
    topPlacesCount: 31,
  },
  {
    id: 'up',
    code: 'UP',
    name: 'Uttar Pradesh',
    zone: 'North',
    capital: 'Lucknow',
    center: { x: 440, y: 340 },
    svgPath: 'M365,280 L495,280 L545,350 L490,410 L415,385 L365,340 Z',
    popularFor: ['Taj Mahal', 'Varanasi Ghats', 'Awadhi Cuisine'],
    bannerImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'The cultural cradle of ancient civilizations along the sacred Ganges and Yamuna rivers.',
    topPlacesCount: 49,
  },
  {
    id: 'mah',
    code: 'MH',
    name: 'Maharashtra',
    zone: 'West',
    capital: 'Mumbai',
    center: { x: 320, y: 550 },
    svgPath: 'M250,470 L380,460 L430,540 L370,640 L280,620 L240,540 Z',
    popularFor: ['Ajanta & Ellora', 'Western Ghats', 'Mumbai Skyline'],
    bannerImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    description: 'Dynamic economic heartland with UNESCO rock-cut caves, Maratha fortresses, and coastal gems.',
    topPlacesCount: 52,
  },
  {
    id: 'kar',
    code: 'KA',
    name: 'Karnataka',
    zone: 'South',
    capital: 'Bengaluru',
    center: { x: 330, y: 700 },
    svgPath: 'M285,630 L370,620 L380,740 L340,800 L290,750 Z',
    popularFor: ['Hampi Ruins', 'Coorg Coffee Hills', 'Mysore Palace'],
    bannerImage: 'https://images.unsplash.com/photo-1600100397608-f010f4438317?auto=format&fit=crop&w=800&q=80',
    description: 'From the stone chariot of Vijayanagara empire to misty Western Ghats coffee estates.',
    topPlacesCount: 44,
  },
  {
    id: 'ker',
    code: 'KL',
    name: 'Kerala',
    zone: 'South',
    capital: 'Thiruvananthapuram',
    center: { x: 325, y: 840 },
    svgPath: 'M305,790 L345,780 L350,880 L315,900 Z',
    popularFor: ['Backwaters', 'Munnar Tea Hills', 'Ayurveda'],
    bannerImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    description: "God's Own Country, famed for serene houseboat waterways, spice hills, and tropical palms.",
    topPlacesCount: 38,
  },
  {
    id: 'tn',
    code: 'TN',
    name: 'Tamil Nadu',
    zone: 'South',
    capital: 'Chennai',
    center: { x: 385, y: 810 },
    svgPath: 'M355,750 L425,750 L420,870 L365,880 L345,800 Z',
    popularFor: ['Dravidian Temples', 'Nilgiri Railway', 'Chettinad'],
    bannerImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: 'Millennia-old towering gopurams, Carnatic melodies, and UNESCO monumental temples.',
    topPlacesCount: 47,
  }
];

export const POPULAR_LANDMARKS: LandmarkPOI[] = [
  {
    id: 'gt-amritsar',
    name: 'Golden Temple (Harmandir Sahib)',
    city: 'Amritsar',
    state: 'Punjab',
    category: 'Spiritual & Sacred',
    categoryColor: '#F4A261',
    coordinates: { x: 275, y: 220 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/1280px-Hamandir_Sahib_%28Golden_Temple%29.jpg',
    entryFee: 'FREE ENTRY',
    bestTime: 'Oct – Mar',
    duration: '2-3 Hours',
    highlight: 'Sacred Gilded Sanctum & 24/7 Langar',
    description: 'The preeminent spiritual sanctuary of Sikhism, surrounded by the holy Amrit Sarovar lake.',
    verified: true,
    rating: 4.9,
    tags: ['Spiritual', 'Architecture', 'Iconic'],
  },
  {
    id: 'hawa-mahal',
    name: 'Hawa Mahal (Palace of Winds)',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage & History',
    categoryColor: '#E76F51',
    coordinates: { x: 310, y: 340 },
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    entryFee: '₹50 (Indian) / ₹200 (Foreigner)',
    bestTime: 'Nov – Feb',
    duration: '1.5 Hours',
    highlight: '953 Intricately Carved Jharokhas',
    description: 'Iconic five-story pink sandstone palace engineered with 953 honeycomb windows.',
    verified: true,
    rating: 4.8,
    tags: ['Royal', 'UNESCO', 'Architecture'],
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Art & Architecture',
    categoryColor: '#9B5DE5',
    coordinates: { x: 390, y: 330 },
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    entryFee: '₹50 (Indian) / ₹1100 (Foreigner)',
    bestTime: 'Oct – Mar',
    duration: '3 Hours',
    highlight: 'UNESCO World Wonder & Mughal Marble Inlay',
    description: 'The world-famous ivory-white marble mausoleum on the south bank of the Yamuna River.',
    verified: true,
    rating: 4.9,
    tags: ['UNESCO Wonder', 'Mughal', 'Monument'],
  },
  {
    id: 'varanasi-ghats',
    name: 'Dashashwamedh Ghat & Ganga Aarti',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Spiritual & Sacred',
    categoryColor: '#F4A261',
    coordinates: { x: 495, y: 365 },
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    entryFee: 'FREE ENTRY',
    bestTime: 'Oct – Mar',
    duration: '2 Hours',
    highlight: 'Syncopated Brass Lamps & Sacred Chants',
    description: 'The vibrant epicenter of one of the world’s oldest continuously inhabited spiritual cities.',
    verified: true,
    rating: 4.9,
    tags: ['Ancient', 'Ganga Aarti', 'Spiritual'],
  },
  {
    id: 'gateway-india',
    name: 'Gateway of India & Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Heritage & History',
    categoryColor: '#E76F51',
    coordinates: { x: 265, y: 555 },
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    entryFee: 'FREE ENTRY',
    bestTime: 'Nov – Feb',
    duration: '1-2 Hours',
    highlight: 'Indo-Saracenic Seafront Arch & Harbor Views',
    description: 'Monumental 20th-century waterfront arch welcoming travelers to Mumbai.',
    verified: true,
    rating: 4.7,
    tags: ['Waterfront', 'Colonial', 'Bustling'],
  },
  {
    id: 'hampi-ruins',
    name: 'Hampi Vijayanagara Ruins',
    city: 'Hampi',
    state: 'Karnataka',
    category: 'Heritage & History',
    categoryColor: '#E76F51',
    coordinates: { x: 330, y: 685 },
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4438317?auto=format&fit=crop&w=800&q=80',
    entryFee: '₹40 (Indian) / ₹600 (Foreigner)',
    bestTime: 'Oct – Feb',
    duration: 'Full Day',
    highlight: 'Vittala Stone Chariot & Tungabhadra Boulders',
    description: 'UNESCO World Heritage site amidst a dramatic surreal boulder-strewn landscape.',
    verified: true,
    rating: 4.9,
    tags: ['UNESCO', 'Monolithic', 'Ruins'],
  },
  {
    id: 'munnar-tea',
    name: 'Munnar Cloud Tea Gardens',
    city: 'Munnar',
    state: 'Kerala',
    category: 'Nature & Wildlife',
    categoryColor: '#2A9D8F',
    coordinates: { x: 335, y: 835 },
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    entryFee: 'FREE ENTRY',
    bestTime: 'Sep – Apr',
    duration: '1-2 Days',
    highlight: 'Misty Rolling Plantations & Anamudi Peak',
    description: 'Emerald green tea-carpeted slopes situated 1,600 meters above sea level in the Western Ghats.',
    verified: true,
    rating: 4.8,
    tags: ['Scenic', 'Tea Hills', 'Nature'],
  },
  {
    id: 'meenakshi-temple',
    name: 'Madurai Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    category: 'Spiritual & Sacred',
    categoryColor: '#F4A261',
    coordinates: { x: 370, y: 845 },
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    entryFee: 'FREE ENTRY',
    bestTime: 'Oct – Mar',
    duration: '2-3 Hours',
    highlight: '14 Towering Gopurams with 33,000 Sculptures',
    description: 'Historic Hindu temple and masterpiece of Dravidian architecture.',
    verified: true,
    rating: 4.9,
    tags: ['Dravidian', 'Sculptures', 'Spiritual'],
  }
];
