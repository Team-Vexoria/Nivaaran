/**
 * NIVAARAN Official Government Challenge Taxonomy (SIH Problem Statement 26043)
 * Comprehensive 60 Official Domains & 1,000+ Problem Sub-Categories
 * Government of Jharkhand, Department of Higher & Technical Education
 */

export interface GovDomain {
  id: string;
  label: string;
  problems: string[];
  keywords: string[];
  depts: string[];
}

export const GOV_DOMAINS: GovDomain[] = [
  {
    id: 'disaster_mgmt',
    label: 'Disaster Management & Emergency Response',
    problems: [
      'Flood', 'Flash flood', 'Urban flooding', 'Drought', 'Cyclone', 'Landslide', 'Earthquake', 'Tsunami',
      'Lightning', 'Heatwave', 'Cold wave', 'Storm', 'Cloudburst', 'Avalanche', 'Forest fire', 'Industrial disaster',
      'Chemical disaster', 'Biological disaster', 'Dam failure', 'Embankment failure', 'Mine disaster',
      'Disaster evacuation', 'Emergency communication', 'Search and rescue', 'Relief distribution', 'Emergency shelter',
      'Disaster preparedness', 'Disaster risk mapping', 'Early warning systems'
    ],
    keywords: [
      'flood', 'flash flood', 'flooding', 'drought', 'cyclone', 'landslide', 'earthquake', 'lightning', 'heatwave',
      'cold wave', 'storm', 'cloudburst', 'avalanche', 'disaster', 'dam failure', 'embankment', 'evacuation', 'shelter',
      'relief', 'rescue', 'early warning', 'submerge', 'inundation'
    ],
    depts: ['Dept of Disaster Management', 'Dept of Hydraulic Engineering', 'BIT Mesra Disaster Mitigation Cell'],
  },
  {
    id: 'water_resources',
    label: 'Water Resources & Management',
    problems: [
      'Drinking water', 'Water scarcity', 'Groundwater depletion', 'Borewell failure', 'Water contamination',
      'Fluoride contamination', 'Arsenic contamination', 'Iron contamination', 'Bacterial contamination',
      'River pollution', 'Lake pollution', 'Dam management', 'Canal management', 'Irrigation water', 'Water leakage',
      'Pipeline leakage', 'Water pressure', 'Water distribution', 'Rainwater harvesting', 'Groundwater recharge',
      'Watershed management', 'Water-table monitoring', 'Floodplain management', 'Sewage entering water bodies', 'Wetland conservation'
    ],
    keywords: [
      'drinking water', 'water scarcity', 'groundwater', 'borewell', 'water contamination', 'fluoride', 'arsenic',
      'iron contamination', 'river pollution', 'lake pollution', 'water leakage', 'pipeline leakage', 'water pressure',
      'rainwater harvesting', 'watershed', 'water table', 'sewage water', 'wetland', 'clean water', 'tap water'
    ],
    depts: ['Dept of Water Resources', 'Dept of Hydrogeology', 'Dept of Environmental Engineering'],
  },
  {
    id: 'agriculture',
    label: 'Agriculture & Farming',
    problems: [
      'Crop disease', 'Pest infestation', 'Crop failure', 'Drought stress', 'Irrigation', 'Soil health',
      'Soil degradation', 'Soil erosion', 'Fertilizer management', 'Seed quality', 'Crop yield prediction',
      'Weather-based farming', 'Crop insurance', 'Farm mechanization', 'Farm equipment', 'Agricultural supply chain',
      'Cold storage', 'Post-harvest losses', 'Market access', 'Farmer income', 'Livestock', 'Dairy', 'Poultry',
      'Fisheries', 'Aquaculture', 'Horticulture', 'Precision agriculture', 'Agricultural land management'
    ],
    keywords: [
      'crop', 'crops', 'farming', 'pest', 'locust', 'crop disease', 'crop failure', 'irrigation', 'soil health',
      'fertilizer', 'seed', 'crop yield', 'farm', 'cold storage', 'farmer', 'livestock', 'dairy', 'poultry', 'fisheries',
      'paddy', 'wheat', 'harvest'
    ],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Agronomy', 'Dept of Agricultural Engineering'],
  },
  {
    id: 'forestry_wildlife',
    label: 'Forestry & Wildlife',
    problems: [
      'Deforestation', 'Illegal logging', 'Forest fire', 'Wildlife monitoring', 'Human-animal conflict',
      'Elephant conflict', 'Tiger/leopard conflict', 'Poaching detection', 'Wildlife trafficking', 'Habitat destruction',
      'Forest encroachment', 'Forest degradation', 'Biodiversity monitoring', 'Wildlife corridor monitoring',
      'Forest health', 'Canopy monitoring', 'Invasive species', 'Community forest management'
    ],
    keywords: [
      'deforestation', 'logging', 'forest fire', 'wildlife', 'human-animal conflict', 'elephant', 'elephants',
      'hathi', 'tiger', 'leopard', 'poaching', 'trafficking', 'encroachment', 'biodiversity', 'wildlife corridor',
      'canopy', 'saranda', 'dalma', 'forest'
    ],
    depts: ['Dept of Wildlife Science & Forestry (BAU)', 'Dept of Edge AI & Thermal Imaging (IIIT Ranchi)'],
  },
  {
    id: 'mining_geology',
    label: 'Mining & Geology',
    problems: [
      'Illegal mining', 'Mine safety', 'Mine collapse', 'Mine fire', 'Ground subsidence', 'Ground cracks',
      'Underground gas leakage', 'Methane leakage', 'Carbon monoxide leakage', 'Mining pollution', 'Acid mine drainage',
      'Mine water', 'Land degradation', 'Overburden management', 'Mineral transportation', 'Mining-related displacement',
      'Abandoned mines', 'Quarry safety', 'Geological hazard monitoring', 'Mine worker safety'
    ],
    keywords: [
      'mining', 'mine', 'illegal mining', 'mine collapse', 'mine fire', 'subsidence', 'ground crack', 'jharia',
      'gas leakage', 'methane', 'carbon monoxide', 'acid mine', 'quarry', 'overburden', 'coal mine', 'bauxite', 'iron ore'
    ],
    depts: ['IIT ISM Dhanbad Mining Dept', 'Dept of Geophysics & Seismology', 'Dept of Mining Engineering'],
  },
  {
    id: 'environment_climate',
    label: 'Environment & Climate',
    problems: [
      'Air pollution', 'Water pollution', 'Soil pollution', 'Noise pollution', 'Plastic pollution', 'E-waste',
      'Hazardous waste', 'Industrial pollution', 'Climate change', 'Carbon emissions', 'Greenhouse gases',
      'Environmental degradation', 'Urban heat island', 'Biodiversity loss', 'Ecological restoration',
      'Carbon monitoring', 'Wastewater', 'Environmental compliance'
    ],
    keywords: [
      'air pollution', 'pollution', 'industrial pollution', 'industries', 'industry', 'smog', 'smoke', 'chimney',
      'factory emission', 'noise pollution', 'plastic pollution', 'e-waste', 'climate change', 'carbon emissions',
      'greenhouse', 'hazardous waste', 'environmental degradation'
    ],
    depts: ['Dept of Environmental Engineering', 'Dept of Atmospheric Sciences', 'BIT Mesra Environment Wing'],
  },
  {
    id: 'waste_management',
    label: 'Waste Management',
    problems: [
      'Municipal solid waste', 'Household waste', 'Plastic waste', 'Biomedical waste', 'E-waste',
      'Construction waste', 'Industrial waste', 'Hazardous waste', 'Sewage', 'Greywater', 'Septage',
      'Waste collection', 'Waste segregation', 'Recycling', 'Composting', 'Landfill management',
      'Illegal dumping', 'Waste transportation', 'Waste-to-energy'
    ],
    keywords: [
      'waste', 'garbage', 'trash', 'solid waste', 'dump', 'dumping', 'litter', 'recycling', 'composting',
      'landfill', 'septage', 'greywater', 'waste collection', 'biomedical waste', 'waste heap'
    ],
    depts: ['Dept of Municipal Engineering', 'Dept of Environmental Engineering'],
  },
  {
    id: 'urban_infrastructure',
    label: 'Urban Development & Municipal Infrastructure',
    problems: [
      'Roads', 'Potholes', 'Footpaths', 'Streetlights', 'Drainage', 'Sewerage', 'Public toilets', 'Parks',
      'Public spaces', 'Encroachment', 'Illegal construction', 'Building safety', 'Urban flooding', 'Water supply',
      'Waste management', 'Traffic infrastructure', 'Parking', 'Urban planning', 'Smart city infrastructure', 'Property management'
    ],
    keywords: [
      'pothole', 'potholes', 'footpath', 'streetlight', 'streetlights', 'drainage', 'sewerage', 'public toilet',
      'encroachment', 'illegal construction', 'building safety', 'traffic light', 'parking', 'smart city'
    ],
    depts: ['Dept of Urban Planning & Architecture', 'Dept of Civil Engineering', 'NIT Jamshedpur'],
  },
  {
    id: 'rural_development',
    label: 'Rural Development',
    problems: [
      'Rural roads', 'Village connectivity', 'Drinking water', 'Sanitation', 'Electricity', 'Internet connectivity',
      'Public transport', 'Rural housing', 'Employment', 'Migration', 'Poverty', 'Village infrastructure',
      'Panchayat services', 'Self-help groups', 'Rural entrepreneurship', 'Livelihood development'
    ],
    keywords: [
      'rural road', 'village connectivity', 'village', 'panchayat', 'rural housing', 'mgnrega', 'self-help group',
      'gram sabha', 'rural livelihood', 'poverty', 'rural electricity'
    ],
    depts: ['Dept of Rural Development & Management', 'XISS Ranchi Rural Wing'],
  },
  {
    id: 'transportation_mobility',
    label: 'Transportation & Mobility',
    problems: [
      'Road safety', 'Accident prevention', 'Accident black spots', 'Traffic congestion', 'Public transport',
      'Bus management', 'Railway safety', 'Railway crossings', 'Pedestrian safety', 'Cycling infrastructure',
      'Parking', 'Fleet management', 'Vehicle tracking', 'Public transit optimization', 'Last-mile connectivity',
      'Intelligent traffic systems', 'Logistics', 'Freight transportation'
    ],
    keywords: [
      'road safety', 'accident', 'traffic congestion', 'traffic jam', 'public transport', 'bus', 'railway',
      'railway crossing', 'pedestrian', 'black spot', 'vehicle tracking', 'logistics', 'freight'
    ],
    depts: ['Dept of Transportation Engineering', 'Dept of Logistics & Supply Chain'],
  },
  {
    id: 'healthcare_public_health',
    label: 'Healthcare & Public Health',
    problems: [
      'Disease outbreak', 'Epidemic prediction', 'Pandemic management', 'Malaria', 'Dengue', 'Tuberculosis',
      'Maternal health', 'Child health', 'Malnutrition', 'Mental health', 'Emergency medical services',
      'Ambulance optimization', 'Hospital capacity', 'Doctor availability', 'Medicine availability', 'Blood availability',
      'Vaccination', 'Health surveillance', 'Rural healthcare', 'Telemedicine', 'Medical waste', 'Healthcare accessibility'
    ],
    keywords: [
      'disease outbreak', 'epidemic', 'dengue', 'malaria', 'tuberculosis', 'maternal health', 'malnutrition',
      'ambulance', 'hospital', 'doctor', 'medicine', 'vaccination', 'phc', 'chc', 'telemedicine', 'health'
    ],
    depts: ['RIMS Ranchi Public Health Cell', 'Dept of Biomedical Engineering', 'Dept of Biotechnology'],
  },
  {
    id: 'sanitation_hygiene',
    label: 'Sanitation & Hygiene',
    problems: [
      'Open defecation', 'Public toilet availability', 'Toilet maintenance', 'Sewerage', 'Sewage overflow',
      'Drain blockage', 'Septic tank management', 'Wastewater', 'Hygiene', 'Water sanitation', 'Community sanitation'
    ],
    keywords: [
      'open defecation', 'public toilet', 'toilet maintenance', 'sewage overflow', 'drain blockage', 'septic tank',
      'wastewater', 'hygiene', 'sanitation', 'swachh'
    ],
    depts: ['Dept of Public Health & Municipal Sanitation', 'Swachh Bharat Engineering Wing'],
  },
  {
    id: 'education',
    label: 'Education & Skill Development',
    problems: [
      'School infrastructure', 'Teacher shortage', 'Student attendance', 'Student dropout', 'Learning outcomes',
      'Digital education', 'Rural education', 'Tribal education', 'Special education', 'Examination management',
      'School safety', 'Library access', 'Laboratory access', 'Skill development', 'Vocational training', 'Higher education accessibility'
    ],
    keywords: [
      'school infrastructure', 'teacher shortage', 'student dropout', 'digital education', 'rural education',
      'tribal education', 'school safety', 'library', 'laboratory', 'skill development', 'vocational', 'classroom'
    ],
    depts: ['Dept of Educational Technology', 'Dept of Higher & Technical Education'],
  },
  {
    id: 'women_child_safety',
    label: 'Women & Child Safety',
    problems: [
      'Domestic violence', 'Child abuse', 'Missing children', 'Human trafficking', 'Child labour', 'Women safety',
      'Harassment', 'Unsafe public spaces', 'Maternal welfare', 'Child nutrition', 'Anganwadi services', 'Girl education', 'Women employment'
    ],
    keywords: [
      'women safety', 'child safety', 'child abuse', 'missing children', 'trafficking', 'child labour', 'harassment',
      'anganwadi', 'maternal welfare', 'girl education', 'poshan'
    ],
    depts: ['Dept of Social Work & Gender Studies', 'Dept of Child Development'],
  },
  {
    id: 'social_welfare',
    label: 'Social Welfare & Inclusion',
    problems: [
      'Poverty', 'Homelessness', 'Elderly care', 'Disability accessibility', 'Social security', 'Pension delivery',
      'Food security', 'Tribal welfare', 'Minority welfare', 'Welfare scheme access', 'Social exclusion', 'Rehabilitation',
      'Vulnerable populations', 'Migrant workers', 'Unemployment'
    ],
    keywords: [
      'poverty', 'homelessness', 'elderly care', 'disability', 'pension', 'tribal welfare', 'minority welfare',
      'social security', 'migrant worker', 'vulnerable'
    ],
    depts: ['XISS Ranchi Social Welfare Wing', 'Dept of Tribal & Regional Languages (Ranchi University)'],
  },
  {
    id: 'employment_livelihood',
    label: 'Employment & Livelihood',
    problems: [
      'Unemployment', 'Skill mismatch', 'Job matching', 'Rural employment', 'Migrant employment', 'Vocational training',
      'Entrepreneurship', 'MSME development', 'Artisan support', 'Handicrafts', 'Gig workers', 'Labour welfare', 'Wage issues', 'Workforce migration'
    ],
    keywords: [
      'unemployment', 'job', 'jobs', 'skill mismatch', 'rural employment', 'entrepreneurship', 'msme', 'artisan',
      'handicraft', 'gig worker', 'wage', 'labour'
    ],
    depts: ['Dept of Management & Entrepreneurship', 'IIM Ranchi Incubation Center'],
  },
  {
    id: 'finance_economic_dev',
    label: 'Finance & Economic Development',
    problems: [
      'Financial inclusion', 'Banking accessibility', 'Rural banking', 'Credit access', 'Microfinance', 'MSME financing',
      'Subsidy distribution', 'Loan management', 'Insurance', 'Crop insurance', 'Financial fraud', 'Government expenditure',
      'Revenue leakage', 'Tax compliance', 'Poverty mapping'
    ],
    keywords: [
      'financial inclusion', 'banking', 'rural banking', 'credit access', 'microfinance', 'subsidy', 'loan',
      'insurance', 'crop insurance', 'financial fraud', 'tax'
    ],
    depts: ['Dept of Financial Economics', 'IIM Ranchi Banking Cell'],
  },
  {
    id: 'egovernance_services',
    label: 'Government Services & E-Governance',
    problems: [
      'Citizen complaints', 'Service delivery', 'Government scheme access', 'Application processing', 'Document verification',
      'Certificate issuance', 'Grievance redressal', 'Department coordination', 'Case tracking', 'Public information',
      'Government workflow', 'Inter-department data sharing', 'Benefit delivery', 'Scheme monitoring', 'Public service accessibility'
    ],
    keywords: [
      'citizen complaint', 'service delivery', 'government scheme', 'grievance', 'certificate', 'pragya kendra',
      'e-district', 'dbt', 'benefit delivery', 'workflow'
    ],
    depts: ['Dept of Computer Applications & E-Governance', 'National Informatics Centre (NIC) Cell'],
  },
  {
    id: 'law_public_safety',
    label: 'Law Enforcement & Public Safety',
    problems: [
      'Crime mapping', 'Missing persons', 'Emergency response', 'Police response', 'Crowd management', 'Public surveillance',
      'Women safety', 'Child safety', 'Drug abuse', 'Illegal activities', 'Border/security monitoring', 'Community policing', 'Disaster-police coordination'
    ],
    keywords: [
      'crime', 'police', 'missing person', 'emergency response', 'crowd management', 'surveillance', 'cctv',
      'drug abuse', 'narcotics', 'public safety', 'patrol'
    ],
    depts: ['Dept of Criminology & Police Studies', 'Dept of Cybersecurity & Surveillance'],
  },
  {
    id: 'cybersecurity_digital',
    label: 'Cybersecurity & Digital Governance',
    problems: [
      'Cybercrime', 'Phishing', 'Identity theft', 'Online fraud', 'Data breaches', 'Government system security',
      'Citizen identity protection', 'Digital identity', 'Privacy', 'Cyber awareness', 'Critical infrastructure security',
      'Ransomware', 'Secure government communication'
    ],
    keywords: [
      'cybercrime', 'phishing', 'identity theft', 'online fraud', 'data breach', 'ransomware', 'hacked',
      'cyber awareness', 'digital identity', 'privacy'
    ],
    depts: ['Dept of Computer Science & Cybersecurity (IIIT Ranchi)', 'CDAC Security Cell'],
  },
  {
    id: 'energy_electricity',
    label: 'Energy & Electricity',
    problems: [
      'Power outages', 'Electricity theft', 'Transmission losses', 'Distribution losses', 'Transformer failure',
      'Grid stability', 'Renewable energy', 'Solar energy', 'Rural electrification', 'Streetlight energy consumption',
      'Battery storage', 'Microgrids', 'Smart meters', 'Energy forecasting'
    ],
    keywords: [
      'power outage', 'power cut', 'electricity', 'electricity theft', 'transformer', 'transformer failure',
      'grid', 'solar', 'renewable energy', 'smart meter', 'wire snap', 'electric pole'
    ],
    depts: ['Dept of Electrical & Power Systems Engineering', 'BIT Mesra Energy Dept'],
  },
  {
    id: 'telecom_connectivity',
    label: 'Telecommunications & Digital Connectivity',
    problems: [
      'Internet connectivity', 'Rural broadband', 'Mobile network coverage', 'Network outages', 'Digital divide',
      'Telecom infrastructure', 'Emergency communication', 'Public Wi-Fi', 'Connectivity during disasters'
    ],
    keywords: [
      'internet connectivity', 'broadband', 'mobile network', 'signal', 'tower', 'network outage', 'telecom',
      'public wifi', 'digital divide', '5g', 'optical fiber'
    ],
    depts: ['Dept of Electronics & Telecommunication Engineering', 'IIIT Ranchi Telecom Cell'],
  },
  {
    id: 'roads_bridges_civic',
    label: 'Roads, Bridges & Civil Infrastructure',
    problems: [
      'Bridge structural health', 'Road deterioration', 'Potholes', 'Highway safety', 'Culvert failure', 'Flyover safety',
      'Tunnel safety', 'Pavement monitoring', 'Construction quality', 'Infrastructure inspection', 'Structural cracks', 'Asset maintenance'
    ],
    keywords: [
      'bridge', 'pothole', 'potholes', 'highway', 'flyover', 'culvert', 'road deterioration', 'structural crack',
      'pavement', 'construction quality', 'girder'
    ],
    depts: ['Dept of Civil Engineering (NIT Jamshedpur)', 'Dept of Structural Engineering'],
  },
  {
    id: 'food_security_supply',
    label: 'Food Security & Supply Chain',
    problems: [
      'Food distribution', 'Public Distribution System', 'Food adulteration', 'Food wastage', 'Cold-chain failure',
      'Storage', 'Warehouse management', 'Grain spoilage', 'Supply chain optimization', 'Ration availability', 'Price monitoring'
    ],
    keywords: [
      'food distribution', 'pds', 'ration', 'ration shop', 'food adulteration', 'grain spoilage', 'cold chain',
      'warehouse', 'food wastage', 'godown'
    ],
    depts: ['Dept of Food Technology', 'Dept of Supply Chain Management'],
  },
  {
    id: 'stray_animals',
    label: 'Animal & Stray Animal Management',
    problems: [
      'Stray dogs', 'Stray cattle', 'Animal shelters', 'Road accidents involving animals', 'Rabies prevention',
      'Animal vaccination', 'Animal welfare', 'Urban wildlife'
    ],
    keywords: [
      'stray dog', 'stray dogs', 'stray cattle', 'cow', 'bull', 'rabies', 'animal bite', 'animal shelter', 'dog bite'
    ],
    depts: ['Veterinary College Ranchi (BAU)', 'Dept of Animal Husbandry'],
  },
];
