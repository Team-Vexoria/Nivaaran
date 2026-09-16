import React, { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, Building2, FileCheck, Handshake,
  IndianRupee, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Trash2, Info
} from 'lucide-react';
import {
  CollaborationRequest, CollaborationType, OrgType, IpOwnershipPreference,
  Schedule7Category, DisbursementMilestone, generateRequestId,
  submitCollaborationRequest
} from '../../services/firebaseService';
import { IndustryPartnerDoc } from '../../services/industryData';

interface Props {
  projectId: string;
  challengeId: string;
  challengeTitle: string;
  assignedHEI: string;
  orgName: string;
  orgEmail: string;
  industryPartner?: IndustryPartnerDoc;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}

const STEPS = [
  { number: 1, title: 'Organizational Identity & Legal Standing', icon: Building2 },
  { number: 2, title: 'Collaboration Scope & Type', icon: Handshake },
  { number: 3, title: 'IP, Branding & Legal Terms', icon: ShieldCheck },
  { number: 4, title: 'Disbursement Milestone Plan', icon: IndianRupee },
  { number: 5, title: 'Review & Declaration', icon: FileCheck },
];

const COLLAB_TYPES: CollaborationType[] = [
  'CSR Cash Grant',
  'Hardware / Component Sponsorship',
  'Dedicated Testing Facility',
  'Cloud Infrastructure Credits',
  'Technical Mentorship',
  'Pilot Deployment Site & Field Access',
];

const SCHEDULE7_CATEGORIES: Schedule7Category[] = [
  'i. Eradicating extreme hunger, poverty and malnutrition',
  'ii. Promoting education, employment, livelihood',
  'iii. Promoting gender equality, empowering women',
  'iv. Ensuring environmental sustainability',
  'v. Protection of national heritage, art and culture',
  'vi. Measures for the benefit of armed forces veterans',
  'vii. Training to promote rural sports, nationally recognised sports',
  'viii. Contributions to PM National Relief Fund',
  'ix. Contributions to science, technology, engineering, medicine R&D',
  'x. Rural development projects',
  'xi. Slum area development',
  'xii. Disaster management, relief, rehabilitation',
];

const STAGE_OPTIONS = [
  { num: 9, name: 'Stage 9: Technical Solution Proposal' },
  { num: 10, name: 'Stage 10: Industry / CSR Hardware Collab Start' },
  { num: 11, name: 'Stage 11: Hardware Prototype Ready & Lab Verified' },
  { num: 12, name: 'Stage 12: Panchayat Ground Trial Active' },
  { num: 13, name: 'Stage 13: Field Outcome Audit' },
  { num: 14, name: 'Stage 14: Statewide Deployment Hand-Off' },
  { num: 16, name: 'Stage 16: Verified Closure & Impact Ledger' },
];

type FormState = {
  // Step 1
  orgType: OrgType;
  cinNumber: string;
  csrRegistrationNumber: string;
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  authorizedSignatoryEmail: string;
  has12ACertificate: boolean | null;
  has80GCertificate: boolean | null;
  hasSeparateCsrBankAccount: boolean | null;
  auditedFinancialsAvailable: boolean | null;
  schedule7Category: Schedule7Category | '';

  // Step 2
  collaborationTypes: CollaborationType[];
  proposedBudgetInr: string;
  inKindDetails: string;
  sdgAlignment: string;
  expectedCommunityBeneficiaries: string;
  socialOutcomesStatement: string;

  // Step 3
  ipOwnershipPreference: IpOwnershipPreference | '';
  exclusivityRequired: boolean | null;
  brandingScope: string;
  confidentialityScope: string;
  disputeResolution: 'Platform Arbitration' | 'State Court, Jharkhand' | 'Mutual Negotiation';

  // Step 4
  disbursementMilestones: DisbursementMilestone[];

  // Step 5
  declarationChecked: boolean;
};

const emptyMilestone = (n: number): DisbursementMilestone => ({
  trancheNumber: n,
  label: `Tranche ${n}`,
  triggerStageNumber: 11,
  triggerStageName: 'Stage 11: Hardware Prototype Ready & Lab Verified',
  amountInr: 0,
  inKindDescription: '',
  releaseCondition: '',
  status: 'Pending',
});

