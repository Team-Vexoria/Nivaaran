import React, { useRef, useState } from 'react';
import { 
  Printer, FileText, X, CheckCircle2, 
  AlertTriangle, Building2, MapPin, 
  FileSpreadsheet, Check
} from 'lucide-react';

export interface StateSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  criticalCount: number;
  pendingCount: number;
  validatedCount: number;
  resolvedCount: number;
  districtStats: { district: string; total: number; maxRisk: string; hei: string }[];
  hazardBreakdown: { domain: string; count: string; value: number }[];
  challenges: any[];
  officerName?: string;
}

export const StateSummaryReportModal: React.FC<StateSummaryReportModalProps> = ({
  isOpen,
  onClose,
  totalCount,
  criticalCount,
  pendingCount,
  validatedCount,
  resolvedCount,
  districtStats,
  hazardBreakdown,
  challenges,
  officerName = 'Jharkhand State Nodal Officer',
}) => {
  const [downloadedCsv, setDownloadedCsv] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const reportDocketId = 'JH/HED/SDMA/2026/SSR-8821';
  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Docket ID',
      'Title',
      'Category',
      'District',
      'Block',
      'Village',
      'Risk Level',
      'Workflow Status',
      'Priority Score',
      'Assigned HEI',
      'Citizen Reports Consolidated',
      'Logged Date',
    ];

    const rows = challenges.map(c => [
      `"${c.reportId || c.id || ''}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      `"${c.district || ''}"`,
      `"${c.block || 'Sadar'}"`,
      `"${c.village || 'Ward'}"`,
      `"${c.riskLevel || 'STANDARD'}"`,
      `"${c.status || ''}"`,
      `"${c.priorityScore !== undefined ? c.priorityScore : 7.5}"`,
      `"${c.assignedHEI || 'Pending Allocation'}"`,
      `"${c.citizenReportCount || 1}"`,
      `"${c.createdAt || new Date().toISOString().slice(0, 10)}"`,
    ]);

    const csvData = [
      `"GOVERNMENT OF JHARKHAND : STATE DISASTER AND INNOVATION COMMAND"`,
      `"COMPREHENSIVE MULTI-DISTRICT OPERATIONAL SUMMARY REPORT"`,
      `"Report Docket: ${reportDocketId} | Generated on: ${currentDateStr} ${currentTimeStr}"`,
      `"Authorized Officer: ${officerName}"`,
      ``,
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Jharkhand_State_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedCsv(true);
    setTimeout(() => setDownloadedCsv(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#D5CDBF] overflow-hidden flex flex-col my-4 max-h-[92vh] print:max-h-none print:my-0 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Action Header Bar : Hidden in Print */}
        <div className="bg-[#FAF8F4] text-[#201C18] px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-[#E4DDD1] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49] shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded border border-[#2C6E49]/20">
                  Official Gazette
                </span>
                <span className="text-[10px] text-[#8A7F72] font-mono">
                  {reportDocketId}
                </span>
              </div>
              <h3 className="font-black text-sm text-[#201C18]">
                Jharkhand State Summary Report Document
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-white hover:bg-[#FAF8F4] text-[#201C18] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-[#E4DDD1] cursor-pointer shadow-2xs"
              title="Download raw dataset in Excel compatible CSV format"
            >
              {downloadedCsv ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-[#C98A2C]" />}
              <span>{downloadedCsv ? 'CSV Downloaded!' : 'Download CSV Dataset'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Print directly or save as PDF via system print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8A7F72] hover:text-[#201C18] hover:bg-[#EAE4D8] transition-colors cursor-pointer"
              title="Close report viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div ref={reportRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#201C18] print:p-6 print:overflow-visible">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#201C18] pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <img
                src="/jharkhand_govt_seal.png"
                alt="Government of Jharkhand"
                className="w-16 h-16 object-contain shrink-0"
              />
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-[#5A5247]">
                  GOVERNMENT OF JHARKHAND
                </p>
                <h1 className="text-lg sm:text-xl font-black font-heading text-[#201C18]">
                  DEPARTMENT OF HIGHER & TECHNICAL EDUCATION
                </h1>
                <p className="text-xs font-bold text-[#2C6E49]">
                  State Disaster & Societal Innovation Command • Integrated Monitoring Division
                </p>
                <p className="text-[10px] text-[#8A7F72]">
                  Civil Secretariat, Project Building, Dhurwa, Ranchi 834004
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#E4DDD1] sm:pl-4 space-y-1">
              <div className="text-[10px] font-bold text-[#8A7F72]">DOCUMENT IDENTIFIER</div>
              <div className="text-xs font-mono font-black text-[#201C18]">{reportDocketId}</div>
              <div className="text-[10px] text-[#5A5247]">Date: <strong className="text-[#201C18]">{currentDateStr}</strong></div>
              <div className="text-[10px] text-[#5A5247]">Generated: <strong className="text-[#201C18]">{currentTimeStr} IST</strong></div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#2C6E49] bg-[#2C6E49]/10 px-2 py-0.5 rounded border border-[#2C6E49]/20">
                Quarterly Operational Review (GFR 2017 Norms)
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#201C18] mt-1">
                Statewide Multi-District Operational Telemetry & Challenge Impact Ledger
              </h2>
              <p className="text-xs text-[#6A6155] mt-0.5">
                Consolidated on-ground status across 24 Jharkhand districts, university R&D clusters, and public treasury allocations.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-[#8A7F72] block">Reporting Authority:</span>
              <span className="text-xs font-black text-[#201C18]">{officerName}</span>
              <span className="text-[10px] text-[#2C6E49] font-bold block">Jharkhand State Nodal Officer</span>
            </div>
          </div>

          {/* Key Executive Macro Metrics */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>1. Executive Summary & Macro Performance Indicators</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Total Challenges</span>
                <span className="text-xl font-black text-[#201C18] font-heading">{totalCount}</span>
                <span className="text-[10px] text-[#6A6155] block">Across 24 districts</span>
              </div>
              <div className="bg-[#FFF0EE] border border-[#F5C6C0] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-[#B3261E] uppercase block">Critical Alerts</span>
                <span className="text-xl font-black text-[#B3261E] font-heading">{criticalCount}</span>
                <span className="text-[10px] text-[#B3261E] block">Immediate triage</span>
              </div>
              <div className="bg-[#FFF8EC] border border-[#F0D99A] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-[#C98A2C] uppercase block">Pending Triage</span>
                <span className="text-xl font-black text-[#C98A2C] font-heading">{pendingCount}</span>
                <span className="text-[10px] text-[#C98A2C] block">Awaiting officer</span>
              </div>
              <div className="bg-[#F0FAF4] border border-[#C3E6D0] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-[#2C6E49] uppercase block">HEI Matched</span>
                <span className="text-xl font-black text-[#2C6E49] font-heading">{validatedCount}</span>
                <span className="text-[10px] text-[#2C6E49] block">R&D assigned</span>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E4DDD1] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-[#8A7F72] uppercase block">Resolved & Deployed</span>
                <span className="text-xl font-black text-[#201C18] font-heading">{resolvedCount}</span>
                <span className="text-[10px] text-[#6A6155] block">Full statewide closure</span>
              </div>
            </div>
          </div>

          {/* Social Impact and Treasury Indicators */}
          <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-4">
            <h4 className="text-xs font-black uppercase text-[#201C18] mb-2">Societal Reach & Financial Efficiency</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] block">Verified Benefited Citizens</span>
                <span className="text-base font-black text-[#2C6E49]">142,500+</span>
                <span className="text-[10px] text-[#5A5247] block">Direct rural population</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] block">Treasury Funds Saved</span>
                <span className="text-base font-black text-[#201C18]">₹4.85 Crore</span>
                <span className="text-[10px] text-[#5A5247] block">Cost avoidance via HEIs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] block">Active IoT Sensors</span>
                <span className="text-base font-black text-[#C98A2C]">82 Live Nodes</span>
                <span className="text-[10px] text-[#5A5247] block">River & air telemetry</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A7F72] block">Committed CSR Funds</span>
                <span className="text-base font-black text-[#2C6E49]">₹1.85 Crore</span>
                <span className="text-[10px] text-[#5A5247] block">12 Corporate partners</span>
              </div>
            </div>
          </div>

          {/* District Breakdown Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2C6E49]" />
                <span>2. Multi-District Operational Distribution (Top Active Districts)</span>
              </span>
              <span className="text-[10px] text-[#8A7F72] font-semibold">Total Districts Tracked: 24</span>
            </h3>
            <div className="border border-[#E4DDD1] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1] text-[10px] font-black uppercase text-[#5A5247]">
                    <th className="p-2.5">District Name</th>
                    <th className="p-2.5">Total Incidents</th>
                    <th className="p-2.5">Highest Severity</th>
                    <th className="p-2.5">Assigned University (HEI)</th>
                    <th className="p-2.5 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDD1]">
                  {districtStats.map((d, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F4]">
                      <td className="p-2.5 font-bold text-[#201C18]">{d.district}</td>
                      <td className="p-2.5 font-mono font-bold text-[#5A5247]">{d.total}</td>
                      <td className="p-2.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          d.maxRisk === 'CRITICAL' ? 'bg-[#FFF0EE] text-[#B3261E] border border-[#F5C6C0]' :
                          d.maxRisk === 'HIGH' ? 'bg-[#FFF8EC] text-[#C98A2C] border border-[#F0D99A]' :
                          'bg-[#F0FAF4] text-[#2C6E49] border border-[#C3E6D0]'
                        }`}>
                          {d.maxRisk}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-[#201C18]">{d.hei || 'Birsa Institute of Technology (BIT Mesra)'}</td>
                      <td className="p-2.5 text-right">
                        <span className="text-[10px] font-bold text-[#2C6E49] bg-[#F0FAF4] px-2 py-0.5 rounded border border-[#C3E6D0]">
                          Active R&D
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hazard Category Breakdown */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>3. Dominant Hazard Classification Distribution</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {hazardBreakdown.map((h, idx) => (
                <div key={idx} className="p-3 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl flex items-center justify-between">
                  <span className="font-bold text-[#201C18] truncate mr-2">{h.domain}</span>
                  <span className="font-mono font-black text-[#2C6E49] bg-white px-2 py-0.5 rounded border border-[#E4DDD1]">
                    {h.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Critical Challenges Sample Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#201C18] mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>4. High Urgency Challenge Telemetry Registry</span>
            </h3>
            <div className="border border-[#E4DDD1] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E4DDD1] text-[10px] font-black uppercase text-[#5A5247]">
                    <th className="p-2.5">Docket ID</th>
                    <th className="p-2.5">Incident Title</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5 text-right">Workflow Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDD1]">
                  {challenges.slice(0, 6).map((c, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F4]">
                      <td className="p-2.5 font-mono text-[11px] font-bold text-[#2C6E49]">{c.reportId || c.id}</td>
                      <td className="p-2.5 font-bold text-[#201C18] max-w-[200px] truncate">{c.title}</td>
                      <td className="p-2.5 text-[#5A5247]">{c.district}</td>
                      <td className="p-2.5 font-bold font-mono text-[#C98A2C]">
                        {c.priorityScore !== undefined ? c.priorityScore.toFixed(1) : '8.2'} / 10
                      </td>
                      <td className="p-2.5 text-right font-semibold text-[#201C18]">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F4] border border-[#E4DDD1]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Verification & Digital Signature Block */}
          <div className="border-t-2 border-[#201C18] pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-[#2C6E49]">
                <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                <span>Digitally Authenticated and GFR 2017 Compliant</span>
              </div>
              <p className="text-[10px] text-[#8A7F72]">
                Certified by State Disaster & Innovation Command Telemetry Gateway.
              </p>
              <p className="text-[10px] font-mono text-[#5A5247]">
                SHA-256 Checksum: 0x9B4E38A12CC7901FF80249D65E12B7
              </p>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 border-[#E4DDD1] pt-3 sm:pt-0">
              <div className="font-mono text-[10px] text-[#8A7F72] uppercase">Authorized Digital Sign-off:</div>
              <div className="font-black text-sm text-[#201C18]">{officerName}</div>
              <div className="text-[10px] font-bold text-[#2C6E49]">State Nodal Officer (Higher Education)</div>
              <div className="text-[10px] text-[#5A5247]">Government of Jharkhand</div>
            </div>
          </div>

        </div>

        {/* Footer Bar : Hidden in Print */}
        <div className="bg-[#FAF8F4] border-t border-[#E4DDD1] px-6 py-3.5 flex items-center justify-between print:hidden shrink-0">
          <span className="text-[11px] text-[#8A7F72]">
            Use system print dialog to select "Save as PDF" for official file archiving.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2C6E49] hover:bg-[#23583a] rounded-xl transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>

    </div>
  );
};
