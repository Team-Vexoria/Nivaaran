import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const DISTRICTS = [
  { name: 'Ranchi', code: 'RANCHI' }, { name: 'Dhanbad', code: 'DHANBAD' },
  { name: 'East Singhbhum', code: 'EAST_SINGHBHUM' }, { name: 'Bokaro', code: 'BOKARO' },
  { name: 'Palamu', code: 'PALAMU' }, { name: 'Hazaribagh', code: 'HAZARIBAGH' },
  { name: 'Deoghar', code: 'DEOGHAR' }, { name: 'Giridih', code: 'GIRIDIH' },
  { name: 'Ramgarh', code: 'RAMGARH' }, { name: 'Latehar', code: 'LATEHAR' },
  { name: 'Garhwa', code: 'GARHWA' }, { name: 'Dumka', code: 'DUMKA' },
  { name: 'Godda', code: 'GODDA' }, { name: 'Sahebganj', code: 'SAHEBGANJ' },
  { name: 'Pakur', code: 'PAKUR' }, { name: 'Jamtara', code: 'JAMTARA' },
  { name: 'Khunti', code: 'KHOUNTI' }, { name: 'Gumla', code: 'GUMLA' },
  { name: 'Simdega', code: 'SIMDEGA' }, { name: 'West Singhbhum', code: 'WEST_SINGHBHUM' },
  { name: 'Seraikela Kharsawan', code: 'SERAKEELA_KHARSAWAN' }, { name: 'Chatra', code: 'CHATRA' },
  { name: 'Koderma', code: 'KODERMA' }, { name: 'Lohardaga', code: 'LOHARDAGA' },
];
export const BLOCKS = DISTRICTS.map(d => ({ code: d.code+'_KANKE', district_code: d.code, name: 'Kanke' }));
export const NAAC_UNIVERSITIES = [
  { name: 'Ranchi University', code: 'RU', district: 'RANCHI', accreditation: 'A++' },
  { name: 'BIT Mesra', code: 'BITM', district: 'RANCHI', accreditation: 'A+' },
  { name: 'NUSRL Ranchi', code: 'NUSRL', district: 'RANCHI', accreditation: 'A' },
  { name: 'Kolhan University', code: 'KU', district: 'DHANBAD', accreditation: 'A' },
  { name: 'Hazaribagh University', code: 'HU', district: 'HAZARIBAGH', accreditation: 'B++' },
  { name: 'Jharkhand University', code: 'JHU', district: 'DUMKA', accreditation: 'B+' },
];
export const FLOOD_SCENARIO = { title: 'Monsoon Waterlogging Ranchi Kanke/Harmu', district_code: 'RANCHI', block_code: 'RANCHI_KANKE', type: 'FLOOD', severity: 'MODERATE', description: 'Annual monsoon runoff; 30-60cm standing water; 2000+ households; 3 schools affected.' };
export const SCHOOL_SCENARIO = { title: 'School WASH & Solar Khunti (5 schools)', district_code: 'KHOUNTI', block_code: 'KHOUNTI_KANKE', type: 'EDUCATION_INFRASTRUCTURE', severity: 'HIGH', description: '5 government primaries lack toilets + reliable electricity; solar ~5kW/roof; attendance drops 12%.' };
async function main() {
  await prisma.$transaction(async tx => {
    for (const d of DISTRICTS) await tx.district.upsert({ where: { code: d.code }, update: { name: d.name }, create: { code: d.code, name: d.name } });
    for (const b of BLOCKS) await tx.block.upsert({ where: { code: b.code }, update: { name: b.name }, create: { ...b } });
  });
  console.log('Regions seeded: '+DISTRICTS.length+' districts, '+BLOCKS.length+' blocks, '+NAAC_UNIVERSITIES.length+' NAAC refs');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => await prisma.$disconnect());
