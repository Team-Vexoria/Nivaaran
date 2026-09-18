import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, Download, 
  FileText, IndianRupee, ShieldCheck, ArrowUpRight, 
  Search, Check, X
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export interface PFMSSanctionOrder {
  id: string;
  sanctionNumber: string;
  projectTitle: string;
  challengeReportId: string;
  heiName: string;
  nodalLead: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  trancheNumber: number;
  totalTranches: number;
  tranchePhase: string;
  amountRupees: number;
  status: 'Disbursed' | 'Approved Pending Release' | 'Under Verification' | 'Rejected';
  transactionReference: string;
  sanctionDate: string;
  utilizationCertificateStatus: 'Verified GFR 12-A' | 'Submitted Awaiting Audit' | 'Pending Submission';
}

const SEED_SANCTIONS: PFMSSanctionOrder[] = [
  {
    id: 'SANCT-01',
    sanctionNumber: 'PFMS/JH/2026/RNC-01',
    projectTitle: 'Subernarekha Basin Early Warning Flood Station',
    challengeReportId: 'JH-2026-RNC-001',
    heiName: 'Birla Institute of Technology (BIT) Mesra',
    nodalLead: 'Dr. A. K. Sinha',
    bankName: 'State Bank of India (BIT Mesra Branch)',
    accountNumberMasked: '•••• •••• 4567',
    ifscCode: 'SBIN0001234',
    trancheNumber: 2,
    totalTranches: 3,
    tranchePhase: 'Phase 2: Prototype and Telemetry Node Assembly',
    amountRupees: 1800000,
    status: 'Disbursed',
    transactionReference: 'DBT-JH-2026-8839210-SBI',
    sanctionDate: '02 March 2026',
    utilizationCertificateStatus: 'Verified GFR 12-A',
  },
  {
    id: 'SANCT-02',
    sanctionNumber: 'PFMS/JH/2026/DHN-02',
    projectTitle: 'Jharia Coalfire Gas Venting and Subsidence Mitigation',
    challengeReportId: 'JH-2026-DHN-002',
    heiName: 'Indian Institute of Technology (IIT ISM) Dhanbad',
    nodalLead: 'Prof. R. N. Mukherjee',
    bankName: 'Canara Bank (IIT ISM Campus)',
    accountNumberMasked: '•••• •••• 2419',
    ifscCode: 'CNRB0002819',
    trancheNumber: 2,
    totalTranches: 3,
    tranchePhase: 'Phase 2: Thermal Foam Barrier Formulation',
    amountRupees: 2400000,
    status: 'Approved Pending Release',
    transactionReference: 'Awaiting Officer Electronic Signoff',
    sanctionDate: '08 March 2026',
    utilizationCertificateStatus: 'Submitted Awaiting Audit',
  },
  {
    id: 'SANCT-03',
    sanctionNumber: 'PFMS/JH/2026/GRD-03',
    projectTitle: 'Arsenic Contamination Phytoremediation Filter',
    challengeReportId: 'JH-2026-GRD-003',
    heiName: 'Birsa Agricultural University (BAU)',
    nodalLead: 'Dr. P. K. Singh',
    bankName: 'Punjab National Bank (Kanke Branch)',
    accountNumberMasked: '•••• •••• 4910',
    ifscCode: 'PUNB0192300',
    trancheNumber: 1,
    totalTranches: 3,
    tranchePhase: 'Phase 1: Inception Lab Setup and Biological Assays',
    amountRupees: 1250000,
    status: 'Disbursed',
    transactionReference: 'DBT-JH-2026-4401923-PNB',
    sanctionDate: '18 February 2026',
    utilizationCertificateStatus: 'Verified GFR 12-A',
  },
  {
    id: 'SANCT-04',
    sanctionNumber: 'PFMS/JH/2026/JMS-04',
    projectTitle: 'Damodar River Heavy Metal Sensor Float Array',
    challengeReportId: 'JH-2026-BKO-004',
    heiName: 'National Institute of Technology (NIT) Jamshedpur',
    nodalLead: 'Dr. S. K. Mahato',
    bankName: 'Bank of Baroda (NIT Jamshedpur Branch)',
    accountNumberMasked: '•••• •••• 4321',
    ifscCode: 'BARB0JAMSH',
    trancheNumber: 3,
    totalTranches: 3,
    tranchePhase: 'Phase 3: 60 Day Panchayat Field Trial Deployment',
    amountRupees: 1500000,
    status: 'Under Verification',
    transactionReference: 'Awaiting Third Party Outcome Audit',
    sanctionDate: '11 March 2026',
    utilizationCertificateStatus: 'Pending Submission',
  },
];

