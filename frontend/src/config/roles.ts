// Single source of truth: display -> DB enum
export const ROLE_MAP: Record<string, string> = {
  'Citizen': 'CITIZEN',
  'Community / NGO': 'COMMUNITY_NGO',
  'PRI (Panchayat)': 'PRI',
  'ULB': 'ULB',
  'Government Validator': 'GOV_VALIDATOR',
  'Government Department': 'GOV_DEPARTMENT',
  'University Admin': 'UNIVERSITY',
  'Faculty / Mentor': 'FACULTY',
  'Student': 'STUDENT',
  'Industry / MSME': 'INDUSTRY',
  'CSR Organization': 'CSR',
  'Lab': 'LAB',
  'Platform Super Admin': 'SUPER_ADMIN',
};

export const DISPLAY_MAP: Record<string, string> = {
  CITIZEN: 'Citizen',
  COMMUNITY_NGO: 'Community / NGO',
  PRI: 'PRI (Panchayat)',
  ULB: 'ULB',
  GOV_VALIDATOR: 'Government Validator',
  GOV_DEPARTMENT: 'Government Department',
  UNIVERSITY: 'University Admin',
  FACULTY: 'Faculty / Mentor',
  STUDENT: 'Student',
  INDUSTRY: 'Industry / MSME',
  CSR: 'CSR Organization',
  LAB: 'Lab',
  SUPER_ADMIN: 'Platform Super Admin',
};
