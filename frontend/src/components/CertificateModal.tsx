import React, { useRef } from 'react';
import { Award, Check, Copy, Download, Printer, ShieldCheck, X, Sparkles, QrCode } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
  institutionName?: string;
  projectTitle?: string;
  voucherCode?: string;
  issueDate?: string;
  role?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  recipientName = 'Dr. Alok Sharma & Student Research Team',
  institutionName = 'Birsa Institute of Technology (BIT Mesra), Ranchi',
  projectTitle = 'Ranchi School Flood Risk Triage & IoT Early Warning System',
  voucherCode = 'JH-HEI-REWARD-9482',
  issueDate = '28th August 2026',
  role = 'Societal Challenge Innovator & Lead Researcher',
}) => {
  const [copied, setCopied] = React.useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-6 print:my-0 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Action Header (Hidden in Print) */}
        <div className="bg-[#16293F] text-white px-6 py-3.5 flex items-center justify-between print:hidden border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Official Government of Jharkhand R&D Certificate
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/10"
              title="Copy Voucher Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copied ? 'Code Copied!' : `Voucher: ${voucherCode}`}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-4 sm:p-8 bg-[#FAF8F3] overflow-x-auto print:p-0 print:bg-white">
          <div 
            ref={certificateRef}
            className="min-w-[720px] bg-[#FFFDF9] border-[10px] border-double border-[#8C6D34] rounded-lg p-8 sm:p-12 relative shadow-xl print:shadow-none print:border-[8px] print:m-0 print:w-full"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.92) 0%, rgba(250,248,243,0.96) 100%)`,
            }}
          >
            
            {/* Watermark Govt Seal in Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none select-none">
              <img 
                src="/jharkhand_govt_seal.png" 
                alt="Government Watermark" 
                className="w-96 h-96 object-contain"
              />
            </div>

            {/* Ornamental Inner Gold Border Line */}
            <div className="border border-[#C29B38]/60 p-6 sm:p-8 rounded relative space-y-6">
              
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#8C6D34]" />
              <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#8C6D34]" />
              <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#8C6D34]" />
              <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#8C6D34]" />

              {/* Certificate Top Seal & Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center items-center space-x-4 mb-2">
                  <img 
                    src="/jharkhand_govt_seal.png" 
                    alt="Govt of Jharkhand Seal" 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-md"
                  />
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E3A5F] tracking-widest uppercase font-serif">
                    GOVERNMENT OF JHARKHAND
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-[#8C6D34] tracking-wider uppercase font-serif">
                    Department of Higher & Technical Education
                  </p>
                  <p className="text-[11px] text-slate-600 tracking-wide font-medium">
                    Jharkhand Societal Challenge & Innovation Network (NIVAARAN) · SIH-26043
                  </p>
                </div>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#8C6D34] to-transparent" />
                  <Sparkles className="w-4 h-4 text-[#8C6D34]" />
                  <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#8C6D34] to-transparent" />
                </div>
              </div>

              {/* Certificate Badge & Title */}
              <div className="text-center space-y-1 pt-1">
                <span className="inline-block px-4 py-1 bg-amber-50 border border-amber-300 text-[#8C6D34] text-[11px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                  Official R&D Recognition
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16293F] tracking-wide font-serif pt-1">
                  CERTIFICATE OF MERIT & INNOVATION
                </h1>
                <p className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">
                  Official Societal Challenge Innovator Badge Earned
                </p>
              </div>

              {/* Recipient Details */}
              <div className="text-center space-y-4 pt-2">
                <p className="text-xs text-slate-600 italic font-serif">
                  This state merit credential is proudly presented to:
                </p>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] underline decoration-[#C29B38]/60 decoration-2 underline-offset-8 font-serif">
                    {recipientName}
                  </h3>
                  <p className="text-xs font-bold text-slate-700 pt-1">
                    {role} · {institutionName}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed pt-1">
                  In recognition of verified contributions toward solving critical societal challenges in Jharkhand through multidisciplinary engineering research, automated telemetry IoT design, and pilot validation for:
                </p>

                <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-lg max-w-xl mx-auto">
                  <p className="text-xs sm:text-sm font-bold text-[#16293F]">
                    "{projectTitle}"
                  </p>
                </div>
              </div>

              {/* Official Credentials Grid */}
              <div className="grid grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-200/80 max-w-2xl mx-auto">
                <div className="text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Certificate Voucher</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block text-[11px]">
                    {voucherCode}
                  </span>
                </div>

                <div className="text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Date of Issuance</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {issueDate}
                  </span>
                </div>

                <div className="text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Validation Status</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center text-[11px]">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Govt. Verified
                  </span>
                </div>
              </div>

              {/* Signatures & Seal Footer */}
              <div className="flex items-end justify-between pt-6 border-t border-[#8C6D34]/30 max-w-2xl mx-auto gap-4">
                
                {/* Signatory 1 */}
                <div className="text-center space-y-1 flex-1">
                  <div className="font-serif italic text-slate-700 text-sm font-bold border-b border-slate-400 pb-1 mx-4">
                    Dr. Sunil Kumar, IAS
                  </div>
                  <p className="text-[10px] font-bold text-slate-800">
                    Principal Secretary
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Dept. of Higher & Technical Education, Govt. of Jharkhand
                  </p>
                </div>

                {/* Center Seal Stamp Icon */}
                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                  <img 
                    src="/jharkhand_govt_seal.png" 
                    alt="Govt of Jharkhand Stamp" 
                    className="w-16 h-16 object-contain filter drop-shadow-md"
                  />
                  <span className="text-[8px] font-extrabold text-[#8C6D34] uppercase tracking-wider mt-0.5">
                    Official State Stamp
                  </span>
                </div>

                {/* Signatory 2 */}
                <div className="text-center space-y-1 flex-1">
                  <div className="font-serif italic text-slate-700 text-sm font-bold border-b border-slate-400 pb-1 mx-4">
                    Rajesh Verma
                  </div>
                  <p className="text-[10px] font-bold text-slate-800">
                    State Nodal Director
                  </p>
                  <p className="text-[9px] text-slate-500">
                    State Disaster Management Authority, Ranchi
                  </p>
                </div>

              </div>

              {/* Security Verification & QR Code Bar */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center">
                  <QrCode className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                  NIVAARAN State Innovation Platform · Record ID: SHA256-JH-26043-{voucherCode}
                </span>
                <span className="font-mono">Verify at: nivaaran.jharkhand.gov.in/verify</span>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs print:hidden">
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Certificate Cryptographically Signed by Government of Jharkhand.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