const inputCls = 'w-full px-3 py-2 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-xs text-[#201C18] font-medium focus:outline-none focus:ring-2 focus:ring-[#2C6E49]/30 placeholder:text-[#B0A89E]';
const labelCls = 'text-[11px] font-extrabold text-[#6A6155] uppercase tracking-wider block mb-1';
const sectionCls = 'bg-white border border-[#E4DDD1] rounded-xl p-4 space-y-3';

export const CollaborationRequestWizard: React.FC<Props> = ({
  projectId, challengeId, challengeTitle, assignedHEI, orgName, orgEmail, industryPartner, onClose, onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    orgType: 'Large Corporate',
    cinNumber: industryPartner?.cin || 'L27100MH1907PLC000260',
    csrRegistrationNumber: industryPartner?.csrRegNumber || 'CSR00001248',
    authorizedSignatoryName: industryPartner?.leadName || 'Sourav Roy',
    authorizedSignatoryDesignation: industryPartner?.leadDesignation || 'Chief CSR & Social Innovation',
    authorizedSignatoryEmail: industryPartner?.leadEmail || orgEmail,
    has12ACertificate: true,
    has80GCertificate: true,
    hasSeparateCsrBankAccount: true,
    auditedFinancialsAvailable: true,
    schedule7Category: industryPartner?.schedule7Focus?.[0] || 'ix. Contributions to science, technology, engineering, medicine R&D',

    collaborationTypes: ['CSR Cash Grant', 'Hardware / Component Sponsorship'],
    proposedBudgetInr: '650000',
    inKindDetails: 'Prototype testing lab facilities, sensor components, and telemetry field trial access.',
    sdgAlignment: 'SDG 6 (Clean Water), SDG 9 (Innovation & Infrastructure), SDG 11 (Sustainable Communities)',
    expectedCommunityBeneficiaries: '3500',
    socialOutcomesStatement: `Corporate co-funding and engineering sponsorship to address ${challengeTitle} in collaboration with ${assignedHEI}.`,

    ipOwnershipPreference: 'University retains full IP, industry gets acknowledgement',
    exclusivityRequired: false,
    brandingScope: 'Co-Branded Impact Docket & CSR Annual Report Recognition',
    confidentialityScope: 'Public Domain R&D with proprietary sensor schematics reserved',
    disputeResolution: 'Platform Arbitration',

    disbursementMilestones: [
      {
        trancheNumber: 1,
        label: 'Tranche 1 (40% Initial Release)',
        triggerStageNumber: 11,
        triggerStageName: 'Stage 11: Hardware Prototype Ready & Lab Verified',
        amountInr: 260000,
        inKindDescription: 'Hardware components & CAD fabrication',
        releaseCondition: 'Lab bench tests and telemetry verified by faculty mentor',
        status: 'Pending',
      },
      {
        trancheNumber: 2,
        label: 'Tranche 2 (60% Pilot Release)',
        triggerStageNumber: 12,
        triggerStageName: 'Stage 12: Panchayat Ground Trial Active',
        amountInr: 390000,
        inKindDescription: 'Panchayat deployment site & sirens',
        releaseCondition: 'Mukhiya and District Officer pilot verification sign-off',
        status: 'Pending',
      },
    ],

    declarationChecked: true,
  });

  const set = (field: keyof FormState, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const validateStep = (): string[] => {
    const errs: string[] = [];
    if (step === 1) {
      if (!form.cinNumber.trim()) errs.push('CIN / Udyam Registration Number is required.');
      if (!form.csrRegistrationNumber.trim()) errs.push('CSR-1 Registration Number is required.');
      if (!form.authorizedSignatoryName.trim()) errs.push('Authorized Signatory name is required.');
      if (!form.authorizedSignatoryDesignation.trim()) errs.push('Signatory designation is required.');
      if (!form.authorizedSignatoryEmail.trim()) errs.push('Signatory email is required.');
      if (form.has12ACertificate === null) errs.push('Please confirm 12A certificate status.');
      if (form.has80GCertificate === null) errs.push('Please confirm 80G certificate status.');
      if (form.hasSeparateCsrBankAccount === null) errs.push('Please confirm separate CSR bank account status.');
      if (form.auditedFinancialsAvailable === null) errs.push('Please confirm audited financials availability.');
      if (!form.schedule7Category) errs.push('Schedule VII category is required.');
    }
    if (step === 2) {
      if (form.collaborationTypes.length === 0) errs.push('Select at least one collaboration type.');
      if (!form.proposedBudgetInr || isNaN(Number(form.proposedBudgetInr)) || Number(form.proposedBudgetInr) <= 0)
        errs.push('Proposed budget must be a positive number.');
      if (!form.sdgAlignment.trim()) errs.push('SDG alignment description is required.');
      if (!form.expectedCommunityBeneficiaries.trim() || isNaN(Number(form.expectedCommunityBeneficiaries)))
        errs.push('Expected community beneficiaries must be a number.');
      if (!form.socialOutcomesStatement.trim() || form.socialOutcomesStatement.length < 50)
        errs.push('Social Outcomes Statement must be at least 50 characters.');
    }
    if (step === 3) {
      if (!form.ipOwnershipPreference) errs.push('IP Ownership Preference is required.');
      if (form.exclusivityRequired === null) errs.push('Please state whether exclusivity is required.');
      if (!form.brandingScope.trim()) errs.push('Branding scope / acknowledgement details are required.');
    }
    if (step === 4) {
      if (form.disbursementMilestones.length === 0) errs.push('Add at least one disbursement tranche.');
      const total = form.disbursementMilestones.reduce((s, m) => s + (m.amountInr || 0), 0);
      const budget = Number(form.proposedBudgetInr);
      if (Math.abs(total - budget) > 1) errs.push(`Tranche amounts total ₹${total.toLocaleString('en-IN')} but proposed budget is ₹${budget.toLocaleString('en-IN')}. They must match.`);
      form.disbursementMilestones.forEach((m, i) => {
        if (!m.releaseCondition.trim()) errs.push(`Tranche ${i + 1}: Release condition is required.`);
        if (m.amountInr <= 0) errs.push(`Tranche ${i + 1}: Amount must be greater than zero.`);
      });
    }
    if (step === 5) {
      if (!form.declarationChecked) errs.push('You must accept the Section 135 compliance declaration.');
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setStep(s => s + 1);
  };

  const handleBack = () => { setErrors([]); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const errs = validateStep();
    if (errs.length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const requestId = generateRequestId();
      const request: Omit<CollaborationRequest, 'id'> = {
        requestId,
        projectId,
        challengeId,
        challengeTitle,
        assignedHEI,
        orgName,
        orgType: form.orgType,
        cinNumber: form.cinNumber,
        csrRegistrationNumber: form.csrRegistrationNumber,
        authorizedSignatoryName: form.authorizedSignatoryName,
        authorizedSignatoryDesignation: form.authorizedSignatoryDesignation,
        authorizedSignatoryEmail: form.authorizedSignatoryEmail,
        has12ACertificate: form.has12ACertificate === true,
        has80GCertificate: form.has80GCertificate === true,
        hasSeparateCsrBankAccount: form.hasSeparateCsrBankAccount === true,
        auditedFinancialsAvailable: form.auditedFinancialsAvailable === true,
        schedule7Category: form.schedule7Category as Schedule7Category,
        collaborationTypes: form.collaborationTypes,
        proposedBudgetInr: Number(form.proposedBudgetInr),
        inKindDetails: form.inKindDetails,
        sdgAlignment: form.sdgAlignment,
        expectedCommunityBeneficiaries: Number(form.expectedCommunityBeneficiaries),
        socialOutcomesStatement: form.socialOutcomesStatement,
        ipOwnershipPreference: form.ipOwnershipPreference as IpOwnershipPreference,
        exclusivityRequired: form.exclusivityRequired === true,
        brandingScope: form.brandingScope,
        confidentialityScope: form.confidentialityScope,
        disputeResolution: form.disputeResolution,
        disbursementMilestones: form.disbursementMilestones,
        status: 'Submitted',
        submittedByOrg: orgName,
      };
      const id = await submitCollaborationRequest(request);
      onSuccess(id);
    } catch (e) {
      setErrors(['Submission failed. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  const updateMilestone = (idx: number, field: keyof DisbursementMilestone, value: any) => {
    const milestones = form.disbursementMilestones.map((m, i) => {
      if (i !== idx) return m;
      const updated = { ...m, [field]: value };
      if (field === 'triggerStageNumber') {
        const stage = STAGE_OPTIONS.find(s => s.num === Number(value));
        updated.triggerStageName = stage?.name || updated.triggerStageName;
      }
      return updated;
    });
    set('disbursementMilestones', milestones);
  };

  const totalTranches = form.disbursementMilestones.reduce((s, m) => s + (m.amountInr || 0), 0);
  const budget = Number(form.proposedBudgetInr) || 0;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">

        {/* Header */}
        <div className="bg-white border-b border-[#E4DDD1] px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black text-[#201C18] font-heading">Industry / CSR Collaboration Request</h2>
            <p className="text-[11px] text-[#6A6155] mt-0.5 truncate max-w-md">
              For: <span className="font-bold text-[#2C6E49]">{challengeTitle}</span> · {assignedHEI}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] rounded-xl cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="bg-white px-5 py-3 border-b border-[#E4DDD1] shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = step > s.number;
              const isCurrent = step === s.number;
              return (
                <React.Fragment key={s.number}>
                  <div className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isDone ? 'text-[#2C6E49] bg-[#F0FAF4]' :
                    isCurrent ? 'text-[#C98A2C] bg-[#FFF8EC]' :
                    'text-[#B0A89E] bg-transparent'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{s.number}</span>
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#D5CDBF] shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-[#FFF0EE] border border-[#F5C6C0] rounded-xl p-3 space-y-1">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-[#B3261E]">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: Organizational Identity ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-3">
                <Building2 className="w-4 h-4 text-[#2C6E49]" />
                <h3 className="text-sm font-extrabold text-[#201C18]">Organizational Identity & Legal Standing</h3>
              </div>

              <div className={sectionCls}>
                <p className="text-[11px] text-[#6A6155] flex items-start gap-1.5 bg-[#FFF8EC] border border-[#F0D99A] rounded-lg p-2.5">
                  <Info className="w-3.5 h-3.5 text-[#C98A2C] mt-0.5 shrink-0" />
                  Under the <strong>Companies Act 2013, Section 135 & Schedule VII</strong>, CSR funds can only legally flow from registered entities with valid CSR-1 (MCA), 12A and 80G certificates. All fields below are legally mandatory.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Organization Name</label>
                    <input type="text" value={orgName} disabled className={`${inputCls} opacity-60`} />
                  </div>
                  <div>
                    <label className={labelCls}>Organization Type</label>
                    <select value={form.orgType} onChange={e => set('orgType', e.target.value)} className={inputCls}>
                      {(['Large Corporate', 'PSU', 'MSME', 'Startup', 'Foundation / Trust', 'Research Lab'] as OrgType[]).map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>CIN / Udyam Registration No. <span className="text-[#B3261E]">*</span></label>
                    <input type="text" placeholder="e.g. L27100MH1907PTC000260 or UDYAM-JH-..." value={form.cinNumber} onChange={e => set('cinNumber', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>CSR-1 Registration No. (MCA Portal) <span className="text-[#B3261E]">*</span></label>
                    <input type="text" placeholder="e.g. CSR00000123" value={form.csrRegistrationNumber} onChange={e => set('csrRegistrationNumber', e.target.value)} className={inputCls} />
                    <p className="text-[10px] text-[#8A7F72] mt-0.5">Mandatory for any CSR fund transfer under Indian law.</p>
                  </div>
                </div>

                <div className="border-t border-[#F0EBE0] pt-3">
                  <p className="text-[11px] font-extrabold text-[#4A433B] mb-2 uppercase tracking-wider">Authorized Signatory (who will sign the MoU)</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Full Name <span className="text-[#B3261E]">*</span></label>
                      <input type="text" placeholder="e.g. Rajesh Kumar Sharma" value={form.authorizedSignatoryName} onChange={e => set('authorizedSignatoryName', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Designation <span className="text-[#B3261E]">*</span></label>
                      <input type="text" placeholder="e.g. Chief CSR Officer" value={form.authorizedSignatoryDesignation} onChange={e => set('authorizedSignatoryDesignation', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Official Email <span className="text-[#B3261E]">*</span></label>
                      <input type="email" value={form.authorizedSignatoryEmail} onChange={e => set('authorizedSignatoryEmail', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#F0EBE0] pt-3 space-y-2.5">
                  <p className="text-[11px] font-extrabold text-[#4A433B] uppercase tracking-wider">Compliance Checklist — Mandatory Under Companies Act 2013</p>
                  {[
                    { field: 'has12ACertificate' as const, label: 'Organization holds a valid 12A Certificate (charitable purpose registration)?', note: 'Required for the receiving institution.' },
                    { field: 'has80GCertificate' as const, label: 'Organization holds a valid 80G Certificate (donor tax exemption)?', note: 'Allows donors to claim deduction u/s 80G.' },
                    { field: 'hasSeparateCsrBankAccount' as const, label: 'A designated separate bank account for CSR funds is maintained?', note: 'Funds must not be commingled with operating accounts.' },
                    { field: 'auditedFinancialsAvailable' as const, label: 'Audited financial statements for the last 3 years are available for inspection?', note: 'Required to prove institutional capacity.' },
                  ].map(({ field, label, note }) => (
                    <div key={field} className="flex items-start gap-3 p-2.5 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#201C18]">{label}</p>
                        <p className="text-[10px] text-[#8A7F72] mt-0.5">{note}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {[{ val: true, lbl: 'Yes' }, { val: false, lbl: 'No' }].map(({ val, lbl }) => (
                          <label key={String(val)} className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={field} checked={form[field] === val} onChange={() => set(field, val)} className="accent-[#2C6E49]" />
                            <span className={`text-[11px] font-bold ${form[field] === val ? (val ? 'text-[#2C6E49]' : 'text-[#B3261E]') : 'text-[#8A7F72]'}`}>{lbl}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className={labelCls}>Schedule VII Category Alignment <span className="text-[#B3261E]">*</span></label>
                  <select value={form.schedule7Category} onChange={e => set('schedule7Category', e.target.value)} className={inputCls}>
                    <option value="">— Select the Schedule VII category this project falls under —</option>
                    {SCHEDULE7_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Collaboration Scope ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-3">
                <Handshake className="w-4 h-4 text-[#C98A2C]" />
                <h3 className="text-sm font-extrabold text-[#201C18]">Collaboration Scope & Type</h3>
              </div>

              <div className={sectionCls}>
                <div>
                  <label className={labelCls}>Type of Collaboration Offered <span className="text-[#B3261E]">*</span> (select all that apply)</label>
                  <div className="grid sm:grid-cols-2 gap-2 mt-1">
                    {COLLAB_TYPES.map(t => (
                      <label key={t} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        form.collaborationTypes.includes(t)
                          ? 'border-[#2C6E49] bg-[#F0FAF4]'
                          : 'border-[#E4DDD1] bg-white hover:border-[#C3E6D0]'
                      }`}>
                        <input type="checkbox" checked={form.collaborationTypes.includes(t)}
                          onChange={e => set('collaborationTypes', e.target.checked
                            ? [...form.collaborationTypes, t]
                            : form.collaborationTypes.filter(x => x !== t))}
                          className="accent-[#2C6E49] shrink-0" />
                        <span className="text-xs font-bold text-[#201C18]">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 border-t border-[#F0EBE0] pt-3">
                  <div>
                    <label className={labelCls}>Total Proposed Commitment (₹ INR) <span className="text-[#B3261E]">*</span></label>
                    <input type="number" min={0} placeholder="e.g. 350000" value={form.proposedBudgetInr} onChange={e => set('proposedBudgetInr', e.target.value)} className={inputCls} />
                    <p className="text-[10px] text-[#8A7F72] mt-0.5">Monetise in-kind hardware at market value. Must equal sum of disbursement tranches in Step 4.</p>
                  </div>
                  <div>
                    <label className={labelCls}>In-Kind Contribution Details (if applicable)</label>
                    <input type="text" placeholder="e.g. 50 ESP32 units + 2 LoRa gateways (MRP ₹1,20,000)" value={form.inKindDetails} onChange={e => set('inKindDetails', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>SDG Alignment <span className="text-[#B3261E]">*</span></label>
                    <input type="text" placeholder="e.g. SDG-11 Sustainable Cities, SDG-13 Climate Action" value={form.sdgAlignment} onChange={e => set('sdgAlignment', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Expected Community Beneficiaries <span className="text-[#B3261E]">*</span></label>
                    <input type="number" min={0} placeholder="e.g. 12000" value={form.expectedCommunityBeneficiaries} onChange={e => set('expectedCommunityBeneficiaries', e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="border-t border-[#F0EBE0] pt-3">
                  <label className={labelCls}>Social Outcomes Statement <span className="text-[#B3261E]">*</span> (minimum 50 characters)</label>
                  <textarea rows={3} placeholder="Describe the measurable social outcomes this collaboration will produce. E.g.: The IoT flood warning system will reduce disaster-response time from 4 hours to under 15 minutes for ~12,000 residents in Namkum block, reducing annual flood damage by an estimated ₹40 lakhs..." value={form.socialOutcomesStatement} onChange={e => set('socialOutcomesStatement', e.target.value)} className={inputCls} />
                  <p className={`text-[10px] mt-0.5 ${form.socialOutcomesStatement.length < 50 ? 'text-[#C98A2C]' : 'text-[#2C6E49]'}`}>
                    {form.socialOutcomesStatement.length} / 50 min characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: IP, Branding & Legal ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-3">
                <ShieldCheck className="w-4 h-4 text-[#B5502D]" />
                <h3 className="text-sm font-extrabold text-[#201C18]">IP, Branding & Legal Terms</h3>
              </div>

              <div className={sectionCls}>
                <div className="space-y-2">
                  <label className={labelCls}>Intellectual Property Ownership Preference <span className="text-[#B3261E]">*</span></label>
                  {([
                    'University retains full IP, industry gets acknowledgement',
                    'Joint IP — university publishes, industry gets non-exclusive social-use license',
                    'Company seeks exclusive license (requires Govt of Jharkhand approval)',
                  ] as IpOwnershipPreference[]).map(opt => (
                    <label key={opt} className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.ipOwnershipPreference === opt
                        ? 'border-[#2C6E49] bg-[#F0FAF4]'
                        : 'border-[#E4DDD1] bg-white hover:border-[#C3E6D0]'
                    }`}>
                      <input type="radio" name="ip" checked={form.ipOwnershipPreference === opt} onChange={() => set('ipOwnershipPreference', opt)} className="accent-[#2C6E49] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[#201C18]">{opt}</p>
                        {opt.includes('exclusive') && (
                          <p className="text-[10px] text-[#B3261E] mt-0.5">⚠ This option requires a separate approval from the Government of Jharkhand since this platform operates under public mandate.</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="border-t border-[#F0EBE0] pt-3 space-y-3">
                  <div>
                    <label className={labelCls}>Does your organization require exclusivity? <span className="text-[#B3261E]">*</span></label>
                    <p className="text-[10px] text-[#6A6155] mb-1.5">Exclusivity prevents the university from seeking other industry collaborators for this project. It is strongly discouraged for government-backed projects.</p>
                    <div className="flex items-center gap-3">
                      {[{ val: false, lbl: 'No — Open collaboration (recommended)', cls: 'text-[#2C6E49]' }, { val: true, lbl: 'Yes — Exclusivity required', cls: 'text-[#B3261E]' }].map(({ val, lbl, cls }) => (
                        <label key={String(val)} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" checked={form.exclusivityRequired === val} onChange={() => set('exclusivityRequired', val)} className="accent-[#2C6E49]" />
                          <span className={`text-xs font-bold ${form.exclusivityRequired === val ? cls : 'text-[#8A7F72]'}`}>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Branding & Acknowledgement Scope <span className="text-[#B3261E]">*</span></label>
                    <input type="text" placeholder="e.g. Co-contributor mention on research reports, impact certificate, and project public page only" value={form.brandingScope} onChange={e => set('brandingScope', e.target.value)} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Confidentiality Scope (optional)</label>
                    <input type="text" placeholder="e.g. Sensor calibration algorithms only. All geographic and civic data remains on public audit tracker." value={form.confidentialityScope} onChange={e => set('confidentialityScope', e.target.value)} className={inputCls} />
                    <p className="text-[10px] text-[#8A7F72] mt-0.5">Leave blank if no confidentiality restrictions. All challenge and location data is publicly auditable by default on this platform.</p>
                  </div>

                  <div>
                    <label className={labelCls}>Dispute Resolution Preference <span className="text-[#B3261E]">*</span></label>
                    <select value={form.disputeResolution} onChange={e => set('disputeResolution', e.target.value as any)} className={inputCls}>
                      <option>Platform Arbitration</option>
                      <option>State Court, Jharkhand</option>
                      <option>Mutual Negotiation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Disbursement Milestones ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-3">
                <IndianRupee className="w-4 h-4 text-[#2C6E49]" />
                <h3 className="text-sm font-extrabold text-[#201C18]">Milestone-Based Disbursement Plan</h3>
              </div>

              <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-3 text-xs text-[#7A5A1A] space-y-1">
                <p className="font-extrabold">Why milestone-based disbursement?</p>
                <p>CSR funds in India are never released as a lump sum. Each tranche must be linked to a verifiable lifecycle milestone. The platform will automatically <strong>unlock</strong> a tranche when the university team reaches the corresponding stage and submits verified proof.</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#F0D99A]">
                  <span>Total Proposed Budget: <strong>₹{Number(form.proposedBudgetInr).toLocaleString('en-IN')}</strong></span>
                  <span className={totalTranches === budget && budget > 0 ? 'text-[#2C6E49] font-extrabold' : 'text-[#B3261E] font-extrabold'}>
                    Tranches Total: ₹{totalTranches.toLocaleString('en-IN')} {totalTranches === budget && budget > 0 ? '✓' : '≠ Budget'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {form.disbursementMilestones.map((m, idx) => (
                  <div key={idx} className={`${sectionCls} space-y-3 relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#201C18] bg-[#2C6E49] text-white px-2.5 py-0.5 rounded-full">Tranche {m.trancheNumber}</span>
                      {form.disbursementMilestones.length > 1 && (
                        <button onClick={() => set('disbursementMilestones', form.disbursementMilestones.filter((_, i) => i !== idx))} className="text-[#B3261E] hover:bg-[#FFF0EE] p-1 rounded-lg cursor-pointer transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Tranche Label</label>
                        <input type="text" value={m.label} onChange={e => updateMilestone(idx, 'label', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Amount (₹ INR) <span className="text-[#B3261E]">*</span></label>
                        <input type="number" min={0} value={m.amountInr || ''} onChange={e => updateMilestone(idx, 'amountInr', Number(e.target.value))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Trigger: Release when project reaches <span className="text-[#B3261E]">*</span></label>
                        <select value={m.triggerStageNumber} onChange={e => updateMilestone(idx, 'triggerStageNumber', Number(e.target.value))} className={inputCls}>
                          {STAGE_OPTIONS.map(s => <option key={s.num} value={s.num}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>In-Kind Value (if applicable)</label>
                        <input type="text" placeholder="e.g. 20 ESP32 boards @ ₹800 each" value={m.inKindDescription || ''} onChange={e => updateMilestone(idx, 'inKindDescription', e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Release Condition — what proof must the university provide? <span className="text-[#B3261E]">*</span></label>
                      <textarea rows={2} placeholder="e.g. University must submit lab-verified telemetry logs, circuit test report, and faculty mentor sign-off before this tranche is released." value={m.releaseCondition} onChange={e => updateMilestone(idx, 'releaseCondition', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                ))}
              </div>

              {form.disbursementMilestones.length < 6 && (
                <button
                  onClick={() => set('disbursementMilestones', [...form.disbursementMilestones, emptyMilestone(form.disbursementMilestones.length + 1)])}
                  className="w-full py-2.5 border-2 border-dashed border-[#C3E6D0] hover:border-[#2C6E49] text-[#2C6E49] text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Tranche
                </button>
              )}
            </div>
          )}

          {/* ── STEP 5: Review & Declaration ── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-3">
                <FileCheck className="w-4 h-4 text-[#2C6E49]" />
                <h3 className="text-sm font-extrabold text-[#201C18]">Review & Section 135 Compliance Declaration</h3>
              </div>

              {/* Summary grid */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  ['Organization', orgName],
                  ['Type', form.orgType],
                  ['CIN / Udyam', form.cinNumber],
                  ['CSR-1 No.', form.csrRegistrationNumber],
                  ['Schedule VII', form.schedule7Category || '—'],
                  ['Collaboration Types', form.collaborationTypes.join(', ') || '—'],
                  ['Total Commitment', `₹${Number(form.proposedBudgetInr).toLocaleString('en-IN')} INR`],
                  ['Expected Beneficiaries', Number(form.expectedCommunityBeneficiaries).toLocaleString('en-IN')],
                  ['IP Preference', form.ipOwnershipPreference || '—'],
                  ['Exclusivity', form.exclusivityRequired ? 'Yes' : 'No'],
                  ['Tranches', `${form.disbursementMilestones.length} milestone-based tranches`],
                  ['Assigned HEI', assignedHEI],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white border border-[#E4DDD1] rounded-xl p-2.5">
                    <p className="text-[10px] text-[#8A7F72] font-bold uppercase tracking-wider">{k}</p>
                    <p className="font-bold text-[#201C18] mt-0.5 break-words">{v}</p>
                  </div>
                ))}
              </div>

              {/* Disbursement Summary */}
              <div className="bg-white border border-[#E4DDD1] rounded-xl p-3">
                <p className="text-[11px] font-extrabold text-[#4A433B] uppercase tracking-wider mb-2">Disbursement Milestone Summary</p>
                <div className="space-y-1.5">
                  {form.disbursementMilestones.map(m => (
                    <div key={m.trancheNumber} className="flex items-center justify-between text-xs border-b border-[#F0EBE0] pb-1.5">
                      <span className="font-bold text-[#201C18]">{m.label}</span>
                      <span className="text-[#6A6155]">Triggers at {m.triggerStageName}</span>
                      <span className="font-extrabold text-[#2C6E49]">₹{m.amountInr.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-end pt-1">
                    <span className="text-xs font-extrabold text-[#201C18]">Total: ₹{form.disbursementMilestones.reduce((s, m) => s + m.amountInr, 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4 space-y-3">
                <p className="text-xs font-extrabold text-[#201C18] uppercase tracking-wider">Section 135 Compliance Declaration</p>
                <p className="text-xs text-[#4A433B] leading-relaxed">
                  By submitting this collaboration request, <strong>{orgName}</strong> ({form.authorizedSignatoryName}, {form.authorizedSignatoryDesignation}) confirms that:
                </p>
                <ul className="text-xs text-[#4A433B] space-y-1 list-disc pl-4">
                  <li>This collaboration complies with the <strong>Companies Act, 2013 (Section 135)</strong> and falls under <strong>Schedule VII</strong> as declared above.</li>
                  <li>All CSR funds will be held in a <strong>designated separate bank account</strong> and utilized solely for the stated societal research project.</li>
                  <li>A <strong>Utilization Certificate</strong> certified by a Chartered Accountant will be provided upon project completion.</li>
                  <li>This organization accepts that the <strong>Government of Jharkhand retains audit rights</strong> over all funds disbursed through this platform.</li>
                  <li>Any misrepresentation of compliance status is subject to provisions under the Companies Act, 2013.</li>
                </ul>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.declarationChecked} onChange={e => set('declarationChecked', e.target.checked)} className="accent-[#2C6E49] mt-0.5 shrink-0 w-4 h-4" />
                  <span className="text-xs font-extrabold text-[#201C18]">I confirm the above declaration on behalf of {orgName} and authorize this submission.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-[#E4DDD1] px-5 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#4A433B] bg-[#EAE4D8] hover:bg-[#DFD8CA] border border-[#E4DDD1] rounded-xl cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8A7F72]">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <button onClick={handleNext} className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl cursor-pointer transition-colors shadow-2xs">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-60 rounded-xl cursor-pointer transition-colors shadow-2xs">
                {submitting ? 'Submitting…' : <><FileCheck className="w-3.5 h-3.5" /> Submit Collaboration Request</>}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
