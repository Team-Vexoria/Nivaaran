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
        create: { ...u, is_active: true, roles: { create: u.roles.map((r) => ({ role_name: r })) } },
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
      await tx.$executeRawUnsafe(
        `INSERT INTO "Challenge" (id, title, description, status, district_code, block_code, submitter_id, category, version, source, source_id, submitter_type, visibility, location, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,'DEMO',$9,'CITIZEN','PUBLIC',ST_SetSRID(ST_MakePoint(85.3,23.5),4326),NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, district_code = EXCLUDED.district_code, block_code = EXCLUDED.block_code;`,
        c.id, c.title, c.description, c.status, c.district_code, c.block_code, c.submitter_id, c.category, c.id
      );
    }
  }
}

  console.log(`Demo seed: ${DEMO_USERS.length} users, ${DEMO_CHALLENGES.length} challenges`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
