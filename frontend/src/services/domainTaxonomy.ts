/**
 * NIVAARAN Official Government Challenge Taxonomy (SIH Problem Statement 26043)
 * 100 Official Domains & 1,500+ Problem Sub-Categories
 * Government of Jharkhand, Department of Higher & Technical Education
 * Image-first classification: every category has visual cues Gemini Vision AI can detect
 */

export interface GovDomain {
  id: string;
  label: string;
  problems: string[];
  keywords: string[];
  depts: string[];
}

export const GOV_DOMAINS: GovDomain[] = [
  // ─── DISASTER & EMERGENCY ───────────────────────────────────────────────
  {
    id: 'disaster_mgmt',
    label: 'Disaster Management & Emergency Response',
    problems: ['Flood', 'Flash flood', 'Urban flooding', 'Drought', 'Cyclone', 'Landslide', 'Earthquake', 'Dam failure', 'Embankment failure', 'Mine disaster', 'Cloudbursts', 'Forest fire', 'Chemical disaster', 'Relief distribution', 'Emergency shelter', 'Search and rescue'],
    keywords: ['flood', 'flash flood', 'flooding', 'drought', 'cyclone', 'landslide', 'earthquake', 'dam failure', 'embankment', 'evacuation', 'shelter', 'relief', 'rescue', 'submerge', 'inundation', 'disaster'],
    depts: ['Dept of Disaster Management', 'Dept of Hydraulic Engineering', 'BIT Mesra Disaster Mitigation Cell'],
  },
  {
    id: 'urban_flooding',
    label: 'Urban & Stormwater Flooding',
    problems: ['Waterlogging in city', 'Blocked storm drains', 'Flooded streets', 'Submerged vehicles', 'Overflowing drains', 'Low-lying area flooding', 'Underpass flooding', 'Basement flooding'],
    keywords: ['waterlogging', 'flooded road', 'waterlogged', 'submerged', 'stormwater', 'overflowing drain', 'underpass', 'urban flood'],
    depts: ['Dept of Urban Planning', 'Dept of Civil Engineering (NIT Jamshedpur)'],
  },
  {
    id: 'landslide_erosion',
    label: 'Landslide & Soil Erosion',
    problems: ['Landslide', 'Mudslide', 'Hill cut collapse', 'Road embankment failure', 'Bank erosion', 'Slope instability', 'Erosion near rivers', 'Gully erosion'],
    keywords: ['landslide', 'mudslide', 'slope', 'erosion', 'embankment failure', 'hill collapse', 'soil erosion', 'gully'],
    depts: ['Dept of Civil Engineering', 'Dept of Geology', 'JHARKHAND Jal Sansthan'],
  },

  // ─── WATER ──────────────────────────────────────────────────────────────
  {
    id: 'water_contamination',
    label: 'Water Contamination & Quality',
    problems: ['Drinking water contamination', 'Fluoride contamination', 'Arsenic contamination', 'Iron contamination', 'Bacterial contamination', 'Sewage mixing in water supply', 'Chemical contamination', 'Heavy metal in water'],
    keywords: ['water contamination', 'fluoride', 'arsenic', 'iron contamination', 'dirty water', 'polluted water', 'sewage water', 'chemical in water', 'heavy metal'],
    depts: ['Dept of Environmental Engineering', 'Dept of Hydrogeology', 'Jharkhand Jal Sansthan'],
  },
  {
    id: 'water_scarcity',
    label: 'Water Scarcity & Supply Failure',
    problems: ['Drinking water shortage', 'Borewell failure', 'Handpump failure', 'No tap water supply', 'Water distribution failure', 'Groundwater depletion', 'Dry river/pond', 'Water tanker dependency'],
    keywords: ['water scarcity', 'no water', 'borewell failure', 'handpump', 'tap water', 'water supply', 'groundwater', 'water tanker', 'water shortage'],
    depts: ['Dept of Water Resources', 'Jharkhand Jal Sansthan'],
  },
  {
    id: 'river_lake_pollution',
    label: 'River, Lake & Waterbody Pollution',
    problems: ['River pollution', 'Lake pollution', 'Pond pollution', 'Industrial effluent in river', 'Sewage discharge', 'Dead fish in water', 'Oil spill in water', 'Algal bloom', 'Wetland encroachment'],
    keywords: ['river pollution', 'lake pollution', 'pond', 'industrial effluent', 'sewage discharge', 'dead fish', 'oil spill', 'algal bloom', 'wetland', 'water body'],
    depts: ['Dept of Environmental Engineering', 'Dept of Aquaculture', 'Jharkhand State Pollution Control Board'],
  },
  {
    id: 'irrigation_water',
    label: 'Irrigation & Agricultural Water',
    problems: ['Irrigation canal blockage', 'Canal breach', 'Water logging in farm', 'Irrigation water scarcity', 'Canal maintenance', 'Rainwater harvesting failure', 'Watershed degradation'],
    keywords: ['irrigation', 'canal', 'canal breach', 'water logging farm', 'rainwater harvesting', 'watershed', 'dam irrigation', 'flood irrigation'],
    depts: ['Dept of Agriculture Engineering', 'Birsa Agricultural University (BAU)', 'JWRC'],
  },

  // ─── AGRICULTURE & FOOD ─────────────────────────────────────────────────
  {
    id: 'agriculture',
    label: 'Agriculture & Farming',
    problems: ['Crop disease', 'Pest infestation', 'Crop failure', 'Drought stress on crops', 'Soil health', 'Soil degradation', 'Fertilizer management', 'Seed quality', 'Crop yield', 'Farm mechanization'],
    keywords: ['crop', 'crops', 'farming', 'pest', 'crop disease', 'crop failure', 'irrigation', 'soil health', 'fertilizer', 'seed', 'farm', 'paddy', 'wheat', 'harvest'],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Agronomy', 'Dept of Agricultural Engineering'],
  },
  {
    id: 'crop_pest_disease',
    label: 'Crop Pest & Disease Infestation',
    problems: ['Locust attack', 'Borer infestation', 'Leaf blight', 'Fungal infection on crop', 'Wheat rust', 'Rice blast', 'Armyworm infestation', 'Whitefly attack', 'Aphid infestation', 'Root rot'],
    keywords: ['locust', 'pest', 'borer', 'leaf blight', 'fungal', 'rust', 'rice blast', 'armyworm', 'whitefly', 'aphid', 'root rot', 'yellow leaves', 'brown spot', 'crop infestation'],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Plant Pathology', 'Dept of Entomology'],
  },
  {
    id: 'soil_degradation',
    label: 'Soil Degradation & Land Health',
    problems: ['Soil erosion', 'Soil infertility', 'Land degradation', 'Salinization', 'Waterlogged agricultural land', 'Compacted soil', 'Nutrient deficiency in soil', 'Soil contamination'],
    keywords: ['soil erosion', 'infertile soil', 'land degradation', 'salinization', 'compacted soil', 'nutrient deficiency', 'soil contamination', 'degraded land'],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Soil Science', 'NIT Jamshedpur'],
  },
  {
    id: 'horticulture',
    label: 'Horticulture & Plantation Crops',
    problems: ['Fruit crop disease', 'Vegetable pest', 'Mango disease', 'Banana wilt', 'Plantation soil issue', 'Post-harvest vegetable loss', 'Horticulture water scarcity', 'Flower crop disease'],
    keywords: ['horticulture', 'fruit', 'vegetable', 'mango', 'banana', 'plantation', 'garden', 'orchard', 'flower crop', 'nursery'],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Horticulture', 'Horticulture Mission Jharkhand'],
  },
  {
    id: 'livestock_dairy',
    label: 'Livestock & Dairy Farming',
    problems: ['Animal disease outbreak', 'Foot and mouth disease', 'Lumpy skin disease', 'Poultry disease', 'Cattle death', 'Fodder scarcity', 'Veterinary care unavailability', 'Dairy cold chain failure'],
    keywords: ['livestock', 'cattle', 'cow', 'buffalo', 'goat', 'poultry', 'animal disease', 'foot mouth', 'lumpy skin', 'fodder', 'dairy', 'milk', 'veterinary'],
    depts: ['Veterinary College Ranchi (BAU)', 'Dept of Animal Husbandry', 'Dept of Dairy Technology'],
  },
  {
    id: 'fisheries_aquaculture',
    label: 'Fisheries & Aquaculture',
    problems: ['Fish disease', 'Pond water quality', 'Fish mortality', 'Overfishing', 'Aquaculture pond erosion', 'Illegal fishing', 'Fish market hygiene', 'River fish decline'],
    keywords: ['fish', 'fishery', 'aquaculture', 'pond', 'fish disease', 'fish mortality', 'fishing', 'river fish', 'fish market'],
    depts: ['Birsa Agricultural University (BAU)', 'Dept of Aquaculture', 'Jharkhand Fisheries Dept'],
  },
  {
    id: 'food_adulteration',
    label: 'Food Adulteration & Safety',
    problems: ['Adulterated food', 'Contaminated grain', 'Pesticide residue in food', 'Food poisoning incident', 'Expired food sold', 'Unhygienic food market', 'Milk adulteration'],
    keywords: ['food adulteration', 'contaminated food', 'food poisoning', 'expired food', 'unhygienic', 'pesticide food', 'milk adulteration', 'food safety'],
    depts: ['Dept of Food Technology', 'FSSAI Jharkhand', 'Dept of Biochemistry'],
  },
  {
    id: 'food_supply_pds',
    label: 'Food Security & PDS Distribution',
    problems: ['Ration not received', 'PDS shop corruption', 'Grain spoilage in warehouse', 'Cold chain failure', 'Food supply disruption', 'Ration card issues', 'BPL household exclusion', 'Godown fire/pest damage'],
    keywords: ['ration', 'pds', 'ration shop', 'grain spoilage', 'cold chain', 'food supply', 'godown', 'food security', 'ration card', 'bpl'],
    depts: ['Dept of Food Technology', 'Dept of Supply Chain Management', 'Jharkhand Food Corporation'],
  },

  // ─── ENVIRONMENT & ECOLOGY ──────────────────────────────────────────────
  {
    id: 'air_pollution',
    label: 'Air Pollution & Industrial Emissions',
    problems: ['Factory smoke', 'Industrial chimney emissions', 'Dust pollution', 'Vehicle emissions', 'Burning waste', 'Crop residue burning', 'Stone crusher dust', 'Power plant emissions'],
    keywords: ['air pollution', 'smoke', 'chimney', 'industrial emission', 'dust', 'vehicle emission', 'burning waste', 'crop burning', 'stone crusher', 'smog', 'haze'],
    depts: ['Jharkhand State Pollution Control Board', 'Dept of Atmospheric Sciences', 'BIT Mesra Environment Wing'],
  },
  {
    id: 'environment_climate',
    label: 'Environment & Climate Change',
    problems: ['Deforestation effects', 'Urban heat island', 'Biodiversity loss', 'Carbon emissions', 'Climate-related crop loss', 'Ecosystem degradation', 'Ecological restoration needed'],
    keywords: ['climate change', 'carbon emissions', 'heat island', 'biodiversity loss', 'ecosystem', 'ecological', 'greenhouse', 'carbon'],
    depts: ['Dept of Environmental Engineering', 'Dept of Atmospheric Sciences', 'BIT Mesra Environment Wing'],
  },
  {
    id: 'noise_pollution',
    label: 'Noise Pollution',
    problems: ['Industrial noise', 'Construction noise', 'Loudspeaker noise', 'Vehicle horn noise', 'Mining blasting noise', 'Night time noise', 'Noise near hospital/school'],
    keywords: ['noise pollution', 'noise', 'loud noise', 'industrial noise', 'construction noise', 'blasting', 'loudspeaker'],
    depts: ['Jharkhand State Pollution Control Board', 'Dept of Environmental Engineering'],
  },
  {
    id: 'plastic_waste',
    label: 'Plastic & Solid Waste Pollution',
    problems: ['Plastic litter on road', 'Plastic in river/pond', 'Single-use plastic bags', 'Plastic burning', 'Microplastics in water', 'Plastic clogging drains'],
    keywords: ['plastic', 'plastic waste', 'polythene', 'single use plastic', 'plastic litter', 'plastic burning', 'polythene bag'],
    depts: ['Dept of Environmental Engineering', 'Dept of Polymer Science'],
  },
  {
    id: 'hazardous_waste',
    label: 'Hazardous & Chemical Waste',
    problems: ['Industrial chemical dumping', 'E-waste dumping', 'Biomedical waste', 'Battery acid spill', 'Paint/solvent disposal', 'Hazardous material transport', 'Oil drum disposal'],
    keywords: ['hazardous waste', 'chemical waste', 'e-waste', 'biomedical waste', 'battery acid', 'toxic waste', 'chemical dump', 'industrial waste'],
    depts: ['Jharkhand State Pollution Control Board', 'Dept of Chemical Engineering', 'CPCB'],
  },
  {
    id: 'forestry_wildlife',
    label: 'Forestry & Wildlife',
    problems: ['Deforestation', 'Illegal logging', 'Forest fire', 'Human-animal conflict', 'Elephant conflict', 'Tiger/leopard sighting', 'Poaching', 'Forest encroachment', 'Biodiversity monitoring'],
    keywords: ['deforestation', 'logging', 'forest fire', 'wildlife', 'elephant', 'hathi', 'tiger', 'leopard', 'poaching', 'forest', 'wildlife corridor', 'saranda', 'dalma'],
    depts: ['Dept of Wildlife Science & Forestry (BAU)', 'Dept of Edge AI & Thermal Imaging (IIIT Ranchi)'],
  },
  {
    id: 'tree_cutting',
    label: 'Illegal Tree Cutting & Felling',
    problems: ['Illegal tree felling', 'Tree cutting for construction', 'Road widening tree removal', 'Urban tree loss', 'Avenue tree damage', 'Protected tree cutting'],
    keywords: ['tree cutting', 'tree felling', 'illegal logging', 'deforestation', 'tree removal', 'cut tree', 'felled tree'],
    depts: ['Forest Department Jharkhand', 'Dept of Environmental Engineering'],
  },
  {
    id: 'wetland_conservation',
    label: 'Wetland & Biodiversity Conservation',
    problems: ['Wetland encroachment', 'Wetland drainage', 'Waterbody filling', 'Bird habitat destruction', 'Mangrove loss', 'Biodiversity hotspot degradation'],
    keywords: ['wetland', 'swamp', 'marsh', 'waterbody filling', 'bird habitat', 'biodiversity', 'lake encroachment', 'pond filling'],
    depts: ['Dept of Wildlife Science', 'Jharkhand Forest Department', 'BNHS'],
  },

  // ─── MINING ─────────────────────────────────────────────────────────────
  {
    id: 'mining_geology',
    label: 'Mining, Quarrying & Geology',
    problems: ['Illegal mining', 'Mine safety', 'Mine collapse', 'Mine fire', 'Ground subsidence', 'Ground cracks', 'Mining pollution', 'Acid mine drainage', 'Abandoned mines', 'Mine worker safety'],
    keywords: ['mining', 'mine', 'illegal mining', 'mine collapse', 'mine fire', 'subsidence', 'ground crack', 'jharia', 'coal mine', 'quarry', 'overburden', 'acid mine'],
    depts: ['IIT ISM Dhanbad Mining Dept', 'Dept of Geophysics & Seismology', 'Dept of Mining Engineering'],
  },
  {
    id: 'mine_fire',
    label: 'Coal Mine Fire & Underground Burning',
    problems: ['Active coal mine fire', 'Underground smouldering', 'Mine fire smoke', 'Ground cracking due to subsidence', 'Jharia mine fire', 'Methane gas emission'],
    keywords: ['mine fire', 'coal fire', 'underground fire', 'jharia', 'methane', 'subsidence', 'smouldering ground', 'coal seam fire'],
    depts: ['IIT ISM Dhanbad', 'CMPDI', 'Coal India Safety Wing'],
  },
  {
    id: 'mining_displacement',
    label: 'Mining-Related Land Displacement',
    problems: ['Land acquisition dispute', 'Village displacement', 'Mining on tribal land', 'Rehabilitation failure', 'Mining community conflict', 'Land measurement dispute'],
    keywords: ['displacement', 'land acquisition', 'mining land', 'tribal land', 'rehabilitation', 'mining community', 'village eviction'],
    depts: ['Dept of Social Work', 'Dept of Tribal Studies', 'XLRI Jamshedpur Social Wing'],
  },

  // ─── INFRASTRUCTURE ──────────────────────────────────────────────────────
  {
    id: 'roads_bridges',
    label: 'Roads, Bridges & Civil Infrastructure',
    problems: ['Pothole', 'Road deterioration', 'Bridge structural damage', 'Culvert failure', 'Flyover safety', 'Pavement failure', 'Structural cracks', 'Construction quality issue'],
    keywords: ['pothole', 'potholes', 'bridge', 'highway', 'flyover', 'culvert', 'road crack', 'structural crack', 'pavement', 'road deterioration'],
    depts: ['Dept of Civil Engineering (NIT Jamshedpur)', 'Dept of Structural Engineering', 'NHAI'],
  },
  {
    id: 'road_damage',
    label: 'Road Damage & Pavement Failure',
    problems: ['Severe potholes', 'Cracked road surface', 'Road cave-in', 'Waterlogged road', 'Road shoulder collapse', 'Unmarked road hazard', 'Road after flood damage'],
    keywords: ['broken road', 'cracked road', 'road damage', 'road cave', 'road hazard', 'bad road', 'road condition', 'pothole road'],
    depts: ['Dept of Civil Engineering (NIT Jamshedpur)', 'NH/SH Division'],
  },
  {
    id: 'bridge_safety',
    label: 'Bridge & Overpass Structural Safety',
    problems: ['Bridge crack', 'Bridge railing missing', 'Bridge flooding', 'Overloaded bridge', 'Old bridge deterioration', 'Bridge approach road damage', 'Temporary bridge failure'],
    keywords: ['bridge crack', 'bridge damage', 'bridge failure', 'overpass', 'bridge railing', 'bridge flood', 'pul'],
    depts: ['Dept of Structural Engineering', 'NIT Jamshedpur Civil', 'PWD Jharkhand'],
  },
  {
    id: 'urban_infrastructure',
    label: 'Urban Development & Municipal Infrastructure',
    problems: ['Footpaths', 'Streetlights', 'Drainage', 'Sewerage', 'Public toilets', 'Parks maintenance', 'Encroachment', 'Illegal construction', 'Urban flooding'],
    keywords: ['footpath', 'streetlight', 'drainage', 'sewerage', 'public toilet', 'encroachment', 'illegal construction', 'traffic light', 'smart city'],
    depts: ['Dept of Urban Planning & Architecture', 'Dept of Civil Engineering', 'NIT Jamshedpur'],
  },
  {
    id: 'building_safety',
    label: 'Building Safety & Structural Collapse',
    problems: ['Building collapse', 'Structural crack in building', 'Old/dilapidated structure', 'School building crack', 'Hospital building unsafe', 'Roof collapse', 'Construction without permit'],
    keywords: ['building collapse', 'structural crack', 'dilapidated', 'roof collapse', 'wall crack', 'unsafe building', 'construction collapse', 'building crack'],
    depts: ['Dept of Civil Engineering', 'Dept of Structural Engineering', 'Urban Local Body'],
  },
  {
    id: 'drainage_sewerage',
    label: 'Drainage & Sewerage System Failure',
    problems: ['Drain blockage', 'Sewage overflow', 'Open drain without cover', 'Drain clogged by waste', 'Sewage on road', 'Manhole cover missing'],
    keywords: ['drain blockage', 'sewage overflow', 'drain', 'manhole', 'clogged drain', 'sewage road', 'nali', 'sewer', 'drain cover'],
    depts: ['Dept of Civil Engineering', 'Urban Local Body', 'Jharkhand Urban Development'],
  },
  {
    id: 'construction_quality',
    label: 'Poor Construction Quality & Public Works',
    problems: ['Newly-built road damaged quickly', 'Poor quality construction', 'Contractor negligence', 'Government building poor quality', 'Unfinished government project', 'Construction material substandard'],
    keywords: ['poor construction', 'bad quality road', 'contractor', 'government project', 'substandard', 'unfinished construction', 'new road broken'],
    depts: ['Dept of Civil Engineering', 'Dept of Construction Management', 'Jharkhand Vigilance'],
  },

  // ─── ENERGY & ELECTRICITY ────────────────────────────────────────────────
  {
    id: 'energy_electricity',
    label: 'Energy & Electricity Supply',
    problems: ['Power outage', 'Electricity theft', 'Transformer failure', 'Grid instability', 'Rural electrification', 'Streetlight not working', 'Smart meter failure'],
    keywords: ['power outage', 'power cut', 'electricity', 'transformer failure', 'grid', 'solar', 'smart meter', 'wire snap', 'electric pole', 'bijli'],
    depts: ['Dept of Electrical & Power Systems Engineering', 'BIT Mesra Energy Dept', 'JBVNL'],
  },
  {
    id: 'electrical_hazard',
    label: 'Electrical Hazard & Safety',
    problems: ['Downed power line', 'Bare live wire on road', 'Electric pole leaning', 'Transformer sparking', 'Electric shock risk', 'Illegal electrical connection', 'Electric wire near water'],
    keywords: ['downed wire', 'live wire', 'bare wire', 'electric pole', 'transformer spark', 'electric shock', 'electric hazard', 'fallen wire', 'electric cable'],
    depts: ['JBVNL', 'Dept of Electrical Engineering', 'BIT Mesra Energy Safety'],
  },
  {
    id: 'solar_renewable',
    label: 'Solar & Renewable Energy Issues',
    problems: ['Solar panel failure', 'Solar streetlight not working', 'Mini-grid failure', 'Solar water pump failure', 'Community solar system damaged', 'Renewable energy installation issue'],
    keywords: ['solar panel', 'solar light', 'solar pump', 'mini grid', 'renewable energy', 'solar system', 'wind energy'],
    depts: ['BIT Mesra Energy Dept', 'JREDA', 'Dept of Renewable Energy'],
  },

  // ─── WASTE MANAGEMENT ────────────────────────────────────────────────────
  {
    id: 'waste_management',
    label: 'Municipal Solid Waste Management',
    problems: ['Garbage not collected', 'Illegal dumping', 'Open garbage heap', 'Waste segregation failure', 'Landfill overflow', 'Recycling not done', 'Composting issues'],
    keywords: ['garbage', 'waste', 'trash', 'dump', 'dumping', 'litter', 'recycling', 'composting', 'landfill', 'waste heap', 'garbage collection'],
    depts: ['Dept of Municipal Engineering', 'Dept of Environmental Engineering', 'Jharkhand Urban Development Authority'],
  },
  {
    id: 'biomedical_waste',
    label: 'Biomedical & Hospital Waste',
    problems: ['Hospital waste on road', 'Needle/syringe disposal', 'Expired medicine disposal', 'Biomedical waste in open area', 'Medical waste near school'],
    keywords: ['biomedical waste', 'hospital waste', 'syringe', 'medical waste', 'medicine disposal', 'clinical waste'],
    depts: ['RIMS Ranchi', 'Jharkhand State Pollution Control Board', 'Dept of Biomedical Engineering'],
  },
  {
    id: 'construction_waste',
    label: 'Construction & Demolition Waste',
    problems: ['Construction debris on road', 'Demolition waste dumped', 'Rubble blocking drain', 'Construction dust', 'Concrete waste in water body'],
    keywords: ['construction debris', 'demolition waste', 'rubble', 'construction dust', 'concrete waste', 'building waste'],
    depts: ['Urban Local Body', 'Dept of Civil Engineering'],
  },

  // ─── TRANSPORTATION ──────────────────────────────────────────────────────
  {
    id: 'transportation_mobility',
    label: 'Transportation, Traffic & Mobility',
    problems: ['Road accident', 'Traffic congestion', 'Public transport failure', 'Bus breakdown', 'Railway safety', 'Pedestrian safety', 'Black spot on road', 'Vehicle tracking'],
    keywords: ['accident', 'traffic', 'traffic jam', 'bus', 'railway', 'pedestrian', 'black spot', 'vehicle', 'road safety'],
    depts: ['Dept of Transportation Engineering', 'Dept of Logistics & Supply Chain', 'NHAI'],
  },
  {
    id: 'road_accident',
    label: 'Road Accident & Traffic Safety',
    problems: ['Vehicle accident', 'Road accident fatality', 'Accident black spot', 'Overturned truck', 'Hit and run', 'Speeding vehicle', 'Accident due to pothole'],
    keywords: ['accident', 'road accident', 'vehicle crash', 'overturned', 'hit run', 'truck accident', 'fatal accident', 'collision'],
    depts: ['Dept of Transportation Engineering', 'NHAI', 'Jharkhand Traffic Police'],
  },
  {
    id: 'public_transport',
    label: 'Public Transport Failure',
    problems: ['Bus not running', 'Bus breakdown on route', 'No public transport in village', 'Auto-rickshaw overloading', 'Last-mile connectivity gap', 'Ferry/boat accident'],
    keywords: ['bus', 'public transport', 'auto rickshaw', 'village transport', 'last mile', 'ferry', 'boat', 'transport gap'],
    depts: ['Jharkhand Transport Dept', 'Dept of Urban Mobility'],
  },
  {
    id: 'traffic_management',
    label: 'Traffic Congestion & Signal Failure',
    problems: ['Traffic jam', 'Signal not working', 'No traffic police', 'Encroachment causing traffic', 'School zone traffic', 'Heavy vehicle restriction violation'],
    keywords: ['traffic jam', 'signal failure', 'traffic signal', 'congestion', 'traffic police', 'school traffic', 'heavy vehicle'],
    depts: ['Dept of Transportation Engineering', 'Jharkhand Traffic Police'],
  },
  {
    id: 'railway_safety',
    label: 'Railway & Level Crossing Safety',
    problems: ['Unmanned railway crossing', 'Train track encroachment', 'Railway gate failure', 'Track damage', 'Train accident', 'Station infrastructure issue'],
    keywords: ['railway crossing', 'level crossing', 'train track', 'railway gate', 'train accident', 'railway station', 'rail'],
    depts: ['East Central Railway', 'Dept of Transportation Engineering'],
  },

  // ─── SANITATION & HYGIENE ────────────────────────────────────────────────
  {
    id: 'sanitation_hygiene',
    label: 'Sanitation & Hygiene',
    problems: ['Open defecation', 'No public toilet', 'Toilet not maintained', 'Sewage overflow', 'Drain blockage', 'Septic tank overflow', 'Community sanitation'],
    keywords: ['open defecation', 'public toilet', 'toilet', 'sewage overflow', 'drain blockage', 'septic tank', 'sanitation', 'swachh', 'hygiene'],
    depts: ['Dept of Public Health & Municipal Sanitation', 'Swachh Bharat Engineering Wing'],
  },
  {
    id: 'open_defecation',
    label: 'Open Defecation & ODF Reversal',
    problems: ['ODF village reversal', 'No toilet in house', 'Toilet constructed but not used', 'School toilet not functional', 'Railway track defecation', 'ODF status fraudulent'],
    keywords: ['open defecation', 'odf', 'no toilet', 'school toilet', 'village toilet', 'shauchalay'],
    depts: ['Swachh Bharat Mission', 'Dept of Rural Development', 'Dept of Public Health'],
  },

  // ─── HEALTHCARE & PUBLIC HEALTH ──────────────────────────────────────────
  {
    id: 'healthcare_public_health',
    label: 'Healthcare & Public Health',
    problems: ['Disease outbreak', 'Dengue', 'Malaria', 'Tuberculosis', 'Malnutrition', 'Maternal health', 'Emergency medical services', 'Hospital capacity', 'Rural healthcare'],
    keywords: ['disease outbreak', 'dengue', 'malaria', 'tuberculosis', 'malnutrition', 'ambulance', 'hospital', 'doctor', 'medicine', 'vaccination', 'health'],
    depts: ['RIMS Ranchi Public Health Cell', 'Dept of Biomedical Engineering', 'Dept of Biotechnology'],
  },
  {
    id: 'disease_outbreak',
    label: 'Epidemic & Disease Outbreak',
    problems: ['Cholera outbreak', 'Dengue cluster', 'Malaria cluster', 'COVID-like outbreak', 'Encephalitis outbreak', 'Food poisoning mass event', 'Animal to human transmission'],
    keywords: ['outbreak', 'epidemic', 'cholera', 'dengue cluster', 'malaria cluster', 'mass illness', 'disease spread', 'encephalitis'],
    depts: ['RIMS Ranchi', 'Jharkhand Health Dept', 'NVBDCP'],
  },
  {
    id: 'malnutrition_child_health',
    label: 'Malnutrition & Child Health',
    problems: ['Severe acute malnutrition', 'Stunting', 'Wasting', 'Anaemia in children', 'School mid-day meal issue', 'Anganwadi food quality', 'Child underweight'],
    keywords: ['malnutrition', 'stunting', 'wasting', 'anaemia', 'mid day meal', 'anganwadi', 'child underweight', 'kwashiorkor', 'marasmus'],
    depts: ['RIMS Ranchi', 'Dept of Nutrition Science', 'ICDS Jharkhand'],
  },
  {
    id: 'mental_health',
    label: 'Mental Health & Substance Abuse',
    problems: ['Suicide attempt', 'Mental health crisis', 'Drug abuse in community', 'Alcohol addiction', 'Youth drug abuse', 'Mental health facility unavailability'],
    keywords: ['mental health', 'suicide', 'drug abuse', 'alcohol addiction', 'substance abuse', 'depression', 'mental hospital'],
    depts: ['RIMS Psychiatry Dept', 'Dept of Psychology', 'NIMHANS Regional'],
  },
  {
    id: 'hospital_infrastructure',
    label: 'Hospital & Healthcare Infrastructure',
    problems: ['Hospital building damaged', 'PHC not functional', 'CHC equipment broken', 'No doctor in rural hospital', 'Ambulance not available', 'Blood bank shortage'],
    keywords: ['hospital', 'phc', 'chc', 'primary health', 'ambulance', 'blood bank', 'hospital equipment', 'rural hospital', 'doctor shortage'],
    depts: ['RIMS Ranchi', 'Jharkhand Health Dept', 'NHM Jharkhand'],
  },

  // ─── EDUCATION ───────────────────────────────────────────────────────────
  {
    id: 'education',
    label: 'Education & School Infrastructure',
    problems: ['School building damaged', 'No classroom', 'Teacher shortage', 'Student dropout', 'No mid-day meal', 'Toilet not available', 'No electricity in school'],
    keywords: ['school', 'classroom', 'teacher', 'student dropout', 'mid day meal', 'school toilet', 'school building', 'vidyalaya', 'pathshala'],
    depts: ['Dept of Educational Technology', 'Jharkhand Education Dept', 'SSA Jharkhand'],
  },
  {
    id: 'digital_education',
    label: 'Digital Education & E-Learning Access',
    problems: ['No internet in school', 'No computer lab', 'E-learning device shortage', 'Poor connectivity for online classes', 'Digital divide in tribal area'],
    keywords: ['digital education', 'e-learning', 'computer lab', 'internet school', 'online class', 'digital divide', 'smart class'],
    depts: ['Dept of Educational Technology', 'Dept of Computer Applications'],
  },
  {
    id: 'tribal_education',
    label: 'Tribal & Adivasi Education',
    problems: ['Tribal school dropout', 'Residential school poor condition', 'Language barrier in teaching', 'ST student access to education', 'Tribal residential school food'],
    keywords: ['tribal school', 'adivasi', 'residential school', 'st student', 'tribal education', 'eklavya school', 'hostel school'],
    depts: ['Dept of Tribal & Regional Languages (Ranchi University)', 'Jharkhand Tribal Welfare Dept'],
  },

  // ─── WOMEN, CHILDREN & SOCIAL WELFARE ──────────────────────────────────
  {
    id: 'women_child_safety',
    label: 'Women & Child Safety',
    problems: ['Domestic violence', 'Child abuse', 'Missing children', 'Human trafficking', 'Child labour', 'Harassment', 'Unsafe public spaces', 'Girl education dropout'],
    keywords: ['women safety', 'child safety', 'child abuse', 'missing children', 'trafficking', 'child labour', 'harassment', 'anganwadi', 'girl education'],
    depts: ['Dept of Social Work & Gender Studies', 'Dept of Child Development', 'Jharkhand WCD'],
  },
  {
    id: 'child_labour',
    label: 'Child Labour & Exploitation',
    problems: ['Child working in factory', 'Child working in mine', 'Bonded child labour', 'Child domestic worker', 'Child porter', 'Child not in school due to work'],
    keywords: ['child labour', 'child work', 'child factory', 'bonded labour', 'child mine', 'child domestic'],
    depts: ['Dept of Labour', 'Jharkhand Child Labour Commission', 'NCPCR'],
  },
  {
    id: 'human_trafficking',
    label: 'Human Trafficking & Migration',
    problems: ['Trafficking of women', 'Trafficking of children', 'Migrant worker exploitation', 'False employment promise', 'Trafficking route', 'Rescued trafficking victims'],
    keywords: ['trafficking', 'human trafficking', 'migrant exploitation', 'false promise job', 'rescued', 'trafficking route'],
    depts: ['Dept of Social Work', 'Jharkhand Police Anti-Trafficking', 'CWC'],
  },
  {
    id: 'social_welfare',
    label: 'Social Welfare & Inclusion',
    problems: ['Elderly neglect', 'Disability accessibility', 'Social security not received', 'Pension not received', 'Tribal welfare scheme failure', 'BPL card exclusion'],
    keywords: ['elderly', 'disability', 'pension', 'tribal welfare', 'social security', 'bpl', 'vulnerable', 'inclusion'],
    depts: ['XISS Ranchi Social Welfare Wing', 'Dept of Tribal & Regional Languages'],
  },
  {
    id: 'tribal_rights',
    label: 'Tribal Rights & Land Disputes',
    problems: ['Tribal land alienation', 'Forest rights act violation', 'Gram sabha rights', 'PESA violation', 'Land encroachment on tribal land', 'Displacement without compensation'],
    keywords: ['tribal land', 'forest rights', 'gram sabha', 'pesa', 'adivasi', 'land alienation', 'tribal rights', 'displacement'],
    depts: ['Dept of Tribal Studies (Ranchi University)', 'XISS Ranchi', 'NTPC Social Wing'],
  },

  // ─── LAW ENFORCEMENT & PUBLIC SAFETY ────────────────────────────────────
  {
    id: 'law_public_safety',
    label: 'Law Enforcement & Public Safety',
    problems: ['Crime mapping', 'Missing persons', 'Police response', 'Crowd management', 'Women safety', 'Drug abuse', 'Illegal activities', 'Community policing'],
    keywords: ['crime', 'police', 'missing person', 'crowd management', 'surveillance', 'drug abuse', 'public safety', 'patrol'],
    depts: ['Dept of Criminology & Police Studies', 'Dept of Cybersecurity & Surveillance'],
  },
  {
    id: 'drug_abuse',
    label: 'Drug Abuse & Narcotics',
    problems: ['Drug dealing near school', 'Narcotics production site', 'Youth drug use', 'Poppy cultivation', 'Brown sugar supply', 'Drug rehabilitation need'],
    keywords: ['drug', 'drugs', 'narcotics', 'drug dealing', 'poppy', 'brown sugar', 'drug abuse', 'nasha'],
    depts: ['Jharkhand Police Narcotics', 'Dept of Criminology', 'Dept of Social Work'],
  },
  {
    id: 'illegal_activity',
    label: 'Illegal Activities & Land Use',
    problems: ['Illegal construction', 'Encroachment on government land', 'Illegal gambling', 'Prostitution racket', 'Hawking zone violation', 'Illegal slaughter'],
    keywords: ['illegal construction', 'encroachment', 'illegal', 'gambling', 'hawking', 'slaughter', 'unauthorized'],
    depts: ['Urban Local Body', 'Jharkhand Police', 'District Administration'],
  },

  // ─── GOVERNANCE & E-SERVICES ─────────────────────────────────────────────
  {
    id: 'egovernance_services',
    label: 'Government Services & E-Governance',
    problems: ['Citizen complaint not resolved', 'Government scheme not accessible', 'Certificate issuance delayed', 'Grievance redressal', 'Benefit delivery failure', 'Corruption in government office'],
    keywords: ['government scheme', 'grievance', 'certificate', 'pragya kendra', 'e-district', 'dbt', 'benefit', 'corruption'],
    depts: ['Dept of Computer Applications & E-Governance', 'NIC Jharkhand Cell'],
  },
  {
    id: 'corruption',
    label: 'Corruption & Government Fraud',
    problems: ['Bribery in government office', 'PDS corruption', 'Job card fraud', 'MGNREGA fund misuse', 'Fake beneficiary', 'Land record manipulation'],
    keywords: ['corruption', 'bribery', 'fraud', 'misuse', 'fake beneficiary', 'land record', 'mgnrega fraud', 'ration fraud'],
    depts: ['Jharkhand Vigilance Bureau', 'ACB Jharkhand', 'NIC Jharkhand'],
  },
  {
    id: 'land_record',
    label: 'Land Records & Property Disputes',
    problems: ['Wrong land record', 'Land boundary dispute', 'Encroachment on agricultural land', 'Property ownership dispute', 'Khatian error', 'Jamabandi issue'],
    keywords: ['land record', 'khatian', 'jamabandi', 'land dispute', 'boundary dispute', 'property', 'mutation', 'khata'],
    depts: ['Dept of Revenue & Land Reform', 'NIC Jharkhand', 'NLRMP Jharkhand'],
  },

  // ─── EMPLOYMENT & ECONOMY ────────────────────────────────────────────────
  {
    id: 'employment_livelihood',
    label: 'Employment & Livelihood',
    problems: ['Unemployment', 'Skill mismatch', 'Rural employment', 'MGNREGA not provided', 'Artisan income loss', 'MSME closure', 'Gig worker exploitation'],
    keywords: ['unemployment', 'job', 'employment', 'mgnrega', 'artisan', 'msme', 'gig worker', 'labour', 'livelihood'],
    depts: ['Dept of Management & Entrepreneurship', 'IIM Ranchi Incubation Center', 'JSLPS'],
  },
  {
    id: 'msme_artisan',
    label: 'MSME, Artisan & Handicraft Issues',
    problems: ['Artisan not getting market access', 'Handicraft quality issue', 'MSME raw material shortage', 'Tribal craft marketing', 'Cooperative society failure', 'Export certificate problem'],
    keywords: ['artisan', 'handicraft', 'msme', 'tribal craft', 'cooperative', 'handloom', 'bamboo craft', 'dokra', 'sohrai'],
    depts: ['Dept of Management', 'Jharkhand MSME Dept', 'JHHDC'],
  },
  {
    id: 'mgnrega_rural_employment',
    label: 'MGNREGA & Rural Employment Scheme',
    problems: ['Job card not issued', 'MGNREGA work not provided', 'MGNREGA wage not paid', 'Fake muster roll', 'Work quality poor', 'MGNREGA asset not created'],
    keywords: ['mgnrega', 'job card', 'nrega', 'wage payment', 'muster roll', 'rural work', 'hundred days'],
    depts: ['Dept of Rural Development', 'JSLPS', 'District Rural Development Agency'],
  },

  // ─── TELECOM & DIGITAL ──────────────────────────────────────────────────
  {
    id: 'telecom_connectivity',
    label: 'Telecommunications & Digital Connectivity',
    problems: ['No mobile network', 'Rural broadband gap', 'Network tower missing', 'Digital divide', 'Emergency communication failure', 'Public Wi-Fi not working'],
    keywords: ['mobile network', 'signal', 'tower', 'broadband', 'internet', 'digital divide', '5g', 'optical fiber', 'wifi'],
    depts: ['Dept of Electronics & Telecommunication Engineering', 'IIIT Ranchi Telecom Cell', 'BSNL Jharkhand'],
  },
  {
    id: 'cybersecurity_digital',
    label: 'Cybersecurity & Digital Fraud',
    problems: ['Cybercrime', 'Online fraud', 'Phishing', 'Identity theft', 'UPI fraud', 'OTP fraud', 'Data breach', 'Government system hacked'],
    keywords: ['cybercrime', 'phishing', 'online fraud', 'upi fraud', 'otp fraud', 'data breach', 'hacked', 'identity theft'],
    depts: ['Dept of Computer Science & Cybersecurity (IIIT Ranchi)', 'CDAC Security Cell'],
  },

  // ─── RURAL DEVELOPMENT ──────────────────────────────────────────────────
  {
    id: 'rural_development',
    label: 'Rural Development & Village Infrastructure',
    problems: ['Village road not built', 'Rural drinking water', 'Village electricity', 'Panchayat building', 'Rural housing (PMAY)', 'Village connectivity gap', 'Self-help group issues'],
    keywords: ['rural road', 'village', 'panchayat', 'rural housing', 'pmay', 'self-help group', 'gram sabha', 'rural electricity', 'gaon'],
    depts: ['Dept of Rural Development & Management', 'XISS Ranchi Rural Wing', 'DRDA'],
  },
  {
    id: 'housing_slum',
    label: 'Housing, Slum & Shelter Issues',
    problems: ['Inadequate housing', 'Slum demolition', 'PMAY house not built', 'Flood-damaged house', 'Homeless family', 'Kutcha house in flood zone'],
    keywords: ['housing', 'slum', 'pmay', 'kutcha house', 'homeless', 'flood house', 'shelter', 'jhopdi', 'tenement'],
    depts: ['Jharkhand Urban Development Authority', 'Dept of Rural Development', 'Housing Board Jharkhand'],
  },

  // ─── STRAY ANIMALS & ANIMAL WELFARE ────────────────────────────────────
  {
    id: 'stray_animals',
    label: 'Stray Animals & Animal Welfare',
    problems: ['Stray dog menace', 'Dog bite incident', 'Stray cattle on road', 'Animal accident', 'Rabies risk', 'Animal shelter overcrowding'],
    keywords: ['stray dog', 'dog bite', 'stray cattle', 'cow', 'bull', 'rabies', 'animal bite', 'animal shelter'],
    depts: ['Veterinary College Ranchi (BAU)', 'Dept of Animal Husbandry', 'Urban Local Body'],
  },
  {
    id: 'wildlife_human_conflict',
    label: 'Human-Wildlife Conflict',
    problems: ['Elephant raid on village', 'Crop raided by wild boar', 'Leopard in village', 'Monkey menace', 'Snake menace', 'Wildlife entering farmland'],
    keywords: ['elephant', 'wild boar', 'leopard', 'monkey', 'snake', 'wildlife conflict', 'elephant raid', 'hathi', 'jungali suar'],
    depts: ['Dept of Wildlife Science & Forestry (BAU)', 'Jharkhand Forest Dept', 'WWF India'],
  },

  // ─── HERITAGE & CULTURE ─────────────────────────────────────────────────
  {
    id: 'heritage_culture',
    label: 'Heritage, Culture & Historical Sites',
    problems: ['Heritage building damage', 'Archaeological site encroachment', 'Tribal cultural site damage', 'Historic temple/mosque damage', 'Museum neglect', 'Rock art site vandalism'],
    keywords: ['heritage', 'archaeological', 'historical', 'culture', 'monument', 'temple damage', 'tribal culture', 'rock art', 'museum'],
    depts: ['Dept of History & Archaeology', 'ASI Jharkhand', 'Jharkhand Tourism'],
  },
  {
    id: 'tourism_infrastructure',
    label: 'Tourism & Eco-Tourism Infrastructure',
    problems: ['Tourist site poor maintenance', 'Eco-tourism trail damage', 'Waterfall access road damage', 'Tourist facility closure', 'Forest guest house damage'],
    keywords: ['tourism', 'tourist', 'waterfall', 'eco tourism', 'tourist site', 'nature trail', 'hill station'],
    depts: ['Jharkhand Tourism', 'Dept of Forestry', 'Dept of Hospitality'],
  },

  // ─── SPECIAL TOPICS ─────────────────────────────────────────────────────
  {
    id: 'fire_incident',
    label: 'Fire & Structural Fire Incidents',
    problems: ['Building fire', 'Market fire', 'Slum fire', 'Factory fire', 'Forest fire', 'Electrical fire', 'Vehicle fire', 'Gas cylinder explosion'],
    keywords: ['fire', 'building fire', 'market fire', 'factory fire', 'gas explosion', 'cylinder blast', 'aag', 'burnt', 'smoke fire'],
    depts: ['Jharkhand Fire Service', 'Dept of Fire Engineering', 'District Disaster Management'],
  },
  {
    id: 'gas_leak',
    label: 'Gas Leakage & Chemical Spill',
    problems: ['LPG gas leak', 'Industrial gas leak', 'Chlorine gas leak', 'Ammonia leak', 'Pipeline gas leak', 'Chemical plant spill', 'Toxic fumes'],
    keywords: ['gas leak', 'lpg leak', 'gas smell', 'chemical spill', 'toxic fume', 'chlorine', 'ammonia', 'pipeline leak'],
    depts: ['Jharkhand Fire Service', 'Jharkhand Pollution Control Board', 'Dept of Chemical Engineering'],
  },
  {
    id: 'industrial_accident',
    label: 'Industrial Accident & Occupational Safety',
    problems: ['Factory accident', 'Worker injury at site', 'Construction site accident', 'Mine accident', 'Chemical plant accident', 'Crane collapse', 'Scaffolding fall'],
    keywords: ['factory accident', 'worker injury', 'construction accident', 'mine accident', 'industrial accident', 'scaffolding', 'crane collapse'],
    depts: ['Dept of Industrial Safety', 'IIT ISM Dhanbad', 'Jharkhand Labour Dept'],
  },
  {
    id: 'public_nuisance',
    label: 'Public Nuisance & Community Hygiene',
    problems: ['Pig farm near residential area', 'Open slaughterhouse', 'Stagnant garbage smell', 'Mosquito breeding site', 'Filthy public space', 'Illegal meat shop'],
    keywords: ['nuisance', 'pig farm', 'slaughterhouse', 'stagnant garbage', 'mosquito breeding', 'filth', 'smell', 'public hygiene'],
    depts: ['Urban Local Body', 'Dept of Public Health', 'Municipal Corporation'],
  },
  {
    id: 'market_infrastructure',
    label: 'Market & Commercial Infrastructure',
    problems: ['Vegetable market poor condition', 'Vendor encroachment', 'Market fire risk', 'No cold storage in market', 'Haat bazaar poor sanitation', 'Trader exploitation'],
    keywords: ['market', 'bazaar', 'vegetable market', 'vendor', 'haat', 'cold storage market', 'trader'],
    depts: ['Urban Local Body', 'Dept of Commerce', 'Jharkhand Agriculture Marketing'],
  },
  {
    id: 'public_park_space',
    label: 'Public Parks & Recreational Spaces',
    problems: ['Park not maintained', 'Park light broken', 'Children play area unsafe', 'Open gym broken', 'Public space encroached', 'Public toilet in park missing'],
    keywords: ['park', 'playground', 'open gym', 'recreational', 'garden', 'children play', 'public space'],
    depts: ['Urban Local Body', 'Dept of Urban Planning', 'Municipal Parks Wing'],
  },
  {
    id: 'cemetery_cremation',
    label: 'Cemetery, Cremation & Burial Sites',
    problems: ['Cremation ground flooding', 'Cemetery encroachment', 'No cremation facility in village', 'Illegal burial', 'Burial ground sanitation'],
    keywords: ['cremation', 'cemetery', 'burial', 'shamshan', 'kabristan', 'burial ground', 'cremation ghat'],
    depts: ['Urban Local Body', 'District Administration', 'Dept of Public Health'],
  },
  {
    id: 'groundwater_quality',
    label: 'Groundwater Depletion & Quality',
    problems: ['Borewell water black', 'Handpump water smelly', 'Groundwater level low', 'Aquifer contamination', 'Over-extraction', 'Groundwater monitoring'],
    keywords: ['groundwater', 'borewell', 'handpump', 'aquifer', 'water level', 'tube well', 'kuan', 'ground water'],
    depts: ['Dept of Hydrogeology', 'CGWB', 'Jharkhand Jal Sansthan'],
  },
  {
    id: 'urban_heat',
    label: 'Urban Heat & Heatwave',
    problems: ['Extreme heat in city', 'No shade/tree cover', 'Heat-related illness', 'Heatwave deaths', 'No drinking water in heat', 'Urban concrete heat'],
    keywords: ['heat wave', 'extreme heat', 'heatwave', 'heat death', 'urban heat', 'shade', 'drinking water heat'],
    depts: ['Dept of Atmospheric Sciences', 'Jharkhand Health Dept', 'IMD Regional Center'],
  },
  {
    id: 'winter_cold_wave',
    label: 'Cold Wave & Winter Hardship',
    problems: ['Cold wave deaths', 'Homeless in winter', 'No blanket distribution', 'Cold wave crop damage', 'Road fog accident', 'Night shelter not available'],
    keywords: ['cold wave', 'sheetlahar', 'cold wave death', 'homeless winter', 'blanket', 'fog', 'road fog', 'night shelter'],
    depts: ['Jharkhand Disaster Management', 'Jharkhand Health Dept', 'Social Welfare Dept'],
  },
  {
    id: 'sports_infrastructure',
    label: 'Sports & Youth Infrastructure',
    problems: ['Playground damaged', 'Sports ground encroached', 'No sports facility in village', 'Stadium in poor condition', 'Sports equipment missing'],
    keywords: ['playground', 'sports', 'stadium', 'cricket ground', 'football', 'sports facility', 'youth'],
    depts: ['Jharkhand Sports Authority', 'Dept of Sports Science', 'SAI Regional Center'],
  },
  {
    id: 'gender_discrimination',
    label: 'Gender Discrimination & Inequality',
    problems: ['Workplace gender discrimination', 'Pay gap', 'Girl child discrimination', 'Dowry harassment', 'Early marriage', 'Female foeticide'],
    keywords: ['gender discrimination', 'pay gap', 'dowry', 'early marriage', 'female foeticide', 'sex ratio', 'gender bias'],
    depts: ['Dept of Gender Studies', 'Jharkhand Women Commission', 'WCD Jharkhand'],
  },
  {
    id: 'religious_communal',
    label: 'Religious & Communal Harmony',
    problems: ['Communal tension', 'Religious site dispute', 'Hate speech incident', 'Communal violence', 'Religious procession conflict', 'Minority community issue'],
    keywords: ['communal', 'religious tension', 'religious dispute', 'communal violence', 'minority', 'harmony'],
    depts: ['Jharkhand Police', 'District Administration', 'Minority Welfare Dept'],
  },
  {
    id: 'migrant_worker',
    label: 'Migrant Worker & Labour Issues',
    problems: ['Migrant worker stranded', 'Unpaid wages', 'Labour camp poor condition', 'Migrant worker health', 'Child migrant', 'Trafficking disguised as migration'],
    keywords: ['migrant worker', 'labour camp', 'unpaid wages', 'worker stranded', 'migrant', 'pravasi majdoor'],
    depts: ['Dept of Labour', 'JSLPS', 'Dept of Social Work'],
  },
  {
    id: 'cooperative_self_help',
    label: 'Cooperative & Self-Help Group (SHG) Issues',
    problems: ['SHG fund misuse', 'Cooperative bank failure', 'SHG loan not repaid', 'SHG group conflict', 'Cooperative dissolution'],
    keywords: ['self help group', 'shg', 'cooperative', 'microfinance', 'shg fund', 'women shg', 'jslps'],
    depts: ['JSLPS', 'Dept of Rural Development', 'NABARD Jharkhand'],
  },
  {
    id: 'research_innovation',
    label: 'Research, Innovation & Technology',
    problems: ['Lab equipment damage', 'Research funding gap', 'Innovation center closure', 'Prototype testing failure', 'Technology transfer', 'Student research support'],
    keywords: ['research', 'innovation', 'lab equipment', 'prototype', 'technology transfer', 'incubation', 'startup lab'],
    depts: ['IIT ISM Dhanbad', 'BIT Mesra', 'NIT Jamshedpur', 'IIIT Ranchi'],
  },
  {
    id: 'ngo_civil_society',
    label: 'NGO & Civil Society Issues',
    problems: ['NGO fraud', 'CSR fund misuse', 'NGO scheme not delivered', 'Civil society suppression', 'Volunteer safety'],
    keywords: ['ngo', 'civil society', 'csr', 'volunteer', 'charity fraud', 'ngo fund'],
    depts: ['Jharkhand Social Welfare', 'Dept of Public Administration', 'District Administration'],
  },
  {
    id: 'funeral_mortuary',
    label: 'Mortuary & Dead Body Management',
    problems: ['Unclaimed dead body', 'Mortuary overflow', 'Post-mortem facility absent', 'Dead body not identified', 'Funeral support for destitute'],
    keywords: ['dead body', 'mortuary', 'unclaimed body', 'post mortem', 'funeral', 'body identification'],
    depts: ['RIMS Ranchi Mortuary', 'District Administration', 'Jharkhand Police'],
  },
  {
    id: 'public_toilet',
    label: 'Public Toilet & Pay & Use Facilities',
    problems: ['Public toilet locked', 'Public toilet dirty', 'No public toilet for women', 'Toilet fee exploitation', 'Mobile toilet breakdown', 'Toilet near religious site'],
    keywords: ['public toilet', 'pay use toilet', 'women toilet', 'mobile toilet', 'toilet locked', 'shauchalaya', 'sukoon'],
    depts: ['Urban Local Body', 'Swachh Bharat Mission', 'Dept of Public Health'],
  },
  {
    id: 'cultural_program',
    label: 'Cultural Events & Public Gathering Management',
    problems: ['Mela overcrowding', 'Stampede risk', 'Cultural event safety', 'Crowd management failure', 'Event cleanup not done', 'Noise/traffic during event'],
    keywords: ['mela', 'fair', 'cultural event', 'stampede', 'crowd', 'festival', 'kumbh', 'gathering'],
    depts: ['District Administration', 'Jharkhand Police', 'Jharkhand Tourism'],
  },
  {
    id: 'weather_monitoring',
    label: 'Weather Monitoring & Early Warning',
    problems: ['No weather station in area', 'Inaccurate weather forecast affecting farmers', 'Early warning not received', 'Hailstorm crop damage', 'Lightning strike death'],
    keywords: ['weather', 'forecast', 'hailstorm', 'lightning', 'early warning', 'weather station', 'lightning strike', 'ole'],
    depts: ['IMD Regional Center', 'Dept of Atmospheric Sciences', 'NDMA'],
  },
  {
    id: 'smart_city',
    label: 'Smart City & Urban Technology',
    problems: ['Smart city project not delivered', 'CCTV camera not working', 'Smart parking failure', 'Smart light failure', 'City Wi-Fi breakdown', 'Smart waste bin not emptied'],
    keywords: ['smart city', 'cctv', 'smart parking', 'smart light', 'city wifi', 'smart bin', 'iot city'],
    depts: ['Smart City Mission', 'Dept of Urban Planning', 'Jharkhand IT Dept'],
  },
  {
    id: 'child_marriage',
    label: 'Child Marriage & Early Marriage',
    problems: ['Child marriage occurring', 'Early marriage of girl child', 'School dropout due to marriage', 'Marriage before 18', 'Kanya Vivah scheme misuse'],
    keywords: ['child marriage', 'early marriage', 'bal vivah', 'kanya vivah', 'underage marriage'],
    depts: ['WCD Jharkhand', 'Dept of Child Development', 'Jharkhand Police'],
  },
  {
    id: 'public_property_vandalism',
    label: 'Public Property Vandalism & Damage',
    problems: ['Government building vandalized', 'Public bench broken', 'Bus shelter damaged', 'Statue vandalized', 'Street art destroyed', 'Public toilet vandalism'],
    keywords: ['vandalism', 'vandalised', 'broken bench', 'bus shelter', 'graffiti', 'statue damage', 'public property damage'],
    depts: ['Urban Local Body', 'Jharkhand Police', 'District Administration'],
  },
  {
    id: 'environment_clearance',
    label: 'Environmental Clearance & Compliance',
    problems: ['Factory operating without clearance', 'EIA violation', 'Green zone violation', 'Forest clearance violation', 'Pollution control violation'],
    keywords: ['environmental clearance', 'eia', 'green zone', 'forest clearance', 'pollution control', 'compliance'],
    depts: ['Jharkhand State Pollution Control Board', 'MoEFCC', 'Dept of Environmental Engineering'],
  },
  {
    id: 'labour_rights',
    label: 'Labour Rights & Worker Exploitation',
    problems: ['Worker underpaid', 'Contract labour exploitation', 'No safety equipment at work', 'Bonded labour', 'Worker dismissed unfairly', 'No PF/ESI for workers'],
    keywords: ['labour rights', 'worker', 'underpaid', 'contract labour', 'bonded labour', 'pf', 'esi', 'worker safety'],
    depts: ['Dept of Labour', 'Jharkhand Labour Commission', 'JSLPS'],
  },
  {
    id: 'railway_infrastructure',
    label: 'Railway Infrastructure & Station Issues',
    problems: ['Station building dilapidated', 'Platform flooding', 'No waiting room', 'Railway toilet broken', 'Track encroachment near station', 'Platform light broken'],
    keywords: ['railway station', 'station platform', 'railway toilet', 'station light', 'waiting room', 'train station'],
    depts: ['East Central Railway', 'South Eastern Railway'],
  },
  {
    id: 'financial_inclusion',
    label: 'Financial Inclusion & Banking Access',
    problems: ['No bank in village', 'ATM not working', 'BC sakhi not available', 'Jan Dhan account issue', 'Bank fraud', 'Loan denial to farmer/tribal'],
    keywords: ['bank', 'atm', 'bc sakhi', 'jan dhan', 'financial inclusion', 'rural bank', 'banking', 'loan'],
    depts: ['Dept of Financial Economics', 'IIM Ranchi Banking Cell', 'NABARD Jharkhand'],
  },
  {
    id: 'pension_welfare_scheme',
    label: 'Pension & Welfare Scheme Delivery',
    problems: ['Old age pension not received', 'Disability pension not received', 'Widow pension not received', 'PM Kisan not credited', 'Scheme benefit not transferred'],
    keywords: ['pension', 'old age pension', 'widow pension', 'disability pension', 'pm kisan', 'scheme', 'benefit'],
    depts: ['Jharkhand Social Welfare Dept', 'District Administration', 'DBT Jharkhand'],
  },
  {
    id: 'air_transport',
    label: 'Air Transport & Airport Issues',
    problems: ['Airport connectivity issue', 'Flight disruption', 'Airport security concern', 'Helipad condition', 'Drone activity near airport'],
    keywords: ['airport', 'flight', 'airline', 'helipad', 'drone', 'aviation'],
    depts: ['AAI', 'Jharkhand Civil Aviation', 'Dept of Transport'],
  },
  {
    id: 'school_safety',
    label: 'School Safety & Child Protection',
    problems: ['School building collapsed', 'Roof fallen in school', 'School in flood zone', 'No boundary wall in school', 'Child bullying in school', 'School near highway danger'],
    keywords: ['school safety', 'school building', 'school roof', 'school flood', 'boundary wall', 'school highway', 'child school'],
    depts: ['Jharkhand Education Dept', 'SSA Jharkhand', 'Dept of Structural Engineering'],
  },
];
