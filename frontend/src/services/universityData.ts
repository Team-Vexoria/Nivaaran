/**
 * NIVAARAN — Jharkhand Higher Education Institution (HEI) Dataset
 * Real-world data for 30 institutions sourced from:
 *   - iitism.ac.in, nitjsr.ac.in, bitmesra.ac.in, cuj.ac.in
 *   - ranchiuniversity.ac.in, vbu.ac.in, skmu.ac.in, xlri.ac.in
 *   - bbmku.ac.in, dspmuranchi.ac.in, jrsu.ac.in, bau.ac.in, nifft.ac.in
 *   - iimranchi.ac.in, nusrlranchi.ac.in
 *   - Private universities: AISECT, Arka Jain, Capital, ICFAI, Netaji Subhas,
 *     Radha Govind, Sarala Birla, Srinath, Usha Martin, YBN, Pragyan, Amity
 *   - NIRF Rankings 2024–25, UGC institutional profiles
 *
 * Used by heiMatchingEngine.ts for challenge-to-university matching.
 */

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  headOfDept: string;      // Real designation, not fictitious names
  activeLabs: string[];
  capabilities: string[];
}

export interface FacultyMentor {
  id: string;
  name: string;
  departmentId: string;
  designation: string;
  specialization: string[];
  activeProjectsCount: number;
  email: string;
}

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNumber: string;
  departmentId: string;
  year: '3rd Year' | '4th Year' | 'M.Tech' | 'Ph.D';
  skills: string[];
  cgpa: number;
  assignedProjectId?: string;
  creditsEarned: number;
}

