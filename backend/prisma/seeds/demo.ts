
import { PrismaClient, ChallengeStatus } from '@prisma/client';
import { v4 as uuid } from 'crypto';
// Node 20 has crypto.randomUUID built-in; this import satisfies older TS targets

const prisma = new PrismaClient();

// Multi-role demo users
const DEMO_USERS = [
  { id: 'demo-citizen', firebase_uid: 'demo-citizen', name: 'Riya Devi', email: 'riya@jhar.example', roles: ['CITIZEN'] },
  { id: 'demo-faculty', firebase_uid: 'demo-faculty', name: 'Prof. A. Kumar', email: 'akumar@xyz.edu.in', roles: ['FACULTY'] },
  { id: 'demo-validator', firebase_uid: 'demo-validator', name: 'Officer Meena', email: 'meena@gov.example', roles: ['GOV_VALIDATOR'] },
  { id: 'demo-department', firebase_uid: 'demo-department', name: 'Dept. Officer Singh', email: 'singh@gov.example', roles: ['GOV_DEPARTMENT'] },
  { id: 'demo-university', firebase_uid: 'demo-university', name: 'Univ. Admin', email: 'admin@jmzu.ac.in', roles: ['UNIVERSITY'] },
];

// Sample challenges spanning active lifecycle statuses
const DEMO_CHALLENGES = [
  {
    id: 'demo-ch-1', title: 'Floodwater logging in Ranchi wards',
    description: 'Monsoon waterlogging recurs annually in Kanke and Harmu wards.',
    status: ChallengeStatus.IN_REVIEW, district_code: 'RANCHI', block_code: 'RANCHI_KANKE',
    submitter_id: 'demo-citizen',
  },
  {
    id: 'demo-ch-2', title: 'Child malnutrition screening gap',
    description: 'ASHA reports irregular growth tracking in rural blocks of Gumla.',
    status: ChallengeStatus.UNDERSTANDING, district_code: 'GUMLA', block_code: 'GUMLA_KANKE',
    submitter_id: 'demo-citizen',
  },
  {
    id: 'demo-ch-3', title: 'STP treatment capacity shortfall',
    description: 'Existing STPs in Dhanbad operate above rated capacity during summer.',
    status: ChallengeStatus.VALIDATION_PENDING, district_code: 'DHANBAD', block_code: 'DHANBAD_KANKE',
    submitter_id: 'demo-citizen',
  },
  {
    id: 'demo-ch-4', title: 'Rooftop solar on government schools',
    description: 'Proposal to install rooftop PV on 50 schools in Khunti block.',
    status: ChallengeStatus.CLUSTERED, district_code: 'KHOUNTI', block_code: 'KHOUNTI_KANKE',
    submitter_id: 'demo-faculty',
  },
  {
    id: 'demo-ch-5', title: 'Drone-based road landslide survey',
    description: 'UAV road-inspection proposal for Giridih hills.',
    status: ChallengeStatus.MATCHED, district_code: 'GIRIDIH', block_code: 'GIRIDIH_KANKE',
    submitter_id: 'demo-faculty',
  },
  {
    id: 'demo-ch-6', title: 'Hand pump arsenic remediation',
    description: 'Arsenic-affected hand pumps in Simdega block.',
    status: ChallengeStatus.IN_PILOT, district_code: 'SIMDEGA', block_code: 'SIMDEGA_KANKE',
    submitter_id: 'demo-citizen',
  },
  {
    id: 'demo-ch-7', title: 'MGNREGA wage transparency',
    description: 'Demand for real-time wage display at worksites.',
    status: ChallengeStatus.IN_PROGRESS, district_code: 'RAMGARH', block_code: 'RAMGARH_KANKE',
    submitter_id: 'demo-citizen',
  },
  {
    id: 'demo-ch-8', title: 'Community forest fire early warning',
    description: 'IoT-based fire detection for reserve forests in Latehar.',
    status: ChallengeStatus.IN_DEPLOYMENT, district_code: 'LATEHAR', block_code: 'LATEHAR_KANKE',
    submitter_id: 'demo-faculty',
  },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const u of DEMO_USERS) {
      await tx.user.upsert({
        where: { firebase_uid: u.firebase_uid },
        update: { name: u.name, email: u.email },
        create: { ...u, is_active: true },
      });
      // Attach all listed roles
      for (const roleName of u.roles) {
        await tx.userRoleLink.upsert({
          where: { user_id_role_name: { user_id: u.id, role_name: roleName } },
          update: {},
          create: { user_id: u.id, role_name: roleName, granted_at: new Date() },
        });
      }
    }

    for (const c of DEMO_CHALLENGES) {
      await tx.challenge.upsert({
        where: { id: c.id },
        update: { title: c.title, description: c.description, status: c.status, district_code: c.district_code, block_code: c.block_code },
        create: {
          ...c,
          version: 1,
          created_by: c.submitter_id,
          updated_by: c.submitter_id,
          location: { type: 'Point', coordinates: [85.3, 23.5] },
          impact: { type: 'Point', coordinates: [85.3, 23.5] },
          source: 'DEMO',
          source_id: c.id,
          visibility: 'PUBLIC',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  });

  console.log(`Demo seed: ${DEMO_USERS.length} users, ${DEMO_CHALLENGES.length} challenges`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
