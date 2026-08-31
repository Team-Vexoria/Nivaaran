/**
 * NIVAARAN — Jharkhand Higher Education Institution (HEI) Dataset
 * Real-world data for 11 institutions sourced from:
 *   - iitism.ac.in, nitjsr.ac.in, bitmesra.ac.in, cuj.ac.in
 *   - ranchiuniversity.ac.in, vbu.ac.in, skmu.ac.in, xlri.ac.in
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
