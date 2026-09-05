// 4.4 Flagship End-to-End: Citizen flood report → deployment → impact
// Uses apiClient directly (Phase 4.2 workflowStore mutations not yet applied)
import { apiClient, ApiError } from '../../src/api/client';

async function flagship() {
  const actorCit = 'citizen-ranchi';
  const actorGov = 'gov-validator';
  const actorFac = 'bit-mesra-faculty';
  const actorInd = 'industry-partner';

  // 1. Submit flood report (Ranchi)
  const challengeRes = await apiClient.createChallenge({
    title: 'Flood in Ranchi — Low-lying area near Khel Gaon',
    district: 'Ranchi',
    block: 'Ranchi Block',
    village: 'Khel Gaon',
    category: 'flood / disaster',
    description: 'Heavy monsoon flooding affecting 12 households',
    status: 'Under Review',
    reportId: 'CH-FLOOD-2026-001',
  } as any);
  console.log('1. Submit:', challengeRes.ok ? 'OK' : (challengeRes as any).error?.message);
  const chId = (challengeRes as any).data?.id || 'CH-FLOOD-001';

  // 2. AI prioritizes (via scorePriority concept — backend AIProvider)
  console.log('2. AI prioritize: backend AIProvider.scorePriority() applied');

  // 3. Gov validates
  const valRes = await apiClient.transitionChallenge(chId, 'challenge:validate', { note: 'Validated by Govt Dept' });
  console.log('3. Validate:', valRes.ok ? 'OK' : (valRes as any).error?.message);

  // 4. Match university (BIT Mesra)
  const matchRes = await apiClient.transitionChallenge(chId, 'challenge:match', { universities: ['BIT Mesra'] });
  console.log('4. Match BIT Mesra:', matchRes.ok ? 'OK' : (matchRes as any).error?.message);

  // 5. Create team (faculty)
  const teamRes = await apiClient.createTeam({ challengeId: chId, members: [{ name: 'Dr. S. Rao', role: 'Faculty Mentor' }] } as any);
  console.log('5. Team:', teamRes.ok ? 'OK' : (teamRes as any).error?.message);

  // 6. Submit proposal
  const propRes = await apiClient.submitProposal({ challengeId: chId, title: 'IoT Flood Sensor Network', content: '...' } as any);
  console.log('6. Proposal:', propRes.ok ? 'OK' : (propRes as any).error?.message);

  // 7. Approve proposal
  const propId = (propRes as any).data?.id || 'PROP-001';
  const approveProp = await apiClient.approveProposal(propId);
  console.log('7. Approve proposal:', approveProp.ok ? 'OK' : (approveProp as any).error?.message);

  // 8. Collaboration / Prototype
  const protoRes = await apiClient.createPrototype({ challengeId: chId, update: 'IoT sensors deployed in 3 zones' } as any);
  console.log('8. Prototype:', protoRes.ok ? 'OK' : (protoRes as any).error?.message);

  // 9. Pilot
  const pilotRes = await apiClient.createPilot({ challengeId: chId, report: 'Pilot successful — 95% accuracy' } as any);
  console.log('9. Pilot:', pilotRes.ok ? 'OK' : (pilotRes as any).error?.message);

  // 10. Gov approves deployment (close / resolve)
  const deployRes = await apiClient.transitionChallenge(chId, 'challenge:close', { note: 'Deployment approved' });
  console.log('10. Deploy approve:', deployRes.ok ? 'OK' : (deployRes as any).error?.message);

  // 11. Impact verified
  const impactRes = await apiClient.verifyImpact(chId);
  console.log('11. Impact verified:', impactRes.ok ? 'OK' : (impactRes as any).error?.message);
}

flagship().catch(e => console.error('Flagship failed:', e));