import { ChallengeDoc } from '../../services/firebaseService';

export interface PFMSDisbursementLedgerProps {
  userRole?: 'gov' | 'university';
  defaultHEI?: string;
  activeChallenge?: ChallengeDoc | null;
}

export const PFMSDisbursementLedger: React.FC<PFMSDisbursementLedgerProps> = ({
  userRole = 'gov',
  defaultHEI,
  activeChallenge,
}) => {
  const [orders, setOrders] = useState<PFMSSanctionOrder[]>(SEED_SANCTIONS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderForDisbursal, setSelectedOrderForDisbursal] = useState<PFMSSanctionOrder | null>(null);
  const [disbursalPin, setDisbursalPin] = useState<string>('9942');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewingSanctionDoc, setViewingSanctionDoc] = useState<PFMSSanctionOrder | null>(null);

  const effectiveOrders = React.useMemo(() => {
    if (!activeChallenge) return orders;
    const hasMatch = orders.some(o => o.challengeReportId === activeChallenge.reportId || o.projectTitle === activeChallenge.title);
    if (hasMatch) return orders;

    const dynamicOrder: PFMSSanctionOrder = {
      id: `SANCT-${activeChallenge.reportId}`,
      sanctionNumber: `PFMS/JH/2026/${defaultHEI ? defaultHEI.split(' ')[0].toUpperCase() : 'HEI'}-09`,
      projectTitle: activeChallenge.title,
      challengeReportId: activeChallenge.reportId,
      heiName: defaultHEI || 'Birsa Agricultural University',
      nodalLead: 'Faculty Research Lead',
      bankName: 'State Bank of India (University Campus Branch)',
      accountNumberMasked: 'XXXX XXXX 8812',
      ifscCode: 'SBIN0004918',
      trancheNumber: 2,
      totalTranches: 3,
      tranchePhase: 'Phase 2: IoT Prototype Assembly and Panchayat Field Pilot',
      amountRupees: 1500000,
      status: 'Disbursed',
      transactionReference: `DBT-JH-2026-${activeChallenge.reportId.replace(/[^A-Z0-9]/gi, '')}-SBI`,
      sanctionDate: '08 March 2026',
      utilizationCertificateStatus: 'Verified GFR 12-A',
    };

    return [dynamicOrder, ...orders];
  }, [orders, activeChallenge, defaultHEI]);

  const filteredOrders = effectiveOrders.filter(ord => {
    if (defaultHEI && !ord.heiName.toLowerCase().includes(defaultHEI.toLowerCase()) && !defaultHEI.toLowerCase().includes(ord.heiName.toLowerCase())) {
      return true;
    }
    if (filterStatus !== 'all' && ord.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.sanctionNumber.toLowerCase().includes(q) ||
        ord.projectTitle.toLowerCase().includes(q) ||
        ord.heiName.toLowerCase().includes(q) ||
        ord.challengeReportId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAllocated = 125000000;
  const totalDisbursed = effectiveOrders
    .filter(o => o.status === 'Disbursed')
    .reduce((sum, o) => sum + o.amountRupees, 0);
  const pendingRelease = effectiveOrders
    .filter(o => o.status === 'Approved Pending Release')
    .reduce((sum, o) => sum + o.amountRupees, 0);
  const treasuryBalance = totalAllocated - totalDisbursed;

  const handleExecuteDisbursement = () => {
    if (!selectedOrderForDisbursal) return;
    setIsProcessing(true);

    setTimeout(() => {
      const txRef = `DBT-JH-2026-${Math.floor(1000000 + Math.random() * 9000000)}-RBI`;
      const updated = orders.map(o => {
        if (o.id === selectedOrderForDisbursal.id) {
          return {
            ...o,
            status: 'Disbursed' as const,
            transactionReference: txRef,
            sanctionDate: '13 March 2026',
          };
        }
        return o;
      });
      setOrders(updated);
      setIsProcessing(false);
      setSelectedOrderForDisbursal(null);

      notificationService.addNotification({
        title: `PFMS DBT Fund Disbursed: Rs ${(selectedOrderForDisbursal.amountRupees / 100000).toFixed(2)} Lakh`,
        message: `Direct Benefit Transfer of tranche ${selectedOrderForDisbursal.trancheNumber} released to ${selectedOrderForDisbursal.heiName} under order ${selectedOrderForDisbursal.sanctionNumber}. Ref: ${txRef}.`,
        type: 'deployment',
        reportId: selectedOrderForDisbursal.challengeReportId,
        channel: 'sms',
      });

      notificationService.sendSimulatedSMS(
        '+91 94311 00000',
        `PFMS GOVT OF JHARKHAND: Rs ${(selectedOrderForDisbursal.amountRupees / 100000).toFixed(2)}L disbursed to ${selectedOrderForDisbursal.heiName} Account ${selectedOrderForDisbursal.accountNumberMasked}. Txn: ${txRef}`,
        selectedOrderForDisbursal.challengeReportId
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#2C6E49] text-white rounded-lg">
                <IndianRupee className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#2C6E49]/20">
                Treasury Direct Benefit Transfer (DBT)
              </span>
              <span className="text-[11px] font-bold text-[#8A7F72]">·</span>
              <span className="text-[11px] font-bold text-[#5A5247]">PFMS State Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-[#201C18] mt-1.5">
              Public Financial Management System (PFMS) Milestone Disbursement Ledger
            </h2>
            <p className="text-xs text-[#6A6155] max-w-3xl mt-0.5 leading-relaxed">
              Electronic treasury ledger tracking multi-tranche government grants, institutional bank allocations, GFR 12-A utilization certificates, and automated DBT releases for higher education societal challenges.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-[10px] font-extrabold bg-[#2C6E49]/10 text-[#2C6E49] px-3 py-1.5 rounded-xl border border-[#2C6E49]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBI e-Kuber Protocol Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Problem PFMS Grant Docket Banner */}
      {activeChallenge && (
        <div className="bg-gradient-to-r from-[#FDFBF7] via-[#F7F2E8] to-[#EFE7D8] border-2 border-[#D8C7B0] p-5 rounded-2xl shadow-xs space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#2C6E49] text-white px-2.5 py-0.5 rounded-full">
                {activeChallenge.reportId}
              </span>
              <span className="text-xs font-black text-[#201C18] uppercase tracking-wider">
                Active Problem PFMS Treasury Grant Sanction
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#2C6E49] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {defaultHEI || 'HEI'} · Tranche 2 Disbursed
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#201C18]">{activeChallenge.title}</h3>
            <p className="text-xs text-[#5C5549] mt-1 line-clamp-2">{activeChallenge.summary}</p>
          </div>
          <div className="flex items-center gap-4 pt-2 border-t border-[#D8C7B0] text-[11px] text-[#5C5549] flex-wrap">
            <span>Disbursed Amount: <strong className="text-[#2C6E49] font-black">₹15,00,000 (Tranche 2 of 3)</strong></span>
            <span>·</span>
            <span>Utilization Certificate: <strong className="text-[#2C6E49]">Verified GFR 12-A</strong></span>
            <span>·</span>
            <span>DBT Settlement: <strong className="text-[#201C18]">Direct Bank Transfer to University R&D Account</strong></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Total State R&D Allocation</p>
          <p className="text-2xl font-black text-[#201C18] font-heading">Rs {(totalAllocated / 10000000).toFixed(2)} Cr</p>
          <p className="text-[10px] text-[#6A6155]">FY 2026 Higher Ed Innovation Budget</p>
        </div>

        <div className="bg-[#F0FAF4] border border-[#C3E6D0] rounded-xl p-4 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-[#2C6E49] uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49]" /> Total DBT Disbursed
          </p>
          <p className="text-2xl font-black text-[#2C6E49] font-heading">Rs {(totalDisbursed / 10000000).toFixed(2)} Cr</p>
          <p className="text-[10px] text-[#2C6E49] font-semibold">Electronically settled to HEI accounts</p>
        </div>

        <div className="bg-[#FFF8EC] border border-[#F0D99A] rounded-xl p-4 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-[#C98A2C] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#C98A2C]" /> Approved Pending Release
          </p>
          <p className="text-2xl font-black text-[#C98A2C] font-heading">Rs {(pendingRelease / 10000000).toFixed(2)} Cr</p>
          <p className="text-[10px] text-[#8A7F72]">Awaiting officer electronic signoff</p>
        </div>

        <div className="bg-white border border-[#E4DDD1] rounded-xl p-4 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Remaining Treasury Balance</p>
          <p className="text-2xl font-black text-[#B5502D] font-heading">Rs {(treasuryBalance / 10000000).toFixed(2)} Cr</p>
          <p className="text-[10px] text-[#6A6155]">Available for upcoming tranches</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4DDD1] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#2C6E49]" />
            <h3 className="text-base font-extrabold text-[#201C18]">Electronic Sanction Orders and Tranche Registry</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A7F72]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sanction, project, or HEI..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl focus:outline-none focus:border-[#2C6E49] w-48 sm:w-60 text-[#201C18]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
            >
              <option value="all">All Statuses</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Approved Pending Release">Approved Pending</option>
              <option value="Under Verification">Under Verification</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4DDD1] bg-[#FAF8F4] text-[#8A7F72] text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Sanction Order and ID</th>
                <th className="py-3 px-3">Challenge and Originating HEI</th>
                <th className="py-3 px-3">Bank Details (DBT)</th>
                <th className="py-3 px-3">Milestone Tranche</th>
                <th className="py-3 px-3 text-right">Amount (INR)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0] text-[#201C18]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8A7F72] text-xs">
                    No sanction orders matched the search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F4] transition-colors">
                    <td className="py-3 px-3 align-top">
                      <span className="font-mono font-extrabold text-[11px] text-[#2C6E49] block">
                        {ord.sanctionNumber}
                      </span>
                      <span className="text-[10px] text-[#8A7F72] block mt-0.5">
                        Dated: {ord.sanctionDate}
                      </span>
                      <span className="text-[9px] font-mono text-[#5A5247] block truncate max-w-[130px] mt-0.5">
                        Ref: {ord.transactionReference}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs">
                      <p className="font-extrabold text-xs text-[#201C18] leading-snug">
                        {ord.projectTitle}
                      </p>
                      <p className="text-[10px] font-semibold text-[#2C6E49] mt-0.5">
                        {ord.heiName}
                      </p>
                      <p className="text-[10px] text-[#8A7F72]">
                        Lead: {ord.nodalLead} · {ord.challengeReportId}
                      </p>
                    </td>

                    <td className="py-3 px-3 align-top">
                      <p className="font-bold text-[11px] text-[#201C18]">{ord.bankName}</p>
                      <p className="text-[10px] font-mono text-[#5A5247]">A/C: {ord.accountNumberMasked}</p>
                      <p className="text-[10px] font-mono text-[#8A7F72]">IFSC: {ord.ifscCode}</p>
                    </td>

                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-black bg-[#EAE4D8] text-[#201C18] px-1.5 py-0.5 rounded">
                          Tranche {ord.trancheNumber} of {ord.totalTranches}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6A6155] mt-1 max-w-[160px] leading-tight">
                        {ord.tranchePhase}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold text-[#2C6E49] bg-[#F0FAF4] border border-[#C3E6D0] px-1.5 py-0.5 rounded">
                        {ord.utilizationCertificateStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top text-right font-mono">
                      <span className="text-sm font-black text-[#201C18] block">
                        Rs {(ord.amountRupees).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#8A7F72] block">
                        Rs {(ord.amountRupees / 100000).toFixed(2)} Lakh
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        ord.status === 'Disbursed'
                          ? 'bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0]'
                          : ord.status === 'Approved Pending Release'
                          ? 'bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]'
                          : 'bg-[#FAF8F4] text-[#8A7F72] border border-[#E4DDD1]'
                      }`}>
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {userRole === 'gov' && ord.status === 'Approved Pending Release' && (
                          <button
                            onClick={() => setSelectedOrderForDisbursal(ord)}
                            className="bg-[#2C6E49] hover:bg-[#23583a] text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Release DBT</span>
                          </button>
                        )}

                        <button
                          onClick={() => setViewingSanctionDoc(ord)}
                          className="text-[#2C6E49] hover:underline text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Sanction Order</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderForDisbursal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[200] p-4">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#F0EBE0] pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded border border-[#2C6E49]/20 uppercase">
                  Treasury DBT Authorisation
                </span>
                <h3 className="text-base font-black text-[#201C18] mt-1">Authorise Electronic Fund Release</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderForDisbursal(null)}
                className="text-[#8A7F72] hover:text-[#201C18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4">
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Sanction Order:</span>
                <span className="font-mono font-bold text-[#201C18]">{selectedOrderForDisbursal.sanctionNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Beneficiary Institution:</span>
                <span className="font-bold text-[#201C18]">{selectedOrderForDisbursal.heiName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Bank Account and IFSC:</span>
                <span className="font-mono text-[#5A5247]">{selectedOrderForDisbursal.bankName} (A/C: {selectedOrderForDisbursal.accountNumberMasked}, IFSC: {selectedOrderForDisbursal.ifscCode})</span>
              </div>
              <div className="pt-2 border-t border-[#E4DDD1] flex items-center justify-between">
                <span className="font-bold text-[#201C18]">Disbursement Tranche:</span>
                <span className="text-base font-black text-[#2C6E49] font-mono">
                  Rs {(selectedOrderForDisbursal.amountRupees).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#5A5247] block">
                Treasury Officer Authorization PIN (Default: 9942)
              </label>
              <input
                type="password"
                maxLength={4}
                value={disbursalPin}
                onChange={(e) => setDisbursalPin(e.target.value)}
                className="w-full px-3 py-2 text-center font-mono font-bold tracking-widest text-lg bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl focus:outline-none focus:border-[#2C6E49]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForDisbursal(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-[#5A5247] bg-[#EAE4D8] hover:bg-[#DFD8CA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDisbursement}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl text-xs font-black text-white bg-[#2C6E49] hover:bg-[#23583a] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <span>Transmitting to RBI...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Electronic Disbursal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingSanctionDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[200] p-4">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-[#2C6E49]/20 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded border border-[#2C6E49]/20 uppercase">
                  Official Government Sanction Order
                </span>
                <h3 className="text-base font-black text-[#201C18] mt-1">Government of Jharkhand : Treasury Sanction Order</h3>
                <p className="text-[11px] text-[#6A6155]">Department of Higher and Technical Education, Project Nivaaran</p>
              </div>
              <button 
                onClick={() => setViewingSanctionDoc(null)}
                className="text-[#8A7F72] hover:text-[#201C18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl space-y-3 text-xs leading-relaxed">
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Sanction Number:</span>
                <span className="font-mono font-bold text-[#2C6E49]">{viewingSanctionDoc.sanctionNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Date of Sanction:</span>
                <span className="font-semibold text-[#201C18]">{viewingSanctionDoc.sanctionDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Allocated Challenge:</span>
                <span className="font-semibold text-[#201C18]">{viewingSanctionDoc.projectTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Beneficiary HEI:</span>
                <span className="font-semibold text-[#201C18]">{viewingSanctionDoc.heiName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Bank Account Details:</span>
                <span className="font-mono text-[#201C18]">{viewingSanctionDoc.bankName} (A/C: {viewingSanctionDoc.accountNumberMasked})</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
                <span className="font-bold text-[#8A7F72]">Tranche Milestone:</span>
                <span className="font-semibold text-[#201C18]">Tranche {viewingSanctionDoc.trancheNumber} ({viewingSanctionDoc.tranchePhase})</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm font-bold">
                <span className="text-[#201C18]">Sanctioned Grant Value:</span>
                <span className="text-[#2C6E49] font-black font-mono">Rs {(viewingSanctionDoc.amountRupees).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#8A7F72]">Electronic Transaction Hash:</span>
                <span className="text-[#5A5247] font-mono">{viewingSanctionDoc.transactionReference}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#8A7F72] pt-1 border-t border-[#E4DDD1]">
              <span>Digitally Signed by Finance Controller, Govt of Jharkhand</span>
              <span>Audit Stamp: GFR 2017 Compliant</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Official Sanction Order PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
