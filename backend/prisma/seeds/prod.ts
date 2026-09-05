import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── 24 Jharkhand districts ───────────────────────────
// Codes: uppercase, spaces→underscores, stripping parentheticals

const DISTRICTS = [
  { name: 'Ranchi', code: 'RANCHI' },
  { name: 'Dhanbad', code: 'DHANBAD' },
  { name: 'East Singhbhum', code: 'EAST_SINGHBHUM' },
  { name: 'Bokaro', code: 'BOKARO' },
  { name: 'Palamu', code: 'PALAMU' },
  { name: 'Hazaribagh', code: 'HAZARIBAGH' },
  { name: 'Deoghar', code: 'DEOGHAR' },
  { name: 'Giridih', code: 'GIRIDIH' },
  { name: 'Ramgarh', code: 'RAMGARH' },
  { name: 'Latehar', code: 'LATEHAR' },
  { name: 'Garhwa', code: 'GARHWA' },
  { name: 'Dumka', code: 'DUMKA' },
  { name: 'Godda', code: 'GODDA' },
  { name: 'Sahebganj', code: 'SAHEBGANJ' },
  { name: 'Pakur', code: 'PAKUR' },
  { name: 'Jamtara', code: 'JAMTARA' },
  { name: 'Khunti', code: 'KHOUNTI' },
  { name: 'Gumla', code: 'GUMLA' },
  { name: 'Simdega', code: 'SIMDEGA' },
  { name: 'West Singhbhum', code: 'WEST_SINGHBHUM' },
  { name: 'Seraikela Kharsawan', code: 'SERAKEELA_KHARSAWAN' },
  { name: 'Chatra', code: 'CHATRA' },
  { name: 'Koderma', code: 'KODERMA' },
  { name: 'Lohardaga', code: 'LOHARDAGA' },
];

// ── Sample blocks per district (one per district) ─────

const BLOCKS = DISTRICTS.map((d) => ({
  code: `${d.code}_KANKE`,
  district_code: d.code,
  name: 'Kanke',
}));

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const d of DISTRICTS) {
      await tx.district.upsert({
        where: { code: d.code },
        update: { name: d.name },
        create: { code: d.code, name: d.name },
      });
    }
    for (const b of BLOCKS) {
      await tx.block.upsert({
        where: { code: b.code },
        update: { name: b.name },
        create: { ...b },
      });
    }
  });

  console.log(`Prod seed: ${DISTRICTS.length} districts, ${BLOCKS.length} blocks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
