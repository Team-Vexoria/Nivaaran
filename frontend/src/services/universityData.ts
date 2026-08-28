export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  headOfDept: string;
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
  type: 'Central University' | 'National Institute' | 'State University' | 'Deemed University';
  departments: DepartmentInfo[];
  faculty: FacultyMentor[];
  students: StudentRosterItem[];
  supportedDomains: string[];
}

export const JHARKHAND_UNIVERSITIES: UniversityDoc[] = [
  {
    id: 'UNI-BIT-MESRA',
    name: 'Birsa Institute of Technology (BIT Mesra), Ranchi',
    shortName: 'BIT Mesra',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'Deemed University',
    supportedDomains: ['Disaster Management', 'Water Resources', 'Environment', 'Urban Dev', 'Transport', 'Agriculture'],
    departments: [
      {
        id: 'DEPT-BIT-ENV',
        name: 'Department of Environmental Science & Engineering',
        code: 'ENV',
        headOfDept: 'Dr. Ananya Roy',
        activeLabs: ['Water Quality & Fluoride Testing Lab', 'Air & Chemical Emissions Assay Hub'],
        capabilities: ['Water Contamination Analysis', 'Arsenic/Fluoride Filtration', 'Effluent Testing'],
      },
      {
        id: 'DEPT-BIT-GIS',
        name: 'Department of Remote Sensing & GIS',
        code: 'GIS',
        headOfDept: 'Dr. R.K. Sharma',
        activeLabs: ['GIS Drone Survey & Satellite Telemetry Hub', 'Disaster Hazard Risk Mapping Unit'],
        capabilities: ['Flood Inundation Mapping', 'Satellite Imagery Analysis', 'Landslide Vulnerability Zonation'],
      },
      {
        id: 'DEPT-BIT-CS',
        name: 'Department of Computer Science & Automation',
        code: 'CSE',
        headOfDept: 'Prof. S. Mukhopadhyay',
        activeLabs: ['IoT Flood Telemetry Lab', 'AI Vision Early Warning Center'],
        capabilities: ['IoT Water Sensor Nodes', 'AI Early Warning Telemetry', 'Mobile Citizen Tracking'],
      },
      {
        id: 'DEPT-BIT-CIVIL',
        name: 'Department of Civil & Structural Engineering',
        code: 'CIV',
        headOfDept: 'Dr. Alok Verma',
        activeLabs: ['Hydraulic Drainage Testing Facility', 'Embankment Stability Testing Rig'],
        capabilities: ['Canal & Drainage Design', 'Culvert Design', 'Flood Barrier Engineering'],
      },
    ],
    faculty: [
      {
        id: 'FAC-BIT-01',
        name: 'Dr. Ananya Roy',
        departmentId: 'DEPT-BIT-ENV',
        designation: 'Professor & HOD',
        specialization: ['Water Contamination', 'Arsenic Remediation', 'Environmental Monitoring'],
        activeProjectsCount: 2,
        email: 'ananya.roy@bitmesra.ac.in',
      },
      {
        id: 'FAC-BIT-02',
        name: 'Dr. R.K. Sharma',
        departmentId: 'DEPT-BIT-GIS',
        designation: 'Associate Professor',
        specialization: ['GIS Flood Mapping', 'Drone Aerial Survey', 'Remote Sensing'],
        activeProjectsCount: 1,
        email: 'rk.sharma@bitmesra.ac.in',
      },
      {
        id: 'FAC-BIT-03',
        name: 'Prof. S. Mukhopadhyay',
        departmentId: 'DEPT-BIT-CS',
        designation: 'Professor',
        specialization: ['IoT Telemetry', 'Embedded Wireless Sensors', 'AI Signal Processing'],
        activeProjectsCount: 3,
        email: 'smukherjee@bitmesra.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-BIT-101',
        name: 'Ayush Kumar Singh',
        rollNumber: 'BTECH/10042/22',
        departmentId: 'DEPT-BIT-CS',
        year: '4th Year',
        skills: ['IoT Sensors', 'ESP32 Telemetry', 'Python AI', 'React Dashboard'],
        cgpa: 8.9,
        creditsEarned: 12,
      },
      {
        id: 'STU-BIT-102',
        name: 'Sneha Kumari',
        rollNumber: 'BTECH/10185/22',
        departmentId: 'DEPT-BIT-GIS',
        year: '4th Year',
        skills: ['ArcGIS Pro', 'QGIS', 'Drone Flight Planning', 'Spatial Risk Analytics'],
        cgpa: 9.1,
        creditsEarned: 16,
      },
      {
        id: 'STU-BIT-103',
        name: 'Rohit Raj',
        rollNumber: 'BTECH/10230/23',
        departmentId: 'DEPT-BIT-ENV',
        year: '3rd Year',
        skills: ['Water Quality Spectrophotometry', 'Chemical Titration', 'Soil Testing'],
        cgpa: 8.4,
        creditsEarned: 8,
      },
      {
        id: 'STU-BIT-104',
        name: 'Priyanshu Verma',
        rollNumber: 'BTECH/10310/22',
        departmentId: 'DEPT-BIT-CIVIL',
        year: '4th Year',
        skills: ['AutoCAD Hydraulic', 'SWMM Flood Simulation', 'Concrete Structural Audit'],
        cgpa: 8.7,
        creditsEarned: 10,
      },
    ],
  },
  {
    id: 'UNI-NIT-JSR',
    name: 'National Institute of Technology (NIT Jamshedpur)',
    shortName: 'NIT Jamshedpur',
    district: 'East Singhbhum',
    city: 'Jamshedpur',
    type: 'National Institute',
    supportedDomains: ['Disaster Management', 'Roads & Bridges', 'Mining', 'Urban Dev', 'Transport', 'Waste Management'],
    departments: [
      {
        id: 'DEPT-NIT-CIVIL',
        name: 'Department of Civil Engineering',
        code: 'CIV',
        headOfDept: 'Dr. Vikramaditya Singh',
        activeLabs: ['Structural Risk & Bridge Testing Rig', 'Geotechnical Testing Facility'],
        capabilities: ['Bridge Inspection', 'Pothole & Pavement Testing', 'Slope Stabilization'],
      },
      {
        id: 'DEPT-NIT-ECE',
        name: 'Department of Electronics & Communication',
        code: 'ECE',
        headOfDept: 'Dr. Sunita Murmu',
        activeLabs: ['Embedded Radar & Ultrasonic Sensor Center', 'LoRaWAN Long-Range Mesh Lab'],
        capabilities: ['LoRaWAN Flood Sensors', 'Ultrasonic Water Leveling', 'Early Sirens'],
      },
    ],
    faculty: [
      {
        id: 'FAC-NIT-01',
        name: 'Dr. Vikramaditya Singh',
        departmentId: 'DEPT-NIT-CIVIL',
        designation: 'Professor',
        specialization: ['Bridge Safety', 'Highway Infrastructure', 'Landslide Barriers'],
        activeProjectsCount: 1,
        email: 'vsingh.civil@nitjsr.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-NIT-201',
        name: 'Aakash Mahato',
        rollNumber: '2022UGCE044',
        departmentId: 'DEPT-NIT-CIVIL',
        year: '4th Year',
        skills: ['Pavement Mechanics', 'Bridge Deflection Audit', 'STAAD Pro'],
        cgpa: 8.8,
        creditsEarned: 14,
      },
      {
        id: 'STU-NIT-202',
        name: 'Deepak Kumar Hembrom',
        rollNumber: '2022UGEC018',
        departmentId: 'DEPT-NIT-ECE',
        year: '4th Year',
        skills: ['LoRaWAN Firmware', 'Ultrasonic Depth Hardware', 'Solar Sensor Management'],
        cgpa: 8.6,
        creditsEarned: 12,
      },
    ],
  },
  {
    id: 'UNI-IIT-ISM',
    name: 'Indian Institute of Technology (IIT ISM), Dhanbad',
    shortName: 'IIT (ISM) Dhanbad',
    district: 'Dhanbad',
    city: 'Dhanbad',
    type: 'Central University',
    supportedDomains: ['Mining', 'Disaster Management', 'Water Resources', 'Environment', 'Energy'],
    departments: [
      {
        id: 'DEPT-ISM-MINE',
        name: 'Department of Mining & Geomechanics',
        code: 'MIN',
        headOfDept: 'Dr. Pradeep Mahato',
        activeLabs: ['Coal Mine Subsidence Simulation Lab', 'Mine Fire Gas Detection Center'],
        capabilities: ['Underground Fire Telemetry', 'Mine Subsidence Audit', 'Gas Sensor Arrays'],
      },
      {
        id: 'DEPT-ISM-AGEO',
        name: 'Department of Applied Geology',
        code: 'AGEO',
        headOfDept: 'Dr. S.K. Sinha',
        activeLabs: ['Hydro-Geology & Aquifer Assay Center', 'Seismic Fault Line Center'],
        capabilities: ['Groundwater Depletion Hydrogeology', 'Borewell Aquifer Mapping'],
      },
    ],
    faculty: [
      {
        id: 'FAC-ISM-01',
        name: 'Dr. Pradeep Mahato',
        departmentId: 'DEPT-ISM-MINE',
        designation: 'Professor',
        specialization: ['Mine Subsidence', 'Coal Mine Fires', 'Geotechnical Hazard'],
        activeProjectsCount: 3,
        email: 'pmahato@iitism.ac.in',
      },
    ],
    students: [
      {
        id: 'STU-ISM-301',
        name: 'Suman Sourav',
        rollNumber: '21JE0892',
        departmentId: 'DEPT-ISM-MINE',
        year: 'M.Tech',
        skills: ['Geotechnical Radar', 'Sub-Surface Thermal Imaging', 'Mine Safety Protocol'],
        cgpa: 9.3,
        creditsEarned: 20,
      },
    ],
  },
  {
    id: 'UNI-BAU-KANKE',
    name: 'Birsa Agricultural University (BAU), Ranchi',
    shortName: 'BAU Kanke',
    district: 'Ranchi',
    city: 'Ranchi',
    type: 'State University',
    supportedDomains: ['Agriculture', 'Forestry & Wildlife', 'Environment', 'Water Resources'],
    departments: [
      {
        id: 'DEPT-BAU-AGRO',
        name: 'Department of Agronomy & Crop Protection',
        code: 'AGRO',
        headOfDept: 'Dr. Ramesh Prasad',
        activeLabs: ['Crop Pest & Disease Diagnostic Lab', 'Soil Health Assay Center'],
        capabilities: ['Crop Disease Identification', 'Pesticide Soil Assays', 'Drought Resistant Seeds'],
      },
      {
        id: 'DEPT-BAU-FOR',
        name: 'Department of Forestry & Wildlife Management',
        code: 'FOR',
        headOfDept: 'Dr. Priya Hansda',
        activeLabs: ['Elephant & Wildlife Tracking Unit', 'Bio-Telemetry & Habitat Mapping'],
        capabilities: ['Human-Elephant Conflict Mitigation', 'Acoustic Deterrents', 'Forest Corridor Mapping'],
      },
    ],
    faculty: [
      {
        id: 'FAC-BAU-01',
        name: 'Dr. Priya Hansda',
        departmentId: 'DEPT-BAU-FOR',
        designation: 'Associate Professor',
        specialization: ['Elephant Corridor Telemetry', 'Human-Wildlife Coexistence', 'Forest Bio-Acoustics'],
        activeProjectsCount: 1,
        email: 'priya.hansda@bauranchi.org',
      },
    ],
    students: [
      {
        id: 'STU-BAU-401',
        name: 'Karan Munda',
        rollNumber: 'BAU/FOR/2022/14',
        departmentId: 'DEPT-BAU-FOR',
        year: '4th Year',
        skills: ['Bio-Acoustic Sensors', 'Elephant Thermal Cameras', 'Community Siren Setup'],
        cgpa: 8.9,
        creditsEarned: 15,
      },
    ],
  },
];
