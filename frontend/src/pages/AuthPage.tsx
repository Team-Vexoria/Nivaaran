import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
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
    placeholder: 'admin@bitmesra.in',
    hint: 'Official Academic Account: admin@bitmesra.in (Pass: admin@123)',
  },
  'Faculty / Mentor': {
    placeholder: 'admin@bitmesra.in',
    hint: 'Faculty / Mentor Account: admin@bitmesra.in (Pass: admin@123)',
  },
  'Student': {
    placeholder: 'student.nivaaran@gmail.com or admin@bitmesra.in',
    hint: 'Students can register with personal email or institutional account.',
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
};

export const AuthPage: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  
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
    <div className="min-h-screen bg-nivaaran-bg flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white border border-nivaaran-border rounded-xl shadow-xl p-8 space-y-6 relative">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-6 left-6 text-xs text-nivaaran-text-secondary hover:text-nivaaran-primary flex items-center space-x-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <div className="text-center space-y-2 pt-2">
          <img src="/logo.png" alt="NIVAARAN Logo" className="h-12 w-auto object-contain mx-auto" />
          <h2 className="text-2xl font-bold text-nivaaran-primary">
            {isSignUp ? 'Create NIVAARAN Account' : 'Sign In to NIVAARAN'}
          </h2>
          <p className="text-xs text-nivaaran-text-secondary">
            Jharkhand Societal Challenge & Innovation Network
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
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Select Portal Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg bg-nivaaran-surface focus:outline-none focus:ring-2 focus:ring-nivaaran-primary font-medium"
            >
              <option value="Citizen">1. Citizen & Community Org (NGO/PRI/ULB)</option>
              <option value="Government Department">2. Government Department Officer</option>
              <option value="University Admin">3. University Admin</option>
              <option value="Faculty / Mentor">4. Faculty / Mentor</option>
              <option value="Student">5. Student</option>
              <option value="Industry / MSME">6. Industry / MSME / Startup</option>
              <option value="CSR Organization">7. CSR Organization</option>
              <option value="Platform Super Admin">8. Platform Super Admin</option>
            </select>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Full Name</label>
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
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Email Address</label>
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
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Password</label>
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
            className="w-full py-3 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white text-sm font-semibold rounded-lg shadow transition-colors"
          >
            {isSignUp ? 'Sign Up & Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-nivaaran-border"></div>
          <span className="flex-shrink mx-3 text-xs text-nivaaran-text-secondary uppercase font-semibold">Or</span>
          <div className="flex-grow border-t border-nivaaran-border"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 bg-white border border-nivaaran-border text-nivaaran-text-primary hover:bg-nivaaran-surface text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Sign In with Google</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-nivaaran-secondary hover:underline font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        {/* Pre-configured Official Accounts Quick Fill Panel */}
        <div className="border-t border-nivaaran-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              Testing Credentials Quick-Fill & Demo Login:
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

            {/* 2. University Admin */}
            <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors">
              <div>
                <span className="font-bold text-slate-900 block">🎓 University Admin</span>
                <code className="text-[11px] text-emerald-700 font-mono font-bold">admin@bitmesra.in</code> · <span className="text-[10px] text-slate-500">admin@123</span>
              </div>
              <button
                type="button"
                onClick={() => fillOfficialCredentials('admin@bitmesra.in', 'admin@123', 'University Admin')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {/* 3. Faculty Mentor */}
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

            {/* 4. Student Researcher */}
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
