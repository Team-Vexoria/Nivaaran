import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Capability registry (mirrors core/auth.ts ROLE_CAPABILITIES)
const ROLE_CAPABILITIES: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  GOV_VALIDATOR: ['challenge:validate', 'challenge:reject', 'challenge:requestClarification', 'challenge:understand', 'validation:confirm'],
  GOV_DEPARTMENT: ['challenge:prioritize', 'challenge:cluster', 'challenge:match', 'matching:accept', 'matching:decline', 'project:prototype', 'project:pilot', 'project:validate', 'deployment:approve', 'impact:verify', 'challenge:close', 'workflow:escalate', 'workflow:resolve'],
  UNIVERSITY: ['matching:accept', 'matching:decline'],
  FACULTY: ['proposal:submit', 'proposal:approve', 'proposal:requestRevision'],
  STUDENT: ['proposal:submit'],
  INDUSTRY: ['proposal:submit'],
  CSR: ['proposal:submit'],
  LAB: ['proposal:submit'],
  COMMUNITY_NGO: ['challenge:resubmit', 'challenge:comment'],
  CITIZEN: ['challenge:create', 'challenge:resubmit'],
  PRI: ['challenge:create', 'challenge:resubmit'],
  ULB: ['challenge:create', 'challenge:resubmit'],
};

// ── 1. Roles ──────────────────────────────────────────────

const ROLES: { name: UserRole; description: string; priority: number }[] = [
  { name: 'CITIZEN', description: 'General public', priority: 100 },
  { name: 'COMMUNITY_NGO', description: 'Community NGO / civil-society org', priority: 95 },
  { name: 'PRI', description: 'Panchayati Raj Institution', priority: 90 },
  { name: 'ULB', description: 'Urban Local Body', priority: 90 },
  { name: 'GOV_VALIDATOR', description: 'Government front-of-funnel validator', priority: 80 },
  { name: 'GOV_DEPARTMENT', description: 'Government back-of-funnel department', priority: 80 },
  { name: 'UNIVERSITY', description: 'University admin / VC office', priority: 75 },
  { name: 'FACULTY', description: 'University faculty member', priority: 70 },
  { name: 'STUDENT', description: 'University student', priority: 65 },
  { name: 'INDUSTRY', description: 'Industry partner', priority: 65 },
  { name: 'CSR', description: 'Corporate CSR body', priority: 65 },
  { name: 'LAB', description: 'Research / testing lab', priority: 65 },
  { name: 'SUPER_ADMIN', description: 'Platform super-administrator', priority: 10 },
];

// ── 2. Capability registry → ~40 permissions ──────────────

// Deduplicate capabilities across roles
const CAPABILITY_SETS = Object.values(ROLE_CAPABILITIES);
const allCapabilities = [...new Set(CAPABILITY_SETS.flat())];

const CAPABILITY_DESCRIPTIONS: Record<string, string> = {
  'challenge:create': 'Submit a new challenge',
  'challenge:resubmit': 'Resubmit after clarification',
  'challenge:comment': 'Comment on a challenge',
  'challenge:understand': 'Trigger AI understanding',
  'challenge:validate': 'Validate AI analysis',
  'challenge:reject': 'Reject a challenge',
  'challenge:requestClarification': 'Request clarification from submitter',
  'challenge:prioritize': 'Prioritize challenge in pipeline',
  'challenge:cluster': 'Assign challenge to a cluster',
  'challenge:match': 'Trigger university matching',
  'challenge:close': 'Close a challenge',
  'matching:accept': 'Accept a university match',
  'matching:decline': 'Decline a university match',
  'proposal:submit': 'Submit a proposal',
  'proposal:approve': 'Approve a proposal',
  'proposal:requestRevision': 'Request revision on a proposal',
  'project:prototype': 'Approve prototype',
  'project:pilot': 'Approve pilot',
  'project:validate': 'Validate pilot outcome',
  'validation:confirm': 'Confirm validation report',
  'deployment:approve': 'Approve deployment',
  'impact:verify': 'Verify impact',
  'workflow:escalate': 'Escalate within workflow',
  'workflow:resolve': 'Resolve an escalation',
};

async function main() {
  await prisma.$transaction(async (tx) => {
    // Roles
    for (const r of ROLES) {
      await tx.role.upsert({
        where: { name: r.name },
        update: { description: r.description, priority: r.priority },
        create: { ...r },
      });
    }

    // Permissions
    for (const cap of allCapabilities) {
      await tx.permission.upsert({
        where: { capability: cap },
        update: { description: CAPABILITY_DESCRIPTIONS[cap] ?? cap },
        create: { capability: cap, description: CAPABILITY_DESCRIPTIONS[cap] ?? cap },
      });
    }

    // Role<->Permission grants (the matrix)
    for (const [roleName, caps] of Object.entries(ROLE_CAPABILITIES)) {
      const role = await tx.role.findUniqueOrThrow({ where: { name: roleName as UserRole } });
      for (const cap of caps) {
        const perm = await tx.permission.findUniqueOrThrow({ where: { capability: cap } });
        await tx.rolePermission.upsert({
          where: { role_name_permission_id: { role_name: role.name, permission_id: perm.id } },
          update: {},
          create: { role_name: role.name, permission_id: perm.id },
        });
      }
    }

    // SUPER_ADMIN user
    await tx.user.upsert({
      where: { firebase_uid: 'super-admin' },
      update: {},
      create: {
        firebase_uid: 'super-admin',
        name: 'Super Admin',
        email: 'admin@nivaaran.gov.in',
        id: 'super-admin',
        is_active: true,
      },
    });

    // Link SUPER_ADMIN user to SUPER_ADMIN role
    const superAdminRole = await tx.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
    await tx.userRoleLink.upsert({
      where: { user_id_role_name: { user_id: 'super-admin', role_name: 'SUPER_ADMIN' } },
      update: {},
      create: { user_id: 'super-admin', role_name: 'SUPER_ADMIN', granted_at: new Date() },
    });
  });

  console.log(`RBAC seeded: ${ROLES.length} roles, ${allCapabilities.length} permissions`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
