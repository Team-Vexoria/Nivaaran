import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, ArrowLeft, Info, ShieldCheck } from 'lucide-react';

interface RoleEmailConfig {
  placeholder: string;
  hint: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleEmailConfig> = {
  'Citizen': {
    placeholder: 'any.email@gmail.com, yahoo.com, personal, etc.',
    hint: 'Every email address is allowed for Citizen & Community Org access.',
  },
  'Government Department': {
    placeholder: 'nivaaran@gov.in',
    hint: 'Official Gov Account: nivaaran@gov.in (Pass: nivaaran@123)',
  },
  'University Admin': {
    placeholder: 'faculty@bitmesra.in',
    hint: 'Official Faculty / Mentor Account: faculty@bitmesra.in (Pass: admin@123)',
  },
  'Faculty / Mentor': {
    placeholder: 'faculty@bitmesra.in',
    hint: 'Official Faculty / Mentor Account: faculty@bitmesra.in (Pass: admin@123)',
  },
  'Student': {
    placeholder: 'student@bitmesra.in',
    hint: 'Official Student Account: student@bitmesra.in (Pass: admin@123)',
  },
  'Industry / MSME': {
    placeholder: 'partner@tatasteel.com',
    hint: 'Industry partners can register with company or personal email.',
  },
  'CSR Organization': {
    placeholder: 'foundation@csr.org',
    hint: 'CSR foundations can register with organisation email.',
  },
  'Platform Super Admin': {
    placeholder: 'admin@nivaaran.in',
    hint: 'Official Super Admin Account: admin@nivaaran.in (Pass: admin@123)',
  },
  'Community / NGO': {
    placeholder: 'ngo@nivaaran.in',
    hint: 'Official NGO Account: ngo@nivaaran.in (Pass: ngo@123)',
  },
  'PRI (Panchayat)': {
    placeholder: 'pri@nivaaran.in',
    hint: 'Official PRI Account: pri@nivaaran.in (Pass: pri@123)',
  },
  'ULB (Urban Local Body)': {
    placeholder: 'ulb@nivaaran.in',
    hint: 'Official ULB Account: ulb@nivaaran.in (Pass: ulb@123)',
  },
  'Research Lab / Industry Lab': {
    placeholder: 'lab@nivaaran.in',
    hint: 'Official Lab Account: lab@nivaaran.in (Pass: lab@123)',
  },
};

export const AuthPage: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Citizen');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentRoleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS['Citizen'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, displayName, role);
      } else {
        await loginWithEmail(email, password, role);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      await loginWithGoogle(role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Authentication failed.');
    }
  };

  const fillOfficialCredentials = (officialEmail: string, officialPass: string, officialRole: UserRole) => {
    setEmail(officialEmail);
    setPassword(officialPass);
    setRole(officialRole);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col justify-center items-center p-3 sm:p-6 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white border border-nivaaran-border rounded-xl shadow-xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs text-nivaaran-text-secondary hover:text-nivaaran-primary flex items-center space-x-1 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.auth.backBtn}</span>
          </button>
        )}

        <div className="text-center space-y-2 pt-2">
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-12 w-auto object-contain mx-auto" />
          <h2 className="text-2xl font-bold text-nivaaran-primary">
            {isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}
          </h2>
          <p className="text-xs text-nivaaran-text-secondary">
            {t.auth.tagline}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-nivaaran-danger/10 border border-nivaaran-danger/30 rounded-lg text-nivaaran-danger text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">{t.auth.selectRole}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg bg-nivaaran-surface focus:outline-none focus:ring-2 focus:ring-nivaaran-primary font-medium"
            >
              <option value="Citizen">1. Citizen & Community Org (NGO/PRI/ULB)</option>
              <option value="Government Department">2. Government Department Officer</option>
              <option value="Faculty / Mentor">3. University Faculty / Mentor</option>
              <option value="Student">4. Student Researcher</option>
              <option value="Industry / MSME">5. Industry / MSME / Startup</option>
              <option value="CSR Organization">6. CSR Organization</option>
              <option value="Platform Super Admin">7. Platform Super Admin</option>
              <option value="Community / NGO">8. Community / NGO</option>
              <option value="PRI (Panchayat)">9. PRI (Panchayat)</option>
              <option value="ULB (Urban Local Body)">10. ULB (Urban Local Body)</option>
              <option value="Research Lab / Industry Lab">11. Research Lab / Industry Lab</option>
            </select>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-nivaaran-primary mb-1">{t.auth.fullName}</label>
              <input
                type="text"
                placeholder="Ramesh Kumar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">{t.auth.emailAddress}</label>
            <input
              type="email"
              placeholder={currentRoleConfig.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
              required
            />
            <div className="flex items-start space-x-1 mt-1 text-[11px] text-nivaaran-text-secondary">
              <Info className="w-3.5 h-3.5 text-nivaaran-accent flex-shrink-0 mt-0.5" />
              <span>{currentRoleConfig.hint}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">{t.auth.password}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white text-sm font-semibold rounded-lg shadow transition-colors cursor-pointer"
          >
            {isSignUp ? t.auth.signUpBtn : t.auth.signInBtn}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-nivaaran-border"></div>
          <span className="flex-shrink mx-3 text-xs text-nivaaran-text-secondary uppercase font-semibold">{t.auth.orDivider}</span>
          <div className="flex-grow border-t border-nivaaran-border"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 bg-white border border-nivaaran-border text-nivaaran-text-primary hover:bg-nivaaran-surface text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>{t.auth.googleSignIn}</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-nivaaran-secondary hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? t.auth.haveAccount : t.auth.needAccount}
          </button>
        </div>

        {/* Pre-configured Official Accounts Quick Fill Panel */}
        <div className="border-t border-nivaaran-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              {t.auth.officialAccounts}
            </span>
          </div>

          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
            
            {/* 1. Gov Dept */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">🏛️ Government Officer</span>
                <code className="text-[11px] text-blue-700 font-mono font-bold">nivaaran@gov.in</code> · <span className="text-[10px] text-slate-500">nivaaran@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('nivaaran@gov.in', 'nivaaran@123', 'Government Department')}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 2. Faculty Mentor */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">👨‍🏫 Faculty Mentor</span>
                <code className="text-[11px] text-emerald-700 font-mono font-bold">faculty@bitmesra.in</code> · <span className="text-[10px] text-slate-500">admin@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('faculty@bitmesra.in', 'admin@123', 'Faculty / Mentor')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 3. Student Researcher */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">🧑‍🎓 Student Researcher</span>
                <code className="text-[11px] text-emerald-700 font-mono font-bold">student@bitmesra.in</code> · <span className="text-[10px] text-slate-500">admin@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('student@bitmesra.in', 'admin@123', 'Student')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 5. Industry Partner */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">🏢 Industry / MSME</span>
                <code className="text-[11px] text-purple-700 font-mono font-bold">partner@tatasteel.com</code> · <span className="text-[10px] text-slate-500">industry@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('partner@tatasteel.com', 'industry@123', 'Industry / MSME')}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 5b. CSR Foundation */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">🌱 CSR Foundation / Donor</span>
                <code className="text-[11px] text-emerald-700 font-mono font-bold">foundation@csr.org</code> · <span className="text-[10px] text-slate-500">csr@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('foundation@csr.org', 'csr@123', 'CSR Organization')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 6. Citizen */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">👤 Citizen & Community</span>
                <code className="text-[11px] text-amber-700 font-mono font-bold">citizen@nivaaran.in</code> · <span className="text-[10px] text-slate-500">citizen@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('citizen@nivaaran.in', 'citizen@123', 'Citizen')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 7. Super Admin */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">⚡ Platform Super Admin</span>
                <code className="text-[11px] text-red-700 font-mono font-bold">admin@nivaaran.in</code> · <span className="text-[10px] text-slate-500">admin@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('admin@nivaaran.in', 'admin@123', 'Platform Super Admin')}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