export interface UniversityDoc {
  id: string;
  name: string;
  shortName: string;
  district: string;
  city: string;
  type: 'Central University' | 'National Institute' | 'State University' | 'Deemed University' | 'Institute of National Importance';
  nirfRank?: string;         // NIRF 2024-25 ranking where available
  website: string;
  departments: DepartmentInfo[];
  faculty: FacultyMentor[];
  students: StudentRosterItem[];
  supportedDomains: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// JHARKHAND HEI REGISTRY
// Sources: Official university websites + NIRF 2024-25 + UGC database
// ─────────────────────────────────────────────────────────────────────────────

export const JHARKHAND_UNIVERSITIES: UniversityDoc[] = [

  // ── 1. IIT (ISM) Dhanbad ─────────────────────────────────────────────────
  // India's premier mining/geology institution; NIRF Engineering #9 (2024)
  {
    id: 'UNI-IIT-ISM-DHANBAD',
    name: 'Indian Institute of Technology (Indian School of Mines), Dhanbad',
    shortName: 'IIT (ISM) Dhanbad',
    district: 'Dhanbad',
    city: 'Dhanbad',
    type: 'Institute of National Importance',
    nirfRank: 'Engineering #9 (NIRF 2024)',
    website: 'https://www.iitism.ac.in',
    supportedDomains: [
      'Mining & Mineral Resources', 'Disaster Management', 'Environment', 'Water Resources',
      'Energy', 'Infrastructure', 'Geospatial Technology', 'Public Health', 'Agriculture'
    ],
    departments: [
      {
        id: 'DEPT-ISM-MINING',
        name: 'Department of Mining Engineering',
        code: 'MIN',
        headOfDept: 'Head of Department, Mining Engineering',
        activeLabs: [
          'Rock Mechanics & Mine Design Lab',
          'Mine Automation & Safety Lab',
          'Mine Ventilation & Gas Dynamics Lab',
          'Surface Mining Technology Lab',
        ],
        capabilities: [
          'Underground Mining Design', 'Surface Mining Technology', 'Mine Safety Assessment',
          'Rock Mechanics Analysis', 'Mine Automation', 'Slope Stability Analysis',
          'Subsidence Prediction', 'Blast Design Optimization'
        ],
      },
      {
        id: 'DEPT-ISM-ENV',
        name: 'Department of Environmental Science & Engineering',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science & Engineering',
        activeLabs: [
          'Air Quality Monitoring & Modelling Lab',
          'Water Quality Analysis & Treatment Lab',
          'Solid & Hazardous Waste Management Lab',
          'Environmental Impact Assessment Unit',
        ],
        capabilities: [
          'Air Pollution Monitoring', 'Water Quality Testing', 'Effluent Treatment',
          'Environmental Impact Assessment', 'Coal Dust & Particulate Analysis',
          'Groundwater Contamination Study', 'Fly Ash Utilization Research'
        ],
      },
      {
        id: 'DEPT-ISM-GEO',
        name: 'Department of Applied Geology',
        code: 'GEO',
        headOfDept: 'Head of Department, Applied Geology',
        activeLabs: [
          'Remote Sensing & GIS Lab',
          'Hydrogeology & Groundwater Lab',
          'Geomorphology & Terrain Analysis Unit',
          'Mineral Characterization Lab',
        ],
        capabilities: [
          'Geological Mapping', 'Remote Sensing Analysis', 'Hydrogeological Investigation',
          'Groundwater Resource Assessment', 'Landslide Hazard Zonation',
          'Flood Plain Mapping', 'Mineral Resource Evaluation'
        ],
      },
      {
        id: 'DEPT-ISM-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Head of Department, Civil Engineering',
        activeLabs: [
          'Structural Engineering Lab',
          'Geotechnical Engineering Lab',
          'Transportation Engineering Lab',
          'Environmental & Water Resources Lab',
        ],
        capabilities: [
          'Structural Analysis', 'Geotechnical Investigation', 'Road & Highway Design',
          'Bridge Engineering', 'Water Supply & Sanitation Design', 'Drainage Engineering',
          'Soil Stabilization', 'Construction Materials Testing'
        ],
      },
      {
        id: 'DEPT-ISM-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, Computer Science & Engineering',
        activeLabs: [
          'AI & Machine Learning Lab',
          'Data Analytics & Mining Lab',
          'IoT & Embedded Systems Lab',
          'Cybersecurity Research Lab',
        ],
        capabilities: [
          'AI/ML Model Development', 'Big Data Analytics', 'IoT System Design',
          'Predictive Modelling', 'Smart Sensor Networks', 'Data-Driven Decision Systems'
        ],
      },
      {
        id: 'DEPT-ISM-PETROLEUM',
        name: 'Department of Petroleum Engineering',
        code: 'PET',
        headOfDept: 'Head of Department, Petroleum Engineering',
        activeLabs: [
          'Reservoir Engineering Lab',
          'Drilling Technology Lab',
          'Production Technology Lab',
        ],
        capabilities: [
          'Reservoir Characterization', 'Drilling Optimization', 'Enhanced Oil Recovery',
          'Energy Resource Mapping', 'Subsurface Fluid Flow Analysis'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-ISM-01',
        name: 'Faculty — Mining Engineering Dept',
        departmentId: 'DEPT-ISM-MINING',
        designation: 'Professor',
        specialization: ['Underground Mining', 'Rock Mechanics', 'Mine Safety'],
        activeProjectsCount: 3,
        email: 'hod.min@iitism.ac.in',
      },
      {
        id: 'FAC-ISM-02',
        name: 'Faculty — Environmental Science Dept',
        departmentId: 'DEPT-ISM-ENV',
        designation: 'Associate Professor',
        specialization: ['Water Quality', 'Environmental Impact Assessment', 'Effluent Treatment'],
        activeProjectsCount: 2,
        email: 'hod.env@iitism.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-ISM-01', name: 'Student A', rollNumber: '21ME001',
        departmentId: 'DEPT-ISM-CIVIL', year: '4th Year',
        skills: ['AutoCAD', 'STAAD Pro', 'GIS'], cgpa: 8.4, creditsEarned: 140,
      },
      {
        id: 'STU-ISM-02', name: 'Student B', rollNumber: '22CS001',
        departmentId: 'DEPT-ISM-CSE', year: '3rd Year',
        skills: ['Python', 'ML', 'IoT'], cgpa: 8.9, creditsEarned: 100,
      },
    ],
  },

  // ── 2. NIT Jamshedpur ────────────────────────────────────────────────────
  // NIRF Engineering #42 (2025); real labs from nitjsr.ac.in/dept/research_lab
  {
    id: 'UNI-NIT-JAMSHEDPUR',
    name: 'National Institute of Technology Jamshedpur',
    shortName: 'NIT Jamshedpur',
    district: 'East Singhbhum (Jamshedpur)',
    city: 'Jamshedpur',
    type: 'National Institute',
    nirfRank: 'Overall #51 | Engineering #42 (NIRF 2025)',
    website: 'https://www.nitjsr.ac.in',
    supportedDomains: [
      'Infrastructure', 'Water Resources', 'Energy', 'Manufacturing', 'Smart Cities',
      'Disaster Management', 'Environment', 'Healthcare Technology'
    ],
    departments: [
      {
        id: 'DEPT-NITJ-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Head of Department, Civil Engineering',
        activeLabs: [
          'Structural Engineering Lab',
          'Concrete Technology Lab',
          'Transportation Engineering Lab',
          'Geotechnical Engineering Lab',
          'Environmental Engineering Lab',
          'Water Resources Engineering Lab',
          'Remote Sensing & GIS Lab',
        ],
        capabilities: [
          'Structural Analysis & Design', 'Concrete Mix Design', 'Pavement Design',
          'Geotechnical Investigation', 'Water Quality Analysis', 'Hydraulic Modelling',
          'Flood Risk Assessment', 'Remote Sensing & GIS Applications',
          'Environmental Impact Assessment', 'Bridge Design'
        ],
      },
      {
        id: 'DEPT-NITJ-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, Computer Science & Engineering',
        activeLabs: [
          'Data Science Lab',
          'Machine Learning Lab',
          'Advanced Computing Lab',
          'Machine Vision Lab',
          'Network Security Lab',
          'High Performance Computing (HPC) Lab',
          'IoT Lab',
          'Artificial Intelligence Lab',
        ],
        capabilities: [
          'Data Science & Analytics', 'Machine Learning', 'Computer Vision',
          'IoT System Development', 'Cybersecurity', 'AI Application Development',
          'High-Performance Computing', 'Predictive Analytics'
        ],
      },
      {
        id: 'DEPT-NITJ-EE',
        name: 'Department of Electrical Engineering',
        code: 'EE',
        headOfDept: 'Head of Department, Electrical Engineering',
        activeLabs: [
          'Power Systems Lab',
          'Power Electronics Lab',
          'Electrical Machines Lab',
          'Control System Lab',
          'High Voltage Engineering Lab',
          'Renewable Energy Lab',
        ],
        capabilities: [
          'Power Systems Analysis', 'Smart Grid Technology', 'Power Electronics Design',
          'Renewable Energy Systems', 'High Voltage Testing', 'Motor Control Systems',
          'Energy Audit & Management'
        ],
      },
      {
        id: 'DEPT-NITJ-ME',
        name: 'Department of Mechanical Engineering',
        code: 'ME',
        headOfDept: 'Head of Department, Mechanical Engineering',
        activeLabs: [
          'Heat Transfer & Fluid Mechanics Lab',
          'Computational Fluid Dynamics (CFD) Lab',
          'Manufacturing Technology Lab',
          'Robotics & Automation Lab',
          'Advanced Manufacturing Lab',
        ],
        capabilities: [
          'Thermal Systems Design', 'CFD Simulation', 'Manufacturing Process Optimization',
          'Robotics & Automation', 'Product Design & Prototyping', 'Industrial Process Improvement'
        ],
      },
      {
        id: 'DEPT-NITJ-META',
        name: 'Department of Metallurgical & Materials Engineering',
        code: 'MET',
        headOfDept: 'Head of Department, Metallurgical & Materials Engineering',
        activeLabs: [
          'Materials Characterization Lab',
          'Nano Materials Lab',
          'Corrosion Engineering Lab',
          'Extractive Metallurgy Lab',
        ],
        capabilities: [
          'Material Testing & Characterization', 'Nanomaterials Research',
          'Corrosion Prevention', 'Metal Extraction & Processing', 'Alloy Development'
        ],
      },
      {
        id: 'DEPT-NITJ-ECE',
        name: 'Department of Electronics & Communication Engineering',
        code: 'ECE',
        headOfDept: 'Head of Department, Electronics & Communication Engineering',
        activeLabs: [
          'VLSI Design Lab',
          'Signal Processing Lab',
          'Embedded Systems Lab',
          'Communication Systems Lab',
        ],
        capabilities: [
          'VLSI Circuit Design', 'Digital Signal Processing', 'Embedded System Development',
          'Wireless Communication', 'Sensor Design', 'Communication Network Design'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-NITJ-01',
        name: 'Faculty — Civil Engineering Dept',
        departmentId: 'DEPT-NITJ-CIVIL',
        designation: 'Professor',
        specialization: ['Hydraulics', 'Water Resources', 'Flood Management'],
        activeProjectsCount: 2,
        email: 'hod.civil@nitjsr.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NITJ-01', name: 'Student C', rollNumber: '22CE001',
        departmentId: 'DEPT-NITJ-CIVIL', year: '4th Year',
        skills: ['AutoCAD', 'MATLAB', 'ArcGIS'], cgpa: 8.6, creditsEarned: 138,
      },
    ],
  },

  // ── 3. BIT Mesra, Ranchi ─────────────────────────────────────────────────
  // Deemed University est. 1955; bitmesra.ac.in
  {
    id: 'UNI-BIT-MESRA',
    name: 'Birla Institute of Technology, Mesra',
    shortName: 'BIT Mesra',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'Deemed University',
    nirfRank: 'Engineering #51-75 band (NIRF 2024)',
    website: 'https://www.bitmesra.ac.in',
    supportedDomains: [
      'Disaster Management', 'Water Resources', 'Environment', 'Smart Cities',
      'Healthcare Technology', 'Agriculture', 'Education Technology', 'Energy'
    ],
    departments: [
      {
        id: 'DEPT-BIT-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Head of Department, Civil Engineering',
        activeLabs: [
          'Hydraulics & Fluid Mechanics Lab',
          'Geotechnical Engineering Lab',
          'Environmental Engineering Lab',
          'Surveying & Geomatics Lab',
        ],
        capabilities: [
          'Canal & Drainage System Design', 'Flood Barrier Engineering', 'Culvert Design',
          'Soil Stabilization', 'Water Supply Network Design', 'Sanitation Infrastructure',
          'Structural Health Monitoring'
        ],
      },
      {
        id: 'DEPT-BIT-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, Computer Science & Engineering',
        activeLabs: [
          'AI & Machine Learning Lab',
          'IoT & Sensor Networks Lab',
          'Mobile Computing Lab',
          'Cybersecurity Lab',
        ],
        capabilities: [
          'AI Early Warning Systems', 'Mobile Citizen Tracking Apps', 'IoT Sensor Networks',
          'Data Analytics', 'Smart City Solutions', 'E-Governance Platforms'
        ],
      },
      {
        id: 'DEPT-BIT-ECE',
        name: 'Department of Electronics & Communication Engineering',
        code: 'ECE',
        headOfDept: 'Head of Department, Electronics & Communication Engineering',
        activeLabs: [
          'VLSI & Embedded Systems Lab',
          'Signal Processing Lab',
          'Wireless Communication Lab',
        ],
        capabilities: [
          'Embedded System Design', 'Sensor Integration', 'Wireless Sensor Networks',
          'Communication Systems for Rural Connectivity', 'VLSI Design'
        ],
      },
      {
        id: 'DEPT-BIT-ENV',
        name: 'Department of Environmental Science & Engineering',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science & Engineering',
        activeLabs: [
          'Water Quality & Analysis Lab',
          'Air Pollution Monitoring Lab',
          'Solid Waste Management Lab',
        ],
        capabilities: [
          'Water Contamination Analysis', 'Arsenic & Fluoride Filtration',
          'Industrial Effluent Testing', 'Air Quality Monitoring', 'Waste Management Solutions'
        ],
      },
      {
        id: 'DEPT-BIT-GIS',
        name: 'Department of Remote Sensing & GIS',
        code: 'GIS',
        headOfDept: 'Head of Department, Remote Sensing & GIS',
        activeLabs: [
          'GIS & Satellite Imagery Lab',
          'Drone Survey & Photogrammetry Lab',
          'Disaster Risk Mapping Unit',
        ],
        capabilities: [
          'Flood Inundation Mapping', 'Satellite Imagery Analysis', 'Drone Surveys',
          'Landslide Vulnerability Mapping', 'Crop Health Assessment', 'Urban Growth Monitoring'
        ],
      },
      {
        id: 'DEPT-BIT-BIO',
        name: 'Department of Biotechnology',
        code: 'BIO',
        headOfDept: 'Head of Department, Biotechnology',
        activeLabs: [
          'Molecular Biology Lab',
          'Bioremediation Lab',
          'Agricultural Biotechnology Lab',
        ],
        capabilities: [
          'Bioremediation of Contaminated Sites', 'Crop Improvement', 'Biopesticide Development',
          'Water Microbiology', 'Disease Diagnostics'
        ],
      },
      {
        id: 'DEPT-BIT-EEE',
        name: 'Department of Electrical & Electronics Engineering',
        code: 'EEE',
        headOfDept: 'Head of Department, Electrical & Electronics Engineering',
        activeLabs: [
          'Power Systems Lab',
          'Renewable Energy Systems Lab',
          'Smart Grid Lab',
        ],
        capabilities: [
          'Solar/Wind Energy Systems', 'Rural Electrification', 'Smart Grid Implementation',
          'Power System Protection', 'Energy Audit'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-BIT-01',
        name: 'Faculty — Remote Sensing & GIS Dept',
        departmentId: 'DEPT-BIT-GIS',
        designation: 'Professor',
        specialization: ['Flood Mapping', 'Satellite Remote Sensing', 'Disaster Risk Zonation'],
        activeProjectsCount: 3,
        email: 'hod.gis@bitmesra.ac.in',
      },
      {
        id: 'FAC-BIT-02',
        name: 'Faculty — Environmental Science Dept',
        departmentId: 'DEPT-BIT-ENV',
        designation: 'Associate Professor',
        specialization: ['Water Quality', 'Effluent Treatment', 'Environmental Monitoring'],
        activeProjectsCount: 2,
        email: 'hod.env@bitmesra.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-BIT-01', name: 'Student D', rollNumber: '22GIS001',
        departmentId: 'DEPT-BIT-GIS', year: 'M.Tech',
        skills: ['ArcGIS', 'QGIS', 'Python', 'Drone Operation'], cgpa: 8.7, creditsEarned: 48,
      },
    ],
  },

  // ── 4. Central University of Jharkhand ───────────────────────────────────
  // Established under Parliament Act No. 25 of 2009; cuj.ac.in
  {
    id: 'UNI-CUJ-RANCHI',
    name: 'Central University of Jharkhand',
    shortName: 'CUJ',
    district: 'Ranchi',
    city: 'Ranchi (Brambe)',
    type: 'Central University',
    website: 'https://www.cuj.ac.in',
    supportedDomains: [
      'Tribal Welfare', 'Education Technology', 'Healthcare Technology', 'Environment',
      'Agriculture', 'Social Governance', 'Water Resources', 'Energy'
    ],
    departments: [
      {
        id: 'DEPT-CUJ-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Software Development Lab',
          'AI & Data Science Lab',
          'Cyber Security Lab',
        ],
        capabilities: [
          'E-Governance Platform Development', 'AI-Driven Applications',
          'Mobile App Development', 'Data Science', 'Cybersecurity',
          'Community-Facing Digital Solutions'
        ],
      },
      {
        id: 'DEPT-CUJ-ECE',
        name: 'Department of Electronics & Communication Engineering',
        code: 'ECE',
        headOfDept: 'Head of Department, ECE',
        activeLabs: [
          'Embedded Systems Lab',
          'Communication Networks Lab',
        ],
        capabilities: [
          'Low-Cost Sensor Development', 'Rural Communication Infrastructure',
          'Embedded System Prototyping', 'IoT for Rural Applications'
        ],
      },
      {
        id: 'DEPT-CUJ-ENV',
        name: 'School of Natural Sciences — Environmental Science',
        code: 'ENV',
        headOfDept: 'Head, Environmental Science Programme',
        activeLabs: [
          'Environmental Analysis Lab',
          'Biodiversity & Ecology Lab',
        ],
        capabilities: [
          'Biodiversity Assessment', 'Ecological Impact Studies',
          'Tribal Forest Rights Research', 'Water Body Conservation',
          'Environmental Education'
        ],
      },
      {
        id: 'DEPT-CUJ-SOC',
        name: 'School of Social Sciences',
        code: 'SOC',
        headOfDept: 'Head, Social Sciences',
        activeLabs: [
          'Social Research & Survey Unit',
          'Community Development Lab',
        ],
        capabilities: [
          'Community Needs Assessment', 'Tribal Welfare Research',
          'Social Impact Measurement', 'Participatory Rural Appraisal',
          'Policy Research & Analysis', 'Gender & Inclusion Studies'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-CUJ-01',
        name: 'Faculty — Social Sciences Dept',
        departmentId: 'DEPT-CUJ-SOC',
        designation: 'Associate Professor',
        specialization: ['Tribal Welfare', 'Community Development', 'Social Impact Assessment'],
        activeProjectsCount: 2,
        email: 'soc@cuj.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-CUJ-01', name: 'Student E', rollNumber: '22CSE001',
        departmentId: 'DEPT-CUJ-CSE', year: '4th Year',
        skills: ['React', 'Node.js', 'Machine Learning'], cgpa: 8.2, creditsEarned: 136,
      },
    ],
  },

  // ── 5. Ranchi University ─────────────────────────────────────────────────
  // Established 1960; largest affiliating university in Jharkhand
  {
    id: 'UNI-RANCHI-UNIVERSITY',
    name: 'Ranchi University',
    shortName: 'RU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://ranchiuniversity.ac.in',
    supportedDomains: [
      'Healthcare', 'Agriculture', 'Environment', 'Tribal Welfare',
      'Education', 'Social Governance', 'Water Resources'
    ],
    departments: [
      {
        id: 'DEPT-RU-GEO',
        name: 'Department of Geography',
        code: 'GEO',
        headOfDept: 'Head of Department, Geography',
        activeLabs: [
          'Cartography & Remote Sensing Lab',
          'GIS Application Lab',
        ],
        capabilities: [
          'Land Use Mapping', 'Urban-Rural Spatial Analysis', 'Flood Plain Delineation',
          'Population Distribution Studies', 'Soil Erosion Mapping'
        ],
      },
      {
        id: 'DEPT-RU-GEOLOGY',
        name: 'Department of Geology',
        code: 'GEOL',
        headOfDept: 'Head of Department, Geology',
        activeLabs: [
          'Mineralogy & Petrology Lab',
          'Hydrogeology Lab',
        ],
        capabilities: [
          'Groundwater Investigation', 'Mineral Identification',
          'Rock & Soil Analysis', 'Natural Hazard Geology'
        ],
      },
      {
        id: 'DEPT-RU-BOTANY',
        name: 'Department of Botany',
        code: 'BOT',
        headOfDept: 'Head of Department, Botany',
        activeLabs: [
          'Plant Physiology & Ecology Lab',
          'Ethnobotany Research Unit',
        ],
        capabilities: [
          'Forest Ecosystem Research', 'Medicinal Plant Studies',
          'Tribal Ethnobotany', 'Biodiversity Inventory', 'Agricultural Botany'
        ],
      },
      {
        id: 'DEPT-RU-ZOOLOGY',
        name: 'Department of Zoology',
        code: 'ZOO',
        headOfDept: 'Head of Department, Zoology',
        activeLabs: [
          'Wildlife Biology Lab',
          'Aquatic Ecology Lab',
        ],
        capabilities: [
          'Wildlife Conflict Research', 'Aquatic Biodiversity Assessment',
          'Human-Animal Conflict Studies', 'Vector-Borne Disease Research'
        ],
      },
      {
        id: 'DEPT-RU-CS',
        name: 'Department of Computer Science',
        code: 'CS',
        headOfDept: 'Head of Department, Computer Science',
        activeLabs: [
          'Software Development Lab',
          'Network & Security Lab',
        ],
        capabilities: [
          'Software Development', 'Database Management',
          'Web Applications', 'E-Governance Solutions'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-RU-01',
        name: 'Faculty — Geography Dept',
        departmentId: 'DEPT-RU-GEO',
        designation: 'Professor',
        specialization: ['Spatial Analysis', 'Flood Plain Mapping', 'GIS'],
        activeProjectsCount: 1,
        email: 'geo@ranchiuniversity.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-RU-01', name: 'Student F', rollNumber: '22GEO001',
        departmentId: 'DEPT-RU-GEO', year: '4th Year',
        skills: ['QGIS', 'ArcGIS', 'Remote Sensing'], cgpa: 7.8, creditsEarned: 128,
      },
    ],
  },

  // ── 6. Vinoba Bhave University, Hazaribagh ───────────────────────────────
  // Established 1992; research in geology, environment & tribal studies
  {
    id: 'UNI-VBU-HAZARIBAGH',
    name: 'Vinoba Bhave University',
    shortName: 'VBU',
    district: 'Hazaribagh',
    city: 'Hazaribagh',
    type: 'State University',
    website: 'http://www.vbu.ac.in',
    supportedDomains: [
      'Mining & Mineral Resources', 'Environment', 'Tribal Welfare',
      'Agriculture', 'Healthcare', 'Water Resources'
    ],
    departments: [
      {
        id: 'DEPT-VBU-GEOLOGY',
        name: 'Department of Geology',
        code: 'GEOL',
        headOfDept: 'Head of Department, Geology',
        activeLabs: [
          'Mineralogy & Petrology Lab',
          'Hydrogeology Lab',
          'Structural Geology Lab',
        ],
        capabilities: [
          'Mineral Resource Evaluation', 'Groundwater Assessment',
          'Geological Hazard Study', 'Rock & Soil Characterization',
          'Coal Belt Geological Mapping', 'Groundwater Contamination Analysis'
        ],
      },
      {
        id: 'DEPT-VBU-ENV',
        name: 'Department of Environmental Science',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science',
        activeLabs: [
          'Environmental Chemistry Lab',
          'Coal Belt Ecology Research Unit',
          'Biodiversity & Forest Ecology Lab',
        ],
        capabilities: [
          'Coal Belt Environmental Monitoring', 'Industrial Pollution Assessment',
          'Forest Ecosystem Analysis', 'Biodiversity Conservation',
          'Natural Resource Management', 'Environmental Remediation'
        ],
      },
      {
        id: 'DEPT-VBU-BOTANY',
        name: 'Department of Botany',
        code: 'BOT',
        headOfDept: 'Head of Department, Botany',
        activeLabs: [
          'Plant Ecology & Biodiversity Lab',
          'Medicinal Plants Research Unit',
        ],
        capabilities: [
          'Forest Biodiversity Inventory', 'Medicinal Plant Research',
          'Ethnobotany Studies', 'Seed Bank Conservation'
        ],
      },
      {
        id: 'DEPT-VBU-BIO',
        name: 'Department of Biotechnology',
        code: 'BIO',
        headOfDept: 'Head of Department, Biotechnology',
        activeLabs: [
          'Microbiology & Biotech Lab',
          'Bioremediation Unit',
        ],
        capabilities: [
          'Bioremediation of Mine Waste', 'Agricultural Biotechnology',
          'Microbial Ecology Research', 'Biopesticide Development'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-VBU-01',
        name: 'Faculty — Geology Dept',
        departmentId: 'DEPT-VBU-GEOLOGY',
        designation: 'Professor',
        specialization: ['Hydrogeology', 'Mineral Resources', 'Geological Hazards'],
        activeProjectsCount: 2,
        email: 'geology@vbu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-VBU-01', name: 'Student G', rollNumber: '22ENV001',
        departmentId: 'DEPT-VBU-ENV', year: 'M.Tech',
        skills: ['Environmental Modelling', 'ArcGIS', 'R Programming'], cgpa: 7.9, creditsEarned: 46,
      },
    ],
  },

  // ── 7. Sido Kanhu Murmu University, Dumka ───────────────────────────────
  // Serves Santhal Parganas; focus on tribal studies and natural sciences
  {
    id: 'UNI-SKMU-DUMKA',
    name: 'Sido Kanhu Murmu University',
    shortName: 'SKMU',
    district: 'Dumka',
    city: 'Dumka',
    type: 'State University',
    website: 'https://skmu.ac.in',
    supportedDomains: [
      'Tribal Welfare', 'Agriculture', 'Water Resources', 'Healthcare',
      'Education', 'Environment', 'Social Governance'
    ],
    departments: [
      {
        id: 'DEPT-SKMU-GEO',
        name: 'Department of Geography',
        code: 'GEO',
        headOfDept: 'Head of Department, Geography',
        activeLabs: [
          'Physical Geography Lab',
          'Regional Planning Lab',
        ],
        capabilities: [
          'Regional Development Planning', 'Rural Area Mapping',
          'Soil & Land Use Analysis', 'Water Body Inventory'
        ],
      },
      {
        id: 'DEPT-SKMU-TRIBAL',
        name: 'Department of Santali & Tribal Studies',
        code: 'TRB',
        headOfDept: 'Head of Department, Santali & Tribal Studies',
        activeLabs: [
          'Oral Culture & Linguistics Lab',
          'Tribal Heritage Documentation Unit',
        ],
        capabilities: [
          'Tribal Community Needs Assessment', 'Santali Language Research',
          'Community Participatory Research', 'Tribal Rights & Policy Analysis',
          'Social Impact Assessment for Tribal Areas'
        ],
      },
      {
        id: 'DEPT-SKMU-BOTANY',
        name: 'Department of Botany',
        code: 'BOT',
        headOfDept: 'Head of Department, Botany',
        activeLabs: [
          'Herbarium & Plant Diversity Lab',
        ],
        capabilities: [
          'Forest Plant Diversity Assessment', 'Medicinal Plant Mapping',
          'Traditional Agricultural Plant Research'
        ],
      },
      {
        id: 'DEPT-SKMU-ECON',
        name: 'Department of Economics',
        code: 'ECON',
        headOfDept: 'Head of Department, Economics',
        activeLabs: [
          'Rural Economics Research Unit',
        ],
        capabilities: [
          'Rural Economy Assessment', 'Agricultural Market Analysis',
          'Tribal Livelihood Research', 'Poverty Measurement Studies'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-SKMU-01',
        name: 'Faculty — Tribal Studies Dept',
        departmentId: 'DEPT-SKMU-TRIBAL',
        designation: 'Professor',
        specialization: ['Tribal Welfare', 'Community Participation', 'Social Impact'],
        activeProjectsCount: 1,
        email: 'tribal@skmu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-SKMU-01', name: 'Student H', rollNumber: '22GEO001',
        departmentId: 'DEPT-SKMU-GEO', year: '4th Year',
        skills: ['QGIS', 'Survey Methods', 'Community Research'], cgpa: 7.5, creditsEarned: 120,
      },
    ],
  },

  // ── 8. XLRI – Xavier School of Management, Jamshedpur ───────────────────
  // Premier management institution; strong CSR / Social Impact focus
  {
    id: 'UNI-XLRI-JAMSHEDPUR',
    name: 'XLRI – Xavier School of Management',
    shortName: 'XLRI',
    district: 'East Singhbhum (Jamshedpur)',
    city: 'Jamshedpur',
    type: 'Deemed University',
    nirfRank: 'Management #7 (NIRF 2024)',
    website: 'https://www.xlri.ac.in',
    supportedDomains: [
      'CSR & Industry Collaboration', 'Social Governance', 'Healthcare Management',
      'Tribal Welfare', 'Education Management', 'Rural Development'
    ],
    departments: [
      {
        id: 'DEPT-XLRI-BM',
        name: 'Business Management & General Management',
        code: 'BM',
        headOfDept: 'Head, Business Management Area',
        activeLabs: [
          'Business Simulation Lab',
          'Case Research Centre',
        ],
        capabilities: [
          'CSR Strategy Design', 'Stakeholder Engagement', 'Social Enterprise Development',
          'Public-Private Partnership Models', 'Project Management', 'Impact Investment'
        ],
      },
      {
        id: 'DEPT-XLRI-HRM',
        name: 'Human Resource Management',
        code: 'HRM',
        headOfDept: 'Head, Human Resource Management Area',
        activeLabs: [
          'Organisational Development Lab',
          'HR Analytics Lab',
        ],
        capabilities: [
          'Community Capacity Building', 'Workforce Development',
          'Livelihood Programme Design', 'Organisational Impact Studies'
        ],
      },
      {
        id: 'DEPT-XLRI-CSR',
        name: 'Business Ethics, Law & CSR',
        code: 'CSR',
        headOfDept: 'Head, Business Ethics & CSR Area',
        activeLabs: [
          'Social Impact Measurement Lab',
          'Sustainability Reporting Research Unit',
        ],
        capabilities: [
          'ESG Framework Design', 'Corporate Sustainability Reporting',
          'CSR Project Monitoring & Evaluation', 'Social Return on Investment (SROI)',
          'Community Development Programme Evaluation', 'Responsible Business Research'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-XLRI-01',
        name: 'Faculty — Business Ethics & CSR Area',
        departmentId: 'DEPT-XLRI-CSR',
        designation: 'Professor',
        specialization: ['ESG', 'CSR Strategy', 'Social Impact Measurement'],
        activeProjectsCount: 3,
        email: 'csr@xlri.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-XLRI-01', name: 'Student I', rollNumber: '24BM001',
        departmentId: 'DEPT-XLRI-BM', year: 'M.Tech',
        skills: ['Project Management', 'CSR Strategy', 'Data Analysis'], cgpa: 8.5, creditsEarned: 52,
      },
    ],
  },

  // ── 9. Jharkhand Rai University, Ranchi ──────────────────────────────────
  // Private university; strong applied engineering focus
  {
    id: 'UNI-JRU-RANCHI',
    name: 'Jharkhand Rai University',
    shortName: 'JRU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://jru.edu.in',
    supportedDomains: [
      'Infrastructure', 'Smart Cities', 'Healthcare Technology',
      'Agriculture', 'Energy', 'Manufacturing'
    ],
    departments: [
      {
        id: 'DEPT-JRU-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Head of Department, Civil Engineering',
        activeLabs: [
          'Construction Materials Lab',
          'Surveying & GIS Lab',
          'Environmental Engineering Lab',
        ],
        capabilities: [
          'Construction Technology', 'Infrastructure Assessment',
          'Road & Drainage Design', 'Environmental Engineering Solutions',
          'GIS-Based Urban Planning'
        ],
      },
      {
        id: 'DEPT-JRU-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Software Engineering Lab',
          'IoT & Cloud Computing Lab',
        ],
        capabilities: [
          'Web & Mobile App Development', 'Cloud Solutions',
          'IoT Prototyping', 'Database Systems', 'Smart City Applications'
        ],
      },
      {
        id: 'DEPT-JRU-AGRI',
        name: 'Department of Agriculture',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Soil Testing Lab',
          'Crop Science Lab',
          'Agri-Technology Demonstration Unit',
        ],
        capabilities: [
          'Soil Health Analysis', 'Crop Disease Identification',
          'Precision Farming', 'Agricultural Technology Transfer',
          'Post-Harvest Loss Reduction'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-JRU-01',
        name: 'Faculty — Agriculture Dept',
        departmentId: 'DEPT-JRU-AGRI',
        designation: 'Associate Professor',
        specialization: ['Soil Science', 'Precision Agriculture', 'Crop Disease'],
        activeProjectsCount: 2,
        email: 'agri@jru.edu.in',
      },
    ],
    students: [
      {
        id: 'STU-JRU-01', name: 'Student J', rollNumber: '22AGR001',
        departmentId: 'DEPT-JRU-AGRI', year: '3rd Year',
        skills: ['Soil Testing', 'Precision Farming', 'Data Collection'], cgpa: 7.6, creditsEarned: 98,
      },
    ],
  },

  // ── 10. Kolhan University, Chaibasa ──────────────────────────────────────
  // Serves West Singhbhum (tribal belt & mining region)
  {
    id: 'UNI-KOLHAN-CHAIBASA',
    name: 'Kolhan University',
    shortName: 'Kolhan Univ',
    district: 'West Singhbhum',
    city: 'Chaibasa',
    type: 'State University',
    website: 'https://kolhanuniversity.ac.in',
    supportedDomains: [
      'Tribal Welfare', 'Mining & Mineral Resources', 'Environment',
      'Agriculture', 'Healthcare', 'Education'
    ],
    departments: [
      {
        id: 'DEPT-KU-GEO',
        name: 'Department of Geography',
        code: 'GEO',
        headOfDept: 'Head of Department, Geography',
        activeLabs: [
          'Cartography & Remote Sensing Lab',
        ],
        capabilities: [
          'Land Use & Land Cover Mapping', 'Tribal Region Spatial Studies',
          'Mining Area Environmental Mapping', 'Watershed Analysis'
        ],
      },
      {
        id: 'DEPT-KU-TRIBAL',
        name: 'Department of Ho / Tribal Studies',
        code: 'TRB',
        headOfDept: 'Head of Department, Ho/Tribal Studies',
        activeLabs: [
          'Tribal Culture Documentation Unit',
        ],
        capabilities: [
          'Ho & Tribal Community Research', 'Social Impact Assessment',
          'Displacement & Resettlement Studies', 'Tribal Rights Research'
        ],
      },
      {
        id: 'DEPT-KU-ENV',
        name: 'Department of Environmental Science',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science',
        activeLabs: [
          'Environmental Monitoring Lab',
        ],
        capabilities: [
          'Mining Region Environmental Assessment', 'Forest Degradation Monitoring',
          'Water Pollution Studies in Mining Zones'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-KU-01',
        name: 'Faculty — Environmental Science Dept',
        departmentId: 'DEPT-KU-ENV',
        designation: 'Assistant Professor',
        specialization: ['Mining Environment', 'Forest Ecology', 'Tribal Land Rights'],
        activeProjectsCount: 1,
        email: 'env@kolhanuniversity.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-KU-01', name: 'Student K', rollNumber: '22GEO001',
        departmentId: 'DEPT-KU-GEO', year: '3rd Year',
        skills: ['QGIS', 'Field Survey', 'Environmental Sampling'], cgpa: 7.3, creditsEarned: 90,
      },
    ],
  },

  // ── 11. Nilamber-Pitamber University, Palamu ────────────────────────────
  // Serves Palamu division (remote, agrarian, high poverty)
  {
    id: 'UNI-NPU-PALAMU',
    name: 'Nilamber-Pitamber University',
    shortName: 'NPU',
    district: 'Palamu',
    city: 'Medininagar (Daltonganj)',
    type: 'State University',
    website: 'https://npu.ac.in',
    supportedDomains: [
      'Agriculture', 'Water Resources', 'Healthcare', 'Education',
      'Tribal Welfare', 'Environment', 'Disaster Management'
    ],
    departments: [
      {
        id: 'DEPT-NPU-AGR',
        name: 'Department of Agriculture',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Soil & Water Testing Lab',
          'Agronomy Research Plot',
        ],
        capabilities: [
          'Dryland Farming Research', 'Soil Health Assessment',
          'Crop Yield Improvement', 'Irrigation & Water Management',
          'Agricultural Extension Services'
        ],
      },
      {
        id: 'DEPT-NPU-BOTANY',
        name: 'Department of Botany',
        code: 'BOT',
        headOfDept: 'Head of Department, Botany',
        activeLabs: [
          'Plant Ecology Lab',
          'Medicinal Plants Unit',
        ],
        capabilities: [
          'Agro-Forestry Research', 'Medicinal Plant Inventory',
          'Drought-Tolerant Crop Research', 'Traditional Knowledge Documentation'
        ],
      },
      {
        id: 'DEPT-NPU-GEO',
        name: 'Department of Geography',
        code: 'GEO',
        headOfDept: 'Head of Department, Geography',
        activeLabs: [
          'Physical Geography Lab',
        ],
        capabilities: [
          'Drought Mapping', 'Land Degradation Studies',
          'River Basin Analysis', 'Flood Hazard Assessment'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-NPU-01',
        name: 'Faculty — Agriculture Dept',
        departmentId: 'DEPT-NPU-AGR',
        designation: 'Associate Professor',
        specialization: ['Dryland Farming', 'Soil Conservation', 'Irrigation'],
        activeProjectsCount: 1,
        email: 'agr@npu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NPU-01', name: 'Student L', rollNumber: '22AGR001',
        departmentId: 'DEPT-NPU-AGR', year: '4th Year',
        skills: ['Soil Testing', 'Crop Science', 'Community Survey'], cgpa: 7.4, creditsEarned: 126,
      },
    ],
  },

  // ── 12. Binod Bihari Mahto Koyalanchal University, Dhanbad ──────────────
  // State university serving the coal belt; elevated to central status in 2023
  {
    id: 'UNI-BBMKU-DHANBAD',
    name: 'Binod Bihari Mahto Koyalanchal University',
    shortName: 'BBMKU',
    district: 'Dhanbad',
    city: 'Dhanbad',
    type: 'State University',
    website: 'https://bbmku.ac.in',
    supportedDomains: [
      'Mining & Mineral Resources', 'Environment', 'Water Resources',
      'Healthcare', 'Agriculture', 'Education', 'Tribal Welfare'
    ],
    departments: [
      {
        id: 'DEPT-BBMKU-GEOL',
        name: 'Department of Geology',
        code: 'GEOL',
        headOfDept: 'Head of Department, Geology',
        activeLabs: [
          'Coal Petrology Lab',
          'Hydrogeology & Groundwater Lab',
          'Mineralogy & Petrography Lab',
        ],
        capabilities: [
          'Coal & Mineral Resource Evaluation', 'Groundwater Assessment',
          'Mining Area Geological Mapping', 'Subsidence & Water Contamination Studies',
          'Landslide & Slope Hazard Analysis'
        ],
      },
      {
        id: 'DEPT-BBMKU-ENV',
        name: 'Department of Environmental Science',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science',
        activeLabs: [
          'Environmental Chemistry Lab',
          'Coal Dust & Air Quality Monitoring Unit',
          'Biodiversity & Ecology Lab',
        ],
        capabilities: [
          'Coal Belt Pollution Assessment', 'Air & Water Quality Monitoring',
          'Mine Spoil Reclamation Research', 'Forest Degradation Analysis',
          'Environmental Remediation'
        ],
      },
      {
        id: 'DEPT-BBMKU-CS',
        name: 'Department of Computer Science & IT',
        code: 'CS',
        headOfDept: 'Head of Department, Computer Science & IT',
        activeLabs: [
          'Software Development Lab',
          'Data & Network Lab',
        ],
        capabilities: [
          'Web & Mobile Applications', 'Digital Literacy Programmes',
          'Data Management Systems', 'E-Governance Support Tools'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-BBMKU-01',
        name: 'Faculty — Geology Dept',
        departmentId: 'DEPT-BBMKU-GEOL',
        designation: 'Professor',
        specialization: ['Coal Geology', 'Hydrogeology', 'Mining Environment'],
        activeProjectsCount: 2,
        email: 'geology@bbmku.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-BBMKU-01', name: 'Student M', rollNumber: '22GEOL001',
        departmentId: 'DEPT-BBMKU-GEOL', year: '4th Year',
        skills: ['ArcGIS', 'Field Mapping', 'Hydrogeology'], cgpa: 7.7, creditsEarned: 124,
      },
    ],
  },

  // ── 13. Dr. Shyama Prasad Mukherjee University, Ranchi ───────────────────
  // Formerly Ranchi College, upgraded to state university; broad science/arts base
  {
    id: 'UNI-DSPMU-RANCHI',
    name: 'Dr. Shyama Prasad Mukherjee University',
    shortName: 'DSPMU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://dspmuranchi.ac.in',
    supportedDomains: [
      'Healthcare', 'Agriculture', 'Environment', 'Education',
      'Social Governance', 'Water Resources', 'Tribal Welfare'
    ],
    departments: [
      {
        id: 'DEPT-DSPMU-BIO',
        name: 'Department of Biotechnology & Microbiology',
        code: 'BIO',
        headOfDept: 'Head of Department, Biotechnology',
        activeLabs: [
          'Molecular Biology Lab',
          'Microbiology & Pathogen Lab',
          'Water Microbiology Unit',
        ],
        capabilities: [
          'Water Contamination Testing', 'Pathogen Detection',
          'Bioremediation', 'Agricultural Biotechnology',
          'Fermented Food & Probiotic Research'
        ],
      },
      {
        id: 'DEPT-DSPMU-BOT',
        name: 'Department of Botany',
        code: 'BOT',
        headOfDept: 'Head of Department, Botany',
        activeLabs: [
          'Plant Physiology & Ecology Lab',
          'Medicinal Plant Research Unit',
        ],
        capabilities: [
          'Forest Biodiversity Inventory', 'Medicinal Plant Studies',
          'Ethnobotany & Tribal Knowledge', 'Agricultural Botany Research'
        ],
      },
      {
        id: 'DEPT-DSPMU-ZOO',
        name: 'Department of Zoology',
        code: 'ZOO',
        headOfDept: 'Head of Department, Zoology',
        activeLabs: [
          'Wildlife & Conservation Lab',
          'Aquatic Ecology Lab',
        ],
        capabilities: [
          'Wildlife Conflict Research', 'Aquatic Biodiversity Assessment',
          'Vector-Borne Disease Ecology', 'Human-Animal Conflict Studies'
        ],
      },
      {
        id: 'DEPT-DSPMU-SOC',
        name: 'Department of Social Work & Sociology',
        code: 'SOC',
        headOfDept: 'Head of Department, Social Work',
        activeLabs: [
          'Community Outreach Unit',
          'Social Research & Survey Lab',
        ],
        capabilities: [
          'Community Needs Assessment', 'Rural Livelihood Research',
          'Social Impact Measurement', 'Tribal Welfare Programmes'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-DSPMU-01',
        name: 'Faculty — Biotechnology Dept',
        departmentId: 'DEPT-DSPMU-BIO',
        designation: 'Associate Professor',
        specialization: ['Water Microbiology', 'Bioremediation', 'Pathogen Detection'],
        activeProjectsCount: 2,
        email: 'biotech@dspmuranchi.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-DSPMU-01', name: 'Student N', rollNumber: '22BIO001',
        departmentId: 'DEPT-DSPMU-BIO', year: 'M.Tech',
        skills: ['Lab Testing', 'Microbiology', 'Data Analysis'], cgpa: 7.9, creditsEarned: 50,
      },
    ],
  },

  // ── 14. Jharkhand Raksha Shakti University, Ranchi ───────────────────────
  // Police/security & safety-focused state university (est. 2016)
  {
    id: 'UNI-JRSU-RANCHI',
    name: 'Jharkhand Raksha Shakti University',
    shortName: 'JRSU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.jrsu.ac.in',
    supportedDomains: [
      'Public Safety & Policing', 'Cyber Security', 'Disaster Management',
      'Social Governance', 'Education', 'Emergency Response'
    ],
    departments: [
      {
        id: 'DEPT-JRSU-CYB',
        name: 'Department of Cyber Security & Forensics',
        code: 'CYB',
        headOfDept: 'Head of Department, Cyber Security',
        activeLabs: [
          'Digital Forensics Lab',
          'Network Security & Cyber Crime Lab',
        ],
        capabilities: [
          'Cyber Crime Investigation', 'Digital Evidence Analysis',
          'Network Intrusion Detection', 'Digital Literacy & Awareness Campaigns',
          'Secure Communications Systems'
        ],
      },
      {
        id: 'DEPT-JRSU-DM',
        name: 'Department of Disaster & Emergency Management',
        code: 'DM',
        headOfDept: 'Head of Department, Disaster Management',
        activeLabs: [
          'Emergency Response Simulation Lab',
          'Community Safety & Preparedness Unit',
        ],
        capabilities: [
          'Disaster Preparedness Planning', 'Community Evacuation Modelling',
          'Early Warning Communication Systems', 'Search & Rescue Coordination',
          'School & Village Safety Drills'
        ],
      },
      {
        id: 'DEPT-JRSU-SOC',
        name: 'Department of Social Work & Public Policy',
        code: 'SOC',
        headOfDept: 'Head of Department, Social Work',
        activeLabs: [
          'Community Law & Order Research Unit',
        ],
        capabilities: [
          'Community Policing Models', 'Crime Prevention Strategy',
          'Social Impact & Safety Studies', 'Traffic & Road Safety Outreach'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-JRSU-01',
        name: 'Faculty — Cyber Security Dept',
        departmentId: 'DEPT-JRSU-CYB',
        designation: 'Associate Professor',
        specialization: ['Digital Forensics', 'Network Security', 'Cyber Crime'],
        activeProjectsCount: 2,
        email: 'cyber@jrsu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-JRSU-01', name: 'Student O', rollNumber: '22CYB001',
        departmentId: 'DEPT-JRSU-CYB', year: '4th Year',
        skills: ['Digital Forensics', 'Network Security', 'Incident Response'], cgpa: 8.0, creditsEarned: 122,
      },
    ],
  },

  // ── 15. Birsa Agricultural University, Ranchi ─────────────────────────────
  // Premier agricultural university (est. 1981) serving all of Jharkhand
  {
    id: 'UNI-BAU-RANCHI',
    name: 'Birsa Agricultural University',
    shortName: 'BAU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.bau.ac.in',
    supportedDomains: [
      'Agriculture', 'Water Resources', 'Irrigation', 'Animal Husbandry',
      'Food Security', 'Rural Livelihood', 'Soil Health', 'Agro-Forestry'
    ],
    departments: [
      {
        id: 'DEPT-BAU-AGRONOMY',
        name: 'Department of Agronomy',
        code: 'AGR',
        headOfDept: 'Head of Department, Agronomy',
        activeLabs: [
          'Soil & Water Testing Lab',
          'Crop Physiology Research Farm',
          'Weather & Climate Data Unit',
        ],
        capabilities: [
          'Soil Health Testing', 'Crop Yield Improvement',
          'Rainfed & Dryland Farming', 'Irrigation Water Management',
          'Fertilizer & Nutrient Optimisation', 'Weather-Resilient Cropping'
        ],
      },
      {
        id: 'DEPT-BAU-HORT',
        name: 'Department of Horticulture',
        code: 'HORT',
        headOfDept: 'Head of Department, Horticulture',
        activeLabs: [
          'Vegetable & Fruit Nursery',
          'Post-Harvest Technology Lab',
        ],
        capabilities: [
          'Fruit & Vegetable Cultivation', 'Post-Harvest Loss Reduction',
          'High-Value Crop Promotion', 'Cold Chain & Storage Design',
          'Horticulture Extension Services'
        ],
      },
      {
        id: 'DEPT-BAU-VET',
        name: 'Faculty of Veterinary Science & Animal Husbandry',
        code: 'VET',
        headOfDept: 'Dean, Veterinary Science & Animal Husbandry',
        activeLabs: [
          'Animal Health Diagnostics Lab',
          'Livestock Disease Surveillance Unit',
        ],
        capabilities: [
          'Livestock Disease Diagnosis', 'Animal Health & Vaccination Camps',
          'Dairy & Poultry Farming Support', 'Zoonotic Disease Surveillance',
          'Fodder & Feed Management'
        ],
      },
      {
        id: 'DEPT-BAU-FOREST',
        name: 'Faculty of Forestry',
        code: 'FOR',
        headOfDept: 'Dean, Faculty of Forestry',
        activeLabs: [
          'Forest Ecology & Wildlife Lab',
          'Nursery & Afforestation Unit',
          'Remote Sensing for Forestry Lab',
        ],
        capabilities: [
          'Afforestation & Reforestation', 'Forest Fire Management',
          'Wildlife Habitat Assessment', 'Agro-Forestry Models',
          'Non-Timber Forest Product Development'
        ],
      },
      {
        id: 'DEPT-BAU-AGENGG',
        name: 'Faculty of Agricultural Engineering',
        code: 'AGENGG',
        headOfDept: 'Dean, Faculty of Agricultural Engineering',
        activeLabs: [
          'Farm Machinery & Mechanisation Lab',
          'Watershed Development Lab',
          'Solar & Renewable Energy Unit',
        ],
        capabilities: [
          'Farm Mechanisation', 'Watershed Development',
          'Micro-Irrigation & Drip Systems', 'Post-Harvest Machinery Design',
          'Solar-Powered Agri Solutions', 'Rainwater Harvesting Structures'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-BAU-01',
        name: 'Faculty — Agricultural Engineering Dept',
        departmentId: 'DEPT-BAU-AGENGG',
        designation: 'Professor',
        specialization: ['Watershed Development', 'Micro-Irrigation', 'Farm Mechanisation'],
        activeProjectsCount: 3,
        email: 'agengg@bau.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-BAU-01', name: 'Student P', rollNumber: '22AGENGG001',
        departmentId: 'DEPT-BAU-AGENGG', year: '4th Year',
        skills: ['Watershed Modelling', 'Irrigation Design', 'GIS'], cgpa: 8.3, creditsEarned: 134,
      },
    ],
  },

  // ── 16. NIFFT Ranchi ─────────────────────────────────────────────────────
  // National Institute of Foundry & Forge Technology; Ministry of Education
  {
    id: 'UNI-NIFFT-RANCHI',
    name: 'National Institute of Foundry and Forge Technology',
    shortName: 'NIFFT',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'National Institute',
    website: 'https://www.nifft.ac.in',
    supportedDomains: [
      'Manufacturing', 'Metallurgy & Materials', 'Infrastructure', 'Energy',
      'Skill Development', 'Industrial Automation', 'Mining Equipment'
    ],
    departments: [
      {
        id: 'DEPT-NIFFT-MET',
        name: 'Dept of Metallurgy & Materials Engineering',
        code: 'MET',
        headOfDept: 'Head of Department, Metallurgy',
        activeLabs: [
          'Foundry Technology Lab',
          'Materials Characterization Lab',
          'Heat Treatment Lab',
          'Corrosion & Wear Lab',
        ],
        capabilities: [
          'Foundry & Casting Technology', 'Material Testing & Characterization',
          'Metal Reclamation from Scrap', 'Corrosion Prevention for Rural Infrastructure',
          'Wear-Resistant Alloy Development', 'Tool & Equipment Repair'
        ],
      },
      {
        id: 'DEPT-NIFFT-ME',
        name: 'Dept of Mechanical Engineering & Forging',
        code: 'ME',
        headOfDept: 'Head of Department, Mechanical Engineering',
        activeLabs: [
          'Forging & Press Shop Lab',
          'CNC & Advanced Manufacturing Lab',
          'Industrial Automation & Robotics Lab',
        ],
        capabilities: [
          'Metal Component Fabrication', 'Agricultural Tool & Implement Production',
          'CNC Machining & Prototyping', 'Industrial Automation',
          'Water Pump & Turbine Component Repair', 'Rural Equipment Design'
        ],
      },
      {
        id: 'DEPT-NIFFT-PROD',
        name: 'Dept of Production & Industrial Engineering',
        code: 'PROD',
        headOfDept: 'Head of Department, Production Engineering',
        activeLabs: [
          'Computer Integrated Manufacturing Lab',
          'Quality Control & Metrology Lab',
        ],
        capabilities: [
          'Production Process Optimisation', 'Quality Assurance & Metrology',
          'Skill & Vocational Training Programmes', 'Supply Chain for Rural Products',
          'Lean Manufacturing Implementation'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-NIFFT-01',
        name: 'Faculty — Metallurgy Dept',
        departmentId: 'DEPT-NIFFT-MET',
        designation: 'Professor',
        specialization: ['Foundry Technology', 'Materials', 'Heat Treatment'],
        activeProjectsCount: 2,
        email: 'hod.met@nifft.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NIFFT-01', name: 'Student Q', rollNumber: '22MET001',
        departmentId: 'DEPT-NIFFT-MET', year: '4th Year',
        skills: ['Material Testing', 'CAD/CAM', 'Foundry Design'], cgpa: 8.1, creditsEarned: 130,
      },
    ],
  },

  // ── 17. IIM Ranchi ───────────────────────────────────────────────────────
  // Premier management institute; strong CSR, strategy & data analytics
  {
    id: 'UNI-IIM-RANCHI',
    name: 'Indian Institute of Management Ranchi',
    shortName: 'IIM Ranchi',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'Institute of National Importance',
    nirfRank: 'Management #17 (NIRF 2024)',
    website: 'https://www.iimranchi.ac.in',
    supportedDomains: [
      'CSR & Industry Collaboration', 'Public Policy & Governance',
      'Data Analytics', 'Healthcare Management', 'Rural Development',
      'Social Entrepreneurship', 'Education Management'
    ],
    departments: [
      {
        id: 'DEPT-IIM-STRAT',
        name: 'Strategy & Operations Management',
        code: 'STRAT',
        headOfDept: 'Head, Strategy & Operations Area',
        activeLabs: [
          'Supply Chain & Operations Lab',
          'Public Systems & Policy Research Unit',
        ],
        capabilities: [
          'Public-Private Partnership Design', 'Government Programme Scale-Up',
          'Operations Process Optimisation', 'Citizen Service Delivery Modelling',
          'E-Governance Programme Management'
        ],
      },
      {
        id: 'DEPT-IIM-DA',
        name: 'Economics & Business Analytics',
        code: 'DA',
        headOfDept: 'Head, Economics & Analytics Area',
        activeLabs: [
          'Data Analytics & Business Intelligence Lab',
          'Econometrics & Impact Evaluation Unit',
        ],
        capabilities: [
          'Impact Evaluation & RCT Design', 'Socio-Economic Data Analysis',
          'Beneficiary Targeting Models', 'Cost-Benefit Analysis of Public Schemes',
          'Budget Allocation Optimisation'
        ],
      },
      {
        id: 'DEPT-IIM-HRM',
        name: 'Human Resource Management & CSR',
        code: 'HRM',
        headOfDept: 'Head, HRM & CSR Area',
        activeLabs: [
          'CSR & Social Impact Research Unit',
          'Community Engagement Lab',
        ],
        capabilities: [
          'CSR Strategy & Fund Mapping', 'Corporate Sponsorship Programme Design',
          'Social Return on Investment (SROI)', 'Livelihood & Skill Development',
          'Stakeholder Collaboration Management'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-IIM-01',
        name: 'Faculty — Econ & Analytics Area',
        departmentId: 'DEPT-IIM-DA',
        designation: 'Professor',
        specialization: ['Impact Evaluation', 'Public Policy', 'Data Analytics'],
        activeProjectsCount: 3,
        email: 'analytics@iimranchi.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-IIM-01', name: 'Student R', rollNumber: '24MBA001',
        departmentId: 'DEPT-IIM-DA', year: 'M.Tech',
        skills: ['Data Analytics', 'Impact Evaluation', 'Project Management'], cgpa: 8.6, creditsEarned: 56,
      },
    ],
  },

  // ── 18. NUSRL Ranchi ─────────────────────────────────────────────────────
  // National Law University; legal & regulatory expertise
  {
    id: 'UNI-NUSRL-RANCHI',
    name: 'National University of Study and Research in Law',
    shortName: 'NUSRL',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.nusrlranchi.ac.in',
    supportedDomains: [
      'Legal & Regulatory Compliance', 'Environmental Law', 'Land Rights',
      'Public Policy', 'Cyber Law', 'Social Governance', 'Mining & Forest Law'
    ],
    departments: [
      {
        id: 'DEPT-NUSRL-ENVLAW',
        name: 'Centre for Environmental Law',
        code: 'ENVLAW',
        headOfDept: 'Head, Centre for Environmental Law',
        activeLabs: [
          'Environmental Litigation & Policy Unit',
          'Forest & Wildlife Law Research Lab',
        ],
        capabilities: [
          'Environmental Legal Framework Analysis', 'Forest Rights Act Compliance',
          'Pollution Control Litigation Support', 'Mining Regulation Review',
          'Climate Policy Research'
        ],
      },
      {
        id: 'DEPT-NUSRL-LAND',
        name: 'Centre for Land & Property Rights',
        code: 'LAND',
        headOfDept: 'Head, Centre for Land Rights',
        activeLabs: [
          'Land Records & Tenure Research Unit',
          'Tribal Land Rights Clinic',
        ],
        capabilities: [
          'Land Dispute Resolution Mechanisms', 'Land Records Digitisation Support',
          'Tribal Land & Forest Rights Advocacy', 'Compensation & Displacement Policy',
          'Legal Aid & Awareness Camps'
        ],
      },
      {
        id: 'DEPT-NUSRL-CYBER',
        name: 'Centre for Cyber Law & Technology',
        code: 'CYLAW',
        headOfDept: 'Head, Centre for Cyber Law',
        activeLabs: [
          'Cyber Law & Data Protection Lab',
          'Digital Governance Research Unit',
        ],
        capabilities: [
          'Data Protection & Privacy Compliance', 'Cyber Crime Legal Framework',
          'Digital Public Infrastructure Regulation', 'E-Governance Legal Advisory',
          'Aadhaar & Digital Identity Policy Analysis'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-NUSRL-01',
        name: 'Faculty — Environmental Law Centre',
        departmentId: 'DEPT-NUSRL-ENVLAW',
        designation: 'Professor',
        specialization: ['Environmental Law', 'Forest Rights', 'Mining Regulation'],
        activeProjectsCount: 2,
        email: 'envlaw@nusrlranchi.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NUSRL-01', name: 'Student S', rollNumber: '22BALLB001',
        departmentId: 'DEPT-NUSRL-ENVLAW', year: '3rd Year',
        skills: ['Legal Research', 'Policy Analysis', 'Drafting'], cgpa: 8.2, creditsEarned: 104,
      },
    ],
  },

  // ── 19. AISECT University, Hazaribagh ────────────────────────────────────
  // Private applied-science university with vocational/IT focus (est. 2016)
  {
    id: 'UNI-AISECT-HAZARIBAGH',
    name: 'AISECT University',
    shortName: 'AISECT',
    district: 'Hazaribagh',
    city: 'Hazaribagh',
    type: 'State University',
    website: 'https://aisectuniversity.ac.in',
    supportedDomains: [
      'Education Technology', 'Digital Literacy', 'IT & Software',
      'Skill Development', 'Agriculture', 'Healthcare Technology', 'Energy'
    ],
    departments: [
      {
        id: 'DEPT-AISECT-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Software & Web Development Lab',
          'IoT & Embedded Systems Lab',
          'AI & Data Science Lab',
        ],
        capabilities: [
          'Rural Digital Literacy Programmes', 'Web & Mobile App Development',
          'IoT Prototyping for Agriculture', 'Digital Payments Outreach',
          'Educational Technology Platforms', 'Data Collection & Survey Tools'
        ],
      },
      {
        id: 'DEPT-AISECT-ECE',
        name: 'Department of Electronics & Communication',
        code: 'ECE',
        headOfDept: 'Head of Department, ECE',
        activeLabs: [
          'Embedded Systems Lab',
          'Communication Networks Lab',
        ],
        capabilities: [
          'Low-Cost Sensor Devices', 'Rural Connectivity Solutions',
          'Solar-Powered Electronics', 'Embedded System Prototyping'
        ],
      },
      {
        id: 'DEPT-AISECT-AGRI',
        name: 'Department of Agriculture & Allied Sciences',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Soil Health Testing Lab',
          'Agri-Extension Demonstration Unit',
        ],
        capabilities: [
          'Soil Testing & Advisory', 'Crop Protection Training',
          'Farm Digitalisation', 'Agri-Extension & Training Camps'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-AISECT-01',
        name: 'Faculty — Computer Science Dept',
        departmentId: 'DEPT-AISECT-CSE',
        designation: 'Associate Professor',
        specialization: ['Educational Technology', 'IoT', 'Digital Literacy'],
        activeProjectsCount: 2,
        email: 'cse@aisectuniversity.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-AISECT-01', name: 'Student T', rollNumber: '22CSE001',
        departmentId: 'DEPT-AISECT-CSE', year: '3rd Year',
        skills: ['React', 'IoT', 'Python'], cgpa: 7.8, creditsEarned: 96,
      },
    ],
  },

  // ── 20. Arka Jain University, Jamshedpur ─────────────────────────────────
  // Private university (est. 2017) with strong engineering & management base
  {
    id: 'UNI-ARKA-JAMSHEDPUR',
    name: 'Arka Jain University',
    shortName: 'Arka Jain Univ',
    district: 'East Singhbhum (Jamshedpur)',
    city: 'Jamshedpur',
    type: 'State University',
    website: 'https://arkajainuniversity.ac.in',
    supportedDomains: [
      'Engineering & Manufacturing', 'Smart Cities', 'Healthcare Technology',
      'Management & CSR', 'Energy', 'Education Technology'
    ],
    departments: [
      {
        id: 'DEPT-ARKA-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'AI & Machine Learning Lab',
          'Software Engineering Lab',
          'IoT Lab',
        ],
        capabilities: [
          'AI Application Development', 'Web & Mobile Platforms',
          'IoT System Design', 'Data Analytics', 'Smart City Solutions'
        ],
      },
      {
        id: 'DEPT-ARKA-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Head of Department, Civil Engineering',
        activeLabs: [
          'Structural Engineering Lab',
          'Building Materials Lab',
          'Surveying & GIS Lab',
        ],
        capabilities: [
          'Affordable Housing Design', 'Road & Drainage Infrastructure',
          'Construction Materials Testing', 'Structural Safety Assessment'
        ],
      },
      {
        id: 'DEPT-ARKA-ME',
        name: 'Department of Mechanical Engineering',
        code: 'ME',
        headOfDept: 'Head of Department, Mechanical Engineering',
        activeLabs: [
          'Manufacturing & Workshop Lab',
          'Thermal Engineering Lab',
        ],
        capabilities: [
          'Component Fabrication', 'Manufacturing Process Improvement',
          'Energy-Efficient Machines', 'Industrial Maintenance'
        ],
      },
      {
        id: 'DEPT-ARKA-MGMT',
        name: 'School of Management Studies',
        code: 'MGMT',
        headOfDept: 'Dean, School of Management',
        activeLabs: [
          'Business Analytics Lab',
          'Entrepreneurship & Start-up Cell',
        ],
        capabilities: [
          'CSR Project Management', 'Social Enterprise Development',
          'Market Research for Rural Products', 'Business Planning & Incubation'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-ARKA-01',
        name: 'Faculty — Management School',
        departmentId: 'DEPT-ARKA-MGMT',
        designation: 'Associate Professor',
        specialization: ['CSR', 'Entrepreneurship', 'Business Analytics'],
        activeProjectsCount: 2,
        email: 'mgmt@arkajainuniversity.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-ARKA-01', name: 'Student U', rollNumber: '22CSE001',
        departmentId: 'DEPT-ARKA-CSE', year: '4th Year',
        skills: ['Python', 'React', 'IoT'], cgpa: 8.0, creditsEarned: 128,
      },
    ],
  },

  // ── 21. Capital University, Koderma ──────────────────────────────────────
  // Private university serving Koderma (mica region) & neighbouring districts
  {
    id: 'UNI-CAPITAL-KODERMA',
    name: 'Capital University',
    shortName: 'Capital Univ',
    district: 'Koderma',
    city: 'Koderma',
    type: 'State University',
    website: 'https://www.capitaluniversity.edu.in',
    supportedDomains: [
      'Education', 'IT & Software', 'Healthcare', 'Agriculture',
      'Skill Development', 'Social Governance', 'Environment'
    ],
    departments: [
      {
        id: 'DEPT-CAP-EDU',
        name: 'Department of Education',
        code: 'EDU',
        headOfDept: 'Head of Department, Education',
        activeLabs: [
          'Teacher Training Unit',
          'Educational Innovation Lab',
        ],
        capabilities: [
          'Teacher Training Programmes', 'School Curriculum Support',
          'Education Quality Assessment', 'Literacy & Numeracy Drive',
          'Inclusive Education Interventions'
        ],
      },
      {
        id: 'DEPT-CAP-CS',
        name: 'Department of Computer Applications',
        code: 'CS',
        headOfDept: 'Head of Department, Computer Applications',
        activeLabs: [
          'Software Development Lab',
          'Digital Skills Training Lab',
        ],
        capabilities: [
          'Digital Skills Training', 'Web Application Development',
          'Data Management Systems', 'Community IT Literacy'
        ],
      },
      {
        id: 'DEPT-CAP-AGRI',
        name: 'Department of Agriculture Science',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Soil Testing Lab',
          'Crop Demonstration Unit',
        ],
        capabilities: [
          'Soil Health Assessment', 'Crop Advisory Services',
          'Mica-Affected Land Reclamation Research', 'Farm Extension Support'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-CAP-01',
        name: 'Faculty — Education Dept',
        departmentId: 'DEPT-CAP-EDU',
        designation: 'Associate Professor',
        specialization: ['Teacher Training', 'Education Quality', 'Inclusive Education'],
        activeProjectsCount: 1,
        email: 'edu@capitaluniversity.edu.in',
      },
    ],
    students: [
      {
        id: 'STU-CAP-01', name: 'Student V', rollNumber: '22EDU001',
        departmentId: 'DEPT-CAP-EDU', year: '3rd Year',
        skills: ['Teaching Methods', 'Curriculum Design', 'Survey'], cgpa: 7.6, creditsEarned: 94,
      },
    ],
  },

  // ── 22. ICFAI University, Ranchi ─────────────────────────────────────────
  // Private ICFAI-group university; management, law, tech & sciences
  {
    id: 'UNI-ICFAI-RANCHI',
    name: 'ICFAI University Jharkhand',
    shortName: 'ICFAI',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.icfaiuniversity.in',
    supportedDomains: [
      'Management & CSR', 'Law & Compliance', 'IT & Software',
      'Commerce & Finance', 'Education', 'Healthcare'
    ],
    departments: [
      {
        id: 'DEPT-ICFAI-MGMT',
        name: 'Faculty of Management Studies',
        code: 'MGMT',
        headOfDept: 'Dean, Faculty of Management',
        activeLabs: [
          'Business Analytics Lab',
          'Finance & Accounting Simulation Unit',
        ],
        capabilities: [
          'CSR Strategy & Impact Reporting', 'Financial Planning for Public Projects',
          'Project Management & Monitoring', 'Social Enterprise Incubation',
          'Market & Feasibility Studies'
        ],
      },
      {
        id: 'DEPT-ICFAI-LAW',
        name: 'Faculty of Law',
        code: 'LAW',
        headOfDept: 'Dean, Faculty of Law',
        activeLabs: [
          'Moot Court & Legal Clinic',
          'Legal Research Unit',
        ],
        capabilities: [
          'Legal Aid & Awareness Clinics', 'Regulatory Compliance Review',
          'Contract & Procurement Drafting', 'Public Interest Litigation Support'
        ],
      },
      {
        id: 'DEPT-ICFAI-CS',
        name: 'Faculty of Science & Technology',
        code: 'CS',
        headOfDept: 'Dean, Faculty of Science & Technology',
        activeLabs: [
          'Software Development Lab',
          'Data Analytics Lab',
        ],
        capabilities: [
          'Application Development', 'Data Analytics & Reporting',
          'FinTech & Digital Payments Support', 'IT for Governance Systems'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-ICFAI-01',
        name: 'Faculty — Management Studies',
        departmentId: 'DEPT-ICFAI-MGMT',
        designation: 'Associate Professor',
        specialization: ['CSR', 'Financial Planning', 'Project Management'],
        activeProjectsCount: 2,
        email: 'mgmt@icfaiuniversity.in',
      },
    ],
    students: [
      {
        id: 'STU-ICFAI-01', name: 'Student W', rollNumber: '22MBA001',
        departmentId: 'DEPT-ICFAI-MGMT', year: 'M.Tech',
        skills: ['Financial Analysis', 'Project Management', 'Data Analytics'], cgpa: 8.1, creditsEarned: 54,
      },
    ],
  },

  // ── 23. Netaji Subhas University, Jamshedpur ─────────────────────────────
  // Private university with broad science, tech & humanities base
  {
    id: 'UNI-NSU-JAMSHEDPUR',
    name: 'Netaji Subhas University',
    shortName: 'NSU',
    district: 'East Singhbhum (Jamshedpur)',
    city: 'Jamshedpur',
    type: 'State University',
    website: 'https://www.netajisubhasuniv.ac.in',
    supportedDomains: [
      'IT & Software', 'Engineering', 'Education', 'Healthcare',
      'Social Governance', 'Environment', 'Commerce & Finance'
    ],
    departments: [
      {
        id: 'DEPT-NSU-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Programming & Data Structures Lab',
          'AI & Machine Learning Lab',
          'Network Security Lab',
        ],
        capabilities: [
          'Software Development', 'Machine Learning Applications',
          'Cybersecurity Audits', 'Data Management & Analytics',
          'Digital Service Platforms'
        ],
      },
      {
        id: 'DEPT-NSU-ECE',
        name: 'Department of Electronics & Communication',
        code: 'ECE',
        headOfDept: 'Head of Department, ECE',
        activeLabs: [
          'Embedded Systems Lab',
          'Communication Systems Lab',
        ],
        capabilities: [
          'Embedded System Design', 'Sensor Networks',
          'Low-Cost Monitoring Devices', 'Rural Communication Solutions'
        ],
      },
      {
        id: 'DEPT-NSU-ENV',
        name: 'Department of Environmental Science',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science',
        activeLabs: [
          'Environmental Monitoring Lab',
          'Waste Management Research Unit',
        ],
        capabilities: [
          'Industrial Pollution Monitoring', 'Solid Waste Management',
          'Water & Air Quality Analysis', 'Green Technology Solutions'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-NSU-01',
        name: 'Faculty — Computer Science Dept',
        departmentId: 'DEPT-NSU-CSE',
        designation: 'Associate Professor',
        specialization: ['Machine Learning', 'Software Engineering', 'Cybersecurity'],
        activeProjectsCount: 2,
        email: 'cse@netajisubhasuniv.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NSU-01', name: 'Student X', rollNumber: '22CSE001',
        departmentId: 'DEPT-NSU-CSE', year: '3rd Year',
        skills: ['Python', 'Java', 'Machine Learning'], cgpa: 7.9, creditsEarned: 98,
      },
    ],
  },

  // ── 24. Radha Govind University, Ramgarh ─────────────────────────────────
  // Private university serving Ramgarh (coal belt) & surrounding areas
  {
    id: 'UNI-RGU-RAMGARH',
    name: 'Radha Govind University',
    shortName: 'RGU',
    district: 'Ramgarh',
    city: 'Ramgarh',
    type: 'State University',
    website: 'https://radhagovinduniversity.com',
    supportedDomains: [
      'Education', 'IT & Software', 'Agriculture', 'Healthcare',
      'Social Governance', 'Skill Development', 'Environment'
    ],
    departments: [
      {
        id: 'DEPT-RGU-EDU',
        name: 'Department of Education',
        code: 'EDU',
        headOfDept: 'Head of Department, Education',
        activeLabs: [
          'Teacher Training Unit',
          'Pedagogy & Innovation Lab',
        ],
        capabilities: [
          'Teacher Capacity Building', 'School Improvement Programmes',
          'Inclusive & Community Education', 'Educational Assessment'
        ],
      },
      {
        id: 'DEPT-RGU-CS',
        name: 'Department of Computer Science & IT',
        code: 'CS',
        headOfDept: 'Head of Department, Computer Science',
        activeLabs: [
          'Software Lab',
          'Digital Literacy Centre',
        ],
        capabilities: [
          'Digital Literacy Training', 'Application Development',
          'Data Systems for Local Governance', 'IT skill Development Camps'
        ],
      },
      {
        id: 'DEPT-RGU-AGRI',
        name: 'Department of Agriculture',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Soil & Water Testing Lab',
          'Crop Demonstration Unit',
        ],
        capabilities: [
          'Soil Health Assessment', 'Crop Advisory & Extension',
          'Coal-Belt Land Reclamation', 'Water Conservation Practices'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-RGU-01',
        name: 'Faculty — Education Dept',
        departmentId: 'DEPT-RGU-EDU',
        designation: 'Associate Professor',
        specialization: ['Teacher Training', 'Inclusive Education', 'Community Education'],
        activeProjectsCount: 1,
        email: 'edu@radhagovinduniversity.com',
      },
    ],
    students: [
      {
        id: 'STU-RGU-01', name: 'Student Y', rollNumber: '22EDU001',
        departmentId: 'DEPT-RGU-EDU', year: '3rd Year',
        skills: ['Teaching Methods', 'Survey', 'Curriculum Design'], cgpa: 7.5, creditsEarned: 92,
      },
    ],
  },

  // ── 25. Sarala Birla University, Ranchi ──────────────────────────────────
  // Private university (est. 2017) with engineering, management & sciences
  {
    id: 'UNI-SBU-RANCHI',
    name: 'Sarala Birla University',
    shortName: 'SBU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://sbu.ac.in',
    supportedDomains: [
      'Engineering & Manufacturing', 'Management & CSR', 'IT & Software',
      'Agriculture', 'Healthcare', 'Environment', 'Energy'
    ],
    departments: [
      {
        id: 'DEPT-SBU-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'AI & Data Science Lab',
          'Software Engineering Lab',
          'IoT & Robotics Lab',
        ],
        capabilities: [
          'AI & ML Solutions', 'Web & Mobile Development',
          'IoT Prototyping', 'Data Analytics', 'Robotics for Rural Applications'
        ],
      },
      {
        id: 'DEPT-SBU-EEE',
        name: 'Department of Electrical & Electronics Engineering',
        code: 'EEE',
        headOfDept: 'Head of Department, EEE',
        activeLabs: [
          'Power Systems Lab',
          'Renewable Energy Lab',
          'Embedded Systems Lab',
        ],
        capabilities: [
          'Solar & Renewable Energy Systems', 'Rural Electrification',
          'Energy Audit & Efficiency', 'Embedded System Design',
          'Smart Metering Solutions'
        ],
      },
      {
        id: 'DEPT-SBU-MGMT',
        name: 'School of Management & Commerce',
        code: 'MGMT',
        headOfDept: 'Dean, School of Management',
        activeLabs: [
          'Business Analytics Lab',
          'Entrepreneurship Development Cell',
        ],
        capabilities: [
          'CSR Programme Management', 'Social Enterprise Development',
          'Financial & Market Analysis', 'Rural Product Marketing',
          'Start-up Incubation Support'
        ],
      },
      {
        id: 'DEPT-SBU-BIO',
        name: 'Department of Biotechnology',
        code: 'BIO',
        headOfDept: 'Head of Department, Biotechnology',
        activeLabs: [
          'Molecular Biology Lab',
          'Environmental Biotechnology Lab',
        ],
        capabilities: [
          'Bioremediation', 'Water & Soil Microbiology Testing',
          'Agricultural Biotechnology', 'Bioprocess Development'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-SBU-01',
        name: 'Faculty — Electrical Engineering Dept',
        departmentId: 'DEPT-SBU-EEE',
        designation: 'Associate Professor',
        specialization: ['Renewable Energy', 'Rural Electrification', 'Smart Grid'],
        activeProjectsCount: 2,
        email: 'eee@sbu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-SBU-01', name: 'Student Z', rollNumber: '22EEE001',
        departmentId: 'DEPT-SBU-EEE', year: '3rd Year',
        skills: ['Solar Systems', 'MATLAB', 'Embedded Systems'], cgpa: 8.0, creditsEarned: 100,
      },
    ],
  },

  // ── 26. Srinath University, Adityapur (Jamshedpur) ───────────────────────
  // Private university in industrial belt; engineering-led (est. 2021)
  {
    id: 'UNI-SRINATH-ADITYAPUR',
    name: 'Srinath University',
    shortName: 'Srinath Univ',
    district: 'East Singhbhum (Jamshedpur)',
    city: 'Adityapur (Jamshedpur)',
    type: 'State University',
    website: 'https://srinathuniversity.ac.in',
    supportedDomains: [
      'Engineering & Manufacturing', 'Infrastructure', 'Energy',
      'IT & Software', 'Healthcare Technology', 'Skill Development'
    ],
    departments: [
      {
        id: 'DEPT-SRI-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Programming & AI Lab',
          'Networking & Cloud Lab',
          'Cybersecurity Lab',
        ],
        capabilities: [
          'Software Development', 'Cloud & Data Services',
          'Cybersecurity', 'AI Applications', 'Industrial Automation Software'
        ],
      },
      {
        id: 'DEPT-SRI-ME',
        name: 'Department of Mechanical Engineering',
        code: 'ME',
        headOfDept: 'Head of Department, Mechanical Engineering',
        activeLabs: [
          'Manufacturing & Fabrication Lab',
          'Industrial Automation Lab',
        ],
        capabilities: [
          'Metal Fabrication & Machining', 'Industrial Equipment Maintenance',
          'Automation & Control Systems', 'Prototype Manufacturing',
          'Agricultural Machinery Design'
        ],
      },
      {
        id: 'DEPT-SRI-EE',
        name: 'Department of Electrical Engineering',
        code: 'EE',
        headOfDept: 'Head of Department, Electrical Engineering',
        activeLabs: [
          'Power & Control Lab',
          'Renewable Energy Lab',
        ],
        capabilities: [
          'Power System Maintenance', 'Renewable Energy Installation',
          'Energy Efficiency Audits', 'Industrial Control Systems'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-SRI-01',
        name: 'Faculty — Mechanical Engineering Dept',
        departmentId: 'DEPT-SRI-ME',
        designation: 'Associate Professor',
        specialization: ['Manufacturing', 'Automation', 'Prototyping'],
        activeProjectsCount: 2,
        email: 'me@srinathuniversity.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-SRI-01', name: 'Student AA', rollNumber: '22ME001',
        departmentId: 'DEPT-SRI-ME', year: '3rd Year',
        skills: ['CAD/CAM', 'CNC', 'Automation'], cgpa: 7.8, creditsEarned: 96,
      },
    ],
  },

  // ── 27. Usha Martin University, Ranchi ───────────────────────────────────
  // Private university with strong engineering, IT & management schools
  {
    id: 'UNI-UMU-RANCHI',
    name: 'Usha Martin University',
    shortName: 'UMU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.ushamartinuniversity.com',
    supportedDomains: [
      'IT & Software', 'Engineering', 'Management & CSR', 'Healthcare',
      'Education', 'Agriculture', 'Energy'
    ],
    departments: [
      {
        id: 'DEPT-UMU-CSE',
        name: 'School of Engineering & Technology — CSE',
        code: 'CSE',
        headOfDept: 'Head, School of Engineering & Technology',
        activeLabs: [
          'AI & Data Science Lab',
          'Software Engineering Lab',
          'IoT & Networks Lab',
        ],
        capabilities: [
          'AI & ML Applications', 'Web & Mobile Development',
          'IoT System Design', 'Data Analytics', 'E-Services Platforms'
        ],
      },
      {
        id: 'DEPT-UMU-MGMT',
        name: 'School of Management',
        code: 'MGMT',
        headOfDept: 'Dean, School of Management',
        activeLabs: [
          'Business Analytics Lab',
          'CSR & Sustainability Unit',
        ],
        capabilities: [
          'CSR Programme Management', 'Social Enterprise Development',
          'Project & Programme Monitoring', 'Impact Assessment',
          'Financial & Resource Planning'
        ],
      },
      {
        id: 'DEPT-UMU-CIV',
        name: 'School of Engineering & Technology — Civil',
        code: 'CIV',
        headOfDept: 'Head, Civil Engineering Programme',
        activeLabs: [
          'Construction Materials Lab',
          'Structural & Surveying Lab',
        ],
        capabilities: [
          'Infrastructure Assessment', 'Construction Technology',
          'Water Supply & Sanitation Design', 'Structural Health Evaluation'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-UMU-01',
        name: 'Faculty — Management School',
        departmentId: 'DEPT-UMU-MGMT',
        designation: 'Associate Professor',
        specialization: ['CSR', 'Impact Assessment', 'Project Management'],
        activeProjectsCount: 2,
        email: 'mgmt@ushamartinuniversity.com',
      },
    ],
    students: [
      {
        id: 'STU-UMU-01', name: 'Student AB', rollNumber: '22CSE001',
        departmentId: 'DEPT-UMU-CSE', year: '3rd Year',
        skills: ['Python', 'React', 'Machine Learning'], cgpa: 7.9, creditsEarned: 100,
      },
    ],
  },

  // ── 28. YBN University, Ranchi ───────────────────────────────────────────
  // Private university with engineering, pharmacy, management & law schools
  {
    id: 'UNI-YBN-RANCHI',
    name: 'YBN University',
    shortName: 'YBN',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.ybnuniversity.org',
    supportedDomains: [
      'Engineering', 'Healthcare', 'Pharmaceuticals', 'Management & CSR',
      'IT & Software', 'Agriculture', 'Education'
    ],
    departments: [
      {
        id: 'DEPT-YBN-CSE',
        name: 'Department of Computer Science & Engineering',
        code: 'CSE',
        headOfDept: 'Head of Department, CSE',
        activeLabs: [
          'Programming & AI Lab',
          'IoT & Embedded Lab',
          'Software Development Lab',
        ],
        capabilities: [
          'Software Development', 'AI & Data Analytics',
          'IoT Prototyping', 'Digital Service Platforms', 'Cybersecurity Basics'
        ],
      },
      {
        id: 'DEPT-YBN-PHARM',
        name: 'School of Pharmacy',
        code: 'PHARM',
        headOfDept: 'Dean, School of Pharmacy',
        activeLabs: [
          'Pharmaceutical Analysis Lab',
          'Quality Control & Testing Lab',
          'Formulation & Development Lab',
        ],
        capabilities: [
          'Drug Quality Testing', 'Pharmaceutical Analysis',
          'Water & Sanitation Chemistry Testing', 'Essential Medicine Supply Support',
          'Community Health Awareness'
        ],
      },
      {
        id: 'DEPT-YBN-NURS',
        name: 'School of Nursing & Allied Health',
        code: 'NURS',
        headOfDept: 'Dean, School of Nursing',
        activeLabs: [
          'Clinical Skills Lab',
          'Community Health Unit',
        ],
        capabilities: [
          'Community Health Camps', 'Maternal & Child Health Support',
          'Vaccination Drive Support', 'Health & Nutrition Awareness',
          'Basic Diagnostic Outreach'
        ],
      },
      {
        id: 'DEPT-YBN-MGMT',
        name: 'School of Management & Commerce',
        code: 'MGMT',
        headOfDept: 'Dean, School of Management',
        activeLabs: [
          'Business Analytics Lab',
          'Entrepreneurship Cell',
        ],
        capabilities: [
          'CSR Project Management', 'Market Feasibility Studies',
          'Social Enterprise Development', 'Financial Planning'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-YBN-01',
        name: 'Faculty — School of Pharmacy',
        departmentId: 'DEPT-YBN-PHARM',
        designation: 'Associate Professor',
        specialization: ['Pharmaceutical Analysis', 'Quality Control', 'Public Health'],
        activeProjectsCount: 2,
        email: 'pharm@ybnuniversity.org',
      },
    ],
    students: [
      {
        id: 'STU-YBN-01', name: 'Student AC', rollNumber: '22PHARM001',
        departmentId: 'DEPT-YBN-PHARM', year: '3rd Year',
        skills: ['Lab Testing', 'Pharmaceutical Analysis', 'Quality Control'], cgpa: 7.7, creditsEarned: 98,
      },
    ],
  },

  // ── 29. Pragyan International University, Ranchi ──────────────────────────
  // Private university with international focus; sciences & liberal arts
  {
    id: 'UNI-PIU-RANCHI',
    name: 'Pragyan International University',
    shortName: 'PIU',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://piu.ac.in',
    supportedDomains: [
      'International Collaboration', 'Agriculture', 'Environmental Science',
      'Healthcare', 'Education', 'Social Governance', 'Sustainable Development'
    ],
    departments: [
      {
        id: 'DEPT-PIU-ENV',
        name: 'Department of Environmental & Climate Science',
        code: 'ENV',
        headOfDept: 'Head of Department, Environmental Science',
        activeLabs: [
          'Climate Change Research Lab',
          'Renewable Energy Demonstration Unit',
          'Water & Soil Analysis Lab',
        ],
        capabilities: [
          'Climate Risk Assessment', 'Renewable Energy Feasibility Studies',
          'Sustainable Water Management', 'Carbon Footprint Analysis',
          'Green Livelihood Programmes'
        ],
      },
      {
        id: 'DEPT-PIU-AGRI',
        name: 'Department of Sustainable Agriculture',
        code: 'AGR',
        headOfDept: 'Head of Department, Agriculture',
        activeLabs: [
          'Organic Farming Demonstration Plot',
          'Seed & Soil Bank Lab',
        ],
        capabilities: [
          'Organic & Climate-Resilient Farming', 'Agro-Ecology Research',
          'Crop Diversification Advisory', 'Community Seed Conservation'
        ],
      },
      {
        id: 'DEPT-PIU-SOC',
        name: 'Department of Social Sciences & Development',
        code: 'SOC',
        headOfDept: 'Head of Department, Social Sciences',
        activeLabs: [
          'Sustainable Development Research Unit',
          'International Development Lab',
        ],
        capabilities: [
          'Sustainable Development Goal (SDG) Mapping',
          'Social Enterprise & Livelihood Development',
          'Cross-Border Good Practice Exchange',
          'Impact Assessment & Monitoring'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-PIU-01',
        name: 'Faculty — Environmental & Climate Dept',
        departmentId: 'DEPT-PIU-ENV',
        designation: 'Associate Professor',
        specialization: ['Climate Risk', 'Renewable Energy', 'Sustainable Water'],
        activeProjectsCount: 2,
        email: 'env@piu.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-PIU-01', name: 'Student AD', rollNumber: '22ENV001',
        departmentId: 'DEPT-PIU-ENV', year: '3rd Year',
        skills: ['Climate Modelling', 'GIS', 'Impact Assessment'], cgpa: 7.8, creditsEarned: 96,
      },
    ],
  },

  // ── 30. Amity University Jharkhand, Ranchi ───────────────────────────────
  // Private university; engineering, management, law, journalism & applied sciences
  {
    id: 'UNI-AMITY-RANCHI',
    name: 'Amity University Jharkhand',
    shortName: 'Amity',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    website: 'https://www.amity.edu/ranchi',
    supportedDomains: [
      'Engineering & Manufacturing', 'IT & Software', 'Management & CSR',
      'Medicine & Healthcare', 'Journalism & Media', 'Law', 'Education'
    ],
    departments: [
      {
        id: 'DEPT-AMITY-CSE',
        name: 'Amity School of Engineering & Technology — CSE',
        code: 'CSE',
        headOfDept: 'Director, Amity School of Engineering & Technology',
        activeLabs: [
          'AI & Data Science Lab',
          'IoT & Embedded Systems Lab',
          'Cyber Security Lab',
          'Robotics & Automation Lab',
        ],
        capabilities: [
          'AI & ML Solutions', 'IoT & Sensor Networks',
          'Cybersecurity', 'Robotics for Industrial Applications',
          'Smart Infrastructure Systems', 'Data Analytics Platforms'
        ],
      },
      {
        id: 'DEPT-AMITY-MGMT',
        name: 'Amity School of Business',
        code: 'MGMT',
        headOfDept: 'Director, Amity School of Business',
        activeLabs: [
          'Business Analytics Lab',
          'CSR & Corporate Relations Unit',
        ],
        capabilities: [
          'CSR Strategy & Fund Mobilisation', 'Corporate Partnership Development',
          'Impact Measurement & Reporting', 'Project Management',
          'Social Media & Community Engagement Campaigns'
        ],
      },
      {
        id: 'DEPT-AMITY-JOUR',
        name: 'Amity School of Communication',
        code: 'JOUR',
        headOfDept: 'Director, Amity School of Communication',
        activeLabs: [
          'Radio & Podcast Studio',
          'Video Production & Editing Lab',
          'Digital & Social Media Lab',
        ],
        capabilities: [
          'Citizen Awareness Campaigns', 'Public Service Announcements',
          'Crisis & Disaster Communication', 'Digital Content Creation',
          'Local Language Media Outreach'
        ],
      },
      {
        id: 'DEPT-AMITY-PHYSIO',
        name: 'Amity School of Physiotherapy & Allied Health',
        code: 'ALLIED',
        headOfDept: 'Director, Allied Health Sciences',
        activeLabs: [
          'Rehabilitation Therapy Lab',
          'Community Health Unit',
        ],
        capabilities: [
          'Community Health & Wellness Camps', 'Rehabilitation Support',
          'Disability & Accessibility Assessments', 'Health Awareness Programmes'
        ],
      },
    ],
    faculty: [
      {
        id: 'FAC-AMITY-01',
        name: 'Faculty — Computer Science School',
        departmentId: 'DEPT-AMITY-CSE',
        designation: 'Associate Professor',
        specialization: ['AI', 'IoT', 'Cybersecurity'],
        activeProjectsCount: 3,
        email: 'cse@amity.edu',
      },
    ],
    students: [
      {
        id: 'STU-AMITY-01', name: 'Student AE', rollNumber: '22CSE001',
        departmentId: 'DEPT-AMITY-CSE', year: '4th Year',
        skills: ['Python', 'IoT', 'Machine Learning'], cgpa: 8.2, creditsEarned: 130,
      },
    ],
  },
];

// ── Helper: get university by ID ─────────────────────────────────────────────
export function getUniversityById(id: string): UniversityDoc | undefined {
  return JHARKHAND_UNIVERSITIES.find(u => u.id === id);
}

// ── Helper: get universities by district ─────────────────────────────────────
export function getUniversitiesByDistrict(district: string): UniversityDoc[] {
  return JHARKHAND_UNIVERSITIES.filter(
    u => u.district.toLowerCase().includes(district.toLowerCase())
  );
}

// ── Helper: get universities supporting a domain ────────────────────────────
export function getUniversitiesByDomain(domain: string): UniversityDoc[] {
  const domainLower = domain.toLowerCase();
  return JHARKHAND_UNIVERSITIES.filter(u =>
    u.supportedDomains.some(d => d.toLowerCase().includes(domainLower))
  );
}
